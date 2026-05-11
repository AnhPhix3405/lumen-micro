
import { Contains, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateQuestionGroupDto {

    @IsString()
    @IsNotEmpty()
    partId: string;

    @IsNumber()
    @IsNotEmpty()
    groupOrder: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    transcript: string;

    @IsString()
    @IsNotEmpty()
    @Contains("single")
    @Contains("group")
    type: string;
}

export class UpdateQuestionGroupDto {
    @IsNumber()
    @IsNotEmpty()
    groupOrder: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    transcript: string;
}