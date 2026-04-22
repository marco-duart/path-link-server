import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../database/entities/asset.entity';
import { UploadedFile, AssetMetadataDto } from './dto/asset-metadata.dto';
import { RoleHierarchy } from '../enums/role.enum';
import * as path from 'path';
import * as fs from 'fs/promises';
import { UsersService } from '../users/users.service';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
    private usersService: UsersService,
  ) {}
  async create(
    file: UploadedFile,
    metadata: AssetMetadataDto,
    uploadedById: number,
  ): Promise<Asset> {
    this.logger.log(
      `[create] Iniciando criação de Asset: filename=${file.originalname}, userId=${uploadedById}, requiredLevel=${metadata?.requiredLevel}`,
    );

    try {
      const uploadedByUser = await this.usersService.findById(uploadedById);
      const userReference = this.usersService.getUserReference(uploadedById);
      this.logger.log(`[create] User reference obtida: ${userReference.id}`);

      const fileUrl = `/uploads/${file.filename}`;
      this.logger.log(`[create] URL do arquivo que será salva: "${fileUrl}"`);

      const requiredLevel = metadata?.requiredLevel || RoleHierarchy.Auxiliar;

      const assetData = this.assetsRepository.create(
        withUserOwnership(
          {
            filename: file.originalname,
            url: fileUrl,
            mimeType: file.mimetype,
            uploadedBy: userReference,
            requiredLevel,
          },
          uploadedByUser.department?.id,
          uploadedByUser.team?.id,
        ),
      );

      this.logger.log(
        `[create] Dados a serem salvos no BD: { id: será gerado, filename: "${assetData.filename}", url: "${assetData.url}", mimeType: "${assetData.mimeType}", requiredLevel: ${assetData.requiredLevel} }`,
      );

      const savedAsset = await this.assetsRepository.save(assetData);
      this.logger.log(
        `[create] ✅ Asset criado com sucesso: { id: "${savedAsset.id}", filename: "${savedAsset.filename}", url: "${savedAsset.url}", requiredLevel: ${savedAsset.requiredLevel} }`,
      );

      return savedAsset;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const stack =
        error instanceof Error ? error.stack : JSON.stringify(error);
      this.logger.error(
        `[create] ❌ Erro ao criar Asset: ${errorMsg}\n${stack}`,
        error,
      );
      throw new InternalServerErrorException(
        `Falha ao registrar o Asset no banco de dados: ${errorMsg}`,
      );
    }
  }


  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.assetsRepository
      .createQueryBuilder('asset')
      .where('asset.required_level <= :userLevel', { userLevel })
      .leftJoinAndSelect('asset.uploadedBy', 'uploadedBy');

    return applyResourceScope(
      query,
      'asset',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Asset[]> {
    return this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    ).getMany();
  }

  async findOne(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Asset> {
    const asset = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('asset.id = :id', { id })
      .getOne();

    if (!asset) {
      throw new NotFoundException(`Asset com ID ${id} não encontrado.`);
    }
    return asset;
  }

  async findOneInternal(id: string): Promise<Asset> {
    const asset = await this.assetsRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

    if (!asset) {
      throw new NotFoundException(`Asset com ID ${id} não encontrado.`);
    }

    return asset;
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    const asset = await this.findOne(
      id,
      userLevel,
      userDepartmentId,
      userTeamId,
    );

    const result = await this.assetsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Asset com ID ${id} não encontrado no DB.`);
    }

    const fileName = path.basename(asset.url);
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(
        `[AssetService] Falha ao deletar arquivo físico ${filePath}:`,
        errorMsg,
      );
    }
  }
}
