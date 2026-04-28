import { InjectRepository } from "@nestjs/typeorm";
import { AuthAccount } from "./accounts.entity";
import { Repository } from "typeorm";
import { CreateDto } from "./dto/crud.dto";

export class AccountsService {
    constructor(
        @InjectRepository(AuthAccount)
        private readonly accountsRepository: Repository<AuthAccount>,
    ) {

    }

    async createAccount(newAccount: CreateDto) : Promise<AuthAccount> {
        const accountExist = await this.accountsRepository.findOne({ where: { email: newAccount.email } });
        if (accountExist) {
            throw new Error("Account already exists");
        }
        const account = this.accountsRepository.create(newAccount);
        const savedAccount = await this.accountsRepository.save(account);
        return savedAccount;
    }

    async verifyAccount(email: string) {
        const account = await this.accountsRepository.findOne({ where: { email: email } });
        if (!account) {
            throw new Error("Account not found");
        }
        account.is_verified = true;
        account.status = "active";
        await this.accountsRepository.save(account);
    }

    async getAccountByEmail(email: string) {
        const account = await this.accountsRepository.findOne({ where: { email: email } });
        if (!account) {
            throw new Error("Account not found");
        }
        return account;
    }
}