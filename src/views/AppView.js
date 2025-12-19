/**
 * App View
 * Ana görünüm
 */

export class AppView {
  constructor(containerId) {
    this.container = document.querySelector(containerId);
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    this.container.appendChild(errorDiv);
  }

  clear() {
    this.container.innerHTML = '';
  }
}
