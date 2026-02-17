import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import { getNameByLevel } from '../enums/role.enum';

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

  async findAll(): Promise<any[]> {
    const users = await this.userRepository.find({ relations: ['department', 'team'] });
    return users.map(user => ({
      ...user,
      roleName: getNameByLevel(user.roleLevel),
    }));
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User com ID ${id} não encontrado.`);
    }
  }

  async updateUser(id: number, updateData: Partial<RegisterDto>): Promise<User> {
    const user = await this.findById(id, false);
    
    const { departmentId, teamId, ...updateFields } = updateData;
    
    if (departmentId) {
      user.department = { id: departmentId } as any;
    }
    
    if (teamId) {
      user.team = { id: teamId } as any;
    }
    
    Object.assign(user, updateFields);
    
    return this.userRepository.save(user);
  }
}
