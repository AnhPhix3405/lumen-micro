import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users.entity";

@Module({
    controllers: [UsersController],
    imports: [TypeOrmModule.forFeature([User])]
})

export class UsersModule {}