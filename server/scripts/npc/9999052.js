/* Elder Cormac — Story Quest Giver (9999052)
 * Located in Henesys (100000000)
 * Quest chain: 99070 (Part 1), 99071 (Part 2)
 *
 * Personality: Warm, weathered, melancholic. A retired adventurer who spent
 * 50 years wandering Victoria Island after charting it in his youth. He sits
 * in Henesys square, watching the town he helped build, carrying a quiet grief
 * for the expedition team he lost. Lonely but wise. Tells stories the way
 * old men do — slowly, with pauses, as if each word costs something.
 */

/* global cm */

var status = -1;
var phase = 0;   // which quest phase we're in

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }
    if (mode == 0) {
        // "Back" button
        cm.dispose();
        return;
    }
    status++;

    // ── Determine quest phase ────────────────────────────────────────────────
    // Phase 0: Nothing started
    // Phase 1: Quest 99070 started but not completable
    // Phase 2: Quest 99070 can be completed (has 10x Ant Claw item 4000012)
    // Phase 3: Quest 99070 complete, 99071 not started
    // Phase 4: Quest 99071 started but not completable
    // Phase 5: Quest 99071 can be completed (has 5x Drake Talon item 4000047)
    // Phase 6: Both quests complete

    if (cm.isQuestCompleted(99071)) {
        phase = 6;
    } else if (cm.isQuestStarted(99071)) {
        if (cm.itemQuantity(4000047) >= 5) {
            phase = 5;
        } else {
            phase = 4;
        }
    } else if (cm.isQuestCompleted(99070)) {
        phase = 3;
    } else if (cm.isQuestStarted(99070)) {
        if (cm.itemQuantity(4000012) >= 10) {
            phase = 2;
        } else {
            phase = 1;
        }
    } else {
        phase = 0;
    }

    // ── Phase routing ────────────────────────────────────────────────────────

    if (phase == 6) {
        handleFinished();
        return;
    }
    if (phase == 5) {
        handlePart2Complete();
        return;
    }
    if (phase == 4) {
        handlePart2InProgress();
        return;
    }
    if (phase == 3) {
        handlePart2Offer();
        return;
    }
    if (phase == 2) {
        handlePart1Complete();
        return;
    }
    if (phase == 1) {
        handlePart1InProgress();
        return;
    }
    // phase == 0
    handlePart1Intro();
}

// ── Phase 0: Introduce Cormac and offer Part 1 ───────────────────────────────

function handlePart1Intro() {
    if (status == 0) {
        cm.sendNext(
            "The old man sits on a low stone wall, watching the square with calm, distant eyes. " +
            "His gear is worn but well-kept — a fighter's habit. He notices you looking.\r\n\r\n" +
            "\"Ah. A wanderer. Sit a moment, if you like. My old legs won't carry me far these days, " +
            "so I carry the world with stories instead.\"\r\n\r\n" +
            "He gestures at the town around him. \"Fifty years of wandering taught me that the " +
            "best thing a man can do is pay attention. Half the adventurers who pass through " +
            "Henesys never look at it properly. It's a shame.\""
        );
        return;
    }
    if (status == 1) {
        cm.sendNext(
            "\"My name is Cormac. Once upon a time I was part of an expedition — twelve of us, hired to " +
            "chart the deep passages beneath Victoria Island. The ones beneath the Ant Tunnel. " +
            "We went in young and stupid and very brave.\r\n\r\n" +
            "\"In my day, no one had mapped the lower chambers. The mapmakers sent us in with rope and " +
            "lanterns and a promise of good coin. The first week was magnificent. Ancient stone. " +
            "Carvings we couldn't read. Chambers that went down forever.\""
        );
        return;
    }
    if (status == 2) {
        cm.sendNext(
            "He's quiet for a moment. When he speaks again, his voice is softer.\r\n\r\n" +
            "\"There was a woman named Elara in our group. Clever — clever like sunlight off water. " +
            "She was the one who started translating the carvings. Said they told a story. " +
            "Something that was buried there on purpose.\r\n\r\n" +
            "\"...I was the only one who came back out.\"\r\n\r\n" +
            "He does not look at you when he says this. He watches a child run across the square instead."
        );
        return;
    }
    if (status == 3) {
        cm.sendNext(
            "\"I've been back to that tunnel entrance a hundred times since. Never made it past " +
            "the first chamber. I tell myself it's my legs. It isn't my legs.\r\n\r\n" +
            "\"But you — you look like someone who's still going in. Someone who doesn't know " +
            "yet that the deep places push back.\"\r\n\r\n" +
            "He finally meets your eyes. Something shifts in his expression — not quite hope, but close to it."
        );
        return;
    }
    if (status == 4) {
        cm.sendYesNo(
            "\"I'd like to ask something of you. Not a rescue — they're long past rescuing. " +
            "But if you go into the Ant Tunnel, deep enough to where the Ant Mandibles give way " +
            "to something older and stranger — I'd like to know someone made it that far.\r\n\r\n" +
            "\"Bring me ten Ant Claws. That deep. That's all I ask. I'll pay you for your trouble.\"\r\n\r\n" +
            "Accept the old man's request?"
        );
        return;
    }
    if (status == 5) {
        if (mode == 1) {
            cm.forceStartQuest(99070);
            cm.sendNext(
                "Cormac nods slowly, as if he expected nothing less.\r\n\r\n" +
                "\"Good. The claws will be proof enough. The deep ants don't live in the upper tunnels — " +
                "you'll have to go further than most care to. Come back when you have ten.\"\r\n\r\n" +
                "He leans back and looks at the sky. \"Take your time. I've been waiting fifty years. " +
                "I've gotten good at it.\""
            );
        } else {
            cm.sendOk("\"The offer stands. Come find me when you're ready.\"");
            cm.dispose();
        }
        return;
    }
    if (status == 6) {
        cm.dispose();
    }
}

// ── Phase 1: Part 1 in progress, items not collected ─────────────────────────

function handlePart1InProgress() {
    if (status == 0) {
        cm.sendNext(
            "Cormac looks up as you approach. His eyes go straight to your hands.\r\n\r\n" +
            "\"Not yet, then.\" He says it without judgment. \"The deep ants are stubborn creatures. " +
            "They've been in those tunnels longer than either of us have been alive.\r\n\r\n" +
            "\"Ten claws. They only come from the ones deeper in. Don't let the upper-level ones " +
            "fool you — the shells are different. You'll know when you're deep enough.\""
        );
        return;
    }
    if (status == 1) {
        cm.sendOk(
            "\"Come back when you have them. I'll be here.\"\r\n\r\n" +
            "He turns back to the square, watching."
        );
        cm.dispose();
        return;
    }
}

// ── Phase 2: Part 1 completable (has 10x Ant Claw) ──────────────────────────

function handlePart1Complete() {
    if (status == 0) {
        cm.sendNext(
            "Cormac sees you coming and straightens. His eyes catch something in your bearing.\r\n\r\n" +
            "\"You have them,\" he says quietly. Not a question.\r\n\r\n" +
            "You hold out the Ant Claws. He takes them slowly, turning them in his weathered hands. " +
            "They're unmistakably from the deep — longer, darker, with that strange iridescence " +
            "that the upper-level ants don't have."
        );
        return;
    }
    if (status == 1) {
        cm.sendNext(
            "He's quiet for longer than is comfortable. His jaw is set in a way that suggests " +
            "he's holding something back.\r\n\r\n" +
            "\"You went further than I expected,\" he says at last. \"Did you see anything strange? " +
            "Markings on the walls? Passages that don't match the geography?\"\r\n\r\n" +
            "He catches himself. Shakes his head. \"Forgive an old man. I'm getting ahead of myself.\""
        );
        return;
    }
    if (status == 2) {
        // Give rewards and complete quest
        cm.gainItem(4000012, -10);  // Remove 10x Ant Claw
        cm.gainExp(5000);
        cm.forceCompleteQuest(99070);
        cm.sendNext(
            "\"You've earned this. More than you know.\"\r\n\r\n" +
            "He presses a small pouch into your hand — a reward, honestly given by someone " +
            "who has lived long enough to understand what payment is worth.\r\n\r\n" +
            "#b+5000 EXP#k\r\n\r\n" +
            "\"There's more. Not money — a story. And another task, if you're willing to hear it. " +
            "It's about what my team found before they vanished.\""
        );
        return;
    }
    if (status == 3) {
        cm.dispose();
    }
}

// ── Phase 3: Part 2 offer (Part 1 done, Part 2 not started) ──────────────────

function handlePart2Offer() {
    if (status == 0) {
        cm.sendNext(
            "Cormac gestures for you to sit beside him. This time you do.\r\n\r\n" +
            "\"We found them in the third deep chamber,\" he begins. \"The carvings. Elara called " +
            "them a record — something buried intentionally, not forgotten. A language none of us " +
            "could read except her. She was translating the final panel when...\"\r\n\r\n" +
            "He stops. Picks up again.\r\n\r\n" +
            "\"The Drakes moved in after we lost contact. They nested in the lower passages. " +
            "I've always wondered if they were drawn there by whatever the carvings describe.\""
        );
        return;
    }
    if (status == 1) {
        cm.sendNext(
            "\"If I were twenty years younger, I'd go in myself and pull those talons from the " +
            "Drakes' own claws. But I'm not twenty. I'm not even forty.\r\n\r\n" +
            "\"The Drakes carry something in their talons — the mineral composition of the deep " +
            "rock. If you bring me five of them, I can use them to triangulate where in the " +
            "passage system the main nest settled. It's as close as I can get to knowing where " +
            "Elara's work ended.\"\r\n\r\n" +
            "His voice cracks slightly on her name. He covers it with a cough."
        );
        return;
    }
    if (status == 2) {
        cm.sendYesNo(
            "\"Five Drake Talons. Bring them to me and I'll tell you what I've pieced together " +
            "in fifty years of dead-end research. Whatever I know is yours.\r\n\r\n" +
            "\"I'd consider it a kindness,\" he says simply.\r\n\r\n" +
            "Accept the second part of Cormac's request?"
        );
        return;
    }
    if (status == 3) {
        if (mode == 1) {
            cm.forceStartQuest(99071);
            cm.sendOk(
                "\"The Drakes are in the passages that branch south from the main Ant Tunnel. " +
                "They're not easy — but you already knew that about yourself, didn't you?\"\r\n\r\n" +
                "He smiles for the first time. It changes his whole face.\r\n\r\n" +
                "\"Come back with five talons. I'll be here.\""
            );
        } else {
            cm.sendOk("\"Take all the time you need. An old man's patience is not a limited resource.\"");
            cm.dispose();
        }
        return;
    }
    if (status == 4) {
        cm.dispose();
    }
}

// ── Phase 4: Part 2 in progress, items not collected ─────────────────────────

function handlePart2InProgress() {
    if (status == 0) {
        cm.sendNext(
            "Cormac is sketching something on a scrap of leather when you approach. " +
            "A map, maybe — lines that don't quite make geographic sense.\r\n\r\n" +
            "\"Not yet?\" He sets the sketch aside. \"The Drakes are territorial. " +
            "They'll take effort. Five talons — from the ones in the deeper passages, " +
            "not the upper approaches. The talons from the deep ones are longer and have " +
            "a double ridge along the spine. You'll recognize them.\""
        );
        return;
    }
    if (status == 1) {
        cm.sendOk(
            "\"Take care of yourself in there. The passage south of the main chamber narrows — " +
            "people underestimate that.\"\r\n\r\n" +
            "He goes back to his sketch."
        );
        cm.dispose();
        return;
    }
}

// ── Phase 5: Part 2 completable (has 5x Drake Talon) ─────────────────────────

function handlePart2Complete() {
    if (status == 0) {
        cm.sendNext(
            "Cormac sets down his sketch before you even speak. He knew somehow.\r\n\r\n" +
            "He takes the Drake Talons from you and holds them up to the light, rotating them " +
            "slowly. His expression is unreadable — grief and satisfaction tangled together " +
            "the way they get in old people who've learned to hold both at once."
        );
        return;
    }
    if (status == 1) {
        cm.sendNext(
            "\"The mineral deposit here,\" he says, tracing a ridge with his thumbnail. " +
            "\"This comes from the third lower chamber. The same place we found the carvings.\r\n\r\n" +
            "\"The Drakes nested right on top of it. Right on top of Elara's work.\" He sets the " +
            "talons down carefully. \"In a strange way, that means the carvings are still there. " +
            "Still waiting. Guarded by creatures that don't know what they're guarding.\""
        );
        return;
    }
    if (status == 2) {
        cm.sendNext(
            "\"What she was translating — the last panel — I think it described a convergence. " +
            "A place in the deep where the island's ley lines meet. Whatever the people who " +
            "made those carvings wanted preserved, that was where they hid it.\r\n\r\n" +
            "\"She would have found it. Elara always found what she was looking for.\"\r\n\r\n" +
            "He's quiet for a long moment. \"Maybe you will too. Someday. When you're ready.\""
        );
        return;
    }
    if (status == 3) {
        // Give rewards and complete quest
        cm.gainItem(4000047, -5);   // Remove 5x Drake Talon
        cm.gainExp(10000);
        cm.gainItem(2000005, 1);    // 1x Power Elixir
        cm.gainItem(4001005, 1);    // 1x Cormac's Compass (using item 4001005 as stand-in)
        cm.forceCompleteQuest(99071);
        cm.sendNext(
            "He hands you three things:\r\n\r\n" +
            "The first is coin and experience — a proper reward for work well done.\r\n" +
            "The second is a vial of restorative — the finest he has.\r\n" +
            "The third is a compass. Old, worn smooth. His initials on the back.\r\n\r\n" +
            "\"That compass went into the tunnel with me fifty years ago. It came back out " +
            "with me when nothing else did. I want it to go back in.\"\r\n\r\n" +
            "#b+10000 EXP  +1x Power Elixir  +1x Cormac's Compass#k"
        );
        return;
    }
    if (status == 4) {
        cm.sendOk(
            "\"Take it with you when you're ready to go deeper. You don't have to go for me. " +
            "Don't even go for Elara. Go because the deep places deserve to be known, and " +
            "you're the kind of person who understands that.\r\n\r\n" +
            "\"Come back and tell me what you find. I'll be here.\"\r\n\r\n" +
            "He leans back against the wall and looks up at the sky — an old man in a " +
            "town he helped build, watching the world move through it without him, " +
            "quietly grateful that someone is still moving at all."
        );
        cm.dispose();
        return;
    }
}

// ── Phase 6: Both quests complete ────────────────────────────────────────────

function handleFinished() {
    if (status == 0) {
        cm.sendOk(
            "Cormac looks up as you pass. He nods — a small thing, but a real one.\r\n\r\n" +
            "\"Still out there?\" he asks. \"Good. The deep places don't give up their secrets " +
            "to people who stop looking.\r\n\r\n" +
            "\"If you find what Elara found — if you ever stand in that chamber and see what " +
            "she saw — I'd like to know. There's no rush. I've been waiting fifty years.\"\r\n\r\n" +
            "He smiles and turns back to watching the square."
        );
        cm.dispose();
        return;
    }
}
