# wp-kanban

WordPress Kanban Board Block plugin.

## Development Commands

- `npm install` - Install dependencies
- `npm run build` - Build for production
- `npm start` - Start development watcher
- `npm run lint:js` - Lint JavaScript
- `npm run lint:css` - Lint CSS
- `npm run format` - Format code
- `npm run plugin-zip` - Create plugin zip

## Project Structure

- `telex-kanban-board.php` - Main plugin (CPT, taxonomy, REST API)
- `src/index.js` - Block registration
- `src/edit.js` - Editor component
- `src/save.js` - Save component
- `src/block.json` - Block metadata
- `src/style.scss` / `src/editor.scss` - Styles

## Key Features

- Custom post type: `kanban_task`
- Custom taxonomy: `kanban_column`
- REST API under `/wp/v2/kanban-*` and `/telex-kanban/v1/`
