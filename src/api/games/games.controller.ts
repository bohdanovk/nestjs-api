import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../pipes/parse-object-id.pipe';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './schemas/game.schema';
import { Publisher } from '../publishers/schemas/publisher.schema';

@ApiTags('Games')
@Controller('/api/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @ApiOperation({ summary: 'Get all games' })
  @ApiResponse({ status: HttpStatus.OK, type: [Game] })
  @Get()
  getGames(): Promise<Game[]> {
    return this.gamesService.getAll();
  }

  @ApiOperation({ summary: 'Get the game by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: Game })
  @Get(':id')
  async getGame(@Param('id', ParseObjectIdPipe) id: string): Promise<Game> {
    const game = await this.gamesService.getById(id);

    if (!game) throw new NotFoundException();

    return game;
  }

  @ApiOperation({ summary: 'Create a new game' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Game })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'none')
  createGame(@Body() gameDto: CreateGameDto): Promise<Game> {
    return this.gamesService.create(gameDto);
  }

  @ApiOperation({ summary: 'Update the game by ID' })
  @ApiResponse({ status: 200, type: Game })
  @Put(':id')
  updateGame(
    @Body() gameDto: UpdateGameDto,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Game> {
    return this.gamesService.update(id, gameDto);
  }

  @ApiOperation({ summary: 'Delete the game by ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeGame(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    const game = await this.gamesService.remove(id);

    if (!game) throw new NotFoundException();
  }

  @ApiOperation({ summary: 'Get the publisher for the given game' })
  @ApiResponse({ status: HttpStatus.OK })
  @Get(':gameId/publisher')
  @HttpCode(HttpStatus.OK)
  async getPublisherForGivenGame(
    @Param('gameId', ParseObjectIdPipe) gameId: string,
  ): Promise<Publisher> {
    const publisher = await this.gamesService.getPublisherForGivenGame(gameId);

    if (!publisher) throw new NotFoundException();

    return publisher;
  }

  @ApiOperation({
    summary:
      'The process which will automatically remove the games having ' +
      'a release date older than given date and apply a given discount ' +
      'to all games having a release date between given dates',
  })
  @ApiResponse({ status: HttpStatus.OK })
  @Patch('/apocalypse')
  async apocalypse(): Promise<{
    removed: number;
    discountApplied: Game[];
  }> {
    return this.gamesService.apocalypse();
  }
}
