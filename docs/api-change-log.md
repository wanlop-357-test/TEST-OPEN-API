# API Change Log

## 2026-05-03 - Users API: เปลี่ยน field `email` เป็น `user_email`

Endpoint:

```text
POST /api/v1/users
POST /api/v1/users/bulk
GET /api/v1/users
GET /api/v1/users/{id}
PATCH /api/v1/users/{id}
```

สิ่งที่เปลี่ยน:

```diff
  CreateUserDto:
-   email
+   user_email
    password
    fullName
    profileImageUrl
    roles

  UserResponseDto:
    id
-   email
+   user_email
    fullName
    profileImageUrl
    roles
    createdAt
    updatedAt

  UserQueryDto:
-   email
+   user_email
    role
-   sort: email
+   sort: user_email
```

ตัวอย่าง request ใหม่:

```bash
curl --location --request POST 'http://localhost:3001/api/v1/users' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "user_email": "user@example.com",
    "password": "password123",
    "fullName": "สมชาย ใจดี",
    "profileImageUrl": "https://cdn.example.com/users/avatar.png",
    "roles": ["user"]
  }'
```

ตัวอย่าง filter ใหม่:

```bash
curl 'http://localhost:3001/api/v1/users?page=1&limit=10&user_email=user@example.com&sort=user_email'
```

ผลกระทบ:

- เป็น breaking change สำหรับ client ที่ยังส่ง `email`
- Next.js, Flutter และ client อื่นต้อง regenerate code จาก OpenAPI ล่าสุด
- Apidog history/diff จะเห็น schema เปลี่ยนจาก `email` เป็น `user_email`

OpenAPI history:

- Before: `docs/openapi-history/2026-05-03-before-email-to-user-email.yaml`
- After: `docs/openapi-history/2026-05-03-after-email-to-user-email.yaml`

## 2026-05-03 - Create User: เพิ่มรูปโปรไฟล์

Endpoint:

```text
POST /api/v1/users
PATCH /api/v1/users/{id}
```

สิ่งที่เปลี่ยน:

```diff
  CreateUserDto:
    email
    password
    fullName
+   profileImageUrl
    roles

  UserResponseDto:
    id
    email
    fullName
+   profileImageUrl
    roles
    createdAt
    updatedAt
```

Field ใหม่:

| Field | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
| `profileImageUrl` | `string` URL | no | `https://cdn.example.com/users/avatar.png` | URL รูปโปรไฟล์ของผู้ใช้ |

ตัวอย่าง request ใหม่:

```bash
curl --location --request POST 'http://localhost:3001/api/v1/users' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "สมชาย ใจดี",
    "profileImageUrl": "https://cdn.example.com/users/avatar.png",
    "roles": ["user"]
  }'
```

ผลกระทบ:

- ไม่ใช่ breaking change เพราะ field เป็น optional
- client เดิมยังสร้าง user ได้โดยไม่ส่งรูป
- response จะมี `profileImageUrl` เพิ่ม โดยเป็น `string` หรือ `null`

OpenAPI history:

- Before: `docs/openapi-history/2026-05-03-before-create-user-profile-image.yaml`
- After: `docs/openapi-history/2026-05-03-after-create-user-profile-image.yaml`

## 2026-05-03 - List Users: เพิ่ม filter ตาม role

Endpoint:

```text
GET /api/v1/users
```

สิ่งที่เปลี่ยน:

```diff
  query:
    page
    limit
    search
    email
+   role
    sort
    order
    includeDeleted
```

Query ใหม่:

| Field | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
| `role` | `string` | no | `admin` | กรอง users ที่มี role นี้ |

ตัวอย่าง request:

```bash
curl 'http://localhost:3001/api/v1/users?page=1&limit=10&role=admin'
```

ผลกระทบ:

- ไม่ใช่ breaking change
- client เดิมเรียก `GET /users` ได้เหมือนเดิม
- frontend/app สามารถเพิ่ม dropdown หรือ filter chip ตาม role ได้

ไฟล์ที่เปลี่ยน:

- `src/modules/users/dto/user-query.dto.ts`
- `src/modules/users/repositories/users.repository.ts`
- `src/modules/users/users.controller.ts`
- `test/modules/users/users.service.spec.ts`
- `openapi.yaml`
- `openapi.json`
