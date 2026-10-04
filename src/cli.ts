#!/usr/bin/env node

import {
  createTodo,
  loadTodos,
  getTodo,
  updateTodo,
  deleteTodo,
} from "./storage.js";
import { createRequire } from "module";

const { version } = createRequire(import.meta.url)("../package.json");
const [command, ...args] = process.argv.slice(2);

const PAGE_SIZE = 10;

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});

async function main() {
  switch (command) {
    case undefined:
    case "--help":
    case "-h":
      printHelp();
      break;

    case "--version":
    case "-v":
      console.log(version);
      break;

    case "add": {
      const content = args.join(" ");
      if (!content) fail("Usage: todo add <text>");

      const todo = await createTodo(content);
      console.log(`Added #${todo.id}: "${todo.content}"`);
      break;
    }

    case "list": {
      if (args.includes("-h") || args.includes("--help")) {
        console.log("Usage: todo list [page]");
        break;
      }

      const page = parsePositiveInt(args[0] ?? "1");
      if (page === undefined) {
        fail(`Invalid page: "${args[0]}". Expected a positive number.`);
      }

      const todos = await loadTodos();

      if (todos.length === 0) {
        console.log("No todos yet. Add one with: todo add <text>");
        break;
      }

      const totalPages = Math.ceil(todos.length / PAGE_SIZE);
      if (page > totalPages) {
        fail(`Page ${page} doesn't exist. There are ${totalPages} page(s).`);
      }

      const start = (page - 1) * PAGE_SIZE;
      todos.slice(start, start + PAGE_SIZE).forEach((t) => {
        console.log(`#${t.id} [${t.done ? "x" : " "}] ${t.content}`);
      });

      if (totalPages > 1) {
        const next = page < totalPages ? ` (next: todo list ${page + 1})` : "";
        console.log(`\nPage ${page}/${totalPages}${next}`);
      }

      break;
    }

    case "done": {
      if (args.includes("-h") || args.includes("--help")) {
        console.log("Usage: todo done <id>");
        break;
      }

      const id = parseId("done", args[0]);

      const todo = await getTodo(id);
      if (!todo) fail(`Todo #${id} not found.`);

      if (todo.done) {
        console.log(`#${id} is already done.`);
        break;
      }

      await updateTodo(id, { done: true });
      console.log(`Completed #${id}.`);

      break;
    }

    case "remove": {
      if (args.includes("-h") || args.includes("--help")) {
        console.log("Usage: todo remove <id>");
        break;
      }

      const id = parseId("remove", args[0]);

      const ok = await deleteTodo(id);
      if (!ok) fail(`Todo #${id} not found.`);

      console.log(`Deleted #${id}.`);

      break;
    }

    default:
      console.error(`Unknown command: ${command}\n`);
      printHelp(console.error);
      process.exit(1);
  }
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function parsePositiveInt(raw: string): number | undefined {
  const n = Number(raw);
  return raw.trim() !== "" && Number.isInteger(n) && n >= 1 ? n : undefined;
}

function parseId(cmd: string, raw: string | undefined): number {
  if (raw === undefined) fail(`Usage: todo ${cmd} <id>`);

  const id = parsePositiveInt(raw);
  if (id === undefined) fail(`Invalid id: "${raw}". Expected a positive number.`);

  return id;
}

function printHelp(print: (msg: string) => void = console.log) {
  print(`Usage: todo <command> [args]

Commands:
  add <text>     Create a new todo
  list [page]    List todos, ${PAGE_SIZE} per page
  remove <id>    Remove the todo with the given ID
  done <id>      Mark the todo with the given ID as done

Options:
  -h, --help     Show this help message
  -v, --version  Show the version number`);
}
