import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
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

interface ErrorWithMessage {
  message?: string;
  stack?: string;
}

@Injectable()
export class StepRelationshipsService {
  private readonly logger = new Logger(StepRelationshipsService.name);
  private readonly relatableServices: { [key: string]: any };

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as ErrorWithMessage;
      return errorObj.message || String(error);
    }
    return String(error);
  }

  private getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack;
    }
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as ErrorWithMessage;
      return errorObj.stack;
    }
    return undefined;
  }
  private async loadRelatedObject(modelName: string, id: string): Promise<any> {
    const service = this.relatableServices[modelName];

    if (!service || typeof service.findOne !== 'function') {
      this.logger.warn(
        `[loadRelatedObject] Serviço para ${modelName} indisponível`,
      );
      return null;
    }

    try {
      const item = await service.findOne(id);
      return item;
    } catch (error) {
      this.logger.warn(
        `[loadRelatedObject] Não foi possível carregar ${modelName}(${id})`,
      );
      return null;
    }
  }
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
    this.logger.log(
      `[validateRelatedItem] Validando ${modelName} com ID: ${id}, userLevel: ${userLevel}`,
    );
    const service = this.relatableServices[modelName];

    if (!service || typeof service.findOne !== 'function') {
      this.logger.error(
        `[validateRelatedItem] Serviço para ${modelName} não encontrado ou não possui findOne`,
      );
      throw new InternalServerErrorException(
        `Serviço ou método findOne para ${modelName} indisponível.`,
      );
    }

    try {
      const item = await service.findOne(id);
      this.logger.log(
        `[validateRelatedItem] ${modelName} validado com sucesso. RequiredLevel: ${item?.requiredLevel}`,
      );

      if (item.requiredLevel !== undefined && userLevel < item.requiredLevel) {
        this.logger.warn(
          `[validateRelatedItem] Permissão insuficiente. UserLevel: ${userLevel}, RequiredLevel: ${item.requiredLevel}`,
        );
        throw new HttpException(
          `Item relacionado (${modelName}) encontrado, mas o usuário não tem permissão mínima para vê-lo.`,
          HttpStatus.FORBIDDEN,
        );
      }

      return item;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      const errorStack = this.getErrorStack(error);
      this.logger.error(
        `[validateRelatedItem] Erro ao validar ${modelName}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async create(
    createDto: CreateStepRelationshipDto,
    userLevel: number,
  ): Promise<StepRelationship> {
    this.logger.log(
      `[create] Iniciando criação de relacionamento: ${JSON.stringify(createDto)}`,
    );

    try {
      const stepReference = await this.stepsService.getStepReference(
        createDto.stepId,
      );
      this.logger.log(`[create] Step encontrado: ${createDto.stepId}`);

      await this.validateRelatedItem(
        createDto.relatedModel,
        createDto.relatedId,
        userLevel,
      );
      this.logger.log(
        `[create] Item relacionado validado: ${createDto.relatedModel} (${createDto.relatedId})`,
      );

      const existingRelationship =
        await this.stepRelationshipsRepository.findOne({
          where: {
            step: { id: createDto.stepId },
            relatedModel: createDto.relatedModel,
            relatedId: createDto.relatedId,
          },
        });

      if (existingRelationship) {
        this.logger.warn(
          `[create] Relacionamento já existe: Step ${createDto.stepId} -> ${createDto.relatedModel}(${createDto.relatedId})`,
        );
        throw new BadRequestException(
          'Este relacionamento já existe para este Step.',
        );
      }

      this.logger.log(
        '[create] Relacionamento não existe, prosseguindo com criação',
      );

      const relationship = this.stepRelationshipsRepository.create({
        ...createDto,
        step: stepReference,
      });
      this.logger.log(
        `[create] Objeto de relacionamento criado: ${JSON.stringify({
          stepId: createDto.stepId,
          relatedModel: createDto.relatedModel,
          relatedId: createDto.relatedId,
        })}`,
      );

      const saved = await this.stepRelationshipsRepository.save(relationship);
      this.logger.log(
        `[create] Relacionamento salvo com sucesso. ID: ${saved.id}`,
      );

      return saved;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      const errorStack = this.getErrorStack(error);
      this.logger.error(
        `[create] Erro ao criar relacionamento: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
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

  async findByStepId(stepId: number): Promise<StepRelationship[]> {
    this.logger.log(
      `[findByStepId] Buscando relacionamentos do Step: ${stepId}`,
    );

    const relationships = await this.stepRelationshipsRepository.find({
      where: { step: { id: stepId } },
      relations: ['step'],
    });

    this.logger.log(
      `[findByStepId] ${relationships.length} relacionamento(s) encontrado(s)`,
    );

    const enrichedRelationships = await Promise.all(
      relationships.map(async (rel) => {
        const relatedObject = await this.loadRelatedObject(
          rel.relatedModel,
          rel.relatedId,
        );
        if (relatedObject) {
          return {
            ...rel,
            relatedObject,
          };
        }
        return rel;
      }),
    );

    return enrichedRelationships;
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
