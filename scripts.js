// ===== CONFIGURAÇÕES GLOBAIS =====
let cart = [];
let isCartOpen = false;

// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        
        // Inicializar animações após carregamento
        setTimeout(() => {
            initializeAnimations();
        }, 500);
    }, 2000);
});

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateFooterDate();
    loadCartFromStorage();
    initializeScrollAnimations();
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Navegação suave
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Carrinho
    document.getElementById('cart-toggle').addEventListener('click', toggleCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);

    // Produtos
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });

    // Quantidade
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityChange);
    });

    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });

    // Busca
    document.getElementById('search-input').addEventListener('input', handleSearch);

    // Wishlist
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', handleWishlist);
    });

    // Menu mobile
    document.getElementById('menu-toggle').addEventListener('click', toggleMobileMenu);

    // Scroll header
    window.addEventListener('scroll', handleHeaderScroll);

    // Newsletter
    document.querySelector('.newsletter button').addEventListener('click', handleNewsletter);
}

// ===== NAVEGAÇÃO =====
function handleNavigation(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href');
    
    // Remover classe active de todos os links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Adicionar classe active ao link clicado
    e.target.classList.add('active');
    
    // Scroll suave para a seção
    if (targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// ===== HEADER SCROLL =====
function handleHeaderScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    }
}

// ===== CARRINHO DE COMPRAS =====
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (isCartOpen) {
        closeCart();
    } else {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
        isCartOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Animação de entrada
        cartSidebar.style.animation = 'slideInRight 0.3s ease';
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
    isCartOpen = false;
    document.body.style.overflow = 'auto';
}

function addToCart(e) {
    const btn = e.target.closest('.add-to-cart-btn');
    const productCard = btn.closest('.product-card');
    const quantityElement = productCard.querySelector('.qty-value');
    
    const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        quantity: parseInt(quantityElement.textContent),
        image: productCard.querySelector('img').src
    };

    // Verificar se o produto já existe no carrinho
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += product.quantity;
    } else {
        cart.push(product);
    }

    // Animação do botão
    btn.style.transform = 'scale(0.95)';
    btn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
        btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar';
    }, 1000);

    updateCartUI();
    saveCartToStorage();
    showToast('Produto adicionado ao carrinho!');
    
    // Animação de pulso no ícone do carrinho
    const cartIcon = document.getElementById('cart-toggle');
    cartIcon.style.animation = 'pulse 0.6s ease';
    setTimeout(() => {
        cartIcon.style.animation = '';
    }, 600);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCartToStorage();
    showToast('Produto removido do carrinho!');
}

function updateCartQuantity(productId, change) {
    const productIndex = cart.findIndex(item => item.id === productId);
    if (productIndex > -1) {
        cart[productIndex].quantity += change;
        if (cart[productIndex].quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
            saveCartToStorage();
        }
    }
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    // Atualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Atualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2).replace('.', ',');
    
    // Atualizar itens do carrinho
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
                <small>Adicione alguns doces deliciosos!</small>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                    <div class="cart-item-quantity">
                        <button onclick="updateCartQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ===== QUANTIDADE DE PRODUTOS =====
function handleQuantityChange(e) {
    const btn = e.target;
    const quantityContainer = btn.closest('.quantity-selector');
    const quantityValue = quantityContainer.querySelector('.qty-value');
    let currentValue = parseInt(quantityValue.textContent);
    
    if (btn.classList.contains('plus')) {
        currentValue++;
    } else if (btn.classList.contains('minus') && currentValue > 1) {
        currentValue--;
    }
    
    quantityValue.textContent = currentValue;
    
    // Animação
    quantityValue.style.transform = 'scale(1.2)';
    setTimeout(() => {
        quantityValue.style.transform = 'scale(1)';
    }, 150);
}

// ===== FILTROS =====
function handleFilter(e) {
    const filterBtn = e.target;
    const filterValue = filterBtn.dataset.filter;
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    filterBtn.classList.add('active');
    
    // Filtrar produtos
    const products = document.querySelectorAll('.product-card');
    products.forEach((product, index) => {
        const category = product.dataset.category;
        
        if (filterValue === 'all' || category === filterValue) {
            product.style.display = 'block';
            product.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s both`;
        } else {
            product.style.display = 'none';
        }
    });
}

// ===== BUSCA =====
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const productName = product.querySelector('.product-title').textContent.toLowerCase();
        const productDescription = product.querySelector('.product-description').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || productDescription.includes(searchTerm)) {
            product.style.display = 'block';
            product.style.opacity = '1';
        } else {
            product.style.display = 'none';
            product.style.opacity = '0';
        }
    });
}

// ===== WISHLIST =====
function handleWishlist(e) {
    const btn = e.target.closest('.wishlist-btn');
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.style.color = '#e74c3c';
        showToast('Adicionado à lista de desejos!');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.style.color = '';
        showToast('Removido da lista de desejos!');
    }
    
    // Animação
    btn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 200);
}

// ===== CHECKOUT =====
function handleCheckout() {
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `Olá! Gostaria de finalizar minha compra:\n\n${cart.map(item => 
        `${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`
    ).join('\n')}\n\nTotal: R$ ${total.toFixed(2).replace('.', ',')}`;
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    showToast('Redirecionando para WhatsApp...');
}

// ===== NEWSLETTER =====
function handleNewsletter() {
    const emailInput = document.querySelector('.newsletter input');
    const email = emailInput.value.trim();
    
    if (email && isValidEmail(email)) {
        showToast('E-mail cadastrado com sucesso!');
        emailInput.value = '';
    } else {
        showToast('Por favor, insira um e-mail válido!');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== MENU MOBILE =====
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const menuToggle = document.getElementById('menu-toggle');
    
    nav.classList.toggle('mobile-open');
    menuToggle.classList.toggle('active');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== STORAGE =====
function saveCartToStorage() {
    localStorage.setItem('docesDeliciososCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('docesDeliciososCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// ===== ANIMAÇÕES =====
function initializeAnimations() {
    // Animação dos elementos flutuantes
    const floatingElements = document.querySelectorAll('.floating-doce');
    floatingElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Observador de interseção para animações de scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    document.querySelectorAll('.product-card, .section-header').forEach(el => {
        observer.observe(el);
    });
}

function initializeScrollAnimations() {
    // Parallax effect para o hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// ===== EFEITOS ESPECIAIS =====
// Partículas no hero
function createParticles() {
    const hero = document.querySelector('.hero');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        hero.appendChild(particle);
    }
}

// Cursor personalizado para produtos
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'pointer';
    });
    
    card.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'default';
    });
});

// ===== FOOTER =====
function updateFooterDate() {
    const footerDate = document.getElementById('footer-date');
    if (footerDate) {
        footerDate.textContent = `© ${new Date().getFullYear()} Doces Deliciosos. Todos os direitos reservados.`;
    }
}

// ===== SMOOTH SCROLL POLYFILL =====
if (!('scrollBehavior' in document.documentElement.style)) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/iamdustan/smoothscroll@master/src/smoothscroll.js';
    document.head.appendChild(script);
}

// ===== LAZY LOADING PARA IMAGENS =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce para eventos de scroll e resize
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce aos eventos de scroll
window.addEventListener('scroll', debounce(handleHeaderScroll, 10));

// ===== EASTER EGGS =====
// Konami Code
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        showToast('🎉 Código secreto ativado! Desconto especial aplicado!');
        document.body.style.animation = 'rainbow 2s ease infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// CSS para o easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

console.log('🍭 Doces Deliciosos E-commerce carregado com sucesso!');
console.log('💡 Dica: Tente o código Konami para uma surpresa especial!');
