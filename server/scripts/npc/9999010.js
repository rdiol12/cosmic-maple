/**
 * Treasure Hunter Kai — NPC 9999010
 * Location: Perion (102000000)
 * Type: Drop Exchange / Rare Reward NPC + Quest Giver (The Vault Conspiracy chain)
 *
 * Quest chain: The Vault Conspiracy (99006 → 99007 → 99008 → 99009)
 *   Pt.1 — Strange Drops: 20x Pig's Ribbon (4000002)
 *   Pt.2 — Following the Fur: 10x Jr. Necki Fur (4000016)
 *   Pt.3 — Into the Hideout: 15x Boar Tusk (4000013)
 *   Pt.4 — Final Reckoning: 3x Jr. Balrog's Blood (4000010)
 */
var status = 0;
var selectedTrade = -1;

// [name, reqItem, reqQty, rewItem, rewQty, reqName, rewName]
var trades = [
    {
        name: "Boar's Bounty",
        reqItem: 4000013, reqQty: 10,
        rewItem: 1302003, rewQty: 1,
        reqName: "Boar Tusk",
        rewName: "Steel Broadsword",
        desc: "10 Boar Tusks \u2192 Steel Broadsword (solid warrior weapon)"
    },
    {
        name: "Mushroom Mastery",
        reqItem: 4000003, reqQty: 20,
        rewItem: 2000002, rewQty: 5,
        reqName: "Mushroom Spore",
        rewName: "White Potion (x5)",
        desc: "20 Mushroom Spores \u2192 5 White Potions"
    },
    {
        name: "Slime Surplus",
        reqItem: 4000000, reqQty: 30,
        rewItem: 2000004, rewQty: 3,
        reqName: "Slime Bubble",
        rewName: "Elixir (x3)",
        desc: "30 Slime Bubbles \u2192 3 Elixirs"
    },
    {
        name: "Hunter's Trophy",
        reqItem: 4000013, reqQty: 30,
        rewItem: 2000005, rewQty: 5,
        reqName: "Boar Tusk",
        rewName: "Power Elixir (x5)",
        desc: "30 Boar Tusks \u2192 5 Power Elixirs (full restore)"
    },
    {
        name: "Dungeon Relic",
        reqItem: 4000010, reqQty: 5,
        rewItem: 2040004, rewQty: 1,
        reqName: "Jr. Balrog's Blood",
        rewName: "60% Weapon ATT Scroll",
        desc: "5 Jr. Balrog's Blood \u2192 Scroll for Weapon ATT 60%"
    }
];

function getQuestState() {
    if (cm.isQuestCompleted(99009)) return "done";
    if (cm.isQuestStarted(99009)) return "active4";
    if (cm.isQuestCompleted(99008)) return "offer4";
    if (cm.isQuestStarted(99008)) return "active3";
    if (cm.isQuestCompleted(99007)) return "offer3";
    if (cm.isQuestStarted(99007)) return "active2";
    if (cm.isQuestCompleted(99006)) return "offer2";
    if (cm.isQuestStarted(99006)) return "active1";
    return "offer1";
}

function showQuestDialogue() {
    var qs = getQuestState();
    switch (qs) {
        case "done":
            cm.sendOk("#b[Treasure Hunter Kai]#k\r\nThe Vault Conspiracy — solved and sealed. Shadow Fang is finished.\r\n\r\nYou did something most hunters only dream about. If another mystery crosses my path... I know who to call.");
            break;
        case "offer1":
            cm.sendOk("#b[Treasure Hunter Kai]#k\r\n*lowers voice*\r\nI've been tracking something big. Encoded messages hidden inside monster drops. Smugglers using animals as couriers. The kind of thing that gets hunters silenced.\r\n\r\nI call it: #rThe Vault Conspiracy#k.\r\n\r\nOpen your #bquest log#k — the first lead involves Pig's Ribbon from the Henesys fields.");
            break;
        case "active1":
            cm.sendOk("#b[Treasure Hunter Kai]#k\r\nPt.1 still in progress. The Ribbon Pigs east of Henesys should have plenty.\r\n\r\nBring me #b20 #t4000002##k with the three-knot signature. Don't mix up the plain ones.");
            break;
        case "offer2":
            cm.sendOk("#b[Treasure Hunter Kai]#k\r\nGood work on the ribbons! The decoded messages point to Jr. Neckis as couriers.\r\n\r\nOpen your #bquest log#k for Pt.2 — I need #b10 #t4000034##k from the Kerning swamps.");
            break;
        case "active2":
            cm.sendOk("#b[Treasure Hunter Kai]#k\r\nPt.2 — the Kerning swamps. The Jr. Neckis are in the northern marshes near the city walls.\r\n\r\nBring me #b10 #t4000034##k. The violet-tinged ones carry the scent compound we need.");
            break;
        case "offer3":
            cm.sendOk("#b[Treasure Hunter Kai]#k\r\nThe Kerning lead confirmed it — Perion. Wild Boar Tusks branded with sigils are their payment tokens.\r\n\r\nOpen your #bquest log#k for Pt.3. I need #b15 #t4000020##k to cross-reference the sigils. Watch your back out there.");
            break;
        case "active3":
            cm.sendOk("#b[Treasure Hunter Kai]#k\r\nPt.3 — hunting in Perion. The branded boars roam the northern plateau.\r\n\r\nBring me #b15 #t4000020##k. Shadow Fang might have eyes on that territory.");
            break;
        case "offer4":
            cm.sendOk("#b[Treasure Hunter Kai]#k\r\nShadow Fang. Closer to home than I thought.\r\n\r\nTheir enforcer — a Jr. Balrog called The Warden — lives in the Sleepywood dungeon depths. Open your #bquest log#k for the final chapter.\r\n\r\n#b3 #t4000027##k and this is all over. Are you ready?");
            break;
        case "active4":
            cm.sendOk("#b[Treasure Hunter Kai]#k\r\nPt.4 — The Warden. Go deep into Sleepywood and make it count.\r\n\r\nBring me #b3 #t4000027##k. The authorities are on standby — we move the moment you're back.");
            break;
        default:
            cm.sendOk("Come back when you have a lead for me.");
            break;
    }
    cm.dispose();
}

function start() {
    status = 0;
    cm.sendNext("#b[Treasure Hunter Kai]#k\r\nYou there! Yes, you — the one with the adventurer's gleam in your eye!\r\n\r\nI'm Kai. I travel the world collecting trophies from legendary beasts. In exchange for the right monster drops, I'll give you something far more valuable.\r\n\r\nInterested in a trade?");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var qs = getQuestState();
        var questLabel;
        if (qs === "done") {
            questLabel = "#b[SOLVED] The Vault Conspiracy";
        } else if (qs === "offer1") {
            questLabel = "#r[NEW QUEST]#k The Vault Conspiracy";
        } else if (qs.indexOf("active") === 0) {
            questLabel = "#r[IN PROGRESS]#k The Vault Conspiracy";
        } else {
            questLabel = "#r[CONTINUE]#k The Vault Conspiracy";
        }

        var menu = "What can I do for you?\r\n";
        menu += "#L0##b View available trades#k#l\r\n";
        menu += "#L1##b What do you collect?#k#l\r\n";
        menu += "#L2#" + questLabel + "#l\r\n";
        menu += "#L3##b Leave#k#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == 3) {
            cm.sendOk("Happy hunting! The rarer the prey, the better the trade.");
            cm.dispose();
            return;
        } else if (selection == 1) {
            cm.sendOk("I've dedicated my life to hunting the greatest monsters on Victoria Island.\r\n\r\nEvery creature leaves something behind — a tusk, a bubble, a drop of dark blood. These are #btrophies#k.\r\n\r\nBring me enough, and I'll reward you with equipment and supplies that money alone can't buy!");
            cm.dispose();
            return;
        } else if (selection == 2) {
            showQuestDialogue();
            return;
        }

        // selection == 0: Show trades
        var menu = "#b[Kai's Trophy Exchange]#k\r\nAvailable trades:\r\n\r\n";
        for (var i = 0; i < trades.length; i++) {
            var t = trades[i];
            menu += "#L" + i + "#[" + t.name + "]\r\n   " + t.desc + "#l\r\n";
        }
        menu += "#L" + trades.length + "#Nothing right now#l";
        cm.sendSimple(menu);

    } else if (status == 3) {
        if (selection == trades.length) {
            cm.sendOk("Go hunt some monsters and come back with trophies!");
            cm.dispose();
            return;
        }
        selectedTrade = selection;
        var t = trades[selectedTrade];
        var hasItems = cm.haveItem(t.reqItem, t.reqQty);

        if (!hasItems) {
            cm.sendOk("You need #r" + t.reqQty + "x " + t.reqName + "#k for this trade.\r\n\r\nYou don't have enough. Hunt more and come back!");
            cm.dispose();
            return;
        }

        cm.sendYesNo("[#b" + t.name + "#k]\r\n\r\nTrade: #r" + t.reqQty + "x " + t.reqName + "#k\r\nFor: #b" + t.rewName + "#k\r\n\r\nDeal?");

    } else if (status == 4) {
        if (mode == 0) {
            cm.sendOk("Come back when you're ready to trade!");
            cm.dispose();
            return;
        }
        var t = trades[selectedTrade];
        if (!cm.haveItem(t.reqItem, t.reqQty)) {
            cm.sendOk("Strange — you no longer have the required items. Come back with the goods!");
        } else if (!cm.canHold(t.rewItem, t.rewQty)) {
            cm.sendOk("Your inventory is full! Make room and come back.");
        } else {
            cm.gainItem(t.reqItem, -t.reqQty);
            cm.gainItem(t.rewItem, t.rewQty);
            cm.sendOk("Excellent trade! I took your #r" + t.reqQty + "x " + t.reqName + "#k and gave you #b" + t.rewName + "#k.\r\n\r\nPleasure doing business, adventurer. Bring me more trophies!");
        }
        cm.dispose();
    }
}
