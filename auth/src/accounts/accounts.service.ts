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
}