import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class IChangePasswordDto {
    @IsEmail()
    email: string;
    @IsNotEmpty()
    @IsString()
    oldPassword: string;
    @IsNotEmpty()
    @IsString()
    newPassword: string;
}

export class IResetPasswordDto {
    @IsEmail()
    email: string;
    @IsNotEmpty()
    @IsString()
    password: string;
    @IsNotEmpty()
    @IsString()
    resetToken: string;
}

export class IVerifyCodeDto {
    @IsEmail()
    email: string;
    @IsNotEmpty()
    @IsString()
    code: string;
}