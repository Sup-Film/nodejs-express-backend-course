const express = require("express");
const app = express();
const PORT = 3000;

let data = {
  users: [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
  ],
  posts: [
    { id: 1, title: "First Post", content: "This is the first post." },
    { id: 2, title: "Second Post", content: "This is the second post." },
  ],
};

// Middleware
app.use(express.json()); // Parse JSON bodies

// ENDPOINT - HTTP VERBS (method) && Routes

app.get("/", (req, res) => {
  console.log(`Method: ${req.method}, URL: ${req.url}`);
  res.json({
    message: "GET request to the homepage",
    users: data["users"],
    posts: data["posts"],
    timestamp: new Date().toISOString(),
  });
});

app.get("/dashboard", (req, res) => {
  console.log(`Method: ${req.method}, URL: ${req.url}`);
  res.json({
    message: "GET request to the dashboard",
    timestamp: new Date().toISOString(),
  });
});

// API Endpoints CRUD - create, read, update, delete

app.get("/api/data", (req, res) => {
  console.log(`Method: ${req.method}, URL: ${req.url}`);
  res.json({
    message: "GET request to fetch data",
    users: data["users"],
    posts: data["posts"],
  });
});

app.post("/api/data", (req, res) => {
  const newData = req.body;
  console.log(`Method: ${req.method}, URL: ${req.url}`);

  data["users"].push(...newData["users"]);
  data["posts"].push(...newData["posts"]);

  res.status(201).json({
    message: "POST request to create data",
    users: newData["users"],
    posts: newData["posts"],
  });

  console.log(`Updated Data:`, data);
});

app.put("/api/data", (req, res) => {
  console.log(`Method: ${req.method}, URL: ${req.url}`);

  const { users, posts } = req.body;
  if (!users || !posts) {
    return res.status(400).json({ message: "Invalid data format" });
  }

  users.map((user) => {
    const existingUser = data.users.find((u) => u.id === user.id);
    if (existingUser) {
      existingUser.name = user.name;
    } else {
      res.status(404).json({ message: `User with id ${user.id} not found` });
    }
  });

  posts.map((post) => {
    const existingPost = data.posts.find((p) => p.id === post.id);
    if (existingPost) {
      existingPost.title = post.title;
      existingPost.content = post.content;
    } else {
      res.status(404).json({ message: `Post with id ${post.id} not found` });
    }
  });

  console.log(`Updated Data:`, data);
  res.status(200).json({
    message: "Replaced entire dataset",
    users: data.users,
    posts: data.posts,
  });
});

app.delete("/api/data", (req, res) => {
  console.log(`Method: ${req.method}, URL: ${req.url}`);

  data = {
    users: [],
    posts: [],
  };

  res.status(203).json({
    message: "DELETE request to remove all data",
  });

  console.log(`Updated Data:`, data);
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT} ...`);
});
