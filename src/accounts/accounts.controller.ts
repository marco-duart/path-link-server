import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
  create(@Body() createAccountDto: CreateAccountDto, @CurrentUser() user: JwtPayload) {
    return this.accountsService.create(
      createAccountDto,
      user.departmentId,
      user.teamId,
    );
  }

  @Get()
  async findAll(@CurrentUser() user: JwtPayload): Promise<Account[]> {
    const userLevel = getLevelByName(user.roleName);
    return this.accountsService.findAll(
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Account> {
    const userLevel = getLevelByName(user.roleName);
    return this.accountsService.findOne(
      id,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userLevel = getLevelByName(user.roleName);
    return this.accountsService.update(
      id,
      updateAccountDto,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.accountsService.remove(
      id,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }
}
