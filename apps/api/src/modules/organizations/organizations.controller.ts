import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiBearerAuth()
  create(@Body() createOrgDto: any) {
    return this.organizationsService.create(createOrgDto);
  }

  @Get()
  @ApiBearerAuth()
  findAll(@Request() req) {
    return this.organizationsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateOrgDto: any) {
    return this.organizationsService.update(id, updateOrgDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}