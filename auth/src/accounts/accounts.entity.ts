import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    Check,
} from 'typeorm';

@Entity({ name: 'auth_accounts', schema: 'auth' })
@Check(`"provider" IN ('local', 'google', 'github')`)
@Check(`"status" IN ('active', 'inactive', 'suspended', 'pending')`)
export class AuthAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    password_hash: string;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'local',
    })
    provider: 'local' | 'google' | 'github';

    @Column({ type: 'varchar', length: 255, nullable: true })
    provider_id: string;

    @Column({ type: 'boolean', default: false })
    is_verified: boolean;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'active',
    })
    status: 'active' | 'inactive' | 'suspended' | 'pending';

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}