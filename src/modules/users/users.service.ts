import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { BulkCreateUsersDto } from './dto/bulk-create-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserEntity } from './entities/user.entity';
import { UsersRepository } from './repositories/users.repository';

/**
 * Service สำหรับ business logic ของ users module
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * ฟังก์ชันสร้าง user ใหม่พร้อมตรวจ email ซ้ำและ hash password
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersRepository.withTransaction(() => {
      this.assertPasswordBusinessRules(dto.password);
      this.assertEmailAvailable(dto.email);

      const user = this.usersRepository.create(dto, this.hashPassword(dto.password));

      return this.toResponseDto(user);
    });
  }

  /**
   * ฟังก์ชันสร้าง users หลายรายการพร้อม transaction และตรวจ email ซ้ำทั้งในระบบและใน payload
   */
  async bulkCreate(dto: BulkCreateUsersDto): Promise<UserResponseDto[]> {
    return this.usersRepository.withTransaction(() => {
      const emails = dto.users.map((user) => user.email.toLowerCase());
      const duplicatedEmail = emails.find((email, index) => emails.indexOf(email) !== index);

      if (duplicatedEmail !== undefined) {
        throw new UnprocessableEntityException('Bulk payload contains duplicated email');
      }

      dto.users.forEach((user) => {
        this.assertPasswordBusinessRules(user.password);
        this.assertEmailAvailable(user.email);
      });

      return this.usersRepository
        .bulkCreate(
          dto.users.map((user) => ({
            dto: user,
            passwordHash: this.hashPassword(user.password),
          })),
        )
        .map((user) => this.toResponseDto(user));
    });
  }

  /**
   * ฟังก์ชันดึง users แบบ pagination พร้อม filter/search/sort
   */
  findMany(query: UserQueryDto): UserListResponseDto {
    const result = this.usersRepository.findMany(query);
    const totalPages = Math.ceil(result.total / query.limit);
    const meta: PaginationMetaDto = {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages,
    };

    return {
      items: result.items.map((user) => this.toResponseDto(user)),
      meta,
    };
  }

  /**
   * ฟังก์ชันดึง user ตาม id ถ้าไม่พบจะ throw 404
   */
  findOne(id: string): UserResponseDto {
    return this.toResponseDto(this.getExistingUser(id));
  }

  /**
   * ฟังก์ชันแก้ไข user พร้อมตรวจ email ซ้ำและ business rules
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersRepository.withTransaction(() => {
      const user = this.getExistingUser(id);
      const nextEmail = dto.email?.toLowerCase();

      if (nextEmail !== undefined && nextEmail !== user.email) {
        this.assertEmailAvailable(nextEmail);
      }

      if (dto.password !== undefined) {
        this.assertPasswordBusinessRules(dto.password);
      }

      return this.toResponseDto(
        this.usersRepository.update(
          user,
          dto,
          dto.password !== undefined ? this.hashPassword(dto.password) : undefined,
        ),
      );
    });
  }

  /**
   * ฟังก์ชัน soft delete user ตาม id
   */
  async remove(id: string): Promise<void> {
    return this.usersRepository.withTransaction(() => {
      const deleted = this.usersRepository.softDelete(id);

      if (!deleted) {
        throw new NotFoundException('User not found');
      }
    });
  }

  /**
   * ฟังก์ชันหา user entity ที่มีอยู่จริง
   */
  private getExistingUser(id: string): UserEntity {
    const user = this.usersRepository.findById(id);

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * ฟังก์ชันตรวจ email ซ้ำก่อนสร้างหรือแก้ไข user
   */
  private assertEmailAvailable(email: string): void {
    if (this.usersRepository.findByEmail(email) !== null) {
      throw new ConflictException('Email already exists');
    }
  }

  /**
   * ฟังก์ชันตรวจ business rules ของ password
   */
  private assertPasswordBusinessRules(password: string): void {
    if (!/[0-9]/.test(password)) {
      throw new UnprocessableEntityException('Password must contain at least one number');
    }
  }

  /**
   * ฟังก์ชัน hash password สำหรับเก็บลง repository
   */
  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  /**
   * ฟังก์ชัน map entity เป็น response DTO โดยไม่ expose passwordHash
   */
  private toResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profileImageUrl: user.profileImageUrl,
      roles: user.roles,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
