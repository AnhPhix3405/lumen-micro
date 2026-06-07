import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateQuestionInGroupDto {
    @IsString()
    @IsNotEmpty()
    questionGroupId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsString()
    @IsOptional()
    audioUrl?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsOptional()
    options?: object;

    @IsOptional()
    correctOption?: object;

    @IsNumber()
    @IsOptional()
    score?: number;

    @IsNumber()
    @IsNotEmpty()
    questionOrder: number;
}

export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    partId?: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsString()
    @IsOptional()
    audioUrl?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsOptional()
    options?: object;

    @IsOptional()
    correctOption?: object;

    @IsNumber()
    @IsOptional()
    score?: number;

    @IsNumber()
    @IsNotEmpty()
    questionOrder: number;
}

export class UpdateQuestionDto {
    @IsString()
    @IsNotEmpty()
    questionId: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    explanation?: string;

    @IsString()
    @IsOptional()
    audioUrl?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsOptional()
    options?: object;

    @IsOptional()
    correctOption?: object;

    @IsNumber()
    @IsOptional()
    score?: number;

    @IsNumber()
    @IsOptional()
    questionOrder?: number;
}
