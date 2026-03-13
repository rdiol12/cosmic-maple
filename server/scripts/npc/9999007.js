/**
 * Gem Trader Safi — NPC 9999007
 * Location: Ellinia (101000000)
 * Type: Ore / Crafting Material Exchange
 * Buys ores from players and sells refined crystals
 */
var status = 0;
var selectedAction = -1;
var selectedOre = -1;

// Ores the NPC buys [name, itemId, price_per]
var buyOres = [
    ["Topaz Ore",      4010000, 50],
    ["Sapphire Ore",   4010001, 50],
    ["Emerald Ore",    4010002, 50],
    ["Opal Ore",       4010003, 50],
    ["Aquamarine Ore", 4010004, 50],
    ["Amethyst Ore",   4010005, 50],
    ["Garnet Ore",     4010006, 50],
    ["Diamond Ore",    4010007, 200],
    ["Black Crystal",  4010008, 500]
];

// Items the NPC sells [name, itemId, price]
var sellCrystals = [
    ["Refined Topaz",      4020000, 250],
    ["Refined Sapphire",   4020001, 250],
    ["Refined Emerald",    4020002, 250],
    ["Refined Opal",       4020003, 250],
    ["Refined Aquamarine", 4020004, 250],
    ["Refined Amethyst",   4020005, 250],
    ["Refined Garnet",     4020006, 250],
    ["Refined Diamond",    4020007, 1000]
];

function start() {
    status = 0;
    cm.sendNext("#b[Gem Trader Safi]#k\r\nWelcome to my collection, friend! I deal exclusively in the finest ores and gems Victoria Island has to offer.\r\n\r\nBring me raw ores from your adventures, and I'll pay good mesos for them. Or perhaps you need refined crystals for crafting?");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "What business brings you to my stall?\r\n";
        menu += "#L0##b Sell ore to Safi#k#l\r\n";
        menu += "#L1##b Buy refined crystals#k#l\r\n";
        menu += "#L2##b Where do I find ores?#k#l\r\n";
        menu += "#L3##b Leave#k#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        selectedAction = selection;

        if (selection == 3) {
            cm.sendOk("Come back with your pockets full of ores!");
            cm.dispose();
            return;
        } else if (selection == 2) {
            cm.sendOk("Ores are hidden inside ore veins scattered across dungeons and hunting fields.\r\n\r\nCommon spots:\r\n#b• Perion — Rocky Mountain#k (Topaz, Garnet)\r\n#b• Ellinia forests#k (Emerald, Sapphire)\r\n#b• Sleepywood Dungeon#k (Diamond, Black Crystal)\r\n\r\nStrike the veins to collect the ore inside!");
            cm.dispose();
            return;
        } else if (selection == 0) {
            // Sell ore menu
            var menu = "#b[Sell Ore to Safi]#k\r\nSelect an ore to sell:\r\n\r\n";
            for (var i = 0; i < buyOres.length; i++) {
                menu += "#L" + i + "##i" + buyOres[i][1] + "# " + buyOres[i][0] + " — " + buyOres[i][2] + " mesos each#l\r\n";
            }
            menu += "#L" + buyOres.length + "#Nothing to sell#l";
            cm.sendSimple(menu);
        } else {
            // Buy crystals menu
            var menu = "#b[Buy Refined Crystals]#k\r\nSelect a crystal to purchase:\r\n\r\n";
            for (var i = 0; i < sellCrystals.length; i++) {
                menu += "#L" + i + "##i" + sellCrystals[i][1] + "# " + sellCrystals[i][0] + " — " + sellCrystals[i][2] + " mesos#l\r\n";
            }
            menu += "#L" + sellCrystals.length + "#Nothing for me#l";
            cm.sendSimple(menu);
        }

    } else if (status == 3) {
        if (selectedAction == 0) {
            // Selling ore
            if (selection == buyOres.length) {
                cm.sendOk("Bring me some ores next time!");
                cm.dispose();
                return;
            }
            selectedOre = selection;
            var ore = buyOres[selectedOre];
            if (!cm.haveItem(ore[1])) {
                cm.sendOk("You don't have any #b" + ore[0] + "#k to sell!");
                cm.dispose();
                return;
            }
            cm.sendGetNumber("How many #b" + ore[0] + "#k will you sell?\r\nI'll pay #r" + ore[2] + " mesos each#k.", 1, 1, 100);
        } else {
            // Buying crystals
            if (selection == sellCrystals.length) {
                cm.sendOk("Come back when you need crystals!");
                cm.dispose();
                return;
            }
            selectedOre = selection;
            var crystal = sellCrystals[selectedOre];
            cm.sendGetNumber("How many #b" + crystal[0] + "#k would you like?\r\nCost: #r" + crystal[2] + " mesos each#k.", 1, 1, 50);
        }

    } else if (status == 4) {
        if (mode == 0) {
            cm.sendOk("Changed your mind? The gems will still be here!");
            cm.dispose();
            return;
        }
        var qty = selection;
        if (selectedAction == 0) {
            var ore = buyOres[selectedOre];
            if (!cm.haveItem(ore[1], qty)) {
                cm.sendOk("You don't have " + qty + "x " + ore[0] + "!");
            } else {
                cm.gainItem(ore[1], -qty);
                cm.gainMeso(ore[2] * qty);
                cm.sendOk("Excellent! I bought " + qty + "x #b" + ore[0] + "#k for #r" + (ore[2] * qty) + " mesos#k. Pleasure doing business!");
            }
        } else {
            var crystal = sellCrystals[selectedOre];
            var totalCost = crystal[2] * qty;
            if (cm.getMeso() < totalCost) {
                cm.sendOk("You need #r" + totalCost + " mesos#k but only have " + cm.getMeso() + ".");
            } else if (!cm.canHold(crystal[1], qty)) {
                cm.sendOk("Your inventory is full!");
            } else {
                cm.gainMeso(-totalCost);
                cm.gainItem(crystal[1], qty);
                cm.sendOk("Here are your " + qty + "x #b" + crystal[0] + "#k! A fine investment!");
            }
        }
        cm.dispose();
    }
}
