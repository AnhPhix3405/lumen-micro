import { Module } from "@nestjs/common";
import { AccountsController } from "./accounts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthAccount } from "./accounts.entity";
import { AccountsService } from "./accounts.service";

@Module({
    controllers: [AccountsController],
    imports: [TypeOrmModule.forFeature([AuthAccount])],
    providers: [AccountsService],
    exports: [AccountsService, TypeOrmModule]
})
export class AccountsModule { }
