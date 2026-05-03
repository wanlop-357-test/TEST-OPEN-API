# Project Rules

เอกสารนี้คือกฎหลักของโปรเจกต์ `TEST-OPEN-API` สำหรับคนในทีมและ AI assistant ทุกตัวที่เข้ามาช่วยแก้ code

AI assistant ทุกตัวต้องอ่านไฟล์นี้ก่อนเริ่มทำงานทุกครั้ง รวมถึง Codex, Claude, Cursor หรือเครื่องมือ automation อื่น ๆ

หลักสำคัญที่สุด:

```text
Code คือ source of truth
OpenAPI ถูก generate จาก code
Apidog ใช้แสดงผล ทดสอบ และ sync contract เท่านั้น
```

## 1. Git Rules

- ห้าม AI assistant รันคำสั่ง `git` เองทุกกรณี ยกเว้นผู้ใช้สั่งชัดเจนในข้อความล่าสุด
- ห้าม AI assistant commit, push, pull, merge, rebase, checkout, reset, stash หรือ tag เอง
- ห้าม AI assistant แก้ประวัติ git หรือย้อน changes ของผู้ใช้
- ถ้าต้องการดูสถานะ git ต้องถามผู้ใช้ก่อน เช่น `git status`, `git diff`, `git log`
- ถ้าพบไฟล์ที่เปลี่ยนอยู่แล้ว ให้ถือว่าเป็นงานของผู้ใช้หรือทีม และห้าม revert
- การตัดสินใจ merge, resolve conflict, release branch และ tag version เป็นสิทธิ์ของผู้ใช้เท่านั้น
- AI assistant ทำได้เฉพาะแก้ไฟล์ใน working tree, รัน test/build/lint ที่จำเป็น และสรุปไฟล์ที่เปลี่ยน

## 2. Scope Rules

- แก้เฉพาะงานที่ผู้ใช้ขอใน phase ปัจจุบัน
- ห้าม refactor ใหญ่ถ้าไม่จำเป็นต่อ requirement
- ห้ามเปลี่ยน architecture, ORM, database, auth strategy หรือ API version โดยไม่ถามก่อน
- ถ้าพบ bug นอก scope ให้จดไว้ใน final summary หรือเสนอเป็น phase ถัดไป
- ห้ามลบไฟล์ production, migration, config, docs หรือ test โดยไม่ขออนุญาต
- ถ้าต้องเพิ่ม dependency ใหม่ ต้องอธิบายเหตุผลก่อนใช้งาน

## 3. API Source Of Truth

- NestJS code เป็น source of truth ของ API contract
- `openapi.yaml` และ `openapi.json` ต้องถูก generate จาก code เท่านั้น
- ห้ามแก้ `openapi.yaml` หรือ `openapi.json` ด้วยมือเพื่อให้ spec ผ่าน
- Apidog ต้อง sync จาก `openapi.yaml`
- ถ้า API behavior เปลี่ยน ต้อง regenerate OpenAPI ทุกครั้ง
- ถ้า contract เปลี่ยน ต้องอัปเดต `docs/api-change-log.md`

## 4. Controller Rules

- ทุก endpoint ต้องมี `@ApiTags` ใน controller
- ทุก endpoint ต้องมี `@ApiOperation`
- ทุก endpoint ต้องมี success response decorator เช่น `@ApiOkResponse`, `@ApiCreatedResponse` หรือ decorator กลางของโปรเจกต์
- ทุก endpoint ต้องมี error response มาตรฐานผ่าน `@ApiErrorResponses`
- endpoint ที่รับ body ต้องใช้ DTO class เท่านั้น
- endpoint ที่รับ query ต้องใช้ query DTO เท่านั้น
- endpoint ที่รับ path param ต้อง validate param ให้ชัดเจน
- endpoint ที่เป็น public ต้องใส่ `@Public()`
- endpoint ที่ต้อง auth ต้องใส่ `@ApiBearerAuth('JWT-auth')`

## 5. DTO Rules

- ทุก DTO field ต้องมี `@ApiProperty` หรือ `@ApiPropertyOptional`
- ทุก DTO field ต้องมี `class-validator` decorator ที่เหมาะสม
- DTO ที่รับ input ต้องกำหนด example ใน Swagger ให้ครบ
- DTO ที่เป็น optional ต้องใช้ `@IsOptional()`
- DTO ที่เป็น string ต้องระบุ validation เช่น `@IsString()`, `@IsEmail()`, `@Length()` หรือ `@MaxLength()`
- DTO ที่เป็น enum ต้องใช้ enum จริง และระบุ enum ใน Swagger
- DTO response ห้าม expose ข้อมูลลับ เช่น password, passwordHash, token, refreshToken, internalKey
- ห้ามใช้ `any` ใน DTO
- ห้ามใช้ inline object เป็น request หรือ response schema ถ้าสามารถสร้าง DTO ได้

## 6. Validation And Transform Rules

- เปิดใช้งาน global `ValidationPipe` เสมอ
- ต้องใช้ whitelist เพื่อตัด field ที่ไม่รู้จัก
- ต้อง reject field ที่ไม่อนุญาตเมื่อเป็น request สำคัญ
- ต้อง transform query และ param ให้เป็น type ที่ service คาดหวัง
- Error message จาก validation ต้องอ่านง่ายและเป็นภาษาอังกฤษ
- ห้าม validate business rule ใน controller ถ้าควรอยู่ใน service

## 7. Response Rules

- Success response ต้องใช้รูปแบบกลางของโปรเจกต์
- Error response ต้องใช้ `ErrorResponseDto`
- ทุก response ต้องมี `requestId`
- Pagination ต้องใช้ `PaginationDto`, `PaginationMetaDto` และ response DTO กลาง
- ห้ามส่ง raw entity ออกจาก controller
- Response DTO ต้องแยกจาก entity เสมอ

## 8. Error Handling Rules

- ห้าม throw plain object หรือ string
- ใช้ NestJS exception class เช่น `BadRequestException`, `NotFoundException`, `ConflictException`
- Error ทุกตัวต้องถูก format ผ่าน exception filter กลาง
- ห้าม leak stack trace, database error, secret, token หรือ internal config ไปให้ client
- Sentry ใช้เก็บ unexpected error เท่านั้น ไม่ใช้แทน validation หรือ logging ปกติ
- Error message สำหรับ client ต้องสั้น ชัดเจน และไม่เปิดเผย implementation detail

## 9. Logging And Request ID Rules

- ทุก request ต้องมี request id
- ถ้า client ส่ง request id มาและ format ถูกต้อง ให้ใช้ค่าจาก client
- ถ้า client ไม่ส่ง request id ให้ระบบ generate ให้
- Log ต้องมี request id, method, path, status code และ duration
- ห้าม log password, token, secret, cookie, authorization header หรือข้อมูลส่วนตัวที่ไม่จำเป็น
- Service สำคัญควร log event เชิง business แบบไม่เปิดเผยข้อมูลลับ

## 10. Sentry Rules

- ต้องตั้งค่า Sentry ตั้งแต่เริ่ม project แม้ยังไม่ใส่ DSN ใน local
- ห้าม hardcode Sentry DSN ใน code
- Sentry DSN ต้องมาจาก environment variable เท่านั้น
- unexpected exception ต้องส่งเข้า Sentry พร้อม request id
- validation error และ expected business error ไม่ควรถูกส่งเป็น critical error

## 11. Apidog Rules

- Apidog เป็น consumer-facing API workspace ไม่ใช่ source of truth
- ห้ามแก้ API contract ใน Apidog แล้วถือว่า code เปลี่ยนแล้ว
- การเปลี่ยน endpoint ต้องเริ่มจาก NestJS code ก่อนเสมอ
- ก่อน sync เข้า Apidog ต้องรัน generate และ validate OpenAPI
- ห้าม commit หรือเปิดเผย `APIDOG_API_TOKEN`
- การ sync production branch ต้องทำผ่าน workflow ที่ทีมตกลงเท่านั้น
- Manual import ใช้ได้เฉพาะตอน setup, debug หรือได้รับอนุญาตจาก backend lead

## 12. Testing Rules

- API change ต้องมี unit test หรือ e2e test ตามความเสี่ยง
- Validation rule ใหม่ต้องมี test อย่างน้อยหนึ่งเคส
- Error response สำคัญต้องมี test ตรวจ format
- Pagination, filter, sort และ auth behavior ต้องมี test ถ้า endpoint ใช้ feature เหล่านี้
- ก่อนส่งงานควรรันคำสั่งที่เกี่ยวข้อง เช่น `npm run test`, `npm run verify:quick` หรือ `npm run verify:api`
- ถ้ารัน test ไม่ได้ ต้องบอกเหตุผลใน final summary

## 13. OpenAPI Rules

- ทุก API change ต้องรัน `npm run openapi:generate`
- ต้องรัน `npm run openapi:validate` ก่อน sync หรือ deploy
- ถ้าเป็น breaking change ต้องรัน diff และอธิบายผลกระทบ
- ห้ามปล่อยให้ Swagger schema กว้างกว่า validation จริง
- ห้ามปล่อยให้ validation รับค่าที่ Swagger ไม่ได้บอก
- ตัวอย่าง request และ response ใน Swagger ต้องตรงกับ behavior จริง

## 14. Security Rules

- ห้าม hardcode secret ทุกชนิด
- ห้าม commit `.env`
- `.env.example` ต้องมีเฉพาะ key ตัวอย่างที่ไม่ใช่ secret จริง
- ห้าม expose internal id, internal role, secret flag หรือ debug field ถ้าไม่ใช่ public contract
- Auth และ authorization ต้องแยกกันชัดเจน
- Endpoint ที่แก้ข้อมูลต้องตรวจสิทธิ์ก่อนทำ business action

## 15. Code Style Rules

- TypeScript ต้องอยู่ใน strict mode
- ห้ามใช้ `any` ยกเว้นมีเหตุผลชัดเจนและจำกัดขอบเขต
- Function ที่เพิ่มใหม่ต้องมี comment ภาษาไทยตามกฎโปรเจกต์
- ชื่อไฟล์ใช้ kebab-case
- ชื่อ class ใช้ PascalCase
- ชื่อ variable, method, property ใช้ camelCase
- ใช้ dependency injection ของ NestJS ไม่สร้าง service เองด้วย `new`
- ห้ามใส่ business logic หนักใน controller
- ห้ามให้ repository รู้จัก HTTP layer

## 16. Database And ORM Rules

- ORM จะเลือกตาม requirement ของผู้ใช้เท่านั้น
- ห้ามเพิ่ม TypeORM, Prisma หรือ migration strategy เองโดยไม่ถามก่อน
- Entity/model ห้ามถูกส่งออกเป็น API response โดยตรง
- Database error ต้องถูก map เป็น business exception ที่เหมาะสม
- Migration ต้อง review แยกจาก code behavior เมื่อมีผลต่อ production data

## 17. Documentation Rules

- ถ้า API เปลี่ยน ต้องอัปเดต docs ที่เกี่ยวข้อง
- `docs/api-conventions.md` ใช้เก็บ convention ระยะยาว
- `docs/apidog-guide.md` ใช้เก็บ workflow sync และ import Apidog
- `docs/api-change-log.md` ใช้เก็บประวัติ API contract change
- `docs/project-rules.md` ใช้เก็บกฎการทำงานของโปรเจกต์และ AI assistant
- README ต้องบอก command หลักที่คนใหม่ต้องใช้ได้จริง

## 18. AI Assistant Rules

- ต้องอ่าน `docs/project-rules.md` และ `AGENTS.md` ก่อนเริ่มทำงาน
- ต้องตอบและทำงานทีละ phase เมื่อผู้ใช้กำหนด phase
- ต้องสรุปสิ่งที่ทำเสร็จก่อนข้าม phase
- ต้องเขียน code เต็ม ไม่ใช้ `...` ข้ามส่วนสำคัญ
- ทุก code block ที่ส่งให้ผู้ใช้ต้องบอก path file ชัดเจน
- ก่อนแก้ไฟล์ต้องบอกว่าจะเปลี่ยนอะไรแบบสั้น ๆ
- หลังแก้ไฟล์ต้องสรุปไฟล์ที่เปลี่ยนและคำสั่ง verify ที่รัน
- ห้ามเดาว่า dependency หรือ external service ล่าสุดเป็นอะไร ถ้าข้อมูลอาจเปลี่ยน ต้องตรวจจากแหล่งที่เชื่อถือได้ก่อน
- ห้ามรันคำสั่งที่ต้องใช้ network หรือแก้ระบบนอก workspace โดยไม่ขออนุญาต
- ห้ามรัน git เอง เว้นแต่ผู้ใช้สั่งชัดเจน

## 19. Done Criteria

งาน API หนึ่งชิ้นถือว่าเสร็จเมื่อ:

- Code behavior ทำงานตรง requirement
- DTO validation ครบ
- Swagger decorators ครบ
- Error response format ถูกต้อง
- Tests ที่เกี่ยวข้องผ่าน
- OpenAPI generate และ validate ผ่าน
- `openapi.yaml` และ `openapi.json` ตรงกับ code ล่าสุด
- Docs และ change log อัปเดตเมื่อ contract เปลี่ยน
- ไม่มี secret หรือข้อมูลลับหลุดใน code, log, docs หรือ OpenAPI
