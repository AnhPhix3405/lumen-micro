import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

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

    @IsArray()
    @IsUUID("4", { each: true })
    @IsOptional()
    topicIds?: string[];
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

    @IsArray()
    @IsUUID("4", { each: true })
    @IsOptional()
    topicIds?: string[];
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

    @IsArray()
    @IsUUID("4", { each: true })
    @IsOptional()
    topicIds?: string[];
}
