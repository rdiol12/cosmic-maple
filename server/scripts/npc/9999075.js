/**
 * NPC: Milestone Maven Celeste (9999075)
 * Location: Henesys (100000000)
 * Type: Level Milestone Rewards - one-time reward packages at key levels
 *
 * Every time a player reaches a milestone level (10, 20, 30, ..., 200),
 * they can claim a one-time reward package with potions, meso, EXP, and items.
 * Rewards scale with level. Past milestones can be claimed retroactively.
 *
 * Tracking: Quest 99219 custom data stores claimed milestones as comma-separated list.
 *   Format: "10,20,30,..." - each number is a claimed milestone level.
 */

var status = -1;
var sel = -1;
var QUEST_ID = 99219;

// Milestone definitions: [level, title, desc, [[itemId, qty, name], ...], meso, exp]
var MILESTONES = [
    [10, "First Steps", "You have taken your first steps as an adventurer!",
        [[2000002, 100, "White Potion"], [2000003, 50, "Blue Potion"]], 10000, 5000],
    [20, "Rising Adventurer", "Your name is starting to be known in the towns.",
        [[2000002, 200, "White Potion"], [2000006, 50, "Mana Elixir"], [2030000, 20, "Return Scroll"]], 30000, 15000],
    [30, "Proven Warrior", "You have proven yourself in battle.",
        [[2000004, 50, "Elixir"], [2000006, 100, "Mana Elixir"], [2002017, 10, "Warrior Elixir"]], 80000, 40000],
    [40, "Seasoned Fighter", "Monsters tremble at your approach.",
        [[2000004, 100, "Elixir"], [2000006, 150, "Mana Elixir"]], 150000, 80000],
    [50, "Half-Century Hero", "Fifty levels of growth!",
        [[2000005, 50, "Power Elixir"], [2000006, 200, "Mana Elixir"], [2002017, 20, "Warrior Elixir"]], 300000, 150000],
    [60, "Dungeon Delver", "You have braved dangerous dungeons.",
        [[2000005, 80, "Power Elixir"], [2002017, 30, "Warrior Elixir"]], 500000, 250000],
    [70, "Elite Challenger", "Only the strongest reach this plateau.",
        [[2000005, 100, "Power Elixir"], [2049100, 1, "Chaos Scroll 60%"]], 800000, 400000],
    [80, "Master Combatant", "Your mastery of combat is undeniable.",
        [[2000005, 150, "Power Elixir"], [2049100, 2, "Chaos Scroll 60%"]], 1200000, 600000],
    [90, "Legend in the Making", "Stories of your deeds spread far and wide.",
        [[2000005, 200, "Power Elixir"], [2049003, 1, "Clean Slate Scroll 10%"]], 1800000, 900000],
    [100, "Centurion", "One hundred levels! You stand among the elite.",
        [[2000005, 300, "Power Elixir"], [2340000, 1, "White Scroll"], [2049100, 3, "Chaos Scroll 60%"]], 3000000, 1500000],
    [120, "Apex Predator", "4th job mastery achieved. Few can challenge you.",
        [[2000005, 500, "Power Elixir"], [2340000, 2, "White Scroll"], [2049100, 5, "Chaos Scroll 60%"]], 5000000, 3000000],
    [150, "Mythic Champion", "A living legend. Your power echoes across dimensions.",
        [[2000005, 800, "Power Elixir"], [2340000, 3, "White Scroll"], [2049003, 5, "Clean Slate 10%"]], 10000000, 5000000],
    [200, "The Transcendent", "Level 200. You have transcended mortality itself.",
        [[2000005, 999, "Power Elixir"], [2340000, 5, "White Scroll"], [2049003, 10, "Clean Slate 10%"]], 50000000, 10000000]
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
        var playerLevel = cm.getLevel();
        var claimed = getClaimedList();

        var text = "#e#dMilestone Maven Celeste#k#n\r\n\r\n";
        text += "*sparkles dance around her*\r\n\r\n";
        text += "Hello, adventurer! I keep the #bMilestone Ledger#k - a record of every hero's ";
        text += "journey. For each major level you reach, I have a special reward.\r\n\r\n";
        text += "#eYour Milestones:#n\r\n\r\n";

        var hasClaimable = false;
        for (var i = 0; i < MILESTONES.length; i++) {
            var m = MILESTONES[i];
            var lvl = m[0];
            var title = m[1];
            var isClaimed = claimed.indexOf(lvl) >= 0;
            var canClaim = playerLevel >= lvl && !isClaimed;

            if (canClaim) {
                text += "#L" + lvl + "#";
                text += "#g* Lv." + lvl + " - " + title + " [CLAIM!]#k#l\r\n";
                hasClaimable = true;
            } else if (isClaimed) {
                text += "  #dv Lv." + lvl + " - " + title + " [Claimed]#k\r\n";
            } else {
                text += "  #rx Lv." + lvl + " - " + title + " [Lv." + lvl + " required]#k\r\n";
            }
        }

        if (!hasClaimable) {
            text += "\r\n#bNo milestones to claim right now.#k Keep leveling!";
        } else {
            text += "\r\nSelect a milestone to claim your reward!";
        }

        text += "\r\n\r\n#L9999#How does this work?#l";
        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;

        if (sel === 9999) {
            cm.sendOk(
                "#e#dMilestone Rewards - How It Works#k#n\r\n\r\n" +
                "Every time you reach a milestone level (10, 20, 30, ..., 200), " +
                "you can claim a #bone-time reward package#k from me.\r\n\r\n" +
                "#eRewards include:#n\r\n" +
                "  - Healing potions and elixirs\r\n" +
                "  - Meso bonuses\r\n" +
                "  - EXP bonuses\r\n" +
                "  - Scrolls and rare items (higher levels)\r\n\r\n" +
                "#eRules:#n\r\n" +
                "  - Each milestone can only be claimed #rONCE#k per character.\r\n" +
                "  - You can claim past milestones you missed.\r\n" +
                "  - Make sure you have inventory space!\r\n\r\n" +
                "#gTip:#k Check back every 10 levels for your next reward!"
            );
            cm.dispose();
            return;
        }

        // Find the milestone
        var milestone = null;
        for (var i = 0; i < MILESTONES.length; i++) {
            if (MILESTONES[i][0] === sel) {
                milestone = MILESTONES[i];
                break;
            }
        }

        if (milestone === null) {
            cm.dispose();
            return;
        }

        var mlvl = milestone[0];
        var title = milestone[1];
        var desc = milestone[2];
        var items = milestone[3];
        var meso = milestone[4];
        var exp = milestone[5];
        var claimed = getClaimedList();

        if (cm.getLevel() < mlvl) {
            cm.sendOk("You need to reach level " + mlvl + " first!");
            cm.dispose();
            return;
        }

        if (claimed.indexOf(mlvl) >= 0) {
            cm.sendOk("You have already claimed this milestone reward!");
            cm.dispose();
            return;
        }

        // Show reward details
        var text = "#e#dMilestone: Lv." + mlvl + " - " + title + "#k#n\r\n\r\n";
        text += "#b\"" + desc + "\"#k\r\n\r\n";
        text += "#eReward Package:#n\r\n";
        for (var j = 0; j < items.length; j++) {
            text += "  #v" + items[j][0] + "# " + items[j][2] + " x" + items[j][1] + "\r\n";
        }
        text += "  " + formatMeso(meso) + " meso\r\n";
        text += "  " + formatMeso(exp) + " EXP\r\n";
        text += "\r\nClaim this milestone reward?";
        cm.sendYesNo(text);

    } else if (status === 2) {
        if (mode === 0) {
            cm.sendOk("Come back when you are ready!");
            cm.dispose();
            return;
        }

        // Find milestone again
        var milestone = null;
        for (var i = 0; i < MILESTONES.length; i++) {
            if (MILESTONES[i][0] === sel) {
                milestone = MILESTONES[i];
                break;
            }
        }
        if (milestone === null) { cm.dispose(); return; }

        var mlvl = milestone[0];
        var title = milestone[1];
        var desc = milestone[2];
        var items = milestone[3];
        var meso = milestone[4];
        var exp = milestone[5];
        var claimed = getClaimedList();

        // Double-check eligibility
        if (cm.getLevel() < mlvl || claimed.indexOf(mlvl) >= 0) {
            cm.sendOk("This milestone is not available.");
            cm.dispose();
            return;
        }

        // Check inventory space
        for (var j = 0; j < items.length; j++) {
            if (!cm.canHold(items[j][0], items[j][1])) {
                cm.sendOk("Your inventory is full! Make room for all the rewards and try again.");
                cm.dispose();
                return;
            }
        }

        // Grant rewards
        for (var j = 0; j < items.length; j++) {
            cm.gainItem(items[j][0], items[j][1]);
        }
        cm.gainMeso(meso);
        cm.gainExp(exp);

        // Mark claimed
        claimed.push(mlvl);
        saveClaimedList(claimed);

        // Announce high milestones to server
        if (mlvl >= 100) {
            cm.playerMessage(6, "[Milestone] " + cm.getPlayer().getName() + " reached the Lv." + mlvl + " milestone: " + title + "!");
        }

        var text = "#e#dMilestone Maven Celeste#k#n\r\n\r\n";
        text += "#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n";
        text += "#g=== MILESTONE CLAIMED! ===#k\r\n\r\n";
        text += "#eLv." + mlvl + " - " + title + "#n\r\n\r\n";
        text += "\"" + desc + "\"\r\n\r\n";
        text += "#eRewards received:#n\r\n";
        for (var j = 0; j < items.length; j++) {
            text += "  " + items[j][2] + " x" + items[j][1] + "\r\n";
        }
        text += "  " + formatMeso(meso) + " meso\r\n";
        text += "  " + formatMeso(exp) + " EXP\r\n\r\n";

        // Find next milestone
        var nextMilestone = null;
        for (var i = 0; i < MILESTONES.length; i++) {
            if (MILESTONES[i][0] > mlvl && claimed.indexOf(MILESTONES[i][0]) < 0) {
                nextMilestone = MILESTONES[i];
                break;
            }
        }

        if (nextMilestone !== null) {
            text += "#bNext milestone: Lv." + nextMilestone[0] + " - " + nextMilestone[1] + "#k";
        } else {
            text += "#bYou have claimed all available milestones! Truly legendary.#k";
        }

        cm.sendOk(text);
        cm.dispose();
    } else {
        cm.dispose();
    }
}

function getClaimedList() {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        var data = rec.getCustomData();
        if (data === null || data === "") return [];
        var parts = ("" + data).split(",");
        var result = [];
        for (var i = 0; i < parts.length; i++) {
            var val = parseInt(parts[i]);
            if (!isNaN(val)) result.push(val);
        }
        return result;
    } catch(e) {
        return [];
    }
}

function saveClaimedList(claimed) {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        rec.setCustomData(claimed.join(","));
    } catch(e) {}
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
