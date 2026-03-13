/**
 * Magnus the Wandering Merchant (NPC ID: 9999043)
 * Cosmic Private Server — Custom Content
 *
 * A mysterious traveling merchant whose wares change every week.
 * Players get one purchase opportunity per week per category.
 * Located in Henesys (100000000) — "visits" each week.
 *
 * Stock rotates by ISO week number (mod 4):
 *   Week 0: Arcane Arsenal — rare attack scrolls + powerful consumables
 *   Week 1: Scholar's Cache — stat/defense scrolls + magic items
 *   Week 2: Adventurer's Pack — equip cards, boss accessories, utility items
 *   Week 3: Mystic Emporium — cosmetics, rare upgrade materials, special drops
 *
 * Purchase limit: 3 items per category per week (tracked via quest progress).
 * Prices are high — this is a meso sink AND a reward for active players.
 */

/* global cm, java */

var status = -1;
var selectedCategory = -1;
var selectedItem = -1;

// ── Week helpers ──────────────────────────────────────────────────────────────

function getISOWeek(date) {
    var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekSlot() {
    return getISOWeek(new Date()) % 4;
}

function getWeekStamp() {
    return Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
}

// ── Stock definitions (4 rotating weeks) ─────────────────────────────────────
// Format: { id, name, price, limit } — limit = max purchases per player per week

var STOCK = [
    // Week 0: Arcane Arsenal
    [
        { id: 2040004, name: "Scroll for Weapon ATT 60%",  price: 500000,  limit: 2 },
        { id: 2040006, name: "Scroll for Weapon ATT 10%",  price: 1500000, limit: 1 },
        { id: 2002038, name: "Power Elixir (x10 bundle)",  price: 80000,   limit: 5 },
        { id: 2002031, name: "Elixir of Rage",             price: 30000,   limit: 10 },
        { id: 2002032, name: "Elixir of Wisdom",           price: 30000,   limit: 10 },
        { id: 1302134, name: "Earth Cleaver (Lv 50 sword)", price: 600000, limit: 1 }
    ],
    // Week 1: Scholar's Cache
    [
        { id: 2040501, name: "Scroll for Overall DEF 60%", price: 300000,  limit: 2 },
        { id: 2040100, name: "Scroll for Hat for INT 60%", price: 350000,  limit: 2 },
        { id: 2002033, name: "Scroll of Shields",          price: 120000,  limit: 3 },
        { id: 2002034, name: "Mystic Elixir",              price: 50000,   limit: 8 },
        { id: 2002035, name: "Lucky Clover",               price: 20000,   limit: 15 },
        { id: 1442104, name: "Phoenix Staff (Lv 55 staff)", price: 650000, limit: 1 }
    ],
    // Week 2: Adventurer's Pack
    [
        { id: 2040200, name: "Scroll for Earring for INT 60%", price: 400000, limit: 2 },
        { id: 2040700, name: "Scroll for Shoes for Jump 60%",  price: 250000, limit: 2 },
        { id: 2002036, name: "Tome of Experience",          price: 250000,  limit: 2 },
        { id: 2002037, name: "Cosmic Blessing Potion",      price: 400000,  limit: 1 },
        { id: 2030021, name: "Magnus's Special Scroll",     price: 800000,  limit: 1 },
        { id: 1452086, name: "Wind Piercer (Lv 50 bow)",    price: 600000,  limit: 1 }
    ],
    // Week 3: Mystic Emporium
    [
        { id: 2040300, name: "Scroll for Glove for ATT 60%", price: 600000, limit: 2 },
        { id: 2040800, name: "Scroll for Cape for INT 60%",  price: 350000, limit: 2 },
        { id: 2002031, name: "Elixir of Rage",               price: 25000,  limit: 12 },
        { id: 2002034, name: "Mystic Elixir",                price: 45000,  limit: 8 },
        { id: 1472101, name: "Thunder Barrel (Lv 55 gun)",   price: 620000, limit: 1 },
        { id: 1482047, name: "Iron Fist (Lv 50 knuckle)",    price: 580000, limit: 1 }
    ]
];

// ── Purchase limit tracking (via character notes / quest flags) ───────────────
// We encode week+item purchases into a MapleQuest progress field (quest 99099).
// Format: "weekStamp:itemIdx:count,itemIdx:count,..."
// If weekStamp doesn't match current, reset.

var LIMIT_QUEST_ID = 99099;

function getLimitKey() { return "merchant_" + getWeekStamp(); }

function getPurchaseCount(itemIdx) {
    try {
        var progress = cm.getQuestProgress(LIMIT_QUEST_ID, itemIdx);
        if (!progress || progress === "") return 0;
        var parts = progress.split(":");
        if (parts.length < 2 || parseInt(parts[0]) !== getWeekStamp()) return 0;
        return parseInt(parts[1]) || 0;
    } catch (e) {
        return 0;
    }
}

function recordPurchase(itemIdx) {
    var current = getPurchaseCount(itemIdx);
    cm.setQuestProgress(LIMIT_QUEST_ID, itemIdx, getWeekStamp() + ":" + (current + 1));
}

// ── Week flavor text ──────────────────────────────────────────────────────────

var WEEK_INTROS = [
    "Ahh, a fellow warrior of fortune! This week I've come bearing the finest combat wares — scrolls to sharpen blades and potions to fuel the fighting spirit. These don't come cheap, but cheap things don't win battles, eh?",
    "Welcome, welcome! The scholars of the Eastern Continent paid handsomely for my silence, but I'll share their secrets with you — stat-boosting scrolls and arcane components that the academies hoard for themselves.",
    "You look like someone who lives for adventure! Perfect timing — I've just returned from the Southern Jungles with equipment and essentials that no seasoned explorer should be without. Pick wisely — I won't be back until next week!",
    "Ah, you've found me at last! The Mystic Emporium is open for business — rare upgrade materials and weapons that even I struggle to acquire. These items chose ME to sell them... and now they wait to choose their true owner."
];

// ── Main dialogue flow ────────────────────────────────────────────────────────

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1 || (mode === 0 && status === 0)) {
        cm.dispose();
        return;
    }

    status++;

    if (status === 0) {
        // Greeting
        var slot = getWeekSlot();
        var weekNames = ["Arcane Arsenal", "Scholar's Cache", "Adventurer's Pack", "Mystic Emporium"];
        cm.sendSimple(
            "#b[Magnus the Wandering Merchant]#k\r\n\r\n" +
            WEEK_INTROS[slot] + "\r\n\r\n" +
            "#rThis week: " + weekNames[slot] + "#k\r\n\r\n" +
            "What brings you to my humble cart?\r\n" +
            "#L0# Browse this week's wares#l\r\n" +
            "#L1# Where did you come from?#l\r\n" +
            "#L2# I'll be on my way.#l"
        );
    } else if (status === 1) {
        if (selection === 2) {
            cm.sendOk("Safe travels, friend. I'll be at a different corner of Victoria Island next week — keep your eyes open!");
            cm.dispose();
            return;
        }
        if (selection === 1) {
            cm.sendNext(
                "Ha! That's a long story. I've traded in Ossyria, survived the Ludus Lake merchants' guild (nasty bunch, those), " +
                "haggled in Leafre with dragon-riders, and once sold a scroll to a Black Mage general for a small fortune.\r\n\r\n" +
                "Now I make the rounds on Victoria Island. Fresh clientele, hungry adventurers, and nobody's tried to rob me... yet."
            );
            status = 99; // End lore branch
            return;
        }
        // Browse wares
        var slot = getWeekSlot();
        var items = STOCK[slot];
        var menu = "#b[This Week's Stock — " + items.length + " items available]#k\r\n\r\n";
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var bought = getPurchaseCount(i);
            var remaining = item.limit - bought;
            var limitStr = remaining > 0 ? "(#d" + remaining + " left this week#k)" : "(#rSold out for you this week#k)";
            menu += "#L" + i + "# " + item.name + " — #r" + item.price.toLocaleString() + " meso#k " + limitStr + "#l\r\n";
        }
        menu += "#L99# Actually, never mind.#l";
        cm.sendSimple(menu);
        status = 1; // Stay at item list until selection
    } else if (status === 2) {
        if (selection === 99) {
            cm.sendOk("Come back any time, friend. The wares will be here!");
            cm.dispose();
            return;
        }

        var slot = getWeekSlot();
        var items = STOCK[slot];
        if (selection < 0 || selection >= items.length) {
            cm.sendOk("Hmm, that's not something I have. Try again?");
            cm.dispose();
            return;
        }

        selectedItem = selection;
        var item = items[selectedItem];
        var bought = getPurchaseCount(selectedItem);
        var remaining = item.limit - bought;

        if (remaining <= 0) {
            cm.sendOk(
                "I'm sorry, friend — you've already bought as many of those as I'll sell to one person this week. " +
                "Even Magnus has his limits! Come back next week when my stock resets."
            );
            cm.dispose();
            return;
        }

        var playerMeso = cm.getMeso();
        if (playerMeso < item.price) {
            cm.sendOk(
                "Ah... " + item.price.toLocaleString() + " meso is the price, and I'm afraid I can't go lower. " +
                "You're " + (item.price - playerMeso).toLocaleString() + " meso short. " +
                "Come back when your coin purse is heavier!"
            );
            cm.dispose();
            return;
        }

        cm.sendYesNo(
            "Excellent choice! #b" + item.name + "#k for #r" + item.price.toLocaleString() + " meso#k.\r\n\r\n" +
            "You can buy up to #r" + remaining + " more#k of these this week.\r\n\r\n" +
            "Shall I wrap it up for you?"
        );
    } else if (status === 3) {
        if (mode === 0) {
            cm.sendOk("No worries! The deal stands until I pack up and move on. Browse again if you change your mind.");
            cm.dispose();
            return;
        }

        var slot = getWeekSlot();
        var item = STOCK[slot][selectedItem];
        var bought = getPurchaseCount(selectedItem);

        if (cm.getMeso() < item.price) {
            cm.sendOk("You don't have enough meso! Come back when you do.");
            cm.dispose();
            return;
        }

        if (bought >= item.limit) {
            cm.sendOk("Looks like you've already hit your weekly limit on that one. No tricks — Magnus has a good memory!");
            cm.dispose();
            return;
        }

        if (!cm.canHold(item.id)) {
            cm.sendOk("Your inventory is full! Make some space and come back.");
            cm.dispose();
            return;
        }

        cm.gainMeso(-item.price);
        cm.gainItem(item.id, 1);
        recordPurchase(selectedItem);

        var remaining = item.limit - bought - 1;
        var followup = remaining > 0
            ? " You can still buy #r" + remaining + " more#k this week."
            : " That's your weekly limit on that item — come back next week!";

        cm.sendOk(
            "Pleasure doing business! #b" + item.name + "#k is yours.\r\n\r\n" +
            followup + "\r\n\r\nMay fortune favor your adventures, friend!"
        );
        cm.dispose();
    } else if (status === 100) {
        // End of lore branch
        cm.dispose();
    } else {
        cm.dispose();
    }
}
