import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO สำหรับสร้าง user ใหม่
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'Email ของผู้ใช้',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({
    description: 'รหัสผ่าน อย่างน้อย 8 ตัวอักษร',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password!: string;

  @ApiProperty({
    description: 'ชื่อ-นามสกุล',
    example: 'สมชาย ใจดี',
    minLength: 2,
    maxLength: 160,
  })
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(160, { message: 'Full name must not exceed 160 characters' })
  fullName!: string;

  @ApiProperty({
    description: 'URL รูปโปรไฟล์ของผู้ใช้',
    example: 'https://cdn.example.com/users/avatar.png',
    required: false,
    format: 'uri',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Profile image URL must be a valid URL' })
  @MaxLength(2048, { message: 'Profile image URL must not exceed 2048 characters' })
  profileImageUrl?: string;

  @ApiProperty({
    description: 'รายการ role ของผู้ใช้',
    example: ['user'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10, { message: 'Roles must not exceed 10 items' })
  @IsString({ each: true })
  roles?: string[];
}
