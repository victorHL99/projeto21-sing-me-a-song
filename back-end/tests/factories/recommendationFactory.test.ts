import { faker } from "@faker-js/faker"
import { Recommendation } from "@prisma/client"

type FactoryRecommendation = Omit<Recommendation, "id">



export const recommendationFactory = {
  createRandomData: (
    name = faker.music.songName(),
    youtubeLink = `https://www.youtube.com/watch?${name}`,
    score = 0
  ): FactoryRecommendation => ({
    name,
    youtubeLink,
    score,
  }),
}