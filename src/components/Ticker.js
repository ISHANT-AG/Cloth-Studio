/**
 * Ticker.js — Bottom Continuous Marquee Ribbon
 */

import { BRAND_CONFIG } from '../data/products.js';

export class StoreTicker {
  constructor() {
    this.track = document.getElementById('tickerTrack');
    this.init();
  }

  init() {
    if (!this.track) return;

    // Build repeating ticker elements for seamless infinite slide
    const content = BRAND_CONFIG.tickerItems.map(item => {
      if (item === '✦') {
        return `<span class="ticker-glyph" aria-hidden="true">✦</span>`;
      }
      return `<span class="ticker-item">${item}</span>`;
    }).join('');

    // Duplicate 4 times to ensure infinite seamless scrolling loop
    this.track.innerHTML = `${content}${content}${content}${content}`;
  }
}
