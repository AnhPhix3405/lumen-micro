import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from "class-validator";

export class CreateSubmitDto {
    @IsString()
    @IsNotEmpty()
    examId: string;

    @IsOptional()
    @IsNumber()
    timeLimit?: number;
}

export class FinishSessionDto {} // body may contain only JWT payload

export class AnswerItemDto {
    @IsString()
    @IsNotEmpty()
    questionId: string;

    @IsOptional()
    selectedOption?: object;

    @IsOptional()
    @IsString()
    answerContent?: string;

    @IsOptional()
    @IsString()
    audioUrl?: string;
}

export class SubmitAnswersDto {
    @IsArray()
    @IsNotEmpty()
    answers: AnswerItemDto[];
}
