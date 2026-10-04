export interface StorageFile {
  version: number;
  todos: Todo[];
}

export interface Todo {
  id: number;
  content: string;
  done: boolean;
}
