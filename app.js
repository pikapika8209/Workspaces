// ============================================================================
// WORKSPACES - Main Application Logic
// ============================================================================

class WorkspacesApp {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.currentMode = null;
        this.isDarkMode = false;
        this.workspaceData = {};
        this.drawState = {
            isDrawing: false,
            tool: 'pen',
            color: '#000000',
            brushSize: 3
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadThemePreference();
        this.loadOrCreateProject();
    }

    // ========================================================================
    // THEME MANAGEMENT
    // ========================================================================

    loadThemePreference() {
        const savedTheme = localStorage.getItem('workspaces-theme');
        if (savedTheme === 'dark') {
            this.toggleTheme();
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        const html = document.documentElement;
        
        if (this.isDarkMode) {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('workspaces-theme', 'dark');
            document.getElementById('themeToggleBtn').textContent = '🌙';
        } else {
            html.removeAttribute('data-theme');
            localStorage.setItem('workspaces-theme', 'light');
            document.getElementById('themeToggleBtn').textContent = '☀️';
        }
    }

    // ========================================================================
    // MODE DESCRIPTIONS
    // ========================================================================

    getModeDescription(mode) {
        const descriptions = {
            kanban: {
                title: 'Kanban Board',
                description: 'Organize your tasks in a visual workflow with three columns: To Do, Doing, and Done. Drag cards between columns to track progress and manage your workflow efficiently.',
                features: [
                    'Create cards with title and description',
                    'Drag and drop between columns',
                    'Right-click to add, edit, or delete cards',
                    'Move cards through workflow stages'
                ]
            },
            notes: {
                title: 'Sticky Notes',
                description: 'Create and organize sticky notes on a canvas. Drag notes around, resize them, and customize their colors to match your workflow.',
                features: [
                    'Create yellow sticky notes',
                    'Drag notes to reposition',
                    'Resize notes as needed',
                    'Change note colors',
                    'Right-click for options'
                ]
            },
            draw: {
                title: 'Drawing Canvas',
                description: 'Express your creativity with a simple drawing tool. Use various tools like pen, eraser, shapes, and fill to create sketches and diagrams.',
                features: [
                    'Tools: Pen, Eraser, Line, Square, Circle, Fill',
                    'Adjustable brush size',
                    'Color picker for brush color',
                    'Keyboard shortcuts for quick access'
                ]
            },
            'text-editor': {
                title: 'Text Editor',
                description: 'Write and format text with a full-screen editor. Apply text formatting and customize text colors for different sections of your writing.',
                features: [
                    'Full-screen text editing',
                    'Text color customization',
                    'Color presets and custom color picker',
                    'Professional writing environment'
                ]
            },
            coding: {
                title: 'Code Editor',
                description: 'Write and save code in multiple programming languages. Save your code as .py, .js, .html, .css, .txt and more.',
                features: [
                    'Support for multiple file types',
                    'Save code files locally',
                    'Clean code editing interface',
                    'Syntax highlighting (coming soon)',
                    'Autocomplete (coming soon)'
                ]
            },
            flow: {
                title: 'Flow Diagram',
                description: 'Create visual flow diagrams with nodes and connections. Plan processes, workflows, and logic flows visually.',
                features: [
                    'Flow nodes, Decision nodes, End nodes',
                    'Drag to position nodes',
                    'Visual workflow planning',
                    'More features coming soon'
                ]
            }
        };

        return descriptions[mode] || {
            title: 'Unknown Mode',
            description: 'Select a mode to get started',
            features: []
        };
    }

    updateModeDescription(mode) {
        const desc = this.getModeDescription(mode);
        const contentDiv = document.getElementById('descriptionContent');
        
        let features = '';
        if (desc.features.length > 0) {
            features = '<ul>' + desc.features.map(f => `<li>${f}</li>`).join('') + '</ul>';
        }

        contentDiv.innerHTML = `
            <h3>${desc.title}</h3>
            <p>${desc.description}</p>
            ${features}
        `;
    }

    // ========================================================================
    // TAB MANAGEMENT
    // ========================================================================

    createNewTab() {
        const tabId = Date.now().toString();
        const mode = this.currentMode || 'kanban';
        
        const tab = {
            id: tabId,
            mode: mode,
            name: `${mode.toUpperCase()} - ${this.tabs.length + 1}`,
            data: this.getEmptyModeData(mode)
        };

        this.tabs.push(tab);
        this.switchToTab(tabId);
        this.renderTabs();
    }

    switchToTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        this.activeTabId = tabId;
        this.currentMode = tab.mode;
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab-id="${tabId}"]`)?.classList.add('active');
        
        this.renderWorkspace();
    }

    closeTab(tabId) {
        const index = this.tabs.findIndex(t => t.id === tabId);
        if (index > -1) {
            this.tabs.splice(index, 1);
        }

        if (this.activeTabId === tabId && this.tabs.length > 0) {
            this.switchToTab(this.tabs[0].id);
        } else if (this.tabs.length === 0) {
            this.activeTabId = null;
            this.currentMode = null;
            this.renderWorkspace();
        }

        this.renderTabs();
    }

    renderTabs() {
        const tabsContainer = document.getElementById('tabsContainer');
        const tabs = document.querySelector('.tabs');
        tabs.innerHTML = '';

        this.tabs.forEach(tab => {
            const tabEl = document.createElement('div');
            tabEl.className = `tab ${tab.id === this.activeTabId ? 'active' : ''}`;
            tabEl.setAttribute('data-tab-id', tab.id);
            tabEl.innerHTML = `
                ${tab.name}
                <span class="tab-close">×</span>
            `;

            tabEl.addEventListener('click', (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    this.switchToTab(tab.id);
                }
            });

            tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(tab.id);
            });

            tabs.appendChild(tabEl);
        });
    }

    // ========================================================================
    // WORKSPACE RENDERING
    // ========================================================================

    getEmptyModeData(mode) {
        const dataTemplates = {
            kanban: { columns: { todo: [], doing: [], done: [] } },
            notes: { notes: [] },
            draw: { imageData: null },
            'text-editor': { content: '' },
            coding: { content: '', language: 'txt' },
            flow: { nodes: [] }
        };
        return dataTemplates[mode] || {};
    }

    renderWorkspace() {
        const workspace = document.getElementById('workspace');
        
        if (!this.activeTabId) {
            workspace.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-secondary);">Create a new tab to get started</div>';
            return;
        }

        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        switch (tab.mode) {
            case 'kanban':
                this.renderKanban(workspace, tab);
                break;
            case 'notes':
                this.renderNotes(workspace, tab);
                break;
            case 'draw':
                this.renderDraw(workspace, tab);
                break;
            case 'text-editor':
                this.renderTextEditor(workspace, tab);
                break;
            case 'coding':
                this.renderCodingEditor(workspace, tab);
                break;
            case 'flow':
                this.renderFlow(workspace, tab);
                break;
            default:
                workspace.innerHTML = '<div>Unknown mode</div>';
        }
    }

    // ========================================================================
    // KANBAN BOARD
    // ========================================================================

    renderKanban(workspace, tab) {
        workspace.innerHTML = `
            <div class="kanban-board">
                <div class="kanban-column" data-column="todo">
                    <div class="kanban-column-title">To Do</div>
                    <div class="kanban-cards"></div>
                </div>
                <div class="kanban-column" data-column="doing">
                    <div class="kanban-column-title">Doing</div>
                    <div class="kanban-cards"></div>
                </div>
                <div class="kanban-column" data-column="done">
                    <div class="kanban-column-title">Done</div>
                    <div class="kanban-cards"></div>
                </div>
            </div>
        `;

        // Render cards
        const columns = tab.data.columns || { todo: [], doing: [], done: [] };
        ['todo', 'doing', 'done'].forEach(columnName => {
            const column = workspace.querySelector(`[data-column="${columnName}"]`);
            const cardsContainer = column.querySelector('.kanban-cards');
            
            (columns[columnName] || []).forEach((card, idx) => {
                const cardEl = document.createElement('div');
                cardEl.className = 'kanban-card';
                cardEl.draggable = true;
                cardEl.setAttribute('data-column', columnName);
                cardEl.setAttribute('data-index', idx);
                cardEl.innerHTML = `
                    <div class="kanban-card-title">${this.escapeHtml(card.title)}</div>
                    ${card.description ? `<div class="kanban-card-description">${this.escapeHtml(card.description)}</div>` : ''}
                    <div class="kanban-card-menu">⋯</div>
                `;
                
                cardEl.querySelector('.kanban-card-menu').addEventListener('click', () => {
                    this.showKanbanCardMenu(tab.id, columnName, idx);
                });

                cardEl.addEventListener('dragstart', (e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('cardData', JSON.stringify({ columnName, idx }));
                });
                
                cardsContainer.appendChild(cardEl);
            });
        });

        // Add column context menu and drag handlers
        workspace.querySelectorAll('.kanban-column').forEach(column => {
            column.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const columnName = column.getAttribute('data-column');
                this.showAddCardMenu(tab.id, columnName);
            });

            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                column.style.opacity = '0.8';
            });

            column.addEventListener('dragleave', (e) => {
                e.preventDefault();
                column.style.opacity = '1';
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.style.opacity = '1';
                
                try {
                    const cardData = JSON.parse(e.dataTransfer.getData('cardData'));
                    const fromColumn = cardData.columnName;
                    const fromIndex = cardData.idx;
                    const toColumn = column.getAttribute('data-column');

                    if (!tab.data.columns) tab.data.columns = { todo: [], doing: [], done: [] };
                    
                    const card = tab.data.columns[fromColumn][fromIndex];
                    tab.data.columns[fromColumn].splice(fromIndex, 1);
                    tab.data.columns[toColumn].push(card);
                    
                    this.renderWorkspace();
                    this.saveProject();
                } catch (err) {
                    console.error('Drag error:', err);
                }
            });
        });
    }

    showAddCardMenu(tabId, columnName) {
        const title = prompt('Card Title:');
        if (title === null) return;

        const description = prompt('Card Description (optional):') || '';
        
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        if (!tab.data.columns) tab.data.columns = { todo: [], doing: [], done: [] };
        if (!tab.data.columns[columnName]) tab.data.columns[columnName] = [];

        tab.data.columns[columnName].push({ title, description });
        this.renderWorkspace();
        this.saveProject();
    }

    showKanbanCardMenu(tabId, columnName, cardIdx) {
        const option = confirm('Click OK for Edit, Cancel for Delete');
        
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        if (option) {
            // Edit
            const card = tab.data.columns[columnName][cardIdx];
            const newTitle = prompt('Card Title:', card.title);
            if (newTitle === null) return;
            const newDesc = prompt('Card Description (optional):', card.description) || '';
            
            tab.data.columns[columnName][cardIdx] = { title: newTitle, description: newDesc };
        } else {
            // Delete
            tab.data.columns[columnName].splice(cardIdx, 1);
        }

        this.renderWorkspace();
        this.saveProject();
    }

    // ========================================================================
    // NOTES
    // ========================================================================

    renderNotes(workspace, tab) {
        workspace.innerHTML = '<div class="notes-workspace"></div>';
        const notesArea = workspace.querySelector('.notes-workspace');

        // Render existing notes
        (tab.data.notes || []).forEach((note, idx) => {
            this.createNoteElement(notesArea, note, tab.id, idx);
        });

        // Add context menu
        notesArea.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showAddNoteMenu(tab.id, e.clientX, e.clientY);
        });
    }

    createNoteElement(container, note, tabId, idx) {
        const noteEl = document.createElement('div');
        noteEl.className = 'sticky-note';
        noteEl.style.backgroundColor = note.color || '#ffeb3b';
        noteEl.style.left = note.x + 'px';
        noteEl.style.top = note.y + 'px';
        noteEl.style.width = note.width + 'px';
        noteEl.style.height = note.height + 'px';
        noteEl.contentEditable = true;
        noteEl.textContent = note.content;
        noteEl.draggable = true;

        // Update content on input
        noteEl.addEventListener('input', () => {
            note.content = noteEl.textContent;
            const tab = this.tabs.find(t => t.id === tabId);
            if (tab) {
                tab.data.notes[idx].content = noteEl.textContent;
                this.saveProject();
            }
        });

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        noteEl.addEventListener('dragstart', (e) => {
            isDragging = true;
            offsetX = e.clientX - noteEl.offsetLeft;
            offsetY = e.clientY - noteEl.offsetTop;
            e.dataTransfer.effectAllowed = 'move';
        });

        document.addEventListener('dragend', () => {
            isDragging = false;
        });

        document.addEventListener('dragover', (e) => {
            if (isDragging) {
                e.preventDefault();
                noteEl.style.left = (e.clientX - offsetX) + 'px';
                noteEl.style.top = (e.clientY - offsetY) + 'px';
                
                const tab = this.tabs.find(t => t.id === tabId);
                if (tab) {
                    tab.data.notes[idx].x = e.clientX - offsetX;
                    tab.data.notes[idx].y = e.clientY - offsetY;
                    this.saveProject();
                }
            }
        });

        noteEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showNoteMenu(tabId, idx);
        });

        container.appendChild(noteEl);
    }

    showAddNoteMenu(tabId, x, y) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        if (!tab.data.notes) tab.data.notes = [];

        tab.data.notes.push({
            content: 'Click to edit...',
            color: '#ffeb3b',
            x: Math.max(0, x - 100),
            y: Math.max(0, y - 75),
            width: 200,
            height: 200
        });

        this.renderWorkspace();
        this.saveProject();
    }

    showNoteMenu(tabId, noteIdx) {
        const options = ['Delete', 'Change Color'];
        const selected = prompt(`Options:\n1. Delete\n2. Change Color\n\nEnter number:`);

        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        if (selected === '1') {
            tab.data.notes.splice(noteIdx, 1);
            this.renderWorkspace();
            this.saveProject();
        } else if (selected === '2') {
            const color = prompt('Enter color (hex or name, e.g., #ffeb3b or yellow):');
            if (color) {
                tab.data.notes[noteIdx].color = color;
                this.renderWorkspace();
                this.saveProject();
            }
        }
    }

    // ========================================================================
    // DRAW
    // ========================================================================

    renderDraw(workspace, tab) {
        workspace.innerHTML = `
            <div class="draw-workspace">
                <div class="draw-toolbar">
                    <div class="draw-tool" data-tool="pen" title="Pen (P)">✏️</div>
                    <div class="draw-tool" data-tool="eraser" title="Eraser (E)">🧹</div>
                    <div class="draw-tool" data-tool="line" title="Line (L)">📏</div>
                    <div class="draw-tool" data-tool="square" title="Square (S)">▭</div>
                    <div class="draw-tool" data-tool="circle" title="Circle (C)">◯</div>
                    <div class="draw-tool" data-tool="fill" title="Fill (F)">🪣</div>
                </div>
                <div class="draw-canvas-area">
                    <canvas class="draw-canvas"></canvas>
                    <input type="range" class="brush-size-slider" min="1" max="50" value="3" style="position: absolute; bottom: 10px; left: 70px;">
                </div>
                <div class="draw-color-picker">
                    <div class="color-option" data-color="#000000" style="background-color: #000000;"></div>
                    <div class="color-option" data-color="#FF0000" style="background-color: #FF0000;"></div>
                    <div class="color-option" data-color="#00FF00" style="background-color: #00FF00;"></div>
                    <div class="color-option" data-color="#0000FF" style="background-color: #0000FF;"></div>
                    <div class="color-option" data-color="#FFFF00" style="background-color: #FFFF00;"></div>
                    <div class="color-option" data-color="#FFFFFF" style="background-color: #FFFFFF; border: 2px solid #999;"></div>
                </div>
            </div>
        `;

        const canvas = workspace.querySelector('.draw-canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        // Load previous image if exists
        if (tab.data.imageData) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = tab.data.imageData;
        } else {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        this.drawState.tool = 'pen';
        this.drawState.color = '#000000';
        this.drawState.brushSize = 3;

        // Tool selection
        workspace.querySelectorAll('.draw-tool').forEach(tool => {
            tool.addEventListener('click', () => {
                workspace.querySelectorAll('.draw-tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                this.drawState.tool = tool.getAttribute('data-tool');
            });
        });

        workspace.querySelector('[data-tool="pen"]').classList.add('active');

        // Color selection
        workspace.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', () => {
                workspace.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));
                color.classList.add('active');
                this.drawState.color = color.getAttribute('data-color');
            });
        });

        workspace.querySelector('[data-color="#000000"]').classList.add('active');

        // Brush size slider
        const sizeSlider = workspace.querySelector('.brush-size-slider');
        sizeSlider.addEventListener('input', (e) => {
            this.drawState.brushSize = e.target.value;
        });

        // Drawing logic
        let isDrawing = false;
        let startX, startY;

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const rect = canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.strokeStyle = this.drawState.color;
            ctx.fillStyle = this.drawState.color;
            ctx.lineWidth = this.drawState.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            switch (this.drawState.tool) {
                case 'pen':
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    startX = x;
                    startY = y;
                    break;
                case 'eraser':
                    ctx.clearRect(x - this.drawState.brushSize / 2, y - this.drawState.brushSize / 2, this.drawState.brushSize, this.drawState.brushSize);
                    break;
            }
        });

        canvas.addEventListener('mouseup', (e) => {
            if (!isDrawing) return;
            isDrawing = false;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.strokeStyle = this.drawState.color;
            ctx.fillStyle = this.drawState.color;
            ctx.lineWidth = this.drawState.brushSize;

            switch (this.drawState.tool) {
                case 'line':
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    break;
                case 'square':
                    ctx.strokeRect(startX, startY, x - startX, y - startY);
                    break;
                case 'circle':
                    const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                    ctx.beginPath();
                    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                    ctx.stroke();
                    break;
                case 'fill':
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    break;
            }

            // Save image data
            tab.data.imageData = canvas.toDataURL();
            this.saveProject();
        });

        canvas.addEventListener('mouseleave', () => {
            isDrawing = false;
        });
    }

    // ========================================================================
    // TEXT EDITOR
    // ========================================================================

    renderTextEditor(workspace, tab) {
        workspace.innerHTML = `
            <div class="text-editor-wrapper">
                <div class="text-editor-toolbar">
                    <button class="toolbar-btn" data-format="bold">Bold</button>
                    <button class="toolbar-btn" data-format="underline">Underline</button>
                    <button class="toolbar-btn" data-format="list">Unordered List</button>
                    <button class="toolbar-btn" data-format="num-list">Numbered List</button>
                </div>
                <textarea class="text-editor" placeholder="Start typing..." style="white-space: pre-wrap;"></textarea>
            </div>
        `;

        const textarea = workspace.querySelector('.text-editor');
        textarea.value = tab.data.content || '';
        textarea.style.userSelect = 'text';
        textarea.style.WebkitUserSelect = 'text';

        textarea.addEventListener('input', () => {
            tab.data.content = textarea.value;
            this.saveProject();
        });

        // Simple formatting (just text-based for simplicity)
        workspace.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.getAttribute('data-format');
                let text = textarea.value;
                
                if (format === 'list') {
                    text += '\n• ';
                } else if (format === 'num-list') {
                    text += '\n1. ';
                }
                
                textarea.value = text;
                tab.data.content = text;
                this.saveProject();
                textarea.focus();
            });
        });
    }

    // ========================================================================
    // CODING EDITOR
    // ========================================================================

    renderCodingEditor(workspace, tab) {
        workspace.innerHTML = `
            <div class="code-editor-wrapper">
                <div class="code-editor-toolbar">
                    <select id="fileType" class="toolbar-btn" style="padding: 6px 8px;">
                        <option value="txt">.txt</option>
                        <option value="js">.js</option>
                        <option value="py">.py</option>
                        <option value="html">.html</option>
                        <option value="css">.css</option>
                        <option value="java">.java</option>
                        <option value="cpp">.cpp</option>
                    </select>
                    <button class="toolbar-btn" id="downloadCodeBtn">💾 Download</button>
                </div>
                <textarea class="code-editor" placeholder="Write your code here..." spellcheck="false" style="white-space: pre;"></textarea>
            </div>
        `;

        const textarea = workspace.querySelector('.code-editor');
        textarea.value = tab.data.content || '';
        const fileType = workspace.querySelector('#fileType');
        fileType.value = tab.data.language || 'txt';

        textarea.addEventListener('input', () => {
            tab.data.content = textarea.value;
            this.saveProject();
        });

        fileType.addEventListener('change', () => {
            tab.data.language = fileType.value;
            this.saveProject();
        });

        // Download button
        document.getElementById('downloadCodeBtn').addEventListener('click', () => {
            const content = textarea.value;
            const language = fileType.value;
            const filename = `code.${language}`;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    // ========================================================================
    // FLOW DIAGRAM
    // ========================================================================

    renderFlow(workspace, tab) {
        workspace.innerHTML = '<div class="flow-workspace"></div>';
        const flowArea = workspace.querySelector('.flow-workspace');

        (tab.data.nodes || []).forEach((node, idx) => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'flow-node';
            nodeEl.style.left = node.x + 'px';
            nodeEl.style.top = node.y + 'px';
            nodeEl.textContent = node.label;
            nodeEl.draggable = true;
            nodeEl.setAttribute('data-index', idx);

            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;

            nodeEl.addEventListener('dragstart', (e) => {
                isDragging = true;
                offsetX = e.clientX - nodeEl.offsetLeft;
                offsetY = e.clientY - nodeEl.offsetTop;
                e.dataTransfer.effectAllowed = 'move';
            });

            document.addEventListener('dragend', () => {
                isDragging = false;
            });

            document.addEventListener('dragover', (e) => {
                if (isDragging && e.target === flowArea) {
                    e.preventDefault();
                    nodeEl.style.left = (e.clientX - offsetX) + 'px';
                    nodeEl.style.top = (e.clientY - offsetY) + 'px';
                    tab.data.nodes[idx].x = e.clientX - offsetX;
                    tab.data.nodes[idx].y = e.clientY - offsetY;
                }
            });

            flowArea.appendChild(nodeEl);
        });

        flowArea.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const nodeType = prompt('Node type:\n1. Flow Node\n2. Decision Node\n3. End Node\n\nEnter number:');
            if (nodeType) {
                const types = { '1': 'flow', '2': 'decision', '3': 'end' };
                const label = prompt('Node label:');
                if (label) {
                    tab.data.nodes.push({
                        type: types[nodeType] || 'flow',
                        label,
                        x: e.clientX - 50,
                        y: e.clientY - 20
                    });
                    this.renderWorkspace();
                    this.saveProject();
                }
            }
        });
    }

    // ========================================================================
    // PROJECT MANAGEMENT
    // ========================================================================

    loadOrCreateProject() {
        const saved = localStorage.getItem('workspaces-project');
        if (saved) {
            try {
                this.workspaceData = JSON.parse(saved);
                this.tabs = this.workspaceData.tabs || [];
                if (this.tabs.length > 0) {
                    this.switchToTab(this.tabs[0].id);
                    this.renderTabs();
                }
            } catch (e) {
                console.error('Failed to load project:', e);
                this.createNewTab();
            }
        }
    }

    saveProject() {
        this.workspaceData.tabs = this.tabs;
        localStorage.setItem('workspaces-project', JSON.stringify(this.workspaceData));
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    setupEventListeners() {
        document.getElementById('addTabBtn').addEventListener('click', () => {
            this.createNewTab();
        });

        document.getElementById('themeToggleBtn').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('aiToggleBtn').addEventListener('click', () => {
            const aiPanel = document.getElementById('aiAssistantPanel');
            const modePanel = document.getElementById('modeDescriptionPanel');
            const btn = document.getElementById('aiToggleBtn');

            if (aiPanel.style.display === 'none') {
                aiPanel.style.display = 'flex';
                modePanel.style.display = 'none';
                btn.classList.add('active');
            } else {
                aiPanel.style.display = 'none';
                modePanel.style.display = 'flex';
                btn.classList.remove('active');
            }
        });

        document.getElementById('aiSendBtn').addEventListener('click', () => {
            const input = document.getElementById('aiInput');
            if (input.value.trim()) {
                this.addAIMessage(input.value, 'user');
                input.value = '';
                // Simulate AI response
                setTimeout(() => {
                    this.addAIMessage('Thanks for the message! (AI responses coming soon)', 'assistant');
                }, 500);
            }
        });

        document.querySelectorAll('.mode-item').forEach(item => {
            item.addEventListener('click', () => {
                const mode = item.getAttribute('data-mode');
                this.currentMode = mode;
                this.updateModeDescription(mode);
                
                document.querySelectorAll('.mode-item').forEach(m => m.classList.remove('active'));
                item.classList.add('active');
            });
        });

        document.getElementById('goToWorkspaceBtn').addEventListener('click', () => {
            if (this.currentMode) {
                this.createNewTab();
            }
        });
    }

    addAIMessage(text, sender) {
        const chatEl = document.getElementById('aiChat');
        const msgEl = document.createElement('div');
        msgEl.className = `ai-message ${sender}`;
        msgEl.textContent = text;
        chatEl.appendChild(msgEl);
        chatEl.scrollTop = chatEl.scrollHeight;
    }

    // ========================================================================
    // UTILITIES
    // ========================================================================

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WorkspacesApp();
});