/**
 * Scout Raven — NPC 9999003
 * Location: Perion (102000000)
 * Type: Monster Intelligence / Bounty Board
 * Gives tips about strong mobs and rare drops
 */
var status = 0;

var monsterTips = [
    {
        name: "Slime",
        location: "Henesys Hunting Ground",
        tip: "Easy prey for beginners. They drop Slime Bubbles which sell for decent mesos. Recommended for levels 1-10.",
        drops: "Slime Bubble, Red Potion, basic equipment"
    },
    {
        name: "Mushroom",
        location: "Henesys Hunting Ground",
        tip: "Mushrooms are common in the fields east of Henesys. Their caps are collected by crafters. Recommended for levels 5-15.",
        drops: "Mushroom Spore, Orange Potion, basic scrolls"
    },
    {
        name: "Wild Boar",
        location: "Perion",
        tip: "These beasts roam the rocky plateau of Perion. Tough skin, but warriors can earn good experience here. Levels 20-35.",
        drops: "Boar Tusk, crafting materials, equipment"
    },
    {
        name: "Jr. Balrog",
        location: "Sleepywood Dungeon",
        tip: "A dangerous creature lurking in Sleepywood. Only experienced warriors should attempt this. Rare scrolls and weapons! Levels 40-50.",
        drops: "Rare scrolls, warrior equipment, Blue Mushroom Cap"
    },
    {
        name: "Zombie Mushroom",
        location: "Sleepywood",
        tip: "Undead mushrooms near Sleepywood. They can inflict poison — bring All-Cure potions! Their dark caps are sought by alchemists. Levels 30-40.",
        drops: "Dark Mushroom Cap, potions, scrolls"
    },
    {
        name: "Iron Hog",
        location: "Perion Plateau",
        tip: "Armored boars found deep in Perion. Harder than normal boars but drop better loot. Bring someone to tank their charges! Levels 25-38.",
        drops: "Iron Tusk, HP potions, warrior scrolls"
    }
];

function start() {
    status = 0;
    cm.sendNext("#b[Scout Raven]#k\r\nYou've found me, adventurer. I'm Raven — Perion's eyes and ears. I scout every dungeon, map every monster spawn, and know what they're hiding.\r\n\r\nWant to know where to hunt?");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "What intel do you need?\r\n\r\n";
        for (var i = 0; i < monsterTips.length; i++) {
            menu += "#L" + i + "##b " + monsterTips[i].name + "#k — " + monsterTips[i].location + "#l\r\n";
        }
        menu += "#L" + monsterTips.length + "#Nothing right now#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == monsterTips.length) {
            cm.sendOk("Stay sharp out there. The wilderness doesn't forgive the careless.");
            cm.dispose();
            return;
        }
        var tip = monsterTips[selection];
        var report = "#b[Scout Report: " + tip.name + "]#k\r\n";
        report += "Location: #r" + tip.location + "#k\r\n\r\n";
        report += tip.tip + "\r\n\r\n";
        report += "Known drops: #b" + tip.drops + "#k";
        cm.sendOk(report);
        cm.dispose();
    }
}
