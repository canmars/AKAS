/**
 * App View
 * Minimal görünüm
 */

export class AppView {
  constructor(containerId) {
    this.container = document.querySelector(containerId);
    if (!this.container) {
      throw new Error(`Container ${containerId} not found`);
    }
  }
}

