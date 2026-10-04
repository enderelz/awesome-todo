#!/usr/bin/env node

import { createTodo, loadTodos, updateTodo, deleteTodo } from "./storage.js";

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "--help":
  case "-h":
    printHelp();
    break;

  case "add": {
    const content = args.join(" ");
    if (!content) {
      console.error("Usage: todo add <text>");
      process.exit(1);
    }
    const todo = await createTodo(content);
    console.log(`Added #${todo.id}: ${todo.content}`);
    break;
  }

  case "list": {
    if (args.includes("-h") || args.includes("--help")) {
      console.log("Usage: todo list");
      break;
    }

    const todos = await loadTodos();

    if (todos.length === 0) {
      console.log(
        "Currently no todos exists. Create one with: todo add <text>",
      );
    }

    todos.forEach((t) => {
      console.log(`#${t.id} [${t.done ? "DONE" : "NOT DONE"}] > ${t.content}`);
    });

    break;
  }

  case "done": {
    if (args.includes("-h") || args.includes("--help")) {
      console.log("Usage: todo done <id>");
      break;
    }

    const id = Number(args[0]);
    if (!Number.isInteger(id)) {
      console.error("Expected an id.");
      process.exit(1);
    }

    const todo = await updateTodo(id, { done: true });
    console.log(todo ? `Completed #${id}` : `Todo #${id} not found`);

    break;
  }

  case "remove": {
    if (args.includes("-h") || args.includes("--help")) {
      console.log("Usage: todo remove <id>");
      break;
    }

    const id = Number(args[0]);
    if (!Number.isInteger(id)) {
      console.error("Expected an id.");
      process.exit(1);
    }

    const ok = await deleteTodo(id);
    console.log(ok ? `Deleted #${id}` : `Todo #${id} not found`);

    break;
  }

  default:
    printHelp();
}

function printHelp() {
  console.log(`
Usage: todo <command> [args]

Commands:
  add <text>     Create a new todo
  list           List all todos
  remove <id>    Remove the todo with the given ID
  done <id>      Mark the todo with the given ID as done

Options:
  -h, --help     Show this help message
    `);
}
