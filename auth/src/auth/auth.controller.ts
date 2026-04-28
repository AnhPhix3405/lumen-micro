import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import type { IRegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import type { IVerifyEmailDto } from "./dto/verify_email.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post("register")
    async register(@Body() req: IRegisterDto) {
        const account = await this.authService.createAccount(req.email, req.password);
        return {
            data: account,
            message: "Account created successfully",
            status : HttpStatus.CREATED
        }
    }

    @Post("verify")
    async verify(@Body() req: IVerifyEmailDto) {
        const account = await this.authService.verifyAccount(req.email, req.code);
        return {
            data: account,
            message: "Account verified successfully",
            status : HttpStatus.OK
        }
    }
}