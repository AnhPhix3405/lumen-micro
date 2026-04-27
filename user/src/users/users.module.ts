import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { UserConsumer } from "./consumers/user.consumer";
import { UsersService } from "./users.service";

@Module({
    controllers: [UsersController, UserConsumer],
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService]
})

export class UsersModule { }