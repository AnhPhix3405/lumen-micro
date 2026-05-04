import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsDate,
    MaxLength,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    userId: string

    @IsOptional()
    @IsString()
    actorId?: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    type: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    entityType: string;

    @IsNotEmpty()
    @IsNumber()
    entityId: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsObject()
    data?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    isRead?: boolean;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    readAt?: Date;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    dedupKey?: string;
}