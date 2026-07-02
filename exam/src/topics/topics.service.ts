import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from 'src/entities/topic.entity';
import { CreateTopicDto, UpdateTopicDto } from 'src/dto/topic_module.dto';

@Injectable()
export class TopicsService {
    constructor(
        @InjectRepository(Topic) private readonly topicRepository: Repository<Topic>,
    ) { }

    async create(params: CreateTopicDto) {
        const topic = this.topicRepository.create({
            name: params.name,
            description: params.description,
        });
        return await this.topicRepository.save(topic);
    }

    async findAll(page: number = 1, limit: number = 20) {
        limit = limit > 20 ? 20 : limit;
        const skip = (page - 1) * limit;
        const [data, total] = await this.topicRepository.findAndCount({
            order: { name: 'ASC' },
            skip,
            take: limit,
        });
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string) {
        const topic = await this.topicRepository.findOne({ where: { id } });
        if (!topic) {
            throw new NotFoundException('Topic not found');
        }
        return topic;
    }

    async update(id: string, params: UpdateTopicDto) {
        const topic = await this.findOne(id);
        if (params.name !== undefined) topic.name = params.name;
        if (params.description !== undefined) topic.description = params.description;
        return await this.topicRepository.save(topic);
    }

    async delete(id: string) {
        const topic = await this.findOne(id);
        return await this.topicRepository.delete(topic.id);
    }
}
