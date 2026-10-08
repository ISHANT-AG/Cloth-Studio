/**
 * ProductModal.js — Minimal Centered Preview & Detailed Shop View
 * Faithful implementation of reference frame_010 (minimal centered preview)
 * and frame_015 (detailed shop drawer with size dropdown and cart behavior).
 */

import { PRODUCTS } from '../data/products.js';

export class ProductModal {
  constructor(options = {}) {
    // Minimal Preview Elements (frame_010)
    this.previewStage = document.getElementById('productModal');
    this.closeBtn = document.getElementById('modalCloseBtn');
    this.counterEl = document.getElementById('modalCounter');
    this.titleEl = document.getElementById('modalProductTitle');
    this.descriptorEl = document.getElementById('modalDescriptor');
    this.frontImg = document.getElementById('modalFrontImg');
    this.backImg = document.getElementById('modalBackImg');
    this.flipContainer = document.getElementById('garmentFlipContainer');
    this.viewToggleBar = document.getElementById('viewToggleBar');
    this.viewFrontBtn = document.getElementById('viewFrontBtn');
    this.viewBackBtn = document.getElementById('viewBackBtn');
    this.viewInShopBtn = document.getElementById('viewInShopBtn');

    // Detailed Shop Drawer Elements (frame_015)
    this.shopDrawer = document.getElementById('detailedShopDrawer');
    this.shopDrawerOverlay = document.getElementById('shopDrawerOverlay');
    this.shopDrawerCloseBtn = document.getElementById('shopDrawerCloseBtn');
    this.shopDrawerCloseXBtn = document.getElementById('shopDrawerCloseXBtn');
    this.shopMainImg = document.getElementById('shopMainImg');
    this.shopThumbsRow = document.getElementById('shopThumbsRow');
    this.thumbFrontBtn = document.getElementById('thumbFrontBtn');
    this.thumbBackBtn = document.getElementById('thumbBackBtn');
    this.thumbFrontImg = document.getElementById('thumbFrontImg');
    this.thumbBackImg = document.getElementById('thumbBackImg');
    this.shopCategoryTag = document.getElementById('shopCategoryTag');
    this.shopTitleEl = document.getElementById('shopDrawerTitle');
    this.shopPriceTag = document.getElementById('shopPriceTag');
    this.shopDescText = document.getElementById('shopDescText');
    this.shopSizeSelect = document.getElementById('shopSizeSelect');
    this.shopQtyInput = document.getElementById('shopQtyInput');
    this.shopAddToCartBtn = document.getElementById('shopAddToCartBtn');
    this.cartToast = document.getElementById('cartToast');
    this.toastMsg = document.getElementById('toastMsg');
    this.cartCounter = document.getElementById('cartCounter');
    this.cartBtn = document.getElementById('cartBtn');

    this.currentIndex = 0;
    this.isOpen = false;
    this.isDrawerOpen = false;
    this.isBackView = false;
    this.totalCartItems = 0;
    this.lastFocusedElement = null;

    this.onModalStateChange = options.onModalStateChange || (() => {});

    this.bindEvents();
  }

  bindEvents() {
    // Minimal Preview Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Front / Back View Toggle in Minimal Preview
    if (this.viewFrontBtn) {
      this.viewFrontBtn.addEventListener('click', () => this.setView('front'));
    }
    if (this.viewBackBtn) {
      this.viewBackBtn.addEventListener('click', () => this.setView('back'));
    }

    // "View in the shop ↗" Trigger -> Opens Detailed Drawer
    if (this.viewInShopBtn) {
      this.viewInShopBtn.addEventListener('click', () => this.openDetailedShop());
    }

    // Detailed Shop Drawer Close Controls
    if (this.shopDrawerCloseBtn) {
      this.shopDrawerCloseBtn.addEventListener('click', () => this.closeDetailedShop());
    }
    if (this.shopDrawerCloseXBtn) {
      this.shopDrawerCloseXBtn.addEventListener('click', () => this.closeDetailedShop());
    }
    if (this.shopDrawerOverlay) {
      this.shopDrawerOverlay.addEventListener('click', () => this.closeDetailedShop());
    }

    // Detailed Drawer Thumbnails
    if (this.thumbFrontBtn) {
      this.thumbFrontBtn.addEventListener('click', () => {
        const prod = PRODUCTS[this.currentIndex];
        if (prod) {
          this.shopMainImg.src = prod.frontImage;
          this.thumbFrontBtn.classList.add('active');
          if (this.thumbBackBtn) this.thumbBackBtn.classList.remove('active');
        }
      });
    }
    if (this.thumbBackBtn) {
      this.thumbBackBtn.addEventListener('click', () => {
        const prod = PRODUCTS[this.currentIndex];
        if (prod && prod.backImage) {
          this.shopMainImg.src = prod.backImage;
          this.thumbBackBtn.classList.add('active');
          if (this.thumbFrontBtn) this.thumbFrontBtn.classList.remove('active');
        }
      });
    }

    // Add to Cart Action
    if (this.shopAddToCartBtn) {
      this.shopAddToCartBtn.addEventListener('click', () => this.handleAddToCart());
    }

    // Keyboard Navigation: Escape, ArrowLeft, ArrowRight
    document.addEventListener('keydown', (e) => {
      if (this.isDrawerOpen && e.key === 'Escape') {
        e.preventDefault();
        this.closeDetailedShop();
        return;
      }

      if (this.isOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        } else if (!this.isDrawerOpen && e.key === 'ArrowLeft') {
          e.preventDefault();
          this.navigate(-1);
        } else if (!this.isDrawerOpen && e.key === 'ArrowRight') {
          e.preventDefault();
          this.navigate(1);
        }
      }
    });
  }

  open(product, index) {
    this.lastFocusedElement = document.activeElement;
    this.currentIndex = index;
    this.isOpen = true;

    const card = document.getElementById('storefrontCard');
    if (card) card.classList.add('is-preview-active');

    const header = document.querySelector('.store-header');
    if (header) {
      header.style.visibility = 'hidden';
      header.style.opacity = '0';
      header.style.pointerEvents = 'none';
    }

    this.updatePreviewContent(product);

    this.previewStage.classList.add('is-open');
    this.previewStage.setAttribute('aria-hidden', 'false');

    // Ensure mobile viewport is at the top of the card
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Accessibility focus
    setTimeout(() => {
      if (this.closeBtn) this.closeBtn.focus();
    }, 80);

    this.onModalStateChange(true, this.currentIndex);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    const card = document.getElementById('storefrontCard');
    if (card) card.classList.remove('is-preview-active');

    const header = document.querySelector('.store-header');
    if (header) {
      header.style.visibility = '';
      header.style.opacity = '';
      header.style.pointerEvents = '';
    }

    if (this.isDrawerOpen) {
      this.closeDetailedShop();
    }

    this.previewStage.classList.remove('is-open');
    this.previewStage.setAttribute('aria-hidden', 'true');

    // Reset to front view
    this.setView('front');

    // Restore focus
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
    }

    this.onModalStateChange(false, this.currentIndex);
  }

  navigate(direction) {
    const total = PRODUCTS.length;
    this.currentIndex = (this.currentIndex + direction + total) % total;
    const nextProduct = PRODUCTS[this.currentIndex];
    this.updatePreviewContent(nextProduct);
    this.onModalStateChange(true, this.currentIndex);
  }

  updatePreviewContent(product) {
    const totalCount = PRODUCTS.length.toString().padStart(2, '0');
    if (this.counterEl) {
      this.counterEl.textContent = `${product.itemNumber} / ${totalCount}`;
    }
    if (this.titleEl) {
      this.titleEl.textContent = product.name;
    }
    if (this.descriptorEl) {
      this.descriptorEl.textContent = product.descriptor || `${product.category} · ${product.color}`;
    }

    // Image Setup
    if (this.frontImg) {
      this.frontImg.src = product.frontImage;
      this.frontImg.alt = `${product.name} Front`;
    }

    // Back image check
    if (product.hasBackView && product.backImage) {
      if (this.backImg) {
        this.backImg.src = product.backImage;
        this.backImg.alt = `${product.name} Back`;
      }
      if (this.viewToggleBar) {
        this.viewToggleBar.classList.remove('is-disabled');
      }
    } else {
      if (this.backImg) this.backImg.src = '';
      if (this.viewToggleBar) {
        this.viewToggleBar.classList.add('is-disabled');
      }
    }

    // Default to front view
    this.setView('front');
  }

  setView(view) {
    this.isBackView = (view === 'back');

    if (this.isBackView) {
      if (this.flipContainer) this.flipContainer.classList.add('is-flipped');
      if (this.viewFrontBtn) {
        this.viewFrontBtn.classList.remove('active');
        this.viewFrontBtn.setAttribute('aria-pressed', 'false');
      }
      if (this.viewBackBtn) {
        this.viewBackBtn.classList.add('active');
        this.viewBackBtn.setAttribute('aria-pressed', 'true');
      }
    } else {
      if (this.flipContainer) this.flipContainer.classList.remove('is-flipped');
      if (this.viewFrontBtn) {
        this.viewFrontBtn.classList.add('active');
        this.viewFrontBtn.setAttribute('aria-pressed', 'true');
      }
      if (this.viewBackBtn) {
        this.viewBackBtn.classList.remove('active');
        this.viewBackBtn.setAttribute('aria-pressed', 'false');
      }
    }
  }

  openDetailedShop() {
    const product = PRODUCTS[this.currentIndex];
    if (!product || !this.shopDrawer) return;

    this.isDrawerOpen = true;

    // Populate Detailed Drawer Data (matching frame_015)
    if (this.shopCategoryTag) {
      this.shopCategoryTag.textContent = `CATEGORY: ${product.category.toUpperCase()}`;
    }
    if (this.shopTitleEl) {
      this.shopTitleEl.textContent = product.name;
    }
    if (this.shopPriceTag) {
      this.shopPriceTag.textContent = product.priceFormatted;
    }
    if (this.shopDescText) {
      this.shopDescText.textContent = product.description;
    }

    // Main Image & Thumbnails
    if (this.shopMainImg) {
      this.shopMainImg.src = product.frontImage;
      this.shopMainImg.alt = product.name;
    }
    if (this.thumbFrontImg) {
      this.thumbFrontImg.src = product.frontImage;
    }
    if (this.thumbFrontBtn) {
      this.thumbFrontBtn.classList.add('active');
    }

    if (product.hasBackView && product.backImage) {
      if (this.thumbBackImg) this.thumbBackImg.src = product.backImage;
      if (this.thumbBackBtn) {
        this.thumbBackBtn.style.display = 'block';
        this.thumbBackBtn.classList.remove('active');
      }
    } else {
      if (this.thumbBackBtn) this.thumbBackBtn.style.display = 'none';
    }

    // Reset form inputs
    if (this.shopSizeSelect) this.shopSizeSelect.value = '';
    if (this.shopQtyInput) this.shopQtyInput.value = '1';

    this.shopDrawer.classList.add('is-open');
    this.shopDrawer.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      if (this.shopDrawerCloseBtn) this.shopDrawerCloseBtn.focus();
    }, 100);
  }

  closeDetailedShop() {
    if (!this.shopDrawer) return;
    this.isDrawerOpen = false;
    this.shopDrawer.classList.remove('is-open');
    this.shopDrawer.setAttribute('aria-hidden', 'true');

    if (this.viewInShopBtn) this.viewInShopBtn.focus();
  }

  handleAddToCart() {
    const product = PRODUCTS[this.currentIndex];
    if (!product) return;

    const size = this.shopSizeSelect ? this.shopSizeSelect.value : 'M';
    const qty = this.shopQtyInput ? parseInt(this.shopQtyInput.value, 10) || 1 : 1;

    if (!size) {
      alert('Please select a size before adding to your shopping bag.');
      if (this.shopSizeSelect) this.shopSizeSelect.focus();
      return;
    }

    // Increment header cart counter
    this.totalCartItems += qty;
    if (this.cartCounter) {
      this.cartCounter.textContent = this.totalCartItems;
    }
    if (this.cartBtn) {
      this.cartBtn.setAttribute('aria-label', `Shopping bag, ${this.totalCartItems} items`);
    }

    // Show confirmation toast
    this.showToast(`Added to cart: ${product.name} (Size ${size})`);
  }

  showToast(message) {
    if (!this.cartToast || !this.toastMsg) return;
    this.toastMsg.textContent = message;
    this.cartToast.classList.add('is-visible');

    setTimeout(() => {
      this.cartToast.classList.remove('is-visible');
    }, 3200);
  }
}
