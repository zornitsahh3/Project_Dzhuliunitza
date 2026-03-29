let currentIndex = 0;
const itemsPerPage = 20;
let currentCategory = "all";
let activeFilteredProducts = null;

/** Пълният каталог; пълни се асинхронно от fonts_list.js */
let products = [];

const categoryInfo = {
    all: {
        title: "Всички комбинации",
        description:
            "Двойки с кирилица — от Google Fonts и (с активен Adobe kit) Adobe Fonts в един списък.",
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

const STYLE_LABELS = {
    modern: "Модерен",
    minimal: "Минималистичен",
    elegant: "Елегантен",
    bold: "Смел",
};

const USE_LABELS = {
    web: "Уеб",
    logo: "Лого",
    social: "Социални мрежи",
    presentation: "Презентации",
};

function ensureAdobeFontsKit() {
    const kit = window.ADOBE_FONTS_KIT_ID;
    if (!kit || typeof kit !== "string" || !kit.trim()) {
        return;
    }
    if (window.__adobeTypekitInjected) {
        return;
    }
    window.__adobeTypekitInjected = true;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://use.typekit.net/${kit.trim()}.css`;
    document.head.appendChild(link);
}

/**
 * @param {string} fontName
 * @param {"google"|"adobe"} provider
 */
function loadFont(fontName, provider = "google") {
    if (!fontName) {
        return;
    }
    const key = `${provider}:${fontName}`;
    if (!window.__loadedFontFamilies) {
        window.__loadedFontFamilies = new Set();
    }
    if (window.__loadedFontFamilies.has(key)) {
        return;
    }
    window.__loadedFontFamilies.add(key);

    if (provider === "adobe") {
        ensureAdobeFontsKit();
        return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    const q = encodeURIComponent(fontName).replace(/%20/g, "+");
    link.href = `https://fonts.googleapis.com/css2?family=${q}:wght@400;600&display=swap`;
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

function clearProductFilters() {
    document
        .querySelectorAll(".filter-combo, .filter-style, .filter-use")
        .forEach((cb) => {
            cb.checked = false;
        });
    const cy = document.getElementById("cyrillic-only");
    if (cy) cy.checked = false;
    activeFilteredProducts = null;
    currentIndex = 0;
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

/** Сортиран списък според текущата подредба (за AI контекст и рендер). */
function getSortedCatalogList() {
    if (!products.length) {
        return [];
    }
    const baseProducts = getBaseList();
    let sorted = [...baseProducts];
    const sortValue = document.getElementById("sort-select")?.value;

    if (sortValue === "az") {
        sorted.sort((a, b) => a.name.localeCompare(b.name, "bg"));
    } else if (sortValue === "za") {
        sorted.sort((a, b) => b.name.localeCompare(a.name, "bg"));
    } else if (sortValue === "popular") {
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortValue === "modern") {
        sorted.sort((a, b) => (b.modernScore || 0) - (a.modernScore || 0));
    }
    return sorted;
}

function getSidebarFilterState() {
    return {
        combination: [
            ...document.querySelectorAll(".filter-combo:checked"),
        ].map((cb) => cb.value),
        style: [...document.querySelectorAll(".filter-style:checked")].map(
            (cb) => cb.value
        ),
        use: [...document.querySelectorAll(".filter-use:checked")].map(
            (cb) => cb.value
        ),
        cyrillicOnly: Boolean(document.getElementById("cyrillic-only")?.checked),
    };
}

const MAX_TRACKED_PAIR_INTERACTIONS = 24;
let interactedPairIds = [];

function recordPairInteraction(pairId) {
    interactedPairIds = interactedPairIds.filter((id) => id !== pairId);
    interactedPairIds.push(pairId);
    if (interactedPairIds.length > MAX_TRACKED_PAIR_INTERACTIONS) {
        interactedPairIds = interactedPairIds.slice(-MAX_TRACKED_PAIR_INTERACTIONS);
    }
}

/**
 * Снимка за AI / плъгин: какво гледа потребителят в каталога (и накъде е кликвал).
 * Плъгинът за Figma/Adobe по-късно може да подава друг channel + documentContext.
 */
window.getAssistantContext = function getAssistantContext() {
    const sorted = getSortedCatalogList();
    const visible = sorted.slice(0, currentIndex + itemsPerPage);
    const pairById = new Map(products.map((p) => [p.id, p]));

    const summarize = (p) => ({
        id: p.id,
        name: p.name,
        headingFont: p.headingFont,
        bodyFont: p.bodyFont,
        headingCategory: p.category,
        combo: p.combo,
        styles: p.styles || [],
        use: p.use || [],
    });

    const recentlyClicked = interactedPairIds
        .map((id) => pairById.get(id))
        .filter(Boolean)
        .map(summarize);

    return {
        version: 1,
        channel: "web_catalog",
        locale: "bg",
        currentCategory,
        sort: document.getElementById("sort-select")?.value || "",
        sidebarFilters: getSidebarFilterState(),
        customFilterPipelineActive: activeFilteredProducts !== null,
        totalMatchingPairs: sorted.length,
        visiblePairSummaries: visible.map(summarize),
        recentlyInteractedPairs: recentlyClicked.slice(-12),
    };
};

function chipsFromTags(tags, labels) {
    return (tags || [])
        .map(
            (t) =>
                `<span class="tag-chip" data-tag="${escapeHtml(t)}">${escapeHtml(labels[t] || t)}</span>`
        )
        .join("");
}

const SPECIMEN_PREVIEW_MAX = 160;

/** Кратък параграф винаги видим; пълният текст е в зоната „Посочи за образец…“. */
function truncateSpecimenPreview(text) {
    const t = (text || "").trim();
    if (!t) {
        return "";
    }
    if (t.length <= SPECIMEN_PREVIEW_MAX) {
        return t;
    }
    const slice = t.slice(0, SPECIMEN_PREVIEW_MAX);
    const lastSpace = slice.lastIndexOf(" ");
    const cut = lastSpace > 50 ? slice.slice(0, lastSpace) : slice;
    return `${cut.trim()}…`;
}

function getSpecimenBodyPx() {
    const el = document.getElementById("specimen-size");
    const n = el ? Number(el.value) : 22;
    return Number.isFinite(n) ? n : 22;
}

function getSpecimenHeadingPx() {
    const b = getSpecimenBodyPx();
    return Math.round(b * 1.35 * 10) / 10;
}

function escapeAttr(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");
}

function updateCustomSpecimenPreview(card) {
    if (!card) {
        return;
    }
    const hFont = card.getAttribute("data-heading-font") || "";
    const bFont = card.getAttribute("data-body-font") || "";
    const headPx = getSpecimenHeadingPx();
    const bodyPx = getSpecimenBodyPx();
    const headInput = card.querySelector(".font-pair-custom-heading");
    const bodyTa = card.querySelector(".font-pair-custom-body");
    const headPrev = card.querySelector(".font-pair-custom-preview-heading");
    const bodyPrev = card.querySelector(".font-pair-custom-preview-body");
    if (headInput && headPrev) {
        headPrev.textContent = headInput.value;
        headPrev.style.fontFamily = `'${hFont}', serif`;
        headPrev.style.fontSize = `${headPx}px`;
        headPrev.style.lineHeight = "1.25";
    }
    if (bodyTa && bodyPrev) {
        bodyPrev.textContent = bodyTa.value;
        bodyPrev.style.fontFamily = `'${bFont}', sans-serif`;
        bodyPrev.style.fontSize = `${bodyPx}px`;
        bodyPrev.style.lineHeight = "1.45";
    }
}

function refreshAllCustomSpecimenPreviews() {
    document
        .querySelectorAll(".font-pair-card")
        .forEach(updateCustomSpecimenPreview);
}

function renderProducts() {
    const productList = document.getElementById("product-list");
    const productCount = document.getElementById("product-count");
    const loadMoreBtn = document.getElementById("load-more");

    if (!window.__fontsCatalogLoaded) {
        productList.innerHTML =
            "<p class=\"empty-state\" role=\"status\">Зареждане на каталога…</p>";
        productCount.textContent = "";
        loadMoreBtn.style.display = "none";
        return;
    }

    if (!products.length) {
        productList.innerHTML =
            "<p class=\"empty-state\" role=\"alert\">Каталогът не можа да се зареди. Провери API ключа, мрежата или опитай по-късно.</p>";
        productCount.textContent = "";
        loadMoreBtn.style.display = "none";
        return;
    }

    const sortedProducts = getSortedCatalogList();

    if (!sortedProducts.length) {
        const hasActiveFilters = activeFilteredProducts !== null;
        productList.innerHTML = `
            <div class="empty-state" role="status">
                <p>Няма двойки, които отговарят на филтрите и избраната категория.</p>
                ${
                    hasActiveFilters
                        ? '<p><button type="button" class="empty-state-clear" onclick="clearProductFilters()">Изчисти филтрите</button></p>'
                        : "<p>Избери друга категория от менюто горе.</p>"
                }
            </div>`;
        productCount.textContent = "0 резултата.";
        loadMoreBtn.style.display = "none";
        return;
    }

    const baseProducts = sortedProducts;
    const visible = sortedProducts.slice(0, currentIndex + itemsPerPage);
    const bodyPx = getSpecimenBodyPx();
    const headPx = getSpecimenHeadingPx();

    visible.forEach((p) => {
        loadFont(p.headingFont, p.headingProvider || "google");
        loadFont(p.bodyFont, p.bodyProvider || "google");
    });

    productList.innerHTML = visible
        .map((p) => {
            const bodyFull = p.bodySample || "";
            const bodyPreview = truncateSpecimenPreview(bodyFull);
            const bodyStyle = `font-family: '${p.bodyFont}', sans-serif; font-size: ${bodyPx}px`;
            return `
        <article class="product-card font-pair-card" data-pair-id="${p.id}" data-heading-font="${escapeAttr(p.headingFont)}" data-body-font="${escapeAttr(p.bodyFont)}" data-heading-provider="${escapeHtml(p.headingProvider || "google")}" data-body-provider="${escapeHtml(p.bodyProvider || "google")}">
            <div class="font-pair-card__main">
                <header class="font-pair-card__header font-pair-card__header--primary">
                    <h2 class="specimen-heading" style="font-family: '${p.headingFont}', serif; font-size: ${headPx}px">${escapeHtml(p.headingSample || "")}</h2>
                    <p class="specimen-body specimen-body--preview" style="${bodyStyle}">${escapeHtml(bodyPreview)}</p>
                    <p class="specimen-body specimen-body--touch-full" style="${bodyStyle}">${escapeHtml(bodyFull)}</p>
                </header>
                <p class="font-pair-title"><strong>${escapeHtml(p.name)}</strong></p>
                <div class="tag-row tag-row--styles" aria-label="Стил">${chipsFromTags(p.styles, STYLE_LABELS)}</div>
                <div class="tag-row tag-row--use" aria-label="Подходящ за">${chipsFromTags(p.use, USE_LABELS)}</div>
                <div class="stars" aria-label="Рейтинг">${getStars(p.rating)}</div>
                <div class="font-pair-card__interactive">
                    <div class="font-pair-card__custom-zone" aria-label="Собствен текст за образец">
                        <p class="font-pair-card__custom-label">Свой образец с кирилица</p>
                        <label class="font-pair-card__custom-field-label visually-hidden" for="custom-h-${p.id}">Ред за заглавие</label>
                        <input type="text" id="custom-h-${p.id}" class="font-pair-custom-heading" placeholder="Ред за заглавие (кирилица)" autocomplete="off" />
                        <div class="font-pair-custom-preview-heading" aria-live="polite"></div>
                        <label class="font-pair-card__custom-field-label visually-hidden" for="custom-b-${p.id}">Параграф</label>
                        <textarea id="custom-b-${p.id}" class="font-pair-custom-body" rows="2" placeholder="Параграф с кирилица — виж как изглежда с шрифта за текст"></textarea>
                        <div class="font-pair-custom-preview-body" aria-live="polite"></div>
                    </div>
                    <button type="button" class="font-pair-card__details-btn" onclick="addToCart()">Детайли</button>
                </div>
            </div>
        </article>
    `;
        })
        .join("");

    productCount.textContent = `Показани ${visible.length} от ${baseProducts.length}.`;

    loadMoreBtn.style.display =
        visible.length >= baseProducts.length ? "none" : "block";

    refreshAllCustomSpecimenPreviews();
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
    document.getElementById("product-list")?.addEventListener("click", (e) => {
        const t = e.target;
        if (t.closest?.("input, textarea, select, option, label")) {
            return;
        }
        const card = t.closest?.(".font-pair-card");
        if (!card) {
            return;
        }
        const raw = card.getAttribute("data-pair-id");
        const id = raw != null ? Number(raw) : NaN;
        if (Number.isFinite(id)) {
            recordPairInteraction(id);
        }
    });

    document.getElementById("product-list")?.addEventListener("input", (e) => {
        const card = e.target.closest?.(".font-pair-card");
        if (!card || !e.target.closest?.(".font-pair-card__custom-zone")) {
            return;
        }
        updateCustomSpecimenPreview(card);
    });

    document.getElementById("sort-select")?.addEventListener("change", () => {
        currentIndex = 0;
        renderProducts();
    });

    document.getElementById("specimen-size")?.addEventListener("input", () => {
        const bodyPx = getSpecimenBodyPx();
        const headPx = getSpecimenHeadingPx();
        document.querySelectorAll(".specimen-body").forEach((el) => {
            el.style.fontSize = `${bodyPx}px`;
        });
        document.querySelectorAll(".specimen-heading").forEach((el) => {
            el.style.fontSize = `${headPx}px`;
        });
        refreshAllCustomSpecimenPreviews();
    });

    renderProducts();
});
