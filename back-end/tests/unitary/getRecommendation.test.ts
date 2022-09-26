import { jest } from '@jest/globals';
import { prisma } from "../../src/database"

import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from './../../src/repositories/recommendationRepository';
import { recommendationFactory } from '../../src/factories/recommendationFactory.test.js';
import { conflictError } from '../../src/utils/errorUtils.js';


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
  })
})