import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { EXCEPTION_MESSAGE } from '../enums/exception-message.enum';
import { AuthResponseDto, UserAuthDto } from './dto/auth-response.dto';
import { getLevelByName } from '../enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(registerPayload: RegisterDto) {
    try {
      const userEmail = await this.findEmail(registerPayload.email);

      if (userEmail) {
        throw new BadRequestException(EXCEPTION_MESSAGE.EMAIL_EXISTS);
      }
      const createUser = this.userRepository.create(registerPayload);

      await this.userRepository.save(createUser);

      return createUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStatus =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.BAD_REQUEST;
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  async findEmail(email: string) {
    try {
      return await this.userRepository.exists({ where: { email } });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStatus =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.BAD_REQUEST;
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: { email },
        select: {
          name: true,
          email: true,
          id: true,
          roleLevel: true,
          passwordDigest: true,
          department: true,
          team: true,
        },
        relations: ['department', 'team'],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStatus =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.BAD_REQUEST;
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.getUserByEmail(loginDto.email);
      if (!user) {
        throw new HttpException(
          EXCEPTION_MESSAGE.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const compare = await bcrypt.compare(
        loginDto.password,
        user.passwordDigest,
      );

      if (!compare) {
        throw new UnauthorizedException(EXCEPTION_MESSAGE.WRONG_CREDENTIALS);
      }

      const roleLevel = getLevelByName(user.roleName);

      const payload = {
        name: user.name,
        email: user.email,
        user: user.id,
        roleName: user.roleName,
        roleLevel,
        departmentId: user.department?.id,
        teamId: user.team?.id,
      };

      const access_token = await this.jwtService.signAsync(payload);

      const userAuthDto: UserAuthDto = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleName: user.roleName,
        roleLevel,
        department: user.department
          ? { id: user.department.id, name: user.department.name }
          : undefined,
        team: user.team
          ? { id: user.team.id, name: user.team.name }
          : undefined,
      };

      return {
        access_token,
        user: userAuthDto,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStatus =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(errorMessage, errorStatus);
    }
  }

  async me(id: number): Promise<UserAuthDto> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id },
        relations: ['department', 'team'],
      });

      const roleLevel = getLevelByName(user.roleName);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        roleName: user.roleName,
        roleLevel,
        department: user.department
          ? { id: user.department.id, name: user.department.name }
          : undefined,
        team: user.team
          ? { id: user.team.id, name: user.team.name }
          : undefined,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStatus =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(errorMessage, errorStatus);
    }
  }
}
