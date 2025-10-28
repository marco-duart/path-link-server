import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt/dto/jwt-payload.dto';
import { Account } from '../database/entities/account.entity';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@UseGuards(AuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload): Promise<Account[]> {
    const userLevel = getLevelByName(user.roleName);
    return this.accountsService.findAll(userLevel);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Account> {
    const account = await this.accountsService.findOne(id);

    const userLevel = getLevelByName(user.roleName);

    if (userLevel < account.requiredLevel) {
      throw new HttpException(
        'Acesso negado. Nível de Role insuficiente para visualizar esta conta.',
        HttpStatus.FORBIDDEN,
      );
    }

    return account;
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const account = await this.accountsService.findOne(id);
    const userLevel = getLevelByName(user.roleName);
    const requiredAdminLevel = getLevelByName('Admin');

    if (userLevel < account.requiredLevel && userLevel < requiredAdminLevel) {
      throw new HttpException(
        'Acesso negado. Você não tem permissão para editar esta conta.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    const requiredLevelForDelete = getLevelByName('Coordenador');

    if (userLevel < requiredLevelForDelete) {
      throw new HttpException(
        'Acesso negado. Apenas Coordenadores ou superiores podem deletar contas.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.accountsService.remove(id);
  }
}
