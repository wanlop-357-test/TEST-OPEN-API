# Claude Instructions

ก่อนทำงานใน repository นี้ Claude ต้องอ่าน:

```text
docs/project-rules.md
AGENTS.md
```

กฎสำคัญ:

- ห้ามรันคำสั่ง `git` เองทุกกรณี ยกเว้นผู้ใช้สั่งชัดเจนในข้อความล่าสุด
- ห้าม commit, push, pull, merge, rebase, checkout, reset, stash หรือ tag เอง
- ห้าม revert changes ของผู้ใช้
- Code คือ source of truth
- Apidog เป็นพื้นที่แสดงผลและ sync จาก `openapi.yaml` เท่านั้น
- ห้ามแก้ `openapi.yaml` หรือ `openapi.json` ด้วยมือ
- ทุก endpoint ต้องมี Swagger decorators ครบ
- ทุก DTO ต้องมี validation และ `@ApiProperty` หรือ `@ApiPropertyOptional`
- ทุก error response ต้องใช้ format มาตรฐานของโปรเจกต์

ให้ทำตามรายละเอียดเต็มใน `docs/project-rules.md` เสมอ
