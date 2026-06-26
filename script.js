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
    
    // Configurator Options
    const configCards = document.querySelectorAll('.config-card');
    const specWeightVal = document.getElementById('spec-weight-val');
    const specSpeedVal = document.getElementById('spec-speed-val');
    const specVideoVal = document.getElementById('spec-video-val');
    const configTotalPrice = document.getElementById('config-total-price');
    const configAddCartBtn = document.getElementById('config-add-cart');
    
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

    // --- Configurator Logic ---
    function updateConfigurator() {
        let totalPriceUah = 0;
        let totalPriceUsd = 0;
        let totalWeight = 0;
        let baseSpeed = 0;
        let speedModifier = 0;
        let videoType = "Analog FPV";
        let frameName = "Тактична 7\"";

        // Get checked inputs
        const selectedFrame = document.querySelector('input[name="frame"]:checked');
        const selectedBattery = document.querySelector('input[name="battery"]:checked');
        const selectedVideo = document.querySelector('input[name="video"]:checked');
        const selectedRx = document.querySelector('input[name="rx"]:checked');

        if (selectedFrame) {
            const card = selectedFrame.closest('.config-card');
            totalPriceUah += parseInt(card.dataset.priceUah);
            totalPriceUsd += parseInt(card.dataset.priceUsd);
            totalWeight += parseInt(card.dataset.weight);
            baseSpeed = parseInt(card.dataset.speed);
            
            if (selectedFrame.value === 'freestyle') frameName = '7" Тактична розвідка';
            if (selectedFrame.value === 'racing') frameName = '10" Вантажна посилена';
            if (selectedFrame.value === 'whoop') frameName = '8" Гібридна розвідка';
        }

        if (selectedBattery) {
            const card = selectedBattery.closest('.config-card');
            totalPriceUah += parseInt(card.dataset.priceUah);
            totalPriceUsd += parseInt(card.dataset.priceUsd);
            totalWeight += parseInt(card.dataset.weight);
            speedModifier += parseInt(card.dataset.speed);
        }

        if (selectedVideo) {
            const card = selectedVideo.closest('.config-card');
            totalPriceUah += parseInt(card.dataset.priceUah);
            totalPriceUsd += parseInt(card.dataset.priceUsd);
            totalWeight += parseInt(card.dataset.weight);
            
            if (selectedVideo.value === 'analog') videoType = 'Analog FPV Link';
            if (selectedVideo.value === 'vista') videoType = 'Digital HD (720p)';
            if (selectedVideo.value === 'o3') videoType = 'Тепловізор + HD';
        }

        if (selectedRx) {
            const card = selectedRx.closest('.config-card');
            totalPriceUah += parseInt(card.dataset.priceUah);
            totalPriceUsd += parseInt(card.dataset.priceUsd);
            totalWeight += parseInt(card.dataset.weight);
        }

        // Calculate and update UI
        const calculatedSpeed = baseSpeed + speedModifier;
        
        specWeightVal.textContent = `${totalWeight} г`;
        specSpeedVal.textContent = `~ ${calculatedSpeed} км/год`;
        specVideoVal.textContent = videoType;
        configTotalPrice.textContent = `${totalPriceUah.toLocaleString('uk-UA')} грн / $${totalPriceUsd}`;

        // Store selected options info on the Add to Cart button for easy reading
        configAddCartBtn.dataset.priceUah = totalPriceUah;
        configAddCartBtn.dataset.priceUsd = totalPriceUsd;
        configAddCartBtn.dataset.name = `Кастом FPV (${frameName})`;
    }

    // Config option clicks
    configCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const input = this.querySelector('input[type="radio"]');
            const groupName = input.name;
            
            // Uncheck all other sibling cards in the group
            const siblingCards = document.querySelectorAll(`input[name="${groupName}"]`);
            siblingCards.forEach(sib => {
                sib.closest('.config-card').classList.remove('checked');
            });
            
            // Check this card
            input.checked = true;
            this.classList.add('checked');
            
            // Recalculate config values
            updateConfigurator();
        });
    });

    // Run configurator update on load to set initial values
    updateConfigurator();

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
            
            let totalUah = 0;
            let totalUsd = 0;
            let count = 0;
            
            cart.forEach((item, index) => {
                totalUah += item.priceUah;
                totalUsd += item.priceUsd;
                count++;
                
                const itemElem = document.createElement('div');
                itemElem.className = 'cart-item';
                itemElem.innerHTML = `
                    <div class="cart-item-details">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">${item.priceUah.toLocaleString('uk-UA')} грн / $${item.priceUsd}</span>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">Видалити</button>
                `;
                cartItemsContainer.appendChild(itemElem);
            });
            
            cartTotalPriceVal.textContent = `${totalUah.toLocaleString('uk-UA')} грн / $${totalUsd}`;
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

    function addToCart(name, priceUah, priceUsd) {
        cart.push({ 
            name, 
            priceUah: parseInt(priceUah), 
            priceUsd: parseInt(priceUsd) 
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
            const priceUah = e.target.dataset.priceUah;
            const priceUsd = e.target.dataset.priceUsd;
            addToCart(name, priceUah, priceUsd);
        });
    });

    // Add custom builder configuration to cart
    configAddCartBtn.addEventListener('click', (e) => {
        const name = e.target.dataset.name;
        const priceUah = e.target.dataset.priceUah;
        const priceUsd = e.target.dataset.priceUsd;
        addToCart(name, priceUah, priceUsd);
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
            totalPriceUah: cart.reduce((acc, item) => acc + item.priceUah, 0),
            totalPriceUsd: cart.reduce((acc, item) => acc + item.priceUsd, 0)
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
});
