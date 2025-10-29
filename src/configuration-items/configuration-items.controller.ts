import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigurationItemsService } from './configuration-items.service';
import { CreateConfigurationItemDto } from './dto/create-configuration-item.dto';
import { UpdateConfigurationItemDto } from './dto/update-configuration-item.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@UseGuards(AuthGuard)
@Controller('configuration-items')
export class ConfigurationItemsController {
  constructor(private readonly configItemsService: ConfigurationItemsService) {}

  @UseGuards(RoleGuard)
  @Roles("Analista") 
  @Post()
  create(@Body() createConfigItemDto: CreateConfigurationItemDto) {
    return this.configItemsService.create(createConfigItemDto);
  }

  @Get()
  findAll(@CurrentUser('roleName') roleName: string) {
    const userLevel = getLevelByName(roleName);
    return this.configItemsService.findAll(userLevel);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('roleName') roleName: string) {
    const configItem = await this.configItemsService.findOne(id);
    const userLevel = getLevelByName(roleName);
    
    if (userLevel < configItem.requiredLevel) {
        throw new HttpException(
            'Acesso negado. Nível de Role insuficiente para visualizar este Configuration Item.', 
            HttpStatus.FORBIDDEN
        );
    }
    return configItem;
  }
  
  @UseGuards(RoleGuard)
  @Roles("Coordenador") 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConfigItemDto: UpdateConfigurationItemDto) {
    return this.configItemsService.update(id, updateConfigItemDto);
  }

  @UseGuards(RoleGuard)
  @Roles("Gerente")
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configItemsService.remove(id);
  }
}