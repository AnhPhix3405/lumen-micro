import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
    Check,
} from 'typeorm';

@Entity({ name: 'users', schema: 'user_service' })
@Check(`"status" IN ('active', 'inactive', 'banned', 'pending')`)
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ name: 'user_name', type: 'varchar', length: 255, unique: true })
    userName: string;

    @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
    fullName: string;

    @Column({ name: 'avatar_url', type: 'text', nullable: true })
    avatarUrl: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ name: 'website_url', type: 'text', nullable: true })
    websiteUrl: string;

    @Index({ unique: true })
    @Column({ name: 'github_username', type: 'varchar', length: 255, nullable: true, unique: true })
    githubUsername: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string;

    @Column({ type: 'integer', default: 0 })
    reputations: number;

    @Column({ name: 'views_post', type: 'integer', default: 0 })
    viewsPost: number;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'active',
    })
    status: 'active' | 'inactive' | 'banned' | 'pending';

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    deletedAt: Date;
}