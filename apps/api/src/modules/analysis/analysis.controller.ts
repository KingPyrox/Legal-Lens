import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('analysis')
@ApiBearerAuth()
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  create(@Body() createAnalysisDto: any) {
    return this.analysisService.create(createAnalysisDto);
  }

  @Get('org/:orgId')
  findAll(@Param('orgId') orgId: string) {
    return this.analysisService.findAll(orgId);
  }

  @Get('document/:documentId')
  findByDocument(@Param('documentId') documentId: string) {
    return this.analysisService.findByDocument(documentId);
  }

  @Get('summary/:orgId')
  getAnalyticsSummary(@Param('orgId') orgId: string) {
    return this.analysisService.getAnalyticsSummary(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.analysisService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnalysisDto: any) {
    return this.analysisService.update(id, updateAnalysisDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() statusDto: { status: string }) {
    return this.analysisService.updateStatus(id, statusDto.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.analysisService.remove(id);
  }
}