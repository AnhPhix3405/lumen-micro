import { Module } from "@nestjs/common";
import { AccountsController } from "./accounts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthAccount } from "./accounts.entity";

@Module({
    controllers: [AccountsController],
    imports: [TypeOrmModule.forFeature([AuthAccount])]
})
export class AccountsModule { }