import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('./games.service');

import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { GameDocument } from './schemas/game.schema';
import { UpdateGameDto } from './dto/update-game.dto';
import { CreateGameDto } from './dto/create-game.dto';

describe('GamesController', () => {
  let result: any;
  let controller: GamesController;
  let service: GamesService;

  const gameIdMock = 'game-id-mock';
  const gameMock = { _id: gameIdMock } as GameDocument;
  const notFoundExceptionMock = new NotFoundException();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [GamesService],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGames()', () => {
    const gamesMock = [gameMock];

    beforeEach(async () => {
      jest.spyOn(service, 'getAll').mockResolvedValue(gamesMock);

      result = await controller.getGames();
    });

    it('should return an array of games', () => {
      expect(result).toBe(gamesMock);
    });
  });

  describe('getGame()', () => {
    describe('when there is a game with given ID', () => {
      beforeEach(async () => {
        jest.spyOn(service, 'getById').mockResolvedValue(gameMock);

        result = await controller.getGame(gameIdMock);
      });

      it('should call GamesService.prototype.getById with given ID', () => {
        expect(service.getById).toHaveBeenCalledTimes(1);
        expect(service.getById).toHaveBeenCalledWith(gameIdMock);
      });

      it('should return a game', () => {
        expect(result).toBe(gameMock);
      });
    });

    describe('when there is NO a game with given ID', () => {
      beforeEach(() => {
        jest.spyOn(service, 'getById').mockResolvedValue(null);
      });

      it('should call GamesService.prototype.getById with given ID', async () => {
        try {
          result = await controller.getGame(gameIdMock);
        } catch (e) {}

        expect(service.getById).toHaveBeenCalledTimes(1);
        expect(service.getById).toHaveBeenCalledWith(gameIdMock);
      });

      it('should be rejected with NotFoundException', () => {
        expect(() => controller.getGame(gameIdMock)).rejects.toEqual(
          notFoundExceptionMock,
        );
      });
    });
  });

  describe('createGame()', () => {
    const createGameDto = { title: 'create-game-dto' } as CreateGameDto;

    beforeEach(async () => {
      jest.spyOn(service, 'create').mockResolvedValue(gameMock);

      result = await controller.createGame(createGameDto);
    });

    it('should call GamesService.prototype.create expected arguments', () => {
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(createGameDto);
    });

    it('should return the created game', () => {
      expect(result).toBe(gameMock);
    });
  });

  describe('updateGame()', () => {
    const updateGameDto = { title: 'update-game-dto' } as UpdateGameDto;

    beforeEach(async () => {
      jest.spyOn(service, 'update').mockResolvedValue(gameMock);

      result = await controller.updateGame(gameIdMock, updateGameDto);
    });

    it('should call GamesService.prototype.update expected arguments', () => {
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(gameIdMock, updateGameDto);
    });

    it('should return the updated game', () => {
      expect(result).toBe(gameMock);
    });
  });

  describe('removeGame()', () => {
    describe('when there is a game with given ID', () => {
      beforeEach(async () => {
        jest.spyOn(service, 'remove').mockResolvedValue(gameMock);

        result = await controller.removeGame(gameIdMock);
      });

      it('should call GamesService.prototype.remove with given ID', () => {
        expect(service.remove).toHaveBeenCalledTimes(1);
        expect(service.remove).toHaveBeenCalledWith(gameIdMock);
      });

      it('should return nothing', () => {
        expect(result).toBe(undefined);
      });
    });

    describe('when there is NO a game with given ID', () => {
      beforeEach(() => {
        jest.spyOn(service, 'remove').mockResolvedValue(null);
      });

      it('should call GamesService.prototype.remove with given ID', async () => {
        try {
          result = await controller.removeGame(gameIdMock);
        } catch (e) {}

        expect(service.remove).toHaveBeenCalledTimes(1);
        expect(service.remove).toHaveBeenCalledWith(gameIdMock);
      });

      it('should be rejected with NotFoundException', () => {
        expect(() => controller.removeGame(gameIdMock)).rejects.toEqual(
          notFoundExceptionMock,
        );
      });
    });
  });

  describe('apocalypse()', () => {
    const expectedResultMock = { removed: 1, discountApplied: [gameMock] };

    beforeEach(async () => {
      jest.spyOn(service, 'apocalypse').mockResolvedValue(expectedResultMock);

      result = await controller.apocalypse();
    });

    it('should return expected result', () => {
      expect(result).toBe(expectedResultMock);
    });
  });
});
