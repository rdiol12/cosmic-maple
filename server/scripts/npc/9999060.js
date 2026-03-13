/**
 * NPC: Explorer's Guide Mira (9999060)
 * Location: Henesys (100000000)
 * Purpose: Training area recommender — suggests best maps by level, offers warps
 *
 * Features:
 *   1. Level-based training recommendations (5 suggestions per tier)
 *   2. Paid warping to recommended maps (scales with level)
 *   3. Tips for efficient grinding
 *   4. Boss readiness check
 */

var status = -1;
var selectedAction = -1;
var selectedTier = -1;
var selectedMap = -1;

// Training data: [mapId, mapName, mobName, levelRange, expNote]
var trainingTiers = [
    { name: "Beginner (Lv 1-15)", warpCost: 1000, maps: [
        [104040000, "Dangerous Forest", "Slime", "1-8", "Safe starter area with low-level slimes"],
        [100020000, "Henesys Hunting Ground I", "Green Mushroom", "8-13", "Classic training ground south of Henesys"],
        [100040000, "Henesys Hunting Ground II", "Horny Mushroom", "10-15", "Denser mobs, higher EXP than HHG1"],
        [101010100, "Tree Dungeon I", "Green Mushroom", "8-12", "Vertical map near Ellinia — good for mages"],
        [102010000, "Construction Site North", "Iron Hog", "12-18", "Perion area — good for warriors"]
    ]},
    { name: "Early Game (Lv 15-30)", warpCost: 5000, maps: [
        [101030110, "Ant Tunnel I", "Horny Mushroom", "15-22", "Dense spawns underground — bring cure potions"],
        [101030404, "Sleepywood Dungeon", "Curse Eye", "20-30", "Great EXP, watch out for darkness debuffs"],
        [103000100, "Kerning City Construction", "Ligator", "18-25", "Good for thieves — close to Kerning"],
        [100040100, "Henesys Pig Beach", "Ribbon Pig", "15-20", "Flat map with fast respawns"],
        [102040200, "Wild Boar Land", "Wild Boar", "20-28", "Good EXP and decent drops"]
    ]},
    { name: "Mid Game (Lv 30-50)", warpCost: 15000, maps: [
        [105040300, "Cold Field", "Jr. Yeti", "30-40", "Aqua Road entrance — bring cold resist pots"],
        [101030100, "Ant Tunnel Park", "Zombie Mushroom", "30-40", "Classic undead grinding — bring holy attacks"],
        [107000300, "Red-Nosed Pirate Den 1", "Red Drake", "35-45", "Decent EXP with fun pirate theme"],
        [211040100, "Eos Tower 76th Floor", "Rombot", "35-50", "Ludibrium vertical tower — great EXP per kill"],
        [220020000, "Toy Factory Entrance", "Robo", "40-50", "Ludibrium factory area — clockwork enemies"]
    ]},
    { name: "Late Game (Lv 50-70)", warpCost: 30000, maps: [
        [220040300, "Clock Tower Lower Floor", "Toy Trojan", "50-60", "High density, consistent EXP"],
        [220050200, "Warped Passage", "Master Chronos", "55-65", "Top-tier EXP for this range"],
        [600020300, "Biggest Nest 1", "Gryphon", "50-60", "Masteria — strong mobs, good drops"],
        [220070100, "Forgotten Path 1", "Ghost Pirate", "55-65", "Undead mobs — bring holy attacks for bonus"],
        [211041200, "Eos Tower 22nd Floor", "Rombot", "50-55", "Still solid for this level range"]
    ]},
    { name: "Advanced (Lv 70-100)", warpCost: 50000, maps: [
        [240010200, "Cranky Forest", "Skelesaurus", "70-85", "Leafre area — strong dinos, great EXP"],
        [240020100, "Dangerous Dragon Nest", "Cornian", "80-100", "Top EXP in Leafre — bring DEF pots"],
        [220080000, "Path of Time 1", "Master Death Teddy", "70-85", "Undead bears — excellent meso drops"],
        [200040000, "Forest of Dead Trees I", "Coolie Zombie", "70-80", "El Nath undead — holy damage shreds them"],
        [251010400, "Herb Town Tiger Forest", "Rexton", "75-90", "Mu Lung area — martial arts themed mobs"]
    ]},
    { name: "Elite (Lv 100+)", warpCost: 100000, maps: [
        [240040500, "Dragon Canyon", "Dragon", "100-120", "Endgame grinding zone in Leafre"],
        [240040400, "Peak of the Big Nest", "Wyvern", "100-115", "High EXP wyverns — need strong gear"],
        [220070301, "Forgotten Path of Time 3", "Ghost Ship", "100-110", "Ghostly EXP bonanza"],
        [270030000, "Temple of Time: Road 1", "Memory Monk", "105-120", "Temple of Time — top tier EXP"],
        [270040000, "Temple of Time: Road 4", "Oblivion Monk", "115-135", "The best EXP in the game for 115+"]
    ]}
];

// Boss readiness thresholds
var bossGuide = [
    { name: "King Slime", level: 20, tip: "Bring plenty of HP pots. He's in Kerning City PQ." },
    { name: "Mushmom", level: 35, tip: "Found near Henesys — drops rare hats. Spawns every ~45 min." },
    { name: "Blue Mushmom", level: 50, tip: "Aqua Road — much stronger than normal Mushmom." },
    { name: "Crimson Balrog", level: 70, tip: "Found in Sleepywood — very dangerous! Bring a party." },
    { name: "Papulatus", level: 80, tip: "Clock Tower in Ludibrium. Bring Allcure potions for seal." },
    { name: "Zakum", level: 90, tip: "El Nath mines. MUST have Eye of Fire to enter. Full party recommended." },
    { name: "Pianus", level: 85, tip: "Aqua Road depths. High HP pool — bring lots of pots." },
    { name: "Horntail", level: 120, tip: "Cave of Life in Leafre. Full party of 120+ required. The hardest boss!" }
];

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1) { cm.dispose(); return; }
    if (mode === 0 && status === 0) { cm.dispose(); return; }

    if (mode === 1) status++;
    else status--;

    if (status === 0) {
        var lvl = cm.getPlayer().getLevel();
        var text = "#e#bExplorer's Guide Mira#k#n\r\n\r\n";
        text += "Hey there, adventurer! I'm Mira — I've mapped every corner of Maple World.\r\n\r\n";
        text += "Your current level: #b" + lvl + "#k\r\n\r\n";
        text += "What can I help you with?\r\n\r\n";
        text += "#L0##bWhere should I train?#k (level-based recommendations)#l\r\n";
        text += "#L1##bWarp me to a training spot#k (costs mesos)#l\r\n";
        text += "#L2##bBoss Readiness Guide#k (am I ready for bosses?)#l\r\n";
        text += "#L3##bGrinding Tips#k#l\r\n";
        text += "#L4#Goodbye#l";
        cm.sendSimple(text);

    } else if (status === 1) {
        selectedAction = selection;

        if (selectedAction === 4) {
            cm.sendOk("Safe travels! Remember — the best training spot is the one where you can kill fast without dying. See you around!");
            cm.dispose();
            return;
        }

        if (selectedAction === 0) {
            // Training recommendations by level
            var lvl = cm.getPlayer().getLevel();
            var tier = getTierForLevel(lvl);
            var text = "#e#bTraining Recommendations for Level " + lvl + "#k#n\r\n\r\n";
            text += "#dBest tier: " + tier.name + "#k\r\n\r\n";

            for (var i = 0; i < tier.maps.length; i++) {
                var m = tier.maps[i];
                text += "#b" + (i + 1) + ". " + m[1] + "#k\r\n";
                text += "   Mobs: #r" + m[2] + "#k | Levels: " + m[3] + "\r\n";
                text += "   " + m[4] + "\r\n\r\n";
            }

            text += "#eWant me to warp you? Choose option 2 from the main menu!#n";
            cm.sendOk(text);
            cm.dispose();
            return;

        } else if (selectedAction === 1) {
            // Warp menu
            var lvl = cm.getPlayer().getLevel();
            var text = "#e#bTraining Warp Service#k#n\r\n\r\nChoose a level range:\r\n\r\n";
            for (var i = 0; i < trainingTiers.length; i++) {
                text += "#L" + i + "#" + trainingTiers[i].name + " (warp: " + trainingTiers[i].warpCost + " mesos)#l\r\n";
            }
            cm.sendSimple(text);

        } else if (selectedAction === 2) {
            // Boss readiness
            var lvl = cm.getPlayer().getLevel();
            var text = "#e#bBoss Readiness Guide#k#n\r\n\r\n";

            for (var i = 0; i < bossGuide.length; i++) {
                var b = bossGuide[i];
                var ready = (lvl >= b.level);
                text += (ready ? "#g\u2713" : "#r\u2717") + " " + b.name + "#k (Lv " + b.level + "+)\r\n";
                text += "   " + b.tip + "\r\n\r\n";
            }

            text += "\r\n#eTip: Being at the recommended level isn't enough — make sure you have good gear and enough potions!#n";
            cm.sendOk(text);
            cm.dispose();
            return;

        } else if (selectedAction === 3) {
            // Grinding tips
            var tips = "#e#bMira's Grinding Tips#k#n\r\n\r\n";
            tips += "#b1. Kill Speed > Mob Level#k\r\n";
            tips += "Always train where you can 1-2 shot mobs. Higher level mobs give more EXP, but slower kills mean less EXP/hour.\r\n\r\n";
            tips += "#b2. Use Class Strengths#k\r\n";
            tips += "Mages excel in flat maps (Meteor/Blizzard). Archers love platforms. Warriors want tight corridors.\r\n\r\n";
            tips += "#b3. Holy Damage vs Undead#k\r\n";
            tips += "Undead mobs (zombies, ghosts, skeletons) take extra damage from holy attacks. Clerics dominate these areas.\r\n\r\n";
            tips += "#b4. Stack Buffs#k\r\n";
            tips += "Visit #bMystic Zara#k in Henesys for a daily stat buff. Use class buffs before every grind session.\r\n\r\n";
            tips += "#b5. Party Bonus#k\r\n";
            tips += "Party play gives bonus EXP! A party of 3+ gets 10-30% more EXP per kill. Find friends!\r\n\r\n";
            tips += "#b6. Daily Challenges#k\r\n";
            tips += "Talk to #bChallenge Master Doran#k in Henesys for daily quests with bonus rewards.\r\n\r\n";
            tips += "#b7. Boss Essence Trading#k\r\n";
            tips += "Collect boss essences and trade them with #bAria the Boss Hunter#k in Leafre for scrolls and rare items.";
            cm.sendOk(tips);
            cm.dispose();
            return;
        }

    } else if (status === 2) {
        // Warp tier selected — show specific maps
        if (selectedAction !== 1) { cm.dispose(); return; }

        selectedTier = selection;
        if (selectedTier < 0 || selectedTier >= trainingTiers.length) { cm.dispose(); return; }

        var tier = trainingTiers[selectedTier];
        var text = "#e" + tier.name + " — Choose a destination#n\r\n\r\n";
        text += "Warp cost: #r" + tier.warpCost + " mesos#k each\r\n\r\n";

        for (var i = 0; i < tier.maps.length; i++) {
            var m = tier.maps[i];
            text += "#L" + i + "##b" + m[1] + "#k — " + m[2] + " (" + m[3] + ")#l\r\n";
        }
        text += "#L" + tier.maps.length + "#Back#l";
        cm.sendSimple(text);

    } else if (status === 3) {
        // Specific map selected — confirm warp
        if (selectedAction !== 1 || selectedTier < 0) { cm.dispose(); return; }

        var tier = trainingTiers[selectedTier];
        selectedMap = selection;

        if (selectedMap === tier.maps.length) {
            // Back button
            cm.dispose();
            return;
        }
        if (selectedMap < 0 || selectedMap >= tier.maps.length) { cm.dispose(); return; }

        var m = tier.maps[selectedMap];
        cm.sendYesNo("Warp to #b" + m[1] + "#k?\r\n\r\nMobs: #r" + m[2] + "#k | Levels: " + m[3] + "\r\nCost: #r" + tier.warpCost + " mesos#k\r\n\r\nReady to go?");

    } else if (status === 4) {
        // Warp confirmed
        if (selectedAction !== 1 || selectedTier < 0 || selectedMap < 0) { cm.dispose(); return; }

        var tier = trainingTiers[selectedTier];
        var m = tier.maps[selectedMap];
        var cost = tier.warpCost;

        if (cm.getMeso() < cost) {
            cm.sendOk("You need #r" + cost + " mesos#k for the warp, but you only have #r" + cm.getMeso() + "#k.\r\n\r\nGo grind some mesos first!");
            cm.dispose();
            return;
        }

        cm.gainMeso(-cost);
        cm.warp(m[0], 0);
        cm.dispose();
    }
}

function getTierForLevel(lvl) {
    if (lvl < 15) return trainingTiers[0];
    if (lvl < 30) return trainingTiers[1];
    if (lvl < 50) return trainingTiers[2];
    if (lvl < 70) return trainingTiers[3];
    if (lvl < 100) return trainingTiers[4];
    return trainingTiers[5];
}
