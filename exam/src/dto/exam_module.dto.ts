import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateExamDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    durationMinutes: number;

    @IsNotEmpty()
    totalScore: number;

    @IsString()
    @IsNotEmpty()
    visibility: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    thumbnailUrl: string;

    @IsString()
    @IsNotEmpty()
    examTypeId: string;

    @IsBoolean()
    @IsNotEmpty()
    isPublished: boolean;
}


export class UpdateExamDto {
    @IsString()
    @IsNotEmpty()
    examId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    durationMinutes: number;

    @IsNotEmpty()
    totalScore: number;

    @IsString()
    @IsNotEmpty()
    visibility: string;

    @IsString()
    thumbnailUrl: string;

    @IsString()
    @IsNotEmpty()
    examTypeId: string;

    @IsBoolean()
    @IsNotEmpty()
    isPublished: boolean;
}

