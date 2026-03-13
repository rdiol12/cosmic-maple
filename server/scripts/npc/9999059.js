/**
 * NPC: Aria the Boss Hunter (9999059)
 * Location: Leafre (240000000)
 * Purpose: Boss Essence exchange NPC — trades boss-exclusive drops for powerful rewards
 *
 * Boss Essences:
 *   4032600 - Papulatus Clockwork Core (from Papulatus)
 *   4032601 - Zakum's Molten Heart (from Zakum)
 *   4032602 - Pianus Deep Scale (from Pianus)
 *   4032603 - Horntail's Dragon Horn (from Horntail)
 */

var status;
var selectedCategory = -1;
var selectedReward = -1;

// Reward definitions: [essenceId, essenceQty, rewardItemId, rewardQty, rewardName]
var papulatusRewards = [
    [4032600, 3, 2049100, 1, "Chaos Scroll 60%"],
    [4032600, 5, 2340000, 1, "White Scroll"],
    [4032600, 2, 2002037, 20, "Cosmic Elixir x20"],
    [4032600, 8, 2290126, 1, "Maple Warrior 20 Skillbook"],
    [4032600, 1, 0, 500000, "500,000 Mesos"]
];

var zakumRewards = [
    [4032601, 3, 2049100, 2, "Chaos Scroll 60% x2"],
    [4032601, 5, 2340000, 2, "White Scroll x2"],
    [4032601, 2, 2280010, 1, "Zakum Magic Attack 30% Scroll"],
    [4032601, 7, 2280013, 1, "Zakum Weapon Attack 30% Scroll"],
    [4032601, 1, 0, 750000, "750,000 Mesos"]
];

var pianusRewards = [
    [4032602, 4, 2049100, 1, "Chaos Scroll 60%"],
    [4032602, 6, 2340000, 1, "White Scroll"],
    [4032602, 2, 2002037, 15, "Cosmic Elixir x15"],
    [4032602, 3, 2040804, 1, "Gloves for ATT 60% Scroll"],
    [4032602, 1, 0, 300000, "300,000 Mesos"]
];

var horntailRewards = [
    [4032603, 2, 2049100, 3, "Chaos Scroll 60% x3"],
    [4032603, 3, 2340000, 3, "White Scroll x3"],
    [4032603, 5, 2290129, 1, "Sharp Eyes 30 Skillbook"],
    [4032603, 1, 2044004, 1, "Topwear for STR 70% Scroll"],
    [4032603, 1, 0, 2000000, "2,000,000 Mesos"]
];

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1 || (mode == 0 && status == 0)) {
        cm.dispose();
        return;
    }
    if (mode == 0) {
        status--;
    } else {
        status++;
    }

    if (status == 0) {
        var text = "#e#kAria the Boss Hunter#n#k\r\n\r\n";
        text += "Greetings, adventurer. I've spent decades hunting the most terrifying creatures in Maple World. ";
        text += "Every scar I carry tells a story... and every #bessence#k I collect holds power beyond imagination.\r\n\r\n";
        text += "If you've faced the great bosses and claimed their essences, I can transform them into something truly valuable.\r\n\r\n";
        text += "#L0##b[Papulatus] Clockwork Core Exchange#l\r\n";
        text += "#L1#[Zakum] Molten Heart Exchange#l\r\n";
        text += "#L2#[Pianus] Deep Scale Exchange#l\r\n";
        text += "#L3#[Horntail] Dragon Horn Exchange#l\r\n";
        text += "#L4#What are Boss Essences?#l#k\r\n";
        cm.sendSimple(text);
    } else if (status == 1) {
        selectedCategory = selection;

        if (selectedCategory == 4) {
            // Info about boss essences
            var info = "#e#kBoss Essences — The Hunter's Guide#n\r\n\r\n";
            info += "The great bosses of Maple World each carry a unique essence — a fragment of their power that lingers even after death.\r\n\r\n";
            info += "#b#ePapulatus Clockwork Core#n#k\r\n";
            info += "Dropped by #rPapulatus#k in the Ludibrium Clock Tower. The gears of time itself, still ticking...\r\n\r\n";
            info += "#b#eZakum's Molten Heart#n#k\r\n";
            info += "Torn from #rZakum#k deep within El Nath's volcanic caverns. Burns with an eternal flame.\r\n\r\n";
            info += "#b#ePianus Deep Scale#n#k\r\n";
            info += "Harvested from #rPianus#k in the Aqua Road depths. Shimmers with abyssal power.\r\n\r\n";
            info += "#b#eHorntail's Dragon Horn#n#k\r\n";
            info += "The rarest of all — broken from #rHorntail#k's crown in the Cave of Life. Crackles with ancient draconic energy.\r\n\r\n";
            info += "Bring me these essences, and I'll reward you handsomely. The more powerful the boss, the greater the rewards.";
            cm.sendOk(info);
            cm.dispose();
            return;
        }

        var rewards;
        var essenceName;
        var essenceId;

        if (selectedCategory == 0) {
            rewards = papulatusRewards;
            essenceName = "Papulatus Clockwork Core";
            essenceId = 4032600;
        } else if (selectedCategory == 1) {
            rewards = zakumRewards;
            essenceName = "Zakum's Molten Heart";
            essenceId = 4032601;
        } else if (selectedCategory == 2) {
            rewards = pianusRewards;
            essenceName = "Pianus Deep Scale";
            essenceId = 4032602;
        } else if (selectedCategory == 3) {
            rewards = horntailRewards;
            essenceName = "Horntail's Dragon Horn";
            essenceId = 4032603;
        } else {
            cm.dispose();
            return;
        }

        var owned = cm.itemQuantity(essenceId);
        var text = "#e" + essenceName + " Exchange#n\r\n";
        text += "You currently have: #r" + owned + "#k " + essenceName + "(s)\r\n\r\n";
        text += "Choose a reward:\r\n\r\n";

        for (var i = 0; i < rewards.length; i++) {
            var r = rewards[i];
            text += "#L" + i + "##b" + r[4] + " (" + r[1] + " essences)#l\r\n";
        }

        cm.sendSimple(text);
    } else if (status == 2) {
        selectedReward = selection;

        var rewards;
        if (selectedCategory == 0) rewards = papulatusRewards;
        else if (selectedCategory == 1) rewards = zakumRewards;
        else if (selectedCategory == 2) rewards = pianusRewards;
        else if (selectedCategory == 3) rewards = horntailRewards;
        else { cm.dispose(); return; }

        if (selectedReward < 0 || selectedReward >= rewards.length) {
            cm.dispose();
            return;
        }

        var r = rewards[selectedReward];
        var essenceId = r[0];
        var essenceQty = r[1];
        var rewardId = r[2];
        var rewardQty = r[3];
        var rewardName = r[4];

        var text = "You want to trade #r" + essenceQty + " essences#k for #b" + rewardName + "#k?\r\n\r\n";
        text += "This exchange cannot be undone. Are you sure?";
        cm.sendYesNo(text);
    } else if (status == 3) {
        var rewards;
        if (selectedCategory == 0) rewards = papulatusRewards;
        else if (selectedCategory == 1) rewards = zakumRewards;
        else if (selectedCategory == 2) rewards = pianusRewards;
        else if (selectedCategory == 3) rewards = horntailRewards;
        else { cm.dispose(); return; }

        if (selectedReward < 0 || selectedReward >= rewards.length) {
            cm.dispose();
            return;
        }

        var r = rewards[selectedReward];
        var essenceId = r[0];
        var essenceQty = r[1];
        var rewardId = r[2];
        var rewardQty = r[3];
        var rewardName = r[4];

        // Check player has enough essences
        if (!cm.haveItem(essenceId, essenceQty)) {
            cm.sendOk("You don't have enough essences for this trade. You need #r" + essenceQty + "#k but only have #r" + cm.itemQuantity(essenceId) + "#k.\r\n\r\nKeep hunting those bosses, adventurer. The essences will come.");
            cm.dispose();
            return;
        }

        // Check inventory space
        if (rewardId > 0 && !cm.canHold(rewardId)) {
            cm.sendOk("Your inventory is full! Make some space and come back.");
            cm.dispose();
            return;
        }

        // Execute trade
        cm.gainItem(essenceId, -essenceQty);

        if (rewardId == 0) {
            // Meso reward
            cm.gainMeso(rewardQty);
        } else {
            cm.gainItem(rewardId, rewardQty);
        }

        cm.sendOk("Excellent trade, adventurer! Here's your #b" + rewardName + "#k.\r\n\r\nRemember — the bosses respawn, and so does their power. Come back anytime you have more essences.");
        cm.dispose();
    }
}
