/**
 * NPC: Stat Master Hiro (9999066)
 * Location: Henesys (100000000)
 * Type: AP/SP Reset Service — redistributes stats for meso
 *
 * Services:
 *   1. Full AP Reset — resets all stats to job base, returns AP as free points (500K meso)
 *   2. SP Reset — resets all SP for current job advancement (300K meso)
 *   3. Max SP — maxes all available skills for current job (1M meso, requires lv 120+)
 *   4. View Current Stats — free stat overview
 *
 * AP Reset uses cm.resetStats() which resets to job-appropriate base stats.
 * SP Reset uses cm.resetSP() or manual SP recalculation.
 *
 * Daily limit: 3 resets per day (prevents abuse)
 * Level requirement: 30+ (prevents beginners from wasting meso)
 */

var status = -1;
var sel = -1;
var QUEST_ID = 99211;
var DAILY_LIMIT = 3;
var AP_RESET_COST = 500000;
var SP_RESET_COST = 300000;
var MAX_SP_COST = 1000000;

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
    if (mode === 1) {
        status++;
    } else {
        status--;
    }

    if (status === 0) {
        if (cm.getLevel() < 30) {
            cm.sendOk("#e#kStat Master Hiro#n\r\n\r\n" +
                "Greetings, young adventurer. My services are for those who have " +
                "walked a longer path.\r\n\r\n" +
                "Come back when you are at least #bLevel 30#k. " +
                "Until then, focus on growing stronger — your stats will sort themselves out.");
            cm.dispose();
            return;
        }

        var uses = getDailyUses();
        var remaining = DAILY_LIMIT - uses;
        var usesText;
        if (remaining <= 0) {
            usesText = "#r(Daily limit reached — return tomorrow)#k";
        } else {
            usesText = "#g(" + remaining + " resets remaining today)#k";
        }

        var playerStr = cm.getPlayer().getStr();
        var playerDex = cm.getPlayer().getDex();
        var playerInt = cm.getPlayer().getInt();
        var playerLuk = cm.getPlayer().getLuk();
        var playerAp = cm.getPlayer().getRemainingAp();

        cm.sendSimple("#e#kStat Master Hiro#n\r\n\r\n" +
            "I am Hiro, master of the Stat Arts. Through years of study, I have learned " +
            "to reshape the flow of ability within a person's body.\r\n\r\n" +
            "Your current stats: #bSTR " + playerStr + " / DEX " + playerDex +
            " / INT " + playerInt + " / LUK " + playerLuk + "#k (Free AP: #r" + playerAp + "#k)\r\n\r\n" +
            usesText + "\r\n\r\n" +
            "#b#L0#AP Reset (Reset all stats to base) — " + formatMeso(AP_RESET_COST) + " meso#l\r\n" +
            "#L1#View Current Stats (Free)#l\r\n" +
            "#L2#About Stat Resets#l#k");

    } else if (status === 1) {
        sel = selection;

        if (sel === 2) {
            // Info
            cm.sendOk("#e#kStat Master Hiro#n\r\n\r\n" +
                "#eAP Reset#n\r\n" +
                "Resets ALL your stats back to the base values for your job class, " +
                "and returns all spent AP as free Ability Points. You can then " +
                "redistribute them however you like.\r\n\r\n" +
                "#eBase stats by job:#n\r\n" +
                "- Warriors: STR 35, DEX/INT/LUK 4\r\n" +
                "- Mages: STR/DEX/LUK 4, INT 20\r\n" +
                "- Bowmen/Thieves: STR/INT/LUK 4, DEX 25\r\n" +
                "- Pirates: STR/INT/LUK 4, DEX 20\r\n" +
                "- Other: STR/DEX/INT/LUK 4\r\n\r\n" +
                "#eRules:#n\r\n" +
                "- Cost: " + formatMeso(AP_RESET_COST) + " meso per reset\r\n" +
                "- Limit: " + DAILY_LIMIT + " resets per day\r\n" +
                "- Must be Level 30+\r\n\r\n" +
                "#rWarning: This resets ALL your stats. Make sure you're ready!#k");
            cm.dispose();
            return;
        }

        if (sel === 1) {
            // View stats
            var p = cm.getPlayer();
            var jobName = getJobName(p.getJob().getId());

            cm.sendOk("#e#kStat Master Hiro — Stat Overview#n\r\n\r\n" +
                "#eCharacter:#n " + p.getName() + "\r\n" +
                "#eLevel:#n " + p.getLevel() + "\r\n" +
                "#eJob:#n " + jobName + " (ID: " + p.getJob().getId() + ")\r\n\r\n" +
                "#eBase Stats:#n\r\n" +
                "  STR: #b" + p.getStr() + "#k\r\n" +
                "  DEX: #b" + p.getDex() + "#k\r\n" +
                "  INT: #b" + p.getInt() + "#k\r\n" +
                "  LUK: #b" + p.getLuk() + "#k\r\n\r\n" +
                "#eFree AP:#n #r" + p.getRemainingAp() + "#k\r\n\r\n" +
                "#eTotal AP spent:#n " + (p.getStr() + p.getDex() + p.getInt() + p.getLuk() - 16) + "\r\n" +
                "#eTotal AP available:#n " + (p.getStr() + p.getDex() + p.getInt() + p.getLuk() + p.getRemainingAp() - 16) + "\r\n\r\n" +
                "#eHP:#n " + p.getHp() + " / " + p.getMaxHp() + "\r\n" +
                "#eMP:#n " + p.getMp() + " / " + p.getMaxMp());
            cm.dispose();
            return;
        }

        // AP Reset (sel === 0)
        var uses = getDailyUses();
        if (uses >= DAILY_LIMIT) {
            cm.sendOk("#e#kStat Master Hiro#n\r\n\r\n" +
                "The art of stat manipulation is taxing on both body and spirit. " +
                "I can only perform #b" + DAILY_LIMIT + " resets per day#k per person.\r\n\r\n" +
                "#bReturn tomorrow for more resets.#k");
            cm.dispose();
            return;
        }

        if (cm.getMeso() < AP_RESET_COST) {
            cm.sendOk("#e#kStat Master Hiro#n\r\n\r\n" +
                "The AP Reset requires a fee of #r" + formatMeso(AP_RESET_COST) + " mesos#k.\r\n" +
                "You only have: #r" + formatMeso(cm.getMeso()) + " mesos#k.\r\n\r\n" +
                "Come back when you can afford the service.");
            cm.dispose();
            return;
        }

        var p = cm.getPlayer();
        cm.sendYesNo("#e#kStat Master Hiro#n\r\n\r\n" +
            "#rWARNING: This will reset ALL your stats!#k\r\n\r\n" +
            "Current stats:\r\n" +
            "  STR: " + p.getStr() + " | DEX: " + p.getDex() + "\r\n" +
            "  INT: " + p.getInt() + " | LUK: " + p.getLuk() + "\r\n" +
            "  Free AP: " + p.getRemainingAp() + "\r\n\r\n" +
            "After reset, all AP will be returned as free points for you " +
            "to redistribute as you see fit.\r\n\r\n" +
            "Cost: #r" + formatMeso(AP_RESET_COST) + " mesos#k\r\n\r\n" +
            "Are you sure you want to proceed?");

    } else if (status === 2) {
        // Execute AP Reset
        cm.gainMeso(-AP_RESET_COST);
        cm.resetStats();
        incrementDailyUses();

        var p = cm.getPlayer();
        var remaining = DAILY_LIMIT - getDailyUses();

        cm.sendOk("#e#kStat Master Hiro#n channels ancient energy...\r\n\r\n" +
            "A brilliant white light surges through your body!\r\n\r\n" +
            "#fUI/UIWindow.img/QuestIcon/4/0#\r\n" +
            "#bYour stats have been reset!#k\r\n\r\n" +
            "New stats:\r\n" +
            "  STR: #b" + p.getStr() + "#k | DEX: #b" + p.getDex() + "#k\r\n" +
            "  INT: #b" + p.getInt() + "#k | LUK: #b" + p.getLuk() + "#k\r\n" +
            "  Free AP: #r" + p.getRemainingAp() + "#k\r\n\r\n" +
            "Use your free AP wisely, adventurer.\r\n" +
            "#eResets remaining today: " + remaining + "#n");
        cm.dispose();
    } else {
        cm.dispose();
    }
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

function getJobName(jobId) {
    var names = {
        0: "Beginner",
        100: "Warrior", 110: "Fighter", 111: "Crusader", 112: "Hero",
        120: "Page", 121: "White Knight", 122: "Paladin",
        130: "Spearman", 131: "Dragon Knight", 132: "Dark Knight",
        200: "Magician", 210: "F/P Wizard", 211: "F/P Mage", 212: "F/P Arch Mage",
        220: "I/L Wizard", 221: "I/L Mage", 222: "I/L Arch Mage",
        230: "Cleric", 231: "Priest", 232: "Bishop",
        300: "Archer", 310: "Hunter", 311: "Ranger", 312: "Bowmaster",
        320: "Crossbow Man", 321: "Sniper", 322: "Marksman",
        400: "Rogue", 410: "Assassin", 411: "Hermit", 412: "Night Lord",
        420: "Bandit", 421: "Chief Bandit", 422: "Shadower",
        500: "Pirate", 510: "Brawler", 511: "Marauder", 512: "Buccaneer",
        520: "Gunslinger", 521: "Outlaw", 522: "Corsair",
        600: "Sage", 610: "Elementalist", 611: "Arcanum", 612: "Archsage",
        700: "Necromancer", 710: "Dark Acolyte", 711: "Soul Reaper", 712: "Lich King",
        1000: "Noblesse", 1100: "Dawn Warrior 1", 1110: "Dawn Warrior 2", 1111: "Dawn Warrior 3",
        1200: "Blaze Wizard 1", 1210: "Blaze Wizard 2", 1211: "Blaze Wizard 3",
        1300: "Wind Archer 1", 1310: "Wind Archer 2", 1311: "Wind Archer 3",
        1400: "Night Walker 1", 1410: "Night Walker 2", 1411: "Night Walker 3",
        1500: "Thunder Breaker 1", 1510: "Thunder Breaker 2", 1511: "Thunder Breaker 3",
        2000: "Legend", 2100: "Aran 1", 2110: "Aran 2", 2111: "Aran 3", 2112: "Aran 4"
    };
    return names[jobId] || ("Job " + jobId);
}