import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeUpdate,
} from 'typeorm';

@Entity('notifications', { schema: 'notification_service' })
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'user_id' })
    userId: string;

    @Column({ type: 'uuid', name: 'actor_id', nullable: true })
    actorId?: string;

    @Column({ type: 'varchar', length: 50 })
    type: string;

    @Column({ type: 'varchar', length: 50, name: 'entity_type' })
    entityType: string;

    @Column({ type: 'bigint', name: 'entity_id' })
    entityId: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title?: string;


    @Column({ type: 'text', nullable: true })
    message?: string;

    @Column({ type: 'jsonb', nullable: true })
    data?: Record<string, any>;

    @Column({ type: 'boolean', name: 'is_read', default: false })
    isRead: boolean;

    @Column({ type: 'timestamp', name: 'read_at', nullable: true })
    readAt?: Date;

    @Column({ type: 'varchar', length: 255, name: 'dedup_key', nullable: true })
    dedupKey?: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }
}