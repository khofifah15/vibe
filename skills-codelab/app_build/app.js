// Initial mock data if empty
const defaultItems = [
    { id: '1', name: 'Vintage Denim Jacket', category: 'Outerwear', color: 'Blue', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: '2', name: 'Classic White Tee', category: 'Top', color: 'White', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: '3', name: 'Black Jeans', category: 'Bottom', color: 'Black', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: '4', name: 'Leather Boots', category: 'Shoes', color: 'Brown', image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
];

// State Management
let wardrobeItems = JSON.parse(localStorage.getItem('wardrobeItems')) || defaultItems;
let outfits = JSON.parse(localStorage.getItem('outfits')) || [];
let currentOutfit = { Top: null, Bottom: null, Shoes: null };

// DOM Elements
const views = document.querySelectorAll('.view-section');
const navLinks = document.querySelectorAll('.nav-links li');
const form = document.getElementById('add-item-form');
const galleryGrid = document.getElementById('wardrobe-gallery-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const toast = document.getElementById('toast');
const builderGrid = document.getElementById('builder-items-grid');
const saveOutfitBtn = document.getElementById('save-outfit-btn');
const outfitNameInput = document.getElementById('outfit-name');

// Navigation Logic
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show corresponding view
        const targetView = e.target.getAttribute('data-view');
        views.forEach(view => {
            view.classList.remove('active');
            if (view.id === targetView) {
                view.classList.add('active');
            }
        });

        // Trigger view-specific updates
        if(targetView === 'dashboard') updateDashboard();
        if(targetView === 'gallery') renderGallery();
        if(targetView === 'outfits') renderBuilderItems();
    });
});

// Toast Notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Save to LocalStorage
function saveData() {
    localStorage.setItem('wardrobeItems', JSON.stringify(wardrobeItems));
    localStorage.setItem('outfits', JSON.stringify(outfits));
}

// Add Item Form Logic
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newItem = {
        id: Date.now().toString(),
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        color: document.getElementById('item-color').value,
        image: document.getElementById('item-image').value || 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Default placeholder
    };

    wardrobeItems.push(newItem);
    saveData();
    showToast('Item added successfully!');
    form.reset();
    
    // Switch to gallery view automatically
    document.querySelector('[data-view="gallery"]').click();
});

// Render Gallery
function renderGallery(filter = 'all') {
    galleryGrid.innerHTML = '';
    const items = filter === 'all' 
        ? wardrobeItems 
        : wardrobeItems.filter(item => item.category === filter);

    if (items.length === 0) {
        galleryGrid.innerHTML = '<p class="empty-state">No items found.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-img" onerror="this.src='https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=800&q=80'">
            <div class="item-details">
                <div class="item-category">${item.category}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-color">${item.color}</div>
            </div>
            <button class="btn-delete" onclick="deleteItem('${item.id}')">&times;</button>
        `;
        galleryGrid.appendChild(card);
    });
}

// Delete Item
window.deleteItem = function(id) {
    if(confirm('Delete this item?')) {
        wardrobeItems = wardrobeItems.filter(item => item.id !== id);
        saveData();
        renderGallery(document.querySelector('.filter-btn.active').dataset.filter);
        updateDashboard();
        showToast('Item deleted');
    }
};

// Gallery Filters
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderGallery(e.target.dataset.filter);
    });
});

// Dashboard Logic
function updateDashboard() {
    document.getElementById('stat-total').textContent = wardrobeItems.length;
    document.getElementById('stat-tops').textContent = wardrobeItems.filter(i => i.category === 'Top').length;
    document.getElementById('stat-bottoms').textContent = wardrobeItems.filter(i => i.category === 'Bottom').length;
    document.getElementById('stat-shoes').textContent = wardrobeItems.filter(i => i.category === 'Shoes').length;

    const outfitsContainer = document.getElementById('recent-outfits-container');
    if (outfits.length === 0) {
        outfitsContainer.innerHTML = '<p class="empty-state">No outfits created yet. Head to the Outfit Builder!</p>';
    } else {
        outfitsContainer.innerHTML = '';
        outfits.slice().reverse().forEach(outfit => {
            const card = document.createElement('div');
            card.className = 'outfit-card';
            card.innerHTML = `
                <h4>${outfit.name}</h4>
                <div class="outfit-images">
                    ${outfit.top ? `<img src="${outfit.top.image}" title="${outfit.top.name}">` : ''}
                    ${outfit.bottom ? `<img src="${outfit.bottom.image}" title="${outfit.bottom.name}">` : ''}
                    ${outfit.shoes ? `<img src="${outfit.shoes.image}" title="${outfit.shoes.name}">` : ''}
                </div>
                <button class="btn-primary" onclick="deleteOutfit('${outfit.id}')" style="padding: 0.5rem; font-size: 0.9rem;">Delete</button>
            `;
            outfitsContainer.appendChild(card);
        });
    }
}

window.deleteOutfit = function(id) {
    outfits = outfits.filter(o => o.id !== id);
    saveData();
    updateDashboard();
    showToast('Outfit deleted');
};

// Outfit Builder Logic
function renderBuilderItems() {
    builderGrid.innerHTML = '';
    const buildableItems = wardrobeItems.filter(i => ['Top', 'Bottom', 'Shoes'].includes(i.category));
    
    buildableItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'selection-item';
        div.innerHTML = `<img src="${item.image}" alt="${item.name}">`;
        div.onclick = () => selectForOutfit(item);
        builderGrid.appendChild(div);
    });
}

function selectForOutfit(item) {
    if(['Top', 'Bottom', 'Shoes'].includes(item.category)) {
        currentOutfit[item.category] = item;
        const slot = document.getElementById(`slot-${item.category.toLowerCase()}`);
        slot.classList.add('filled');
        slot.style.backgroundImage = `url(${item.image})`;
    }
}

saveOutfitBtn.addEventListener('click', () => {
    if (!currentOutfit.Top && !currentOutfit.Bottom && !currentOutfit.Shoes) {
        showToast('Select at least one item!');
        return;
    }
    
    const name = outfitNameInput.value || `Outfit ${outfits.length + 1}`;
    
    outfits.push({
        id: Date.now().toString(),
        name: name,
        top: currentOutfit.Top,
        bottom: currentOutfit.Bottom,
        shoes: currentOutfit.Shoes
    });
    
    saveData();
    showToast('Outfit saved successfully!');
    
    // Reset builder
    outfitNameInput.value = '';
    currentOutfit = { Top: null, Bottom: null, Shoes: null };
    ['top', 'bottom', 'shoes'].forEach(cat => {
        const slot = document.getElementById(`slot-${cat}`);
        slot.classList.remove('filled');
        slot.style.backgroundImage = '';
    });
});

// Initialize app
updateDashboard();
