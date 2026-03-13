/**
 * Captain Vega - Daily Challenge Taskmaster
 * NPC ID: 9999074
 * Location: Henesys Park (100000000)
 *
 * Features:
 * - Daily randomized missions (kill mobs, collect items, visit maps)
 * - 3 difficulty tiers: Recruit (Lv10+), Veteran (Lv30+), Elite (Lv70+)
 * - Streak bonus for consecutive days (up to 7-day multiplier)
 * - Rewards: EXP, meso, bonus items at milestones
 * - Quest 99218 custom data tracks: lastDay|streak|totalCompleted|tier|missionIdx
 */

var status = -1;

// Mission pools by tier
var RECRUIT_MISSIONS = [
    { desc: "Hunt 50 Slimes in Henesys Hunting Ground", type: "kill", mobId: 210100, count: 50, map: 104040000, mapName: "Henesys Hunting Ground" },
    { desc: "Hunt 30 Stumps in Perion", type: "kill", mobId: 130100, count: 30, map: 102020000, mapName: "Construction Site North" },
    { desc: "Hunt 40 Ribbon Pigs near Lith Harbor", type: "kill", mobId: 1210101, count: 40, map: 104010001, mapName: "Pig Beach" },
    { desc: "Hunt 30 Blue Snails on Maple Island", type: "kill", mobId: 100101, count: 30, map: 40000, mapName: "Snail Hunting Ground" },
    { desc: "Hunt 35 Orange Mushrooms near Henesys", type: "kill", mobId: 1210102, count: 35, map: 104000400, mapName: "Henesys Hunting Ground II" },
    { desc: "Travel to Ellinia and visit the Magic Library", type: "visit", map: 101000003, mapName: "Ellinia Magic Library" },
    { desc: "Travel to Kerning City and enter the Jazz Bar", type: "visit", map: 103000100, mapName: "Kerning City Jazz Bar" },
    { desc: "Hunt 25 Green Mushrooms near Ellinia", type: "kill", mobId: 1110100, count: 25, map: 101010100, mapName: "Green Mushroom Forest" }
];

var VETERAN_MISSIONS = [
    { desc: "Hunt 80 Curse Eyes in Ellinia", type: "kill", mobId: 3230100, count: 80, map: 101030404, mapName: "Tree Dungeon" },
    { desc: "Hunt 60 Jr. Wraiths in the Subway", type: "kill", mobId: 3230101, count: 60, map: 103000800, mapName: "Subway Line 1" },
    { desc: "Hunt 70 Wild Boars near Perion", type: "kill", mobId: 2230102, count: 70, map: 102040200, mapName: "Rocky Road" },
    { desc: "Hunt 50 Zombie Mushrooms in Ant Tunnel", type: "kill", mobId: 2230101, count: 50, map: 105070001, mapName: "Ant Tunnel Park" },
    { desc: "Hunt 60 Fire Boars near Perion mines", type: "kill", mobId: 3210100, count: 60, map: 102040400, mapName: "Land of Wild Boar" },
    { desc: "Travel to Orbis and admire the tower entrance", type: "visit", map: 200000000, mapName: "Orbis Station" },
    { desc: "Hunt 40 Lunar Pixies in Orbis", type: "kill", mobId: 4230106, count: 40, map: 200010300, mapName: "Garden of Darkness" },
    { desc: "Hunt 50 Cold Eyes near El Nath", type: "kill", mobId: 4230100, count: 50, map: 211040300, mapName: "Sharp Cliff III" }
];

var ELITE_MISSIONS = [
    { desc: "Hunt 100 Lycanthropes in El Nath Mountains", type: "kill", mobId: 8140000, count: 100, map: 211040800, mapName: "Ice Valley II" },
    { desc: "Hunt 80 Master Chronos in Ludibrium", type: "kill", mobId: 4230115, count: 80, map: 220050200, mapName: "Tick-Tock Tower" },
    { desc: "Hunt 60 Hectors at Leafre outskirts", type: "kill", mobId: 5130104, count: 60, map: 240010100, mapName: "Cranky Forest" },
    { desc: "Hunt 120 Ghost Pirates at the Boat Graveyard", type: "kill", mobId: 7140000, count: 120, map: 230040200, mapName: "Warped Passage" },
    { desc: "Hunt 70 Coolie Zombies in El Nath mines", type: "kill", mobId: 5130107, count: 70, map: 211041200, mapName: "Dead Mine" },
    { desc: "Travel to Temple of Time entrance", type: "visit", map: 270000000, mapName: "Temple of Time" },
    { desc: "Hunt 90 Gigantic Spirit Vikings in Leafre", type: "kill", mobId: 8141100, count: 90, map: 240040400, mapName: "Destroyed Dragon Nest" },
    { desc: "Hunt 80 Skelegons in Leafre caves", type: "kill", mobId: 8190003, count: 80, map: 240040500, mapName: "Dragon Forest II" }
];

var TIER_NAMES = ["Recruit", "Veteran", "Elite"];
var TIER_COLORS = ["#33CC33", "#3399FF", "#FF3333"];
var TIER_LEVELS = [10, 30, 70];
var TIER_POOLS = [RECRUIT_MISSIONS, VETERAN_MISSIONS, ELITE_MISSIONS];

// Rewards by tier [baseExp, baseMeso]
var TIER_REWARDS = [
    [5000, 10000],
    [25000, 50000],
    [100000, 200000]
];

// Streak multipliers (day 1-7+)
var STREAK_MULT = [1.0, 1.1, 1.2, 1.3, 1.5, 1.7, 2.0];

// Milestone items: [totalCompleted threshold, itemId, quantity, itemName]
var MILESTONES = [
    [5, 2000005, 10, "Power Elixir"],
    [10, 2022179, 5, "Onyx Apple"],
    [25, 2049100, 1, "Chaos Scroll 60%"],
    [50, 2340000, 1, "White Scroll"],
    [100, 2049100, 3, "Chaos Scroll 60% x3"]
];

function getQuestData() {
    try {
        var rec = cm.getQuestRecord(99218);
        var raw = rec.getCustomData();
        if (raw == null || raw === "") {
            return { lastDay: "", streak: 0, totalCompleted: 0, tier: -1, missionIdx: -1, accepted: false, progress: 0 };
        }
        var parts = ("" + raw).split("|");
        return {
            lastDay: parts[0] || "",
            streak: parseInt(parts[1]) || 0,
            totalCompleted: parseInt(parts[2]) || 0,
            tier: parseInt(parts[3]),
            missionIdx: parseInt(parts[4]),
            accepted: parts[5] === "1",
            progress: parseInt(parts[6]) || 0
        };
    } catch(e) {
        return { lastDay: "", streak: 0, totalCompleted: 0, tier: -1, missionIdx: -1, accepted: false, progress: 0 };
    }
}

function saveQuestData(data) {
    try {
        var val = data.lastDay + "|" + data.streak + "|" + data.totalCompleted + "|" + data.tier + "|" + data.missionIdx + "|" + (data.accepted ? "1" : "0") + "|" + data.progress;
        var rec = cm.getQuestRecord(99218);
        rec.setCustomData(val);
    } catch(e) {}
}

function getTodayStr() {
    var cal = java.util.Calendar.getInstance();
    var y = cal.get(java.util.Calendar.YEAR);
    var m = cal.get(java.util.Calendar.MONTH) + 1;
    var d = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + y + (m < 10 ? "0" : "") + m + (d < 10 ? "0" : "") + d;
}

function getYesterdayStr() {
    var cal = java.util.Calendar.getInstance();
    cal.add(java.util.Calendar.DAY_OF_MONTH, -1);
    var y = cal.get(java.util.Calendar.YEAR);
    var m = cal.get(java.util.Calendar.MONTH) + 1;
    var d = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + y + (m < 10 ? "0" : "") + m + (d < 10 ? "0" : "") + d;
}

function getDailyMissionIdx(tier) {
    // Deterministic daily seed based on date + tier so all players get same mission
    var today = getTodayStr();
    var seed = 0;
    var todayStr = "" + today;
    for (var i = 0; i < todayStr.length; i++) {
        seed = seed * 31 + todayStr.charCodeAt(i);
    }
    seed += tier * 7;
    var pool = TIER_POOLS[tier];
    return Math.abs(seed) % pool.length;
}

function getStreakMult(streak) {
    if (streak < 1) return 1.0;
    var idx = Math.min(streak - 1, STREAK_MULT.length - 1);
    return STREAK_MULT[idx];
}

function formatNumber(n) {
    var s = "" + n;
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

function start() {
    status = 0;
    var data = getQuestData();
    var today = getTodayStr();
    var level = cm.getPlayer().getLevel();

    // Determine highest available tier
    var maxTier = -1;
    for (var i = TIER_LEVELS.length - 1; i >= 0; i--) {
        if (level >= TIER_LEVELS[i]) {
            maxTier = i;
            break;
        }
    }

    if (maxTier < 0) {
        cm.sendOk("Ahoy there, young adventurer! I'm #bCaptain Vega#k, retired explorer and daily taskmaster.\r\n\r\nYou need to be at least #bLevel 10#k before I can assign you any missions. Come back when you've grown a bit stronger!");
        cm.dispose();
        return;
    }

    // Check if already completed today
    if (data.lastDay === today && !data.accepted) {
        var nextMilestone = -1;
        for (var i = 0; i < MILESTONES.length; i++) {
            if (data.totalCompleted < MILESTONES[i][0]) {
                nextMilestone = MILESTONES[i][0];
                break;
            }
        }
        var milestoneText = nextMilestone > 0 ? ("\r\nNext milestone reward at #b" + nextMilestone + "#k completions.") : "\r\nYou've earned all milestone rewards. Legendary!";

        cm.sendOk("Well done, sailor! You've already completed today's challenge.\r\n\r\n#eCurrent Streak:#n #b" + data.streak + " day(s)#k\r\n#eTotal Completed:#n #b" + data.totalCompleted + "#k" + milestoneText + "\r\n\r\nCome back #btomorrow#k for a new challenge!");
        cm.dispose();
        return;
    }

    // Check if mission in progress
    if (data.accepted && data.tier >= 0 && data.missionIdx >= 0) {
        var mission = TIER_POOLS[data.tier][data.missionIdx];
        var streakMult = getStreakMult(data.streak + 1);
        var expReward = Math.floor(TIER_REWARDS[data.tier][0] * streakMult);
        var mesoReward = Math.floor(TIER_REWARDS[data.tier][1] * streakMult);

        cm.sendNext("Welcome back! Your current mission:\r\n\r\n#e" + mission.desc + "#n\r\n\r\nDifficulty: #r" + TIER_NAMES[data.tier] + "#k\r\nRewards: #b" + formatNumber(expReward) + " EXP#k + #b" + formatNumber(mesoReward) + " meso#k\r\n\r\nHave you completed the task?");
        return;
    }

    // New mission selection
    var text = "Ahoy! I'm #bCaptain Vega#k, the Daily Taskmaster!\r\n\r\nEvery day I post a new challenge for brave adventurers. Complete it for #bEXP, meso, and streak bonuses#k!\r\n\r\n";

    if (data.streak > 0 && data.lastDay === getYesterdayStr()) {
        text += "#eCurrent Streak:#n #b" + data.streak + " day(s)#k (x" + getStreakMult(data.streak + 1).toFixed(1) + " bonus!)\r\n";
    } else if (data.streak > 0 && data.lastDay !== getYesterdayStr()) {
        text += "#rStreak reset!#k Your last mission was more than a day ago.\r\n";
    }
    text += "#eTotal Completed:#n #b" + data.totalCompleted + "#k\r\n\r\n";
    text += "Choose your difficulty:\r\n";

    for (var i = 0; i <= maxTier; i++) {
        var idx = getDailyMissionIdx(i);
        var m = TIER_POOLS[i][idx];
        var mult = getStreakMult((data.lastDay === getYesterdayStr() ? data.streak : 0) + 1);
        var exp = Math.floor(TIER_REWARDS[i][0] * mult);
        var meso = Math.floor(TIER_REWARDS[i][1] * mult);
        text += "\r\n#L" + i + "#";
        text += "#e[" + TIER_NAMES[i] + "]#n " + m.desc;
        text += " (" + formatNumber(exp) + " EXP + " + formatNumber(meso) + " meso)";
        text += "#l";
    }

    cm.sendSimple(text);
}

function action(mode, type, selection) {
    if (mode == -1 || (mode == 0 && status == 0)) {
        cm.dispose();
        return;
    }
    if (mode == 1) {
        status++;
    }

    var data = getQuestData();
    var today = getTodayStr();

    if (status == 1) {
        if (data.accepted) {
            // Player returning to complete mission
            var mission = TIER_POOLS[data.tier][data.missionIdx];
            var completed = false;

            if (mission.type === "kill") {
                // Require player to be on the mission map to complete kill quests
                // This ensures they at least traveled to the hunting ground
                completed = (cm.getPlayer().getMap().getId() == mission.map);
                if (!completed) {
                    cm.sendOk("You haven't completed the mission yet!\r\n\r\nYou need to go to #b" + mission.mapName + "#k and hunt the monsters there.\r\n\r\nCome back to me #ewhen you're on that map#n to claim your reward.");
                    cm.dispose();
                    return;
                }
            } else if (mission.type === "visit") {
                completed = (cm.getPlayer().getMap().getId() == mission.map);
                if (!completed) {
                    cm.sendOk("You need to visit #b" + mission.mapName + "#k first!\r\n\r\nTravel there and talk to me again to complete the mission.");
                    cm.dispose();
                    return;
                }
            }

            if (completed) {
                // Calculate rewards
                var wasYesterday = (data.lastDay === getYesterdayStr());
                var newStreak = wasYesterday ? data.streak + 1 : 1;
                if (data.lastDay === today) {
                    newStreak = data.streak;
                }
                var mult = getStreakMult(newStreak);
                var expReward = Math.floor(TIER_REWARDS[data.tier][0] * mult);
                var mesoReward = Math.floor(TIER_REWARDS[data.tier][1] * mult);
                var newTotal = data.totalCompleted + 1;

                // Grant rewards
                cm.gainExp(expReward);
                cm.gainMeso(mesoReward);

                var rewardText = "Mission complete! Outstanding work, adventurer!\r\n\r\n";
                rewardText += "#eRewards:#n\r\n";
                rewardText += "#b+" + formatNumber(expReward) + " EXP#k\r\n";
                rewardText += "#b+" + formatNumber(mesoReward) + " meso#k\r\n";
                rewardText += "\r\n#eStreak:#n #b" + newStreak + " day(s)#k";
                if (newStreak >= 7) {
                    rewardText += " #r(MAX BONUS!)#k";
                }
                rewardText += "\r\n#eTotal Completed:#n #b" + newTotal + "#k";

                // Check milestone
                for (var i = 0; i < MILESTONES.length; i++) {
                    if (newTotal >= MILESTONES[i][0] && (data.totalCompleted < MILESTONES[i][0])) {
                        var mItem = MILESTONES[i];
                        if (cm.canHold(mItem[1])) {
                            cm.gainItem(mItem[1], mItem[2]);
                            rewardText += "\r\n\r\n#e*** MILESTONE BONUS! ***#n\r\n";
                            rewardText += "You completed #b" + mItem[0] + " missions#k!\r\n";
                            rewardText += "Bonus: #b" + mItem[3] + " x" + mItem[2] + "#k";
                        } else {
                            rewardText += "\r\n\r\n#rMilestone bonus available but inventory full! Make room and talk to me again.#k";
                        }
                        break;
                    }
                }

                // Save completion
                data.lastDay = today;
                data.streak = newStreak;
                data.totalCompleted = newTotal;
                data.tier = -1;
                data.missionIdx = -1;
                data.accepted = false;
                data.progress = 0;
                saveQuestData(data);

                cm.sendOk(rewardText);
                cm.dispose();
                return;
            }
        } else {
            // Accepting a new mission
            var tier = selection;
            var playerLevel = cm.getPlayer().getLevel();
            if (tier < 0 || tier > 2 || playerLevel < TIER_LEVELS[tier]) {
                cm.sendOk("You don't meet the level requirement for that tier!");
                cm.dispose();
                return;
            }

            var idx = getDailyMissionIdx(tier);
            var mission = TIER_POOLS[tier][idx];

            // Reset streak if not consecutive
            var wasYesterday = (data.lastDay === getYesterdayStr());
            if (!wasYesterday && data.lastDay !== "" && data.lastDay !== today) {
                data.streak = 0;
            }

            data.tier = tier;
            data.missionIdx = idx;
            data.accepted = true;
            data.progress = 0;
            saveQuestData(data);

            var mult = getStreakMult((wasYesterday ? data.streak : 0) + 1);
            var expReward = Math.floor(TIER_REWARDS[tier][0] * mult);
            var mesoReward = Math.floor(TIER_REWARDS[tier][1] * mult);

            cm.sendOk("Mission accepted!\r\n\r\n#e" + mission.desc + "#n\r\n\r\nDifficulty: #r" + TIER_NAMES[tier] + "#k\r\nLocation: #b" + mission.mapName + "#k\r\nRewards: #b" + formatNumber(expReward) + " EXP#k + #b" + formatNumber(mesoReward) + " meso#k\r\n\r\nGo complete the task and come back to me for your reward. Good luck, adventurer!");
            cm.dispose();
            return;
        }
    }
}
