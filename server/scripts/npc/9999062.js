/**
 * NPC: Historian Elara (9999062)
 * Location: Lith Harbor (104000000)
 * Type: Multi-part quest chain NPC
 *
 * "The Lost Expedition" — a 5-stage quest chain across Victoria Island.
 * An ancient explorer named Captain Voss left his journal scattered in
 * fragments across dangerous areas. Players follow the trail, collecting
 * evidence from increasingly difficult zones, piecing together the story
 * of a legendary lost treasure.
 *
 * Stage tracking via quest 99006 customData:
 *   null/0 = not started
 *   1 = Stage 1 active (Henesys — Mushroom Forest)
 *   2 = Stage 2 active (Ellinia — Cursed Woods)
 *   3 = Stage 3 active (Perion — Scorched Plains)
 *   4 = Stage 4 active (Kerning — Shadow Tunnels)
 *   5 = Stage 5 active (Sleepywood — Drake's Lair)
 *   6 = Chain completed
 *
 * Stage requirements and rewards:
 *   1. 30x Mushroom Spore (4000003) — 5,000 EXP, 8,000 meso
 *   2. 20x Curse Eye Tail (4000017) — 15,000 EXP, 20,000 meso
 *   3. 25x Wild Boar Tooth (4000020) — 30,000 EXP, 35,000 meso
 *   4. 20x Zombie Mushroom Cap (4000022) — 50,000 EXP, 55,000 meso
 *   5. 10x Drake Skull (4001012) — 100,000 EXP, 80,000 meso
 *   Completion bonus: 200,000 EXP, 500,000 meso, 1x Chaos Scroll 60% (2049100)
 */

var status = -1;
var QUEST_ID = 99006;

// Stage definitions: [reqItem, reqQty, expReward, mesoReward, areaName, storyText, turnInText]
var stages = [
    // Stage 1: Henesys — Mushroom Forest
    [4000003, 30, 5000, 8000, "Henesys Mushroom Forest",
     "Captain Voss's journal begins here:\r\n\r\n" +
     "#d\"Day 1 — I've hidden the first fragment among the mushroom groves east of Henesys. " +
     "The spores there have a peculiar glow at night... anyone seeking my trail must first " +
     "understand the forest. Collect the mushroom spores — they'll reveal the ink on the next page.\"#k\r\n\r\n" +
     "I need you to gather #b30 Mushroom Spores#k from the Green Mushrooms near Henesys. " +
     "The spores react to the invisible ink in Voss's journal.",
     "Remarkable! Watch as the spores dissolve against the page... " +
     "there! New text appears! It points to #bEllinia#k — the enchanted forest to the east. " +
     "Voss traveled deeper into danger with each step."],
    // Stage 2: Ellinia — Cursed Woods
    [4000017, 20, 15000, 20000, "Ellinia Cursed Woods",
     "The second entry reads:\r\n\r\n" +
     "#d\"Day 12 — The cursed creatures of Ellinia guard the next fragment. " +
     "Their tails contain a reagent that, when combined with the right mixture, " +
     "unlocks the seal I placed on the journal's third chapter. " +
     "Beware the Curse Eyes — they see things that shouldn't be seen.\"#k\r\n\r\n" +
     "Collect #b20 Curse Eye Tails#k from the Curse Eyes in Ellinia's dungeon. " +
     "The reagent within will break Voss's seal.",
     "Yes... the chemical in these tails is unmistakable. As I apply it to the journal... " +
     "a map! Voss traveled to #bPerion#k next. The trail leads into the scorched wasteland."],
    // Stage 3: Perion — Scorched Plains
    [4000020, 25, 30000, 35000, "Perion Scorched Plains",
     "Entry three is charred at the edges:\r\n\r\n" +
     "#d\"Day 23 — The warriors of Perion know nothing of what lies beneath their feet. " +
     "I buried the third fragment in the wild boar hunting grounds. " +
     "Their tusks are sharper than any blade I've carried — proof that nature's " +
     "weapons surpass our own. Bring enough tusks and the earth will yield my secret.\"#k\r\n\r\n" +
     "Gather #b25 Wild Boar Teeth#k from the Wild Boars around Perion.",
     "These teeth are enormous! And look — one of them has a tiny scroll fragment " +
     "embedded in its root. Voss literally FED his journal to the wildlife! " +
     "The next clue points to the #bunderground tunnels near Kerning City#k."],
    // Stage 4: Kerning City — Shadow Tunnels
    [4000022, 20, 50000, 55000, "Kerning City Ant Tunnel",
     "The fourth entry is written in a shaking hand:\r\n\r\n" +
     "#d\"Day 37 — I've descended into the tunnels beneath Kerning City. " +
     "The Zombie Mushrooms here are unlike anything in the forest — corrupted, aggressive. " +
     "I hid the fourth fragment inside their spore caps. Anyone brave enough " +
     "to harvest 20 of these caps will find the chemical signature I left behind. " +
     "Almost there now. Almost.\"#k\r\n\r\n" +
     "Collect #b20 Zombie Mushroom Caps#k from the Ant Tunnel near Kerning City.",
     "The smell is terrible, but the science is sound! When I crush these caps " +
     "together... there! A phosphorescent message appears on the final blank page. " +
     "Voss's last entry points to #bSleepywood's Drake caves#k. The treasure is close!"],
    // Stage 5: Sleepywood — Drake's Lair
    [4001012, 10, 100000, 80000, "Sleepywood Drake Caves",
     "The final entry glows with an eerie light:\r\n\r\n" +
     "#d\"Day 52 — This is my last entry. I cannot carry the treasure alone. " +
     "I've sealed it behind a door that only opens when fed the skulls of " +
     "ten Drakes. The dragons guard my legacy well. Whoever reads this — " +
     "you have followed my trail across all of Victoria Island. " +
     "You have earned what I could not keep. Take it, and remember Captain Voss.\"#k\r\n\r\n" +
     "Bring me #b10 Drake Skulls#k from the Drakes in Sleepywood. This is the final step.",
     "Ten Drake Skulls... and as I arrange them in the pattern Voss described... " +
     "the journal's cover opens! Inside — a hidden compartment! And within it... " +
     "ancient scrolls of immense power, a fortune in gold, and a note that reads:\r\n\r\n" +
     "#d\"To whoever completes my expedition — you are the explorer I never could be. " +
     "May these treasures serve you better than they served me. — Captain Voss\"#k"]
];

function getStage() {
    try {
        var record = cm.getQuestRecord(QUEST_ID);
        var data = record.getCustomData();
        if (data == null || data === "") return 0;
        return parseInt(data);
    } catch(e) {
        return 0;
    }
}

function setStage(stage) {
    try {
        var record = cm.getQuestRecord(QUEST_ID);
        record.setCustomData("" + stage);
    } catch(e) {}
}

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1 || (mode == 0 && status <= 0)) {
        cm.dispose();
        return;
    }
    if (mode == 0) {
        status--;
    } else {
        status++;
    }

    var stage = getStage();

    // ── COMPLETED ──
    if (stage >= 6) {
        if (status == 0) {
            cm.sendOk("#e#kHistorian Elara#n\r\n\r\n" +
                "Ah, my favorite explorer returns! You've already completed the Lost Expedition " +
                "of Captain Voss. Your name is written in my chronicles alongside his.\r\n\r\n" +
                "Perhaps one day, another lost journal will surface... but for now, " +
                "rest on your laurels. You've earned it.\r\n\r\n" +
                "#b[The Lost Expedition — COMPLETE]#k");
            cm.dispose();
        }
        return;
    }

    // ── NOT STARTED ──
    if (stage == 0) {
        if (status == 0) {
            cm.sendNext("#e#kHistorian Elara#n\r\n\r\n" +
                "Welcome to Lith Harbor, traveler. I am Elara, keeper of Victoria Island's " +
                "forgotten histories.\r\n\r\n" +
                "Recently, I discovered something extraordinary — the journal of " +
                "#rCaptain Voss#k, a legendary explorer who vanished fifty years ago. " +
                "His journal is mostly blank... but I believe the pages are enchanted. " +
                "The text only reveals itself when exposed to specific materials found " +
                "across the island.");
        } else if (status == 1) {
            cm.sendNextPrev("#e#kHistorian Elara#n\r\n\r\n" +
                "Captain Voss was brilliant but paranoid. He scattered clues across " +
                "#bfive dangerous regions#k of Victoria Island, each one unlocking " +
                "the next chapter of his journal.\r\n\r\n" +
                "The trail leads through:\r\n" +
                "  #b1.#k Henesys Mushroom Forest\r\n" +
                "  #b2.#k Ellinia's Cursed Woods\r\n" +
                "  #b3.#k Perion's Scorched Plains\r\n" +
                "  #b4.#k Kerning City's Ant Tunnel\r\n" +
                "  #b5.#k Sleepywood's Drake Caves\r\n\r\n" +
                "At the end... Voss's legendary #rtreasure#k awaits.");
        } else if (status == 2) {
            cm.sendYesNo("#e#kHistorian Elara#n\r\n\r\n" +
                "This expedition won't be easy. Each stage requires collecting materials " +
                "from increasingly dangerous monsters. But the rewards at each step " +
                "are substantial, and the final treasure...\r\n\r\n" +
                "Well, let's just say Captain Voss didn't hide pocket change.\r\n\r\n" +
                "#bWill you undertake the Lost Expedition?#k\r\n\r\n" +
                "#e(Recommended level: 15+. The chain scales from easy to challenging.)#n");
        } else if (status == 3) {
            // Player accepted!
            setStage(1);
            var s = stages[0];
            cm.sendOk("#e#kHistorian Elara#n\r\n\r\n" +
                "Wonderful! You have the spirit of a true explorer.\r\n\r\n" +
                "#r[Stage 1 of 5: " + s[4] + "]#k\r\n\r\n" +
                s[5] + "\r\n\r\n" +
                "#eRewards for this stage:#n " + s[2] + " EXP, " + s[3] + " mesos\r\n\r\n" +
                "Return to me when you have the items. I'll be here, studying the journal.");
            cm.dispose();
        }
        return;
    }

    // ── ACTIVE STAGE (1-5) ──
    var stageIdx = stage - 1; // 0-4
    var s = stages[stageIdx];

    if (status == 0) {
        var menu = "#e#kHistorian Elara — The Lost Expedition#n\r\n";
        menu += "#b[Stage " + stage + " of 5: " + s[4] + "]#k\r\n\r\n";
        menu += "#L0##bTurn in items (" + s[1] + "x #t" + s[0] + "#)#l\r\n";
        menu += "#L1##bRemind me what I need#l\r\n";
        menu += "#L2##bHow far am I?#l#k";
        cm.sendSimple(menu);
    } else if (status == 1) {
        if (selection == 2) {
            // Progress overview
            var prog = "#e#kExpedition Progress#n\r\n\r\n";
            for (var i = 0; i < stages.length; i++) {
                var marker;
                if (i < stageIdx) {
                    marker = "#g[COMPLETE]#k ";
                } else if (i == stageIdx) {
                    marker = "#r[CURRENT]#k ";
                } else {
                    marker = "#d[LOCKED]#k ";
                }
                prog += marker + "Stage " + (i + 1) + ": " + stages[i][4] + "\r\n";
            }
            prog += "\r\nFinal reward: #b200,000 EXP + 500,000 meso + Chaos Scroll 60%#k";
            cm.sendOk(prog);
            cm.dispose();
            return;
        }

        if (selection == 1) {
            // Reminder
            cm.sendOk("#e[Stage " + stage + ": " + s[4] + "]#n\r\n\r\n" +
                s[5] + "\r\n\r\n" +
                "Required: #b" + s[1] + "x #t" + s[0] + "##k\r\n" +
                "You have: #r" + cm.itemQuantity(s[0]) + "#k\r\n\r\n" +
                "#eRewards:#n " + s[2] + " EXP, " + s[3] + " mesos");
            cm.dispose();
            return;
        }

        if (selection == 0) {
            // Turn in attempt
            if (!cm.haveItem(s[0], s[1])) {
                cm.sendOk("#e[Not enough items]#n\r\n\r\n" +
                    "You need #b" + s[1] + "x #t" + s[0] + "##k but only have #r" + cm.itemQuantity(s[0]) + "#k.\r\n\r\n" +
                    "Keep collecting! The expedition demands perseverance.");
                cm.dispose();
                return;
            }

            // Consume items
            cm.gainItem(s[0], -s[1]);

            // Stage rewards
            cm.gainExp(s[2]);
            cm.gainMeso(s[3]);

            var nextStage = stage + 1;

            if (nextStage <= 5) {
                // Advance to next stage
                setStage(nextStage);
                var ns = stages[nextStage - 1];
                cm.sendOk("#e[Stage " + stage + " Complete!]#n\r\n\r\n" +
                    s[6] + "\r\n\r\n" +
                    "#fUI/UIWindow.img/QuestIcon/4/0#\r\n" +
                    "#eReceived:#n " + s[2] + " EXP, " + s[3] + " mesos\r\n\r\n" +
                    "#r[Stage " + nextStage + " of 5: " + ns[4] + "]#k\r\n\r\n" +
                    ns[5] + "\r\n\r\n" +
                    "Required: #b" + ns[1] + "x #t" + ns[0] + "##k");
                cm.dispose();
            } else {
                // Chain complete! Give bonus rewards
                setStage(6);
                cm.gainExp(200000);
                cm.gainMeso(500000);
                if (cm.canHold(2049100)) {
                    cm.gainItem(2049100, 1);
                }

                cm.sendOk("#e[THE LOST EXPEDITION — COMPLETE!]#n\r\n\r\n" +
                    s[6] + "\r\n\r\n" +
                    "#fUI/UIWindow.img/QuestIcon/4/0#\r\n" +
                    "#eStage 5 Rewards:#n " + s[2] + " EXP, " + s[3] + " mesos\r\n\r\n" +
                    "#e#rCOMPLETION BONUS:#n\r\n" +
                    "  200,000 EXP\r\n" +
                    "  500,000 Mesos\r\n" +
                    "  1x #v2049100# Chaos Scroll 60%\r\n\r\n" +
                    "#eTOTAL CHAIN REWARDS:#n\r\n" +
                    "  400,000 EXP across all stages\r\n" +
                    "  698,000 Mesos across all stages\r\n" +
                    "  1x Chaos Scroll 60%\r\n\r\n" +
                    "Congratulations, explorer. Captain Voss would be proud. " +
                    "Your name will be forever recorded in the Chronicles of Victoria Island.");
                cm.dispose();
            }
        }
    } else {
        cm.dispose();
    }
}
