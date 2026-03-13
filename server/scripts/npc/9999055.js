/**
 * Luxury Merchant — NPC 9999055
 * Location: Henesys (100000000)
 * Type: Premium cosmetics and convenience items
 * Role: Meso sink for mid-game+ players with excess currency
 *
 * This NPC sells high-end items that don't provide combat stats
 * but offer prestige, convenience, or purely cosmetic benefits.
 * Prices are intentionally high to serve as meso sinks.
 */

var status = 0;
var selectedItem = -1;

// Premium items: [name, itemId, price, description]
var luxuryItems = [
    ["Royal Title Box",        2002101, 50000, "Grants temporary 'Royal' title above your head. Prestige item."],
    ["Enchanted Blessing Scroll", 2030022, 25000, "Consumable. Grants +10% EXP for 1 hour."],
    ["Perfect Fusion Crystal",   2002102, 35000, "Rare alchemical component. Collectors' item."],
    ["Prestige Medallion Frame",  2002103, 60000, "Equip for bragging rights. Shows you've mastered combat."],
    ["Master's Coffee",          2002104, 10000, "Consumable. Restores HP/MP and grants +5 DEX/INT for 30min."],
    ["Mystic Recall Scroll",      2030023, 20000, "Premium return scroll. Returns to any previously visited town."],
    ["Wisdom Tome (Empty)",       2002105, 75000, "Can be filled with knowledge scrolls for customization."],
    ["Legendary Ring Box",        2002106, 100000, "Ultra-rare cosmetic. Marks you as a high-roller among players."]
];

function start() {
    status = 0;
    cm.sendNext("#b[Luxury Merchant]#k\r\nAh, welcome, welcome! I see you've done quite well for yourself.\r\n\r\nI deal exclusively in premium items — the sort of things that separate the true power players from the crowd. Everything here is expensive, yes, but that's rather the point. You don't come to me for bargains.\r\n\r\nWhat catches your fancy?");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "Browse my collection, and choose wisely.\r\n\r\n";
        for (var i = 0; i < luxuryItems.length; i++) {
            var item = luxuryItems[i];
            menu += "#L" + i + "##b" + item[0] + "#k — " + item[2] + " mesos#l\r\n";
        }
        menu += "#L" + luxuryItems.length + "#Just browsing, thanks#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == luxuryItems.length) {
            cm.sendOk("As you wish. When you're ready to invest in prestige, I'll be here.");
            cm.dispose();
            return;
        }
        
        selectedItem = selection;
        var item = luxuryItems[selectedItem];
        cm.sendYesNo("#b" + item[0] + "#k\r\n\r\n" + item[3] + "\r\n\r\n#rPrice: " + item[2] + " mesos#k\r\n\r\nThis is a luxury purchase. Are you sure you want to buy it?");

    } else if (status == 3) {
        if (mode == 0) {
            cm.sendOk("Perhaps another time. My wares will be here when you're ready.");
            cm.dispose();
            return;
        }
        var item = luxuryItems[selectedItem];
        if (cm.getMeso() < item[2]) {
            cm.sendOk("I'm afraid you don't have quite enough. Come back when you've accumulated " + (item[2] - cm.getMeso()) + " more mesos.\r\n\r\nPremium items are not for the common traveler.");
        } else if (!cm.canHold(item[1])) {
            cm.sendOk("Your inventory is full. Make some space, then return.");
        } else {
            cm.gainMeso(-item[2]);
            cm.gainItem(item[1], 1);
            cm.sendOk("Excellent taste! You've acquired:\r\n#b#i" + item[1] + "# #t" + item[1] + "#k\r\n\r\nEnjoy your purchase. You've earned it.");
        }
        cm.dispose();
    }
}
