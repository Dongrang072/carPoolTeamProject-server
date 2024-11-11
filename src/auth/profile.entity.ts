// src/profiles/profile.entity.ts
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId: number;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'profile_picture', type: 'varchar', length: 255, nullable: true, comment: '프로필 사진의 URL, s3 연동 예정' })
  profilePicture: string;

  @Column({ name: 'bio', type: 'text', nullable: true, comment: '사용자 프로필 소개' })
  bio: string;
}
