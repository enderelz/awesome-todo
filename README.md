# awesome-todo

A simple command-line todo app, built for learning purposes. Not intended for production use.

## Usage

```
todo <command> [args]
```

| Command            | Description                             |
| ------------------ | --------------------------------------- |
| `todo add <text>`  | Create a new todo                       |
| `todo list`        | List all todos                          |
| `todo remove <id>` | Remove the todo with the given ID       |
| `todo done <id>`   | Mark the todo with the given ID as done |

## Example

```
$ todo add "Buy milk"
$ todo list
$ todo done 1
$ todo remove 1
```
