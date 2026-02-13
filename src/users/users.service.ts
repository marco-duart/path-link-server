import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: number, loadRelations: boolean = true): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: loadRelations ? ['department', 'team'] : [],
    });

    if (!user) {
      throw new NotFoundException(`User com ID ${id} não encontrado.`);
    }

    return user;
  }

  getUserReference(id: number): User {
    return this.userRepository.create({ id });
  }

  async createUser(registerPayload: RegisterDto): Promise<User> {
    const createUser = this.userRepository.create(registerPayload);
    return this.userRepository.save(createUser);
  }

  async findEmailExists(email: string): Promise<boolean> {
    return this.userRepository.exists({ where: { email } });
  }

  async getUserByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'roleLevel', 'passwordDigest'],
      relations: ['department', 'team'],
    });

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['department', 'team'] });
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User com ID ${id} não encontrado.`);
    }
  }
}
