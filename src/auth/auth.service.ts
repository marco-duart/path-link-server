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
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findEmail(email: string) {
    try {
      return await this.userRepository.exists({ where: { email } });
    } catch (error) {
      throw new HttpException(error.message, error.status);
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
          password_digest: false,
          accessLevel: true,
          department: true,
          team: true,
        },
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.getUserByEmail(loginDto.email);
      if (!user) {
        throw new HttpException(EXCEPTION_MESSAGE.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      const compare = await bcrypt.compare(loginDto.password, user.password_digest);

      if (!compare) {
        throw new UnauthorizedException(EXCEPTION_MESSAGE.WRONG_CREDENTIALS);
      }

      const payload = {
        name: user.name,
        email: user.email,
        user: user.id,
        accessLevel: user.accessLevel,
        department: user.department,
        team: user.team,
      };

      const token = await this.jwtService.signAsync(payload);

      return {
        token,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async me(id: number) {
    try {
      const user = await this.userRepository.findOneOrFail({ where: { id }, relations: ['accessLevel', 'department', 'team'] });
      return user;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
