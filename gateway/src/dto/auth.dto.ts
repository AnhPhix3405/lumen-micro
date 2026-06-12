import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
    @ApiProperty({ example: "user@example.com", description: "Account email" })
    email: string;

    @ApiProperty({ example: "securePassword123", description: "Account password" })
    password: string;
}

export class SendVerifyCodeDto {
    @ApiProperty({ example: "user@example.com" })
    email: string;
}

export class VerifyEmailDto {
    @ApiProperty({ example: "user@example.com" })
    email: string;

    @ApiProperty({ example: "123456", description: "Verification code" })
    code: string;
}

export class LoginDto {
    @ApiProperty({ example: "user@example.com" })
    email: string;

    @ApiProperty({ example: "securePassword123" })
    password: string;
}

export class ChangePasswordDto {
    @ApiProperty({ example: "user@example.com" })
    email: string;

    @ApiProperty({ example: "currentPassword123" })
    oldPassword: string;

    @ApiProperty({ example: "newSecurePassword456" })
    newPassword: string;
}

export class SendResetPasswordCodeDto {
    @ApiProperty({ example: "user@example.com" })
    email: string;
}

export class VerifyResetPasswordDto {
    @ApiProperty({ example: "user@example.com" })
    email: string;

    @ApiProperty({ example: "123456" })
    code: string;
}

export class ResetPasswordDto {
    @ApiProperty({ example: "user@example.com" })
    email: string;

    @ApiProperty({ example: "token-from-verification", description: "Reset token obtained from verification step" })
    resetToken: string;

    @ApiProperty({ example: "newPassword789" })
    password: string;
}

export class AccountResponse {
    @ApiProperty({ example: "uuid" })
    id: string;

    @ApiProperty({ example: "user@example.com" })
    email: string;

    @ApiProperty({ example: false })
    isVerified: boolean;

    @ApiProperty({ example: "2026-06-10T12:00:00.000Z" })
    createdAt: string;
}

export class TokenResponse {
    @ApiProperty({ example: "eyJhbGciOiJSUzI1NiIs..." })
    accessToken: string;
}

export class ApiSuccessResponse<T> {
    @ApiPropertyOptional({ description: "Response payload" })
    data?: T;

    @ApiProperty({ example: "Action completed successfully" })
    message: string;

    @ApiProperty({ example: 200 })
    status: number;
}

export class ApiErrorResponse {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({ example: "Error description" })
    message: string;

    @ApiProperty({ example: "2026-06-10T12:00:00.000Z" })
    timestamp: string;
}
