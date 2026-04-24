import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthAccount } from './accounts.entity';

@Controller('auth/accounts')
export class AccountsController {
    constructor(
        @InjectRepository(AuthAccount)
        private readonly accountsRepository: Repository<AuthAccount>,
    ) { }

    @Get()
    async findAll(): Promise<AuthAccount[]> {
        return this.accountsRepository.find();
    }
}
