import express from "express";
import { z } from "zod";
import prisma from "../prismaClient.js";

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

router.get("/", async (req, res) => {
  const todos = await prisma.todo.findMany({
    where: {
      userId: req.userId,
    },
  });
  res.json(todos);
});

router.post("/", async (req, res) => {
  const parseResult = todoSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errors = parseResult.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const { task } = parseResult.data;

  const createTodo = await prisma.todo.create({
    data: {
      userId: req.userId,
      task: task,
    },
  });

  res.status(201).json({
    id: createTodo.id,
    task,
    completed: 0,
  });
});

router.put("/:id", async (req, res) => {
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

  const updateTodo = await prisma.todo.updateMany({
    where: {
      id: id,
      userId: req.userId,
    },
    data: {
      completed: !!completed,
    },
  });

  res.json({ message: "Todo updated" });
});

router.delete("/:id", async (req, res) => {
  const paramsParse = paramsSchema.safeParse(req.params);
  if (!paramsParse.success) {
    return res.status(400).json({ message: "Invalid ID parameter" });
  }

  const { id } = paramsParse.data;
  await prisma.todo.delete({
    where: {
      id: id,
      userId: req.userId,
    },
  });

  res.json({ message: "Todo deleted" });
});

export default router;
