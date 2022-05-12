import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from './schemas/game.schema';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PublishersService } from '../publishers/publishers.service';
import { Publisher } from '../publishers/schemas/publisher.schema';
import { DateUtil } from '../../utils/date.util';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name)
    private readonly gameModel: Model<GameDocument>,
    private readonly publisherService: PublishersService,
  ) {}

  async getAll(): Promise<Game[]> {
    return this.gameModel.find();
  }

  async getById(id: string): Promise<Game | null> {
    return this.gameModel.findById(id).populate('publisher');
  }

  async create(gameDto: CreateGameDto): Promise<Game> {
    const data = await this.processGameDto(gameDto);
    const game = new this.gameModel(data);

    return game.save();
  }

  async update(id: string, gameDto: UpdateGameDto): Promise<Game> {
    const data = await this.processGameDto(gameDto);
    return this.gameModel.findByIdAndUpdate(id, data, { new: true });
  }

  async remove(id: string): Promise<Game | null> {
    return this.gameModel.findByIdAndDelete(id);
  }

  async getPublisherForGivenGame(gameId: string): Promise<Publisher | null> {
    const game = await this.getById(gameId);

    return game?.publisher;
  }

  async apocalypse(): Promise<{
    removed: number;
    discountApplied: Game[];
  }> {
    const dateUtil = new DateUtil();

    // remove the games having a release date older than 18 months
    const removedGames = await this.removeMany({
      dateTill: dateUtil.subtractMonths(18),
    });

    // apply a discount of 20% to all games having a release date between 12 and 18 months
    const discountApplied = await this.applyDiscount(20, {
      dateFrom: dateUtil.subtractMonths(18),
      dateTill: dateUtil.subtractMonths(12),
    });

    return { removed: removedGames.deletedCount, discountApplied };
  }

  private async removeMany({
    dateTill,
  }: {
    dateTill: Date;
  }): Promise<{ acknowledged: boolean; deletedCount: number }> {
    return this.gameModel
      .deleteMany({
        releaseDate: {
          $lte: dateTill,
        },
      })
      .exec();
  }

  private async applyDiscount(
    discount: number,
    { dateFrom, dateTill }: { dateFrom?: Date; dateTill?: Date },
  ): Promise<Game[]> {
    const games = this.gameModel.find({
      releaseDate: {
        $gte: dateFrom,
        $lte: dateTill,
      },
    });

    for await (const game of games) {
      game.price = game.price - (game.price / 100) * discount;

      await game.save();
    }

    return games;
  }

  private async processGameDto(
    gameDto: CreateGameDto | UpdateGameDto,
  ): Promise<(CreateGameDto | UpdateGameDto) & { publisher?: Publisher }> {
    if (gameDto.publisherId) {
      const publisher = await this.publisherService.getById(
        gameDto.publisherId,
      );

      if (publisher) return { ...gameDto, publisher };
    }

    return gameDto;
  }
}
