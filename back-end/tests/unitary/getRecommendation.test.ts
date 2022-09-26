import { jest } from '@jest/globals';
import { prisma } from "../../src/database"

import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from './../../src/repositories/recommendationRepository';
import { recommendationFactory } from '../../src/factories/recommendationFactory.test.js';
import { conflictError, notFoundError } from '../../src/utils/errorUtils.js';


beforeEach(async () => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe("GET recommendationService test suite", () => {
  describe("GET by id", () => {
    it("Should return a recommendation by id", async () => {
      const recommendation = {
        id: 1,
        name: "TesteGet",
        youtubeLink: "https://www.youtube.com/watch?v=1",
        score: 0
      }

      jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation as any)

      const result = await recommendationService.getById(1);

      expect(result).toEqual(recommendation);
      expect(recommendationRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET all ", () => {
    it("Should return all recommendations", async () => {
      jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([] as any)

      const result = await recommendationService.get();

      expect(recommendationRepository.findAll).toHaveBeenCalledTimes(1);
    });
  })

  describe("GET top ", () => {
    it("Should get top recommendations", async () => {
      jest.spyOn(recommendationRepository, "getAmountByScore").mockImplementationOnce((): any => { })

      await recommendationService.getTop(10);

      expect(recommendationRepository.getAmountByScore).toBeCalled();
    });
  });

  describe("GET random ", () => {
    it("when have no recommendation, should return not found error", async () => {
      jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce([]);
      jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce([]);

      const promise = recommendationService.getRandom();
      expect(promise).rejects.toEqual({ type: 'not_found', message: '' });
    });
  });

  it("Should return recommendation object with a score lower than or equal 10", async () => {
    const recommendations = [
      {
        id: 1,
        score: 5,
        name: "Test1",
        youtubeLink: "https://www.youtube.com/watch?v=d123333",
      },
      {
        id: 2,
        score: 11,
        name: "Test2",
        youtubeLink: "https://www.youtube.com/watch?v=FkWfbQbb4Hk",
      },
    ]

    jest.spyOn(Math, "random").mockImplementation(() => {
      return 0.8
    })
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValueOnce([recommendations[0]] as any)

    const result = await recommendationService.getRandom()

    expect(result).toEqual(recommendations[0])
    expect(recommendationRepository.findAll).toBeCalledTimes(1)
    expect(recommendationRepository.findAll).toBeCalledWith({
      score: 10,
      scoreFilter: "lte",
    })
  })
})