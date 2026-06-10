import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly config: ConfigService) {}

  private get authUrl() {
    return (
      this.config.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001'
    );
  }

  @Post('register')
  async register(@Body() body: any) {
    const result = await axios.post(`${this.authUrl}/register`, body);
    return result.data;
  }

  @Post('send-verify-code')
  async sendVerifyCode(@Body() body: any) {
    const result = await axios.post(`${this.authUrl}/send-verify-code`, body);
    return result.data;
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: any) {
    const result = await axios.post(`${this.authUrl}/verify-email`, body);
    return result.data;
  }

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
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
  async logout(@Res() res: Response) {
    const result = await axios.post(`${this.authUrl}/logout`);

    const setCookie = result.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.status(result.status).json(result.data);
  }

  @Post('change-password')
  async changePassword(@Body() body: any) {
    const result = await axios.post(`${this.authUrl}/change-password`, body);
    return result.data;
  }

  @Post('send-reset-password-code')
  async sendResetPasswordCode(@Body() body: any) {
    const result = await axios.post(
      `${this.authUrl}/send-reset-password-code`,
      body,
    );
    return result.data;
  }

  @Post('verify-reset-password')
  async verifyResetPassword(@Body() body: any) {
    const result = await axios.post(
      `${this.authUrl}/verify-reset-password`,
      body,
    );
    return result.data;
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    const result = await axios.post(`${this.authUrl}/reset-password`, body);
    return result.data;
  }
}
