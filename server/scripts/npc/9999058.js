/**
 * NPC: Shady Shane (9999058)
 * Location: Kerning City (103000000)
 * Purpose: Mystery Box merchant - meso sink with tiered random rewards
 * Daily limit: 10 boxes per day (tracked via quest record 99099)
 */

var status;
var selectedBox = -1;

var bronzeLoot = [
    [2000000, 10, 25], [2000003, 5, 20], [2000006, 3, 15],
    [4000019, 5, 15], [4010000, 3, 12], [4010001, 3, 12],
    [4020000, 2, 10], [4020001, 2, 10], [2002037, 3, 8],
    [2002031, 2, 6], [2002032, 2, 6], [2002033, 2, 6], [0, 5000, 20]
];

var silverLoot = [
    [2000006, 10, 20], [2002037, 5, 15], [4010003, 3, 12],
    [4010004, 2, 10], [4010005, 2, 10], [4020005, 2, 10],
    [4020006, 2, 10], [2040002, 1, 8], [2040302, 1, 8],
    [2044302, 1, 7], [2040502, 1, 7], [4010006, 2, 8],
    [0, 25000, 15], [2002031, 5, 8], [2002032, 5, 8]
];

var goldLoot = [
    [2040002, 1, 15], [2040802, 1, 12], [2044002, 1, 10],
    [2043002, 1, 10], [2043302, 1, 10], [4020008, 3, 12],
    [4010007, 3, 12], [2002037, 15, 10], [0, 100000, 15],
    [1302134, 1, 3], [1382081, 1, 3], [1452086, 1, 3],
    [1332100, 1, 3], [1492049, 1, 3], [2049100, 1, 2], [0, 500000, 5]
];

var diamondLoot = [
    [2049100, 1, 15], [2340000, 1, 5], [2040804, 1, 8],
    [2044004, 1, 8], [2043004, 1, 8], [0, 500000, 15],
    [0, 2000000, 5], [1302134, 1, 6], [1382081, 1, 6],
    [1452086, 1, 6], [1332100, 1, 6], [1442104, 1, 4],
    [1472101, 1, 4], [1482047, 1, 4], [2002037, 30, 8],
    [4020008, 10, 8], [4010007, 10, 8]
];

var boxNames = ["Bronze", "Silver", "Gold", "Diamond"];
var boxCosts = [10000, 50000, 200000, 1000000];
var boxLoots = [bronzeLoot, silverLoot, goldLoot, diamondLoot];

function pickRandom(lootTable) {
    var totalWeight = 0;
    for (var i = 0; i < lootTable.length; i++) totalWeight += lootTable[i][2];
    var roll = Math.floor(Math.random() * totalWeight);
    var cumulative = 0;
    for (var i = 0; i < lootTable.length; i++) {
        cumulative += lootTable[i][2];
        if (roll < cumulative) return lootTable[i];
    }
    return lootTable[lootTable.length - 1];
}

function getDailyCount() {
    try {
        var record = cm.getQuestRecord(99099);
        var data = record.getCustomData();
        if (data !== null && data !== "") {
            var parts = data.split("|");
            var today = new java.text.SimpleDateFormat("yyyyMMdd").format(new java.util.Date());
            if (parts[0] === today) return parseInt(parts[1]) || 0;
        }
    } catch(e) {}
    return 0;
}

function setDailyCount(count) {
    var today = new java.text.SimpleDateFormat("yyyyMMdd").format(new java.util.Date());
    cm.getQuestRecord(99099).setCustomData(today + "|" + count);
}

function start() { status = -1; action(1, 0, 0); }

function action(mode, type, sel) {
    if (mode === -1) { cm.dispose(); return; }
    if (mode === 0 && status <= 0) { cm.dispose(); return; }
    if (mode === 1) status++; else status--;

    if (status === 0) {
        var dailyCount = getDailyCount();
        var remaining = 10 - dailyCount;
        var text = "#bShady Shane#k: Psst... hey you. Yeah, you. Want to try your luck?\r\n\r\n";
        text += "I have mystery boxes straight from the #bCosmic Vault#k. Each one holds... well, that is the mystery, right?\r\n\r\n";
        text += "#rToday: " + dailyCount + "/10 opened#k" + (remaining > 0 ? " (" + remaining + " remaining)" : " -- #rSOLD OUT for today!#k") + "\r\n\r\n";
        if (remaining <= 0) {
            cm.sendOk(text + "Come back tomorrow, friend. Even I need to restock.");
            cm.dispose(); return;
        }
        text += "#L0##b[Bronze Box]#k -- 10,000 meso (common goodies)#l\r\n";
        text += "#L1##b[Silver Box]#k -- 50,000 meso (scrolls and rare ores)#l\r\n";
        text += "#L2##b[Gold Box]#k -- 200,000 meso (equipment and scrolls)#l\r\n";
        text += "#L3##b[Diamond Box]#k -- 1,000,000 meso (legendary loot!)#l\r\n";
        text += "#L4#What is in each box?#l\r\n";
        text += "#L5#No thanks.#l";
        cm.sendSimple(text);
    } else if (status === 1) {
        selectedBox = sel;
        if (sel === 5) { cm.sendOk("#bShady Shane#k: Smart. But boring. Come back when you feel lucky!"); cm.dispose(); return; }
        if (sel === 4) {
            var info = "#bShady Shane#k: Here is what you might find...\r\n\r\n";
            info += "#d[Bronze - 10K]#k Potions, ores, ETC items, custom consumables\r\n\r\n";
            info += "#d[Silver - 50K]#k 60% scrolls, rare ores, crystals\r\n\r\n";
            info += "#d[Gold - 200K]#k ATK scrolls, custom weapons, big meso prizes\r\n\r\n";
            info += "#d[Diamond - 1M]#k Chaos/White Scrolls, all custom weapons, MEGA jackpots\r\n\r\n";
            info += "Every box gives you #bsomething#k. No duds.";
            cm.sendOk(info); cm.dispose(); return;
        }
        if (sel < 0 || sel > 3) { cm.dispose(); return; }
        var cost = boxCosts[sel];
        if (cm.getMeso() < cost) {
            cm.sendOk("#bShady Shane#k: Not enough meso for a #b" + boxNames[sel] + " Box#k. Need #b" + cost + " meso#k.");
            cm.dispose(); return;
        }
        cm.sendYesNo("#bShady Shane#k: A #b" + boxNames[sel] + " Box#k for #b" + cost + " meso#k? No refunds!\r\nFeeling lucky?");
    } else if (status === 2) {
        var cost = boxCosts[selectedBox];
        if (cm.getMeso() < cost) { cm.sendOk("Not enough meso anymore!"); cm.dispose(); return; }
        var result = pickRandom(boxLoots[selectedBox]);
        var itemId = result[0]; var quantity = result[1];
        if (itemId !== 0 && !cm.canHold(itemId)) {
            cm.sendOk("#bShady Shane#k: Inventory full! Make space first.");
            cm.dispose(); return;
        }
        cm.gainMeso(-cost);
        var resultText;
        if (itemId === 0) {
            cm.gainMeso(quantity);
            resultText = quantity >= 500000
                ? "#rJACKPOT!!!#k\r\nYou won #b" + quantity + " meso#k!\r\nShane looks visibly distressed..."
                : "You found #b" + quantity + " meso#k inside! Not bad...";
        } else {
            cm.gainItem(itemId, quantity);
            var isBigWin = (selectedBox >= 2 && itemId >= 1300000 && itemId < 1500000) || itemId === 2340000 || itemId === 2049100;
            resultText = isBigWin
                ? "#rRARE FIND!!#k\r\nYou got: #v" + itemId + "# #b" + quantity + "x #t" + itemId + "##k\r\nShane whistles..."
                : "You got: #v" + itemId + "# #b" + quantity + "x #t" + itemId + "##k\r\nEvery box is a winner!";
        }
        var dailyCount = getDailyCount();
        setDailyCount(dailyCount + 1);
        var remaining = 10 - (dailyCount + 1);
        resultText = "#bShady Shane#k: *crack* The " + boxNames[selectedBox] + " Box opens...\r\n\r\n" + resultText;
        resultText += "\r\n\r\nBoxes remaining today: #b" + remaining + "#k";
        cm.sendOk(resultText);
        cm.dispose();
    }
}
