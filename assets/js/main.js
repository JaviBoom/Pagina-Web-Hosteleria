const PRODUCTS_STORAGE_KEY = 'merigon_products';
const VISIT_COUNTER_NAMESPACE = 'merigonsweets-javiboom';
const VISIT_COUNTER_KEY = 'store-visits';
const VISIT_SESSION_KEY = 'merigon_visit_registered';

const defaultProducts = [
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Chocolate',
        desc: 'Chocolate belga y crema fresca',
        price: '€3.50 / unidad',
        image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Tarrinas',
        tags: ['Top ventas', 'Intenso']
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Vainilla',
        desc: 'Vainilla natural y crumble',
        price: '€3.20 / unidad',
        image: 'https://images.pexels.com/photos/806363/pexels-photo-806363.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Tarrinas',
        tags: ['Suave', 'Clasica']
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Fresa',
        desc: 'Compota de fresa casera',
        price: '€3.80 / unidad',
        image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Tarrinas',
        tags: ['Frutal', 'Fresca']
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Chocolate',
        desc: 'Ideal para celebraciones',
        price: 'Desde €22.00',
        image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Tartas',
        tags: ['Celebracion', 'Premium']
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Vainilla',
        desc: 'Sabor clásico con crema',
        price: 'Desde €20.00',
        image: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Tartas',
        tags: ['Delicada', 'Artesanal']
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Fresa',
        desc: 'Fresas frescas y crema ligera',
        price: 'Desde €24.00',
        image: 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=1200',
        category: 'Tartas',
        tags: ['Fruta natural', 'Temporada']
    }
];

const yearEl = document.getElementById('year');
const productsList = document.getElementById('productsList');
const categoriesList = document.querySelector('.categories');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const toastRoot = document.getElementById('toastRoot');
const visitCount = document.getElementById('visitCount');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const sendOrderBtn = document.getElementById('sendOrderBtn');
const copyShareBtn = document.getElementById('copyShareBtn');
const shareMessage = document.getElementById('shareMessage');
const heroSlides = Array.from(document.querySelectorAll('[data-slide]'));
const heroDots = Array.from(document.querySelectorAll('[data-slide-dot]'));

const modal = document.getElementById('contactModal');
const contactBtn = document.getElementById('contactBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const contactForm = document.getElementById('contactForm');

let products = [];
let activeCategory = 'Todas';
let heroIndex = 0;
let cart = [];

function getCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (!category) {
        return 'Todas';
    }

    const validCategory = products.find((product) => product.category === category)?.category;
    return validCategory || 'Todas';
}

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

function getSafeImageSrc(src) {
    return src && src.trim() ? src.trim() : 'assets/img/logo.jpg';
}

function normalizeText(value) {
    return (value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function showToast(message, type = 'success') {
    if (!toastRoot) {
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastRoot.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 2600);
}

function parsePriceValue(priceText) {
    const match = (priceText || '').replace(',', '.').match(/\d+(\.\d+)?/);
    if (!match) {
        return 0;
    }
    return Number.parseFloat(match[0]);
}

function toCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
}

async function getVisitCount() {
    const endpoint = `https://api.countapi.xyz/get/${VISIT_COUNTER_NAMESPACE}/${VISIT_COUNTER_KEY}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (typeof data.value === 'number') {
            return data.value;
        }
    } catch (error) {
        // Silenciar: hay fallback visual.
    }

    return null;
}

async function registerVisit() {
    if (sessionStorage.getItem(VISIT_SESSION_KEY) === 'true') {
        return getVisitCount();
    }

    const endpoint = `https://api.countapi.xyz/hit/${VISIT_COUNTER_NAMESPACE}/${VISIT_COUNTER_KEY}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (typeof data.value === 'number') {
            sessionStorage.setItem(VISIT_SESSION_KEY, 'true');
            return data.value;
        }
    } catch (error) {
        // Silenciar: hay fallback visual.
    }

    return null;
}

async function renderVisitCount() {
    if (!visitCount) {
        return;
    }

    visitCount.textContent = 'Visitas totales: cargando...';
    const value = await registerVisit();

    if (typeof value === 'number') {
        visitCount.textContent = `Visitas totales: ${value.toLocaleString('es-ES')}`;
        return;
    }

    const fallbackValue = await getVisitCount();
    if (typeof fallbackValue === 'number') {
        visitCount.textContent = `Visitas totales: ${fallbackValue.toLocaleString('es-ES')}`;
        return;
    }

    visitCount.textContent = 'Visitas totales: no disponible';
}

function saveProducts() {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function loadProducts() {
    const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!storedProducts) {
        products = [...defaultProducts];
        saveProducts();
        return;
    }

    try {
        const parsed = JSON.parse(storedProducts);
        products = Array.isArray(parsed) ? parsed : [...defaultProducts];
    } catch (error) {
        products = [...defaultProducts];
        saveProducts();
    }
}

function getFilteredProducts() {
    const searchTerm = normalizeText(searchInput?.value || '');

    let result = products.filter((product) => {
        const category = product.category || 'General';
        const categoryMatch = activeCategory === 'Todas' || category === activeCategory;

        const content = normalizeText(`${product.name} ${product.desc} ${category}`);
        const searchMatch = !searchTerm || content.includes(searchTerm);

        return categoryMatch && searchMatch;
    });

    const sortValue = sortSelect?.value || 'featured';
    if (sortValue === 'name-asc') {
        result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }

    if (sortValue === 'name-desc') {
        result = [...result].sort((a, b) => b.name.localeCompare(a.name, 'es'));
    }

    return result;
}

function animateCards() {
    const cards = productsList?.querySelectorAll('.card') || [];
    cards.forEach((card, index) => {
        card.style.setProperty('--delay', `${Math.min(index * 50, 350)}ms`);
        window.requestAnimationFrame(() => {
            card.classList.add('is-visible');
        });
    });
}

function renderEmptyState() {
    if (!productsList) {
        return;
    }

    productsList.innerHTML = `
        <li class="hidden-state" role="status">
            No encontramos productos con esos filtros. Prueba con otra busqueda.
        </li>
    `;
}

function renderProducts() {
    if (!productsList) return;

    const visibleProducts = getFilteredProducts();

    if (!visibleProducts.length) {
        renderEmptyState();
        return;
    }

    productsList.innerHTML = visibleProducts.map((product) => `
        <li class="card" aria-label="${product.name}">
            <img src="${getSafeImageSrc(product.image)}" alt="${product.name}">
            <div class="card-info">
                <h4>${product.name}</h4>
                <div class="small muted">${product.desc}</div>
                <div class="small muted">${(product.tags || []).join(' • ')}</div>
                <div class="price price-margin">${product.price}</div>
            </div>
            <div class="card-actions">
                <button class="btn add-btn" type="button" data-id="${product.id}" data-name="${product.name}">Añadir</button>
                <a class="small muted" href="#">Detalles</a>
            </div>
        </li>
    `).join('');

    animateCards();
}

function renderCategories() {
    if (!categoriesList) return;

    const categories = ['Todas', ...new Set(products.map((product) => product.category || 'General'))];

    categoriesList.innerHTML = categories.map((category) => `
        <li>
            <a href="#productos" data-category="${category}" aria-label="Ver productos de ${category}" class="${category === activeCategory ? 'active' : ''}">
                <span class="cat-title">${category}</span>
            </a>
        </li>
    `).join('');
}

function renderCart() {
    if (!cartList || !cartTotal) {
        return;
    }

    if (!cart.length) {
        cartList.innerHTML = '<li class="muted">Aun no has añadido productos.</li>';
        cartTotal.textContent = toCurrency(0);
        return;
    }

    const grouped = cart.reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = { ...item, qty: 0 };
        }
        acc[item.id].qty += 1;
        return acc;
    }, {});

    const rows = Object.values(grouped);
    cartList.innerHTML = rows.map((item) => `
        <li class="cart-row">
            <span>${item.qty}x ${item.name}</span>
            <strong>${toCurrency(item.priceValue * item.qty)}</strong>
        </li>
    `).join('');

    const total = rows.reduce((sum, item) => sum + (item.priceValue * item.qty), 0);
    cartTotal.textContent = toCurrency(total);
}

function addToCart(product) {
    cart.push({
        id: product.id,
        name: product.name,
        priceValue: parsePriceValue(product.price)
    });
    renderCart();
}

function clearCart() {
    cart = [];
    renderCart();
}

function buildWhatsappOrderUrl() {
    if (!cart.length) {
        return null;
    }

    const grouped = cart.reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = { ...item, qty: 0 };
        }
        acc[item.id].qty += 1;
        return acc;
    }, {});

    const rows = Object.values(grouped);
    const total = rows.reduce((sum, item) => sum + (item.priceValue * item.qty), 0);

    const lines = rows.map((item) => `- ${item.qty}x ${item.name} (${toCurrency(item.priceValue * item.qty)})`);
    const message = [
        'Hola MerigonSweets, quiero hacer este pedido:',
        ...lines,
        `Total estimado: ${toCurrency(total)}`,
        '',
        'Nombre:',
        'Direccion/Zona de entrega:'
    ].join('\n');

    return `https://wa.me/34655247973?text=${encodeURIComponent(message)}`;
}

function setHeroSlide(nextIndex) {
    if (!heroSlides.length) {
        return;
    }

    heroIndex = (nextIndex + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === heroIndex);
    });
    heroDots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === heroIndex);
    });
}

function initHeroSlider() {
    if (!heroSlides.length) {
        return;
    }

    heroDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = Number.parseInt(dot.dataset.slideDot, 10);
            setHeroSlide(index);
        });
    });

    window.setInterval(() => {
        setHeroSlide(heroIndex + 1);
    }, 3800);
}

function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.querySelector('#contactModal input')?.focus();
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

loadProducts();
activeCategory = getCategoryFromUrl();
renderProducts();
renderCategories();
renderCart();
renderVisitCount();
initHeroSlider();

contactBtn?.addEventListener('click', openModal);
closeModal?.addEventListener('click', hideModal);
cancelBtn?.addEventListener('click', hideModal);
modal?.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
});

categoriesList?.addEventListener('click', (event) => {
    const categoryLink = event.target.closest('[data-category]');
    if (!categoryLink) {
        return;
    }

    event.preventDefault();
    activeCategory = categoryLink.dataset.category;
    renderCategories();
    renderProducts();
});

searchInput?.addEventListener('input', () => {
    renderProducts();
});

sortSelect?.addEventListener('change', () => {
    renderProducts();
});

productsList?.addEventListener('click', (event) => {
    const addBtn = event.target.closest('.add-btn');
    if (!addBtn) {
        return;
    }

    const selectedProduct = products.find((product) => product.id === addBtn.dataset.id);
    if (selectedProduct) {
        addToCart(selectedProduct);
    }
    showToast(`${addBtn.dataset.name} añadido al pedido`);
});

clearCartBtn?.addEventListener('click', () => {
    clearCart();
    showToast('Pedido vaciado.');
});

sendOrderBtn?.addEventListener('click', () => {
    const whatsappUrl = buildWhatsappOrderUrl();
    if (!whatsappUrl) {
        showToast('Añade al menos un producto al pedido.', 'error');
        return;
    }

    window.open(whatsappUrl, '_blank', 'noopener');
});

contactForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    showToast('Mensaje enviado. Te respondemos pronto.');
    contactForm.reset();
    hideModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal?.classList.contains('open')) hideModal();
});

copyShareBtn?.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(shareMessage?.value || '');
        showToast('Texto copiado para compartir.');
    } catch (error) {
        showToast('No se pudo copiar automaticamente.', 'error');
    }
});

window.addEventListener('storage', (event) => {
    if (event.key === PRODUCTS_STORAGE_KEY) {
        loadProducts();
        renderCategories();
        renderProducts();
    }
});
