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