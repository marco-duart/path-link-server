import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from '../database/entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
  ) {}

  async create(
    createLinkDto: CreateLinkDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Link> {
    const linkData = withUserOwnership(
      { ...createLinkDto },
      userDepartmentId,
      userTeamId,
    );
    const link = this.linksRepository.create(linkData);
    return this.linksRepository.save(link);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.linksRepository
      .createQueryBuilder('link')
      .where('link.required_level <= :userLevel', { userLevel });

    return applyResourceScope(
      query,
      'link',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Link[]> {
    return this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    ).getMany();
  }

  async findOne(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Link> {
    const link = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('link.id = :id', { id })
      .getOne();

    if (!link) {
      throw new NotFoundException(`Link com ID ${id} não encontrado.`);
    }

    return link;
  }

  async update(
    id: string,
    updateLinkDto: UpdateLinkDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Link> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const updateData = withUserOwnership(
      { ...updateLinkDto },
      userDepartmentId,
      userTeamId,
    );
    await this.linksRepository.update(id, updateData);
    return this.findOne(id, userLevel, userDepartmentId, userTeamId);
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const result = await this.linksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Link com ID ${id} não encontrado.`);
    }
  }
}
