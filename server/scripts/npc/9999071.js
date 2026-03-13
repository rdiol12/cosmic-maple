/**
 * NPC: Crystal Sage Yuki (9999071)
 * Location: El Nath (211000000)
 * Type: AP/SP Reset — essential QoL NPC for stat/skill redistribution
 *
 * Features:
 *   1. AP Reset — Resets all base stats to 4 (beginner default) and refunds
 *      all assigned AP as unassigned AP. Cost scales with level.
 *   2. SP Reset — Resets all SP for current job tier and refunds as unassigned SP.
 *      Cost per job tier.
 *   3. View Stats — Shows current stat allocation and class recommendations.
 *
 * Pricing (meso sink):
 *   AP Reset: 500K (Lv1-30), 2M (Lv31-70), 5M (Lv71-120), 10M (Lv121-200)
 *   SP Reset: 1M per job tier (1st=1M, 2nd=2M, 3rd=3M, 4th=5M)
 *
 * Tracks usage via quest 99216 (daily limit: 3 resets per day to prevent abuse).
 */

var status = -1;
var sel = -1;
var QUEST_ID = 99216;
var DAILY_LIMIT = 3;

var MapleStat = Java.type('client.Stat');

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
        var uses = getDailyUses();
        var remaining = DAILY_LIMIT - uses;
        var playerLevel = cm.getLevel();

        var text = "#e#dCrystal Sage Yuki#k#n\r\n\r\n";
        text += "The mountain winds carry whispers of regret... and ";
        text += "I can reshape what was poorly forged. Your stats, your skills — ";
        text += "they need not be permanent.\r\n\r\n";
        text += "#g(Resets remaining today: " + remaining + "/" + DAILY_LIMIT + ")#k\r\n\r\n";

        if (remaining <= 0) {
            text += "#rYou have used all your resets for today. ";
            text += "Return tomorrow when the crystal has recharged.#k\r\n\r\n";
            text += "#L3#View my current stats#l";
            cm.sendSimple(text);
            return;
        }

        var apCost = getAPResetCost(playerLevel);
        var spCost = getSPResetCost();

        text += "#b#L0#Reset my AP (" + formatMeso(apCost) + " meso)#l\r\n";
        text += "#L1#Reset my SP (" + formatMeso(spCost) + " meso)#l\r\n";
        text += "#L3#View my current stats#l\r\n";
        text += "#L4#How does this work?#l#k";
        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;

        if (sel === 4) {
            // Info
            cm.sendOk(
                "#e#dCrystal Sage Yuki — How Resets Work#k#n\r\n\r\n" +
                "#eAP Reset:#n\r\n" +
                "All your base stats (STR, DEX, INT, LUK) are reset to 4.\r\n" +
                "The difference is refunded as unassigned AP.\r\n" +
                "Your level, job, equipment, and skills are unchanged.\r\n\r\n" +
                "#eSP Reset:#n\r\n" +
                "All skill points in your CURRENT job tier are reset to 0.\r\n" +
                "The SP is refunded so you can reassign them.\r\n" +
                "Skills from other job tiers are not affected.\r\n\r\n" +
                "#ePricing:#n\r\n" +
                "AP Reset: 500K (Lv1-30) | 2M (Lv31-70) | 5M (Lv71-120) | 10M (Lv121+)\r\n" +
                "SP Reset: 1M (1st job) | 2M (2nd job) | 3M (3rd job) | 5M (4th job)\r\n\r\n" +
                "#eLimit:#n " + DAILY_LIMIT + " resets per day (AP or SP combined).\r\n\r\n" +
                "#rNote: Unequip items that have stat requirements before resetting AP, " +
                "or you may lose the ability to wear them.#k"
            );
            cm.dispose();
            return;
        }

        if (sel === 3) {
            // View stats
            var p = cm.getPlayer();
            var text = "#e#dCrystal Sage Yuki — Your Stats#k#n\r\n\r\n";
            text += "#eCharacter:#n " + p.getName() + "\r\n";
            text += "#eLevel:#n " + cm.getLevel() + "\r\n";
            text += "#eJob:#n " + getJobName(p.getJob().getId()) + "\r\n\r\n";
            text += "#eCurrent Base Stats:#n\r\n";
            text += "  STR: #b" + p.getStr() + "#k\r\n";
            text += "  DEX: #b" + p.getDex() + "#k\r\n";
            text += "  INT: #b" + p.getInt() + "#k\r\n";
            text += "  LUK: #b" + p.getLuk() + "#k\r\n\r\n";
            text += "#eRemaining AP:#n #b" + p.getRemainingAp() + "#k\r\n";
            text += "#eRemaining SP:#n #b" + p.getRemainingSp() + "#k\r\n\r\n";
            text += "#eTotal AP allocated:#n " + (p.getStr() + p.getDex() + p.getInt() + p.getLuk() - 16) + " (base 4 each)\r\n\r\n";
            text += getClassRecommendation(p.getJob().getId());
            cm.sendOk(text);
            cm.dispose();
            return;
        }

        if (sel === 0) {
            // AP Reset confirmation
            var playerLevel = cm.getLevel();
            var cost = getAPResetCost(playerLevel);
            var p = cm.getPlayer();
            var totalAP = (p.getStr() + p.getDex() + p.getInt() + p.getLuk()) - 16;

            if (cm.getMeso() < cost) {
                cm.sendOk(
                    "#e#dCrystal Sage Yuki#k#n\r\n\r\n" +
                    "The crystal's power requires payment.\r\n\r\n" +
                    "#eRequired:#n " + formatMeso(cost) + " meso\r\n" +
                    "#eYou have:#n " + formatMeso(cm.getMeso()) + " meso"
                );
                cm.dispose();
                return;
            }

            cm.sendYesNo(
                "#e#dCrystal Sage Yuki — AP Reset#k#n\r\n\r\n" +
                "#r=== AP RESET CONFIRMATION ===#k\r\n\r\n" +
                "Your stats will be reset to:\r\n" +
                "  STR: 4 | DEX: 4 | INT: 4 | LUK: 4\r\n\r\n" +
                "You will receive #b" + totalAP + " unassigned AP#k to redistribute.\r\n\r\n" +
                "Cost: #r" + formatMeso(cost) + " meso#k\r\n\r\n" +
                "#rWARNING: Unequip gear with stat requirements first!#k\r\n\r\n" +
                "Proceed with AP reset?"
            );

        } else if (sel === 1) {
            // SP Reset confirmation
            var cost = getSPResetCost();
            var p = cm.getPlayer();

            if (cm.getMeso() < cost) {
                cm.sendOk(
                    "#e#dCrystal Sage Yuki#k#n\r\n\r\n" +
                    "The crystal's power requires payment.\r\n\r\n" +
                    "#eRequired:#n " + formatMeso(cost) + " meso\r\n" +
                    "#eYou have:#n " + formatMeso(cm.getMeso()) + " meso"
                );
                cm.dispose();
                return;
            }

            var jobId = p.getJob().getId();
            var jobName = getJobName(jobId);

            cm.sendYesNo(
                "#e#dCrystal Sage Yuki — SP Reset#k#n\r\n\r\n" +
                "#r=== SP RESET CONFIRMATION ===#k\r\n\r\n" +
                "All skill points for your current job (#b" + jobName + "#k) will be reset.\r\n\r\n" +
                "Your SP will be refunded so you can reassign them.\r\n" +
                "Skills from other job tiers are NOT affected.\r\n\r\n" +
                "Cost: #r" + formatMeso(cost) + " meso#k\r\n\r\n" +
                "Proceed with SP reset?"
            );
        }

    } else if (status === 2) {
        // Execute the reset
        var uses = getDailyUses();
        if (uses >= DAILY_LIMIT) {
            cm.sendOk("Daily limit reached. Come back tomorrow.");
            cm.dispose();
            return;
        }

        if (sel === 0) {
            // Execute AP Reset
            var cost = getAPResetCost(cm.getLevel());
            if (cm.getMeso() < cost) {
                cm.sendOk("Not enough meso!");
                cm.dispose();
                return;
            }

            cm.gainMeso(-cost);

            var p = cm.getPlayer();
            var totalAP = (p.getStr() + p.getDex() + p.getInt() + p.getLuk()) - 16;

            // assignStrDexIntLuk handles AP refund internally:
            // negative deltas free AP, so remainingAp += abs(deltas)
            p.assignStrDexIntLuk(4 - p.getStr(), 4 - p.getDex(), 4 - p.getInt(), 4 - p.getLuk());

            incrementDailyUses();

            cm.sendOk(
                "#e#dCrystal Sage Yuki#k#n\r\n\r\n" +
                "#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n" +
                "The crystal pulses with light... your body feels renewed.\r\n\r\n" +
                "#e=== AP RESET COMPLETE ===#n\r\n\r\n" +
                "Your stats have been reset to base (4/4/4/4).\r\n" +
                "You received #b" + totalAP + " unassigned AP#k.\r\n\r\n" +
                "Open your stat window (S) to redistribute your points wisely!"
            );
            cm.dispose();

        } else if (sel === 1) {
            // Execute SP Reset
            var cost = getSPResetCost();
            if (cm.getMeso() < cost) {
                cm.sendOk("Not enough meso!");
                cm.dispose();
                return;
            }

            cm.gainMeso(-cost);

            var p = cm.getPlayer();
            var jobId = p.getJob().getId();
            var totalSP = resetCurrentJobSP(p, jobId);

            incrementDailyUses();

            cm.sendOk(
                "#e#dCrystal Sage Yuki#k#n\r\n\r\n" +
                "#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n" +
                "The crystal hums... your knowledge reorganizes itself.\r\n\r\n" +
                "#e=== SP RESET COMPLETE ===#n\r\n\r\n" +
                "All skills for #b" + getJobName(jobId) + "#k have been reset.\r\n" +
                "You received #b" + totalSP + " unassigned SP#k.\r\n\r\n" +
                "Open your skill window (K) to reassign your skills!"
            );
            cm.dispose();
        }
    } else {
        cm.dispose();
    }
}

function resetCurrentJobSP(player, jobId) {
    // Iterate all player skills, filter by current job, reset each
    var SkillFactory = Java.type('client.SkillFactory');
    var totalSP = 0;

    // player.getSkills() returns Map<Skill, SkillEntry>
    var skillMap = player.getSkills();
    var entries = skillMap.entrySet().toArray();

    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var skill = entry.getKey();
        var skillEntry = entry.getValue();
        var skillId = skill.getId();

        // Skill IDs encode job: skillId / 10000 == jobId
        // e.g., skill 1111008 belongs to job 111
        var skillJobId = Math.floor(skillId / 10000);
        if (skillJobId !== jobId) continue;

        var currentLevel = skillEntry.skillevel;
        if (currentLevel > 0) {
            totalSP += currentLevel;
            // changeSkillLevel(Skill, byte level, int masterlevel, long expiration)
            player.changeSkillLevel(skill, 0, skillEntry.masterlevel, -1);
        }
    }

    // Refund SP
    if (totalSP > 0) {
        var currentSP = player.getRemainingSp();
        player.setRemainingSp(currentSP + totalSP);
        player.updateSingleStat(MapleStat.AVAILABLESP, player.getRemainingSp());
    }

    return totalSP;
}

function getAPResetCost(level) {
    if (level <= 30) return 500000;
    if (level <= 70) return 2000000;
    if (level <= 120) return 5000000;
    return 10000000;
}

function getSPResetCost() {
    var jobId = cm.getPlayer().getJob().getId();
    var jobTier = getJobTier(jobId);
    if (jobTier <= 1) return 1000000;
    if (jobTier === 2) return 2000000;
    if (jobTier === 3) return 3000000;
    return 5000000;
}

function getJobTier(jobId) {
    if (jobId === 0) return 0; // Beginner
    if (jobId % 100 === 0) return 1; // 1st job (100, 200, 300, etc.)
    if (jobId % 10 === 0) return 2; // 2nd job (110, 120, 210, etc.)
    if (jobId % 10 === 1) return 3; // 3rd job (111, 121, 211, etc.)
    if (jobId % 10 === 2) return 4; // 4th job (112, 122, 212, etc.)
    return 1;
}

function getJobName(jobId) {
    var names = {
        0: "Beginner",
        100: "Warrior", 110: "Fighter", 111: "Crusader", 112: "Hero",
        120: "Page", 121: "White Knight", 122: "Paladin",
        130: "Spearman", 131: "Dragon Knight", 132: "Dark Knight",
        200: "Magician", 210: "F/P Wizard", 211: "F/P Mage", 212: "F/P Archmage",
        220: "I/L Wizard", 221: "I/L Mage", 222: "I/L Archmage",
        230: "Cleric", 231: "Priest", 232: "Bishop",
        300: "Bowman", 310: "Hunter", 311: "Ranger", 312: "Bowmaster",
        320: "Crossbowman", 321: "Sniper", 322: "Marksman",
        400: "Thief", 410: "Assassin", 411: "Hermit", 412: "Night Lord",
        420: "Bandit", 421: "Chief Bandit", 422: "Shadower",
        500: "Pirate", 510: "Brawler", 511: "Marauder", 512: "Buccaneer",
        520: "Gunslinger", 521: "Outlaw", 522: "Corsair",
        600: "Sage", 610: "Elementalist", 611: "Arcanum", 612: "Archsage",
        700: "Necromancer", 710: "Dark Acolyte", 711: "Soul Reaper", 712: "Lich King",
        2000: "Aran", 2100: "Aran 2nd", 2110: "Aran 3rd", 2111: "Aran 3rd+", 2112: "Aran 4th"
    };
    return names[jobId] || "Adventurer (Job " + jobId + ")";
}

function getClassRecommendation(jobId) {
    var base = Math.floor(jobId / 100) * 100;
    var recs = {
        100: "#eWarrior Build:#n STR primary, DEX secondary (for accuracy)\r\nTypical: STR = Level*5, DEX = Level*2, rest into STR",
        200: "#eMage Build:#n INT primary, LUK secondary (for equips)\r\nTypical: INT = everything, LUK = Level+3 (or minimum for gear)",
        300: "#eBowman Build:#n DEX primary, STR secondary (for equips)\r\nTypical: DEX = everything, STR = minimum for gear",
        400: "#eThief Build:#n LUK primary, DEX secondary\r\nTypical: LUK = everything, DEX = minimum for gear, STR = minimum",
        500: "#ePirate Build:#n STR primary (Brawler) or DEX primary (Gunslinger)\r\nBrawler: STR = everything | Gunslinger: DEX = everything",
        600: "#eSage Build:#n INT primary, LUK secondary\r\nTypical: INT = everything, LUK = minimum for gear",
        700: "#eNecromancer Build:#n INT primary, LUK secondary\r\nTypical: INT = everything, LUK = minimum for gear"
    };
    return recs[base] || "#eTip:#n Allocate AP based on your class's primary stat.";
}

function getDailyUses() {
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

function incrementDailyUses() {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        var today = getDateString();
        var uses = getDailyUses() + 1;
        rec.setCustomData(today + ":" + uses);
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
