// Зарежда Google Fonts с кирилица и изгражда каталог за main.js.

const API_KEY = "AIzaSyCVa2gC0rXqaTeZruE97PRpbbmK8fuU5V8";

const STYLE_POOL = ["modern", "minimal", "elegant", "bold"];
const USE_POOL = ["web", "logo", "social", "presentation"];

const SPECIMEN_HEADINGS = [
    "Годишен отчет 2026",
    "Магазин „Щастлива улица“",
    "ЧЗВ: доставка и плащане",
    "Резюме: UX за публични услуги",
];

const SPECIMEN_BODIES = [
    "Поръчка № BG-12 345 · 1 249,90 лв. с ДДС. Доставка до офис: 3–5 работни дни. Жълтица, щъркел, мляко — проверка на букви и цифри.",
    "Община Русе обявява обществена поръчка с краен срок 17:00 ч. на 15.04.2026 г. Документите са в раздел „За фирми“.",
    "„Нямаме нужда от още един руски шрифт с кирилица“ — каза арт директорът и отвори каталога с български двойки.",
    "Температура: −3 °C. Влажност: 68 %. Имейл: hello@dzhulyunitsa.bg · тел. +359 88 000 0000.",
];

function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

function pickTags(seed, pool, count) {
    let h = hashStr(seed);
    const available = [...pool];
    const out = [];
    for (let i = 0; i < count && available.length; i++) {
        const idx = h % available.length;
        out.push(available[idx]);
        available.splice(idx, 1);
        h = Math.floor(h / 7) + 1;
    }
    return out;
}

function isSerif(cat) {
    return cat === "serif";
}

/** За филтъра „Комбинация“: serif+serif | sans+sans | смесена (едно serif, едно не-serif). */
function comboFromPair(headingCat, bodyCat) {
    const h = isSerif(headingCat);
    const b = isSerif(bodyCat);
    if (h && b) return "serif-serif";
    if (!h && !b) return "sans-sans";
    return "serif-sans";
}

function navCategoryFromHeading(headingCat) {
    if (headingCat === "serif") return "serif";
    if (headingCat === "display") return "display";
    return "sans";
}

function specimenForIndex(i, name) {
    const h = hashStr(name + String(i));
    const hi = h % SPECIMEN_HEADINGS.length;
    const bi = (h >> 3) % SPECIMEN_BODIES.length;
    return {
        headingSample: SPECIMEN_HEADINGS[hi],
        bodySample: SPECIMEN_BODIES[bi],
    };
}

function buildPairEntry(i, heading, body) {
    const name = `${heading.family} + ${body.family}`;
    const seed = name + String(i);
    const specimen = specimenForIndex(i, name);
    return {
        id: i,
        name,
        description: "Препоръчана двойка за заглавие и основен текст.",
        category: navCategoryFromHeading(heading.category),
        combo: comboFromPair(heading.category, body.category),
        styles: pickTags(seed, STYLE_POOL, 2),
        use: pickTags(seed + "use", USE_POOL, 2),
        cyrillic: true,
        headingFont: heading.family,
        bodyFont: body.family,
        headingSample: specimen.headingSample,
        bodySample: specimen.bodySample,
        rating: 3 + (i % 3),
        modernScore: (hashStr(name) % 10) + 1,
    };
}

function notifyReady(catalog) {
    window.__fontsCatalogLoaded = true;
    if (typeof window.onFontsCatalogReady === "function") {
        window.onFontsCatalogReady(catalog);
    }
}

window.__fontsCatalogLoaded = false;

fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${encodeURIComponent(API_KEY)}`
)
    .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then((data) => {
        const cyrillic = (data.items || []).filter((font) =>
            (font.subsets || []).includes("cyrillic")
        );

        const serif = cyrillic.filter((f) => f.category === "serif");
        const sans = cyrillic.filter((f) => f.category === "sans-serif");
        const display = cyrillic.filter((f) => f.category === "display");

        const n = Math.min(24, serif.length, sans.length);

        const catalog = [];

        for (let i = 0; i < n; i++) {
            catalog.push(
                buildPairEntry(catalog.length, serif[i % serif.length], sans[i % sans.length])
            );
        }

        const sansCount = Math.min(12, sans.length);
        for (let i = 0; i < sansCount && sans.length > 1; i++) {
            catalog.push(
                buildPairEntry(
                    catalog.length,
                    sans[i % sans.length],
                    sans[(i + 1) % sans.length]
                )
            );
        }

        const serifCount = Math.min(8, serif.length);
        for (let i = 0; i < serifCount && serif.length > 1; i++) {
            catalog.push(
                buildPairEntry(
                    catalog.length,
                    serif[i % serif.length],
                    serif[(i + 1) % serif.length]
                )
            );
        }

        const dispCount = Math.min(8, display.length, sans.length);
        for (let i = 0; i < dispCount; i++) {
            catalog.push(
                buildPairEntry(
                    catalog.length,
                    display[i % display.length],
                    sans[i % sans.length]
                )
            );
        }

        const adobeExtra = Array.isArray(window.ADOBE_FONTS_CATALOG)
            ? window.ADOBE_FONTS_CATALOG
            : [];
        /** Adobe първи — показва идеята „няколко намеряващи се източника на едно място“. */
        notifyReady([...adobeExtra, ...catalog]);
    })
    .catch(() => {
        const adobeExtra = Array.isArray(window.ADOBE_FONTS_CATALOG)
            ? window.ADOBE_FONTS_CATALOG
            : [];
        notifyReady(adobeExtra.length ? adobeExtra : []);
    });
