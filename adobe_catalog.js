/**
 * Adobe Fonts (Typekit) — примерни двойки, които обикновено не са в Google Fonts
 * или се ползват основно от екипи с Creative Cloud.
 *
 * За да се заредят Adobe страните на шрифта:
 * 1. Отвори https://fonts.adobe.com → Web → създай проект.
 * 2. Добави в проекта същите семейства, както са записани в headingFont (Adobe страна).
 * 3. В „Embed“ копирай Kit ID от URL: https://use.typekit.net/XXXXXXX.css
 * 4. Постави ID в ADOBE_FONTS_KIT_ID по-долу.
 *
 * Имената headingFont трябва да съвпадат с font-family в генерирания CSS на Adobe
 * (често с малки букви и тире, напр. proxima-nova, minion-pro). При нужда ги коригирай тук.
 *
 * Лиценз: спазвай Adobe Fonts terms и pageview правилата за уеб проекта си.
 */
window.ADOBE_FONTS_KIT_ID = "";

/**
 * Готови записи в същия формат като каталога от Google API.
 * id: отрицателни числа, за да не се застъпват с автоматичните.
 */
window.ADOBE_FONTS_CATALOG = [
    {
        id: -1001,
        name: "Proxima Nova + IBM Plex Sans",
        description:
            "Sans за заглавие от Adobe Fonts + четим нео-гротеск с кирилица от Google Fonts.",
        category: "sans",
        combo: "sans-sans",
        styles: ["modern", "elegant"],
        use: ["web", "presentation"],
        cyrillic: true,
        headingFont: "proxima-nova",
        bodyFont: "IBM Plex Sans",
        headingProvider: "adobe",
        bodyProvider: "google",
        catalogSource: "mixed",
        headingSample: "Инвестиции · ESG · 2026",
        bodySample:
            "Обединяваме каталози: шрифтове с кирилица от различни намеряващи се източници на едно място за преглед и сравнение.",
        rating: 5,
        modernScore: 9,
    },
    {
        id: -1002,
        name: "Minion Pro + Source Sans 3",
        description:
            "Класически serif за заглавия (Adobe) + неутрален sans за тяло (Google).",
        category: "serif",
        combo: "serif-sans",
        styles: ["elegant", "minimal"],
        use: ["web", "logo"],
        cyrillic: true,
        headingFont: "minion-pro",
        bodyFont: "Source Sans 3",
        headingProvider: "adobe",
        bodyProvider: "google",
        catalogSource: "mixed",
        headingSample: "Годишен доклад към акционерите",
        bodySample:
            "Български образец: жълтица, щъркел, ъгъл — проверка на типографията за печат и екран.",
        rating: 5,
        modernScore: 7,
    },
    {
        id: -1003,
        name: "Neue Haas Grotesk + Lora",
        description:
            "Геометричен sans от Adobe Fonts + serif с кирилица от Google за акцент в текста.",
        category: "sans",
        combo: "serif-sans",
        styles: ["minimal", "modern"],
        use: ["web", "social"],
        cyrillic: true,
        headingFont: "neue-haas-grotesk",
        bodyFont: "Lora",
        headingProvider: "adobe",
        bodyProvider: "google",
        catalogSource: "mixed",
        headingSample: "Реклама · социални мрежи",
        bodySample:
            "Цел: един каталог за екипи, които вече ползват Adobe в дизайна, без да губят достъп до Google Fonts.",
        rating: 4,
        modernScore: 8,
    },
];
