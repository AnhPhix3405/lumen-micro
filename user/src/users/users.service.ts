import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { UpdateDto } from "./dto/update.dto";
import bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) { }

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

    async updateProfile(accountId: string, params: UpdateDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { accountId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        params.fullName && (user.fullName = params.fullName);
        params.bio && (user.bio = params.bio);
        params.websiteUrl && (user.websiteUrl = params.websiteUrl);
        params.location && (user.location = params.location);
        params.gender && (user.gender = params.gender);
        params.birthday && (user.birthday = new Date(params.birthday));
        return await this.userRepository.save(user);
    }
}