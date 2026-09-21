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

import { Role } from '../../../shared/domain/index.js';
import type { PageQuery } from '../../../shared/presentation/index.js';
import {
  ApiProblemResponses,
  idParamSchema,
  pageQuerySchema,
  Public,
  Roles,
} from '../../../shared/presentation/index.js';
import type { PublisherResponse } from '../../publishers/index.js';
import { publisherResponseSchema } from '../../publishers/index.js';
import { CreateGameUseCase } from '../application/use-cases/create-game.use-case.js';
import { DeleteGameUseCase } from '../application/use-cases/delete-game.use-case.js';
import { GetGameUseCase } from '../application/use-cases/get-game.use-case.js';
import { GetGamePublisherUseCase } from '../application/use-cases/get-game-publisher.use-case.js';
import { ListGamesUseCase } from '../application/use-cases/list-games.use-case.js';
import { RunCatalogMaintenanceUseCase } from '../application/use-cases/run-catalog-maintenance.use-case.js';
import { UpdateGameUseCase } from '../application/use-cases/update-game.use-case.js';
import { toCatalogMaintenanceResponse, toGamePage, toGameResponse } from './game.presenter.js';
import type {
  CatalogMaintenanceResponse,
  GameBody,
  GamePage,
  GameResponse,
} from './game.schemas.js';
import {
  catalogMaintenanceResponseSchema,
  gameBodySchema,
  gamePageSchema,
  gameResponseSchema,
} from './game.schemas.js';

@ApiTags('Games')
@ApiBearerAuth()
@Controller('games')
export class GamesController {
  constructor(
    private readonly listGames: ListGamesUseCase,
    private readonly getGame: GetGameUseCase,
    private readonly createGame: CreateGameUseCase,
    private readonly updateGame: UpdateGameUseCase,
    private readonly deleteGame: DeleteGameUseCase,
    private readonly getGamePublisher: GetGamePublisherUseCase,
    private readonly runCatalogMaintenance: RunCatalogMaintenanceUseCase,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List games', description: 'Newest first, paginated.' })
  @ApiOkResponse({ description: 'A page of games', standardSchema: gamePageSchema })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST)
  async list(@Query({ schema: pageQuerySchema }) query: PageQuery): Promise<GamePage> {
    return toGamePage(await this.listGames.execute(query));
  }

  @Post('maintenance')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run catalog maintenance',
    description:
      'Retires games released more than 18 months ago and applies a one-off 20% discount to games ' +
      'released between 12 and 18 months ago. Admin only.',
  })
  @ApiOkResponse({
    description: 'What the maintenance run changed',
    standardSchema: catalogMaintenanceResponseSchema,
  })
  @ApiProblemResponses(HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN)
  async maintain(): Promise<CatalogMaintenanceResponse> {
    return toCatalogMaintenanceResponse(await this.runCatalogMaintenance.execute());
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a game by id' })
  @ApiOkResponse({ description: 'The game', standardSchema: gameResponseSchema })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND)
  async get(@Param('id', { schema: idParamSchema }) id: string): Promise<GameResponse> {
    return toGameResponse(await this.getGame.execute({ gameId: id }));
  }

  @Get(':id/publisher')
  @Public()
  @ApiOperation({
    summary: "Get a game's publisher",
    description: 'Returns the publisher of the game without exposing the publishers API.',
  })
  @ApiOkResponse({ description: "The game's publisher", standardSchema: publisherResponseSchema })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND)
  async publisher(
    @Param('id', { schema: idParamSchema }) id: string,
  ): Promise<Omit<PublisherResponse, 'createdAt' | 'updatedAt'>> {
    return this.getGamePublisher.execute({ gameId: id });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a game' })
  @ApiCreatedResponse({ description: 'The created game', standardSchema: gameResponseSchema })
  @ApiProblemResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.NOT_FOUND,
    HttpStatus.UNPROCESSABLE_ENTITY,
  )
  async create(@Body({ schema: gameBodySchema }) body: GameBody): Promise<GameResponse> {
    return toGameResponse(await this.createGame.execute(body));
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Replace a game',
    description:
      'Full replacement (PUT semantics). Changing the price clears any automatic discount.',
  })
  @ApiOkResponse({ description: 'The updated game', standardSchema: gameResponseSchema })
  @ApiProblemResponses(
    HttpStatus.BAD_REQUEST,
    HttpStatus.UNAUTHORIZED,
    HttpStatus.NOT_FOUND,
    HttpStatus.UNPROCESSABLE_ENTITY,
  )
  async update(
    @Param('id', { schema: idParamSchema }) id: string,
    @Body({ schema: gameBodySchema }) body: GameBody,
  ): Promise<GameResponse> {
    return toGameResponse(await this.updateGame.execute({ gameId: id, ...body }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a game' })
  @ApiNoContentResponse({ description: 'Game deleted' })
  @ApiProblemResponses(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND)
  async remove(@Param('id', { schema: idParamSchema }) id: string): Promise<void> {
    await this.deleteGame.execute({ gameId: id });
  }
}
