// Bebito Roleplay Portal and Store Logic

// Product Mock Database
const products = [];

// Application State
let cart = [];
let activeTab = 'all';
let searchQuery = '';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const storeTabs = document.getElementById('storeTabs');
const searchInput = document.getElementById('searchInput');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');
const productModal = document.getElementById('productModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBody = document.getElementById('modalBody');

// Checkout Form Elements
const checkoutFormModal = document.getElementById('checkoutFormModal');
const checkoutFormOverlay = document.getElementById('checkoutFormOverlay');
const checkoutFormCloseBtn = document.getElementById('checkoutFormCloseBtn');
const checkoutSubmitForm = document.getElementById('checkoutSubmitForm');
const charNameInput = document.getElementById('charName');
const citizenIdInput = document.getElementById('citizenId');

// Checkout Success Elements
const checkoutModal = document.getElementById('checkoutModal');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const checkoutSuccessCloseBtn = document.getElementById('checkoutSuccessCloseBtn');
const summaryCid = document.getElementById('summaryCid');
const summaryName = document.getElementById('summaryName');
const summaryItems = document.getElementById('summaryItems');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadCart();
    renderProducts();
    setupEventListeners();
    initMusicPlayer();
});

// Setup Listeners
function setupEventListeners() {
    // Theme Toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Cart Drawer Toggle
    if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => toggleCart(true));
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => toggleCart(false));
    if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', () => toggleCart(false));

    // Store Category Filter
    if (storeTabs) {
        storeTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                activeTab = e.target.dataset.tab;
                renderProducts();
            }
        });
    }

    // Store Search Input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderProducts();
        });
    }

    // Close Modals
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeModal(productModal));
    if (modalOverlay) modalOverlay.addEventListener('click', () => closeModal(productModal));
    
    if (checkoutFormCloseBtn) checkoutFormCloseBtn.addEventListener('click', () => closeModal(checkoutFormModal));
    if (checkoutFormOverlay) checkoutFormOverlay.addEventListener('click', () => closeModal(checkoutFormModal));
    
    if (checkoutSuccessCloseBtn) checkoutSuccessCloseBtn.addEventListener('click', () => closeModal(checkoutModal));
    if (checkoutOverlay) checkoutOverlay.addEventListener('click', () => closeModal(checkoutModal));

    // Cart Checkout Trigger
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            toggleCart(false);
            openModal(checkoutFormModal);
        });
    }

    // Form Submission
    if (checkoutSubmitForm) {
        checkoutSubmitForm.addEventListener('submit', handleCheckoutSubmit);
    }
}

// Render Products Grid
function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    
    const filteredProducts = products.filter(product => {
        const matchesTab = activeTab === 'all' || product.type === activeTab;
        const matchesSearch = product.title.toLowerCase().includes(searchQuery) || 
                              product.desc.toLowerCase().includes(searchQuery) ||
                              product.tag.toLowerCase().includes(searchQuery);
        return matchesTab && matchesSearch;
    });

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-results" style="grid-column: 1/-1; text-align: center; padding: 60px 40px; color: var(--text-secondary);">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon" style="width: 48px; height: 48px; margin-bottom: 16px; color: var(--accent-color); opacity: 0.8;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <h3 style="font-size: 1.3rem; margin-bottom: 8px; color: var(--text-color);">Bağış Paketleri Çok Yakında!</h3>
                <p style="font-size: 0.95rem;">Mağazamız yakında donet motor, araba, yat ve ev paketleriyle aktif edilecektir.</p>
            </div>
        `;
        return;
    }

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-results" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                Aradığınız kriterlere uygun ürün bulunamadı.
            </div>
        `;
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img class="product-img" src="${product.image}" alt="${product.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22 style=%22background:%231a153b%22><text x=%2250%25%22 y=%2250%25%22 font-family=%22Outfit%22 font-size=%2220%22 fill=%22%23ff005c%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>${product.title}</text></svg>'">
                <span class="product-tag">${product.tag}</span>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-desc">${product.desc.substring(0, 85)}...</p>
                <div class="product-stats">
                    ${Object.entries(product.specs).slice(0, 2).map(([key, val]) => `
                        <div class="stat-row">
                            <span class="stat-label">${key}:</span>
                            <span class="stat-value">${val}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="product-footer">
                    <span class="product-price">${product.price}</span>
                    <button class="btn btn-outline" onclick="viewProductDetails('${product.id}')">İncele</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// Modal Handlers
function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    document.body.style.overflow = '';
}

// View Details Modal
window.viewProductDetails = function(id) {
    const product = products.find(p => p.id === id);
    if (!product || !modalBody) return;

    modalBody.innerHTML = `
        <div class="detail-modal-grid">
            <img class="detail-img" src="${product.image}" alt="${product.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22 style=%22background:%231a153b%22><text x=%2250%25%22 y=%2250%25%22 font-family=%22Outfit%22 font-size=%2224%22 fill=%22%23ff005c%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22>${product.title}</text></svg>'">
            <div>
                <span class="badge" style="margin-bottom: 12px;">${product.tag}</span>
                <h2 class="detail-title">${product.title}</h2>
                <p class="detail-desc">${product.desc}</p>
                
                <div class="detail-specs">
                    <h4 style="margin-bottom: 12px; font-size: 0.95rem; text-transform: uppercase; color: var(--text-secondary);">Özellikler</h4>
                    <div class="spec-grid">
                        ${Object.entries(product.specs).map(([key, val]) => `
                            <div class="spec-item">
                                <span class="spec-title">${key}</span>
                                <span class="spec-val">${val}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="detail-footer">
                    <span class="detail-price">${product.price}</span>
                    <button class="btn btn-primary" onclick="addToCart('${product.id}'); closeModal(productModal);">Sepete Ekle</button>
                </div>
            </div>
        </div>
    `;
    
    openModal(productModal);
}

// Cart Drawer Handlers
function toggleCart(open) {
    if (!cartDrawer) return;
    if (open) {
        cartDrawer.classList.add('open');
    } else {
        cartDrawer.classList.remove('open');
    }
}

// Add Item To Cart
window.addToCart = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Check if already in cart
    if (cart.some(item => item.id === id)) {
        alert('Bu ürün zaten sepetinizde bulunuyor.');
        return;
    }

    cart.push(product);
    updateCartUI();
    saveCart();
    toggleCart(true); // Auto-open cart to show added item
}

// Remove Item From Cart
window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
    saveCart();
}

// Update Cart Count and Details
function updateCartUI() {
    // Count Badge
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = cart.length);

    // List Items
    if (!cartItemsList) return;
    if (cart.length === 0) {
        cartItemsList.innerHTML = `<div class="empty-cart-message">Sepetiniz şu anda boş.</div>`;
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.image}" alt="${item.title}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22 style=%22background:%231a153b%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%231a153b%22/></svg>'">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${item.price}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Kaldır">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon" style="width:16px; height:16px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `).join('');
        if (checkoutBtn) checkoutBtn.disabled = false;
    }

    // Total Price
    if (cartTotalPrice) {
        const total = cart.reduce((sum, item) => sum + item.priceVal, 0);
        cartTotalPrice.textContent = `${total.toFixed(2)} TL`;
    }
}

// Checkout Submit Handle
function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    if (!charNameInput || !citizenIdInput) return;
    const charName = charNameInput.value.trim();
    const citizenId = citizenIdInput.value.trim();

    if (!charName || !citizenId) return;

    // Load success details
    if (summaryCid) summaryCid.textContent = citizenId;
    if (summaryName) summaryName.textContent = charName;
    if (summaryItems) {
        summaryItems.innerHTML = cart.map(item => `<li>${item.title} (${item.price})</li>`).join('');
    }

    // Clear cart
    cart = [];
    updateCartUI();
    saveCart();

    // Switch Modals
    closeModal(checkoutFormModal);
    openModal(checkoutModal);

    // Reset Form
    if (checkoutSubmitForm) checkoutSubmitForm.reset();
}

// LocalStorage Cart Caching
function saveCart() {
    localStorage.setItem('bebito_cart', JSON.stringify(cart));
}

function loadCart() {
    const cached = localStorage.getItem('bebito_cart');
    if (cached) {
        try {
            const cachedItems = JSON.parse(cached);
            cart = cachedItems.map(cachedItem => products.find(p => p.id === cachedItem.id)).filter(Boolean);
            updateCartUI();
        } catch(e) {
            localStorage.removeItem('bebito_cart');
        }
    }
}

// Theme Handlers
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('bebito_theme', 'light');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('bebito_theme', 'dark');
    }
}

function loadTheme() {
    const cachedTheme = localStorage.getItem('bebito_theme');
    const body = document.body;
    
    if (cachedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme'); // default
    }
}

// --- Music Player Logic ---
const playlist = [
    { title: "Eğme Boyun 2.0", src: "images/bg-music.mp3" },
    { title: "LVBEL C5, AKDO - MUSTAFA", src: "images/mustafa.mp3" }
];
let currentSongIndex = 0;

function initMusicPlayer() {
    const btn = document.getElementById('music-toggle');
    const btnPrev = document.getElementById('music-prev');
    const btnNext = document.getElementById('music-next');
    const vol = document.getElementById('volume-slider');
    const audio = document.getElementById('bg-music');
    const audioSource = document.getElementById('bg-music-source');
    const playIcon = document.getElementById('icon-play');
    const pauseIcon = document.getElementById('icon-pause');
    const nameDisplay = document.getElementById('music-name-display');
    
    if (!btn || !audio || !audioSource) return;
    
    audio.volume = vol ? parseFloat(vol.value) : 0.2;
    
    function loadSong(index) {
        currentSongIndex = index;
        const song = playlist[currentSongIndex];
        
        // Update the audio element source directly for better browser compatibility
        audio.src = song.src;
        
        if (nameDisplay) nameDisplay.textContent = song.title;
        audio.load();
        
        audio.play().then(() => {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }).catch((err) => {
            console.log('Autoplay engellendi veya ses dosyası yüklenemedi:', err);
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        });
    }

    btn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            }).catch(err => console.log('Ses açılamadı:', err));
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    });

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            let newIndex = currentSongIndex - 1;
            if (newIndex < 0) newIndex = playlist.length - 1;
            loadSong(newIndex);
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            let newIndex = currentSongIndex + 1;
            if (newIndex >= playlist.length) newIndex = 0;
            loadSong(newIndex);
        });
    }

    if (vol) {
        vol.addEventListener('input', function() {
            audio.volume = parseFloat(this.value);
        });
    }
    
    audio.addEventListener('ended', () => {
        let newIndex = currentSongIndex + 1;
        if (newIndex >= playlist.length) newIndex = 0;
        loadSong(newIndex);
    });
}
