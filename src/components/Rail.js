/**
 * Rail.js — Interactive Clothing Rail Component
 * Displays 8–10 garments simultaneously on desktop with deliberate overlap,
 * angled resting perspective, thin rod with hook apex contact,
 * hover/focus neighbor separation, and smooth preview trigger.
 */

import { PRODUCTS } from '../data/products.js';

export class ClothingRail {
  constructor(options = {}) {
    this.sectionElement = document.getElementById('railSection');
    this.trackElement = document.getElementById('railTrack');
    this.viewportElement = document.getElementById('railViewport');
    this.prevBtn = document.getElementById('railSlidePrev');
    this.nextBtn = document.getElementById('railSlideNext');
    this.counterPill = document.getElementById('railCounterPill');
    this.activeTitleElement = document.getElementById('railActiveTitle');
    this.activeHintElement = document.getElementById('railActiveHint');
    this.activeCtaBtn = document.getElementById('railActiveCta');
    this.onSelectProduct = options.onSelectProduct || (() => {});

    // Default to center item (index 5: Borovi Hoodie) matching reference frame_001
    this.activeIndex = 5;
    this.items = [];

    // Mobile swipe tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isSwiping = false;

    this.scrollTimeout = null;
    this.hoverDebounceTimeout = null;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.setActiveItem(this.activeIndex, false);

    window.addEventListener('resize', () => {
      this.updateTrackPosition();
    });

    // Initial center position / scroll
    setTimeout(() => {
      this.updateTrackPosition();
      if (window.innerWidth <= 768) {
        this.scrollToCenter(this.activeIndex, 'auto');
      }
    }, 60);
  }

  render() {
    this.trackElement.innerHTML = '';
    this.items = [];

    PRODUCTS.forEach((product, index) => {
      // Natural organic sway physics with individual frequencies and phases
      const swayDuration = (5.0 + (index * 0.37) % 1.8).toFixed(2);
      const swayDelay = (-1 * ((index * 1.29) % 3.2)).toFixed(2);
      const swayAngle = (0.7 + ((index * 0.22) % 0.6)).toFixed(2);
      const angleVar = index % 2 === 0 ? 'var-angle-1' : 'var-angle-2';

      const itemButton = document.createElement('button');
      itemButton.className = `rail-item ${angleVar}`;
      itemButton.setAttribute('role', 'listitem');
      itemButton.setAttribute('tabindex', '0');
      itemButton.setAttribute('aria-label', `${product.name}, ${product.priceFormatted}. Click to inspect.`);
      itemButton.setAttribute('data-index', index);
      itemButton.setAttribute('data-id', product.id);

      // Inline styles for organic sway physics
      itemButton.style.setProperty('--sway-duration', `${swayDuration}s`);
      itemButton.style.setProperty('--sway-delay', `${swayDelay}s`);
      itemButton.style.setProperty('--sway-angle', `${swayAngle}deg`);

      itemButton.innerHTML = `
        <div class="rail-garment-sway-wrap">
          <div class="rail-garment-3d-box">
            <img
              src="${product.frontImage}"
              alt="${product.name}"
              class="rail-garment-img"
              loading="${index < 6 ? 'eager' : 'lazy'}"
              draggable="false"
            />
          </div>
        </div>
      `;

      this.trackElement.appendChild(itemButton);
      this.items.push(itemButton);
    });
  }

  bindEvents() {
    // Garment Item Hover, Focus & Click
    this.items.forEach((item, index) => {
      // Hover (Desktop): instantly highlight item & info, gently debounce track sliding
      item.addEventListener('mouseenter', () => {
        this.highlightItem(index);
        clearTimeout(this.hoverDebounceTimeout);
        this.hoverDebounceTimeout = setTimeout(() => {
          this.updateTrackPosition();
        }, 150);
      });

      item.addEventListener('mouseleave', () => {
        clearTimeout(this.hoverDebounceTimeout);
      });

      // Keyboard Focus
      item.addEventListener('focus', () => {
        clearTimeout(this.hoverDebounceTimeout);
        this.setActiveItem(index, true);
      });

      // Click to select and immediately open minimal preview
      item.addEventListener('click', (e) => {
        e.preventDefault();
        clearTimeout(this.hoverDebounceTimeout);
        this.setActiveItem(index, false);
        this.openPreview(index);
      });
    });

    // Arrow Nav Buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.slideByDirection(-1);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.slideByDirection(1);
      });
    }

    // Active Item CTA in footer
    if (this.activeCtaBtn) {
      this.activeCtaBtn.addEventListener('click', () => {
        this.openPreview(this.activeIndex);
      });
    }

    // Keyboard Arrow Navigation on Viewport
    this.viewportElement.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.slideByDirection(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.slideByDirection(-1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openPreview(this.activeIndex);
      }
    });

    // Mobile Touch Swipe Handling
    this.viewportElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.isSwiping = true;
      }
    }, { passive: true });

    this.viewportElement.addEventListener('touchend', (e) => {
      if (!this.isSwiping || e.changedTouches.length === 0) return;
      this.isSwiping = false;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = this.touchStartX - touchEndX;
      const diffY = Math.abs(this.touchStartY - touchEndY);

      // Horizontal swipe detected
      if (Math.abs(diffX) > 40 && diffY < 50) {
        if (diffX > 0) {
          this.slideByDirection(1);
        } else {
          this.slideByDirection(-1);
        }
      }
    }, { passive: true });

    // Real-time mobile scroll detection
    this.viewportElement.addEventListener('scroll', () => {
      if (window.innerWidth <= 1080) {
        if (this.scrollTimeout) cancelAnimationFrame(this.scrollTimeout);
        this.scrollTimeout = requestAnimationFrame(() => {
          this.detectCenteredItem();
        });
      }
    }, { passive: true });
  }

  detectCenteredItem() {
    const vpRect = this.viewportElement.getBoundingClientRect();
    const centerX = vpRect.left + vpRect.width / 2;

    let closestIndex = this.activeIndex;
    let minDistance = Infinity;

    this.items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.left + itemRect.width / 2;
      const distance = Math.abs(centerX - itemCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== this.activeIndex && minDistance < 140) {
      this.setActiveItem(closestIndex, false);
    }
  }

  scrollToCenter(index, behavior = 'smooth') {
    if (index < 0 || index >= this.items.length) return;
    const item = this.items[index];
    if (!item) return;

    const vpWidth = this.viewportElement.clientWidth;
    const itemLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;
    const targetScroll = itemLeft - (vpWidth / 2) + (itemWidth / 2);

    this.viewportElement.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: behavior
    });
  }

  highlightItem(index) {
    if (index < 0 || index >= PRODUCTS.length) return;
    this.activeIndex = index;
    const currentProduct = PRODUCTS[index];

    // Update 3D perspective orientation for all items relative to active item
    this.items.forEach((item, i) => {
      const isActive = (i === index);
      const isLeft = (i < index);
      const isRight = (i > index);

      item.classList.toggle('is-active', isActive);
      item.classList.toggle('is-left', isLeft);
      item.classList.toggle('is-right', isRight);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update Counter (e.g. 06 / 10)
    if (this.counterPill) {
      const currentNum = (index + 1).toString().padStart(2, '0');
      const totalNum = PRODUCTS.length.toString().padStart(2, '0');
      this.counterPill.textContent = `${currentNum} / ${totalNum}`;
    }

    // Update footer info tightly composed beneath garments
    if (this.activeTitleElement) {
      this.activeTitleElement.textContent = currentProduct.name;
    }
    if (this.activeHintElement) {
      this.activeHintElement.textContent = `Hover to turn · Click to explore`;
    }
  }

  setActiveItem(index, shouldScrollMobile = false) {
    if (index < 0 || index >= PRODUCTS.length) return;
    this.highlightItem(index);

    // Slide rail track so active item is centered
    this.updateTrackPosition();

    // If on mobile/tablet where rail overflows, scroll active item into view
    if (shouldScrollMobile && window.innerWidth <= 768) {
      this.scrollToCenter(index, 'smooth');
    }
  }

  updateTrackPosition() {
    if (!this.trackElement || !this.viewportElement || this.items.length === 0) return;

    if (window.innerWidth <= 768) {
      this.trackElement.style.transform = '';
      return;
    }

    const itemSlotWidth = 112; // Stable slot width matching rail.css
    const targetCenter = (this.activeIndex * itemSlotWidth) + (itemSlotWidth / 2);
    const viewportWidth = this.viewportElement.clientWidth || 1200;
    const translateX = Math.round((viewportWidth / 2) - targetCenter);

    this.trackElement.style.transform = `translateX(${translateX}px)`;
  }

  slideByDirection(direction) {
    const total = PRODUCTS.length;
    const newIndex = (this.activeIndex + direction + total) % total;
    this.setActiveItem(newIndex, true);
    if (this.items[newIndex]) {
      this.items[newIndex].focus();
    }
  }

  scrollToIndex(index) {
    this.setActiveItem(index, true);
  }

  openPreview(index) {
    const product = PRODUCTS[index];
    if (product) {
      this.onSelectProduct(product, index);
    }
  }

  setBlurred(isBlurred) {
    if (this.sectionElement) {
      this.sectionElement.classList.toggle('is-blurred', isBlurred);
    }
  }
}
