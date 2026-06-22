# WEBPORT Redesign — "Liquid Playful, Professional Core"

วันที่: 2026-06-22
เจ้าของ: Por Diewtrakul
ขอบเขต: รีดีไซน์เว็บ portfolio (static HTML/CSS/JS) — เปลี่ยนหน้าตา + จัด layout + ซ่อมบั๊ก

## เป้าหมาย
เว็บเดิมเป็น minimal/clean สว่าง เจ้าของเบื่อหน้าตาเดิม อยากได้แนว playful/colorful
ที่ยังดูมือโปร เหมาะยื่นสมัครฝึกงาน BA / SA / Full Stack

## หลักการออกแบบ
**"เอฟเฟกต์เป็นเครื่องปรุง ไม่ใช่จานหลัก"** — ได้บุคลิก playful จาก *สีและดีไซน์*
มากกว่า *การเคลื่อนไหว* UX ต้องสะอาด อ่านง่าย ใช้ง่าย เป็นอันดับแรก

กฎที่ยึด:
- เอฟเฟกต์ทุกตัว subtle — สังเกตได้แต่ไม่สะดุดสายตา ไม่หน่วง
- transition สั้น 150–250ms
- เนื้อหา/ตัวอักษร/ปุ่ม = ความชัดมาก่อนความสวยเสมอ
- เคารพ `prefers-reduced-motion` → ปิดเอฟเฟกต์อัตโนมัติ
- ไม่เพิ่ม dependency ไม่ต้อง build → deploy Vercel ได้ทันที (คงโครงไฟล์เดิม)

## ระบบสี (Blue + Cyan)
- Gradient หลัก: `#2563EB` → `#06B6D4` → highlight `#22D3EE`
- Light: พื้น `#F8FAFC`, ข้อความ `#0F172A`
- Dark: พื้น `#0A0F1E`, gradient เรืองชัดขึ้น
- เก็บปุ่ม toggle dark/light ไว้ รองรับสองโหมด (จำค่าใน localStorage เหมือนเดิม)

## เอฟเฟกต์ Jelly (CSS/SVG ล้วน — ไม่มี WebGPU)
ตัดสินใจ: ไม่ใช้ TypeGPU/WebGPU จริง เพราะต้องมี bundler, WebGPU ไม่รองรับทุก
browser/มือถือ, หนัก GPU, และ code ที่ให้มาเป็น slider ไม่ใช่ toggle → เสี่ยงจอดำ
ตอน HR เปิด ใช้ CSS/SVG จับ "วิบ" แทน:
- **Gooey blob** จางๆ 1–2 ก้อนหลัง hero เคลื่อนช้ามาก (SVG `feGaussianBlur` +
  `feColorMatrix`) เป็น background เฉยๆ ไม่แย่งสายตา
- **Hover นุ่มๆ** บน card/chip/ปุ่ม: ยกขึ้น + เงา ไม่เด้งโจ๊ะ
- **Toggle** สลับ icon นุ่มๆ ไม่ทำหยดน้ำไหล
- section เนื้อหา = สะอาด ไม่มีเอฟเฟกต์รบกวน

## Layout (เนื้อหาเดิม จัดใหม่)
| Section | การเปลี่ยน |
|---------|-----------|
| Hero | ชื่อใหญ่ + gooey blob bg จางๆ + ปุ่ม Resume กดได้ (รอลิงก์) |
| About | คงโครง 2 คอลัมน์ + info card hover นุ่ม |
| Skills | chip โทน gradient hover นุ่ม |
| Work | การ์ดดีไซน์ใหม่ + GitHub auto-fetch + fallback เมื่อ API ล่ม |
| Contact | คง copy-to-clipboard + เติม LinkedIn |

## ซ่อมบั๊ก (5)
1. ปุ่ม Resume กดได้ — ทำปุ่มพร้อม `href` placeholder ใส่ลิงก์ทีหลังง่าย (เจ้าของยังไม่มี PDF)
2. LinkedIn = https://www.linkedin.com/in/por-diewtrakul-378837418/
3. fade-in: `main.js` เดิม observe คลาส (`.skill-card .project-card .stat
   .contact-card .section-title`) ที่ไม่มีใน HTML → แก้ให้ observe คลาสที่มีจริง
4. Work section: เพิ่ม fallback การ์ดเมื่อ GitHub API ล่ม/rate limit (ไม่ขึ้นจอโล่ง)
5. อัปเดตปี 2025 → 2026 (hero tag + footer)

## โครงไฟล์ (ไม่เปลี่ยน)
`index.html` + `style.css` + `main.js` + `vercel.json` — ไม่เพิ่ม dependency

## Out of scope
- ไม่เพิ่ม section ใหม่ (Experience/Education timeline ฯลฯ) — ไว้รอบหน้า
- ไม่ใช้ WebGPU/build step
- ไม่ทำ resume PDF (เจ้าของเตรียมเอง)
