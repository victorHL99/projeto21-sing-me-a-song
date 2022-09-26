import supertest from 'supertest';
import app from '../../src/app';
import { prisma } from "../../src/database"


import { recommendationFactory } from '../../src/factories/recommendationFactory.test.js';

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

describe("POST /recommendations/:id/upvote", () => {
  it("Send a rigth id and should return 200 ", async () => {
    //Arrange
    const { name, youtubeLink } = recommendationFactory.createRandomData();
    const result = await agent.post("/recommendations").send({ name, youtubeLink });
    const { id } = await prisma.recommendation.findFirst({
      where: {
        name
      }
    })

    //Act
    const resultUpvote = await agent.post(`/recommendations/${id}/upvote`);

    //Assert
    expect(resultUpvote.statusCode).toEqual(200);
    expect(resultUpvote.text).toEqual("OK");
  });

  it("Send a wrong id and should return 404 ", async () => {
    //Arrange
    const id = 999999;

    //Act
    const resultUpvote = await agent.post(`/recommendations/${id}/upvote`);

    //Assert
    expect(resultUpvote.statusCode).toEqual(404);
  });
})

describe("POST /recommendations/:id/downvote", () => {
  it("Send a rigth id and should return 200 ", async () => {
    //Arrange
    const { name, youtubeLink } = recommendationFactory.createRandomData();
    const result = await agent.post("/recommendations").send({ name, youtubeLink });
    const { id } = await prisma.recommendation.findFirst({
      where: {
        name
      }
    })

    //Act
    const randonNumber = Math.floor(Math.random() * 5);
    console.log(randonNumber)
    for (let i = 0; i < randonNumber; i++) {
      await agent.post(`/recommendations/${id}/upvote`);
    }

    const resultDownvote = await agent.post(`/recommendations/${id}/downvote`);

    //Assert
    expect(resultDownvote.statusCode).toEqual(200);
  });

  it("Send a wrong id and should return 404 ", async () => {
    //Arrange
    const id = 999999;

    //Act
    const resultDownvote = await agent.post(`/recommendations/${id}/downvote`);

    //Assert
    expect(resultDownvote.statusCode).toEqual(404);
  });

  it("Send a valid id with score -5, remove recommendation and should return 200 ", async () => {
    //Arrange
    const { name, youtubeLink } = recommendationFactory.createRandomData();
    const result = await agent.post("/recommendations").send({ name, youtubeLink });
    const { id } = await prisma.recommendation.findFirst({
      where: {
        name
      }
    })

    //Act
    for (let i = 0; i < 5; i++) {
      await agent.post(`/recommendations/${id}/downvote`);
    }

    const resultDownvote = await agent.post(`/recommendations/${id}/downvote`);

    const removeRecommendation = await prisma.recommendation.findFirst({
      where: {
        id
      }
    })

    //Assert
    expect(resultDownvote.statusCode).toEqual(200);
    expect(removeRecommendation).toBeNull();
  });
});

describe("GET /recommendations", () => {
  it("Should return 200 and a list of with ten recommendations", async () => {
    //Arrange
    for (let i = 0; i < 10; i++) {
      const { name, youtubeLink } = recommendationFactory.createRandomData();
      const result = await agent.post("/recommendations").send({ name, youtubeLink });
    }

    //Act
    const resultGet = await agent.get("/recommendations");

    //Assert
    expect(resultGet.statusCode).toEqual(200);
    expect(resultGet.body).toHaveLength(10);
  })
})

describe("GET /recommendations/:id", () => {
  it("Should return 200 and a recommendation by id", async () => {
    //Arrange
    const { name, youtubeLink } = recommendationFactory.createRandomData();
    const result = await agent.post("/recommendations").send({ name, youtubeLink });
    const { id } = await prisma.recommendation.findFirst({
      where: {
        name
      }
    })

    //Act
    const resultGet = await agent.get(`/recommendations/${id}`);

    //Assert
    expect(resultGet.statusCode).toEqual(200);
    expect(resultGet.body).toHaveProperty("id");
    expect(resultGet.body).toHaveProperty("name");
    expect(resultGet.body).toHaveProperty("youtubeLink");
    expect(resultGet.body).toHaveProperty("score");
  })

  it("Should return 404 and a recommendation by id", async () => {
    //Arrange
    const id = 999999;

    //Act
    const resultGet = await agent.get(`/recommendations/${id}`);

    //Assert
    expect(resultGet.statusCode).toEqual(404);
  })
})



afterAll(async () => {
  await prisma.$disconnect()
});