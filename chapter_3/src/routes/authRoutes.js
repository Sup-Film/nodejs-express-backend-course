import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

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
    return res.status(500).json({
      message: "Server error",
    });
  }

  // res.status(201).json({ message: "User registered" });
});

router.post("/login", (req, res) => {});

export default router;
