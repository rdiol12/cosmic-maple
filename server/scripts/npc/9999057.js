/**
 * 9999057.js — Mystic Zara (Fortune Teller)
 * Location: Henesys (100000000)
 *
 * Features:
 *   1. Daily Fortune Reading — gives a random buff (STR/DEX/INT/LUK +15) for 30 min.
 *      Uses quest 99201 customData to track last reading date (YYYYMMDD).
 *   2. Cosmic Gamble — pay mesos for a chance at rare items (meso sink).
 *      Three tiers: 10K (common), 50K (uncommon), 200K (rare).
 *   3. Mystical Lore — flavor text about the Maple World.
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
    if (mode === 0 && status > 0) {
        cm.dispose();
        return;
    }

    status++;

    if (status === 0) {
        var menu = "#b#L0# Read my fortune today#l\r\n";
        menu += "#L1# Try the Cosmic Gamble#l\r\n";
        menu += "#L2# Tell me about the stars#l\r\n";
        menu += "#L3# Farewell#l#k";
        cm.sendSimple("Ahh... a visitor. I am #bMystic Zara#k, reader of fates and keeper of cosmic secrets.\r\n\r\n" +
            "The stars whisper many things about you, traveler. What do you seek?\r\n\r\n" + menu);

    } else if (status === 1) {
        sel = selection;

        if (sel === 0) {
            // Daily Fortune Reading
            var rec = cm.getQuestRecord(99201);
            var today = getDateString();
            var lastReading = rec.getCustomData();

            if (lastReading !== null && lastReading === today) {
                cm.sendOk("#bMystic Zara#k: The stars have already spoken to you today, dear. Their voices grow faint with repetition.\r\n\r\nReturn tomorrow for a new reading.");
                cm.dispose();
                return;
            }

            // Give random fortune + buff
            var fortunes = [
                { stat: "STR", buff: "Warrior's Fortune", text: "I see great #bstrength#k in your future! Mountains will crumble before you." },
                { stat: "DEX", buff: "Ranger's Fortune", text: "Your hands will be #bswift and precise#k today! Every arrow finds its mark." },
                { stat: "INT", buff: "Scholar's Fortune", text: "The cosmos grants you #bwisdom#k! Arcane secrets reveal themselves to the enlightened mind." },
                { stat: "LUK", buff: "Trickster's Fortune", text: "Lady Luck smiles upon you! #bFortune favors the bold#k today." }
            ];

            var pick = Math.floor(Math.random() * fortunes.length);
            var fortune = fortunes[pick];

            // Apply stat buff via useItem (simulates consuming the potion)
            // 2022000=Warrior Pill(STR), 2022001=Sniper Pill(DEX), 2022002=Wizard Pill(INT), 2022003=Luck Pill(LUK)
            if (fortune.stat === "STR") {
                cm.useItem(2022000);
            } else if (fortune.stat === "DEX") {
                cm.useItem(2022001);
            } else if (fortune.stat === "INT") {
                cm.useItem(2022002);
            } else {
                cm.useItem(2022003);
            }

            // Mark today as read
            rec.setCustomData(today);

            cm.sendOk("#bMystic Zara#k gazes into her crystal orb...\r\n\r\n" +
                "\"" + fortune.text + "\"\r\n\r\n" +
                "#fUI/UIWindow.img/QuestIcon/4/0#\r\n" +
                "Received: #b" + fortune.buff + "#k (+15 " + fortune.stat + " for 30 min)\r\n\r\n" +
                "#eToday's Lucky Number: " + (Math.floor(Math.random() * 99) + 1) + "#n");
            cm.dispose();

        } else if (sel === 1) {
            // Cosmic Gamble menu
            var gambleMenu = "#b#L0# Small Gamble (10,000 mesos)#l\r\n";
            gambleMenu += "#L1# Medium Gamble (50,000 mesos)#l\r\n";
            gambleMenu += "#L2# Grand Gamble (200,000 mesos)#l\r\n";
            gambleMenu += "#L3# Never mind#l#k";
            cm.sendSimple("#bMystic Zara#k: The Cosmic Gamble! Place your bet and let fate decide your reward.\r\n\r\n" +
                "Higher stakes bring rarer prizes... but the cosmos is fickle.\r\n\r\n" + gambleMenu);

        } else if (sel === 2) {
            // Mystical Lore
            var loreTexts = [
                "The Maple World was born from six primordial crystals — each one containing an entire dimension. When they shattered, the fragments became the islands we walk upon today.",
                "Long ago, the Black Mage sealed himself away in a cocoon of dark energy. Some say he still dreams, and his nightmares seep into our reality as the monsters we fight.",
                "The stars above Maple World are not mere lights — they are the eyes of ancient beings, watching over every adventurer. On clear nights, you can hear them whispering.",
                "Deep beneath Ludibrium lies a clockwork heart that keeps time flowing forward. If it ever stops, they say all of Maple World would freeze in an eternal moment.",
                "The mushrooms of Henesys are not ordinary fungi. They are the offspring of an ancient Forest Spirit. That's why they have faces — each one carries a tiny spark of consciousness."
            ];
            var lorePick = Math.floor(Math.random() * loreTexts.length);
            cm.sendOk("#bMystic Zara#k leans forward, her eyes gleaming...\r\n\r\n\"" + loreTexts[lorePick] + "\"\r\n\r\n#e...The stars hold many more secrets. Visit me again sometime.#n");
            cm.dispose();

        } else {
            cm.sendOk("#bMystic Zara#k: The stars will be here when you return, traveler. May fortune guide your path.");
            cm.dispose();
        }

    } else if (status === 2) {
        // Cosmic Gamble — process bet
        if (sel !== 1) {
            cm.dispose();
            return;
        }

        var tier = selection;
        if (tier === 3) {
            cm.sendOk("Perhaps another time. The cosmos understands caution.");
            cm.dispose();
            return;
        }

        var cost, rewards;
        if (tier === 0) {
            // Small Gamble: 10K mesos
            cost = 10000;
            rewards = [
                { id: 2000000, qty: 20, name: "Red Potion", weight: 30 },        // common
                { id: 2000003, qty: 15, name: "Blue Potion", weight: 25 },        // common
                { id: 2002037, qty: 3,  name: "Experience Capsule", weight: 20 }, // uncommon
                { id: 2002031, qty: 3,  name: "Warrior's Feast", weight: 15 },    // uncommon
                { id: 2030021, qty: 2,  name: "Cosmic Return Scroll", weight: 10 } // rare-ish
            ];
        } else if (tier === 1) {
            // Medium Gamble: 50K mesos
            cost = 50000;
            rewards = [
                { id: 2002036, qty: 5,  name: "Universal Tonic", weight: 30 },
                { id: 2002037, qty: 10, name: "Experience Capsule", weight: 25 },
                { id: 2049100, qty: 1,  name: "Chaos Scroll 60%", weight: 15 },
                { id: 2040801, qty: 2,  name: "Gloves for ATT 60%", weight: 15 },
                { id: 4031138, qty: 1,  name: "Mystic Crystal", weight: 10 },
                { id: 0, qty: 100000, name: "100,000 Mesos!", weight: 5 }  // jackpot: double your money
            ];
        } else {
            // Grand Gamble: 200K mesos
            cost = 200000;
            rewards = [
                { id: 2049100, qty: 3,  name: "Chaos Scroll 60%", weight: 25 },
                { id: 2002036, qty: 15, name: "Universal Tonic", weight: 20 },
                { id: 2340000, qty: 1,  name: "White Scroll", weight: 10 },
                { id: 2040801, qty: 5,  name: "Gloves for ATT 60%", weight: 15 },
                { id: 2002037, qty: 20, name: "Experience Capsule", weight: 15 },
                { id: 0, qty: 500000, name: "500,000 Mesos!", weight: 10 }, // jackpot
                { id: -1, qty: 0, name: "Nothing... the cosmos laughs.", weight: 5 } // unlucky
            ];
        }

        if (cm.getMeso() < cost) {
            cm.sendOk("#bMystic Zara#k: The stars require a tribute of #b" + cost + " mesos#k... but your pockets are light. Return when you've gathered enough.");
            cm.dispose();
            return;
        }

        // Weighted random selection
        var totalWeight = 0;
        for (var i = 0; i < rewards.length; i++) {
            totalWeight += rewards[i].weight;
        }
        var roll = Math.floor(Math.random() * totalWeight);
        var cumulative = 0;
        var prize = rewards[0];
        for (var i = 0; i < rewards.length; i++) {
            cumulative += rewards[i].weight;
            if (roll < cumulative) {
                prize = rewards[i];
                break;
            }
        }

        // Check inventory space for actual prize (skip for meso/nothing prizes)
        if (prize.id > 0 && !cm.canHold(prize.id, prize.qty)) {
            cm.sendOk("#bMystic Zara#k: Your inventory is full! Make room before gambling with fate.");
            cm.dispose();
            return;
        }

        // Deduct cost
        cm.gainMeso(-cost);

        // Give reward
        var resultText;
        if (prize.id === -1) {
            // Nothing
            resultText = "#bMystic Zara#k: The orb goes dark... \"" + prize.name + "\"\r\n\r\nBetter luck next time, adventurer.";
        } else if (prize.id === 0) {
            // Meso jackpot
            cm.gainMeso(prize.qty);
            resultText = "#bMystic Zara#k: The orb EXPLODES with golden light!\r\n\r\n" +
                "#fUI/UIWindow.img/QuestIcon/4/0#\r\n" +
                "JACKPOT! You won #b" + prize.name + "#k!";
        } else {
            cm.gainItem(prize.id, prize.qty);
            resultText = "#bMystic Zara#k: The crystal orb glows and reveals your prize!\r\n\r\n" +
                "#fUI/UIWindow.img/QuestIcon/4/0#\r\n" +
                "#v" + prize.id + "# " + prize.qty + "x #t" + prize.id + "#";
        }

        cm.sendOk(resultText);
        cm.dispose();
    } else {
        cm.dispose();
    }
}

function getDateString() {
    var now = new java.util.Date();
    var cal = java.util.Calendar.getInstance();
    cal.setTime(now);
    var year = cal.get(java.util.Calendar.YEAR);
    var month = cal.get(java.util.Calendar.MONTH) + 1;
    var day = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + year + (month < 10 ? "0" : "") + month + (day < 10 ? "0" : "") + day;
}
