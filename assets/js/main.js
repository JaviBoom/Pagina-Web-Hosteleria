const PRODUCTS_STORAGE_KEY = 'merigon_products';

const defaultProducts = [
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Chocolate',
        desc: 'Chocolate belga y crema fresca',
        price: '€3.50 / unidad',
        image: 'assets/img/logo.jpg',
        category: 'Tarrinas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Vainilla',
        desc: 'Vainilla natural y crumble',
        price: '€3.20 / unidad',
        image: 'assets/img/logo.jpg',
        category: 'Tarrinas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Fresa',
        desc: 'Compota de fresa casera',
        price: '€3.80 / unidad',
        image: 'assets/img/logo.jpg',
        category: 'Tarrinas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Chocolate',
        desc: 'Ideal para celebraciones',
        price: 'Desde €22.00',
        image: 'assets/img/logo.jpg',
        category: 'Tartas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Vainilla',
        desc: 'Sabor clásico con crema',
        price: 'Desde €20.00',
        image: 'assets/img/logo.jpg',
        category: 'Tartas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Fresa',
        desc: 'Fresas frescas y crema ligera',
        price: 'Desde €24.00',
        image: 'assets/img/logo.jpg',
        category: 'Tartas'
    }
];

const yearEl = document.getElementById('year');
const productsList = document.getElementById('productsList');
const categoriesList = document.querySelector('.categories');

const modal = document.getElementById('contactModal');
const contactBtn = document.getElementById('contactBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const contactForm = document.getElementById('contactForm');

let products = [];

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

function getSafeImageSrc(src) {
    return src && src.trim() ? src.trim() : 'assets/img/logo.jpg';
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

function renderProducts() {
    if (!productsList) return;

    productsList.innerHTML = products.map((product) => `
        <li class="card" aria-label="${product.name}">
            <img src="${getSafeImageSrc(product.image)}" alt="${product.name}">
            <div class="card-info">
                <h4>${product.name}</h4>
                <div class="small muted">${product.desc}</div>
                <div class="price price-margin">${product.price}</div>
            </div>
            <div class="card-actions">
                <a class="btn" href="#">Añadir</a>
                <a class="small muted" href="#">Detalles</a>
            </div>
        </li>
    `).join('');
}

function renderCategories() {
    if (!categoriesList) return;

    const categories = [...new Set(products.map((product) => product.category || 'General'))];

    categoriesList.innerHTML = categories.map((category) => `
        <li>
            <a href="#productos" aria-label="Ver productos de ${category}">
                <span class="cat-title">${category}</span>
            </a>
        </li>
    `).join('');
}

function openModal() {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.querySelector('#contactModal input')?.focus();
}

function hideModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

loadProducts();
renderProducts();
renderCategories();

contactBtn?.addEventListener('click', openModal);
closeModal?.addEventListener('click', hideModal);
cancelBtn?.addEventListener('click', hideModal);
modal?.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
});

contactForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Gracias. Tu mensaje ha sido recibido. Nos pondremos en contacto pronto.');
    contactForm.reset();
    hideModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal?.style.display === 'flex') hideModal();
});
