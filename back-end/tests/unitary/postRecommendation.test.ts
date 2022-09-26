import { jest } from '@jest/globals';
import { prisma } from "../../src/database"

import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from './../../src/repositories/recommendationRepository';
import { recommendationFactory } from '../../src/factories/recommendationFactory.test.js';


beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "recommendations" `;
  jest.clearAllMocks();
});

describe("Recommendation test suite", () => {
  it("Should insert new recommendation and call insert function 1 time", async () => {
    // Arrange
    const { name, youtubeLink } = recommendationFactory.createRandomData();
    jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => { return null });
    jest.spyOn(recommendationRepository, "create").mockImplementationOnce((): any => { return null });

    // Act
    await recommendationService.insert({ name, youtubeLink });

    // Assert
    expect(recommendationRepository.create).toHaveBeenCalledTimes(1);
    expect(recommendationRepository.findByName).toHaveBeenCalledTimes(1);
  });
})

describe("Vote test suite", () => {
  describe("Upvote", () => {
    it("Should upvote a exist song recommendation", async () => {
      jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(true as any)
      jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(null)

      await recommendationService.upvote(1)

      expect(recommendationRepository.find).toBeCalledTimes(1)
      expect(recommendationRepository.updateScore).toBeCalledTimes(1)
    });

    it("Should not upvote a non exist song recommendation", async () => {
      jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null)
      jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue(null)

      const result = recommendationService.upvote(1)

      expect(result).rejects.toHaveProperty("type", "not_found")
      expect(recommendationRepository.find).toBeCalledTimes(1)
      expect(recommendationRepository.updateScore).not.toBeCalled()
    })
  });

  describe("Downvote", () => {
    it("Should downvote a exist song recommendation", async () => {
      jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(true as any)
      jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(true as any)
      jest.spyOn(recommendationRepository, "remove")

      await recommendationService.downvote(1)

      expect(recommendationRepository.find).toBeCalledTimes(1)
      expect(recommendationRepository.updateScore).toBeCalledTimes(1)
      expect(recommendationRepository.remove).not.toBeCalled()
    });

  });
});

afterAll(async () => {
  await prisma.$disconnect();
});