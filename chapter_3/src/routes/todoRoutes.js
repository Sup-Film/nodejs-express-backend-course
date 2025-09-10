import express from "express";
import { z } from "zod";
import db from "../db.js";

const router = express.Router();

const todoSchema = z.object({
  task: z.string().min(1, "Task is required"),
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const todoUpdateSchema = z.object({
  completed: z.number().int().min(0).max(1).optional(),
});

// GET /todos
// POST /todos
// PUT /todos/:id
// DELETE /todos/:id

router.get("/", (req, res) => {
  const getTodos = db.prepare("SELECT * FROM todos WHERE user_id = ?");
  const todos = getTodos.all(req.userId);
  res.json(todos);
});

router.post("/", (req, res) => {
  const parseResult = todoSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const { task } = parseResult.data;

  const createTodo = db.prepare(
    "INSERT INTO todos (user_id, task) VALUES (?, ?)"
  );
  createTodo.run(req.userId, task);

  res.status(201).json({
    id: createTodo.lastID,
    task,
    completed: 0,
  });
});

router.put("/:id", (req, res) => {
  const paramsParseResult = paramsSchema.safeParse(req.params);
  if (!paramsParseResult.success) {
    return res.status(400).json({ message: "Invalid ID parameter" });
  }

  const bodyParseResult = todoUpdateSchema.safeParse(req.body);
  if (!bodyParseResult.success) {
    const errors = bodyParseResult.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const { id } = paramsParseResult.data;
  const { completed } = bodyParseResult.data;
  const { page } = req.query;

  const updatedTodo = db.prepare("UPDATE todos SET completed = ? WHERE id = ?");
  updatedTodo.run(completed, id);

  res.json({ message: "Todo updated" });
});

router.delete("/:id", (req, res) => {
  const paramsParse = paramsSchema.safeParse(req.params);
  if (!paramsParse.success) {
    return res.status(400).json({ message: "Invalid ID parameter" });
  }

  const { id } = paramsParse.data;
  const deleteTodo = db.prepare(
    "DELETE FROM todos WHERE id = ? AND user_id = ?"
  );
  deleteTodo.run(id, req.userId);

  res.json({ message: "Todo deleted" });
});

export default router;
