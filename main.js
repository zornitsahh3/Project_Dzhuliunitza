let currentIndex = 0;
const itemsPerPage = 20;
let currentCategory = "all";
let activeFilteredProducts = null;

/** Пълният каталог; пълни се асинхронно от fonts_list.js */
let products = [];

const categoryInfo = {
    all: {
        title: "Всички комбинации",
        description: "Преглед на двойки шрифтове с кирилица от Google Fonts.",
    },
    serif: {
        title: "Серифни заглавия",
        description: "Заглавният шрифт е с засечки (serif).",
    },
    sans: {
        title: "Безсерифни заглавия",
        description: "Заглавният шрифт е без засечки (sans-serif и подобни).",
    },
    display: {
        title: "Декоративни заглавия",
        description: "Заглавният шрифт е от категория display.",
    },
};

function navCategoryFromGoogle(cat) {
    if (cat === "serif") return "serif";
    if (cat === "display") return "display";
    return "sans";
}

function loadFont(fontName) {
    if (!fontName) return;
    if (!window.__loadedFontFamilies) window.__loadedFontFamilies = new Set();
    if (window.__loadedFontFamilies.has(fontName)) return;
    window.__loadedFontFamilies.add(fontName);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    const q = encodeURIComponent(fontName).replace(/%20/g, "+");
    link.href = `https://fonts.googleapis.com/css2?family=${q}:wght@400;700&display=swap`;
    document.head.appendChild(link);
}

function addToCart() {
    alert("Тук по-късно: линк за лиценз / изтегляне.");
}

function showCategory(category) {
    currentCategory = category;
    currentIndex = 0;
    activeFilteredProducts = null;

    document.querySelectorAll("input[type='checkbox']").forEach((cb) => {
        cb.checked = false;
    });

    const info = categoryInfo[category] || categoryInfo.all;
    document.getElementById("category-title").textContent = info.title;
    document.getElementById("category-description").textContent = info.description;

    renderProducts();
}

function getStars(rating) {
    const n = Number(rating) || 0;
    const full = Math.floor(n);
    return "★".repeat(full) + "☆".repeat(5 - full);
}

function categoryMatch(p) {
    if (currentCategory === "all") return true;
    return p.category === currentCategory;
}

function getBaseList() {
    const source =
        activeFilteredProducts !== null ? activeFilteredProducts : products;
    return source.filter(categoryMatch);
}

function renderProducts() {
    const productList = document.getElementById("product-list");
    const productCount = document.getElementById("product-count");
    const loadMoreBtn = document.getElementById("load-more");

    if (!products.length) {
        productList.innerHTML =
            "<p>Зареждане на шрифтове… Ако това съобщение остане, провери API ключа и мрежата.</p>";
        productCount.textContent = "";
        loadMoreBtn.style.display = "none";
        return;
    }

    const baseProducts = getBaseList();
    let sortedProducts = [...baseProducts];

    const sortValue = document.getElementById("sort-select")?.value;

    if (sortValue === "az") {
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name, "bg"));
    } else if (sortValue === "za") {
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name, "bg"));
    } else if (sortValue === "popular") {
        sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortValue === "modern") {
        sortedProducts.sort((a, b) => (b.modernScore || 0) - (a.modernScore || 0));
    }

    const visible = sortedProducts.slice(0, currentIndex + itemsPerPage);

    visible.forEach((p) => {
        loadFont(p.headingFont);
        loadFont(p.bodyFont);
    });

    productList.innerHTML = visible
        .map(
            (p) => `
        <div class="product-card">
            <h2 style="font-family: '${p.headingFont}', serif">${escapeHtml(p.headingSample || "Заглавие пример")}</h2>
            <p style="font-family: '${p.bodyFont}', sans-serif">${escapeHtml(p.bodySample || "Това е примерен текст на български език.")}</p>
            <small class="font-pair-title">${escapeHtml(p.name)}</small>
            <p class="font-meta">${escapeHtml((p.styles || []).join(", "))}</p>
            <div class="stars">${getStars(p.rating)}</div>
            <button type="button" onclick="addToCart()">Детайли</button>
        </div>
    `
        )
        .join("");

    productCount.textContent = `Показани ${visible.length} от ${baseProducts.length}.`;

    loadMoreBtn.style.display =
        visible.length >= baseProducts.length ? "none" : "block";
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function loadMore() {
    currentIndex += itemsPerPage;
    renderProducts();
}

function applyFilters() {
    const selectedCombos = [
        ...document.querySelectorAll(".filter-combo:checked"),
    ].map((cb) => cb.value);

    const selectedStyles = [
        ...document.querySelectorAll(".filter-style:checked"),
    ].map((cb) => cb.value);

    const selectedUses = [...document.querySelectorAll(".filter-use:checked")].map(
        (cb) => cb.value
    );

    const cyrillicOnly = document.getElementById("cyrillic-only")?.checked;

    const filtered = products.filter((p) => {
        if (currentCategory !== "all" && p.category !== currentCategory) {
            return false;
        }
        if (selectedCombos.length && !selectedCombos.includes(p.combo)) {
            return false;
        }
        if (selectedStyles.length) {
            const hasStyle = (p.styles || []).some((s) =>
                selectedStyles.includes(s)
            );
            if (!hasStyle) return false;
        }
        if (selectedUses.length) {
            const hasUse = (p.use || []).some((u) => selectedUses.includes(u));
            if (!hasUse) return false;
        }
        if (cyrillicOnly && !p.cyrillic) {
            return false;
        }
        return true;
    });

    activeFilteredProducts = filtered;
    currentIndex = 0;
    renderProducts();
}

/** Извиква се от fonts_list.js когато данните са готови (може и преди DOMContentLoaded). */
window.onFontsCatalogReady = function (catalog) {
    products = catalog;
    currentIndex = 0;
    activeFilteredProducts = null;
    const paint = () => showCategory(currentCategory);
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", paint, { once: true });
    } else {
        paint();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sort-select")?.addEventListener("change", () => {
        currentIndex = 0;
        renderProducts();
    });
    renderProducts();
});
