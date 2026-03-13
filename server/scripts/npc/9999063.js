/**
 * NPC: Brother Marcus (9999063)
 * Location: Henesys (100000000)
 * Type: Buff Service NPC — provides temporary stat buffs for meso
 *
 * A wandering monk who offers blessings (buffs) in exchange for donations.
 * Great meso sink for solo players who lack party support.
 *
 * Services:
 *   1. Individual Blessings — single stat buff (5K each)
 *   2. Warrior's Onyx Blessing — massive ATK/MATK buff (80K)
 *   3. Full Benediction — all 4 stat buffs at once (15K, 25% discount vs individual)
 *   4. Monster Rider — speed/jump boost (10K)
 *
 * Buff items used:
 *   2022000 = Warrior Pill (+STR)
 *   2022001 = Sniper Pill (+DEX)
 *   2022002 = Wizard Pill (+INT)
 *   2022003 = Lucky Pill (+LUK)
 *   2022179 = Onyx Apple (+100 ATK/MATK)
 *   2002024 = Pure Water (clears debuffs)
 *
 * Daily limit: 5 buff purchases per day (tracked via quest 99207 customData)
 */

var status = -1;
var sel = -1;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1) {
        cm.dispose();
        return;
    }
    if (mode === 0 && status <= 0) {
        cm.dispose();
        return;
    }
    if (mode === 0) {
        status--;
    } else {
        status++;
    }

    if (status === 0) {
        var uses = getDailyUses();
        var remaining = 5 - uses;
        var usesText;
        if (remaining <= 0) {
            usesText = "#r(Daily limit reached — return tomorrow)#k";
        } else {
            usesText = "#g(" + remaining + " blessings remaining today)#k";
        }

        cm.sendSimple("#e#kBrother Marcus#n\r\n\r\n" +
            "Peace be upon you, traveler. I am Brother Marcus of the Wandering Order. " +
            "We monks channel the ancient energies of Maple World to grant blessings to those in need.\r\n\r\n" +
            "For a modest donation, I can bestow upon you the power of the elements.\r\n\r\n" +
            usesText + "\r\n\r\n" +
            "#b#L0#Blessing of Strength (STR +15, 30 min) — 5,000 meso#l\r\n" +
            "#L1#Blessing of Precision (DEX +15, 30 min) — 5,000 meso#l\r\n" +
            "#L2#Blessing of Wisdom (INT +15, 30 min) — 5,000 meso#l\r\n" +
            "#L3#Blessing of Fortune (LUK +15, 30 min) — 5,000 meso#l\r\n" +
            "#L4#Full Benediction (ALL stats +15, 30 min) — 15,000 meso#l\r\n" +
            "#L5#Onyx Blessing (ATK/MATK +100, 10 min) — 80,000 meso#l\r\n" +
            "#L6#Purification (Remove debuffs) — 3,000 meso#l\r\n" +
            "#L7#About the Wandering Order#l#k");

    } else if (status === 1) {
        sel = selection;

        // Lore option
        if (sel === 7) {
            cm.sendOk("#e#kBrother Marcus#n\r\n\r\n" +
                "The Wandering Order was founded centuries ago by monks who believed " +
                "that true spiritual power should serve all people, not just the wealthy.\r\n\r\n" +
                "We travel between towns, offering our blessings to adventurers " +
                "who face the dangers of the Maple World. Our donations go toward " +
                "maintaining shrines and feeding the hungry.\r\n\r\n" +
                "The blessings we grant are real — channeled from the very essence " +
                "of the World Tree. They are temporary, as all things are, but " +
                "powerful enough to turn the tide of battle.\r\n\r\n" +
                "#eWe limit our blessings to 5 per day per person, as the energies " +
                "need time to replenish.#n");
            cm.dispose();
            return;
        }

        // Check daily limit
        var uses = getDailyUses();
        if (uses >= 5) {
            cm.sendOk("#e#kBrother Marcus#n\r\n\r\n" +
                "I'm sorry, traveler. The blessing energies have been depleted for today. " +
                "The World Tree needs time to replenish its gifts.\r\n\r\n" +
                "#bReturn tomorrow for more blessings.#k");
            cm.dispose();
            return;
        }

        // Define buff options
        var buffData = [
            { itemId: 2022000, cost: 5000,  name: "Blessing of Strength", desc: "STR +15 for 30 minutes" },
            { itemId: 2022001, cost: 5000,  name: "Blessing of Precision", desc: "DEX +15 for 30 minutes" },
            { itemId: 2022002, cost: 5000,  name: "Blessing of Wisdom", desc: "INT +15 for 30 minutes" },
            { itemId: 2022003, cost: 5000,  name: "Blessing of Fortune", desc: "LUK +15 for 30 minutes" },
            { itemId: -1,      cost: 15000, name: "Full Benediction", desc: "ALL stats +15 for 30 minutes" },
            { itemId: 2022179, cost: 80000, name: "Onyx Blessing", desc: "ATK/MATK +100 for 10 minutes" },
            { itemId: 2002024, cost: 3000,  name: "Purification", desc: "Removes all debuffs" }
        ];

        var buff = buffData[sel];

        // Check meso
        if (cm.getMeso() < buff.cost) {
            cm.sendOk("#e#kBrother Marcus#n\r\n\r\n" +
                "You don't have enough mesos for this blessing, traveler.\r\n\r\n" +
                "The #b" + buff.name + "#k requires a donation of #r" + formatMeso(buff.cost) + " mesos#k.\r\n" +
                "You have: #r" + formatMeso(cm.getMeso()) + " mesos#k.\r\n\r\n" +
                "Return when your purse is fuller. The blessings will wait.");
            cm.dispose();
            return;
        }

        // Confirm
        cm.sendYesNo("#e#kBrother Marcus#n\r\n\r\n" +
            "You seek the #b" + buff.name + "#k.\r\n\r\n" +
            "#e" + buff.desc + "#n\r\n" +
            "Donation: #r" + formatMeso(buff.cost) + " mesos#k\r\n\r\n" +
            "Shall I channel the blessing?");

    } else if (status === 2) {
        // Apply the buff
        var buffData = [
            { itemId: 2022000, cost: 5000,  name: "Blessing of Strength" },
            { itemId: 2022001, cost: 5000,  name: "Blessing of Precision" },
            { itemId: 2022002, cost: 5000,  name: "Blessing of Wisdom" },
            { itemId: 2022003, cost: 5000,  name: "Blessing of Fortune" },
            { itemId: -1,      cost: 15000, name: "Full Benediction" },
            { itemId: 2022179, cost: 80000, name: "Onyx Blessing" },
            { itemId: 2002024, cost: 3000,  name: "Purification" }
        ];

        var buff = buffData[sel];

        // Deduct meso
        cm.gainMeso(-buff.cost);

        // Apply buff(s)
        if (sel === 4) {
            // Full Benediction — all 4 stat pills
            cm.useItem(2022000);
            cm.useItem(2022001);
            cm.useItem(2022002);
            cm.useItem(2022003);
        } else {
            cm.useItem(buff.itemId);
        }

        // Track usage
        incrementDailyUses();

        var remaining = 5 - getDailyUses();

        cm.sendOk("#e#kBrother Marcus#n closes his eyes and raises his hands...\r\n\r\n" +
            "A warm golden light envelops you!\r\n\r\n" +
            "#fUI/UIWindow.img/QuestIcon/4/0#\r\n" +
            "#b" + buff.name + "#k has been bestowed upon you!\r\n\r\n" +
            "#eBlessings remaining today: " + remaining + "#n\r\n\r\n" +
            "May the World Tree's power guide you, adventurer.");
        cm.dispose();
    } else {
        cm.dispose();
    }
}

function getDailyUses() {
    try {
        var rec = cm.getQuestRecord(99207);
        var data = rec.getCustomData();
        if (data === null || data === "") return 0;
        // Format: "YYYYMMDD:count"
        var parts = data.split(":");
        if (parts.length < 2) return 0;
        var today = getDateString();
        if (parts[0] !== today) return 0;
        return parseInt(parts[1]);
    } catch(e) {
        return 0;
    }
}

function incrementDailyUses() {
    try {
        var rec = cm.getQuestRecord(99207);
        var today = getDateString();
        var uses = getDailyUses() + 1;
        rec.setCustomData(today + ":" + uses);
    } catch(e) {}
}

function getDateString() {
    var cal = java.util.Calendar.getInstance();
    var year = cal.get(java.util.Calendar.YEAR);
    var month = cal.get(java.util.Calendar.MONTH) + 1;
    var day = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day;
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
