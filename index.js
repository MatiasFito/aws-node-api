const { response } = require("express");
const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_request, response) => {
  response.send("Hello, world!");
});

app.get("/todos", (request, response) => {
  const showPending = request.query.showpending;

  fs.readFile("./store/todos.json", "utf-8", (err, data) => {
    if (err) {
      return response.status(500).send("Sorry, somethin went wrong.");
    }

    const todos = JSON.parse(data);
    if (showPending !== "1") {
      return response.json({ todos: todos });
    }

    const fileteredList = todos.filter((todo) => todo.complete === false);
    return response.json({ todos: fileteredList });
  });
});

app.put("/todos/:id/complete", (request, response) => {
  const id = parseInt(request.params.id, 10);

  fs.readFile("./store/todos.json", "utf-8", (err, data) => {
    if (err) {
      return response
        .status(500)
        .send("Sorry, somethin went wrong when reading the Todos.");
    }

    const todos = JSON.parse(data);
    const todo = todos.find((_todo) => _todo.id === id);

    if (!todo) {
      return response
        .status(404)
        .send(`Todo not found. Params: ${request.params}`);
    }

    todo.complete = true;

    fs.writeFile("./store/todos.json", JSON.stringify(todos), () => {
      return response.json({ status: "ok", todos: todos });
    });
  });
});

app.post("/todos", (request, response) => {
  if (!request.body.name) {
    return response.status(400).send('Missing "name"');
  }

  fs.readFile("./store/todos.json", "utf-8", (err, data) => {
    if (err) {
      return response
        .status(500)
        .send("Sorry, somethin went wrong when reading the Todos.");
    }

    const todos = JSON.parse(data);
    const maxId = Math.max.apply(
      Math,
      todos.map((todo) => todo.id)
    );

    todos.push({
      id: maxId + 1,
      name: request.body.name,
      complete: false,
    });

    fs.writeFile("./store/todos.json", JSON.stringify(todos), () => {
      return response.json({ status: "ok", todos: todos });
    });
  });
});

app.listen(3000, () => {
  console.log("Application running on http://localhost:3000");
});
