document.addEventListener('DOMContentLoaded', () => {
    // --- Cart State ---
    let cart = [];
    
    // --- DOM Elements ---
    // Navigation
    const header = document.getElementById('navbar');
    
    // Cart Drawer
    const cartBtn = document.getElementById('cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    const cartTotalPriceVal = document.getElementById('cart-total-price-val');
    const cartCountBadge = document.getElementById('cart-count');
    const checkoutForm = document.getElementById('cart-checkout-form-elem');
    
    // Forms & Modals
    const leadForm = document.getElementById('lead-form');
    const successModal = document.getElementById('success-modal');
    const successModalClose = document.getElementById('success-modal-close');
    
    // --- Sticky Header Scroll Effect ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.backgroundColor = 'rgba(10, 12, 15, 0.9)';
            header.style.height = '70px';
        } else {
            header.style.padding = '0';
            header.style.backgroundColor = 'rgba(10, 12, 15, 0.75)';
            header.style.height = '80px';
        }
    });

    // --- Cart Functions ---
    function openCart() {
        cartDrawer.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    function closeCart() {
        cartDrawer.classList.remove('active');
        document.body.style.overflow = ''; // Unlock background scroll
    }

    function updateCartUI() {
        // Clear dynamically loaded items
        const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
        existingItems.forEach(item => item.remove());
        
        if (cart.length === 0) {
            cartEmpty.style.display = 'flex';
            cartFooter.style.display = 'none';
            cartCountBadge.textContent = '0';
        } else {
            cartEmpty.style.display = 'none';
            cartFooter.style.display = 'block';
            
            let total = 0;
            let count = 0;
            
            cart.forEach((item, index) => {
                total += item.price;
                count++;
                
                const itemElem = document.createElement('div');
                itemElem.className = 'cart-item';
                itemElem.innerHTML = `
                    <div class="cart-item-details">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">${item.price.toLocaleString('ru-RU')} руб.</span>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">Удалить</button>
                `;
                cartItemsContainer.appendChild(itemElem);
            });
            
            cartTotalPriceVal.textContent = `${total.toLocaleString('ru-RU')} руб.`;
            cartCountBadge.textContent = count;

            // Wire remove buttons
            const removeButtons = cartItemsContainer.querySelectorAll('.cart-item-remove');
            removeButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    removeFromCart(idx);
                });
            });
        }
    }

    function addToCart(name, price) {
        cart.push({ 
            name, 
            price: parseInt(price)
        });
        updateCartUI();
        openCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartUI();
    }

    // --- Wire Events for Cart Interaction ---
    // Open/Close
    cartBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Add tactical drones to cart from catalog
    const addCatalogBtns = document.querySelectorAll('.add-to-cart-btn');
    addCatalogBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = e.target.dataset.name;
            const price = e.target.dataset.price;
            addToCart(name, price);
        });
    });

    // Add empty cart CTA trigger to close drawer and scroll to catalog
    document.getElementById('cart-empty-cta').addEventListener('click', (e) => {
        closeCart();
    });

    // --- Order Placement and Form Submissions ---
    
    // Form inside Checkout Drawer
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('checkout-name').value;
        const phone = document.getElementById('checkout-phone').value;
        
        // Log mockup data (simulating post request)
        console.log("ORDER PLACED:", {
            customer: { name, phone },
            items: cart,
            totalPrice: cart.reduce((acc, item) => acc + item.price, 0)
        });
        
        // Success workflow
        closeCart();
        cart = [];
        updateCartUI();
        checkoutForm.reset();
        
        // Show success modal
        successModal.classList.add('active');
    });

    // Landing Page Lead Form (Consultation)
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('lead-name').value;
        const contact = document.getElementById('lead-contact').value;
        
        console.log("LEAD CAPTURED:", { name, contact });
        
        leadForm.reset();
        
        // Show success modal
        successModal.classList.add('active');
    });

    // Close success modal
    successModalClose.addEventListener('click', () => {
        successModal.classList.remove('active');
    });

    // Close success modal on overlay click
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

    // --- Drone Detail Modal Logic ---
    const detailModal = document.getElementById('detail-modal');
    const modalImg = document.getElementById('modal-img');
    const modalBadge = document.getElementById('modal-badge');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDesc = document.getElementById('modal-desc');
    const modalSpecs = document.getElementById('modal-specs');
    const modalBuyBtn = document.getElementById('modal-buy-btn');
    const detailModalClose = document.getElementById('detail-modal-close');
    const detailModalOverlay = document.getElementById('detail-modal-overlay');

    let activeDroneData = null;

    const droneCards = document.querySelectorAll('.drone-card');
    droneCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent opening modal if clicking the action button inside the card
            if (e.target.closest('.add-to-cart-btn')) {
                return;
            }
            
            const img = card.querySelector('.drone-card-img').src;
            const badge = card.querySelector('.drone-badge');
            const title = card.querySelector('.drone-title').textContent;
            const price = card.querySelector('.drone-price').textContent;
            const desc = card.dataset.details || card.querySelector('.drone-desc').textContent;
            const specsHtml = card.querySelector('.drone-specs-list').innerHTML;
            
            // Get buy button data
            const buyBtn = card.querySelector('.add-to-cart-btn');
            activeDroneData = {
                name: buyBtn.dataset.name,
                price: buyBtn.dataset.price
            };

            // Set content
            modalImg.src = img;
            modalImg.alt = title;
            modalTitle.textContent = title;
            modalPrice.textContent = price;
            modalDesc.textContent = desc;
            
            // Map specs
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = specsHtml;
            const specs = tempDiv.querySelectorAll('.drone-spec');
            specs.forEach(s => {
                s.className = 'detail-modal-spec';
            });
            modalSpecs.innerHTML = tempDiv.innerHTML;

            // Set badge
            if (badge) {
                modalBadge.textContent = badge.textContent;
                modalBadge.style.display = 'block';
                modalBadge.className = 'detail-modal-badge';
                if (badge.classList.contains('badge-cyan')) modalBadge.classList.add('badge-cyan');
                if (badge.classList.contains('badge-orange')) modalBadge.classList.add('badge-orange');
                if (badge.classList.contains('badge-purple')) modalBadge.classList.add('badge-purple');
            } else {
                modalBadge.style.display = 'none';
            }

            // Open Modal
            detailModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock background scroll
        });
    });

    function closeDetailModal() {
        detailModal.classList.remove('active');
        if (!cartDrawer.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    }

    if (detailModalClose) {
        detailModalClose.addEventListener('click', closeDetailModal);
    }
    if (detailModalOverlay) {
        detailModalOverlay.addEventListener('click', closeDetailModal);
    }

    // Modal Buy Button Click
    if (modalBuyBtn) {
        modalBuyBtn.addEventListener('click', () => {
            if (activeDroneData) {
                addToCart(activeDroneData.name, activeDroneData.price);
                closeDetailModal();
            }
        });
    }

    // --- Catalog Filtering and Search Logic ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('catalog-search');
    const catalogDrones = document.querySelectorAll('.drones-grid .drone-card');

    function getCategoryFromBadge(badgeText) {
        const text = badgeText.trim().toUpperCase();
        if (["РАЗВЕДКА", "ТЕПЛОВИЗОР", "КОМПАКТНЫЙ", "МИКРО-ЗОНД", "ИНДОР-ЗОНД", "КВАДРОКОПТЕР"].includes(text)) {
            return 'recon';
        }
        if (["ШТУРМОВОЙ", "БОМБАРДИРОВЩИК", "ПЕРЕХВАТЧИК"].includes(text)) {
            return 'strike';
        }
        if (["ГРУЗОВОЙ", "ПРОМЫШЛЕННЫЙ"].includes(text)) {
            return 'cargo';
        }
        if (text === "ДАЛЬНОЛЕТ") {
            return 'longrange';
        }
        if (text === "ПРОРЫВ РЭБ") {
            return 'antireb';
        }
        return 'all';
    }

    function filterCatalog() {
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        const currentFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
        const searchQuery = searchInput.value.toLowerCase().trim();

        catalogDrones.forEach(card => {
            const title = card.querySelector('.drone-title').textContent.toLowerCase();
            const desc = card.querySelector('.drone-desc').textContent.toLowerCase();
            const details = (card.dataset.details || "").toLowerCase();
            const badge = card.querySelector('.drone-badge');
            const badgeText = badge ? badge.textContent : "";
            const category = getCategoryFromBadge(badgeText);

            // Filter match
            const matchesFilter = (currentFilter === 'all' || category === currentFilter);

            // Search match
            const matchesSearch = !searchQuery || 
                                  title.includes(searchQuery) || 
                                  desc.includes(searchQuery) || 
                                  details.includes(searchQuery);

            if (matchesFilter && matchesSearch) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Filter button clicks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterCatalog();
        });
    });

    // Search input typing
    if (searchInput) {
        searchInput.addEventListener('input', filterCatalog);
    }
});
