import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// หมายเหตุ: ใน ESM (ไฟล์ที่ใช้ import/export) ไม่มีตัวแปร __filename และ __dirname ให้มาโดยตรง
// บรรทัดต่อไปนี้คือวิธีสร้างค่าดังกล่าวด้วยตนเอง

// แปลง URL ของโมดูลปัจจุบัน (import.meta.url) ให้เป็นพาธไฟล์ของระบบ
// ตัวอย่างผลลัพธ์: /.../chapter_3/src/server.js (พร้อมใช้งานกับ API ของ path/fs)
const __filename = fileURLToPath(import.meta.url);

// ดึงพาธของโฟลเดอร์ที่ไฟล์นี้อยู่ จากพาธไฟล์ข้างบน
// ตัวอย่างผลลัพธ์: /.../chapter_3/src
const __dirname = dirname(__filename);

// ประกอบพาธแบบข้ามแพลตฟอร์ม ไปยังไฟล์ public/index.html ที่อยู่ใต้โฟลเดอร์ของไฟล์นี้
// ใช้ path.join เพื่อให้ทำงานได้ทั้งบน Windows, macOS และ Linux
const pathToIndex = path.join(__dirname, "public", "index.html");

// เซิร์ฟเวอร์จะให้บริการไฟล์สแตติกจากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, "../public")));

// Middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(pathToIndex);
});

// Routes
app.use("/auth", authRoutes);
app.use("/todos", authMiddleware, todoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
