# AI Agent Instructions

AI assistant ทุกตัวที่ทำงานใน repository นี้ต้องอ่านและทำตามกฎในไฟล์นี้ก่อนเริ่มแก้ code หรือรันคำสั่งใด ๆ

## Required Reading

ต้องอ่านไฟล์เหล่านี้ก่อนทำงาน:

1. `docs/project-rules.md`
2. `docs/api-conventions.md`
3. `docs/apidog-guide.md` ถ้างานเกี่ยวกับ OpenAPI, Swagger หรือ Apidog
4. `docs/api-change-log.md` ถ้างานเปลี่ยน API contract

## Non-Negotiable Rules

- ห้ามรันคำสั่ง `git` เองทุกกรณี ยกเว้นผู้ใช้สั่งชัดเจนในข้อความล่าสุด
- ห้าม commit, push, pull, merge, rebase, checkout, reset, stash หรือ tag เอง
- ห้าม revert หรือ overwrite changes ที่ผู้ใช้ทำไว้
- Code คือ source of truth
- ห้ามแก้ `openapi.yaml` หรือ `openapi.json` ด้วยมือ
- API change ต้องเริ่มจาก NestJS code แล้วค่อย generate OpenAPI
- ทุก endpoint ต้องมี Swagger decorators ครบ
- ทุก DTO ต้องมี validation และ `@ApiProperty` หรือ `@ApiPropertyOptional`
- ทุก error response ต้องใช้ format มาตรฐานของโปรเจกต์
- ห้าม hardcode secret, token, API key หรือ DSN
- ต้องทำงานทีละ phase เมื่อผู้ใช้กำหนด phase

## Before Editing

ก่อนแก้ไฟล์ AI assistant ต้อง:

1. อ่าน `docs/project-rules.md`
2. ตรวจ scope ของงานจากข้อความล่าสุดของผู้ใช้
3. บอกสั้น ๆ ว่าจะเปลี่ยนไฟล์หรือส่วนไหน
4. แก้เฉพาะสิ่งที่จำเป็นต่อ requirement

## After Editing

หลังแก้ไฟล์ AI assistant ต้องสรุป:

1. ไฟล์ที่เปลี่ยน
2. สิ่งที่ทำเสร็จ
3. คำสั่ง verify ที่รัน
4. เหตุผลถ้าไม่ได้รัน test, build หรือ OpenAPI validation

รายละเอียดทั้งหมดอยู่ใน `docs/project-rules.md`
