import { jest } from '@jest/globals';
import { prisma } from "../../src/database"

import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from './../../src/repositories/recommendationRepository';
import { recommendationFactory } from '../../src/factories/recommendationFactory.test.js';


beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "recommendations" `;
});

describe("POST recommendation test suite", () => {
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

afterAll(async () => {
  await prisma.$disconnect();
});