import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../pipes/parse-object-id.pipe';
import { Publisher } from './schemas/publisher.schema';
import { PublishersService } from './publishers.service';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';

@ApiTags('Publishers')
@Controller('/api/publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @ApiOperation({ summary: 'Get all publishers' })
  @ApiResponse({ status: HttpStatus.OK, type: [Publisher] })
  @Get()
  getPublishers(): Promise<Publisher[]> {
    return this.publishersService.getAll();
  }

  @ApiOperation({ summary: 'Get the publisher by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: Publisher })
  @Get(':id')
  async getPublisher(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<Publisher> {
    const publisher = await this.publishersService.getById(id);

    if (!publisher) throw new NotFoundException();

    return publisher;
  }

  @ApiOperation({ summary: 'Create a new publisher' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Publisher })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Header('Cache-Control', 'none')
  createPublisher(
    @Body() publisherDto: CreatePublisherDto,
  ): Promise<Publisher> {
    return this.publishersService.create(publisherDto);
  }

  @ApiOperation({ summary: 'Update the publisher by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: Publisher })
  @Put(':id')
  updatePublisher(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() publisherDto: UpdatePublisherDto,
  ): Promise<Publisher> {
    return this.publishersService.update(id, publisherDto);
  }

  @ApiOperation({ summary: 'Delete the publisher by ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePublisher(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    const publisher = await this.publishersService.remove(id);

    if (!publisher) throw new NotFoundException();
  }
}
