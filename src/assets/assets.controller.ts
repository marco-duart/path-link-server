import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AssetsService } from './assets.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  UploadedFile as MulterFile,
  AssetMetadataDto,
} from './dto/asset-metadata.dto';
import { getLevelByName } from '../enums/role.enum';
import * as path from 'path';
import { Roles } from '../decorators/roles.decorator';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  }),
};

@UseGuards(AuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload')
  @UseGuards(RoleGuard)
  @Roles('Analista')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body() metadata: AssetMetadataDto,
    @CurrentUser('user') uploadedById: number,
  ) {
    if (!file) {
      throw new HttpException(
        'Nenhum arquivo enviado.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.assetsService.create(file, metadata, uploadedById);
  }

  @Get()
  findAll(@CurrentUser('roleName') roleName: string) {
    const userLevel = getLevelByName(roleName);
    return this.assetsService.findAll(userLevel);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('roleName') roleName: string,
  ) {
    const asset = await this.assetsService.findOne(id);
    const userLevel = getLevelByName(roleName);

    if (userLevel < asset.requiredLevel) {
      throw new HttpException(
        'Acesso negado. Nível de Role insuficiente para visualizar este Asset.',
        HttpStatus.FORBIDDEN,
      );
    }
    return asset;
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  async remove(@Param('id') id: string) {
    return this.assetsService.remove(id);
  }
}
