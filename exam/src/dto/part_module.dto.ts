import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreatePartDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsNotEmpty()
    partOrder: number;

    @IsString()
    instruction: string;

    @IsNotEmpty()
    score: number;

    @IsString()
    @IsNotEmpty()
    examId: string;
}

export class UpdatePartDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsNotEmpty()
    partOrder: number;

    @IsString()
    instruction: string;

    @IsNotEmpty()
    score: number;

}