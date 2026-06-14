import { Test, TestingModule } from '@nestjs/testing';
import { FulfillmentController } from './fulfillment.controller';

describe('FulfillmentController', () => {
  let controller: FulfillmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FulfillmentController], providers: [{ provide: require('./fulfillment.service').FulfillmentService, useValue: {} }],
    }).compile();

    controller = module.get<FulfillmentController>(FulfillmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
