/**
 * Alchemist Luna — NPC 9999002
 * Location: Ellinia (101000000)
 * Type: Potion & Buff Shop
 * Sells HP/MP potions and cure items
 */
var status = 0;
var selectedItem = -1;

// [name, itemId, price, description]
var potions = [
    ["Red Potion",      2000000, 40,   "Restores 100 HP"],
    ["Orange Potion",   2000001, 120,  "Restores 300 HP"],
    ["White Potion",    2000002, 500,  "Restores 800 HP"],
    ["Blue Potion",     2000003, 120,  "Restores 100 MP"],
    ["Mana Elixir",     2000006, 400,  "Restores 300 MP"],
    ["Elixir",          2000004, 900,  "Restores 300 HP and 200 MP"],
    ["Power Elixir",    2000005, 2000, "Fully restores HP and MP"],
    ["All-Cure Potion", 2050002, 300,  "Cures all abnormal statuses"]
];

function start() {
    status = 0;
    cm.sendNext("#b[Alchemist Luna]#k\r\nWelcome, traveler! I am Luna, keeper of Ellinia's alchemical arts.\r\n\r\nMy potions are brewed fresh from the forest's magical herbs. What do you need today?");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "What are you looking for?\r\n";
        menu += "#L0##b Purchase potions#k#l\r\n";
        menu += "#L1##b Alchemy tips#k#l\r\n";
        menu += "#L2##b Leave#k#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == 2) {
            cm.sendOk("May the forest's magic protect you on your journey!");
            cm.dispose();
            return;
        } else if (selection == 1) {
            cm.sendOk("A wise adventurer always carries potions!\r\n\r\n#bHP Potions#k restore your vitality.\r\n#bMP Potions#k restore your magical energy.\r\n#bElixirs#k restore both at once.\r\n#bAll-Cure#k removes poison, stun, and curses.\r\n\r\nNever enter a dungeon without supplies!");
            cm.dispose();
            return;
        }
        // Show potion shop
        var shopMenu = "#b[Luna's Potion Shop]#k\r\nChoose a potion:\r\n\r\n";
        for (var i = 0; i < potions.length; i++) {
            shopMenu += "#L" + i + "##i" + potions[i][1] + "# " + potions[i][0] + " (" + potions[i][2] + " mesos)#l\r\n";
        }
        shopMenu += "#L" + potions.length + "#Nothing for now#l";
        cm.sendSimple(shopMenu);

    } else if (status == 3) {
        if (selection == potions.length) {
            cm.sendOk("Be safe out there!");
            cm.dispose();
            return;
        }
        selectedItem = selection;
        var p = potions[selectedItem];
        cm.sendGetNumber("How many #b" + p[0] + "#k would you like?\r\n" + p[3] + "\r\nCost: #r" + p[2] + " mesos each#k", 1, 1, 100);

    } else if (status == 4) {
        if (mode == 0) {
            cm.sendOk("Changed your mind? Come back anytime!");
            cm.dispose();
            return;
        }
        var qty = selection;
        var p = potions[selectedItem];
        var totalCost = p[2] * qty;
        if (cm.getMeso() < totalCost) {
            cm.sendOk("You need #r" + totalCost + " mesos#k for " + qty + "x " + p[0] + ". You only have " + cm.getMeso() + " mesos.");
        } else if (!cm.canHold(p[1], qty)) {
            cm.sendOk("Your inventory doesn't have room for " + qty + " potions.");
        } else {
            cm.gainMeso(-totalCost);
            cm.gainItem(p[1], qty);
            cm.sendOk("Here are your " + qty + "x #b" + p[0] + "#k! Stay healthy out there!");
        }
        cm.dispose();
    }
}
