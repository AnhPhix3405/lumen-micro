import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity({ name: "user_follows", schema: "user_service" })
export class UserFollows {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: "user_id", type: "uuid" })
    userId: string;

    @Column({ name: "following_id", type: "uuid" })
    followingId: string;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;
}