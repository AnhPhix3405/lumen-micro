import { IsOptional, IsString, MinLength, Matches } from "class-validator";

export class UpdateDto {
    @IsString()
    @IsOptional()
    @MinLength(3)
    fullName: string;

    @IsString()
    @IsOptional()
    @MinLength(20)
    bio: string;

    @IsString()
    @IsOptional()
    websiteUrl: string;

    @IsString()
    @IsOptional()
    location: string;

    @IsString()
    @IsOptional()
    @Matches(/(male|female)/, { message: 'Gender must be male or female' })
    gender: string;

    @IsString()
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Birthday must be in YYYY-MM-DD format' })
    birthday: string;
}