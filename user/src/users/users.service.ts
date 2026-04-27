import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import { BadRequestException } from "@nestjs/common";

export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

    async createAccount(email: string, accountId: string): Promise<User> {
        // check 
        const exists = await this.userRepository.findOneBy({ accountId });
        if (exists) {
            throw new BadRequestException('User already exists');
        }
        const userName = email.split('@')[0];
        const user = this.userRepository.create({ userName, accountId });
        return await this.userRepository.save(user);
    }
}