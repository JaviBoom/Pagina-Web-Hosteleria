const PRODUCTS_STORAGE_KEY = 'merigon_products';
const VISIT_COUNTER_NAMESPACE = 'merigonsweets-javiboom';
const VISIT_COUNTER_KEY = 'store-visits';

const defaultProducts = [
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Chocolate',
        desc: 'Chocolate belga y crema fresca',
        price: 'EUR 3.50 / unidad',
        image: 'assets/img/logo.jpg',
        category: 'Tarrinas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Vainilla',
        desc: 'Vainilla natural y crumble',
        price: 'EUR 3.20 / unidad',
        image: 'assets/img/logo.jpg',
        category: 'Tarrinas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Fresa',
        desc: 'Compota de fresa casera',
        price: 'EUR 3.80 / unidad',
        image: 'assets/img/logo.jpg',
        category: 'Tarrinas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Chocolate',
        desc: 'Ideal para celebraciones',
        price: 'Desde EUR 22.00',
        image: 'assets/img/logo.jpg',
        category: 'Tartas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Vainilla',
        desc: 'Sabor clasico con crema',
        price: 'Desde EUR 20.00',
        image: 'assets/img/logo.jpg',
        category: 'Tartas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Fresa',
        desc: 'Fresas frescas y crema ligera',
        price: 'Desde EUR 24.00',
        image: 'assets/img/logo.jpg',
        category: 'Tartas'
    }
];

const totalVisitsEl = document.getElementById('totalVisits');
const lastUpdateEl = document.getElementById('lastUpdate');
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
const resetCatalogBtn = document.getElementById('resetCatalogBtn');
const productCounter = document.getElementById('productCounter');
const toastRoot = document.getElementById('toastRootAdmin');
const formTitle = document.getElementById('formTitle');
const saveProductBtn = document.getElementById('saveProductBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const exportCatalogBtn = document.getElementById('exportCatalogBtn');
const importCatalogBtn = document.getElementById('importCatalogBtn');
const importCatalogInput = document.getElementById('importCatalogInput');

let products = [];
let editingProductId = null;

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

function updateCounter() {
    if (!productCounter) {
        return;
    }

    const suffix = products.length === 1 ? 'producto' : 'productos';
    productCounter.textContent = `${products.length} ${suffix}`;
}

function updateLastUpdate() {
    if (!lastUpdateEl) {
        return;
    }

    lastUpdateEl.textContent = new Date().toLocaleString('es-ES');
}

function setEditMode(product) {
    if (!product) {
        editingProductId = null;
        formTitle.textContent = 'Anadir producto';
        saveProductBtn.textContent = 'Guardar producto';
        cancelEditBtn.hidden = true;
        productForm.reset();
        document.getElementById('productName')?.focus();
        return;
    }

    editingProductId = product.id;
    formTitle.textContent = `Editando: ${product.name}`;
    saveProductBtn.textContent = 'Actualizar producto';
    cancelEditBtn.hidden = false;

    document.getElementById('productName').value = product.name;
    document.getElementById('productDesc').value = product.desc;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image;
}

function renderProductList() {
    if (!products.length) {
        productList.innerHTML = '<li class="empty">No hay productos en el catalogo.</li>';
        updateCounter();
        return;
    }

    productList.innerHTML = products.map((product) => `
        <li class="product-item">
            <div>
                <strong>${product.name}</strong>
                <p>${product.price} • ${product.category}</p>
            </div>
            <div class="row-actions">
                <button class="btn secondary edit-btn" type="button" data-id="${product.id}">Editar</button>
                <button class="btn secondary remove-btn" type="button" data-id="${product.id}">Eliminar</button>
            </div>
        </li>
    `).join('');

    updateCounter();
}

async function loadVisitStats() {
    if (!totalVisitsEl) {
        return;
    }

    totalVisitsEl.textContent = 'Cargando...';
    const endpoint = `https://api.countapi.xyz/get/${VISIT_COUNTER_NAMESPACE}/${VISIT_COUNTER_KEY}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (typeof data.value === 'number') {
            totalVisitsEl.textContent = data.value.toLocaleString('es-ES');
            return;
        }
    } catch (error) {
        // Ignorar y mostrar fallback.
    }

    totalVisitsEl.textContent = 'No disponible';
}

function exportCatalog() {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const fileUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = 'catalogo-merigonsweets.json';
    anchor.click();
    URL.revokeObjectURL(fileUrl);
    showToast('Catalogo exportado.');
}

function importCatalog(file) {
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            if (!Array.isArray(parsed)) {
                throw new Error('Formato invalido');
            }

            products = parsed.map((product) => ({
                id: product.id || crypto.randomUUID(),
                name: product.name || 'Producto sin nombre',
                desc: product.desc || '',
                price: product.price || 'Consultar',
                category: product.category || 'General',
                image: product.image || 'assets/img/logo.jpg'
            }));

            saveProducts();
            renderProductList();
            setEditMode(null);
            updateLastUpdate();
            showToast('Catalogo importado correctamente.');
        } catch (error) {
            showToast('El archivo JSON no es valido.', 'error');
        }
    };
    reader.readAsText(file);
}

resetCatalogBtn?.addEventListener('click', () => {
    const confirmed = window.confirm('Se restablecera el catalogo por defecto. Continuar?');
    if (!confirmed) {
        return;
    }

    products = [...defaultProducts];
    saveProducts();
    renderProductList();
    setEditMode(null);
    updateLastUpdate();
    showToast('Catalogo restablecido.');
});

productForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const desc = document.getElementById('productDesc').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const image = document.getElementById('productImage').value.trim();

    if (!name || !desc || !price || !category || !image) {
        showToast('Completa todos los campos.', 'error');
        return;
    }

    if (editingProductId) {
        products = products.map((product) => product.id === editingProductId
            ? { ...product, name, desc, price, category, image }
            : product);
    } else {
        products.unshift({
            id: crypto.randomUUID(),
            name,
            desc,
            price,
            category,
            image
        });
    }

    saveProducts();
    renderProductList();
    updateLastUpdate();
    const message = editingProductId ? 'Producto actualizado correctamente.' : 'Producto guardado correctamente.';
    setEditMode(null);
    showToast(message);
});

cancelEditBtn?.addEventListener('click', () => {
    setEditMode(null);
});

exportCatalogBtn?.addEventListener('click', exportCatalog);

importCatalogBtn?.addEventListener('click', () => {
    importCatalogInput?.click();
});

importCatalogInput?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    importCatalog(file);
    event.target.value = '';
});

productList?.addEventListener('click', (event) => {
    const editBtn = event.target.closest('.edit-btn');
    if (editBtn) {
        const selectedProduct = products.find((product) => product.id === editBtn.dataset.id);
        if (selectedProduct) {
            setEditMode(selectedProduct);
            showToast('Modo edicion activado.');
        }
        return;
    }

    const removeBtn = event.target.closest('.remove-btn');
    if (!removeBtn) {
        return;
    }

    const productId = removeBtn.dataset.id;
    products = products.filter((product) => product.id !== productId);
    saveProducts();
    renderProductList();
    if (editingProductId === productId) {
        setEditMode(null);
    }
    updateLastUpdate();
    showToast('Producto eliminado.');
});

loadProducts();
renderProductList();
setEditMode(null);
updateLastUpdate();
loadVisitStats();
