import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get Hello' })
  getHello(): string {
    return this.appService.getHello();
  }
}
