import { IsEmail, IsString } from "class-validator";
export class IRegisterDto {
    @IsEmail()
    email: string;
    @IsString()
    password: string;
}