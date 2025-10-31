import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StepRelationship } from '../database/entities/step-relationship.entity';
import { CreateStepRelationshipDto } from './dto/create-step-relationship.dto';

import { StepsService } from '../steps/steps.service';
import { AccountsService } from '../accounts/accounts.service';
import { AssetsService } from '../assets/assets.service';
import { ConfigurationItemsService } from '../configuration-items/configuration-items.service';
import { DatabasesService } from '../databases/databases.service';
import { EnvironmentVariablesService } from '../environment-variables/environment-variables.service';
import { LinksService } from '../links/links.service';
import { RepositoriesService } from '../repositories/repositories.service';

@Injectable()
export class StepRelationshipsService {
  private readonly relatableServices: { [key: string]: any };

  constructor(
    @InjectRepository(StepRelationship)
    private stepRelationshipsRepository: Repository<StepRelationship>,
    private stepsService: StepsService,
    private accountsService: AccountsService,
    private assetsService: AssetsService,
    private configItemsService: ConfigurationItemsService,
    private databasesService: DatabasesService,
    private envVarService: EnvironmentVariablesService,
    private linksService: LinksService,
    private repositoriesService: RepositoriesService,
  ) {
    this.relatableServices = {
      Account: this.accountsService,
      Asset: this.assetsService,
      ConfigurationItem: this.configItemsService,
      Database: this.databasesService,
      EnvironmentVariable: this.envVarService,
      Link: this.linksService,
      Repository: this.repositoriesService,
    };
  }

  private async validateRelatedItem(
    modelName: string,
    id: string,
    userLevel: number,
  ): Promise<any> {
    const service = this.relatableServices[modelName];

    if (!service || typeof service.findOne !== 'function') {
      throw new InternalServerErrorException(
        `Serviço ou método findOne para ${modelName} indisponível.`,
      );
    }

    const item = await service.findOne(id);

    if (item.requiredLevel !== undefined && userLevel < item.requiredLevel) {
      throw new HttpException(
        `Item relacionado (${modelName}) encontrado, mas o usuário não tem permissão mínima para vê-lo.`,
        HttpStatus.FORBIDDEN,
      );
    }

    return item;
  }

  async create(
    createDto: CreateStepRelationshipDto,
    userLevel: number,
  ): Promise<StepRelationship> {
    const stepReference = await this.stepsService.getStepReference(
      createDto.stepId,
    );

    await this.validateRelatedItem(
      createDto.relatedModel,
      createDto.relatedId,
      userLevel,
    );

    const existingRelationship = await this.stepRelationshipsRepository.findOne(
      {
        where: {
          step: { id: createDto.stepId },
          relatedModel: createDto.relatedModel,
          relatedId: createDto.relatedId,
        },
      },
    );

    if (existingRelationship) {
      throw new BadRequestException(
        'Este relacionamento já existe para este Step.',
      );
    }

    const relationship = this.stepRelationshipsRepository.create({
      ...createDto,
      step: stepReference,
    });

    return this.stepRelationshipsRepository.save(relationship);
  }

  async findOne(id: number): Promise<StepRelationship> {
    const relationship = await this.stepRelationshipsRepository.findOne({
      where: { id },
      relations: ['step'],
    });

    if (!relationship) {
      throw new NotFoundException(
        `Relacionamento StepRelationship com ID ${id} não encontrado.`,
      );
    }

    return relationship;
  }

  async remove(id: number, userLevel: number): Promise<void> {
    const relationship = await this.stepRelationshipsRepository.findOne({
      where: { id },
      relations: ['step', 'step.process'],
    });

    if (!relationship) {
      throw new NotFoundException(
        `Relacionamento StepRelationship com ID ${id} não encontrado.`,
      );
    }

    await this.stepsService.checkProcessEditPermission(
      relationship.step.process.id,
      userLevel,
    );

    const result = await this.stepRelationshipsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Relacionamento StepRelationship com ID ${id} não encontrado no DB.`,
      );
    }
  }
}
