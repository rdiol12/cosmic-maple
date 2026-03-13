/**
 * NPC: Captain Valor (9999070)
 * Location: Henesys (100000000)
 * Type: Daily Challenge — random daily task with scaling rewards
 *
 * Every day, Captain Valor assigns a random challenge from a pool.
 * Challenges range from "kill X mobs" to "collect X items" to "reach map Y".
 * Rewards scale with player level and challenge difficulty.
 *
 * Tracks daily challenge via quest custom data (quest 99214):
 *   Format: "date:challengeIndex:completed"
 *   e.g. "20260310:3:0" = March 10, challenge #3, not yet completed
 *
 * Challenge types:
 *   KILL — slay a specific number of mobs (uses kill count tracking)
 *   COLLECT — bring X of a specific item (consumed on turn-in)
 *   MESO — spend meso as a donation (meso sink)
 *   LEVEL — gain N levels during the day
 *
 * Rewards:
 *   EXP (level-scaled), meso, and occasionally rare items
 *
 * Daily reset at midnight server time.
 */

var status = -1;
var sel = -1;
var QUEST_ID = 99214;
var KILL_TRACK_QUEST = 99215; // Tracks kill progress

// Challenge pool — each has type, description, requirement, and rewards
// Rewards: exp multiplied by player level, meso flat, item optional
var challenges = [
    {
        type: "collect",
        name: "Mushroom Forager",
        desc: "Bring me #b50 Orange Mushroom Caps#k. The healers in town need them for medicine.",
        itemId: 4000019, // Orange Mushroom Cap
        itemQty: 50,
        expBase: 2000,
        mesoReward: 50000,
        minLevel: 10
    },
    {
        type: "collect",
        name: "Ore Collector",
        desc: "I need #b30 Steel Ore#k for our weapon supply. Gather them from mineral veins.",
        itemId: 4010001, // Steel Ore
        itemQty: 30,
        expBase: 3000,
        mesoReward: 80000,
        minLevel: 30
    },
    {
        type: "collect",
        name: "Dragon Scale Hunter",
        desc: "The armorers need #b20 Dragon Skins#k. Hunt dragons in the caves!",
        itemId: 4000030, // Dragon Skin
        itemQty: 20,
        expBase: 8000,
        mesoReward: 200000,
        minLevel: 80
    },
    {
        type: "collect",
        name: "Slime Gel Collector",
        desc: "Collect #b100 Squishy Liquids#k from Slimes. Yes, a hundred. Don't ask why.",
        itemId: 4000012, // Squishy Liquid (dropped by Slime)
        itemQty: 100,
        expBase: 1500,
        mesoReward: 30000,
        minLevel: 1
    },
    {
        type: "collect",
        name: "Ancient Scroll Finder",
        desc: "Find and bring me #b10 Ancient Scrolls#k from the Sleepywood dungeon depths.",
        itemId: 4000021, // Wild Boar Tooth (repurposed as "ancient" drop)
        itemQty: 10,
        expBase: 5000,
        mesoReward: 150000,
        minLevel: 50
    },
    {
        type: "meso",
        name: "Town Fund Donation",
        desc: "The town defense fund is running low. Donate #r500,000 mesos#k to support our guards.",
        mesoCost: 500000,
        expBase: 10000,
        mesoReward: 0,
        bonusItemId: 2000005, // Power Elixir
        bonusItemQty: 50,
        minLevel: 50
    },
    {
        type: "meso",
        name: "Weapon Research Grant",
        desc: "Our blacksmiths need funding for new weapon designs. Contribute #r1,000,000 mesos#k.",
        mesoCost: 1000000,
        expBase: 20000,
        mesoReward: 0,
        bonusItemId: 2049003, // Clean Slate 10%
        bonusItemQty: 1,
        minLevel: 100
    },
    {
        type: "meso",
        name: "Small Charity",
        desc: "A traveler lost everything to bandits. Spare #r100,000 mesos#k for their journey.",
        mesoCost: 100000,
        expBase: 4000,
        mesoReward: 0,
        bonusItemId: 2000005, // Power Elixir
        bonusItemQty: 20,
        minLevel: 20
    },
    {
        type: "collect",
        name: "Cursed Doll Cleanup",
        desc: "The cursed dolls in Ludibrium are spreading dark energy. Collect #b30 Cursed Dolls#k.",
        itemId: 4000031, // Jr. Boogie's Doll (approx)
        itemQty: 30,
        expBase: 6000,
        mesoReward: 120000,
        minLevel: 60
    },
    {
        type: "collect",
        name: "Aqua Road Specimen",
        desc: "Our marine biologists need #b40 Firebomb Flames#k. Dive into Aqua Road!",
        itemId: 4000081, // Firebomb Flame
        itemQty: 40,
        expBase: 7000,
        mesoReward: 180000,
        minLevel: 70
    }
];

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
        var data = parseChallengeData();
        var today = getDateString();
        var playerLevel = cm.getLevel();

        var text = "#e#dCaptain Valor — Daily Challenges#k#n\r\n\r\n";
        text += "Greetings, adventurer! I organize daily missions to keep ";
        text += "our world's defenders sharp and rewarded.\r\n\r\n";

        if (data.date === today && data.completed === 1) {
            // Already completed today's challenge
            text += "#g[Today's Challenge: COMPLETED!]#k\r\n\r\n";
            text += "Excellent work! Come back #btomorrow#k for a new challenge.\r\n\r\n";
            text += "#L2#What are daily challenges?#l";
            cm.sendSimple(text);
            return;
        }

        if (data.date === today && data.completed === 0) {
            // Challenge in progress
            var ch = challenges[data.challengeIndex];
            text += "#e[Active Challenge: " + ch.name + "]#n\r\n";
            text += ch.desc + "\r\n\r\n";
            text += getProgressText(ch) + "\r\n\r\n";
            text += "#b#L0#Turn in challenge#l\r\n";
            text += "#L1#Abandon challenge#l\r\n";
            text += "#L2#What are daily challenges?#l#k";
            cm.sendSimple(text);
            return;
        }

        // No challenge today — assign one
        var challengeIndex = pickChallenge(playerLevel);
        var ch = challenges[challengeIndex];

        // Save the assignment
        saveChallengeData(today, challengeIndex, 0);

        text += "#e[New Challenge Assigned!]#n\r\n\r\n";
        text += "#e" + ch.name + "#n\r\n";
        text += ch.desc + "\r\n\r\n";
        text += "#eRewards:#n\r\n";
        text += getRewardText(ch, playerLevel) + "\r\n\r\n";
        text += "#b#L0#Turn in challenge#l\r\n";
        text += "#L2#What are daily challenges?#l#k";
        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;

        if (sel === 2) {
            // Info
            cm.sendOk(
                "#e#dCaptain Valor — How Daily Challenges Work#k#n\r\n\r\n" +
                "Every day, I assign you a random challenge based on your level.\r\n\r\n" +
                "#eChallenge Types:#n\r\n" +
                "  - #bCollect#k: Gather specific items and bring them to me\r\n" +
                "  - #bDonate#k: Contribute meso to town causes\r\n\r\n" +
                "#eRewards:#n\r\n" +
                "  - EXP (scales with your level)\r\n" +
                "  - Meso\r\n" +
                "  - Sometimes rare items!\r\n\r\n" +
                "#eRules:#n\r\n" +
                "  - One challenge per day\r\n" +
                "  - Resets at midnight\r\n" +
                "  - You can abandon once, but get the same one reassigned\r\n" +
                "  - Higher level = harder challenges with better rewards"
            );
            cm.dispose();
            return;
        }

        if (sel === 1) {
            // Abandon
            cm.sendOk(
                "#e#dCaptain Valor#k#n\r\n\r\n" +
                "Giving up? That's fine — but you'll need to wait until tomorrow " +
                "for a new challenge. The current one stays assigned.\r\n\r\n" +
                "#dCome back when you're ready.#k"
            );
            cm.dispose();
            return;
        }

        // sel === 0: Turn in
        var data = parseChallengeData();
        var today = getDateString();

        if (data.date !== today || data.completed === 1) {
            cm.sendOk("You don't have an active challenge right now.");
            cm.dispose();
            return;
        }

        var ch = challenges[data.challengeIndex];
        var playerLevel = cm.getLevel();

        // Check completion requirements
        if (ch.type === "collect") {
            if (!cm.haveItem(ch.itemId, ch.itemQty)) {
                cm.sendOk(
                    "#e#dCaptain Valor#k#n\r\n\r\n" +
                    "You haven't gathered enough yet!\r\n\r\n" +
                    "#eRequired:#n #v" + ch.itemId + "# x" + ch.itemQty + "\r\n" +
                    "#eCurrent:#n " + cm.getItemQuantity(ch.itemId) + "/" + ch.itemQty + "\r\n\r\n" +
                    "Keep collecting!"
                );
                cm.dispose();
                return;
            }

            // Take items
            cm.gainItem(ch.itemId, -ch.itemQty);

        } else if (ch.type === "meso") {
            if (cm.getMeso() < ch.mesoCost) {
                cm.sendOk(
                    "#e#dCaptain Valor#k#n\r\n\r\n" +
                    "You don't have enough meso for this donation.\r\n\r\n" +
                    "#eRequired:#n " + formatMeso(ch.mesoCost) + " meso\r\n" +
                    "#eCurrent:#n " + formatMeso(cm.getMeso()) + " meso"
                );
                cm.dispose();
                return;
            }

            // Take meso
            cm.gainMeso(-ch.mesoCost);
        }

        // Grant rewards
        var expReward = ch.expBase * Math.max(1, Math.floor(playerLevel / 10));
        cm.gainExp(expReward);

        if (ch.mesoReward > 0) {
            cm.gainMeso(ch.mesoReward);
        }

        if (ch.bonusItemId && ch.bonusItemQty) {
            if (cm.canHold(ch.bonusItemId)) {
                cm.gainItem(ch.bonusItemId, ch.bonusItemQty);
            }
        }

        // Mark completed
        saveChallengeData(today, data.challengeIndex, 1);

        // Announce
        cm.playerMessage(6, "[Daily Challenge] " + cm.getPlayer().getName() + " completed: " + ch.name + "!");

        var text = "#e#dCaptain Valor#k#n\r\n\r\n";
        text += "#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n";
        text += "#e=== CHALLENGE COMPLETE ===#n\r\n\r\n";
        text += "#g" + ch.name + "#k\r\n\r\n";
        text += "#eRewards Earned:#n\r\n";
        text += "  EXP: #b+" + formatMeso(expReward) + "#k\r\n";
        if (ch.mesoReward > 0) {
            text += "  Meso: #b+" + formatMeso(ch.mesoReward) + "#k\r\n";
        }
        if (ch.bonusItemId && ch.bonusItemQty) {
            text += "  Item: #v" + ch.bonusItemId + "# x" + ch.bonusItemQty + "\r\n";
        }
        text += "\r\nCome back tomorrow for a new challenge!";
        cm.sendOk(text);
        cm.dispose();

    } else {
        cm.dispose();
    }
}

function pickChallenge(playerLevel) {
    // Filter challenges appropriate for player level, then pick based on day seed
    var eligible = [];
    for (var i = 0; i < challenges.length; i++) {
        if (playerLevel >= challenges[i].minLevel) {
            eligible.push(i);
        }
    }
    if (eligible.length === 0) eligible.push(0); // fallback

    // Use date-based seed for deterministic daily selection per character
    var dateNum = parseInt(getDateString());
    var charId = cm.getPlayer().getId();
    var seed = (dateNum * 31 + charId * 17) % eligible.length;
    return eligible[seed];
}

function getProgressText(ch) {
    if (ch.type === "collect") {
        var have = cm.getItemQuantity(ch.itemId);
        var pct = Math.min(100, Math.floor((have / ch.itemQty) * 100));
        return "#eProgress:#n #v" + ch.itemId + "# " + have + "/" + ch.itemQty + " (" + pct + "%)";
    } else if (ch.type === "meso") {
        var have = cm.getMeso();
        var enough = have >= ch.mesoCost;
        return "#eRequired:#n " + formatMeso(ch.mesoCost) + " meso " + (enough ? "#g[READY]#k" : "#r[Need more]#k");
    }
    return "";
}

function getRewardText(ch, playerLevel) {
    var expReward = ch.expBase * Math.max(1, Math.floor(playerLevel / 10));
    var text = "  EXP: #b+" + formatMeso(expReward) + "#k\r\n";
    if (ch.mesoReward > 0) {
        text += "  Meso: #b+" + formatMeso(ch.mesoReward) + "#k\r\n";
    }
    if (ch.bonusItemId && ch.bonusItemQty) {
        text += "  Bonus: #v" + ch.bonusItemId + "# x" + ch.bonusItemQty;
    }
    return text;
}

function parseChallengeData() {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        var raw = rec.getCustomData();
        if (raw === null || raw === "") return { date: "", challengeIndex: 0, completed: 0 };
        var parts = raw.split(":");
        return {
            date: parts[0] || "",
            challengeIndex: parseInt(parts[1]) || 0,
            completed: parseInt(parts[2]) || 0
        };
    } catch(e) {
        return { date: "", challengeIndex: 0, completed: 0 };
    }
}

function saveChallengeData(date, challengeIndex, completed) {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        rec.setCustomData(date + ":" + challengeIndex + ":" + completed);
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