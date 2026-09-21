import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import type { PageQuery } from '../../../shared/presentation/index.js';
import {
  ApiProblemResponses,
  idParamSchema,
  pageQuerySchema,
  Public,
} from '../../../shared/presentation/index.js';
import { CreatePublisherUseCase } from '../application/use-cases/create-publisher.use-case.js';
import { DeletePublisherUseCase } from '../application/use-cases/delete-publisher.use-case.js';
import { GetPublisherUseCase } from '../application/use-cases/get-publisher.use-case.js';
import { ListPublishersUseCase } from '../application/use-cases/list-publishers.use-case.js';
import { UpdatePublisherUseCase } from '../application/use-cases/update-publisher.use-case.js';
import { toPublisherPage, toPublisherResponse } from './publisher.presenter.js';
import type { PublisherBody, PublisherPage, PublisherResponse } from './publisher.schemas.js';
import {
  publisherBodySchema,
  publisherPageSchema,
  publisherResponseSchema,
} from './publisher.schemas.js';

@ApiTags('Publishers')
@ApiBearerAuth()
@Controller('publishers')
export class PublishersController {
  constructor(
    private readonly listPublishers: ListPublishersUseCase,
    private readonly getPublisher: GetPublisherUseCase,
    private readonly createPublisher: CreatePublisherUseCase,
    private readonly updatePublisher: UpdatePublisherUseCase,
    private readonly deletePublisher: DeletePublisherUseCase,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List publishers', description: 'Newest first, paginated.' })
  @ApiOkResponse({ description: 'A page of publishers', standardSchema: publisherPageSchema })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST)
  async list(@Query({ schema: pageQuerySchema }) query: PageQuery): Promise<PublisherPage> {
    return toPublisherPage(await this.listPublishers.execute(query));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a publisher by id' })
  @ApiOkResponse({ description: 'The publisher', standardSchema: publisherResponseSchema })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND)
  async get(@Param('id', { schema: idParamSchema }) id: string): Promise<PublisherResponse> {
    return toPublisherResponse(await this.getPublisher.execute({ publisherId: id }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a publisher' })
  @ApiCreatedResponse({
    description: 'The created publisher',
    standardSchema: publisherResponseSchema,
  })
  @ApiProblemResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.CONFLICT,
    HttpStatus.UNPROCESSABLE_ENTITY,
  )
  async create(
    @Body({ schema: publisherBodySchema }) body: PublisherBody,
  ): Promise<PublisherResponse> {
    return toPublisherResponse(await this.createPublisher.execute(body));
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Replace a publisher',
    description: 'Full replacement (PUT semantics).',
  })
  @ApiOkResponse({ description: 'The updated publisher', standardSchema: publisherResponseSchema })
  @ApiProblemResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.NOT_FOUND,
    HttpStatus.CONFLICT,
    HttpStatus.UNPROCESSABLE_ENTITY,
  )
  async update(
    @Param('id', { schema: idParamSchema }) id: string,
    @Body({ schema: publisherBodySchema }) body: PublisherBody,
  ): Promise<PublisherResponse> {
    return toPublisherResponse(await this.updatePublisher.execute({ publisherId: id, ...body }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a publisher',
    description: 'Games referencing the publisher keep existing but lose the reference.',
  })
  @ApiNoContentResponse({ description: 'Publisher deleted' })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND)
  async remove(@Param('id', { schema: idParamSchema }) id: string): Promise<void> {
    await this.deletePublisher.execute({ publisherId: id });
  }
}
