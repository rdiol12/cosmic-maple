/* Cosmic Taskboard — NPC 9999013
 * Daily Quest Board that assigns 3 random quests per player per day.
 * Each player gets a different set of quests based on their character ID + date.
 * Located in Henesys (100000000).
 *
 * FIXED: Added turn-in mechanism with item verification and rewards.
 * Each quest requires collecting proof items (mob drops) as completion evidence.
 */
var status = 0;
var selectedQuest = -1;
var turningIn = false;

// Full quest pool — reqItem/reqQty used for turn-in verification
var quests = [
{id:99101,name:"Slime Sweep",tier:1,desc:"Collect 10 Slime Bubbles from Slimes",reqItem:4000019,reqQty:10,exp:3000,meso:5000,hint:"Found all over Henesys Hunting Ground."},
{id:99102,name:"Mushroom Harvest",tier:1,desc:"Collect 20 Orange Mushroom Caps",reqItem:4000003,reqQty:20,exp:2500,meso:4000,hint:"Orange Mushrooms east of Henesys drop these."},
{id:99103,name:"Snail Shell Collector",tier:1,desc:"Collect 30 Snail Shells",reqItem:4000000,reqQty:30,exp:2000,meso:3000,hint:"Snails on the roads outside any town."},
{id:99104,name:"Pig Farm Defense",tier:1,desc:"Collect 15 Pig Ribbons from Pigs",reqItem:4000002,reqQty:15,exp:3500,meso:5000,hint:"Pigs run wild near Henesys pig farm."},
{id:99105,name:"Stump Clearing",tier:1,desc:"Collect 10 Tree Branch from Stumps",reqItem:4000018,reqQty:10,exp:3000,meso:4500,hint:"Stumps roam the rocky paths of Perion."},
{id:99106,name:"Octopus Roundup",tier:1,desc:"Collect 15 Octopus Legs",reqItem:4000006,reqQty:15,exp:2800,meso:4000,hint:"Octopi are found at the Kerning City swamp entrance."},
{id:99107,name:"Wild Boar Hunt",tier:2,desc:"Collect 20 Wild Boar Teeth",reqItem:4000020,reqQty:20,exp:6000,meso:8000,hint:"Wild Boars charge through the Perion outskirts."},
{id:99108,name:"Zombie Mushroom Purge",tier:2,desc:"Collect 20 Zombie Mushroom Caps",reqItem:4000022,reqQty:20,exp:7000,meso:10000,hint:"Zombie Mushrooms lurk deep in the Ant Tunnel."},
{id:99109,name:"Evil Eye Extermination",tier:2,desc:"Collect 15 Evil Eye Tails",reqItem:4000017,reqQty:15,exp:6500,meso:9000,hint:"Evil Eyes float through the dungeon beneath Ellinia."},
{id:99110,name:"Ribbon Collection",tier:2,desc:"Collect 25 Pig Ribbons",reqItem:4000002,reqQty:25,exp:5500,meso:7000,hint:"Ribbon Pigs near Henesys drop these festive ribbons."},
{id:99111,name:"Jr. Necki Patrol",tier:2,desc:"Collect 15 Jr. Necki Skins",reqItem:4000025,reqQty:15,exp:5000,meso:8000,hint:"Jr. Neckis lurk in the swamps near Kerning City."},
{id:99112,name:"Fire Boar Hunt",tier:3,desc:"Collect 15 Fire Boar Flames",reqItem:4000021,reqQty:15,exp:12000,meso:15000,hint:"Fire Boars rampage through the Perion volcanic caves."},
{id:99113,name:"Copper Drake Slayer",tier:3,desc:"Collect 15 Drake Skulls",reqItem:4001012,reqQty:15,exp:14000,meso:18000,hint:"Copper Drakes nest in Sleepywood dungeon."},
{id:99114,name:"Iron Hog Cull",tier:3,desc:"Collect 15 Solid Horns from Iron Hogs",reqItem:4000030,reqQty:15,exp:13000,meso:16000,hint:"Iron Hogs are tougher cousins found in the deep Perion mines."},
{id:99115,name:"Lunar Pixie Hunt",tier:3,desc:"Collect 10 Pixie Wings",reqItem:4000058,reqQty:10,exp:15000,meso:20000,hint:"Lunar Pixies shimmer in the Orbis forests."},
{id:99116,name:"Horny Mushroom Menace",tier:3,desc:"Collect 20 Horny Mushroom Caps",reqItem:4000015,reqQty:20,exp:11000,meso:14000,hint:"These aggressive mushrooms lurk deep in Ellinia forests."},
{id:99117,name:"White Fang Cull",tier:4,desc:"Collect 15 White Fang Claws",reqItem:4000078,reqQty:15,exp:22000,meso:25000,hint:"White Fangs prowl the snowy fields of El Nath."},
{id:99118,name:"Tauromacis Brawl",tier:4,desc:"Collect 12 Tauromacis Horns",reqItem:4000049,reqQty:12,exp:25000,meso:30000,hint:"Tauromacis guards the Sleepywood deep dungeon."},
{id:99119,name:"Commander Skeleton Assault",tier:4,desc:"Collect 15 Skull Shoulder Pads",reqItem:4000051,reqQty:15,exp:28000,meso:35000,hint:"Commander Skeletons march through the Dungeon of Perion."},
{id:99120,name:"Ice Drake Expedition",tier:4,desc:"Collect 12 Ice Drake Scales",reqItem:4000079,reqQty:12,exp:26000,meso:32000,hint:"Ice Drakes breathe frost in the El Nath ice caves."},
{id:99121,name:"Coolie Zombie Cleanup",tier:4,desc:"Collect 15 Coolie Zombie Teeth",reqItem:4000053,reqQty:15,exp:24000,meso:28000,hint:"Coolie Zombies shamble through the Dead Mine passages."},
{id:99122,name:"Red Drake Rampage",tier:5,desc:"Collect 12 Red Drake Skulls",reqItem:4001012,reqQty:12,exp:40000,meso:50000,hint:"Red Drakes blaze through the volcanic tunnels."},
{id:99123,name:"Dark Drake Purge",tier:5,desc:"Collect 12 Dark Drake Scales",reqItem:4000105,reqQty:12,exp:42000,meso:55000,hint:"Dark Drakes lurk in the deepest caverns of El Nath."},
{id:99124,name:"Lycanthrope Hunt",tier:5,desc:"Collect 10 Lycanthrope Pelts",reqItem:4000107,reqQty:10,exp:45000,meso:60000,hint:"Lycanthropes howl in the forests beyond El Nath."},
{id:99125,name:"Hector Challenge",tier:5,desc:"Collect 12 Hector Scales",reqItem:4000104,reqQty:12,exp:38000,meso:45000,hint:"Hectors stand guard in the deepest Orbis dungeons."},
{id:99126,name:"Bain Annihilation",tier:6,desc:"Collect 10 Bain Claws",reqItem:4000244,reqQty:10,exp:60000,meso:80000,hint:"Bains terrorize the Leafre forests."},
{id:99127,name:"Birk Extermination",tier:6,desc:"Collect 10 Birk Horns",reqItem:4000108,reqQty:10,exp:55000,meso:70000,hint:"Birks wander the misty mountain paths."},
{id:99128,name:"Luster Pixie Containment",tier:6,desc:"Collect 8 Luster Pixie Wings",reqItem:4000059,reqQty:8,exp:65000,meso:85000,hint:"Luster Pixies glow dangerously in the Orbis tower."},
{id:99129,name:"Dragon Scale Collection",tier:6,desc:"Collect 10 Dragon Skins",reqItem:4000244,reqQty:10,exp:70000,meso:90000,hint:"High-level drakes drop dragon skins."},
{id:99130,name:"Dual Birk Bounty",tier:6,desc:"Collect 8 Dual Birk Fangs",reqItem:4000109,reqQty:8,exp:75000,meso:100000,hint:"Dual Birks are the deadliest creatures in the highlands."}
];

// Bonus items pool per tier (random bonus on turn-in)
var bonusItems = {
    1: [{id:2000000,qty:20,name:"Red Potion"},{id:2000001,qty:15,name:"Orange Potion"},{id:2000003,qty:10,name:"Blue Potion"}],
    2: [{id:2000002,qty:15,name:"White Potion"},{id:2000006,qty:5,name:"Mana Elixir"},{id:2010000,qty:3,name:"Apple"}],
    3: [{id:2000004,qty:5,name:"Elixir"},{id:2000006,qty:10,name:"Mana Elixir"},{id:2022000,qty:3,name:"All Cure Potion"}],
    4: [{id:2000005,qty:3,name:"Power Elixir"},{id:2000004,qty:8,name:"Elixir"},{id:2022000,qty:5,name:"All Cure Potion"}],
    5: [{id:2000005,qty:5,name:"Power Elixir"},{id:2049100,qty:1,name:"Chaos Scroll"},{id:2000004,qty:10,name:"Elixir"}],
    6: [{id:2000005,qty:10,name:"Power Elixir"},{id:2049100,qty:1,name:"Chaos Scroll"},{id:2040004,qty:1,name:"Weapon ATT 60% Scroll"}]
};

function getTodayStamp() {
    var cal = java.util.Calendar.getInstance();
    var y = cal.get(java.util.Calendar.YEAR);
    var m = cal.get(java.util.Calendar.MONTH) + 1;
    var d = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + y + (m < 10 ? "0" : "") + m + (d < 10 ? "0" : "") + d;
}

function getDaySeed() {
    var stamp = getTodayStamp();
    var seed = 0;
    for (var i = 0; i < stamp.length; i++) {
        seed = seed * 31 + stamp.charCodeAt(i);
    }
    return seed;
}

// Simple seeded PRNG (Lehmer / MINSTD)
function seededRandom(seed) {
    seed = (seed * 16807) % 2147483647;
    return { next: seed, value: (seed - 1) / 2147483646 };
}

// Pick N unique indices from array using seeded random
function pickNSeeded(arr, n, seed) {
    var indices = [];
    for (var i = 0; i < arr.length; i++) indices.push(i);
    var result = [];
    var s = seed;
    for (var j = 0; j < n && indices.length > 0; j++) {
        var r = seededRandom(s);
        s = r.next;
        var pick = Math.floor(r.value * indices.length);
        result.push(indices[pick]);
        indices.splice(pick, 1);
    }
    return result;
}

// Get this player's 3 daily quests (deterministic per player per day)
function getPlayerDailies() {
    var charId = cm.getPlayer().getId();
    var level = cm.getPlayer().getLevel();
    var seed = getDaySeed() ^ (charId * 7919);

    // Filter quests by player level tier
    var tier;
    if (level < 20) tier = 1;
    else if (level < 40) tier = 2;
    else if (level < 60) tier = 3;
    else if (level < 80) tier = 4;
    else if (level < 100) tier = 5;
    else tier = 6;

    // Include current tier and one below (so players have options)
    var eligible = [];
    for (var i = 0; i < quests.length; i++) {
        if (quests[i].tier == tier || quests[i].tier == tier - 1) {
            eligible.push(quests[i]);
        }
    }
    // Fallback: if too few, include all from lower tiers too
    if (eligible.length < 3) {
        eligible = [];
        for (var k = 0; k < quests.length; k++) {
            if (quests[k].tier <= tier) eligible.push(quests[k]);
        }
    }

    var picks = pickNSeeded(eligible, 3, Math.abs(seed));
    var result = [];
    for (var p = 0; p < picks.length; p++) {
        result.push(eligible[picks[p]]);
    }
    return result;
}

function isQuestDoneToday(questId) {
    var today = getTodayStamp();
    try {
        var record = cm.getQuestRecord(questId);
        var data = record.getCustomData();
        if (data == null) return false;
        return data == today;
    } catch(e) {
        return false;
    }
}

function markQuestDoneToday(questId) {
    try {
        var record = cm.getQuestRecord(questId);
        record.setCustomData(getTodayStamp());
    } catch(e) {}
}

function getRandomBonus(tier) {
    var pool = bonusItems[tier] || bonusItems[1];
    var idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
}

function start() {
    status = 0;
    selectedQuest = -1;
    turningIn = false;

    var dailies = getPlayerDailies();

    var menu = "#e#dCosmic Taskboard#k#n\r\n";
    menu += "Your daily quests for today. Each player gets a unique set!\r\n";
    menu += "Complete them for #bEXP, Meso, and random bonus items#k.\r\n\r\n";

    var allDone = true;
    for (var i = 0; i < dailies.length; i++) {
        var q = dailies[i];
        var done = isQuestDoneToday(q.id);

        if (done) {
            menu += "#L" + i + "##d[DONE]#k " + q.name + " (Tier " + q.tier + ")#l\r\n";
        } else {
            allDone = false;
            menu += "#L" + i + "##b" + q.name + "#k (Tier " + q.tier + ") — " + q.desc + "#l\r\n";
        }
    }

    if (allDone) {
        menu += "\r\n#eAll daily quests completed!#n Come back tomorrow.";
    }

    menu += "\r\n\r\n#L10##gRefresh Board#k#l";

    cm.sendSimple(menu);
}

function action(mode, type, selection) {
    if (mode != 1) {
        cm.dispose();
        return;
    }
    status++;

    if (status == 1) {
        if (selection == 10) {
            // Refresh — just restart
            status = 0;
            start();
            return;
        }

        var dailies = getPlayerDailies();
        if (selection < 0 || selection >= dailies.length) {
            cm.dispose();
            return;
        }

        selectedQuest = selection;
        var q = dailies[selection];

        // Check if already done today
        if (isQuestDoneToday(q.id)) {
            cm.sendOk("#b" + q.name + "#k is already completed today. Nice work!");
            cm.dispose();
            return;
        }

        var detail = "#e" + q.name + "#n (Tier " + q.tier + ")\r\n\r\n";
        detail += "#bObjective:#k " + q.desc + "\r\n";
        detail += "#bRequired:#k " + q.reqQty + "x #t" + q.reqItem + "#\r\n";
        detail += "#bReward:#k " + q.exp + " EXP + " + q.meso + " Meso + random bonus item\r\n";
        detail += "#dHint:#k " + q.hint + "\r\n\r\n";
        detail += "#L0##bAccept Quest#k — I'll go collect the items#l\r\n";
        detail += "#L1##rTurn In#k — I have the items, give me my reward!#l\r\n";
        detail += "#L2##kBack to board#k#l";

        cm.sendSimple(detail);

    } else if (status == 2) {
        var dailies = getPlayerDailies();
        if (selectedQuest < 0 || selectedQuest >= dailies.length) {
            cm.dispose();
            return;
        }
        var q = dailies[selectedQuest];

        if (selection == 2) {
            // Back to board
            status = 0;
            start();
            return;
        }

        if (selection == 0) {
            // Accept quest — show confirmation
            cm.sendOk("Quest #b" + q.name + "#k accepted!\r\n\r\nGo collect #b" + q.reqQty + "x #t" + q.reqItem + "##k and come back to turn them in.\r\n\r\n#dHint:#k " + q.hint);
            cm.dispose();
            return;
        }

        if (selection == 1) {
            // Turn in — verify items
            turningIn = true;

            if (!cm.haveItem(q.reqItem, q.reqQty)) {
                var have = 0;
                try { have = cm.itemQuantity(q.reqItem); } catch(e) {}
                cm.sendOk("#r[Not Enough Items]#k\r\n\r\nYou need #b" + q.reqQty + "x #t" + q.reqItem + "##k but only have #r" + have + "#k.\r\n\r\nKeep hunting! " + q.hint);
                cm.dispose();
                return;
            }

            // Has enough items — confirm turn-in
            cm.sendYesNo("#e[Turn In: " + q.name + "]#n\r\n\r\nI'll take your #b" + q.reqQty + "x #t" + q.reqItem + "##k.\r\n\r\nIn return you get:\r\n  #b" + q.exp + " EXP#k\r\n  #b" + q.meso + " Meso#k\r\n  #b+ Random bonus item#k\r\n\r\nConfirm turn-in?");
        }

    } else if (status == 3 && turningIn) {
        var dailies = getPlayerDailies();
        if (selectedQuest < 0 || selectedQuest >= dailies.length) {
            cm.dispose();
            return;
        }
        var q = dailies[selectedQuest];

        // Double-check items still present
        if (!cm.haveItem(q.reqItem, q.reqQty)) {
            cm.sendOk("You no longer have enough items. Did you drop them?");
            cm.dispose();
            return;
        }

        // Get random bonus
        var bonus = getRandomBonus(q.tier);

        // Check inventory space
        if (!cm.canHold(bonus.id, bonus.qty)) {
            cm.sendOk("Your inventory is full! Make some room for your bonus reward and try again.");
            cm.dispose();
            return;
        }

        // Execute turn-in!
        cm.gainItem(q.reqItem, -q.reqQty);
        cm.gainExp(q.exp);
        cm.gainMeso(q.meso);
        cm.gainItem(bonus.id, bonus.qty);
        markQuestDoneToday(q.id);

        cm.sendOk("#e#d[Quest Complete!]#k#n\r\n\r\n#b" + q.name + "#k — done for today!\r\n\r\n#eRewards:#n\r\n  +" + q.exp + " EXP\r\n  +" + q.meso + " Meso\r\n  +" + bonus.qty + "x " + bonus.name + " (bonus!)\r\n\r\nCome back tomorrow for new quests!");
        cm.dispose();
    }
}
