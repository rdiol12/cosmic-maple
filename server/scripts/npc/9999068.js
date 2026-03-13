/**
 * NPC: Traveling Merchant Zephyr (9999068)
 * Location: Orbis (200000000)
 * Type: Rotating Daily Shop — different deals each day of the week
 *
 * Concept: A mysterious merchant who travels between worlds, arriving in Orbis
 * with a different stock each day. Encourages daily visits and provides
 * mid-game meso sinks with valuable items.
 *
 * Schedule:
 *   Monday:    Scroll Day — rare scrolls at premium prices
 *   Tuesday:   Potion Day — bulk potions and special buffs
 *   Wednesday: Equipment Day — unique untradeable accessories
 *   Thursday:  Gamble Day — mystery packs with random rewards
 *   Friday:    Treasure Day — rare materials and crafting items
 *   Saturday:  Chaos Day — Chaos/White scrolls, expensive
 *   Sunday:    Bargain Day — everything 50% off from a random day
 *
 * Daily purchase limits prevent hoarding. Prices are high enough
 * to serve as meso sinks for mid-game players (Lv50+).
 */

var status = -1;
var sel = -1;
var QUEST_ID = 99212;
var DAILY_PURCHASE_LIMIT = 5;

// Day-of-week names
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Stock definitions per day of week (0=Sun, 1=Mon, ..., 6=Sat)
// Monday: Scrolls
var mondayStock = [
    { id: 2040200, name: "Scroll for Helm DEF 60%", price: 500000, qty: 1 },
    { id: 2040002, name: "Scroll for Top DEF 60%", price: 500000, qty: 1 },
    { id: 2044400, name: "Scroll for Shield DEF 60%", price: 400000, qty: 1 },
    { id: 2040502, name: "Scroll for Overall DEX 60%", price: 600000, qty: 1 },
    { id: 2043000, name: "Scroll for Cape STR 60%", price: 700000, qty: 1 }
];

// Tuesday: Potions
var tuesdayStock = [
    { id: 2000005, name: "Power Elixir", price: 5000, qty: 50 },
    { id: 2001001, name: "Wizard Elixir", price: 8000, qty: 30 },
    { id: 2001002, name: "Warrior Elixir", price: 8000, qty: 30 },
    { id: 2022179, name: "Onyx Apple", price: 100000, qty: 5 },
    { id: 2022000, name: "Pure Water", price: 3000, qty: 50 }
];

// Wednesday: Equipment (accessories)
var wednesdayStock = [
    { id: 1032024, name: "Raccoon Mask", price: 3000000, qty: 1 },
    { id: 1012070, name: "Spectrum Goggles", price: 2500000, qty: 1 },
    { id: 1082145, name: "Stormcaster Gloves", price: 4000000, qty: 1 },
    { id: 1102041, name: "Amos's Royal Cape", price: 5000000, qty: 1 },
    { id: 1032025, name: "Brown Raccoon Mask", price: 3500000, qty: 1 }
];

// Thursday: Mystery Packs (gamble)
var thursdayStock = [
    { id: -1, name: "Bronze Mystery Pack", price: 100000, qty: 1, type: "mystery_bronze" },
    { id: -2, name: "Silver Mystery Pack", price: 500000, qty: 1, type: "mystery_silver" },
    { id: -3, name: "Gold Mystery Pack", price: 2000000, qty: 1, type: "mystery_gold" }
];

// Friday: Materials
var fridayStock = [
    { id: 4010000, name: "Mineral Ore", price: 10000, qty: 30 },
    { id: 4010001, name: "Steel Ore", price: 15000, qty: 30 },
    { id: 4010002, name: "Mithril Ore", price: 25000, qty: 20 },
    { id: 4010003, name: "Adamantium Ore", price: 40000, qty: 20 },
    { id: 4010004, name: "Gold Ore", price: 60000, qty: 10 },
    { id: 4010006, name: "Diamond Ore", price: 150000, qty: 5 }
];

// Saturday: Chaos Day (expensive)
var saturdayStock = [
    { id: 2049100, name: "Chaos Scroll 60%", price: 8000000, qty: 1 },
    { id: 2340000, name: "White Scroll", price: 15000000, qty: 1 },
    { id: 2049003, name: "Clean Slate Scroll 10%", price: 3000000, qty: 1 },
    { id: 2049000, name: "Clean Slate Scroll 1%", price: 500000, qty: 3 }
];

// Sunday: Bargain (uses random other day at 50% off — determined by week number)

var allStocks = [null, mondayStock, tuesdayStock, wednesdayStock, thursdayStock, fridayStock, saturdayStock];

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1) { cm.dispose(); return; }
    if (mode === 0 && status <= 0) { cm.dispose(); return; }
    if (mode === 1) status++;
    else status--;

    if (status === 0) {
        var dayOfWeek = getDayOfWeek();
        var dayName = dayNames[dayOfWeek];
        var purchases = getDailyPurchases();
        var remaining = DAILY_PURCHASE_LIMIT - purchases;

        var greeting = getGreetingByDay(dayOfWeek);
        var stock = getStockForDay(dayOfWeek);

        var text = "#e#dTraveling Merchant Zephyr#k#n\r\n\r\n";
        text += greeting + "\r\n\r\n";
        text += "#eToday: " + dayName + " — " + getDayTheme(dayOfWeek) + "#n\r\n";
        text += "#g(Purchases remaining: " + remaining + "/" + DAILY_PURCHASE_LIMIT + ")#k\r\n\r\n";

        if (remaining <= 0) {
            text += "#rYou've bought all you can today. I'll have new stock tomorrow!#k\r\n\r\n";
            text += "#L99#Tell me about your schedule#l";
            cm.sendSimple(text);
            return;
        }

        var isBargain = (dayOfWeek === 0);
        var discount = isBargain ? 0.5 : 1.0;

        for (var i = 0; i < stock.length; i++) {
            var item = stock[i];
            var price = Math.floor(item.price * discount);
            var qtyText = item.qty > 1 ? " (x" + item.qty + ")" : "";
            var bargainTag = isBargain ? " #r[50% OFF]#k" : "";
            text += "#L" + i + "#";
            if (item.id > 0) {
                text += "#v" + item.id + "# ";
            }
            text += "#b" + item.name + qtyText + "#k — " + formatMeso(price) + " meso" + bargainTag + "#l\r\n";
        }

        text += "\r\n#L99#Tell me about your schedule#l";
        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;

        if (sel === 99) {
            // Schedule info
            cm.sendOk(
                "#e#dZephyr's Weekly Schedule#k#n\r\n\r\n" +
                "#eMonday#n — Scroll Day: Rare scrolls at premium prices\r\n" +
                "#eTuesday#n — Potion Day: Bulk potions and power-ups\r\n" +
                "#eWednesday#n — Equipment Day: Unique accessories\r\n" +
                "#eThursday#n — Gamble Day: Mystery packs with random loot\r\n" +
                "#eFriday#n — Treasure Day: Ores and crafting materials\r\n" +
                "#eSaturday#n — Chaos Day: Premium scrolls (Chaos, White)\r\n" +
                "#eSunday#n — Bargain Day: Random day's stock at 50% off!\r\n\r\n" +
                "I accept up to #b" + DAILY_PURCHASE_LIMIT + " purchases per day#k per customer.\r\n" +
                "Stock refreshes at midnight server time."
            );
            cm.dispose();
            return;
        }

        var dayOfWeek = getDayOfWeek();
        var stock = getStockForDay(dayOfWeek);
        var isBargain = (dayOfWeek === 0);
        var discount = isBargain ? 0.5 : 1.0;

        if (sel < 0 || sel >= stock.length) {
            cm.dispose();
            return;
        }

        var item = stock[sel];
        var price = Math.floor(item.price * discount);

        var purchases = getDailyPurchases();
        if (purchases >= DAILY_PURCHASE_LIMIT) {
            cm.sendOk("You've reached today's purchase limit. Come back tomorrow!");
            cm.dispose();
            return;
        }

        if (cm.getMeso() < price) {
            cm.sendOk("You need #r" + formatMeso(price) + " mesos#k for that.\r\nYou only have #r" + formatMeso(cm.getMeso()) + "#k.");
            cm.dispose();
            return;
        }

        var qtyText = item.qty > 1 ? " (x" + item.qty + ")" : "";
        cm.sendYesNo(
            "#e#dTraveling Merchant Zephyr#k#n\r\n\r\n" +
            "You want to buy #b" + item.name + qtyText + "#k?\r\n\r\n" +
            "Price: #r" + formatMeso(price) + " mesos#k\r\n\r\n" +
            "Confirm your purchase?"
        );

    } else if (status === 2) {
        var dayOfWeek = getDayOfWeek();
        var stock = getStockForDay(dayOfWeek);
        var isBargain = (dayOfWeek === 0);
        var discount = isBargain ? 0.5 : 1.0;

        if (sel < 0 || sel >= stock.length) {
            cm.dispose();
            return;
        }

        var item = stock[sel];
        var price = Math.floor(item.price * discount);

        // Double-check meso
        if (cm.getMeso() < price) {
            cm.sendOk("Not enough mesos!");
            cm.dispose();
            return;
        }

        // Double-check limit
        var purchases = getDailyPurchases();
        if (purchases >= DAILY_PURCHASE_LIMIT) {
            cm.sendOk("Daily limit reached!");
            cm.dispose();
            return;
        }

        cm.gainMeso(-price);

        var mysteryResult = null;

        // Handle mystery packs (Thursday gamble) — functions return result text
        if (item.type === "mystery_bronze") {
            mysteryResult = giveMysteryBronze();
        } else if (item.type === "mystery_silver") {
            mysteryResult = giveMysterySilver();
        } else if (item.type === "mystery_gold") {
            mysteryResult = giveMysteryGold();
        } else {
            // Normal item
            if (cm.canHold(item.id)) {
                cm.gainItem(item.id, item.qty);
            } else {
                cm.gainMeso(price); // Refund if inventory full
                cm.sendOk("Your inventory is full! Purchase refunded.");
                cm.dispose();
                return;
            }
        }

        // Check if mystery pack failed (inventory full)
        if (item.type && mysteryResult === null) {
            cm.gainMeso(price); // Refund
            cm.sendOk("Your inventory is full! Purchase refunded.");
            cm.dispose();
            return;
        }

        incrementDailyPurchases();

        var remaining = DAILY_PURCHASE_LIMIT - getDailyPurchases();
        var resultText = "#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n" +
            "#ePurchase complete!#n\r\n\r\n";

        if (mysteryResult !== null) {
            resultText += "You opened the #b" + item.name + "#k and found:\r\n";
            resultText += "#e" + mysteryResult + "#n\r\n\r\n";
        } else {
            resultText += "Enjoy your #b" + item.name + "#k!\r\n\r\n";
        }

        resultText += "Purchases remaining today: #b" + remaining + "#k";
        cm.sendOk(resultText);
        cm.dispose();

    } else {
        cm.dispose();
    }
}

function getDayOfWeek() {
    var cal = java.util.Calendar.getInstance();
    return cal.get(java.util.Calendar.DAY_OF_WEEK) - 1; // 0=Sun, 1=Mon, ..., 6=Sat
}

function getDayTheme(day) {
    var themes = ["Bargain Day (50% off!)", "Scroll Day", "Potion Day", "Equipment Day", "Gamble Day", "Treasure Day", "Chaos Day"];
    return themes[day];
}

function getGreetingByDay(day) {
    var greetings = [
        "Hah! Sunday — my rest day... or IS it? Everything's half price today! A bargain hunter's dream!",
        "Monday already? I've brought my finest scrolls from the dimensional markets. Take a look!",
        "Tuesday — potion day! I've distilled these from rare herbs found between worlds.",
        "Wednesday brings equipment! I found these accessories in a collapsed dimension. Each one is unique.",
        "Ah, Thursday... feeling lucky? My mystery packs contain surprises from across all worlds!",
        "Friday treasure! I've been mining ores in the Dimensional Rift. Pure quality materials.",
        "Saturday — I saved my rarest merchandise for today. Chaos Scrolls, White Scrolls... the good stuff."
    ];
    return greetings[day];
}

function getStockForDay(dayOfWeek) {
    if (dayOfWeek === 0) {
        // Sunday bargain: pick a day based on week of year
        var cal = java.util.Calendar.getInstance();
        var weekOfYear = cal.get(java.util.Calendar.WEEK_OF_YEAR);
        var bargainDay = (weekOfYear % 6) + 1; // 1-6 (Mon-Sat)
        return allStocks[bargainDay];
    }
    return allStocks[dayOfWeek];
}

function giveMysteryBronze() {
    // Bronze: common items — returns description string (no sendNext, caller handles display)
    var pool = [
        { id: 2000005, qty: 20, name: "Power Elixirs" },
        { id: 2000006, qty: 30, name: "Mana Elixirs" },
        { id: 4010000, qty: 50, name: "Mineral Ore" },
        { id: 2022000, qty: 30, name: "Pure Water" },
        { id: 2001001, qty: 20, name: "Wizard Elixir" }
    ];
    var pick = pool[Math.floor(Math.random() * pool.length)];
    if (cm.canHold(pick.id)) {
        cm.gainItem(pick.id, pick.qty);
        return pick.qty + "x " + pick.name;
    }
    return null;
}

function giveMysterySilver() {
    // Silver: uncommon items — returns description string
    var pool = [
        { id: 2022179, qty: 5, name: "Onyx Apple" },
        { id: 2049003, qty: 2, name: "Clean Slate Scroll 10%" },
        { id: 2340000, qty: 1, name: "White Scroll" },
        { id: 2000005, qty: 100, name: "Power Elixirs" },
        { id: 4010004, qty: 30, name: "Gold Ore" }
    ];
    var pick = pool[Math.floor(Math.random() * pool.length)];
    if (cm.canHold(pick.id)) {
        cm.gainItem(pick.id, pick.qty);
        return pick.qty + "x " + pick.name;
    }
    return null;
}

function giveMysteryGold() {
    // Gold: rare items with small chance of jackpot — returns description string
    var roll = Math.random();
    var pick;
    var jackpot = false;
    if (roll < 0.10) {
        pick = { id: 2049100, qty: 2, name: "Chaos Scroll 60%" };
        jackpot = true;
    } else if (roll < 0.30) {
        pick = { id: 2340000, qty: 2, name: "White Scroll" };
    } else if (roll < 0.50) {
        pick = { id: 2049003, qty: 5, name: "Clean Slate Scroll 10%" };
    } else if (roll < 0.75) {
        pick = { id: 2022179, qty: 10, name: "Onyx Apple" };
    } else {
        pick = { id: 2000005, qty: 200, name: "Power Elixirs" };
    }

    if (cm.canHold(pick.id)) {
        cm.gainItem(pick.id, pick.qty);
        if (jackpot) {
            return "#r[JACKPOT!]#k " + pick.qty + "x " + pick.name + "!!!";
        }
        return pick.qty + "x " + pick.name;
    }
    return null;
}

function getDailyPurchases() {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        var data = rec.getCustomData();
        if (data === null || data === "") return 0;
        var parts = data.split(":");
        if (parts.length < 2) return 0;
        var today = getDateString();
        if (parts[0] !== today) return 0;
        return parseInt(parts[1]);
    } catch(e) {
        return 0;
    }
}

function incrementDailyPurchases() {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        var today = getDateString();
        var purchases = getDailyPurchases() + 1;
        rec.setCustomData(today + ":" + purchases);
    } catch(e) {}
}

function getDateString() {
    var cal = java.util.Calendar.getInstance();
    var y = cal.get(java.util.Calendar.YEAR);
    var m = cal.get(java.util.Calendar.MONTH) + 1;
    var d = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + y + (m < 10 ? "0" : "") + m + (d < 10 ? "0" : "") + d;
}

function formatMeso(amount) {
    var s = "" + amount;
    var result = "";
    var count = 0;
    for (var i = s.length - 1; i >= 0; i--) {
        result = s.charAt(i) + result;
        count++;
        if (count % 3 === 0 && i > 0) {
            result = "," + result;
        }
    }
    return result;
}
