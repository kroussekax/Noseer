// Noseer Notification Bar & Drawer Controller

(function(global) {
  class NotificationController {
    constructor() {
      this.isOpen = false;
      this.init();
    }

    init() {
      this.btnNotif = document.getElementById('btn-notif-drawer');
      this.btnSettings = document.getElementById('btn-notif-settings');
      this.drawer = document.getElementById('notif-drawer');
      this.backdrop = document.getElementById('notif-drawer-backdrop');
      this.listEl = document.getElementById('notif-list-container');
      this.btnClear = document.getElementById('btn-notif-clear');
      this.badgeDot = document.getElementById('notif-unread-dot');

      if (this.btnNotif) {
        this.btnNotif.addEventListener('click', () => this.toggleDrawer());
      }
      if (this.backdrop) {
        this.backdrop.addEventListener('click', () => this.closeDrawer());
      }
      if (this.btnClear) {
        this.btnClear.addEventListener('click', () => {
          global.NoseerStore.markAllNotificationsRead();
        });
      }
      if (this.btnSettings) {
        this.btnSettings.addEventListener('click', () => {
          global.NoseerNavigation.navigateTo('settings');
          this.closeDrawer();
        });
      }

      this.render();

      global.NoseerStore.subscribe((event) => {
        if (event === 'notifications:changed') {
          this.render();
        }
      });
    }

    toggleDrawer() {
      if (this.isOpen) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    }

    openDrawer() {
      this.isOpen = true;
      if (this.drawer) this.drawer.classList.add('open');
      if (this.backdrop) this.backdrop.classList.add('open');
      if (this.btnNotif) this.btnNotif.classList.add('active');
    }

    closeDrawer() {
      this.isOpen = false;
      if (this.drawer) this.drawer.classList.remove('open');
      if (this.backdrop) this.backdrop.classList.remove('open');
      if (this.btnNotif) this.btnNotif.classList.remove('active');
    }

    render() {
      const notifs = global.NoseerStore.getNotifications();
      const unreadCount = global.NoseerStore.getUnreadCount();

      if (this.badgeDot) {
        this.badgeDot.style.display = unreadCount > 0 ? 'block' : 'none';
      }

      if (!this.listEl) return;

      if (notifs.length === 0) {
        this.listEl.innerHTML = `
          <div style="text-align: center; padding: 24px; color: var(--md-text-muted); font-size: 13px;">
            No new notifications
          </div>
        `;
        return;
      }

      this.listEl.innerHTML = notifs.map(n => `
        <div class="notif-card" style="${n.read ? 'opacity: 0.7;' : ''}">
          <div class="notif-card-top">
            <span class="notif-card-title">${this.escapeHtml(n.title)}</span>
            <span class="notif-card-time">${this.escapeHtml(n.time || '')}</span>
          </div>
          <div class="notif-card-msg">${this.escapeHtml(n.message)}</div>
        </div>
      `).join('');
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  }

  global.NoseerNotifications = new NotificationController();
})(window);
