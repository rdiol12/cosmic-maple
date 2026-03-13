/**
 * NPC: Sage Lorekeeper Vahn (9999031)
 * Location: Sage Spire Entrance (990100000)
 * Purpose: Sage quest chain (99010-99014)
 *
 * Quest chain:
 *   99010 - The Sage's Calling (intro, instant)
 *   99011 - Elemental Harvest (collect 30 Blue Mushroom Caps)
 *   99012 - Eyes of the Curse (collect 50 Curse Eye Tails from Curse Eyes)
 *   99013 - Trial of the Elements (collect 30 Fire Boar Manes + 30 Jr. Wraith Cloths)
 *   99014 - Sage's Legacy (final reward)
 */

var status;
var selection;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, sel) {
    if (mode === -1) {
        cm.dispose();
        return;
    }
    if (mode === 0 && status === 0) {
        cm.dispose();
        return;
    }
    if (mode === 1) {
        status++;
    } else {
        status--;
    }

    var job = cm.getJobId();
    var isSage = (job >= 600 && job <= 699);

    // Not a Sage at all
    if (!isSage) {
        cm.sendOk("This spire is restricted to the Order of Sages. Seek out Sage Instructor Elara in Ellinia if you wish to join our ranks.");
        cm.dispose();
        return;
    }

    // Quest states
    var q10 = cm.isQuestCompleted(99010);
    var q11 = cm.isQuestCompleted(99011);
    var q12 = cm.isQuestCompleted(99012);
    var q13 = cm.isQuestCompleted(99013);
    var q14 = cm.isQuestCompleted(99014);
    var q10s = cm.isQuestStarted(99010);
    var q11s = cm.isQuestStarted(99011);
    var q12s = cm.isQuestStarted(99012);
    var q13s = cm.isQuestStarted(99013);
    var q14s = cm.isQuestStarted(99014);

    if (status === 0) {
        // Determine what to show
        if (!q10 && !q10s) {
            // Offer intro quest
            cm.sendNext("#bLorekeeper Vahn#k: Ah... a new Sage enters the Spire. I am Vahn, keeper of the Arcane Archives. The Sage's path is ancient and demanding.\r\n\r\nWill you hear the history of our order?");
        } else if (q10s && !q10) {
            // Complete intro quest
            cm.sendNext("Welcome back. The path of the Sage begins here, within these hallowed halls. Let me grant you your first tome.");
        } else if (q10 && !q11s && !q11) {
            // Offer Elemental Harvest
            cm.sendNext("#bLorekeeper Vahn#k: Your first task: the Elementalist studies require #bBlue Mushroom Caps#k. These caps hold residual elemental energy useful for our experiments.\r\n\r\nBring me #b30 Blue Mushroom Caps#k from the forests near Ellinia.");
        } else if (q11s && !q11) {
            // Check Elemental Harvest
            var have = cm.haveItem(4000103, 30);
            if (have) {
                cm.sendNext("#bLorekeeper Vahn#k: You've returned with the Blue Mushroom Caps. Excellent! I can sense the elemental residue in them. Hand them over.");
            } else {
                var count = cm.itemQuantity(4000103);
                cm.sendOk("#bLorekeeper Vahn#k: You still need more Blue Mushroom Caps. You have #b" + count + " / 30#k. The Blue Mushrooms live in the forests of Ellinia.");
                cm.dispose();
                return;
            }
        } else if (q11 && !q12s && !q12) {
            // Offer Eyes of the Curse
            cm.sendNext("#bLorekeeper Vahn#k: Excellent work. Now for a more dangerous task. The #bCurse Eyes#k that haunt Ellinia's dungeon contain crystallized curse energy — potent fuel for Arcane experiments.\r\n\r\nCollect #b50 Curse Eye Tails#k from them and bring them to me. Each tail holds a fragment of cursed energy.");
        } else if (q12s && !q12) {
            // Check Eyes of the Curse - verify item collection
            var hasTails = cm.haveItem(4000007, 50);
            if (hasTails) {
                cm.sendNext("#bLorekeeper Vahn#k: I can feel the curse energy pulsing from those tails. You've done well, Sage. Hand them over.");
            } else {
                var tailCount = cm.itemQuantity(4000007);
                cm.sendOk("#bLorekeeper Vahn#k: You still need more Curse Eye Tails. You have #b" + tailCount + " / 50#k. The Curse Eyes lurk in the caverns east of Ellinia.");
                cm.dispose();
                return;
            }
        } else if (q12 && !q13s && !q13) {
            // Offer Trial of Elements
            cm.sendNext("#bLorekeeper Vahn#k: The time for the #bTrial of the Elements#k has come. You must demonstrate command over fire and spirit.\r\n\r\nCollect #b30 Fire Boar Manes#k from Fire Boars in Perion and #b30 Jr. Wraith Cloths#k from the wraiths of the Dead Mine. Bring them as proof of your elemental mastery.");
        } else if (q13s && !q13) {
            // Check Trial of the Elements - verify item collection
            var hasManes = cm.haveItem(4000082, 30);
            var hasCloths = cm.haveItem(4000058, 30);
            if (hasManes && hasCloths) {
                cm.sendNext("#bLorekeeper Vahn#k: Fire and spirit — both conquered! The elemental essence in these trophies is remarkable. You are ready.");
            } else {
                var maneCount = cm.itemQuantity(4000082);
                var clothCount = cm.itemQuantity(4000058);
                cm.sendOk("#bLorekeeper Vahn#k: The Trial of the Elements continues.\r\n\r\nFire Boar Manes: #b" + maneCount + " / 30#k (Fire Boars in Perion)\r\nJr. Wraith Cloths: #b" + clothCount + " / 30#k (Jr. Wraiths in the Dead Mine)\r\n\r\nReturn when you have both.");
                cm.dispose();
                return;
            }
        } else if (q13 && !q14s && !q14) {
            // Offer Legacy quest
            cm.sendNext("#bLorekeeper Vahn#k: You have proven yourself worthy of the Sage's Legacy. I have one final honor to bestow upon you.\r\n\r\nAccept the #bSage's Insight Ring#k — forged from crystallized elemental essence. Wear it with pride, Sage.");
        } else if (q14s && !q14) {
            cm.sendNext("#bLorekeeper Vahn#k: Receive the Sage's Legacy, champion of the Order.");
        } else if (q14) {
            cm.sendOk("#bLorekeeper Vahn#k: The archives are open to you, Sage. You are always welcome in the Spire.");
            cm.dispose();
            return;
        } else {
            cm.sendOk("#bLorekeeper Vahn#k: Greetings, Sage. The Spire's archives await your study.");
            cm.dispose();
            return;
        }
    } else if (status === 1) {
        if (!q10 && !q10s) {
            // Start intro quest 99010
            cm.startQuest(99010);
            cm.completeQuest(99010);
            cm.gainExp(1000);
            cm.gainItem(2002037, 10); // Sage Tea x10
            cm.sendOk("#bLorekeeper Vahn#k: You are now part of the Order. #fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n#v2002037# 10 #t2002037#\r\n+1,000 EXP\r\n\r\nExplore the Spire and return when you are ready for your first assignment.");
        } else if (q10s && !q10) {
            cm.completeQuest(99010);
            cm.gainExp(1000);
            cm.gainItem(2002037, 10);
            cm.sendOk("Quest complete! +1,000 EXP\r\n#v2002037# 10 #t2002037#");
        } else if (q10 && !q11s && !q11) {
            // Start Elemental Harvest
            cm.startQuest(99011);
            cm.sendOk("#bLorekeeper Vahn#k: The Blue Mushrooms can be found throughout the forests east of Ellinia. Bring me #b30 Blue Mushroom Caps#k.\r\n\r\nQuest started: #bElemental Harvest#k");
        } else if (q11s && !q11) {
            // Complete Elemental Harvest
            cm.gainItem(4000103, -30);
            cm.completeQuest(99011);
            cm.gainExp(5000);
            cm.gainItem(2002031, 5); // Elixir of Rage x5
            cm.sendOk("#bLorekeeper Vahn#k: Perfect specimens. Your elemental affinity grows. #fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n#v2002031# 5 #t2002031#\r\n+5,000 EXP");
        } else if (q11 && !q12s && !q12) {
            // Start Eyes of the Curse
            cm.startQuest(99012);
            cm.sendOk("Quest started: #bEyes of the Curse#k\r\nCollect 50 #bCurse Eye Tails#k (#v4000007#) from Curse Eyes in Ellinia's dungeons.");
        } else if (q12s && !q12) {
            // Complete Eyes of the Curse - consume tails
            cm.gainItem(4000007, -50);
            cm.completeQuest(99012);
            cm.gainExp(8000);
            cm.gainMeso(20000);
            cm.gainItem(2002037, 10);
            cm.sendOk("#bLorekeeper Vahn#k: The curse energy is potent! Well done. #fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n+8,000 EXP | +20,000 Meso\r\n#v2002037# 10 #t2002037#");
        } else if (q12 && !q13s && !q13) {
            // Start Trial of the Elements
            cm.startQuest(99013);
            cm.sendOk("Quest started: #bTrial of the Elements#k\r\n\r\nCollect:\r\n• 30 #bFire Boar Manes#k (#v4000082#) from Fire Boars (Perion)\r\n• 30 #bJr. Wraith Cloths#k (#v4000058#) from Jr. Wraiths (Dead Mine)\r\n\r\nReturn when you have both.");
        } else if (q13s && !q13) {
            // Complete Trial of the Elements - consume items
            cm.gainItem(4000082, -30);
            cm.gainItem(4000058, -30);
            cm.completeQuest(99013);
            cm.gainExp(15000);
            cm.gainItem(2002031, 10); // Elixir of Rage x10
            cm.gainItem(2002032, 10); // Mana Crystal x10
            cm.sendOk("#bLorekeeper Vahn#k: The elements bow to your will! #fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n+15,000 EXP\r\n#v2002031# 10 #t2002031#\r\n#v2002032# 10 #t2002032#");
        } else if (q13 && !q14s && !q14) {
            // Start and complete Legacy quest
            cm.startQuest(99014);
            cm.completeQuest(99014);
            cm.gainExp(30000);
            cm.gainMeso(100000);
            cm.gainItem(1122250, 1); // Sage's Insight Ring (custom)
            cm.sendOk("#bLorekeeper Vahn#k: The Sage's Legacy is yours! #fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n#v1122250# 1 #t1122250# [INT +5, MAD +10]\r\n+30,000 EXP | +100,000 Meso\r\n\r\nYou have completed the Sage Quest Chain. Glory to the Order!");
        } else if (q14s && !q14) {
            cm.completeQuest(99014);
            cm.gainExp(30000);
            cm.gainMeso(100000);
            cm.gainItem(1122250, 1);
            cm.sendOk("Quest chain complete! Sage's Legacy received.");
        }
        cm.dispose();
    }
}
