import { faker } from "@faker-js/faker"
import { Recommendation } from "@prisma/client"

type FactoryRecommendation = Omit<Recommendation, "id">

export const recommendationFactory = {
  createData: (
    name = "Test Name",
    youtubeLink = "https://www.youtube.com/watch?v=bOhasdCq1OU",
    score = 0
  ): FactoryRecommendation => ({
    name,
    youtubeLink,
    score,
  }),

  createRandomData: (score = 0): FactoryRecommendation => ({
    name: faker.lorem.words(3),
    youtubeLink: "https://www.youtube.com/watch?v=bOhasdCq1OU",
    score
  }),

}