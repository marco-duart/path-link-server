import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from '../database/entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
  ) {}

  async create(createLinkDto: CreateLinkDto): Promise<Link> {
    const link = this.linksRepository.create(createLinkDto);
    return this.linksRepository.save(link);
  }

  async findAll(userLevel: number): Promise<Link[]> {
    return this.linksRepository
      .createQueryBuilder('link')
      .where('link.required_level <= :userLevel', { userLevel })
      .getMany();
  }

  async findOne(id: string): Promise<Link> {
    const link = await this.linksRepository.findOne({ where: { id } });

    if (!link) {
      throw new NotFoundException(`Link com ID ${id} não encontrado.`);
    }

    return link;
  }

  async update(id: string, updateLinkDto: UpdateLinkDto): Promise<Link> {
    const link = await this.linksRepository.findOne({ where: { id } });

    if (!link) {
      throw new NotFoundException(`Link com ID ${id} não encontrado.`);
    }

    await this.linksRepository.update(id, updateLinkDto);
    return this.linksRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const result = await this.linksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Link com ID ${id} não encontrado.`);
    }
  }
}
