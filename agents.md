# wp-kanban

WordPress Kanban Board Block plugin.

## Development Commands

- `npm install` - Install dependencies
- `npm run build` - Build for production
- `npm run start` - Start development watcher
- `npm run lint:js` - Lint JavaScript
- `npm run lint:css` - Lint CSS
- `npm run format` - Format code
- `npm run plugin-zip` - Create plugin zip
- `npm run commit` - Create conventional commit (interactive)
- `npm run commit:push` - Commit and push atomically (interactive)

## Commit Workflow

The project uses **conventional commits** with husky and commitlint:

```bash
# Interactive commit (recommended)
npm run commit

# Or manual commit with:
git add -A
git commit -m "type: description"

# Commit and push in one command
npm run commit:push
```

Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Project Structure

- `telex-kanban-board.php` - Main plugin (CPT, taxonomy, REST API)
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
- REST API under `/wp/v2/kanban-*` and `/telex-kanban/v1/`

## Requirements

- Node.js >= 20.0.0
- npm >= 8.0.0
