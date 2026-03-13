/**
 * Arena Master Rex — NPC 9999006
 * Location: Henesys (100000000)
 * Type: Training Advisor / Map Warp NPC
 * Warps players to appropriate training maps based on level
 */
var status = 0;
var selectedGround = -1;
var warpColiseum = false;

var trainingGrounds = [
    {
        name: "Slime Tree (Lv. 1-10)",
        mapId: 100020100,
        minLevel: 1,
        maxLevel: 15,
        desc: "Perfect for total beginners. Slimes and Snails won't hurt you much."
    },
    {
        name: "Henesys Hunting Ground (Lv. 10-20)",
        mapId: 100020000,
        minLevel: 5,
        maxLevel: 25,
        desc: "Mushrooms, Orange Mushrooms, and Pigs roam here. Good early experience."
    },
    {
        name: "Western Rocky Mountain (Lv. 20-30)",
        mapId: 102020000,
        minLevel: 15,
        maxLevel: 35,
        desc: "Wild Boars and Stone Golems in the Perion foothills. Warriors love it here."
    },
    {
        name: "Ant Tunnel (Lv. 30-40)",
        mapId: 105090200,
        minLevel: 25,
        maxLevel: 45,
        desc: "Dark, cramped tunnels near Sleepywood. Horned Mushrooms and Zombie Mushrooms lurk here."
    },
    {
        name: "Sleepywood Dungeon (Lv. 40-50)",
        mapId: 105040300,
        minLevel: 35,
        maxLevel: 55,
        desc: "The deepest dungeon on Victoria Island. Jr. Balrogs and other fearsome creatures. Not for the faint of heart!"
    }
];

function start() {
    status = 0;
    selectedGround = -1;
    warpColiseum = false;
    cm.sendNext("#b[Arena Master Rex]#k\r\nYou want to get stronger? Then you've come to the right person.\r\n\r\nI've trained a thousand adventurers in my career. I know exactly where every level should be training. Let me point you in the right direction!");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "What can I help you with?\r\n";
        menu += "#L0##b Warp me to a training ground#k#l\r\n";
        menu += "#L1##b Where should I train at my level?#k#l\r\n";
        menu += "#L2##b Training advice#k#l\r\n";
        menu += "#L3##r⚔ Enter the Crimson Coliseum#k#l\r\n";
        menu += "#L4##b Leave#k#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == 4) {
            cm.sendOk("Keep pushing your limits! Strength comes from struggle.");
            cm.dispose();
            return;

        } else if (selection == 3) {
            // Crimson Coliseum warp
            warpColiseum = true;
            cm.sendYesNo("The #rCrimson Coliseum#k is a brutal proving ground — only the strong survive.\r\n\r\nArena Tokens drop from the monsters inside and can be exchanged with the Quartermaster for powerful gear.\r\n\r\nAre you ready to enter?");

        } else if (selection == 2) {
            cm.sendOk("My top training tips:\r\n\r\n#b• Use buffs and food#k before a grind session.\r\n#b• Focus on maps where mobs are near your level#k (within 5-10 levels).\r\n#b• Don't forget to use your HP potions#k — dying wastes time.\r\n#b• Party up when possible#k — the exp bonus is worth it.\r\n#b• Get your job advancement early!#k The power spike is huge.");
            cm.dispose();
            return;

        } else if (selection == 1) {
            // Recommend based on level
            var level = cm.getLevel();
            var rec = trainingGrounds[0];
            for (var i = trainingGrounds.length - 1; i >= 0; i--) {
                if (level >= trainingGrounds[i].minLevel) {
                    rec = trainingGrounds[i];
                    break;
                }
            }
            cm.sendOk("At level " + level + ", I recommend:\r\n\r\n#b" + rec.name + "#k\r\n" + rec.desc + "\r\n\r\nTalk to me again if you want a warp there!");
            cm.dispose();
            return;

        } else {
            // Warp selection menu
            var menu = "Choose a training ground:\r\n\r\n";
            for (var i = 0; i < trainingGrounds.length; i++) {
                menu += "#L" + i + "##b" + trainingGrounds[i].name + "#k\r\n   " + trainingGrounds[i].desc + "#l\r\n";
            }
            menu += "#L" + trainingGrounds.length + "#Never mind#l";
            cm.sendSimple(menu);
        }

    } else if (status == 3) {
        if (warpColiseum) {
            // Yes/No response for Crimson Coliseum
            if (mode == 0) {
                cm.sendOk("Train hard and come back when you're ready for real combat!");
                cm.dispose();
                return;
            }
            cm.sendOk("Welcome to the #rCrimson Coliseum#k, warrior. Prove yourself!");
            cm.warp(920000000, 0);
            cm.dispose();
            return;
        }
        if (selection == trainingGrounds.length) {
            cm.sendOk("Come back when you're ready to train!");
            cm.dispose();
            return;
        }
        selectedGround = selection;
        var ground = trainingGrounds[selectedGround];
        cm.sendYesNo("Warp to #b" + ground.name + "#k?\r\n" + ground.desc);

    } else if (status == 4) {
        if (mode == 0) {
            cm.sendOk("Alright, the offer stands whenever you're ready.");
            cm.dispose();
            return;
        }
        var ground = trainingGrounds[selectedGround];
        cm.sendOk("Heading to #b" + ground.name + "#k! Good luck with your training!");
        cm.warp(ground.mapId, 0);
        cm.dispose();
    }
}
