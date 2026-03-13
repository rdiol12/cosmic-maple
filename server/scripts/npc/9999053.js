/* The Lorekeeper — Lore Archivist (9999053)
 * Located in Henesys (100000000) — Library Area
 * Purpose: Hub NPC for "Echoes of History" lore fragment collection system
 *
 * Personality: Elderly scholar, measured and thoughtful. Collects world lore fragments.
 * Players complete existing quests (Elder Cormac 99070, Treasure Hunter Kai 99006,
 * Vesper the Chronicler 99100) to unlock lore fragments and unlock narrative entries
 * about world history. Respects curiosity and scholarship.
 *
 * System: Lore Fragment Collection
 * - Players complete specific quests to earn lore fragments
 * - Each fragment unlocks a lore entry (narrative text about Maple World)
 * - Lorekeeper displays collected lore entries and explains their significance
 * - Creates meta-narrative arc connecting disparate content
 */

/* global cm */

var status = -1;
var page = 0;   // 0=main menu, 1=view lore entries, 2=claim reward

// Lore fragment definitions
// [quest_id, fragment_name, lore_text, xp_reward]
var LORE_FRAGMENTS = [
    [99070, "The Vanished Expedition",
     "An expedition team vanished in the deep caves of Maple World decades ago. " +
     "They sought knowledge of ancient civilizations that predated the current kingdoms. " +
     "Their leader, Elder Cormac, spent 50 years searching for answers. The expedition's fate " +
     "remains a mystery, but echoes of their discovery haunt the ancient places they explored.",
     5000],

    [99006, "The Vault Conspiracy",
     "Strange drops bearing patterns unknown to common alchemy circulate the underworld. " +
     "A network of couriers and mercenaries moves these items through Kerning City and Perion. " +
     "A hidden vault in an underground hideout holds the secret — ancient technology, " +
     "or perhaps something darker than any of us realized. The conspiracy runs deep.",
     7000],

    [99100, "Field Journals Across the Lands",
     "Vesper the Chronicler maintains field journals in the great towns: Henesys, Ellinia, Perion. " +
     "These journals record daily observations about the world, its peoples, and the changing seasons. " +
     "By visiting each and adding your own notes, you become part of a larger record — " +
     "a living history written by adventurers, merchants, and wanderers alike.",
     6000]
];

function getCompletedFragmentCount() {
    var count = 0;
    for (var i = 0; i < LORE_FRAGMENTS.length; i++) {
        if (cm.isQuestCompleted(LORE_FRAGMENTS[i][0])) {
            count++;
        }
    }
    return count;
}

function buildLoreDisplay() {
    var menu = "#e#b═══ Echoes of History ═══#n#k\r\n";
    menu += "Lore Fragments Collected: #b" + getCompletedFragmentCount() + "/" + LORE_FRAGMENTS.length + "#k\r\n\r\n";

    for (var i = 0; i < LORE_FRAGMENTS.length; i++) {
        var frag = LORE_FRAGMENTS[i];
        var completed = cm.isQuestCompleted(frag[0]);
        var tag = completed ? " #g[UNLOCKED]#k" : " #d[LOCKED]#k";
        menu += "#L" + i + "##b" + frag[1] + "#n" + tag + "#l\r\n";
    }

    menu += "\r\n#L99#Return to town#l";
    return menu;
}

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }
    if (mode == 0 && status == 0) {
        cm.dispose();
        return;
    }
    status++;

    if (status == 0) {
        var greetings = [
            "An elderly scholar looks up from a dusty tome. Their eyes, magnified behind spectacles, " +
            "study you with genuine interest.\r\n\r\n" +
            "#b\"Welcome, traveler. I am the Lorekeeper. I collect fragments of our world's true history — " +
            "the stories that others overlook or forget.\"#k",

            "#b\"Most think history is written in stone, immutable and complete. But I know better. " +
            "History is written by those who bear witness, who ask questions, who venture into the unknown.\"#k\r\n\r\n" +
            "The scholar adjusts their glasses.\r\n\r\n" +
            "#b\"Have you any tales to share?\"#k"
        ];

        cm.sendNext(greetings[Math.floor(Math.random() * greetings.length)]);
        return;
    }

    if (status == 1) {
        cm.sendSimple(buildLoreDisplay());
        return;
    }

    if (status == 2) {
        if (selection == 99) {
            cm.sendOk("#b\"Safe travels. May your path lead to truth.\"#k");
            cm.dispose();
            return;
        }

        if (selection < 0 || selection >= LORE_FRAGMENTS.length) {
            cm.dispose();
            return;
        }

        var frag = LORE_FRAGMENTS[selection];
        var completed = cm.isQuestCompleted(frag[0]);

        if (!completed) {
            cm.sendOk(
                "#b\"Ah, but you have not yet earned this fragment.\"#k\r\n\r\n" +
                "The scholar taps a finger on an empty page.\r\n\r\n" +
                "#b\"To unlock this tale, you must first complete the quest: '" +
                (frag[0] === 99070 ? "The Vanished Expedition" :
                 frag[0] === 99006 ? "The Vault Conspiracy" :
                 "Field Journals Across the Lands") +
                "'#k\r\n\r\n" +
                "#b\"Return when you have discovered it.\"#k"
            );
            cm.dispose();
            return;
        }

        // Fragment unlocked — show the lore text
        cm.sendNext(
            "#e#b" + frag[1] + "#n#k\r\n\r\n" +
            frag[2]
        );
        return;
    }

    if (status == 3) {
        cm.sendOk(
            "#b\"By studying such fragments, we piece together the true tapestry of our world. " +
            "Every fragment brings us closer to understanding.\"#k\r\n\r\n" +
            "The scholar makes a notation in their ledger, adding your tale to their collection."
        );
        cm.dispose();
    }
}
