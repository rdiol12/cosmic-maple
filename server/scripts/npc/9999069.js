/**
 * NPC: Elder Chronos (9999069)
 * Location: Leafre (240000000)
 * Type: Rebirth/Prestige System — endgame replay mechanic
 *
 * When a player reaches Level 200, they can "rebirth" back to Level 1
 * with permanent bonuses that persist across rebirths.
 *
 * Rebirth Bonuses (cumulative per rebirth):
 *   +5 to all stats (STR/DEX/INT/LUK)
 *   +500 HP/MP
 *   Rebirth count shown to other players
 *
 * Cost: 10,000,000 meso per rebirth (massive meso sink)
 * Requirement: Level 200 (max level)
 *
 * Tracks rebirth count and total bonus stats via quest custom data.
 * Format in quest 99213: "rebirths:totalStatBonus:totalHPBonus"
 *
 * Max rebirths: 10 (prevents infinite scaling)
 * At max rebirths, player has +50 all stats, +5000 HP/MP — powerful but not broken.
 *
 * The NPC also shows rebirth leaderboard info and current bonuses.
 */

var status = -1;
var sel = -1;
var QUEST_ID = 99213;
var REBIRTH_COST = 10000000;
var MAX_REBIRTHS = 10;
var STAT_PER_REBIRTH = 5;
var HP_MP_PER_REBIRTH = 500;
var REQUIRED_LEVEL = 200;

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
        var data = parseRebirthData();
        var rebirths = data.rebirths;
        var totalStatBonus = data.totalStatBonus;
        var totalHPBonus = data.totalHPBonus;

        var text = "#e#dElder Chronos#k#n\r\n\r\n";
        text += "I am Chronos, keeper of the Temporal Cycle. I have witnessed ";
        text += "a thousand lifetimes, and I can offer you the chance to live yours again... ";
        text += "but #rstronger#k.\r\n\r\n";

        if (rebirths > 0) {
            text += "#e[Rebirth Count: " + rebirths + "/" + MAX_REBIRTHS + "]#n\r\n";
            text += "#bCurrent Bonuses:#k STR/DEX/INT/LUK +" + totalStatBonus + ", HP/MP +" + totalHPBonus + "\r\n";
            text += getRankTitle(rebirths) + "\r\n\r\n";
        } else {
            text += "#d[No rebirths yet]#k\r\n\r\n";
        }

        text += "#b#L0#Rebirth! (Lv200 required, " + formatMeso(REBIRTH_COST) + " meso)#l\r\n";
        text += "#L1#View my rebirth status#l\r\n";
        text += "#L2#What is rebirth?#l\r\n";
        text += "#L3#Rebirth rewards table#l#k";
        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;

        if (sel === 2) {
            // Info about rebirth system
            cm.sendOk(
                "#e#dElder Chronos — The Rebirth System#k#n\r\n\r\n" +
                "#eWhat is Rebirth?#n\r\n" +
                "When you reach Level 200, you can choose to start over at Level 1. " +
                "But this isn't a simple reset — you carry #rpermanent bonuses#k " +
                "into your next life.\r\n\r\n" +
                "#eHow it works:#n\r\n" +
                "  1. Reach Level 200\r\n" +
                "  2. Pay " + formatMeso(REBIRTH_COST) + " meso\r\n" +
                "  3. Your level resets to 1 (you keep your job and skills)\r\n" +
                "  4. You gain permanent stat bonuses\r\n" +
                "  5. Your rebirth count increases\r\n\r\n" +
                "#ePer Rebirth Bonus:#n\r\n" +
                "  - #b+" + STAT_PER_REBIRTH + " to ALL stats#k (STR, DEX, INT, LUK)\r\n" +
                "  - #b+" + HP_MP_PER_REBIRTH + " to Max HP and Max MP#k\r\n" +
                "  - Exclusive title based on rebirth count\r\n\r\n" +
                "#eMax Rebirths:#n " + MAX_REBIRTHS + "\r\n" +
                "#eMax Bonus:#n +" + (MAX_REBIRTHS * STAT_PER_REBIRTH) + " all stats, +" + (MAX_REBIRTHS * HP_MP_PER_REBIRTH) + " HP/MP\r\n\r\n" +
                "#rNote: Your equipment, inventory, meso (minus the fee), " +
                "and skills are all preserved. Only your level resets.#k"
            );
            cm.dispose();
            return;
        }

        if (sel === 1) {
            // View status
            var data = parseRebirthData();
            var rebirths = data.rebirths;
            var totalStatBonus = data.totalStatBonus;
            var totalHPBonus = data.totalHPBonus;

            var text = "#e#dElder Chronos — Your Rebirth Status#k#n\r\n\r\n";
            text += "#eCharacter:#n " + cm.getPlayer().getName() + "\r\n";
            text += "#eLevel:#n " + cm.getLevel() + "\r\n";
            text += "#eRebirths:#n " + rebirths + "/" + MAX_REBIRTHS + "\r\n\r\n";

            if (rebirths > 0) {
                text += "#ePermanent Bonuses:#n\r\n";
                text += "  STR: #b+" + totalStatBonus + "#k\r\n";
                text += "  DEX: #b+" + totalStatBonus + "#k\r\n";
                text += "  INT: #b+" + totalStatBonus + "#k\r\n";
                text += "  LUK: #b+" + totalStatBonus + "#k\r\n";
                text += "  Max HP: #b+" + totalHPBonus + "#k\r\n";
                text += "  Max MP: #b+" + totalHPBonus + "#k\r\n\r\n";
                text += "#eTitle:#n " + getRankTitle(rebirths) + "\r\n\r\n";
            }

            if (rebirths < MAX_REBIRTHS) {
                var nextBonus = (rebirths + 1) * STAT_PER_REBIRTH;
                var nextHP = (rebirths + 1) * HP_MP_PER_REBIRTH;
                text += "#eNext Rebirth:#n\r\n";
                text += "  Requirement: Level 200\r\n";
                text += "  Cost: " + formatMeso(REBIRTH_COST) + " meso\r\n";
                text += "  New total bonus: +" + nextBonus + " all stats, +" + nextHP + " HP/MP\r\n";
                text += "  New title: " + getRankTitle(rebirths + 1);
            } else {
                text += "#r[MAX REBIRTHS ACHIEVED]#k\r\n";
                text += "You have transcended all mortal limits!";
            }

            cm.sendOk(text);
            cm.dispose();
            return;
        }

        if (sel === 3) {
            // Rewards table
            var text = "#e#dRebirth Rewards Table#k#n\r\n\r\n";
            for (var i = 1; i <= MAX_REBIRTHS; i++) {
                var stats = i * STAT_PER_REBIRTH;
                var hp = i * HP_MP_PER_REBIRTH;
                var title = getRankTitle(i);
                text += "#eRebirth " + i + "#n: +" + stats + " all stats, +" + hp + " HP/MP — " + title + "\r\n";
            }
            text += "\r\n#dEach rebirth costs " + formatMeso(REBIRTH_COST) + " meso and requires Level 200.#k";
            cm.sendOk(text);
            cm.dispose();
            return;
        }

        // sel === 0: Attempt rebirth
        var data = parseRebirthData();
        var rebirths = data.rebirths;

        if (rebirths >= MAX_REBIRTHS) {
            cm.sendOk(
                "#e#dElder Chronos#k#n\r\n\r\n" +
                "You have already completed #r" + MAX_REBIRTHS + " rebirths#k — " +
                "the maximum the Temporal Cycle allows.\r\n\r\n" +
                "You have transcended beyond what I can offer. Go forth, " +
                getRankTitle(MAX_REBIRTHS) + "!"
            );
            cm.dispose();
            return;
        }

        if (cm.getLevel() < REQUIRED_LEVEL) {
            cm.sendOk(
                "#e#dElder Chronos#k#n\r\n\r\n" +
                "The Temporal Cycle demands perfection. You must reach " +
                "#bLevel " + REQUIRED_LEVEL + "#k before you can be reborn.\r\n\r\n" +
                "Your current level: #r" + cm.getLevel() + "#k\r\n" +
                "Levels remaining: #r" + (REQUIRED_LEVEL - cm.getLevel()) + "#k\r\n\r\n" +
                "Return when you have mastered this life."
            );
            cm.dispose();
            return;
        }

        if (cm.getMeso() < REBIRTH_COST) {
            cm.sendOk(
                "#e#dElder Chronos#k#n\r\n\r\n" +
                "The Temporal Cycle requires a tribute of #r" + formatMeso(REBIRTH_COST) + " mesos#k.\r\n" +
                "You have: #r" + formatMeso(cm.getMeso()) + "#k\r\n\r\n" +
                "Gather more wealth and return."
            );
            cm.dispose();
            return;
        }

        var newRebirths = rebirths + 1;
        var newStatBonus = newRebirths * STAT_PER_REBIRTH;
        var newHPBonus = newRebirths * HP_MP_PER_REBIRTH;

        cm.sendYesNo(
            "#e#dElder Chronos#k#n\r\n\r\n" +
            "#r=== REBIRTH CONFIRMATION ===#k\r\n\r\n" +
            "This will reset your level to #r1#k!\r\n\r\n" +
            "#eWhat you KEEP:#n\r\n" +
            "  - Your job and skills\r\n" +
            "  - Your equipment and inventory\r\n" +
            "  - Your meso (minus " + formatMeso(REBIRTH_COST) + " fee)\r\n" +
            "  - Your quest progress\r\n\r\n" +
            "#eWhat you GAIN:#n\r\n" +
            "  - Permanent +" + newStatBonus + " to ALL stats\r\n" +
            "  - Permanent +" + newHPBonus + " to Max HP/MP\r\n" +
            "  - Title: " + getRankTitle(newRebirths) + "\r\n" +
            "  - Rebirth " + newRebirths + "/" + MAX_REBIRTHS + "\r\n\r\n" +
            "#eWhat changes:#n\r\n" +
            "  - Level reset to 1\r\n" +
            "  - Cost: " + formatMeso(REBIRTH_COST) + " meso\r\n\r\n" +
            "#rAre you sure you want to be reborn?#k"
        );

    } else if (status === 2) {
        // Execute rebirth
        var data = parseRebirthData();
        var rebirths = data.rebirths;

        // Final safety checks
        if (rebirths >= MAX_REBIRTHS || cm.getLevel() < REQUIRED_LEVEL || cm.getMeso() < REBIRTH_COST) {
            cm.sendOk("Something went wrong. Please try again.");
            cm.dispose();
            return;
        }

        var newRebirths = rebirths + 1;
        var newStatBonus = newRebirths * STAT_PER_REBIRTH;
        var newHPBonus = newRebirths * HP_MP_PER_REBIRTH;

        // Deduct cost
        cm.gainMeso(-REBIRTH_COST);

        var MapleStat = Java.type('client.Stat');
        var p = cm.getPlayer();

        // Apply permanent stat bonuses via assignStrDexIntLuk (delta-based, safe)
        p.assignStrDexIntLuk(STAT_PER_REBIRTH, STAT_PER_REBIRTH, STAT_PER_REBIRTH, STAT_PER_REBIRTH);

        // Apply permanent HP/MP bonus (+500 per rebirth)
        // updateMaxHpMaxMp handles both internal state and client sync
        var newMaxHp = p.getMaxHp() + HP_MP_PER_REBIRTH;
        var newMaxMp = p.getMaxMp() + HP_MP_PER_REBIRTH;
        p.updateMaxHpMaxMp(newMaxHp, newMaxMp);

        // Reset level to 1 and sync to client
        p.setLevel(1);
        p.setExp(0);
        p.updateSingleStat(MapleStat.LEVEL, 1);
        p.updateSingleStat(MapleStat.EXP, 0);

        // Heal to full after HP/MP pool has been updated
        p.setHp(p.getMaxHp());
        p.setMp(p.getMaxMp());
        p.updateSingleStat(MapleStat.HP, p.getHp());
        p.updateSingleStat(MapleStat.MP, p.getMp());

        // Save rebirth data
        saveRebirthData(newRebirths, newStatBonus, newHPBonus);

        // Announce to map
        cm.playerMessage(6, "[Rebirth] " + cm.getPlayer().getName() + " has achieved Rebirth " + newRebirths + "!");

        var text = "#e#dElder Chronos#k#n\r\n\r\n";
        text += "#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n";
        text += "The flow of time bends around you...\r\n";
        text += "Your body glows with #rancient power#k...\r\n";
        text += "You feel your memories crystallize into raw strength!\r\n\r\n";
        text += "#e=== REBIRTH " + newRebirths + " COMPLETE ===#n\r\n\r\n";
        text += "#ePermanent Bonuses:#n\r\n";
        text += "  All Stats: #b+" + newStatBonus + "#k\r\n";
        text += "  Max HP/MP: #b+" + newHPBonus + "#k\r\n";
        text += "  Title: " + getRankTitle(newRebirths) + "\r\n\r\n";
        text += "#bYour level has been reset to 1. Your journey begins anew — but you are stronger than before.#k\r\n\r\n";

        if (newRebirths < MAX_REBIRTHS) {
            text += "Reach Level 200 again to earn your next rebirth!";
        } else {
            text += "#r[FINAL REBIRTH ACHIEVED] You have transcended mortal limits!#k";
        }

        cm.sendOk(text);
        cm.dispose();
    } else {
        cm.dispose();
    }
}

function parseRebirthData() {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        var raw = rec.getCustomData();
        if (raw === null || raw === "") return { rebirths: 0, totalStatBonus: 0, totalHPBonus: 0 };
        var parts = raw.split(":");
        return {
            rebirths: parseInt(parts[0]) || 0,
            totalStatBonus: parseInt(parts[1]) || 0,
            totalHPBonus: parseInt(parts[2]) || 0
        };
    } catch(e) {
        return { rebirths: 0, totalStatBonus: 0, totalHPBonus: 0 };
    }
}

function saveRebirthData(rebirths, statBonus, hpBonus) {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        rec.setCustomData(rebirths + ":" + statBonus + ":" + hpBonus);
    } catch(e) {}
}

function getRankTitle(rebirths) {
    var titles = {
        1: "#g[Reborn]#k",
        2: "#g[Twice-Born]#k",
        3: "#b[Thrice-Born]#k",
        4: "#b[Cycle Walker]#k",
        5: "#d[Temporal Adept]#k",
        6: "#d[Chrono Knight]#k",
        7: "#r[Time Lord]#k",
        8: "#r[Eternal Wanderer]#k",
        9: "#r[Immortal Sage]#k",
        10: "#e#r[Transcendent]#k#n"
    };
    return titles[rebirths] || "#d[Unknown]#k";
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
