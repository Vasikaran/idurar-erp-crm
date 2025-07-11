import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '../../common/dto/response.dto';
import { Public } from '../auth/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  check(): ApiResponse<any> {
    return new ApiResponse(true, 'Service is healthy', {
      status: 'OK',
      timestamp: new Date(),
      service: 'IDURAR Integration API',
    });
  }
}
