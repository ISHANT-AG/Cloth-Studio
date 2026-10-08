/**
 * Header.js — Navigation & Drawer Management
 */

export class StoreHeader {
  constructor() {
    this.menuToggle = document.getElementById('menuToggle');
    this.drawer = document.getElementById('navDrawer');
    this.drawerCloseBtn = document.getElementById('drawerCloseBtn');
    this.cartBtn = document.getElementById('cartBtn');
    this.isOpen = false;

    this.bindEvents();
  }

  bindEvents() {
    this.menuToggle.addEventListener('click', () => this.toggleDrawer());
    this.drawerCloseBtn.addEventListener('click', () => this.closeDrawer());

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.drawer.contains(e.target) && !this.menuToggle.contains(e.target)) {
        this.closeDrawer();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDrawer();
      }
    });

    // Cart feedback (first milestone: preview only notification)
    this.cartBtn.addEventListener('click', () => {
      alert("Milestone 1 Preview: Full cart & checkout will be implemented in the subsequent milestone!");
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
    this.drawer.classList.add('is-open');
    this.drawer.setAttribute('aria-hidden', 'false');
    this.menuToggle.setAttribute('aria-expanded', 'true');
    this.drawerCloseBtn.focus();
  }

  closeDrawer() {
    this.isOpen = false;
    this.drawer.classList.remove('is-open');
    this.drawer.setAttribute('aria-hidden', 'true');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    this.menuToggle.focus();
  }
}
