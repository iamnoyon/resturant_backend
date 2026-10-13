import { Controller, Get, Head } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  // Registered before GET so Express doesn't route HEAD through the GET handler
  @Head()
  @ApiOperation({ summary: 'Root availability check' })
  headWelcome() {
    return { message: 'Welcome to the Restaurant Management API' };
  }

  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  getWelcome() {
    return { message: 'Welcome to the Restaurant Management API' };
  }
}
