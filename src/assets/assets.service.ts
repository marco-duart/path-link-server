import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../database/entities/asset.entity';
import { UploadedFile, AssetMetadataDto } from './dto/asset-metadata.dto';
import { RoleHierarchy } from '../enums/role.enum';
import * as path from 'path';
import * as fs from 'fs/promises';
import { UsersService } from '../users/users.service';

@Injectable()
export class AssetsService {
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
    const userReference = this.usersService.getUserReference(uploadedById);

    const fileUrl = `/uploads/${file.filename}`;

    const assetData = this.assetsRepository.create({
      filename: file.originalname,
      url: fileUrl,
      mimeType: file.mimetype,

      uploadedBy: userReference,

      requiredLevel: metadata.requiredLevel || RoleHierarchy.Auxiliar,
    });

    try {
      return this.assetsRepository.save(assetData);
    } catch (error) {
      throw new InternalServerErrorException(
        'Falha ao registrar o Asset no banco de dados.',
      );
    }
  }

  async findAll(userLevel: number): Promise<Asset[]> {
    return this.assetsRepository
      .createQueryBuilder('asset')
      .where('asset.required_level <= :userLevel', { userLevel })
      .leftJoinAndSelect('asset.uploadedBy', 'uploadedBy')
      .getMany();
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetsRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

    if (!asset) {
      throw new NotFoundException(`Asset com ID ${id} não encontrado.`);
    }
    return asset;
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id);

    const result = await this.assetsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Asset com ID ${id} não encontrado no DB.`);
    }

    const fileName = path.basename(asset.url);
    const filePath = path.join(process.cwd(), 'uploads', fileName);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(
        `[AssetService] Falha ao deletar arquivo físico ${filePath}:`,
        error.message,
      );
    }
  }
}
