import { Test, TestingModule } from '@nestjs/testing';
import { createUserDtoFixture } from '../../fixtures/users.fixture';
import { UserListResponseDto } from '../../../src/modules/users/dto/user-list-response.dto';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersService } from '../../../src/modules/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const userResponse = {
    id: '5b31b752-89d1-4db2-90e8-3f83c2d06a7b',
    user_email: 'user@example.com',
    fullName: 'สมชาย ใจดี',
    profileImageUrl: 'https://cdn.example.com/users/avatar.png',
    roles: ['user'],
    createdAt: '2026-05-03T10:30:00.000Z',
    updatedAt: '2026-05-03T10:30:00.000Z',
  };
  const usersService = {
    create: jest.fn<Promise<typeof userResponse>, [ReturnType<typeof createUserDtoFixture>]>(),
    bulkCreate: jest.fn<
      Promise<(typeof userResponse)[]>,
      [{ users: ReturnType<typeof createUserDtoFixture>[] }]
    >(),
    findMany: jest.fn<
      UserListResponseDto,
      [{ page: number; limit: number; order: 'asc' | 'desc' }]
    >(),
    findOne: jest.fn<typeof userResponse, [string]>(),
    update: jest.fn<
      Promise<typeof userResponse>,
      [string, Partial<ReturnType<typeof createUserDtoFixture>>]
    >(),
    remove: jest.fn<Promise<void>, [string]>(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('creates user', async () => {
    usersService.create.mockResolvedValue(userResponse);

    await expect(controller.create(createUserDtoFixture())).resolves.toEqual(userResponse);
  });

  it('lists users', () => {
    usersService.findMany.mockReturnValue({
      items: [userResponse],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    expect(controller.findMany({ page: 1, limit: 20, order: 'desc' })).toEqual({
      items: [userResponse],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('removes user', async () => {
    usersService.remove.mockResolvedValue(undefined);

    await expect(
      controller.remove('5b31b752-89d1-4db2-90e8-3f83c2d06a7b'),
    ).resolves.toBeUndefined();
  });
});
