import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publisher, PublisherDocument } from './schemas/publisher.schema';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';

@Injectable()
export class PublishersService {
  constructor(
    @InjectModel(Publisher.name)
    private readonly publisherModel: Model<PublisherDocument>,
  ) {}

  async getAll(): Promise<Publisher[]> {
    return this.publisherModel.find();
  }

  async getById(id: string): Promise<Publisher | null> {
    return this.publisherModel.findById(id);
  }

  async create(publisherDto: CreatePublisherDto): Promise<Publisher> {
    const publisher = new this.publisherModel(publisherDto);

    return publisher.save();
  }

  async update(
    id: string,
    publisherDto: UpdatePublisherDto,
  ): Promise<Publisher> {
    return this.publisherModel.findByIdAndUpdate(id, publisherDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<Publisher | null> {
    return this.publisherModel.findByIdAndRemove(id);
  }
}
