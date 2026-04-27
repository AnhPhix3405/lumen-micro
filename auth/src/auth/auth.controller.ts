import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import type { IRegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";

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
}