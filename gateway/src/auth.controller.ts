import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import {
    RegisterDto,
    SendVerifyCodeDto,
    VerifyEmailDto,
    LoginDto,
    ChangePasswordDto,
    SendResetPasswordCodeDto,
    VerifyResetPasswordDto,
    ResetPasswordDto,
    AccountResponse,
    TokenResponse,
    ApiSuccessResponse,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly config: ConfigService) { }

    private get authUrl() {
        return (
            this.config.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001'
        );
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a new account' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: 201, description: 'Account created successfully', type: ApiSuccessResponse<AccountResponse> })
    @ApiResponse({ status: 400, description: 'Validation error' })
    async register(@Body() body: RegisterDto) {
        const result = await axios.post(`${this.authUrl}/register`, body);
        return result.data;
    }

    @Post('send-verify-code')
    @ApiOperation({ summary: 'Send email verification code' })
    @ApiBody({ type: SendVerifyCodeDto })
    @ApiResponse({ status: 200, description: 'Verification code sent' })
    async sendVerifyCode(@Body() body: SendVerifyCodeDto) {
        const result = await axios.post(`${this.authUrl}/send-verify-code`, body);
        return result.data;
    }

    @Post('verify-email')
    @ApiOperation({ summary: 'Verify email with code' })
    @ApiBody({ type: VerifyEmailDto })
    @ApiResponse({ status: 200, description: 'Email verified successfully', type: ApiSuccessResponse<AccountResponse> })
    async verifyEmail(@Body() body: VerifyEmailDto) {
        const result = await axios.post(`${this.authUrl}/verify-email`, body);
        return result.data;
    }

    @Post('login')
    @ApiOperation({ summary: 'Login and receive access token. A httpOnly refresh token cookie is also set.' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login successful', type: ApiSuccessResponse<TokenResponse> })
    async login(@Body() body: LoginDto, @Res() res: Response) {
        const result = await axios.post(`${this.authUrl}/login`, body, {
            headers: { 'Content-Type': 'application/json' },
        });

        const setCookie = result.headers['set-cookie'];
        if (setCookie) {
            res.setHeader('Set-Cookie', setCookie);
        }

        return res.status(result.status).json(result.data);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token using httpOnly refresh token cookie' })
    @ApiResponse({ status: 200, description: 'Token refreshed', type: ApiSuccessResponse<TokenResponse> })
    async refresh(@Req() req: Request, @Res() res: Response) {
        const result = await axios.post(
            `${this.authUrl}/refresh`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: req.headers.cookie || '',
                },
            },
        );

        const setCookie = result.headers['set-cookie'];
        if (setCookie) {
            res.setHeader('Set-Cookie', setCookie);
        }

        return res.status(result.status).json(result.data);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout and clear refresh token cookie' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout(@Res() res: Response) {
        const result = await axios.post(`${this.authUrl}/logout`);

        const setCookie = result.headers['set-cookie'];
        if (setCookie) {
            res.setHeader('Set-Cookie', setCookie);
        }

        return res.status(result.status).json(result.data);
    }

    @Post('change-password')
    @ApiOperation({ summary: 'Change account password' })
    @ApiBody({ type: ChangePasswordDto })
    @ApiResponse({ status: 200, description: 'Password changed' })
    async changePassword(@Body() body: ChangePasswordDto) {
        const result = await axios.post(`${this.authUrl}/change-password`, body);
        return result.data;
    }

    @Post('send-reset-password-code')
    @ApiOperation({ summary: 'Send reset password code to email' })
    @ApiBody({ type: SendResetPasswordCodeDto })
    @ApiResponse({ status: 200, description: 'Reset code sent' })
    async sendResetPasswordCode(@Body() body: SendResetPasswordCodeDto) {
        const result = await axios.post(
            `${this.authUrl}/send-reset-password-code`,
            body,
        );
        return result.data;
    }

    @Post('verify-reset-password')
    @ApiOperation({ summary: 'Verify reset password code' })
    @ApiBody({ type: VerifyResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Code verified' })
    async verifyResetPassword(@Body() body: VerifyResetPasswordDto) {
        const result = await axios.post(
            `${this.authUrl}/verify-reset-password`,
            body,
        );
        return result.data;
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password after verification' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    async resetPassword(@Body() body: ResetPasswordDto) {
        const result = await axios.post(`${this.authUrl}/reset-password`, body);
        return result.data;
    }
}
