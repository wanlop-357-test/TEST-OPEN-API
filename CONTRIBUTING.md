# Contributing

เอกสารนี้กำหนด workflow การเปลี่ยน API โดยยึดหลักว่า code เป็น source of truth และ Apidog เป็นพื้นที่แสดงผล/ทำงานร่วมกันของทีม

## API Change Workflow

1. สร้าง branch จาก `develop`
2. แก้ controller, DTO, service และ tests
3. ใส่ Swagger decorators ให้ครบทุก endpoint
4. รัน validation ในเครื่อง

```bash
npm run verify:api
```

5. ตรวจ `openapi.yaml` ว่าเปลี่ยนตรงกับ API change
6. เปิด PR พร้อมอธิบาย breaking change ถ้ามี
7. หลัง merge ให้ sync เข้า Apidog project `1276414`

## Pre-flight Checklist

- [ ] ทุก endpoint มี `@ApiOperation`
- [ ] ทุก endpoint มี success response และ error response
- [ ] endpoint ที่ต้อง auth มี `@ApiBearerAuth('JWT-auth')`
- [ ] DTO ทุก field มี `@ApiProperty` หรือ `@ApiPropertyOptional`
- [ ] DTO ทุก field มี `class-validator` decorators
- [ ] Error message เป็นภาษาอังกฤษ
- [ ] Response ไม่ส่งข้อมูลลับ เช่น `passwordHash`
- [ ] Tests ผ่านครบ
- [ ] `openapi.yaml` regenerate แล้ว
- [ ] `npm run openapi:validate` ผ่าน
- [ ] `npm run openapi:diff` ผ่าน

## Git Hooks

ก่อน commit:

```bash
npm run verify:quick
```

Hook นี้จะตรวจ lint, generate `openapi.yaml`/`openapi.json`, validate spec และ add spec ที่ regenerate กลับเข้า commit ให้อัตโนมัติ

ก่อน push:

```bash
npm run verify:api
```

Hook นี้จะตรวจครบทั้ง lint, unit/e2e tests, generate OpenAPI, validate spec และ diff API contract ก่อนขึ้น remote

## Pull Request Template

ใช้ template ใน `.github/pull_request_template.md`

## Apidog Sync

Manual sync:

```bash
APIDOG_PROJECT_ID=1276414 \
APIDOG_API_TOKEN=xxx \
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/main/openapi.yaml \
npm run apidog:sync
```

Manual import:

```text
https://app.apidog.com/project/1276414 -> Project Settings -> Import Data -> OpenAPI / Swagger
```

Pre-deploy sync:

```bash
npm run predeploy
```

## Branch Rules

- `main`: production source, sync ไป Apidog production branch
- `develop`: development source, sync ไป Apidog development branch
- feature branches: generate OpenAPI เพื่อ review แต่ไม่ sync เข้า production branch โดยตรง

## Reviewer Notes

Reviewer ต้องดู 2 อย่างเสมอ:

- Code behavior: service/controller/tests
- API contract: `openapi.yaml` และ Swagger decorators
