import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO สำหรับ response ข้อมูล user โดยไม่ส่ง passwordHash กลับไปยัง client
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'รหัส user ในระบบ',
    example: '5b31b752-89d1-4db2-90e8-3f83c2d06a7b',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Email ของผู้ใช้',
    example: 'user@example.com',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    description: 'ชื่อ-นามสกุล',
    example: 'สมชาย ใจดี',
  })
  fullName!: string;

  @ApiProperty({
    description: 'URL รูปโปรไฟล์ของผู้ใช้',
    example: 'https://cdn.example.com/users/avatar.png',
    nullable: true,
    type: String,
  })
  profileImageUrl!: string | null;

  @ApiProperty({
    description: 'รายการ role ของผู้ใช้',
    example: ['user'],
    type: [String],
  })
  roles!: string[];

  @ApiProperty({
    description: 'เวลาที่สร้าง user',
    example: '2026-05-03T10:30:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'เวลาที่แก้ไข user ล่าสุด',
    example: '2026-05-03T10:35:00.000Z',
  })
  updatedAt!: string;
}
