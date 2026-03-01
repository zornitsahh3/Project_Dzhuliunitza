let currentIndex = 0;
const itemsPerPage = 20;
let currentCategory = "bags";
let activeFilteredProducts=[];

const categoryInfo={
    bags:{
        title:"Bags",
        description:"Explore our collection of stylish and functional bags, perfect for any occasion. From chic handbags to durable backpacks, find the ideal accessory to complement your look and carry your essentials with ease."},

    shoes:{
        title:"Shoes",
        description:"Discover our range of fashionable and comfortable shoes, designed to elevate your style. From trendy sneakers to elegant heels, find the perfect pair to step out in confidence and make a statement with every stride."}
    };

function addToCart() {
    alert("Product added to cart!");
}

function showCategory(category) {
    currentCategory = category;
    currentIndex = 0;
    activeFilteredProducts=[];

    document.querySelectorAll(".filter-color, .filter-price").forEach(cb => cb.checked=false);
    document.getElementById("discount-only").checked=false;
    
    const title=document.getElementById("category-title");
    const description=document.getElementById("category-description");

    if (categoryInfo[category]) {
        title.textContent=categoryInfo[category].title;
        description.textContent=categoryInfo[category].description;
    }
    else {
        title.textContent="";
        description.textContent="";
    }
    renderProducts();
}

function getStars(rating) {
    const fullStars=Math.floor(rating);
    const emptyStars=5-fullStars;
    return "★".repeat(fullStars)+"☆".repeat(emptyStars);
}

function renderProducts() {
    const productList = document.getElementById("product-list");
    const productCount = document.getElementById("product-count");
    const loadMoreBtn = document.getElementById("load-more");

    const filtered = activeFilteredProducts.length > 0
    ? activeFilteredProducts
    : products.filter(p => p.category === currentCategory);

    const visible = filtered.slice(0, currentIndex + itemsPerPage);

    let html = "";

    visible.forEach(product => {
        html += `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Color: ${product.color}</p>
            <p>Price: ${product.price}</p>
            ${product.discount > 0 ? `<p>Discount: $${product.discount}</p>` : ""}
            <div class="stars">${getStars(product.rating)}</div>      
            <button onclick="addToCart()">Add to Cart</button>
        </div>
        `;
    });

    productList.innerHTML = html;

    productCount.textContent =
        `${visible.length} out of ${filtered.length} products displayed.`;

    // Hide Load More when all items are shown
    if (visible.length >= filtered.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}

function loadMore() {
    currentIndex += itemsPerPage;
    renderProducts();
}

function applyFilters() {
    const discounted = document.querySelector('[value="discounted"]').checked;

    let filtered = products;

    if (discounted) {
        filtered = filtered.filter(p => p.discount > 0);
    }

    // After filtering, we still use renderProducts but need category context
    renderProducts();
}

// Load first category on page load
document.addEventListener("DOMContentLoaded", function () {
    showCategory("bags");
});

function applyFilters() {

    const selectedColors=Array.from(
        document.querySelectorAll('.filter-color:checked')
    ).map(cb => cb.value);

    const selectedPrices=Array.from(
        document.querySelectorAll(".filter-price:checked")
    ).map(cb=>cb.value);

    const discountOnly=document.getElementById("discount-only").checked;

    //start from current category
    let filtered=products.filter(p=>p.category === currentCategory);

    //filter by color
    if (selectedColors.length>0){
        filtered=filtered.filter(p=>
            selectedColors.includes(p.color)
        );
    }

    //filter by price range
    if (selectedPrices.length>0) {
        filtered=filtered.filter(p=>p.discount>0);
    }

    activeFilteredProducts=filtered;
    currentIndex=0;

    renderProducts();
}