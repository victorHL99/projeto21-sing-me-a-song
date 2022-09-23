import supertest from 'supertest';
import app from '../../src/app';
import { prisma } from "../../src/database"

import { recommendationFactory } from '../factories/recommendationFactory.test';

const agent = supertest(app);

// truncate the database before each test
beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "recommendations" `;
});


describe("POST /recommendations", () => {
  it("Send a rigth recommendation and should return 201 ", async () => {
    //Arrange
    const { name, youtubeLink } = recommendationFactory.createRandomData();

    //Act
    const result = await agent.post("/recommendations").send({ name, youtubeLink });

    //Assert
    expect(result.statusCode).toEqual(201);
    expect(result.text).toEqual("Created");
  });

  it("Send a duplicate recommendation and should return 409 ", async () => {
    // AAA
    //Arrange
    const { name, youtubeLink } = recommendationFactory.createRandomData();

    //Act
    await agent.post("/recommendations").send({ name, youtubeLink });
    const result = await agent.post("/recommendations").send({ name, youtubeLink });

    //Assert
    expect(result.statusCode).toEqual(409);
    expect(result.text).toEqual("Recommendations names must be unique");

  });

  it("Send a recommendation with a wrong youtube link and should return 422 ", async () => {
    //Arrange
    const { name } = recommendationFactory.createRandomData();
    const youtubeLink = "123345678";

    //Act
    const result = await agent.post("/recommendations").send({ name, youtubeLink });

    //Assert
    expect(result.statusCode).toEqual(422);
  });
})

afterAll(async () => {
  await prisma.$disconnect()
});