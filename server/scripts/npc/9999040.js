/**
 * @NPC:     Coliseum Quartermaster (9999040)
 * @Location: Crimson Coliseum: Lobby (920000000)
 * @Purpose: Arena Token exchange shop — trade tokens for mesos, potions, scrolls
 */

var status = -1;
var selectedIdx = -1;

// Arena Token item ID
var ARENA_TOKEN = 4039050;

// Exchange options: { cost, itemId, qty, name, desc }
var REWARDS = [
    { cost: 10,  itemId: 0,       qty: 1,  name: "10,000 Mesos",        desc: "Quick meso payout" },
    { cost: 20,  itemId: 2002031, qty: 3,  name: "3x Elixir of Rage",   desc: "PAD +10 for 3 min" },
    { cost: 35,  itemId: 2002035, qty: 5,  name: "5x Lucky Clover",     desc: "ACC+EVA +15 for 5 min" },
    { cost: 50,  itemId: 2002033, qty: 5,  name: "5x Iron Shield Scroll",desc: "PDD +15 for 5 min" },
    { cost: 75,  itemId: 2002036, qty: 10, name: "10x Giant's Meat",    desc: "HP +800 per use" },
    { cost: 100, itemId: 2030021, qty: 3,  name: "3x Return Scroll",    desc: "Warp to Henesys" }
];

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) { cm.dispose(); return; }
    if (mode == 0 && status == 0) { cm.dispose(); return; }
    if (mode == 1) status++;
    else status--;

    if (status == 0) {
        var tokens = cm.itemQuantity ? cm.itemQuantity(ARENA_TOKEN) : 0;
        if (!cm.haveItem) tokens = 0;

        var menu = "*Coliseum Quartermaster: Built like a fortress wall and twice as reliable — she's seen every kind of fighter pass through.*\r\n\r\n" +
            "You have #b" + tokens + " Arena Tokens#k. Here's what I can trade you:\r\n\r\n";

        for (var i = 0; i < REWARDS.length; i++) {
            var r = REWARDS[i];
            var canAfford = tokens >= r.cost;
            var mark = canAfford ? "#b" : "#d";
            menu += "#L" + i + "#" + mark + r.cost + " Tokens → " + r.name + "#k — " + r.desc + "#l\r\n";
        }

        cm.sendSimple(menu);

    } else if (status == 1) {
        selectedIdx = selection;
        var r = REWARDS[selectedIdx];
        var tokens = cm.itemQuantity ? cm.itemQuantity(ARENA_TOKEN) : 0;

        if (tokens < r.cost) {
            cm.sendOk("You need #b" + r.cost + " Arena Tokens#k for this exchange.\r\nYou currently have: " + tokens + ".");
            cm.dispose();
            return;
        }

        cm.sendYesNo("Exchange #b" + r.cost + " Arena Tokens#k for #b" + r.name + "#k?\r\n(" + r.desc + ")");

    } else if (status == 2) {
        if (mode == 1) {
            var r = REWARDS[selectedIdx];
            cm.gainItem(ARENA_TOKEN, -r.cost);
            if (r.itemId == 0) {
                // Meso reward
                cm.gainMeso(10000);
            } else {
                cm.gainItem(r.itemId, r.qty);
            }
            cm.sendOk("Done. You received #b" + r.name + "#k.\r\nCome back when you've earned more tokens.");
        } else {
            cm.sendOk("Think it over. The tokens keep well.");
        }
        cm.dispose();
    }
}
