/**
 * main.js — Application Entry Point
 * Orchestrates ClothingRail, ProductModal, StoreHeader, and StoreTicker.
 */

import { PRODUCTS } from './data/products.js';
import { StoreHeader } from './components/Header.js';
import { ClothingRail } from './components/Rail.js';
import { ProductModal } from './components/ProductModal.js';
import { StoreTicker } from './components/Ticker.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Header Navigation
  const header = new StoreHeader();

  // Initialize Ticker
  const ticker = new StoreTicker();

  let rail = null;

  // Initialize Product Modal
  const modal = new ProductModal({
    onModalStateChange: (isOpen, activeIndex) => {
      // Sync rail active item if modal navigates between garments & toggle blur
      if (rail) {
        rail.setBlurred(isOpen);
        if (typeof activeIndex === 'number') {
          rail.setActiveItem(activeIndex, false);
        }
      }
    }
  });

  // Initialize Interactive Clothing Rail
  rail = new ClothingRail({
    onSelectProduct: (product, index) => {
      modal.open(product, index);
    }
  });

  // Check URL query parameters for test automation & deep links
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('slide')) {
    const slideIdx = parseInt(urlParams.get('slide'), 10) || 0;
    setTimeout(() => {
      rail.scrollToIndex(slideIdx);
    }, 100);
  }
  if (urlParams.has('hover')) {
    const hoverIdx = parseInt(urlParams.get('hover'), 10) || 0;
    setTimeout(() => {
      rail.setActiveItem(hoverIdx, true);
      const targetItem = rail.items[hoverIdx];
      if (targetItem) {
        targetItem.focus();
        targetItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      }
    }, 150);
  }
  if (urlParams.has('preview')) {
    const previewIdx = parseInt(urlParams.get('preview'), 10) || 1;
    const targetProduct = PRODUCTS[previewIdx];
    if (targetProduct) {
      setTimeout(() => {
        modal.open(targetProduct, previewIdx);
        if (urlParams.get('view') === 'back') {
          modal.setView('back');
        }
      }, 150);
    }
  }

  // Global accessibility helper & initialization log
  console.log('✦ ATELIER NORD interactive clothing rail initialized.');
});
