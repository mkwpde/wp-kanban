# wp-kanban

WordPress Kanban Board Block plugin.

## General Guidelines

- Always commit and push changes after completing tasks

## Development Commands

- `npm install` - Install dependencies
- `npm run build` - Build for production
- `npm run start` - Start development watcher
- `npm run lint:js` - Lint JavaScript
- `npm run lint:css` - Lint CSS
- `npm run format` - Format code
- `npm run plugin-zip` - Create plugin zip
- `npm run commit` - Create commit (opens editor)
- `npm run commit:push` - Commit and push atomically

## Commit Workflow

The project uses **conventional commits** with husky and commitlint:

```bash
# Manual commit (opens editor)
npm run commit

# Or manual commit with:
git add -A
git commit -m "type: description"

# Commit and push in one command
npm run commit:push
```

Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore` (lowercase)

## Project Structure

- `plugin.php` - Main plugin (CPT, taxonomy, REST API)
- `src/index.js` - Block registration
- `src/edit.js` - Editor component
- `src/save.js` - Save component
- `src/block.json` - Block metadata
- `src/style.scss` / `src/editor.scss` - Styles
- `.husky/` - Git hooks
- `commitlint.config.js` - Commit message rules

## Key Features

- Custom post type: `kanban_task`
- Custom taxonomy: `kanban_column`
- REST API under `/wp/v2/kanban-*` and `/mkwpde-kanban/v1/`

## Requirements

- Node.js >= 20.0.0
- npm >= 8.0.0
