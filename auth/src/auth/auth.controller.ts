import { BadRequestException, Body, Controller, HttpStatus, Post, Req, Res } from "@nestjs/common";
import type { IRegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import type { IVerifyEmailDto } from "./dto/verify_email.dto";
import { ILoginDto } from "./dto/login.dto";
import type { Request, Response } from "express";

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

    @Post("verify-email")
    async verify(@Body() req: IVerifyEmailDto) {
        const account = await this.authService.verifyAccount(req.email, req.code);
        return {
            data: account,
            message: "Account verified successfully",
            status : HttpStatus.OK
        }
    }

    @Post("login")
    async login(@Body() req: ILoginDto, @Res() res : Response) {
        const {email, password} = req;
        const {accessToken, refeshToken} = await this.authService.login(email, password);
        res.cookie('refreshtoken', refeshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return res.status(HttpStatus.OK).json({
        data: { accessToken },
        message: "Login successful",
        });
    }

    @Post("refresh")
    async refresh(@Req() req : Request, @Res() res : Response) {
        const refreshToken = req.cookies.refreshtoken;
        console.log(refreshToken);
        if(!refreshToken) {
            throw new BadRequestException("Refresh token not found");
        }
        const newAccessToken = await this.authService.refresh(refreshToken);
        return res.status(HttpStatus.OK).json({
        data: { accessToken: newAccessToken },
        message: "Refresh token successful",
        });
    }

    @Post("logout")
    async logout(@Req() req : Request, @Res() res : Response) {
        res.clearCookie('refreshtoken');
        return res.status(HttpStatus.OK).json({
            message: "Logout successful",
        });
    }
}

