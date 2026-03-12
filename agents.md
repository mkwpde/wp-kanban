# wp-kanban

WordPress Kanban Board Block plugin.

## General Guidelines

- Always commit and push changes after completing tasks
- Always use the `gh` CLI for GitHub operations (issues, PRs, etc.) - never use curl for GitHub API calls

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

```bash
# Add and commit (bypassing husky hooks which have a compatibility issue)
git add -A
git commit --no-verify -m "type: description"

# Push to remote
git push https://mkwpde:$(gh auth token)@github.com/mkwpde/wp-kanban.git main

# Or if git remote is set:
git push
```

Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore` (lowercase)

## Project Structure

- `plugin.php` - Main plugin (CPT, taxonomy, REST API)
- `src/index.js` - Block registration
- `src/edit.js` - Editor component
- `src/save.js` - Save component
- `src/view.js` - Frontend view script
- `src/render.php` - Server-side render callback
- `src/block.json` - Block metadata
- `src/style.scss` / `src/editor.scss` - Styles
- `.husky/` - Git hooks (currently has compatibility issue - see commit workflow)

## Key Features

- Custom post type: `kanban_task`
- Custom taxonomy: `kanban_column`
- REST API under `/wp/v2/kanban-*` and `/mkwpde-kanban/v1/`

## Requirements

- Node.js >= 20.0.0
- npm >= 8.0.0
