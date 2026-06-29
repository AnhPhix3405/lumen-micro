import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto, UpdateTopicDto } from 'src/dto/topic_module.dto';

@Controller('topics')
export class TopicsController {
    constructor(private readonly topicsService: TopicsService) {}

    @Post()
    async create(@Body() body: CreateTopicDto) {
        const data = await this.topicsService.create(body);
        return { data, message: 'Topic created successfully', status: HttpStatus.CREATED };
    }

    @Get()
    async findAll() {
        const data = await this.topicsService.findAll();
        return { data, message: 'Topics fetched successfully', status: HttpStatus.OK };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.topicsService.findOne(id);
        return { data, message: 'Topic fetched successfully', status: HttpStatus.OK };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateTopicDto) {
        const data = await this.topicsService.update(id, body);
        return { data, message: 'Topic updated successfully', status: HttpStatus.OK };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.topicsService.delete(id);
        return { message: 'Topic deleted successfully', status: HttpStatus.OK };
    }
}
