/**
 * NPC: Wandering Collector Lena (9999061)
 * Location: Henesys (100000000)
 * Purpose: Collection challenges — themed sets of mob drops for EXP/meso/item rewards.
 *          Encourages exploration across Victoria Island at every level range.
 *
 * Collections (quest-based tracking):
 *   99300 - Forest Forager (lv10-20): Snail Shell + Blue Snail Shell + Mushroom Spore
 *   99301 - Swamp Surveyor (lv20-35): Ligator Skin + Horny Mushroom Cap + Jr. Necki Skin
 *   99302 - Fire & Ice (lv30-50): Fire Boar Mane + Ice Drake Scale + Zombie Mushroom Cap
 *   99303 - Dark Expedition (lv50-70): Curse Eye Tail + Jr. Wraith Cloth + Wild Boar Tooth
 *   99304 - Master Naturalist (lv70+): Drake Skull + Tauromacis Horn + Jr. Balrog Wing
 */

var status;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1) {
        cm.dispose();
        return;
    }
    if (mode === 0 && status <= 0) {
        cm.dispose();
        return;
    }
    if (mode === 1) {
        status++;
    } else {
        status--;
    }

    var level = cm.getLevel();

    if (status === 0) {
        // Check for any active collections first
        var activeQuest = getActiveCollection();
        if (activeQuest > 0) {
            showTurnIn(activeQuest);
            return;
        }

        // Build menu of available collections
        var menu = "#bWandering Collector Lena#k\r\n\r\n" +
            "Oh, a fellow adventurer! I travel all over Victoria Island collecting rare specimens. " +
            "Would you help me complete a collection? The rewards are quite generous!\r\n\r\n";

        var options = "";
        var count = 0;
        if (!cm.isQuestCompleted(99300) && level >= 10) {
            options += "#L" + count + "##bForest Forager#k (Lv10-20) — Collect forest specimens" + (cm.isQuestCompleted(99300) ? " #r[DONE]#k" : "") + "#l\r\n";
            count++;
        }
        if (!cm.isQuestCompleted(99301) && level >= 20) {
            options += "#L" + count + "##bSwamp Surveyor#k (Lv20-35) — Gather swamp creature parts#l\r\n";
            count++;
        }
        if (!cm.isQuestCompleted(99302) && level >= 30) {
            options += "#L" + count + "##bFire & Ice#k (Lv30-50) — Opposing elemental specimens#l\r\n";
            count++;
        }
        if (!cm.isQuestCompleted(99303) && level >= 50) {
            options += "#L" + count + "##bDark Expedition#k (Lv50-70) — Cursed creature materials#l\r\n";
            count++;
        }
        if (!cm.isQuestCompleted(99304) && level >= 70) {
            options += "#L" + count + "##bMaster Naturalist#k (Lv70+) — Rare boss-tier specimens#l\r\n";
            count++;
        }

        if (count === 0) {
            cm.sendOk("#bWandering Collector Lena#k\r\n\r\nYou've completed every collection I have! " +
                "You truly are a master naturalist. Thank you for all your help — " +
                "my research journal is now complete thanks to you!\r\n\r\n" +
                "#r[All collections completed!]#k");
            cm.dispose();
            return;
        }

        cm.sendSimple(menu + options);
    } else if (status === 1) {
        // Player selected a collection
        var level2 = cm.getLevel();
        var availableCollections = [];
        if (!cm.isQuestCompleted(99300) && level2 >= 10) availableCollections.push(99300);
        if (!cm.isQuestCompleted(99301) && level2 >= 20) availableCollections.push(99301);
        if (!cm.isQuestCompleted(99302) && level2 >= 30) availableCollections.push(99302);
        if (!cm.isQuestCompleted(99303) && level2 >= 50) availableCollections.push(99303);
        if (!cm.isQuestCompleted(99304) && level2 >= 70) availableCollections.push(99304);

        if (selection < 0 || selection >= availableCollections.length) {
            cm.dispose();
            return;
        }

        var questId = availableCollections[selection];
        showCollectionDetails(questId);
    } else if (status === 2) {
        // Confirm accept collection or turn-in
        var active = getActiveCollection();
        if (active > 0) {
            tryTurnIn(active);
        } else {
            // Accept the collection — figure out which one based on rebuilt list
            var level3 = cm.getLevel();
            var avail2 = [];
            if (!cm.isQuestCompleted(99300) && level3 >= 10) avail2.push(99300);
            if (!cm.isQuestCompleted(99301) && level3 >= 20) avail2.push(99301);
            if (!cm.isQuestCompleted(99302) && level3 >= 30) avail2.push(99302);
            if (!cm.isQuestCompleted(99303) && level3 >= 50) avail2.push(99303);
            if (!cm.isQuestCompleted(99304) && level3 >= 70) avail2.push(99304);
            // We stored selection at status=1, use previous selection
            // Since we can't easily pass data between statuses, start the quest shown
            // The YesNo from showCollectionDetails triggers this
            cm.sendOk("Collection accepted! Good luck out there, adventurer!");
            cm.dispose();
        }
    }
}

function getActiveCollection() {
    if (cm.isQuestStarted(99300) && !cm.isQuestCompleted(99300)) return 99300;
    if (cm.isQuestStarted(99301) && !cm.isQuestCompleted(99301)) return 99301;
    if (cm.isQuestStarted(99302) && !cm.isQuestCompleted(99302)) return 99302;
    if (cm.isQuestStarted(99303) && !cm.isQuestCompleted(99303)) return 99303;
    if (cm.isQuestStarted(99304) && !cm.isQuestCompleted(99304)) return 99304;
    return -1;
}

function showCollectionDetails(questId) {
    var desc = "";
    if (questId === 99300) {
        desc = "#bForest Forager Collection#k\r\n\r\n" +
            "I need specimens from the forest creatures near Henesys and Ellinia:\r\n\r\n" +
            "#v4000000# 20 #t4000000# (Green Snails — Henesys)\r\n" +
            "#v4000016# 20 #t4000016# (Blue Snails — Henesys)\r\n" +
            "#v4000019# 15 #t4000019# (Shrooms — Ellinia)\r\n\r\n" +
            "#eRewards:#n 3,000 EXP + 10,000 Meso + 5 #t2002036#\r\n\r\n" +
            "Would you like to take on this collection?";
    } else if (questId === 99301) {
        desc = "#bSwamp Surveyor Collection#k\r\n\r\n" +
            "The swamp creatures of Victoria Island are fascinating:\r\n\r\n" +
            "#v4000032# 20 #t4000032# (Ligators — Kerning Swamp)\r\n" +
            "#v4000024# 25 #t4000024# (Horny Mushrooms — Ant Tunnel)\r\n" +
            "#v4000034# 15 #t4000034# (Jr. Neckis — Kerning City)\r\n\r\n" +
            "#eRewards:#n 8,000 EXP + 25,000 Meso + 5 #t2002031#\r\n\r\n" +
            "Would you like to take on this collection?";
    } else if (questId === 99302) {
        desc = "#bFire & Ice Collection#k\r\n\r\n" +
            "Opposing elements — the key to understanding magic:\r\n\r\n" +
            "#v4000082# 30 #t4000082# (Fire Boars — Perion)\r\n" +
            "#v4000185# 20 #t4000185# (Ice Drakes — El Nath)\r\n" +
            "#v4000023# 25 #t4000023# (Zombie Mushrooms — Ant Tunnel)\r\n\r\n" +
            "#eRewards:#n 15,000 EXP + 50,000 Meso + 10 #t2002036#\r\n\r\n" +
            "Would you like to take on this collection?";
    } else if (questId === 99303) {
        desc = "#bDark Expedition Collection#k\r\n\r\n" +
            "The darkest corners of Victoria Island hold powerful specimens:\r\n\r\n" +
            "#v4000007# 40 #t4000007# (Curse Eyes — Ellinia Dungeon)\r\n" +
            "#v4000058# 30 #t4000058# (Jr. Wraiths — Dead Mine)\r\n" +
            "#v4000020# 25 #t4000020# (Wild Boars — Perion)\r\n\r\n" +
            "#eRewards:#n 30,000 EXP + 100,000 Meso + 3 #t2030021# (Cosmic Return Scroll)\r\n\r\n" +
            "Would you like to take on this collection?";
    } else if (questId === 99304) {
        desc = "#bMaster Naturalist Collection#k\r\n\r\n" +
            "Only the strongest adventurers can gather these:\r\n\r\n" +
            "#v4000014# 20 #t4000014# (Drakes — Sleepywood)\r\n" +
            "#v4000028# 15 #t4000028# (Tauromacis — Leafre)\r\n" +
            "#v4031216# 5 #t4031216# (Jr. Balrog — various dungeons)\r\n\r\n" +
            "#eRewards:#n 80,000 EXP + 250,000 Meso + 1 #t2030021# + 1 #t2002037# x50\r\n\r\n" +
            "Would you like to take on this collection?";
    }

    cm.startQuest(questId);
    cm.sendOk("#bWandering Collector Lena#k\r\n\r\n" + desc + "\r\n\r\n#rCollection started! Gather the items and return to me.#k");
    cm.dispose();
}

function showTurnIn(questId) {
    var items = getCollectionItems(questId);
    var hasAll = true;
    var progressText = "#bCollection Progress#k\r\n\r\n";

    for (var i = 0; i < items.length; i++) {
        var have = cm.itemQuantity(items[i].id);
        var need = items[i].count;
        var ok = have >= need;
        if (!ok) hasAll = false;
        progressText += "#v" + items[i].id + "# " + (ok ? "#g" : "#r") + have + " / " + need + "#k #t" + items[i].id + "#\r\n";
    }

    if (hasAll) {
        progressText += "\r\n#g[All items collected!]#k Click Next to turn in.";
        cm.sendNext("#bWandering Collector Lena#k\r\n\r\n" +
            "Oh wonderful! You have everything I need!\r\n\r\n" + progressText);
    } else {
        progressText += "\r\n#r[Still collecting...]#k Keep hunting!";
        cm.sendOk("#bWandering Collector Lena#k\r\n\r\n" +
            "How's the collection going?\r\n\r\n" + progressText);
        cm.dispose();
    }
}

function tryTurnIn(questId) {
    var items = getCollectionItems(questId);

    // Verify all items
    for (var i = 0; i < items.length; i++) {
        if (!cm.haveItem(items[i].id, items[i].count)) {
            cm.sendOk("Hmm, it seems you're missing some items. Keep collecting!");
            cm.dispose();
            return;
        }
    }

    // Remove items
    for (var i = 0; i < items.length; i++) {
        cm.gainItem(items[i].id, -items[i].count);
    }

    // Give rewards
    var rewards = getCollectionRewards(questId);
    cm.gainExp(rewards.exp);
    cm.gainMeso(rewards.meso);
    if (rewards.items) {
        for (var i = 0; i < rewards.items.length; i++) {
            cm.gainItem(rewards.items[i].id, rewards.items[i].count);
        }
    }
    cm.completeQuest(questId);

    var rewardText = "#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n" +
        "+" + rewards.exp + " EXP | +" + rewards.meso + " Meso";
    if (rewards.items) {
        for (var i = 0; i < rewards.items.length; i++) {
            rewardText += "\r\n#v" + rewards.items[i].id + "# " + rewards.items[i].count + " #t" + rewards.items[i].id + "#";
        }
    }

    var names = ["Forest Forager", "Swamp Surveyor", "Fire & Ice", "Dark Expedition", "Master Naturalist"];
    var idx = questId - 99300;

    cm.sendOk("#bWandering Collector Lena#k\r\n\r\n" +
        "Magnificent! The #b" + names[idx] + "#k collection is complete! " +
        "These specimens will advance my research tremendously.\r\n\r\n" + rewardText +
        "\r\n\r\n#eCollections completed: " + countCompleted() + " / 5#n");
    cm.dispose();
}

function getCollectionItems(questId) {
    if (questId === 99300) return [{id:4000000,count:20},{id:4000016,count:20},{id:4000019,count:15}];
    if (questId === 99301) return [{id:4000032,count:20},{id:4000024,count:25},{id:4000034,count:15}];
    if (questId === 99302) return [{id:4000082,count:30},{id:4000185,count:20},{id:4000023,count:25}];
    if (questId === 99303) return [{id:4000007,count:40},{id:4000058,count:30},{id:4000020,count:25}];
    if (questId === 99304) return [{id:4000014,count:20},{id:4000028,count:15},{id:4031216,count:5}];
    return [];
}

function getCollectionRewards(questId) {
    if (questId === 99300) return {exp:3000, meso:10000, items:[{id:2002036,count:5}]};
    if (questId === 99301) return {exp:8000, meso:25000, items:[{id:2002031,count:5}]};
    if (questId === 99302) return {exp:15000, meso:50000, items:[{id:2002036,count:10}]};
    if (questId === 99303) return {exp:30000, meso:100000, items:[{id:2030021,count:3}]};
    if (questId === 99304) return {exp:80000, meso:250000, items:[{id:2030021,count:1},{id:2002037,count:50}]};
    return {exp:0, meso:0};
}

function countCompleted() {
    var c = 0;
    if (cm.isQuestCompleted(99300)) c++;
    if (cm.isQuestCompleted(99301)) c++;
    if (cm.isQuestCompleted(99302)) c++;
    if (cm.isQuestCompleted(99303)) c++;
    if (cm.isQuestCompleted(99304)) c++;
    return c;
}
