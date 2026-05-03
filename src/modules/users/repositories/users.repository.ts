import { randomUUID, createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserEntity } from '../entities/user.entity';

export interface PaginatedUsersResult {
  readonly items: UserEntity[];
  readonly total: number;
}

/**
 * Repository สำหรับ users รองรับ custom query, soft delete และ transaction boundary
 */
@Injectable()
export class UsersRepository {
  private readonly users = new Map<string, UserEntity>();

  /**
   * ฟังก์ชันสร้าง user entity ใหม่และบันทึกลง repository
   */
  create(dto: CreateUserDto, passwordHash: string): UserEntity {
    const now = new Date();
    const user = new UserEntity();

    user.id = randomUUID();
    user.email = dto.user_email.toLowerCase();
    user.fullName = dto.fullName;
    user.passwordHash = passwordHash;
    user.profileImageUrl = dto.profileImageUrl ?? null;
    user.roles = dto.roles ?? ['user'];
    user.createdAt = now;
    user.updatedAt = now;
    user.deletedAt = null;
    this.users.set(user.id, user);

    return user;
  }

  /**
   * ฟังก์ชันสร้าง users หลายรายการใน repository เดียวกัน
   */
  bulkCreate(
    items: ReadonlyArray<{ readonly dto: CreateUserDto; readonly passwordHash: string }>,
  ): UserEntity[] {
    return items.map((item) => this.create(item.dto, item.passwordHash));
  }

  /**
   * ฟังก์ชันค้นหา users แบบ pagination พร้อม filter/search/sort
   */
  findMany(query: UserQueryDto): PaginatedUsersResult {
    const page = query.page;
    const limit = query.limit;
    const sort = query.sort ?? 'createdAt';
    const order = query.order ?? 'desc';
    const search = query.search?.toLowerCase();
    const email = query.user_email?.toLowerCase();
    const role = query.role?.toLowerCase();
    const filtered = Array.from(this.users.values()).filter((user) => {
      if (user.deletedAt !== null && query.includeDeleted !== true) {
        return false;
      }

      if (email !== undefined && user.email !== email) {
        return false;
      }

      if (role !== undefined && !user.roles.some((userRole) => userRole.toLowerCase() === role)) {
        return false;
      }

      if (search !== undefined) {
        return user.email.includes(search) || user.fullName.toLowerCase().includes(search);
      }

      return true;
    });
    const sorted = filtered.sort((left, right) => this.compareUsers(left, right, sort, order));
    const offset = (page - 1) * limit;

    return {
      items: sorted.slice(offset, offset + limit),
      total: sorted.length,
    };
  }

  /**
   * ฟังก์ชันค้นหา user ด้วย id โดยไม่รวม soft deleted เป็นค่า default
   */
  findById(id: string, includeDeleted = false): UserEntity | null {
    const user = this.users.get(id);

    if (user === undefined) {
      return null;
    }

    if (user.deletedAt !== null && !includeDeleted) {
      return null;
    }

    return user;
  }

  /**
   * ฟังก์ชันค้นหา user ด้วย email โดยไม่รวม soft deleted เป็นค่า default
   */
  findByEmail(email: string, includeDeleted = false): UserEntity | null {
    const normalizedEmail = email.toLowerCase();
    const user = Array.from(this.users.values()).find((item) => item.email === normalizedEmail);

    if (user === undefined) {
      return null;
    }

    if (user.deletedAt !== null && !includeDeleted) {
      return null;
    }

    return user;
  }

  /**
   * ฟังก์ชัน update user entity ที่มีอยู่แล้ว
   */
  update(user: UserEntity, dto: UpdateUserDto, passwordHash?: string): UserEntity {
    user.email = dto.user_email?.toLowerCase() ?? user.email;
    user.fullName = dto.fullName ?? user.fullName;
    user.profileImageUrl = dto.profileImageUrl ?? user.profileImageUrl;
    user.roles = dto.roles ?? user.roles;
    user.passwordHash = passwordHash ?? user.passwordHash;
    user.updatedAt = new Date();
    this.users.set(user.id, user);

    return user;
  }

  /**
   * ฟังก์ชัน soft delete user ด้วย id
   */
  softDelete(id: string): boolean {
    const user = this.findById(id);

    if (user === null) {
      return false;
    }

    user.deletedAt = new Date();
    user.updatedAt = new Date();
    this.users.set(user.id, user);

    return true;
  }

  /**
   * ฟังก์ชันจำลอง transaction boundary เพื่อให้ service pattern พร้อมย้ายไป TypeORM transaction
   */
  async withTransaction<TResult>(handler: () => TResult | Promise<TResult>): Promise<TResult> {
    const snapshot = new Map(this.users);

    try {
      return await Promise.resolve(handler());
    } catch (error) {
      this.users.clear();
      snapshot.forEach((value, key) => this.users.set(key, value));
      throw error;
    }
  }

  /**
   * ฟังก์ชันล้างข้อมูล repository สำหรับ test fixtures
   */
  clear(): void {
    this.users.clear();
  }

  /**
   * ฟังก์ชัน seed user สำหรับ test fixtures
   */
  seed(user: Omit<UserEntity, 'passwordHash'> & { readonly password?: string }): UserEntity {
    const entity = new UserEntity();

    entity.id = user.id;
    entity.email = user.email.toLowerCase();
    entity.fullName = user.fullName;
    entity.profileImageUrl = user.profileImageUrl;
    entity.roles = user.roles;
    entity.passwordHash = createHash('sha256')
      .update(user.password ?? 'password123')
      .digest('hex');
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    entity.deletedAt = user.deletedAt;
    this.users.set(entity.id, entity);

    return entity;
  }

  /**
   * ฟังก์ชัน compare user สำหรับ sort ใน memory
   */
  private compareUsers(
    left: UserEntity,
    right: UserEntity,
    sort: 'createdAt' | 'updatedAt' | 'user_email' | 'fullName',
    order: 'asc' | 'desc',
  ): number {
    const sortField = sort === 'user_email' ? 'email' : sort;
    const leftValue = left[sortField];
    const rightValue = right[sortField];
    const direction = order === 'asc' ? 1 : -1;

    if (leftValue < rightValue) {
      return -1 * direction;
    }

    if (leftValue > rightValue) {
      return 1 * direction;
    }

    return 0;
  }
}
