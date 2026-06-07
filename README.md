# Workspaces - Productivity Web App

A multi-mode productivity web application that lets you boost workflow and productivity. Switch between different workspace modes to organize tasks, brainstorm ideas, write code, and more.

## Features

### Modes

1. **Kanban Board** - Organize tasks in a visual workflow with three columns: To Do, Doing, Done
2. **Sticky Notes** - Create and arrange yellow sticky notes on a canvas
3. **Drawing Canvas** - Express creativity with pen, eraser, lines, shapes, and fill tools
4. **Text Editor** - Full-screen writing environment with text formatting
5. **Code Editor** - Write and save code in multiple programming languages
6. **Flow Diagram** - Create visual flowcharts and workflows (basic version)

### General Features

- **Multi-Tab System** - Create and switch between multiple workspace instances
- **Light/Dark Mode** - Toggle between light and dark themes with custom presets
- **AI Assistant** - Toggle sidebar for AI-powered brainstorming and workflow assistance (framework ready)
- **Project Persistence** - Save projects as `.ws` files containing all tabs and data
- **Responsive Design** - Works on desktop and tablet devices

## Getting Started

1. Open `index.html` in a web browser
2. The app uses LocalStorage to save projects automatically
3. Click the **+** button to create a new workspace tab
4. Select a mode from the left sidebar
5. Click **"Go to workspace mode"** to enter that mode
6. Use the **☀️/🌙** button to toggle light/dark mode
7. Click **🤖 AI Assistant** to toggle the AI sidebar

## Project Structure

```
Workspaces/
├── index.html       # Main HTML file
├── styles.css       # Styling and themes
├── app.js          # Application logic
└── README.md       # This file
```

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: Browser LocalStorage
- **Canvas**: HTML5 Canvas API (for drawing mode)

## Keyboard Shortcuts

- **P** - Pen tool (Draw mode)
- **E** - Eraser tool (Draw mode)
- **L** - Line tool (Draw mode)
- **S** - Square tool (Draw mode)
- **C** - Circle tool (Draw mode)
- **F** - Fill tool (Draw mode)

## File Format

Projects are saved in `.ws` format (JSON-based) containing:
- All workspace tabs
- Tab modes and their specific data
- User preferences (theme, AI assistant state)

## Roadmap

- [ ] Syntax highlighting for code editor
- [ ] Autocomplete for code editor
- [ ] Advanced flow diagram features
- [ ] AI assistant integration
- [ ] Export projects to various formats
- [ ] Collaboration features
- [ ] Cloud sync

## Contributing

This is a work in progress. Feel free to suggest features and improvements!

## License

MIT