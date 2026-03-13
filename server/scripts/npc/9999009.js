/**
 * Nurse Joy — NPC 9999009
 * Location: Henesys (100000000)
 * Type: Healer NPC
 * Provides free HP/MP restoration and sells cure potions
 */
var status = 0;
var selectedCure = -1;

// [itemId, price, name]
var cureItems = [
    [2050000, 400,  "Antidote"],
    [2050001, 400,  "Eyedrop"],
    [2050002, 800,  "All-Cure Potion"],
    [2000000, 40,   "Red Potion"],
    [2000003, 120,  "Blue Potion"]
];

function start() {
    status = 0;
    cm.sendNext("#b[Nurse Joy]#k\r\nWelcome to the Henesys Clinic! I'm Nurse Joy, and I'm here to patch up weary adventurers.\r\n\r\nLet me take a look at you — you look like you've been through quite a battle!");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "How can I help you today?\r\n";
        menu += "#L0##b Heal me (Free!)#k#l\r\n";
        menu += "#L1##b Buy clinic supplies#k#l\r\n";
        menu += "#L2##b I'm fine, thank you#k#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == 2) {
            cm.sendOk("Stay healthy out there! Don't forget to use your potions!");
            cm.dispose();
            return;

        } else if (selection == 0) {
            // Free heal
            var player = cm.getPlayer();
            var maxHP = player.getMaxHp();
            var maxMP = player.getMaxMp();
            var currentHP = player.getHp();
            var currentMP = player.getMp();

            if (currentHP >= maxHP && currentMP >= maxMP) {
                cm.sendOk("You're already at full health! No treatment needed.\r\n\r\nYou're in great shape — keep it up, hero!");
            } else {
                player.setHp(maxHP);
                player.setMp(maxMP);
                cm.sendOk("There we go! HP and MP fully restored.\r\n\r\nYou're good as new! Please be more careful out there — this clinic is always busy with reckless adventurers!");
            }
            cm.dispose();
            return;

        } else {
            // Buy supplies menu
            var shopMenu = "#b[Clinic Supplies]#k\r\nSelect an item:\r\n\r\n";
            for (var i = 0; i < cureItems.length; i++) {
                shopMenu += "#L" + i + "##i" + cureItems[i][0] + "# " + cureItems[i][2] + " — " + cureItems[i][1] + " mesos#l\r\n";
            }
            shopMenu += "#L" + cureItems.length + "#Nothing thanks#l";
            cm.sendSimple(shopMenu);
        }

    } else if (status == 3) {
        if (selection == cureItems.length) {
            cm.sendOk("Stay safe and carry potions!");
            cm.dispose();
            return;
        }
        selectedCure = selection;
        var item = cureItems[selectedCure];
        cm.sendGetNumber("How many #b" + item[2] + "#k would you like?\r\nCost: #r" + item[1] + " mesos each#k", 1, 1, 100);

    } else if (status == 4) {
        if (mode == 0) {
            cm.sendOk("Come back if you need anything!");
            cm.dispose();
            return;
        }
        var qty = selection;
        var item = cureItems[selectedCure];
        var totalCost = item[1] * qty;
        if (cm.getMeso() < totalCost) {
            cm.sendOk("You need #r" + totalCost + " mesos#k. Come back when you have enough!");
        } else if (!cm.canHold(item[0], qty)) {
            cm.sendOk("Your inventory is full!");
        } else {
            cm.gainMeso(-totalCost);
            cm.gainItem(item[0], qty);
            cm.sendOk("Here you go! " + qty + "x #b" + item[2] + "#k. Use them wisely!");
        }
        cm.dispose();
    }
}
