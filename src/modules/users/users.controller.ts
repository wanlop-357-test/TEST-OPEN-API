import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { BulkCreateUsersDto } from './dto/bulk-create-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

/**
 * Controller สำหรับ CRUD users พร้อม Swagger decorators ครบทุก endpoint
 */
@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ฟังก์ชันสร้าง user ใหม่
   */
  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Create a new user account with unique user_email and user_password business rules.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'User email already exists', type: ErrorResponseDto })
  @ApiUnprocessableEntityResponse({
    description: 'Business rule violation',
    type: ErrorResponseDto,
  })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  /**
   * ฟังก์ชันสร้าง users หลายรายการใน request เดียว
   */
  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk create users',
    description: 'Create multiple users in a single transaction-like operation.',
  })
  @ApiBody({ type: BulkCreateUsersDto })
  @ApiCreatedResponse({
    description: 'Users created successfully',
    type: [UserResponseDto],
  })
  @ApiBadRequestResponse({ description: 'Validation error', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'User email already exists', type: ErrorResponseDto })
  @ApiUnprocessableEntityResponse({
    description: 'Bulk payload violates business rules',
    type: ErrorResponseDto,
  })
  async bulkCreate(@Body() dto: BulkCreateUsersDto): Promise<UserResponseDto[]> {
    return this.usersService.bulkCreate(dto);
  }

  /**
   * ฟังก์ชันดึงรายการ users แบบ pagination, filter, sort และ search
   */
  @Get()
  @ApiOperation({
    summary: 'List users',
    description: 'List users with pagination, filtering, search, and sorting support.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'somchai' })
  @ApiQuery({ name: 'user_email', required: false, example: 'user@example.com' })
  @ApiQuery({ name: 'role', required: false, example: 'admin' })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['createdAt', 'updatedAt', 'user_email', 'fullName'],
  })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'includeDeleted', required: false, example: false })
  @ApiOkResponse({
    description: 'Users returned successfully',
    type: UserListResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation error', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ErrorResponseDto })
  findMany(@Query() query: UserQueryDto): UserListResponseDto {
    return this.usersService.findMany(query);
  }

  /**
   * ฟังก์ชันดึง user รายการเดียวด้วย id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Get a single active user by id.',
  })
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: '5b31b752-89d1-4db2-90e8-3f83c2d06a7b',
  })
  @ApiOkResponse({ description: 'User returned successfully', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  findOne(@Param('id') id: string): UserResponseDto {
    return this.usersService.findOne(id);
  }

  /**
   * ฟังก์ชันแก้ไข user ด้วย id
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user profile, user_email, roles, or user_password.',
  })
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: '5b31b752-89d1-4db2-90e8-3f83c2d06a7b',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'User updated successfully', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'User email already exists', type: ErrorResponseDto })
  @ApiUnprocessableEntityResponse({
    description: 'Business rule violation',
    type: ErrorResponseDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  /**
   * ฟังก์ชัน soft delete user ด้วย id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete user',
    description: 'Soft delete a user by setting deletedAt without removing data permanently.',
  })
  @ApiParam({
    name: 'id',
    description: 'User id',
    example: '5b31b752-89d1-4db2-90e8-3f83c2d06a7b',
  })
  @ApiNoContentResponse({ description: 'User soft deleted successfully' })
  @ApiBadRequestResponse({ description: 'Validation error', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Forbidden', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
