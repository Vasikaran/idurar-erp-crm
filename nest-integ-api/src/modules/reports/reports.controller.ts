import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  ReportQueryDto,
  SummaryReportDto,
  ClientInsightDto,
  RevenueBreakdownDto,
} from './dto/reports.dto';
import { ApiResponse } from '../../common/dto/response.dto';

@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get comprehensive dashboard summary' })
  @SwaggerResponse({
    status: 200,
    description: 'Dashboard summary data',
    type: SummaryReportDto,
  })
  async getSummary(
    @Query() query: ReportQueryDto,
  ): Promise<ApiResponse<SummaryReportDto>> {
    const data = await this.reportsService.getSummaryReport(query);
    return new ApiResponse(true, 'Summary report generated successfully', data);
  }

  @Get('clients/insights')
  @ApiOperation({ summary: 'Get client insights and analytics' })
  @SwaggerResponse({
    status: 200,
    description: 'Client insights data',
    type: [ClientInsightDto],
  })
  async getClientInsights(
    @Query() query: ReportQueryDto,
  ): Promise<ApiResponse<ClientInsightDto[]>> {
    const data = await this.reportsService.getClientInsights(query);
    return new ApiResponse(
      true,
      'Client insights generated successfully',
      data,
    );
  }

  @Get('revenue/breakdown')
  @ApiOperation({ summary: 'Get detailed revenue breakdown' })
  @SwaggerResponse({
    status: 200,
    description: 'Revenue breakdown data',
    type: RevenueBreakdownDto,
  })
  async getRevenueBreakdown(
    @Query() query: ReportQueryDto,
  ): Promise<ApiResponse<RevenueBreakdownDto>> {
    const data = await this.reportsService.getRevenueBreakdown(query);
    return new ApiResponse(
      true,
      'Revenue breakdown generated successfully',
      data,
    );
  }
}
