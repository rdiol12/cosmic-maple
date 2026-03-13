/**
 * NPC: Fortune Keeper Navi (9999065)
 * Location: Henesys (100000000)
 * Type: Daily Login Reward NPC — consecutive daily check-ins give escalating rewards
 *
 * Tracks consecutive login days via quest 99210 customData.
 * Format: "YYYYMMDD:streak:totalClaims"
 *
 * Reward tiers (reset if a day is missed):
 *   Day 1:  2,000 EXP + 5,000 meso
 *   Day 2:  4,000 EXP + 10,000 meso
 *   Day 3:  8,000 EXP + 20,000 meso + 5 Power Elixirs
 *   Day 4:  12,000 EXP + 30,000 meso
 *   Day 5:  20,000 EXP + 50,000 meso + 10 Power Elixirs
 *   Day 6:  30,000 EXP + 70,000 meso
 *   Day 7:  50,000 EXP + 100,000 meso + 1 White Scroll (2340000)
 *   Day 7+ repeats the day 7 reward every 7th day, others cycle days 1-6
 *
 * Milestone bonuses (one-time):
 *   10 total claims: 100K meso + 3 Chaos Scrolls 60% (2049100)
 *   30 total claims: 300K meso + 10 Clean Slate 10% (2049003)
 *   50 total claims: 500K meso + 1 Onyx Apple 20-pack (2022179 x20)
 */

var status = -1;
var QUEST_ID = 99210;

var dailyRewards = [
    { exp: 2000,  meso: 5000,   items: null,                              desc: "2,000 EXP + 5,000 meso" },
    { exp: 4000,  meso: 10000,  items: null,                              desc: "4,000 EXP + 10,000 meso" },
    { exp: 8000,  meso: 20000,  items: [{id:2000005, qty:5}],             desc: "8,000 EXP + 20,000 meso + 5 Power Elixirs" },
    { exp: 12000, meso: 30000,  items: null,                              desc: "12,000 EXP + 30,000 meso" },
    { exp: 20000, meso: 50000,  items: [{id:2000005, qty:10}],            desc: "20,000 EXP + 50,000 meso + 10 Power Elixirs" },
    { exp: 30000, meso: 70000,  items: null,                              desc: "30,000 EXP + 70,000 meso" },
    { exp: 50000, meso: 100000, items: [{id:2340000, qty:1}],             desc: "50,000 EXP + 100,000 meso + 1 White Scroll" }
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
        var data = parseData();
        var today = getDateString();
        var alreadyClaimed = (data.lastDate === today);
        var streak = data.streak;
        var total = data.totalClaims;

        var text = "#e#dFortune Keeper Navi#k#n\r\n\r\n";
        text += "Welcome back, traveler! The Fortune Keepers reward those who return faithfully to Maple World each day.\r\n\r\n";

        if (alreadyClaimed) {
            text += "#g[Today's reward already claimed!]#k\r\n\r\n";
            text += "Current streak: #b" + streak + " day" + (streak !== 1 ? "s" : "") + "#k\r\n";
            text += "Total check-ins: #b" + total + "#k\r\n\r\n";
            text += getStreakCalendar(streak) + "\r\n\r\n";
            text += "Come back #rtomorrow#k to keep your streak alive!\r\n\r\n";
            text += getNextMilestoneText(total);
            cm.sendOk(text);
            cm.dispose();
            return;
        }

        // Calculate what they'll get
        var newStreak = calculateNewStreak(data, today);
        var rewardIdx = (newStreak - 1) % 7;
        var reward = dailyRewards[rewardIdx];

        text += "Current streak: #b" + streak + " day" + (streak !== 1 ? "s" : "") + "#k";
        if (newStreak > streak) {
            text += " -> #r" + newStreak + "#k (streak continues!)";
        } else {
            text += " -> #r1#k (streak reset — you missed a day)";
        }
        text += "\r\n";
        text += "Total check-ins: #b" + total + "#k\r\n\r\n";
        text += getStreakCalendar(newStreak) + "\r\n\r\n";
        text += "#eDay " + newStreak + " Reward:#n #b" + reward.desc + "#k\r\n\r\n";

        // Check milestones
        var newTotal = total + 1;
        var milestoneText = getMilestoneRewardText(newTotal);
        if (milestoneText !== "") {
            text += "#r[MILESTONE BONUS!]#k " + milestoneText + "\r\n\r\n";
        }

        text += "#L0##bClaim today's reward!#k#l\r\n";
        text += "#L1#What are daily rewards?#l\r\n";
        text += "#L2#Maybe later#l";
        cm.sendSimple(text);

    } else if (status === 1) {
        if (selection === 2) {
            cm.sendOk("No problem! Come back before midnight to claim today's reward.");
            cm.dispose();
            return;
        }

        if (selection === 1) {
            var info = "#e#bDaily Login Rewards#k#n\r\n\r\n";
            info += "Check in with me every day for escalating rewards!\r\n\r\n";
            info += "#eDaily Rewards (7-day cycle):#n\r\n";
            for (var i = 0; i < dailyRewards.length; i++) {
                info += "  Day " + (i + 1) + ": #b" + dailyRewards[i].desc + "#k\r\n";
            }
            info += "\r\n#eRules:#n\r\n";
            info += "  - One claim per day\r\n";
            info += "  - Missing a day resets your streak to Day 1\r\n";
            info += "  - After Day 7, the cycle repeats\r\n";
            info += "  - Every 7th consecutive day = White Scroll!\r\n\r\n";
            info += "#eMilestone Bonuses (one-time):#n\r\n";
            info += "  10 claims: 100K meso + 3 Chaos Scrolls\r\n";
            info += "  30 claims: 300K meso + 10 Clean Slate Scrolls\r\n";
            info += "  50 claims: 500K meso + 20 Onyx Apples\r\n";
            cm.sendOk(info);
            cm.dispose();
            return;
        }

        // selection === 0: Claim reward
        var data = parseData();
        var today = getDateString();

        if (data.lastDate === today) {
            cm.sendOk("You've already claimed today's reward! Come back tomorrow.");
            cm.dispose();
            return;
        }

        var newStreak = calculateNewStreak(data, today);
        var rewardIdx = (newStreak - 1) % 7;
        var reward = dailyRewards[rewardIdx];
        var newTotal = data.totalClaims + 1;

        // Give rewards
        cm.gainExp(reward.exp);
        cm.gainMeso(reward.meso);
        if (reward.items !== null) {
            for (var i = 0; i < reward.items.length; i++) {
                if (cm.canHold(reward.items[i].id)) {
                    cm.gainItem(reward.items[i].id, reward.items[i].qty);
                }
            }
        }

        // Check milestone
        var milestoneGiven = giveMilestoneReward(newTotal);

        // Save data
        saveData(today, newStreak, newTotal);

        var resultText = "#e#dFortune Keeper Navi#k#n\r\n\r\n";
        resultText += "#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n";
        resultText += "#eDay " + newStreak + " Reward Claimed!#n\r\n\r\n";
        resultText += "#b" + reward.desc + "#k\r\n\r\n";

        if (milestoneGiven !== "") {
            resultText += "#r[MILESTONE BONUS: " + milestoneGiven + "]#k\r\n\r\n";
        }

        resultText += "Streak: #b" + newStreak + " day" + (newStreak !== 1 ? "s" : "") + "#k\r\n";
        resultText += "Total claims: #b" + newTotal + "#k\r\n\r\n";

        if (newStreak % 7 === 0) {
            resultText += "#r[7-DAY STREAK!] Congratulations on your dedication!#k\r\n\r\n";
        }

        resultText += "See you tomorrow, adventurer! Keep the streak alive!";
        cm.sendOk(resultText);
        cm.dispose();
    }
}

function parseData() {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        var raw = rec.getCustomData();
        if (raw === null || raw === "") return { lastDate: "", streak: 0, totalClaims: 0 };
        var parts = raw.split(":");
        return {
            lastDate: parts[0] || "",
            streak: parseInt(parts[1]) || 0,
            totalClaims: parseInt(parts[2]) || 0
        };
    } catch(e) {
        return { lastDate: "", streak: 0, totalClaims: 0 };
    }
}

function saveData(dateStr, streak, total) {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        rec.setCustomData(dateStr + ":" + streak + ":" + total);
    } catch(e) {}
}

function calculateNewStreak(data, today) {
    if (data.lastDate === "") return 1;
    var yesterday = getYesterdayString();
    if (data.lastDate === yesterday) {
        return data.streak + 1;
    }
    return 1; // Streak broken
}

function getDateString() {
    var cal = java.util.Calendar.getInstance();
    var y = cal.get(java.util.Calendar.YEAR);
    var m = cal.get(java.util.Calendar.MONTH) + 1;
    var d = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + y + (m < 10 ? "0" : "") + m + (d < 10 ? "0" : "") + d;
}

function getYesterdayString() {
    var cal = java.util.Calendar.getInstance();
    cal.add(java.util.Calendar.DAY_OF_MONTH, -1);
    var y = cal.get(java.util.Calendar.YEAR);
    var m = cal.get(java.util.Calendar.MONTH) + 1;
    var d = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + y + (m < 10 ? "0" : "") + m + (d < 10 ? "0" : "") + d;
}

function getStreakCalendar(streak) {
    var cal = "";
    for (var i = 1; i <= 7; i++) {
        if (i <= (streak % 7 === 0 && streak > 0 ? 7 : streak % 7)) {
            cal += "#g[Day " + i + "]#k ";
        } else {
            cal += "#d[Day " + i + "]#k ";
        }
    }
    return cal;
}

function getMilestoneRewardText(total) {
    if (total === 10) return "10th check-in: 100K meso + 3 Chaos Scrolls!";
    if (total === 30) return "30th check-in: 300K meso + 10 Clean Slates!";
    if (total === 50) return "50th check-in: 500K meso + 20 Onyx Apples!";
    return "";
}

function giveMilestoneReward(total) {
    if (total === 10) {
        cm.gainMeso(100000);
        if (cm.canHold(2049100)) cm.gainItem(2049100, 3);
        return "100K meso + 3 Chaos Scrolls";
    }
    if (total === 30) {
        cm.gainMeso(300000);
        if (cm.canHold(2049003)) cm.gainItem(2049003, 10);
        return "300K meso + 10 Clean Slate Scrolls";
    }
    if (total === 50) {
        cm.gainMeso(500000);
        if (cm.canHold(2022179)) cm.gainItem(2022179, 20);
        return "500K meso + 20 Onyx Apples";
    }
    return "";
}

function getNextMilestoneText(total) {
    if (total < 10) return "#dNext milestone: " + (10 - total) + " more claims until 10th reward!#k";
    if (total < 30) return "#dNext milestone: " + (30 - total) + " more claims until 30th reward!#k";
    if (total < 50) return "#dNext milestone: " + (50 - total) + " more claims until 50th reward!#k";
    return "#gAll milestones achieved!#k";
}
