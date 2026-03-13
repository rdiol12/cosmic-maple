/* Sage Magistrate Theron — Weekly Challenge Coordinator (9999054)
 * Located in Henesys (100000000) — Town Square
 * Purpose: Offers 3 major weekly objectives for mid/late-game engagement
 *
 * Personality: Scholarly advisor, quest coordinator. Respects skill and dedication.
 * Offers 3 major objectives per week (Monster Mastery, Treasure Hunt, Boss Slayer).
 * All reset weekly. Rewards: 50-100K EXP + meso + special medals.
 * Designed for long-term player retention and weekly engagement loops.
 *
 * System: Weekly Challenge Loop
 * - Monster Mastery (99110): Kill 300 mobs, rewards 50K EXP + medal
 * - Treasure Hunt (99111): Collect 50 rare drops, rewards 75K EXP + medal
 * - Boss Slayer (99112): Defeat 5 boss monsters, rewards 100K EXP + medal
 */

/* global cm */

var status = -1;

// Weekly challenges (quest_id, name, description, kill/collect count, exp_reward, medal_reward)
var WEEKLY_QUESTS = [
    [99110, "Monster Mastery",
     "Hunt and slay 300 monsters across Victoria Island. Prove your prowess as a true adventurer.",
     50000, "Warrior's Medal"],

    [99111, "Treasure Hunt",
     "Gather 50 rare drops from the creatures of Maple World. Patience and persistence reward the worthy.",
     75000, "Scholar's Medal"],

    [99112, "Boss Slayer",
     "Defeat 5 legendary bosses: Zakum, Horned Tail, Crimson Balrog, Papulatus, or Ravana.",
     100000, "Champion's Medal"]
];

function buildChallengeMenu() {
    var menu = "#e#b═══ Weekly Challenges ═══#n#k\r\n";
    menu += "Reset: Every #bMonday 00:00#k (Israel Time)\r\n\r\n";

    for (var i = 0; i < WEEKLY_QUESTS.length; i++) {
        var q = WEEKLY_QUESTS[i];
        var completed = cm.isQuestCompleted(q[0]);
        var started = cm.isQuestStarted(q[0]);
        var tag = completed ? " #r[COMPLETED]#k" : (started ? " #d[IN PROGRESS]#k" : "");
        menu += "#L" + i + "##b" + q[1] + "#n  +" + q[4] + " EXP" + tag + "#l\r\n";
    }

    menu += "\r\n#L99#Never mind#l";
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
        var greeting = [
            "A wise sage stands before you, robes shimmering with arcane light. They regard you " +
            "with calm assessment.\r\n\r\n" +
            "#b\"I am Sage Magistrate Theron, keeper of the Weekly Trials. These challenges separate " +
            "the dedicated from the casual.\"#k",

            "#b\"Each week, I offer three paths to glory. Choose which trials you wish to undertake. " +
            "Those who complete all three earn great prestige.\"#k\r\n\r\n" +
            "Theron's eyes gleam with knowing interest."
        ];

        cm.sendNext(greeting[Math.floor(Math.random() * greeting.length)]);
        return;
    }

    if (status == 1) {
        cm.sendSimple(buildChallengeMenu());
        return;
    }

    if (status == 2) {
        if (selection == 99) {
            cm.sendOk("#b\"Return when you are ready to prove yourself.\"#k");
            cm.dispose();
            return;
        }

        if (selection < 0 || selection >= WEEKLY_QUESTS.length) {
            cm.dispose();
            return;
        }

        var q = WEEKLY_QUESTS[selection];
        var completed = cm.isQuestCompleted(q[0]);
        var started = cm.isQuestStarted(q[0]);

        if (completed) {
            cm.sendOk(
                "#b\"You have already proven yourself in this trial this week.\"#k\r\n\r\n" +
                "Theron nods with respect.\r\n\r\n" +
                "#b\"Return when the week resets if you wish to undertake it again.\"#k"
            );
            cm.dispose();
            return;
        }

        if (started) {
            cm.sendOk(
                "#b\"You have already begun this trial.\"#k\r\n\r\n" +
                "Theron gestures encouragingly.\r\n\r\n" +
                "#b\"Go. Complete what you have started. I will be waiting.\"#k"
            );
            cm.dispose();
            return;
        }

        // Offer the challenge
        cm.sendYesNo(
            "#e#b" + q[1] + "#n#k\r\n\r\n" +
            q[2] + "\r\n\r\n" +
            "Reward: #b" + q[4] + " EXP#k + #b" + q[5] + "#k\r\n\r\n" +
            "Do you accept this challenge?"
        );
        return;
    }

    if (status == 3) {
        if (mode == 1) {
            var q = WEEKLY_QUESTS[selection];
            cm.forceStartQuest(q[0]);
            cm.sendOk(
                "#b\"Excellent. The trial has begun.\"#k\r\n\r\n" +
                "Theron traces an ethereal mark on your forehead.\r\n\r\n" +
                "#b\"This mark will guide you. Return when you have completed the task. " +
                "I will know when you are ready.\"#k"
            );
        } else {
            cm.sendOk("#b\"Perhaps another time.\"#k");
        }
        cm.dispose();
    }
}
