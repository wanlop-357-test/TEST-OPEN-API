import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { createUserDtoFixture, userEntityFixture } from '../../fixtures/users.fixture';
import { UsersRepository } from '../../../src/modules/users/repositories/users.repository';
import { UsersService } from '../../../src/modules/users/users.service';

describe('UsersService', () => {
  let repository: UsersRepository;
  let service: UsersService;

  beforeEach(() => {
    repository = new UsersRepository();
    service = new UsersService(repository);
  });

  it('creates user without exposing password hash', async () => {
    const user = await service.create(
      createUserDtoFixture({ profileImageUrl: 'https://cdn.example.com/users/avatar.png' }),
    );

    expect(user.email).toBe('user@example.com');
    expect(user.fullName).toBe('สมชาย ใจดี');
    expect(user.profileImageUrl).toBe('https://cdn.example.com/users/avatar.png');
    expect(Object.keys(user)).not.toContain('passwordHash');
  });

  it('throws conflict when email already exists', async () => {
    await service.create(createUserDtoFixture());

    await expect(service.create(createUserDtoFixture())).rejects.toThrow(ConflictException);
  });

  it('throws business error when password has no number', async () => {
    await expect(
      service.create(createUserDtoFixture({ email: 'new@example.com', password: 'password' })),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('lists users with pagination metadata', async () => {
    await service.create(createUserDtoFixture());

    const result = service.findMany({ page: 1, limit: 20, order: 'desc' });

    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('filters users by role', async () => {
    await service.create(createUserDtoFixture({ email: 'admin@example.com', roles: ['admin'] }));
    await service.create(createUserDtoFixture({ email: 'user@example.com', roles: ['user'] }));

    const result = service.findMany({ page: 1, limit: 20, order: 'desc', role: 'admin' });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.email).toBe('admin@example.com');
  });

  it('updates existing user', async () => {
    const seededUser = repository.seed(userEntityFixture());
    const updatedUser = await service.update(seededUser.id, { fullName: 'สมหญิง ใจดี' });

    expect(updatedUser.fullName).toBe('สมหญิง ใจดี');
  });

  it('throws not found when removing missing user', async () => {
    await expect(service.remove('missing-id')).rejects.toThrow(NotFoundException);
  });
});
