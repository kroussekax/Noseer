// Noseer Minimal Editor with Stylus Palm Rejection & Collapsible Drawing Menu

(function(global) {
  class NoteEditorController {
    constructor() {
      this.currentNote = null;
      this.isDrawing = false;
      this.currentPath = null;
      this.activeTool = 'pen';
      this.activeColor = '#ef4444';
      this.lineWidth = 3;
      this.init();
    }

    init() {
      this.contentPane = document.getElementById('editor-content-pane');
      this.drawingMenu = document.getElementById('editor-drawing-menu');
      this.btnToggleMenu = document.getElementById('btn-toggle-drawing-menu');
      this.btnMobileBack = document.getElementById('mobile-back-btn');

      if (this.btnToggleMenu && this.drawingMenu) {
        this.btnToggleMenu.addEventListener('click', () => {
          this.drawingMenu.classList.toggle('collapsed');
        });
      }

      if (this.btnMobileBack) {
        this.btnMobileBack.addEventListener('click', () => {
          this.saveCurrentChanges();
          global.NoseerNavigation.navigateTo('notes');
        });
      }

      // Drawing Tool Buttons
      if (this.drawingMenu) {
        const btns = this.drawingMenu.querySelectorAll('.drawing-tool-btn');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tool = btn.getAttribute('data-tool') || btn.textContent.toLowerCase();
            this.activeTool = tool;
            if (tool === 'eraser') {
              this.lineWidth = 20;
            } else {
              this.lineWidth = 3;
            }
          });
        });

        // Color Swatches
        const swatches = this.drawingMenu.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
          swatch.addEventListener('click', () => {
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            this.activeColor = swatch.getAttribute('data-color') || '#ef4444';
          });
        });
      }

      window.addEventListener('resize', () => {
        if (this.currentNote) this.renderContentPane();
      });
    }

    loadNote(noteOrId) {
      if (typeof noteOrId === 'string') {
        this.currentNote = global.NoseerStore.getNote(noteOrId);
      } else {
        this.currentNote = noteOrId;
      }
      
      if (!this.currentNote) return;

      // Update top bar title
      const topTitle = document.getElementById('top-bar-title');
      if (topTitle) {
        topTitle.textContent = this.currentNote.title || 'Note Details';
      }

      this.renderContentPane();
    }

    renderContentPane() {
      if (!this.contentPane || !this.currentNote) return;

      const isMobile = document.body.classList.contains('sim-mobile') || window.innerWidth <= 600;
      
      // Update Drawing Menu Visibility (Tablet/PC only)
      if (this.drawingMenu) {
        this.drawingMenu.style.display = isMobile ? 'none' : 'flex';
      }

      // Mobile back button visibility
      if (this.btnMobileBack) {
        this.btnMobileBack.style.display = isMobile ? 'flex' : 'none';
      }

      const textContent = this.currentNote.text || (this.currentNote.lines ? this.currentNote.lines.join('\n') : '');
      const svgContent = this.currentNote.svgGraphic || '';

      this.contentPane.innerHTML = `
        <div class="editor-layout ${isMobile ? 'mobile-view' : 'desktop-view'}" style="display: flex; flex-direction: column; gap: 20px; padding: 24px; width: 100%; height: 100%; overflow-y: auto;">
          <!-- Structured Text Display / Editor -->
          <div class="editor-text-block" style="font-family: var(--font-body); font-size: 16px; line-height: 1.6; color: var(--md-text-primary);">
            <div id="editor-text-input" contenteditable="${!isMobile}" style="outline: none; padding: 12px; background: var(--md-surface-1); border-radius: 12px; border: 1px solid var(--md-border-subtle); white-space: pre-wrap;">${this.escapeHtml(textContent)}</div>
          </div>

          <!-- Vector SVG & Stylus Drawing Graphics Canvas -->
          <div class="editor-graphics-block" style="position: relative; width: 100%; min-height: 320px; background: var(--md-surface-1); border: 1px solid var(--md-border-subtle); border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
              ${svgContent}
            </div>
            ${!isMobile ? '<canvas id="editor-draw-canvas" style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 10; cursor: crosshair; touch-action: none;"></canvas>' : ''}
          </div>
        </div>
      `;

      const textInput = document.getElementById('editor-text-input');
      if (textInput && !isMobile) {
        textInput.addEventListener('input', (e) => {
          this.currentNote.text = e.target.innerText;
          this.currentNote.userEdited = true;
          this.saveCurrentChanges();
        });
      }

      if (!isMobile) {
        setTimeout(() => this.setupCanvas(), 50);
      }
    }

    setupCanvas() {
      const canvas = document.getElementById('editor-draw-canvas');
      if (!canvas) return;

      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth || 600;
      canvas.height = parent.clientHeight || 400;

      const ctx = canvas.getContext('2d');

      // Redraw saved stylus paths
      if (this.currentNote.drawing && this.currentNote.drawing.length > 0) {
        this.currentNote.drawing.forEach(path => {
          if (!path.points || path.points.length === 0) return;
          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);
          ctx.strokeStyle = path.color || '#ef4444';
          ctx.lineWidth = path.width || 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
          }
          ctx.stroke();
        });
      }

      const getPos = (e) => {
        const bounds = canvas.getBoundingClientRect();
        return {
          x: (e.clientX || (e.touches && e.touches[0].clientX)) - bounds.left,
          y: (e.clientY || (e.touches && e.touches[0].clientY)) - bounds.top
        };
      };

      const startDrawing = (e) => {
        // Palm rejection: reject accidental multi-touch palm triggers
        if (e.pointerType === 'touch' && e.isPrimary === false) return;
        this.isDrawing = true;
        const pos = getPos(e);
        const color = this.activeTool === 'eraser' ? '#000000' : this.activeColor;
        this.currentPath = { color: color, width: this.lineWidth, points: [pos] };
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      };

      const draw = (e) => {
        if (!this.isDrawing || !this.currentPath) return;
        const pos = getPos(e);
        this.currentPath.points.push(pos);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = this.currentPath.color;
        ctx.lineWidth = this.currentPath.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      };

      const stopDrawing = () => {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        if (this.currentPath && this.currentPath.points.length > 1) {
          if (!this.currentNote.drawing) this.currentNote.drawing = [];
          this.currentNote.drawing.push(this.currentPath);
          this.currentNote.userEdited = true;
          this.saveCurrentChanges();
        }
        this.currentPath = null;
      };

      canvas.addEventListener('pointerdown', startDrawing);
      canvas.addEventListener('pointermove', draw);
      canvas.addEventListener('pointerup', stopDrawing);
      canvas.addEventListener('pointerleave', stopDrawing);
    }

    saveCurrentChanges() {
      if (!this.currentNote) return;
      global.NoseerStore.saveNote(this.currentNote);
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  }

  global.NoseerEditor = new NoteEditorController();
})(window);
