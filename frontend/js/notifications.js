// File: public/js/notification.js
export class NotificationSystem {
  constructor(containerId = 'notificationContainer', autoDismiss = 5000) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.body.prepend(this.container);
    }
    this.autoDismissTime = autoDismiss;
  }

  show(type, title, message, duration = null) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'i' };

    notification.innerHTML = `
      <span class="notification-icon">${icons[type] || 'i'}</span>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">&times;</button>
    `;

    this.container.appendChild(notification);
    // trigger CSS animation
    requestAnimationFrame(() => notification.classList.add('show'));

    const dismissTime = duration !== null ? duration : this.autoDismissTime;
    const timeoutId = dismissTime > 0
      ? setTimeout(() => this.dismiss(notification), dismissTime)
      : null;

    notification
      .querySelector('.notification-close')
      .addEventListener('click', () => this.dismiss(notification));

    notification._timeoutId = timeoutId;
  }

  dismiss(el) {
    if (el._timeoutId) clearTimeout(el._timeoutId);
    el.classList.remove('show');
    el.classList.add('hide');
    setTimeout(() => el.remove(), 300);
  }

  success(title, message, duration) { this.show('success', title, message, duration); }
  error  (title, message, duration) { this.show('error',   title, message, duration); }
  warning(title, message, duration) { this.show('warning', title, message, duration); }
  info   (title, message, duration) { this.show('info',    title, message, duration); }
}
