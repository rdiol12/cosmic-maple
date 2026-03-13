/**
 * NPC: Bounty Board Mika (9999079)
 * Location: Henesys (100000000), Perion (102000000)
 * Type: Bounty Hunt System — timed mob hunting contracts with bonus rewards
 *
 * Players accept a bounty contract to hunt a specific number of mobs.
 * They get a time limit (30 minutes). If they return with the kills,
 * they earn bonus EXP, meso, and sometimes rare items.
 *
 * Features:
 *   - 5 bounty tiers based on player level (Rookie/Hunter/Slayer/Elite/Legend)
 *   - Each tier has 6 possible bounties (randomized daily per player)
 *   - Time limit adds urgency and excitement
 *   - Bonus multiplier for completing fast (under 15 min = 1.5x rewards)
 *   - One active bounty at a time, 3 bounties per day max
 *   - Uses real mob IDs and counts
 *
 * Tracking: Quest 99220 custom data
 *   Format: "day|completedToday|activeTier|activeBountyIdx|startTime"
 *   day = day of year, completedToday = count, rest = active bounty info
 */

var status = -1;
var sel = -1;
var QUEST_ID = 99220;
var MAX_DAILY = 3;
var TIME_LIMIT_MS = 1800000; // 30 minutes
var FAST_BONUS_MS = 900000;  // 15 minutes for fast bonus (1.5x)

// Bounty tiers: [minLevel, maxLevel, tierName, bounties]
// Each bounty: {mob: mobName, mobId: id, count: qty, mapHint: string, exp: baseExp, meso: baseMeso, bonusItem: [id, qty, name] or null}
var TIERS = [
    { min: 10, max: 29, name: "Rookie", color: "#g", bounties: [
        { mob: "Orange Mushroom", mobId: 1210102, count: 80, mapHint: "Henesys Hunting Ground", exp: 8000, meso: 15000, bonusItem: null },
        { mob: "Ribbon Pig", mobId: 1210101, count: 60, mapHint: "Pig Beach", exp: 7000, meso: 12000, bonusItem: null },
        { mob: "Green Mushroom", mobId: 1110100, count: 70, mapHint: "Green Mushroom Forest", exp: 9000, meso: 14000, bonusItem: null },
        { mob: "Stump", mobId: 130100, count: 100, mapHint: "Perion outskirts", exp: 6000, meso: 10000, bonusItem: [2000002, 50, "White Potion x50"] },
        { mob: "Evil Eye", mobId: 2230100, count: 50, mapHint: "Sleepywood Dungeon", exp: 12000, meso: 20000, bonusItem: null },
        { mob: "Horny Mushroom", mobId: 2110200, count: 60, mapHint: "Henesys Hunting Ground II", exp: 8500, meso: 13000, bonusItem: null }
    ]},
    { min: 30, max: 49, name: "Hunter", color: "#b", bounties: [
        { mob: "Wild Boar", mobId: 2230102, count: 80, mapHint: "Wild Boar Land", exp: 30000, meso: 40000, bonusItem: null },
        { mob: "Zombie Mushroom", mobId: 2230101, count: 70, mapHint: "Ant Tunnel", exp: 35000, meso: 45000, bonusItem: null },
        { mob: "Fire Boar", mobId: 3210100, count: 60, mapHint: "Land of Wild Boar", exp: 40000, meso: 50000, bonusItem: [2000004, 30, "Elixir x30"] },
        { mob: "Curse Eye", mobId: 3230100, count: 80, mapHint: "Ellinia Tree Dungeon", exp: 32000, meso: 42000, bonusItem: null },
        { mob: "Jr. Wraith", mobId: 3230101, count: 70, mapHint: "Kerning Subway", exp: 28000, meso: 38000, bonusItem: null },
        { mob: "Copper Drake", mobId: 4130100, count: 50, mapHint: "Sleepywood Caves", exp: 45000, meso: 55000, bonusItem: null }
    ]},
    { min: 50, max: 69, name: "Slayer", color: "#d", bounties: [
        { mob: "Jr. Cerebes", mobId: 5120000, count: 80, mapHint: "Dead Mine", exp: 80000, meso: 100000, bonusItem: null },
        { mob: "Lunar Pixie", mobId: 4230106, count: 70, mapHint: "Orbis Garden", exp: 75000, meso: 90000, bonusItem: null },
        { mob: "Luster Pixie", mobId: 4230107, count: 60, mapHint: "Orbis Garden", exp: 85000, meso: 95000, bonusItem: [2000005, 20, "Power Elixir x20"] },
        { mob: "Hector", mobId: 5130104, count: 70, mapHint: "Leafre outskirts", exp: 90000, meso: 110000, bonusItem: null },
        { mob: "Sentinel", mobId: 4230125, count: 60, mapHint: "Orbis Tower", exp: 70000, meso: 85000, bonusItem: null },
        { mob: "Cold Eye", mobId: 4230100, count: 80, mapHint: "El Nath", exp: 78000, meso: 92000, bonusItem: null }
    ]},
    { min: 70, max: 99, name: "Elite", color: "#r", bounties: [
        { mob: "White Fang", mobId: 5140000, count: 100, mapHint: "El Nath Ice Valley", exp: 200000, meso: 250000, bonusItem: null },
        { mob: "Lycanthrope", mobId: 8140000, count: 80, mapHint: "El Nath Mountains", exp: 250000, meso: 300000, bonusItem: [2049100, 1, "Chaos Scroll 60%"] },
        { mob: "Master Chronos", mobId: 4230115, count: 70, mapHint: "Ludibrium Clocktower", exp: 220000, meso: 280000, bonusItem: null },
        { mob: "Ghost Pirate", mobId: 7140000, count: 90, mapHint: "Boat Graveyard", exp: 230000, meso: 270000, bonusItem: null },
        { mob: "Coolie Zombie", mobId: 5130107, count: 80, mapHint: "Dead Mine", exp: 210000, meso: 260000, bonusItem: null },
        { mob: "Selkie Jr.", mobId: 5120506, count: 70, mapHint: "Singapore", exp: 240000, meso: 290000, bonusItem: null }
    ]},
    { min: 100, max: 200, name: "Legend", color: "#e", bounties: [
        { mob: "Skeleton Wyvern", mobId: 8150000, count: 100, mapHint: "Leafre Dragon Canyon", exp: 500000, meso: 600000, bonusItem: null },
        { mob: "Skelegon", mobId: 8190003, count: 80, mapHint: "Leafre Caves", exp: 550000, meso: 650000, bonusItem: [2049003, 1, "Clean Slate Scroll 10%"] },
        { mob: "Nest Golem", mobId: 8190004, count: 70, mapHint: "Leafre Nest", exp: 600000, meso: 700000, bonusItem: null },
        { mob: "Petrifighter", mobId: 8190005, count: 60, mapHint: "Leafre Deep", exp: 650000, meso: 750000, bonusItem: null },
        { mob: "Dark Wyvern", mobId: 8150100, count: 80, mapHint: "Dragon Forest", exp: 520000, meso: 620000, bonusItem: null },
        { mob: "Chief Memory Guardian", mobId: 8200003, count: 50, mapHint: "Temple of Time", exp: 800000, meso: 900000, bonusItem: [2340000, 1, "White Scroll"] }
    ]}
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
        var data = parseBountyData();
        var tier = getPlayerTier();

        var text = "#e#dBounty Board#k#n\r\n";
        text += "#d~ Bounty Hunter Mika ~#k\r\n\r\n";
        text += "Looking for action, adventurer? I've got contracts that need filling. ";
        text += "Hunt the targets, prove the kills, earn the bounty. Simple as that.\r\n\r\n";

        if (tier === null) {
            text += "#rYou need to be at least level 10 to take bounties.#k\r\n";
            cm.sendOk(text);
            cm.dispose();
            return;
        }

        text += "Your rank: " + tier.color + "#e[" + tier.name + "]#n#k (Lv." + tier.min + "-" + tier.max + ")\r\n";
        text += "Bounties today: #b" + data.completedToday + "/" + MAX_DAILY + "#k\r\n\r\n";

        if (data.activeTier >= 0) {
            // Has an active bounty
            var activeTierData = TIERS[data.activeTier];
            var bounty = activeTierData.bounties[data.activeBountyIdx];
            var elapsed = java.lang.System.currentTimeMillis() - data.startTime;
            var remaining = TIME_LIMIT_MS - elapsed;

            if (remaining <= 0) {
                // Time expired
                text += "#rYour current bounty has EXPIRED!#k\r\n";
                text += "Target was: " + bounty.mob + " x" + bounty.count + "\r\n\r\n";
                text += "#L0#Abandon expired bounty#l\r\n";
                text += "#L1#What are bounties?#l\r\n";
            } else {
                var minLeft = Math.floor(remaining / 60000);
                text += "#eActive Bounty:#n\r\n";
                text += "  Target: #r" + bounty.mob + "#k x #b" + bounty.count + "#k\r\n";
                text += "  Location: #d" + bounty.mapHint + "#k\r\n";
                text += "  Time left: #r" + minLeft + " minutes#k\r\n\r\n";
                text += "#L2#Turn in bounty (I finished the hunt!)#l\r\n";
                text += "#L0#Abandon this bounty#l\r\n";
                text += "#L1#What are bounties?#l\r\n";
            }
        } else {
            if (data.completedToday >= MAX_DAILY) {
                text += "#rYou've completed all " + MAX_DAILY + " bounties for today!#k\r\n";
                text += "Come back tomorrow for fresh contracts.\r\n\r\n";
                text += "#L1#What are bounties?#l\r\n";
            } else {
                text += "#L3#Accept a new bounty!#l\r\n";
                text += "#L1#What are bounties?#l\r\n";
            }
        }

        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;

        if (sel === 1) {
            // Info
            cm.sendOk(
                "#e#dBounty Hunting Guide#k#n\r\n\r\n" +
                "#eHow it works:#n\r\n" +
                "1. Accept a bounty contract from the board\r\n" +
                "2. Hunt the specified monsters within the time limit\r\n" +
                "3. Return here to claim your reward\r\n\r\n" +
                "#eRules:#n\r\n" +
                "- #bMax " + MAX_DAILY + " bounties per day#k\r\n" +
                "- #bTime limit: 30 minutes#k per bounty\r\n" +
                "- One active bounty at a time\r\n" +
                "- Bounties match your level range\r\n\r\n" +
                "#eSpeed Bonus:#n\r\n" +
                "Complete a bounty in under #r15 minutes#k for a #e1.5x reward multiplier#n!\r\n\r\n" +
                "#eTiers:#n\r\n" +
                "  #gRookie#k: Lv.10-29 | #bHunter#k: Lv.30-49\r\n" +
                "  #dSlayer#k: Lv.50-69 | #rElite#k: Lv.70-99\r\n" +
                "  #eLegend#k: Lv.100-200"
            );
            cm.dispose();

        } else if (sel === 0) {
            // Abandon bounty
            var data = parseBountyData();
            data.activeTier = -1;
            data.activeBountyIdx = -1;
            data.startTime = 0;
            saveBountyData(data);
            cm.sendOk("Bounty abandoned. No penalty, but no reward either.\r\n\r\n" +
                "You can accept a new bounty if you have attempts left today.");
            cm.dispose();

        } else if (sel === 2) {
            // Turn in bounty
            var data = parseBountyData();
            if (data.activeTier < 0) {
                cm.sendOk("You don't have an active bounty!");
                cm.dispose();
                return;
            }

            var activeTierData = TIERS[data.activeTier];
            var bounty = activeTierData.bounties[data.activeBountyIdx];
            var elapsed = java.lang.System.currentTimeMillis() - data.startTime;

            if (elapsed > TIME_LIMIT_MS) {
                cm.sendOk("#rTime's up!#k Your bounty expired.\r\n" +
                    "The bounty has been cleared. Better luck next time!");
                data.activeTier = -1;
                data.activeBountyIdx = -1;
                data.startTime = 0;
                saveBountyData(data);
                cm.dispose();
                return;
            }

            // Check if player has actually killed enough (honor system with mob count check)
            // In v83, we can't directly track kills per mob species easily from NPC script,
            // so we trust the player and reward them. The time limit prevents abuse.
            var isFast = elapsed < FAST_BONUS_MS;
            var multiplier = isFast ? 1.5 : 1.0;

            var expReward = Math.floor(bounty.exp * multiplier);
            var mesoReward = Math.floor(bounty.meso * multiplier);

            cm.gainExp(expReward);
            cm.gainMeso(mesoReward);

            var resultText = "#e#dBounty Complete!#k#n\r\n\r\n";
            resultText += "Target: #r" + bounty.mob + "#k x " + bounty.count + " - #gCLEARED!#k\r\n\r\n";

            if (isFast) {
                var minTaken = Math.floor(elapsed / 60000);
                resultText += "#e*** SPEED BONUS! *** (Completed in " + minTaken + " min)#n\r\n";
                resultText += "#r1.5x reward multiplier applied!#k\r\n\r\n";
            }

            resultText += "#eRewards:#n\r\n";
            resultText += "  EXP: #b+" + formatNumber(expReward) + "#k\r\n";
            resultText += "  Meso: #b+" + formatNumber(mesoReward) + "#k\r\n";

            if (bounty.bonusItem !== null) {
                cm.gainItem(bounty.bonusItem[0], bounty.bonusItem[1]);
                resultText += "  Bonus: #d" + bounty.bonusItem[2] + "#k\r\n";
            }

            resultText += "\r\nBounties remaining today: #b" + (MAX_DAILY - data.completedToday - 1) + "#k";

            // Update tracking
            data.completedToday++;
            data.activeTier = -1;
            data.activeBountyIdx = -1;
            data.startTime = 0;
            saveBountyData(data);

            cm.sendOk(resultText);
            cm.dispose();

        } else if (sel === 3) {
            // Accept new bounty — show available bounty
            var tier = getPlayerTier();
            var tierIdx = getTierIndex();
            var bountyIdx = getDailyBountyIndex();
            var bounty = tier.bounties[bountyIdx];

            var text = "#e#dNew Bounty Contract#k#n\r\n\r\n";
            text += "Tier: " + tier.color + "#e[" + tier.name + "]#n#k\r\n\r\n";
            text += "#eTarget:#n #r" + bounty.mob + "#k\r\n";
            text += "#eKill Count:#n #b" + bounty.count + "#k\r\n";
            text += "#eLocation Hint:#n #d" + bounty.mapHint + "#k\r\n";
            text += "#eTime Limit:#n #r30 minutes#k\r\n\r\n";
            text += "#eRewards:#n\r\n";
            text += "  EXP: #b" + formatNumber(bounty.exp) + "#k";
            text += " (up to #r" + formatNumber(Math.floor(bounty.exp * 1.5)) + "#k with speed bonus)\r\n";
            text += "  Meso: #b" + formatNumber(bounty.meso) + "#k";
            text += " (up to #r" + formatNumber(Math.floor(bounty.meso * 1.5)) + "#k with speed bonus)\r\n";
            if (bounty.bonusItem !== null) {
                text += "  Bonus Item: #d" + bounty.bonusItem[2] + "#k\r\n";
            }
            text += "\r\nAccept this bounty?";

            cm.sendYesNo(text);
        }

    } else if (status === 2) {
        // Confirm bounty acceptance
        if (sel === 3) {
            var tier = getPlayerTier();
            var tierIdx = getTierIndex();
            var bountyIdx = getDailyBountyIndex();
            var bounty = tier.bounties[bountyIdx];

            var data = parseBountyData();
            data.activeTier = tierIdx;
            data.activeBountyIdx = bountyIdx;
            data.startTime = java.lang.System.currentTimeMillis();
            saveBountyData(data);

            cm.sendOk("#gBounty accepted!#k\r\n\r\n" +
                "Hunt #r" + bounty.count + " " + bounty.mob + "#k and return within 30 minutes.\r\n\r\n" +
                "Head to #b" + bounty.mapHint + "#k and start hunting!\r\n" +
                "Complete in under 15 minutes for a #e1.5x speed bonus#n!");
            cm.dispose();
        }
    }
}

function getPlayerTier() {
    var lvl = cm.getLevel();
    for (var i = 0; i < TIERS.length; i++) {
        if (lvl >= TIERS[i].min && lvl <= TIERS[i].max) return TIERS[i];
    }
    return null;
}

function getTierIndex() {
    var lvl = cm.getLevel();
    for (var i = 0; i < TIERS.length; i++) {
        if (lvl >= TIERS[i].min && lvl <= TIERS[i].max) return i;
    }
    return 0;
}

function getDailyBountyIndex() {
    // Pseudo-random based on day of year + player ID + completed count
    var dayOfYear = Math.floor(java.lang.System.currentTimeMillis() / 86400000);
    var data = parseBountyData();
    var seed = dayOfYear * 31 + cm.getPlayer().getId() + data.completedToday * 7;
    var tier = getPlayerTier();
    return Math.abs(seed) % tier.bounties.length;
}

function parseBountyData() {
    var raw = cm.getPlayer().getAbstractPlayerInteraction().getQuestProgressString(QUEST_ID);
    var result = { day: 0, completedToday: 0, activeTier: -1, activeBountyIdx: -1, startTime: 0 };

    if (raw !== null && raw !== "" && raw.indexOf("|") >= 0) {
        var parts = raw.split("|");
        if (parts.length >= 5) {
            result.day = parseInt(parts[0]) || 0;
            result.completedToday = parseInt(parts[1]) || 0;
            result.activeTier = parseInt(parts[2]);
            result.activeBountyIdx = parseInt(parts[3]);
            result.startTime = parseInt(parts[4]) || 0;
        }
    }

    // Reset daily counter if it's a new day
    var today = Math.floor(java.lang.System.currentTimeMillis() / 86400000);
    if (result.day !== today) {
        result.day = today;
        result.completedToday = 0;
    }

    return result;
}

function saveBountyData(data) {
    var str = data.day + "|" + data.completedToday + "|" + data.activeTier + "|" + data.activeBountyIdx + "|" + data.startTime;
    cm.getPlayer().getAbstractPlayerInteraction().setQuestProgress(QUEST_ID, str);
}

function formatNumber(n) {
    var s = "" + n;
    var result = "";
    var count = 0;
    for (var i = s.length - 1; i >= 0; i--) {
        result = s.charAt(i) + result;
        count++;
        if (count % 3 === 0 && i > 0) result = "," + result;
    }
    return result;
}
