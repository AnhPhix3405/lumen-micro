import { Controller, Get } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";

@Controller('/users')
export class UsersController {
    constructor(
        @InjectRepository(User) 
        private readonly userRepository: Repository<User>,
    ) {}

    @Get()
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }
}