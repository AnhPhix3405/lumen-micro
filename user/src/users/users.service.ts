import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { In, Repository } from "typeorm";
import { BadRequestException, Inject } from "@nestjs/common";
import { UpdateDto } from "./dto/update.dto";
import bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { UserFollows } from "src/entites/user_follows.entity";
import { ClientProxy } from "@nestjs/microservices";
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(UserFollows) private readonly userFollowsRepository: Repository<UserFollows>,
        private readonly configService: ConfigService,
        @Inject('EVENT_BUS')
        private client: ClientProxy,
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

    async followUser(userId: string, followingId: string): Promise<UserFollows> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const following = await this.userRepository.findOne({ where: { id: followingId } });
        if (!following) {
            throw new BadRequestException('Following not found');
        }
        const userFollows = this.userFollowsRepository.create({ userId, followingId });
        // await this.userFollowsRepository.save(userFollows);
        this.client.emit('send_notification', {
            userId: followingId,
            actorId: userId,
            type: 'user_followed',
            message: `${user.userName} followed you`,
        });
        return userFollows;
    }

    async unfollowUser(userId: string, followingId: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const following = await this.userRepository.findOne({ where: { id: followingId } });
        if (!following) {
            throw new BadRequestException('Following not found');
        }
        await this.userFollowsRepository.delete({ userId, followingId });
    }

    async getFollowing(userId: string): Promise<User[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const userFollows = await this.userFollowsRepository.find({ where: { userId } });
        const followingIds = userFollows.map(userFollow => userFollow.followingId);
        return await this.userRepository.find({ where: { id: In(followingIds) } });
    }

    async getFollowers(userId: string): Promise<User[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const userFollows = await this.userFollowsRepository.find({ where: { followingId: userId } });
        const followerIds = userFollows.map(userFollow => userFollow.userId);
        return await this.userRepository.find({ where: { id: In(followerIds) } });
    }
}