/**
 * Chef Momo — NPC 9999004
 * Location: Kerning City (103000000)
 * Type: Food Vendor
 * Sells stat-boosting food items
 */
var status = 0;
var selectedFood = -1;

// [name, itemId, price, effect]
var foods = [
    ["Warrior's Steak",       2022000, 800,  "+30 STR for 10 minutes"],
    ["Mage's Mushroom Soup",  2022001, 800,  "+30 INT for 10 minutes"],
    ["Archer's Trail Mix",    2022002, 800,  "+30 DEX for 10 minutes"],
    ["Thief's Spicy Ramen",   2022003, 800,  "+30 LUK for 10 minutes"],
    ["Hero's Full Meal",      2022004, 2000, "+20 to all stats for 10 min"]
];

function start() {
    status = 0;
    cm.sendNext("#b[Chef Momo]#k\r\nWelcome, welcome! I'm Momo, the greatest chef in Kerning City — don't let anyone tell you otherwise!\r\n\r\nMy dishes are made with secret recipes from across Victoria Island. A good meal before battle makes all the difference!");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "What would you like?\r\n";
        menu += "#L0##b Browse today's menu#k#l\r\n";
        menu += "#L1##b Ask about the food#k#l\r\n";
        menu += "#L2##b Leave#k#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == 2) {
            cm.sendOk("Come back hungry! A warrior fights best on a full stomach!");
            cm.dispose();
            return;
        } else if (selection == 1) {
            cm.sendOk("My food provides temporary stat boosts that last 10 minutes.\r\n\r\nEat before a tough hunt or boss fight for maximum effect!\r\n\r\nWarriors love the Steak. Mages prefer the Mushroom Soup. Archers go for Trail Mix. Thieves can't resist the Spicy Ramen. And the Hero's Full Meal? That's for the truly dedicated!");
            cm.dispose();
            return;
        }
        // Show food menu
        var shopMenu = "#b[Momo's Kitchen]#k\r\nToday's Specials:\r\n\r\n";
        for (var i = 0; i < foods.length; i++) {
            shopMenu += "#L" + i + "##i" + foods[i][1] + "# " + foods[i][0] + "\r\n   " + foods[i][3] + " — " + foods[i][2] + " mesos#l\r\n";
        }
        shopMenu += "#L" + foods.length + "#Nothing for me#l";
        cm.sendSimple(shopMenu);

    } else if (status == 3) {
        if (selection == foods.length) {
            cm.sendOk("Come back when you're hungry for power!");
            cm.dispose();
            return;
        }
        selectedFood = selection;
        var f = foods[selectedFood];
        cm.sendGetNumber("How many #b" + f[0] + "#k would you like?\r\n" + f[3] + "\r\nCost: #r" + f[2] + " mesos each#k", 1, 1, 20);

    } else if (status == 4) {
        if (mode == 0) {
            cm.sendOk("Changed your mind? The kitchen is always open!");
            cm.dispose();
            return;
        }
        var qty = selection;
        var f = foods[selectedFood];
        var totalCost = f[2] * qty;
        if (cm.getMeso() < totalCost) {
            cm.sendOk("You need #r" + totalCost + " mesos#k for that order. You only have " + cm.getMeso() + " mesos!");
        } else if (!cm.canHold(f[1], qty)) {
            cm.sendOk("Your inventory is full! Eat something first, then come back!");
        } else {
            cm.gainMeso(-totalCost);
            cm.gainItem(f[1], qty);
            cm.sendOk("Enjoy your " + qty + "x #b" + f[0] + "#k! Eat up before the big fight!");
        }
        cm.dispose();
    }
}
