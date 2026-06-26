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
    
    // Auth and Profile selectors
    const authBtn = document.getElementById('auth-btn');
    const authModal = document.getElementById('auth-modal');
    const authClose = document.getElementById('auth-modal-close');
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const authTabBtns = document.querySelectorAll('.auth-tab-btn');
    const authFormContents = document.querySelectorAll('.auth-form-content');
    
    const profileModal = document.getElementById('profile-modal');
    const profileClose = document.getElementById('profile-modal-close');
    const profileEmailVal = document.getElementById('profile-email-val');
    const profilePhoneVal = document.getElementById('profile-phone-val');
    const profileOrdersList = document.getElementById('profile-orders-list');
    const profileLogoutBtn = document.getElementById('profile-logout-btn');
    
    // Settings elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-modal-close');
    const settingsTabBtns = document.querySelectorAll('.settings-tab-btn');
    const settingsTabContents = document.querySelectorAll('.settings-tab-content');
    const settingsSaveBtn = document.getElementById('settings-save-btn');
    const tgTokenInput = document.getElementById('settings-tg-token');
    const tgChatIdInput = document.getElementById('settings-tg-chatid');
    const w3KeyInput = document.getElementById('settings-w3-key');
    
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
        
        const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);
        
        // Format products list for Telegram
        let itemsListText = cart.map(item => `- *${item.name}* (${item.price.toLocaleString('ru-RU')} руб.)`).join('\n');
        
        const subject = `Новый заказ на сборку - ${name}`;
        const telegramText = `🔔 *Новый заказ на сборку!*\n\n👤 *Заказчик:* ${name}\n📞 *Контакты:* ${phone}\n\n📦 *Выбранные системы:*\n${itemsListText}\n\n💰 *Итого:* *${totalPrice.toLocaleString('ru-RU')} руб.*`;
        
        const rawData = {
            name: name,
            phone: phone,
            total_price: `${totalPrice.toLocaleString('ru-RU')} руб.`,
            items: cart.map(item => `${item.name} (${item.price} руб.)`).join(', ')
        };
        
        // Send Notification
        sendFormNotification(subject, telegramText, rawData);
        
        // If user is logged in, save order to their order history
        const loggedUserJson = localStorage.getItem('drons_logged_in_user');
        if (loggedUserJson) {
            const user = JSON.parse(loggedUserJson);
            const userOrders = JSON.parse(localStorage.getItem(`drons_orders_${user.email}`) || '[]');
            const newOrder = {
                date: new Date().toLocaleDateString('ru-RU'),
                time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                items: cart.map(item => item.name),
                totalPrice: `${totalPrice.toLocaleString('ru-RU')} руб.`
            };
            userOrders.push(newOrder);
            localStorage.setItem(`drons_orders_${user.email}`, JSON.stringify(userOrders));
        }
        
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
        
        const subject = `Запрос на спец-конфигурацию - ${name}`;
        const telegramText = `📞 *Новый запрос на спец-конфигурацию!*\n\n👤 *Контактное лицо / Позывной:* ${name}\n💬 *Способ связи:* ${contact}`;
        
        const rawData = {
            name: name,
            contact_info: contact
        };
        
        // Send Notification
        sendFormNotification(subject, telegramText, rawData);
        
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

    // --- User Authentication & Client Dashboard Logic ---
    function checkAuthState() {
        const loggedUserJson = localStorage.getItem('drons_logged_in_user');
        if (loggedUserJson) {
            const user = JSON.parse(loggedUserJson);
            authBtn.textContent = `👤 ${user.email}`;
            authBtn.classList.remove('btn-outline');
            authBtn.classList.add('btn-primary');
        } else {
            authBtn.textContent = 'Войти';
            authBtn.classList.remove('btn-primary');
            authBtn.classList.add('btn-outline');
        }
    }

    function openAuthOrProfile() {
        const loggedUserJson = localStorage.getItem('drons_logged_in_user');
        if (loggedUserJson) {
            // Open profile
            const user = JSON.parse(loggedUserJson);
            profileEmailVal.textContent = user.email;
            profilePhoneVal.textContent = user.phone;
            
            // Generate order history
            const orders = JSON.parse(localStorage.getItem(`drons_orders_${user.email}`) || '[]');
            profileOrdersList.innerHTML = '';
            
            if (orders.length === 0) {
                profileOrdersList.innerHTML = '<div class="order-history-empty">У вас пока нет оформленных заказов.</div>';
            } else {
                orders.forEach(order => {
                    const card = document.createElement('div');
                    card.className = 'order-history-card';
                    card.innerHTML = `
                        <div class="order-history-header">
                            <span>Заказ от ${order.date} ${order.time}</span>
                            <span style="color: var(--color-cyan);">${order.totalPrice}</span>
                        </div>
                        <div class="order-history-items">
                            ${order.items.join(', ')}
                        </div>
                    `;
                    profileOrdersList.appendChild(card);
                });
            }
            
            profileModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            // Open login/register modal
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeAuth() {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function closeProfile() {
        profileModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (authBtn) authBtn.addEventListener('click', openAuthOrProfile);
    if (authClose) authClose.addEventListener('click', closeAuth);
    if (profileClose) profileClose.addEventListener('click', closeProfile);

    // Close on overlay clicks
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuth();
    });
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) closeProfile();
    });

    // Auth tabs switching
    authTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            authTabBtns.forEach(b => b.classList.remove('active'));
            authFormContents.forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            const targetId = e.target.dataset.tab;
            if (targetId === 'tab-login') {
                loginForm.classList.add('active');
            } else {
                registerForm.classList.add('active');
            }
        });
    });

    // Handling Registration
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const password = document.getElementById('register-password').value.trim();
        
        let users = JSON.parse(localStorage.getItem('drons_users') || '[]');
        const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        const phoneExists = users.some(u => u.phone === phone);
        
        if (emailExists) {
            alert('Пользователь с такой почтой уже зарегистрирован!');
            return;
        }
        if (phoneExists) {
            alert('Пользователь с таким номером телефона уже зарегистрирован!');
            return;
        }
        
        const newUser = { email, phone, password };
        users.push(newUser);
        localStorage.setItem('drons_users', JSON.stringify(users));
        
        // Log in the user automatically
        localStorage.setItem('drons_logged_in_user', JSON.stringify(newUser));
        checkAuthState();
        
        registerForm.reset();
        closeAuth();
    });

    // Handling Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value.trim();
        
        const users = JSON.parse(localStorage.getItem('drons_users') || '[]');
        const user = users.find(u => 
            (u.email.toLowerCase() === identifier || u.phone === identifier) && 
            u.password === password
        );
        
        if (user) {
            localStorage.setItem('drons_logged_in_user', JSON.stringify(user));
            checkAuthState();
            loginForm.reset();
            closeAuth();
        } else {
            alert('Неверный позывной или пароль!');
        }
    });

    // Logout
    profileLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('drons_logged_in_user');
        checkAuthState();
        closeProfile();
    });

    // Initialize Auth state check
    checkAuthState();

    // --- Settings Modal Logic ---
    function openSettings() {
        // Load saved values
        tgTokenInput.value = localStorage.getItem('drons_tg_token') || '';
        tgChatIdInput.value = localStorage.getItem('drons_tg_chatid') || '';
        w3KeyInput.value = localStorage.getItem('drons_w3_key') || 'fdc1e6ce-9cd5-4a54-8ad4-d789b24710a8';
        
        settingsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSettings() {
        settingsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    if (settingsClose) settingsClose.addEventListener('click', closeSettings);
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettings();
    });

    // Tab switching
    settingsTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            settingsTabBtns.forEach(b => b.classList.remove('active'));
            settingsTabContents.forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            const targetId = e.target.dataset.tab;
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Save settings
    if (settingsSaveBtn) {
        settingsSaveBtn.addEventListener('click', () => {
            localStorage.setItem('drons_tg_token', tgTokenInput.value.trim());
            localStorage.setItem('drons_tg_chatid', tgChatIdInput.value.trim());
            localStorage.setItem('drons_w3_key', w3KeyInput.value.trim());
            
            alert('Настройки уведомлений успешно сохранены!');
            closeSettings();
        });
    }

    // --- Helper to Send Real Notification ---
    async function sendFormNotification(subject, textContent, rawData) {
        const tgToken = localStorage.getItem('drons_tg_token');
        const tgChatId = localStorage.getItem('drons_tg_chatid');
        const w3Key = localStorage.getItem('drons_w3_key') || 'fdc1e6ce-9cd5-4a54-8ad4-d789b24710a8';
        
        let sentAny = false;
        
        // 1. Send via Telegram Bot
        if (tgToken && tgChatId) {
            try {
                const url = `https://api.telegram.org/bot${tgToken}/sendMessage`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: tgChatId,
                        text: textContent,
                        parse_mode: 'Markdown'
                    })
                });
                if (response.ok) sentAny = true;
            } catch (err) {
                console.error("Telegram API Error:", err);
            }
        }
        
        // 2. Send via Web3Forms
        if (w3Key) {
            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_key: w3Key,
                        subject: subject,
                        from_name: 'TACTICAL DRONS',
                        ...rawData
                    })
                });
                if (response.ok) sentAny = true;
            } catch (err) {
                console.error("Web3Forms API Error:", err);
            }
        }
        
        if (!sentAny) {
            console.log("Заявка симулирована. Настройте Telegram или Email в настройках (иконка шестеренки), чтобы получать реальные уведомления!");
        }
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
