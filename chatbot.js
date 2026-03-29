/**
 * Контекстно-осъзнат асистент за Джулюница.
 *
 * Продуктова идея: да анализира какво потребителят е филтрирал/разглеждал в каталога
 * (и в бъдеще — контекст от плъгин в Figma / Adobe), за да предлага шрифтови двойки и обяснения.
 *
 * Бекенд (препоръчително): window.CHATBOT_BACKEND_URL = "https://…/api/chat"
 *   POST JSON: { "message": string, "context": object }
 *   context идва от window.getAssistantContext() (дефиниран в main.js) или от плъгин с друг channel.
 *   Отговор: JSON с reply | text | message (низ).
 *
 * Без бекенд: локален fallback с ключови думи + обобщение от текущия контекст на страницата.
 */
(function () {
    const messagesEl = document.getElementById("chatbot-messages");
    const inputEl = document.getElementById("chatbot-input");
    const sendBtn = document.getElementById("chatbot-send");

    if (!messagesEl || !inputEl || !sendBtn) {
        return;
    }

    function collectContext() {
        if (typeof window.getAssistantContext !== "function") {
            return null;
        }
        try {
            return window.getAssistantContext();
        } catch (e) {
            return null;
        }
    }

    function appendMessage(role, text) {
        const div = document.createElement("div");
        div.className = `chatbot-msg chatbot-msg--${role}`;
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    const CATEGORY_BG = {
        all: "Всички",
        serif: "Серифни заглавия",
        sans: "Безсерифни заглавия",
        display: "Декоративни заглавия",
    };

    function describeFilters(ctx) {
        if (!ctx || !ctx.sidebarFilters) {
            return "";
        }
        const f = ctx.sidebarFilters;
        const parts = [];
        if (f.combination?.length) {
            parts.push("комбинация: " + f.combination.join(", "));
        }
        if (f.style?.length) {
            parts.push("стил: " + f.style.join(", "));
        }
        if (f.use?.length) {
            parts.push("употреба: " + f.use.join(", "));
        }
        if (f.cyrillicOnly) {
            parts.push("само кирилица");
        }
        return parts.length ? parts.join("; ") : "без активни филтри в лентата";
    }

    function fallbackRecommendation(ctx) {
        if (!ctx || !ctx.visiblePairSummaries?.length) {
            return "В момента няма видими двойки в каталога — смени категорията или изчисти филтрите, после пак попитай за препоръка.";
        }

        const last =
            ctx.recentlyInteractedPairs?.length > 0
                ? ctx.recentlyInteractedPairs[
                      ctx.recentlyInteractedPairs.length - 1
                  ]
                : null;

        const cat =
            CATEGORY_BG[ctx.currentCategory] || ctx.currentCategory || "—";
        const filterDesc = describeFilters(ctx);
        const top = ctx.visiblePairSummaries[0];

        let text =
            `По това, което виждам в каталога: категория „${cat}“, ${filterDesc}. ` +
            `Има ${ctx.totalMatchingPairs} двойки, които отговарят; на екрана са първите ${ctx.visiblePairSummaries.length}. `;

        if (last) {
            text +=
                `Последно разгледа „${last.name}“ (заглавие: ${last.headingFont}, текст: ${last.bodyFont}). ` +
                `Ако ти харесва посоката, остани на подобна комбинация (${last.combo}); ако искаш по-спокойно тяло, потърси двойка с sans за body. `;
        } else {
            text +=
                `За начало разгледай „${top.name}“ — заглавие ${top.headingFont}, основен текст ${top.bodyFont}. `;
        }

        text +=
            "С истински AI бекенд бих анализирал този контекст + кратък бриф от теб и бих предложил 2–3 конкретни алтернативи.";
        return text;
    }

    function fallbackReply(userText, ctx) {
        const t = userText.toLowerCase();

        if (
            /препоръч|подходящ|какъв шрифт|кои шрифт|идея|suggest|recommend|помогни да избера/.test(
                t
            )
        ) {
            return fallbackRecommendation(ctx);
        }

        if (/какво съм|какво съм гледал|какво съм клик|контекст|виждаш ли/.test(t)) {
            if (!ctx) {
                return "Нямам достъп до контекста на каталога (main.js не е зареден).";
            }
            const n = ctx.recentlyInteractedPairs?.length || 0;
            const cat = CATEGORY_BG[ctx.currentCategory] || ctx.currentCategory;
            return `Виждам категория „${cat}“, ${describeFilters(ctx)}. Разгледани карти (последователност на клик): ${n}. Видими на страницата: ${ctx.visiblePairSummaries?.length || 0} от ${ctx.totalMatchingPairs || 0} общо съвпадащи.`;
        }

        if (/здравей|здрасти|hi|hello|hey/.test(t)) {
            return "Здравей! Вземам предвид какво си филтрирал и какво си разглеждал в каталога — попитай за препоръка за шрифт или напиши „какво виждаш“. С плъгин за дизайн софтуер същият API ще получава и контекст от файла.";
        }
        if (/филтр|filter/.test(t)) {
            return "Вляво избери комбинация, стил, кирилица и употреба, после „Приложи“. Асистентът изпраща тези избори към бекенда заедно с въпроса ти.";
        }
        if (/сериф|serif|засечк/.test(t)) {
            return "Серифните шрифтове имат засечки; често са силни за заглавия и печат. В каталога „Серифни“ означава serif за заглавната роля в двойката.";
        }
        if (/sans|безсериф|без засечк/.test(t)) {
            return "Безсерифните са по-четими на екран; често са за основен текст. При нас филтърът „Безсерифни“ е по заглавния шрифт в двойката.";
        }
        if (/кирилиц|кирил|cyrillic|българск/.test(t)) {
            return "Фокусът е кирилица за български — избягваме случайни „универсални“ двойки. Контекстът ти в каталога се изпраща към AI, за да предложи съвместими семейства.";
        }
        if (/плъгин|figma|adobe|sketch|дизайн софтуер/.test(t)) {
            return "Уеб каталогът вече подава context JSON (channel: web_catalog). Плъгинът може да вика същия бекенд с channel: figma или adobe и полета за избран текст, стилове в документа и бранд гайд — така предприятията получават същия „умен“ съветник в инструмента, с който работят.";
        }
        if (/комбинац|двойк|pair|заглави/.test(t)) {
            return "Всяка карта е двойка заглавие + текст с жив образец. Асистентът вижда кои двойки са ти на екрана и върху кои си кликнал.";
        }
        if (/лиценз|google font|изтегл/.test(t)) {
            return "Провери лиценза в Google Fonts за всяко семейство. Контекстът от каталога не заменя правен преглед за комерсиална употреба.";
        }
        if (/помощ|help|как работи/.test(t)) {
            return "Пиши „препоръчай шрифт“ — ще обобщя текущата категория, филтрите и последните кликнати карти. За пълен AI задай CHATBOT_BACKEND_URL и подай същия context на сървъра.";
        }

        return (
            "Не разпознах въпроса. Опитай „препоръчай шрифт“, „какво виждаш“ или ключови думи като serif, филтри, плъгин. " +
            (ctx?.visiblePairSummaries?.length
                ? `На екрана ти са „${ctx.visiblePairSummaries[0].name}“ и още ${ctx.visiblePairSummaries.length - 1} двойки.`
                : "")
        );
    }

    async function fetchBackendReply(userText, context) {
        const url = window.CHATBOT_BACKEND_URL;
        if (!url || typeof url !== "string") {
            return null;
        }

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText, context }),
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const reply =
            (typeof data.reply === "string" && data.reply) ||
            (typeof data.text === "string" && data.text) ||
            (typeof data.message === "string" && data.message) ||
            null;

        if (!reply) {
            throw new Error("Invalid JSON shape");
        }
        return reply;
    }

    async function getReply(userText) {
        const context = collectContext();
        try {
            const backend = await fetchBackendReply(userText, context);
            if (backend !== null) {
                return backend;
            }
        } catch (e) {
            return (
                "Възникна грешка при връзката със сървъра. Провери CHATBOT_BACKEND_URL и CORS. " +
                "Локален съвет: " +
                fallbackReply(userText, context)
            );
        }
        return fallbackReply(userText, context);
    }

    let busy = false;

    async function onSend() {
        const text = inputEl.value.trim();
        if (!text || busy) {
            return;
        }

        busy = true;
        sendBtn.disabled = true;
        appendMessage("user", text);
        inputEl.value = "";

        const loading = document.createElement("div");
        loading.className = "chatbot-msg chatbot-msg--bot chatbot-msg--loading";
        loading.textContent = "Мисля…";
        messagesEl.appendChild(loading);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        try {
            const reply = await getReply(text);
            loading.remove();
            appendMessage("bot", reply);
        } catch (err) {
            loading.remove();
            appendMessage("bot", "Нещо се обърка. Опитай отново.");
        }

        busy = false;
        sendBtn.disabled = false;
        inputEl.focus();
    }

    sendBtn.addEventListener("click", onSend);
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onSend();
        }
    });

    appendMessage(
        "bot",
        "Здравей! Аз гледам какво си избрал в каталога (категория, филтри, кликнати карти) и заедно с въпроса ти изпращам това към бекенда, когато зададеш CHATBOT_BACKEND_URL. Напиши „препоръчай шрифт“ или „какво виждаш“ за бърз тест без AI."
    );
})();
