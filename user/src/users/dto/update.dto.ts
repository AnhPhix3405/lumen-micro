import { IsOptional, IsString } from "class-validator";

export class UpdateDto{
    @IsString()
    @IsOptional()
    userName: string;

    @IsString()
    @IsOptional()
    fullName: string;

    @IsString()
    @IsOptional()
    avatarUrl: string;

    @IsString()
    @IsOptional()
    bio: string;

    @IsString()
    @IsOptional()
    websiteUrl: string;

    @IsString()
    @IsOptional()
    githubUsername: string;

    @IsString()
    @IsOptional()
    location: string;

    @IsString()
    @IsOptional()
    gender: string;

    @IsString()
    @IsOptional()
    birthday: string;
}