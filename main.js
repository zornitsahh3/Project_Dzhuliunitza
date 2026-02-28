let currentIndex=0;
const itemsPerPage=15;
let currentCategory="bags";

function showCategory(category) {
    currentCategory=category;
    currentIndex=0; //reset index when category changes
    renderProducts(true);
    const productList=document.getElementById("product-list");
    const productCount=document.getElementById("product-count");
    
    let html="";
    const filtered=products.filter(p=>p.category===category);
    const total=products.filter(p=>p.category===category).length; //total num of items in a category

    filtered.forEach(product=>{
        html+=`
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Discount: ${product.discount}</p>
            <p>Rating: ${product.rating}</p>
            <button onclick="addToCart()">Add to Cart</button>
        </div>
        `;
    });
    productList.innerHTML=html;

    productCount.textContent=`${filtered.length} out of ${total} products displayed.`;
}

function addToCart() {
    alert("Product added to cart!");
}

//Load first category by default
document.addEventListener("DOMContentLoaded",function () {
    showCategory("bags");
});

function renderProducts(reset=false) {
    const productList=document.getElementById("product-list");
    const productCount=document.getElementById("product-count");

    const filtered=products.filter(p=>p.category===currentCategory);
    const visible=filtered.slice(0,currentIndex+itemsPerPage);

    let html="";

    visible.forEach(product=>{
        html+=`
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Discount: ${product.discount}</p>
            <p>Rating: ${product.rating}</p>
            <button onclick="addToCart()">Add to Cart</button>
        </div>
        `;
    });
    productList.innerHTML=html;

    productCount.textContent=`${visible.length} out of ${filtered.length} products displayed.`;

    document.getElementById("load more").style.display=visible.length<filtered.length?"block":"none";
}

function loadMore() {
    currentIndex+=itemsPerPage;
    renderProducts();
}

document.addEventListener("DOMContentLoaded", function () {
    showCategory("bags");
});

function applyFilters() {
    const discounted=document.querySelector('[value="discounted"]').checked;

    let filtered=products;

    if (discounted) {
        filtered=filterred.filter(p=>p.discount);
    }

    rennder(filtered);
}