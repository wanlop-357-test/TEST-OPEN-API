import { CreateUserDto } from '../../src/modules/users/dto/create-user.dto';
import { UserEntity } from '../../src/modules/users/entities/user.entity';

/**
 * Fixture สำหรับสร้าง CreateUserDto ที่ใช้ซ้ำใน tests
 */
export function createUserDtoFixture(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
  return {
    email: 'user@example.com',
    password: 'password123',
    fullName: 'สมชาย ใจดี',
    roles: ['user'],
    ...overrides,
  };
}

/**
 * Fixture สำหรับสร้าง UserEntity ที่ใช้ซ้ำใน tests
 */
export function userEntityFixture(overrides: Partial<UserEntity> = {}): UserEntity {
  const now = new Date('2026-05-03T10:30:00.000Z');
  const user = new UserEntity();

  user.id = '5b31b752-89d1-4db2-90e8-3f83c2d06a7b';
  user.email = 'user@example.com';
  user.fullName = 'สมชาย ใจดี';
  user.profileImageUrl = 'https://cdn.example.com/users/avatar.png';
  user.passwordHash = 'hashed-password';
  user.roles = ['user'];
  user.createdAt = now;
  user.updatedAt = now;
  user.deletedAt = null;

  Object.assign(user, overrides);

  return user;
}
