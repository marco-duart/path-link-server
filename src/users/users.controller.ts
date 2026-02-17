import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { RegisterDto } from '../auth/dto/register.dto';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(RoleGuard)
  @Roles('Admin')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(RoleGuard)
  @Roles('Admin')
  @Post()
  async create(@Body() registerDto: RegisterDto) {
    return this.userService.createUser(registerDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }

  @UseGuards(RoleGuard)
  @Roles('Admin')
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<RegisterDto>,
  ) {
    return this.userService.updateUser(id, updateDto);
  }

  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
  }
}
