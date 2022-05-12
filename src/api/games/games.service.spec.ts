import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

jest.mock('../publishers/publishers.service');

import { GamesService } from './games.service';
import { PublishersService } from '../publishers/publishers.service';
import { Game, GameDocument } from './schemas/game.schema';
import { PublisherDocument } from '../publishers/schemas/publisher.schema';
import { CreateGameDto } from './dto/create-game.dto';

describe('GamesService', () => {
  let result: any;
  let gamesService: GamesService;
  let publishersService: PublishersService;
  let model: Model<GameDocument>;

  const gameIdMock = 'game-id-mock';
  const gameMock = { _id: gameIdMock } as GameDocument;
  const gamesMock = [gameMock];
  const publisherIdMock = 'publisher-id-mock';
  const publisherMock = { _id: gameIdMock } as PublisherDocument;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        PublishersService,
        {
          provide: getModelToken(Game.name),
          useValue: Model,
        },
      ],
    }).compile();

    gamesService = module.get<GamesService>(GamesService);
    publishersService = module.get<PublishersService>(PublishersService);
    model = module.get<Model<GameDocument>>(getModelToken(Game.name));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(gamesService).toBeDefined();
  });

  describe('getAll()', () => {
    beforeEach(async () => {
      jest.spyOn(model, 'find').mockResolvedValue(gamesMock);

      result = await gamesService.getAll();
    });

    it('should return an array of games', () => {
      expect(result).toBe(gamesMock);
    });
  });

  describe('processGameDto()', () => {
    describe('when publisher ID is given', () => {
      const gameDtoMock = { publisherId: publisherIdMock } as CreateGameDto;

      describe('when there is a publisher with given ID', () => {
        beforeEach(async () => {
          jest
            .spyOn(publishersService, 'getById')
            .mockResolvedValue(publisherMock);

          result = await (gamesService as any).processGameDto(gameDtoMock);
        });

        it('should call PublishersService.prototype.getById with given publisherId', () => {
          expect(publishersService.getById).toHaveBeenCalledTimes(1);
          expect(publishersService.getById).toHaveBeenCalledWith(
            publisherIdMock,
          );
        });

        it('should return game DTO with publisher', () => {
          expect(result).toStrictEqual({
            ...gameDtoMock,
            publisher: publisherMock,
          });
        });
      });

      describe('when there is NO a publisher with given ID', () => {
        beforeEach(async () => {
          jest.spyOn(publishersService, 'getById').mockResolvedValue(null);

          result = await (gamesService as any).processGameDto(gameDtoMock);
        });

        it('should return game DTO', () => {
          expect(result).toBe(gameDtoMock);
        });
      });
    });

    describe('when publisher ID is NOT given', () => {
      const gameDtoMock = { title: 'game-dto-mock' } as CreateGameDto;

      beforeEach(async () => {
        result = await (gamesService as any).processGameDto(gameDtoMock);
      });

      it('should return game DTO', () => {
        expect(result).toBe(gameDtoMock);
      });
    });
  });
});
