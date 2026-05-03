# Apidog Setup Guide

เอกสารนี้อธิบายวิธีเชื่อมโปรเจกต์ NestJS นี้กับ Apidog project เดิมของบริษัท

```text
https://app.apidog.com/project/1276414
```

หลักการสำคัญ:

```text
NestJS code -> openapi.yaml -> Apidog project 1276414
```

Apidog เป็นที่แสดงผล/ทดสอบ/แชร์ API contract แต่ source of truth ยังเป็น code ใน repository นี้

## Step 1: Generate OpenAPI จาก code

รัน:

```bash
npm run openapi:generate
```

ผลลัพธ์:

```text
openapi.yaml
openapi.json
```

## Step 2: Validate OpenAPI

รัน:

```bash
npm run openapi:validate
```

ควรเห็น:

```text
OpenAPI validation passed
```

## Step 3: เปิด Apidog project เดิม

เปิด:

```text
https://app.apidog.com/project/1276414
```

ถ้าต้องดู API list หลัง import ให้เข้าเมนู APIs ภายใน project นี้:

```text
https://app.apidog.com/project/1276414
```

## Step 4: เลือก branch ให้ถูก

ถ้า project มีหลาย branch ให้เลือก branch ที่ทีมใช้ก่อน import เช่น `main`, `develop`, `v1` หรือ branch production ของทีม

ถ้า project นี้เพิ่งสร้างใหม่และยังไม่มี branch เพิ่ม ให้ใช้ default branch ไปก่อน แล้วค่อยสร้าง branch strategy หลัง import สำเร็จ

## Step 5: Import OpenAPI แบบ manual

ใน Apidog:

1. เข้า Project Settings
2. เลือก Import Data
3. เลือก OpenAPI / Swagger
4. Upload `openapi.yaml`
5. Preview
6. ตั้งค่า import options
7. Confirm import

หรือใน sidebar APIs:

```text
+ -> Import -> OpenAPI / Swagger
```

## Step 6: Import Options ที่แนะนำ

ใช้ค่าประมาณนี้:

```text
Endpoint overwrite: OVERWRITE_EXISTING
Schema overwrite: OVERWRITE_EXISTING
Update folder of changed endpoint: false
Prepend base path: false
```

เหตุผล:

- `OVERWRITE_EXISTING`: ให้ Apidog ตรงกับ code ล่าสุด
- `Prepend base path: false`: เพราะ OpenAPI ของ NestJS มี path จาก global prefix อยู่แล้ว
- `Update folder`: ปิดไว้เพื่อลดการย้าย folder เองโดยไม่ตั้งใจ

## Step 7: ตรวจว่า List users เปลี่ยนแล้ว

เปิด endpoint:

```text
GET /api/v1/users
```

หรือค้นหา:

```text
List users
```

ดู section:

```text
Query Params / Parameters
Request Body
Responses
Schemas
```

ควรเห็น query ใหม่:

```text
role
```

รายละเอียด:

```text
name: role
type: string
required: false
example: admin
description: กรอง users ที่มี role นี้
```

ถ้าเพิ่งเพิ่ม field `profileImageUrl` ให้เปิด `POST /api/v1/users` แล้วดูที่ `Request Body` ว่ามี field นี้หรือไม่

## Step 8: Setup API Token สำหรับ Auto Sync

ต้องให้ admin หรือ backend lead สร้าง token ใน Apidog:

1. เข้า Account Settings หรือ Organization/Project Settings
2. ไปที่ API Access Token
3. Create token
4. Copy token เก็บใน secret manager

ห้าม commit token ลง git

## Step 9: ตั้งค่า local `.env`

เพิ่มค่าเหล่านี้ใน `.env`:

```env
APIDOG_PROJECT_ID=1276414
APIDOG_API_TOKEN=your_apidog_token
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/main/openapi.yaml
APIDOG_LOCALE=en-US
APIDOG_API_VERSION=2024-03-28
APIDOG_ENDPOINT_FOLDER_ID=0
APIDOG_SCHEMA_FOLDER_ID=0
APIDOG_ENDPOINT_OVERWRITE_BEHAVIOR=OVERWRITE_EXISTING
APIDOG_SCHEMA_OVERWRITE_BEHAVIOR=OVERWRITE_EXISTING
APIDOG_UPDATE_FOLDER_OF_CHANGED_ENDPOINT=false
APIDOG_PREPEND_BASE_PATH=false
```

`APIDOG_OPENAPI_URL` ต้องเป็น direct raw URL ที่ Apidog server เข้าถึงได้

ตัวอย่าง GitHub raw URL:

```text
https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/main/openapi.yaml
```

## Step 10: Manual sync ผ่าน CLI

ตรวจ config ก่อน:

```bash
npm run apidog:check
```

รัน:

```bash
npm run apidog:sync
```

คำสั่งนี้จะ:

1. Generate `openapi.yaml`
2. Call Apidog import API
3. Update project `1276414`

## Step 11: GitHub Actions Setup

ใน GitHub repository:

```text
Settings -> Secrets and variables -> Actions
```

เพิ่ม secrets:

```text
APIDOG_PROJECT_ID=1276414
APIDOG_API_TOKEN=your_apidog_token
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/main/openapi.yaml
```

workflow อยู่ที่:

```text
.github/workflows/apidog-sync.yml
```

เมื่อ push เข้า `main` หรือ `develop` แล้ว workflow จะทำงานอัตโนมัติ:

```text
push -> npm ci -> generate OpenAPI -> validate -> diff -> sync Apidog
```

ข้อสำคัญ:

- ต้อง commit `openapi.yaml` และ `openapi.json` ไปพร้อม API change
- `APIDOG_OPENAPI_URL` ควรชี้ไปที่ raw URL ของ branch ที่ workflow ใช้
- ถ้าใช้ `main`: URL ควรเป็น raw URL ของ `main`
- ถ้าใช้ `develop`: URL ควรเป็น raw URL ของ `develop`

## Step 12: Pre-deploy Hook

ก่อน deploy production:

```bash
npm run predeploy
```

คำสั่งนี้จะ:

1. lint
2. test
3. generate OpenAPI
4. validate OpenAPI
5. check OpenAPI diff
6. sync เข้า Apidog

## Troubleshooting

### ไม่เห็น field ใหม่ใน Apidog

เช็ค:

1. Upload `openapi.yaml` ล่าสุดหรือยัง
2. เลือก branch ใน Apidog ถูกไหม
3. import ไป project `1276414` ถูกไหม
4. refresh browser หรือเปิด incognito
5. ค้นหา endpoint `List users`
6. ดู Query Params ว่ามี `role` หรือไม่

### `APIDOG_API_TOKEN is required`

แปลว่ายังไม่ได้ตั้ง token ใน `.env` หรือ shell:

```env
APIDOG_API_TOKEN=your_apidog_token
```

### `APIDOG_OPENAPI_URL is required`

แปลว่ายังไม่ได้ตั้ง raw URL ของ OpenAPI file:

```env
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/main/openapi.yaml
```

### Auto sync ไม่ผ่าน

เช็ค:

1. token ถูกไหม
2. token มีสิทธิ์ project `1276414` ไหม
3. `APIDOG_OPENAPI_URL` เป็น raw file URL หรือไม่
4. URL เปิดจาก internet ได้ไหม

## Checklist

### Backend Developer

- [ ] รัน `npm run openapi:generate`
- [ ] รัน `npm run openapi:validate`
- [ ] เห็น `openapi.yaml` เปลี่ยนตาม API
- [ ] Import เข้า Apidog branch ที่ถูกต้อง

### Backend Lead

- [ ] ตรวจ OpenAPI diff
- [ ] ตรวจ breaking changes
- [ ] Approve sync เข้า production branch

### Frontend/App

- [ ] เปิด Apidog project `1276414`
- [ ] ดู endpoint และ schema ล่าสุด
- [ ] ตรวจ query/body/response ที่เปลี่ยน

### Tester

- [ ] เปิด endpoint ใน Apidog
- [ ] ตรวจ examples
- [ ] ทดสอบ status code
- [ ] แจ้ง issue ถ้า docs กับ behavior ไม่ตรงกัน
