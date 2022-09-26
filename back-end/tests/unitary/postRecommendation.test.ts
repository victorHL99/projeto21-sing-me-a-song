import { jest } from '@jest/globals';
import { prisma } from "../../src/database"

import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from './../../src/repositories/recommendationRepository';
import { recommendationFactory } from '../../src/factories/recommendationFactory.test.js';
import { conflictError } from '../../src/utils/errorUtils.js';


beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "recommendations" `;
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe("Recommendation test suite", () => {
  jest.clearAllMocks();
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

  it("Should throw error when trying to insert a recommendation with an existing name", async () => {
    // Arrange
    const { name, youtubeLink } = recommendationFactory.createRandomData();
    jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce({
      id: 1,
      name,
      youtubeLink,
      score: 0,
    });
    jest.spyOn(recommendationRepository, "create")

    // Act
    const result = recommendationService.insert({ name, youtubeLink });

    // Assert

    expect(result).rejects.toEqual(conflictError("Recommendations names must be unique"));
    expect(recommendationRepository.create).toHaveBeenCalledTimes(0);
  });

})

describe("Vote test suite", () => {
  jest.clearAllMocks();
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
    jest.clearAllMocks();
    it("Should downvote a exist song recommendation", async () => {
      jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(true as any)
      jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(true as any)
      jest.spyOn(recommendationRepository, "remove")

      await recommendationService.downvote(1)

      expect(recommendationRepository.find).toBeCalledTimes(1)
      expect(recommendationRepository.updateScore).toBeCalledTimes(1)
      expect(recommendationRepository.remove).not.toBeCalled()
    });

    it("Should downvote a not exist song recommendation ", async () => {
      jest.spyOn(recommendationRepository, 'find').mockImplementationOnce((): any => { });
      jest.spyOn(recommendationRepository, 'updateScore').mockImplementationOnce((): any => { });

      const result = recommendationService.downvote(1);
      expect(result).rejects.toEqual({ type: 'not_found', message: '' });
    });

    it("Should remove song recommendation if score is less than -5", async () => {
      const recommendationData = {
        id: 1,
        name: "Test Downvote",
        youtubeLink: "https://www.youtube.com/watch?v=123344",
        score: -6
      }

      jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendationData);
      jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce(recommendationData);
      jest.spyOn(recommendationRepository, 'remove').mockImplementationOnce((): any => { });

      await recommendationService.downvote(1);

      expect(recommendationRepository.find).toBeCalled();
      expect(recommendationRepository.updateScore).toBeCalled();
      expect(recommendationRepository.remove).toBeCalled();
    });

    it("Should not remove song recommendation if score is greater than -5", async () => {
      const recommendationData = {
        id: 1,
        name: "Test Downvote",
        youtubeLink: "https://www.youtube.com/watch?v=123344",
        score: -4
      }

      jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(recommendationData);
      jest.spyOn(recommendationRepository, 'updateScore').mockResolvedValueOnce(recommendationData);
      jest.spyOn(recommendationRepository, 'remove').mockImplementationOnce((): any => { });

      await recommendationService.downvote(1);

      expect(recommendationRepository.find).toBeCalled();
      expect(recommendationRepository.updateScore).toBeCalled();
      expect(recommendationRepository.remove).not.toBeCalled();
    });
  });


});

afterAll(async () => {
  await prisma.$disconnect();
});