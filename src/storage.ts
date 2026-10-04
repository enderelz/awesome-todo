import path from "path";
import type { Todo, StorageFile } from "./types.js";
import os from "os";
import fs from "fs/promises";

const LATEST_VERSION = 2;
const storageFile = path.join(os.homedir(), ".awesome-todo.json");

export async function loadTodos(): Promise<Todo[]> {
  try {
    const file = await fs.readFile(storageFile, "utf8");
    let data = JSON.parse(file);
    let version = Array.isArray(data) ? 1 : (data.version ?? 1);

    if (version < LATEST_VERSION) {
      await fs.copyFile(storageFile, `${storageFile}.bak`);
    }

    while (version < LATEST_VERSION) {
      const migrate = migrations[version];
      if (!migrate) throw new Error(`No migration from v${version}.`);
      data = migrate(data);
      version = data.version;
    }

    if (version > LATEST_VERSION) {
      throw new Error("Data file is from a newer version. Please update.");
    }

    return data.todos;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}
export async function saveTodos(todos: Todo[]): Promise<void> {
  await fs.writeFile(
    storageFile,
    JSON.stringify({ version: LATEST_VERSION, todos }, null, 2),
  );
}

export async function getTodo(id: number): Promise<Todo | undefined> {
  const todos = await loadTodos();
  return todos.find((t) => t.id === id);
}

export async function deleteTodo(id: number): Promise<boolean> {
  const todos = await loadTodos();

  const updatedTodos = todos.filter((todo) => todo.id !== id);

  if (updatedTodos.length === todos.length) return false;

  await saveTodos(updatedTodos);
  return true;
}

export async function updateTodo(
  id: number,
  changes: Partial<Pick<Todo, "content" | "done">>,
): Promise<Todo | undefined> {
  const todos = await loadTodos();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return undefined;

  Object.assign(todo, changes);
  await saveTodos(todos);
  return todo;
}

export async function createTodo(content: string): Promise<Todo> {
  const todos = await loadTodos();
  const id = (todos.at(-1)?.id ?? 0) + 1;
  const todo: Todo = { id, content, done: false };
  todos.push(todo);
  await saveTodos(todos);
  return todo;
}

const migrations: Record<number, (data: any) => StorageFile> = {
  1: (todos) => ({ version: 2, todos }),
};
