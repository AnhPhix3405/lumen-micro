import { IsEmail, IsString } from "class-validator";
export class IVerifyEmailDto {
    @IsEmail()
    email: string;
    @IsString()
    code: string;
}