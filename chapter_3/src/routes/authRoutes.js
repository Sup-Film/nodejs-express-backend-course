import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import db from "../db.js";

const router = express.Router();

const registerSchema = z.object({
  username: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

router.post("/register", (req, res) => {
  // Validate ข้อมูลที่ส่งมาด้วย Zod
  const parsed = registerSchema.safeParse(req.body);
  // ตรวจสอบผลลัพธ์การ validate
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  // ข้อมูลที่ผ่านการ validate แล้ว
  const { username, password } = parsed.data;
  const existingUser = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  if (existingUser)
    return res.status(409).json({ message: "Username already exists" });

  // Encrypt password ด้วย bcrypt
  const hashedPassword = bcrypt.hashSync(password, 8);

  // บันทึก username และ hashedPassword ลงฐานข้อมูล
  try {
    const insertUser = db.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)"
    );
    const result = insertUser.run(username, hashedPassword);

    const defaultTodo = `Hello :) Add your first todo!`;
    const insertTodo = db.prepare(
      "INSERT INTO todos (user_id, task) VALUES (?, ?)"
    );
    insertTodo.run(result.lastInsertRowid, defaultTodo);

    // สร้าง JWT token
    const token = jwt.sign(
      { id: result.lastInsertRowid },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    console.log(error.message);
    if (error.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ message: "Username already exists" });
    }

    return res.status(503).json({
      message: "Service temporarily unavailable",
    });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Select ข้อมูล user ที่ตรงกับ username ที่ส่งมา
    const getUser = db.prepare("SELECT * FROM users WHERE username = ?");
    const user = getUser.get(username);
    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    console.log(error.message);
    return res.status(503).json({
      message: "Service temporarily unavailable",
    });
  }
});

export default router;
