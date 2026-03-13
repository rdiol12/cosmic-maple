/**
 * @NPC:     Vesper the Wandering Chronicler (9999044)
 * @Purpose: Daily Challenge System — 3 structured challenges (Hunt / Collect / Explore)
 * @Location: Henesys (100000000)
 * @Quests:
 *   99100 — Hunt Challenge   (kill N mobs scaled to player level)
 *   99101 — Collect Challenge (gather N common drop items)
 *   99102 — Explore Challenge (visit 3 maps and confirm at specific NPCs)
 *   99103 — Daily Jackpot    (complete all 3 for bonus reward)
 *
 * All challenges reset daily via date-stamp stored in quest progress.
 * Jackpot is claimable once per day only if all 3 challenges are done.
 * Rewards scale by player level tier (6 tiers).
 *
 * Design philosophy: Vesper is an eccentric scholar-adventurer who has been
 * everywhere and seen everything. She speaks with wit and warmth, drops lore
 * hints, and genuinely cares whether players grow stronger. Each challenge
 * type has unique personality-driven dialogue.
 */

/* global cm, java */

var status = -1;
var selected = -1;

// ── Quest IDs ─────────────────────────────────────────────────────────────────
// NOTE: 99100-99103 are taken by standalone taskboard quests (Slime Sweep etc.)
// NOTE: 99200 is taken by Challenge Master Doran (9999056) — do NOT reuse.
// Vesper uses 99210-99213 to avoid conflicts.
var Q_HUNT    = 99210;
var Q_COLLECT = 99211;
var Q_EXPLORE = 99212;
var Q_JACKPOT = 99213;

// ── Date helpers ──────────────────────────────────────────────────────────────

function getTodayStamp() {
    var cal = java.util.Calendar.getInstance();
    var y = cal.get(java.util.Calendar.YEAR);
    var m = cal.get(java.util.Calendar.MONTH) + 1;
    var d = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + y + (m < 10 ? "0" : "") + m + (d < 10 ? "0" : "") + d;
}

function isDoneToday(questId) {
    try {
        var prog = cm.getQuestProgress(questId, 0);
        return prog !== null && prog !== "" && prog === getTodayStamp();
    } catch (e) {
        return false;
    }
}

function markDoneToday(questId) {
    cm.setQuestProgress(questId, 0, getTodayStamp());
}

// ── Level-tier scaling ────────────────────────────────────────────────────────
// Returns 0-5 index based on player level

function getTier() {
    var lvl = cm.getPlayer().getLevel();
    if (lvl < 20)  return 0;
    if (lvl < 40)  return 1;
    if (lvl < 60)  return 2;
    if (lvl < 80)  return 3;
    if (lvl < 100) return 4;
    return 5;
}

// ── Hunt Challenge data (scaled by tier) ─────────────────────────────────────
// [mobId, mobName, killCount, expReward, mesoReward, location hint]

var HUNT_DATA = [
    [210100,  "Slimes",             50,  3000,  5000,  "the slime pools near Henesys"],
    [2230102, "Wild Boars",         30,  8000,  10000, "the Perion outskirts"],
    [4230103, "Iron Hogs",          25, 15000,  18000, "the deep Perion mines"],
    [5140000, "White Fangs",        20, 25000,  28000, "the snowy fields of El Nath"],
    [6130100, "Red Drakes",         15, 42000,  50000, "the volcanic tunnels"],
    [8140000, "Lycanthropes",       12, 60000,  75000, "the forests beyond El Nath"]
];

// ── Collect Challenge data (scaled by tier) ───────────────────────────────────
// [itemId, itemName, count, expReward, mesoReward, where to find hint]

var COLLECT_DATA = [
    [4000000, "Snail Shells",        40,  2500,  4000,  "snails on Victoria Island roads"],
    [4000002, "Pig's Ribbons",       25,  6000,  8000,  "Ribbon Pigs near Henesys"],
    [4000005, "Ratz Teeth",          20, 12000, 15000,  "Ratz in Kerning City sewers"],
    [4000013, "Jr. Wraith Gems",     15, 22000, 25000,  "Jr. Wraiths in Sleepywood dungeon"],
    [4000243, "Drake's Blood",       12, 40000, 45000,  "high-level drakes in El Nath"],
    [4000244, "Dragon Skins",        10, 65000, 80000,  "the most powerful drakes"]
];

// ── Explore Challenge data ────────────────────────────────────────────────────
// Three maps to visit per tier; each has a "contact NPC" ID to speak with.
// Players are instructed to talk to those NPCs to register their presence.
// (In practice: the explore sub-quests 99102_0/1/2 track this via flag set
//  by those NPCs' scripts calling setQuestProgress on Q_EXPLORE.)
// Here we store: [mapId, mapName, npcId, npcName]

// Explore waypoints use Vesper's custom Field Journal boards (9999045/46/47)
// placed in Henesys, Ellinia, and Perion respectively.
// Progress fields: 1=total stops confirmed, 2=stop0 done, 3=stop1 done, 4=stop2 done.
// All tiers visit the same 3 Victoria Island journals — higher-tier players
// still benefit from the travel requirement. End-game journals (El Nath etc.)
// will be added as IDs 9999051+ in a future update.
var EXPLORE_DATA = [
    // Tier 0 — Beginner
    [[100000000, "Henesys",      9999045, "Vesper's Field Journal (Henesys)"],
     [101000000, "Ellinia",      9999046, "Vesper's Field Journal (Ellinia)"],
     [102000000, "Perion",       9999047, "Vesper's Field Journal (Perion)"]],
    // Tier 1
    [[100000000, "Henesys",      9999045, "Vesper's Field Journal (Henesys)"],
     [101000000, "Ellinia",      9999046, "Vesper's Field Journal (Ellinia)"],
     [102000000, "Perion",       9999047, "Vesper's Field Journal (Perion)"]],
    // Tier 2
    [[100000000, "Henesys",      9999045, "Vesper's Field Journal (Henesys)"],
     [101000000, "Ellinia",      9999046, "Vesper's Field Journal (Ellinia)"],
     [102000000, "Perion",       9999047, "Vesper's Field Journal (Perion)"]],
    // Tier 3
    [[100000000, "Henesys",      9999045, "Vesper's Field Journal (Henesys)"],
     [101000000, "Ellinia",      9999046, "Vesper's Field Journal (Ellinia)"],
     [102000000, "Perion",       9999047, "Vesper's Field Journal (Perion)"]],
    // Tier 4
    [[100000000, "Henesys",      9999045, "Vesper's Field Journal (Henesys)"],
     [101000000, "Ellinia",      9999046, "Vesper's Field Journal (Ellinia)"],
     [102000000, "Perion",       9999047, "Vesper's Field Journal (Perion)"]],
    // Tier 5
    [[100000000, "Henesys",      9999045, "Vesper's Field Journal (Henesys)"],
     [101000000, "Ellinia",      9999046, "Vesper's Field Journal (Ellinia)"],
     [102000000, "Perion",       9999047, "Vesper's Field Journal (Perion)"]]
];

// ── Jackpot reward pools (per tier) ──────────────────────────────────────────
// [expBonus, mesoBonus, bonusItemId, bonusItemQty, bonusItemName]

var JACKPOT_DATA = [
    [5000,   8000,  2000000, 50, "Red Potions"],
    [12000,  18000, 2000002, 30, "White Potions"],
    [22000,  30000, 2002004, 5,  "Warrior Potions"],
    [38000,  50000, 2000004, 15, "Elixirs"],
    [60000,  80000, 2000005, 10, "Power Elixirs"],
    [90000, 120000, 2002023, 5,  "Ginger Ales"]
];

// ── Vesper flavor texts ───────────────────────────────────────────────────────

var GREET_LINES = [
    "Ah, you found me! I set up here every morning — sunlight's terrible for my notes, but the coffee from the pub next door makes it worthwhile.",
    "Come in, come in! I've got three challenges written up fresh this morning. The ink's barely dry.",
    "*looks up from a battered journal* Oh! A visitor. I was just cross-referencing yesterday's field data. Pull up a stool — metaphorically speaking.",
    "Perfect timing. I was starting to think today's challenges would go unclaimed. Do you know how demoralizing that is for a field researcher?"
];

var HUNT_ACCEPT_LINES = [
    "Excellent. Mind you, I need real data — not just a body count. Note the behavior patterns, if you have time. Just kidding. Well. Mostly.",
    "Good! I'll be here taking notes and drinking entirely too much coffee while you do the dangerous part. We each have our roles.",
    "Magnificent. The Maple World's ecosystem is in constant flux — your culling efforts today contribute to three separate ongoing studies. No pressure.",
    "Capital! Return when you've made a proper dent in their numbers. And please, try not to get turned into a trophy yourself."
];

var COLLECT_ACCEPT_LINES = [
    "Oh, lovely. The material science applications alone are worth the effort. Dragon scales conduct mana surprisingly well, did you know that?",
    "These specimens are essential for my research. I'd collect them myself, but *gestures vaguely* field conditions are not ideal for archival work.",
    "Wonderful! I'll have the storage vials ready. Each sample gets catalogued, weighed, and cross-referenced. You're contributing to actual scholarship, you know.",
    "Splendid! I once wrote a 40-page monograph on snail shell tensile strength. It's... not widely read. But YOU understand why this matters."
];

var EXPLORE_ACCEPT_LINES = [
    "Magnificent! I need firsthand reports from multiple regions for my comparative geography study. Don't just teleport — actually walk the roads if you can spare the time.",
    "Perfect. I'll need you to confirm your presence with the local experts in each area. They'll know what to look for. Trust the process.",
    "Ah, the exploration brief! My favorite. There's no substitute for direct field research. The maps lie, the books lie more. Only your own eyes tell the truth.",
    "The world tour! I designed this one myself. Bring back impressions — not just stamps. What does the air smell like in Leafre? Does El Nath's cold feel different from Aquarium's? Note these things."
];

var COMPLETE_HUNT_LINES = [
    "*scribbles in journal* Outstanding field work. The population curves should normalize within a week. Here's your compensation — and my sincere professional gratitude.",
    "By the ancient libraries of Orbis! You actually did it. The data is immaculate. Please accept this reward before I bury it in footnotes.",
    "*stamps the report with three seals* Verified, validated, cross-referenced. A perfect hunt. I'll cite you in my next monograph — anonymously, of course.",
    "Done already? I'd barely finished my second cup of coffee! Remarkable efficiency. Your reward, with honors."
];

var COMPLETE_COLLECT_LINES = [
    "*carefully places each specimen into labeled vials* Exceptional quality. No contamination, no mixing. You have the hands of a field researcher. Have you considered a career in taxonomy?",
    "Beautiful specimens! The catalog entry writes itself. EXP, meso, and my heartfelt academic admiration — all yours.",
    "*peers through magnifying glass at each item* Superb. Grade A specimens. My previous collection is already jealous. Reward well-earned.",
    "These are EXACTLY what I needed. I could weep — professionally speaking. Your compensation, plus a bonus for not crumpling anything."
];

var COMPLETE_EXPLORE_LINES = [
    "You spoke to all three contacts! The triangulation data closes beautifully. Here's the reward, and please, do tell me — was the coffee better in El Nath or Ludibrium?",
    "*unfurls a large map and begins marking it* All three confirmed. The geographic coverage is excellent. I knew you were the right person for this.",
    "Field data received from all three locations! The expedition brief is complete. Your payment, with my sincere thanks and approximately forty follow-up questions I'll spare you from.",
    "All waypoints checked in. The network is complete for today. You'll find this experience wrote a single chapter in my ongoing atlas of adventurer routes. Reward — and gratitude."
];

var JACKPOT_LINES = [
    "The Triple Crown! All three challenges in one day — that's extraordinary dedication. Here's a little something extra from the research budget. Don't tell the university.",
    "*stands up and actually applauds* You completed everything! This is the first time this month someone's cleared the full board. Exceptional.",
    "All three! Hunt, gather, explore — the holy triad of field research. Your bonus is well-earned. I'm putting a star on your file.",
    "You — *taps journal* — have earned the full daily bonus. It takes more than persistence to do all three. It takes character. Reward, and my sincerest respect."
];

function randomLine(arr) {
    var seed = parseInt(getTodayStamp()) ^ cm.getPlayer().getId();
    var idx = Math.abs(seed) % arr.length;
    return arr[idx];
}

// ── State checks ──────────────────────────────────────────────────────────────

function allThreeDone() {
    return isDoneToday(Q_HUNT) && isDoneToday(Q_COLLECT) && isDoneToday(Q_EXPLORE);
}

function jackpotDoneToday() {
    return isDoneToday(Q_JACKPOT);
}

// ── Helper: build the main menu ───────────────────────────────────────────────

function buildMainMenu() {
    var tier = getTier();
    var huntD    = HUNT_DATA[tier];
    var collectD = COLLECT_DATA[tier];
    var exploreD = EXPLORE_DATA[tier];

    var huntDone    = isDoneToday(Q_HUNT);
    var collectDone = isDoneToday(Q_COLLECT);
    var exploreDone = isDoneToday(Q_EXPLORE);
    var jackpotDone = jackpotDoneToday();

    var huntStatus    = huntDone    ? "#d[DONE]#k " : "#b";
    var collectStatus = collectDone ? "#d[DONE]#k " : "#b";
    var exploreStatus = exploreDone ? "#d[DONE]#k " : "#b";

    var huntEnd    = huntDone    ? "" : "#k";
    var collectEnd = collectDone ? "" : "#k";
    var exploreEnd = exploreDone ? "" : "#k";

    var menu = "#e#bVesper's Daily Challenge Board#n#k\r\n";
    menu += "Three fresh challenges, every single day. Complete all three for a bonus.\r\n\r\n";

    // HUNT
    menu += "#L0#" + huntStatus + "[HUNT]" + huntEnd + " Defeat " + huntD[2] + " " + huntD[1];
    menu += huntDone ? "#l\r\n" : " — " + huntD[3] + " EXP#l\r\n";

    // COLLECT
    menu += "#L1#" + collectStatus + "[COLLECT]" + collectEnd + " Gather " + collectD[2] + "x " + collectD[1];
    menu += collectDone ? "#l\r\n" : " — " + collectD[3] + " EXP#l\r\n";

    // EXPLORE
    menu += "#L2#" + exploreStatus + "[EXPLORE]" + exploreEnd + " Visit: " + exploreD[0][1] + ", " + exploreD[1][1] + ", " + exploreD[2][1];
    menu += exploreDone ? "#l\r\n" : "#l\r\n";

    // JACKPOT
    if (allThreeDone() && !jackpotDone) {
        menu += "#L3##r[!! BONUS READY !!]#k Claim your daily jackpot reward!#l\r\n";
    } else if (jackpotDone) {
        menu += "#d[JACKPOT CLAIMED]#k All challenges complete for today.#l\r\n";
    } else {
        menu += "#r[JACKPOT LOCKED]#k Complete all 3 challenges to unlock the bonus.#l\r\n";
    }

    menu += "\r\n#L9#Who are you, exactly?#l\r\n";
    menu += "#L10#I'll be back later.#l";

    return menu;
}

// ── Main NPC flow ─────────────────────────────────────────────────────────────

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) { cm.dispose(); return; }
    if (mode == 0 && status == 0) { cm.dispose(); return; }
    if (mode == 1) status++; else status--;

    // ─── Status 0: Opening ──────────────────────────────────────────────────
    if (status == 0) {
        cm.sendNext(
            "#b[Vesper the Wandering Chronicler]#k\r\n\r\n" +
            randomLine(GREET_LINES) + "\r\n\r\n" +
            "I post three challenges every morning — #bHunt#k, #bCollect#k, and #bExplore#k. " +
            "Complete all three and you'll find a little extra something waiting for you.\r\n\r\n" +
            "What do you say?"
        );

    // ─── Status 1: Main menu ────────────────────────────────────────────────
    } else if (status == 1) {
        cm.sendSimple(buildMainMenu());

    // ─── Status 2: Selection handling ──────────────────────────────────────
    } else if (status == 2) {

        // ── Option 9: Lore / who are you ───────────────────────────────────
        if (selection == 9) {
            cm.sendOk(
                "#b[Vesper the Wandering Chronicler]#k\r\n\r\n" +
                "Vesper. Field researcher, amateur cartographer, professional over-thinker. " +
                "I graduated from the Royal Orbis Academy twelve years ago and have been conducting " +
                "'independent field studies' ever since — which is what you call it when your university " +
                "funding runs out but you're too curious to stop.\r\n\r\n" +
                "The Maple World has extraordinary biodiversity. Every monster tells a story about the " +
                "region that spawned them. Every drop they carry is a clue. And every adventurer who " +
                "hunts them generates data.\r\n\r\n" +
                "#rData#k, that's the key word. You complete challenges. I get data. " +
                "Everyone goes home richer — in different ways.\r\n\r\n" +
                "Now, shall we talk about today's challenges?"
            );
            cm.dispose();
            return;
        }

        // ── Option 10: Leave ───────────────────────────────────────────────
        if (selection == 10) {
            cm.sendOk(
                "Fair enough. The challenges reset tomorrow at midnight, so don't put it off too long. " +
                "I'll be right here, annotating specimens and pretending the coffee isn't cold."
            );
            cm.dispose();
            return;
        }

        // ── Option 3: Jackpot ──────────────────────────────────────────────
        if (selection == 3) {
            if (!allThreeDone()) {
                cm.sendOk(
                    "Not yet! You need to complete all three challenges first — Hunt, Collect, AND Explore. " +
                    "The jackpot doesn't unlock itself, you know. Well. It does, sort of. But only once you've earned it."
                );
                cm.dispose();
                return;
            }
            if (jackpotDoneToday()) {
                cm.sendOk(
                    "Already claimed your jackpot for today! Come back tomorrow — I'll have fresh challenges posted by dawn.");
                cm.dispose();
                return;
            }
            // Give jackpot reward
            var tier = getTier();
            var jp = JACKPOT_DATA[tier];
            cm.gainExp(jp[0]);
            cm.gainMeso(jp[1]);
            cm.gainItem(jp[2], jp[3]);
            markDoneToday(Q_JACKPOT);
            cm.sendOk(
                "#b[Vesper the Wandering Chronicler]#k\r\n\r\n" +
                randomLine(JACKPOT_LINES) + "\r\n\r\n" +
                "#b+" + jp[0] + " EXP  +" + jp[1] + " meso  +" + jp[3] + "x " + jp[4] + "#k\r\n\r\n" +
                "Come back tomorrow. I've already got ideas for the next set."
            );
            cm.dispose();
            return;
        }

        selected = selection; // 0=hunt, 1=collect, 2=explore

        // ── HUNT ──────────────────────────────────────────────────────────
        if (selected == 0) {
            var tier = getTier();
            var hd = HUNT_DATA[tier];

            if (isDoneToday(Q_HUNT)) {
                cm.sendOk(
                    "*checks the board* The hunt target for today shows: COMPLETE.\r\n\r\n" +
                    "Well done. You've already done " + hd[2] + " " + hd[1] + " today. " +
                    "The remaining challenges are still open if you haven't done them!"
                );
                cm.dispose();
                return;
            }

            // Check if quest is started (active)
            var huntStarted = cm.isQuestStarted(Q_HUNT);

            if (huntStarted) {
                // Check completion: for kill quests we check quest progress field 1 = kill count
                // The hunt kill count is tracked by server via mob kill listener → progress field 1
                var kills = 0;
                try { kills = parseInt(cm.getQuestProgress(Q_HUNT, 1)) || 0; } catch(e) {}
                var needed = hd[2];

                if (kills >= needed) {
                    // Turn in
                    cm.sendYesNo(
                        "#b[HUNT CHALLENGE — READY TO TURN IN]#k\r\n\r\n" +
                        "You've defeated #b" + kills + "/" + needed + " " + hd[1] + "#k. That's the full count!\r\n\r\n" +
                        "Reward: #b" + hd[3] + " EXP + " + hd[4] + " meso#k\r\n\r\n" +
                        "Ready to collect your reward?"
                    );
                    status = 10; // jump to hunt-turnin handler
                } else {
                    cm.sendOk(
                        "#b[HUNT CHALLENGE — IN PROGRESS]#k\r\n\r\n" +
                        "Kills so far: #b" + kills + "/" + needed + " " + hd[1] + "#k\r\n" +
                        "Location hint: Look in #d" + hd[5] + "#k\r\n\r\n" +
                        "Keep going! You can do this."
                    );
                    cm.dispose();
                }
            } else {
                // Accept the quest
                cm.sendYesNo(
                    "#b[HUNT CHALLENGE]#k\r\n\r\n" +
                    "Defeat #b" + hd[2] + " " + hd[1] + "#k.\r\n" +
                    "They can be found in: #d" + hd[5] + "#k\r\n\r\n" +
                    "Reward: #b" + hd[3] + " EXP + " + hd[4] + " meso#k\r\n\r\n" +
                    "Accept the Hunt challenge?"
                );
                status = 20; // jump to hunt-accept handler
            }
            return;
        }

        // ── COLLECT ───────────────────────────────────────────────────────
        if (selected == 1) {
            var tier = getTier();
            var cd = COLLECT_DATA[tier];

            if (isDoneToday(Q_COLLECT)) {
                cm.sendOk(
                    "*holds up a vial of specimens* These are already logged — you turned in " + cd[2] + "x " + cd[1] + " earlier today.\r\n\r\n" +
                    "Excellent work. Onto the other challenges!"
                );
                cm.dispose();
                return;
            }

            var collectStarted = cm.isQuestStarted(Q_COLLECT);

            if (collectStarted) {
                var has = cm.itemQuantity(cd[0]);
                var needed = cd[2];
                if (has >= needed) {
                    cm.sendYesNo(
                        "#b[COLLECT CHALLENGE — READY TO TURN IN]#k\r\n\r\n" +
                        "You're carrying #b" + has + "/" + needed + " " + cd[1] + "#k. Full quota!\r\n\r\n" +
                        "Turning in will remove " + needed + " " + cd[1] + " from your inventory.\r\n" +
                        "Reward: #b" + cd[3] + " EXP + " + cd[4] + " meso#k\r\n\r\n" +
                        "Shall I take the specimens?"
                    );
                    status = 11; // collect turnin handler
                } else {
                    cm.sendOk(
                        "#b[COLLECT CHALLENGE — IN PROGRESS]#k\r\n\r\n" +
                        "Carrying: #b" + has + "/" + needed + " " + cd[1] + "#k\r\n" +
                        "Hint: #d" + cd[5] + "#k drop them.\r\n\r\n" +
                        "Gather the rest and come back to turn them in!"
                    );
                    cm.dispose();
                }
            } else {
                cm.sendYesNo(
                    "#b[COLLECT CHALLENGE]#k\r\n\r\n" +
                    "Gather #b" + cd[2] + "x #t" + cd[0] + "# " + cd[1] + "#k.\r\n" +
                    "Hint: #d" + cd[5] + "#k\r\n\r\n" +
                    "Reward: #b" + cd[3] + " EXP + " + cd[4] + " meso#k\r\n\r\n" +
                    "Accept the Collect challenge?"
                );
                status = 21; // collect accept handler
            }
            return;
        }

        // ── EXPLORE ───────────────────────────────────────────────────────
        if (selected == 2) {
            var tier = getTier();
            var ed = EXPLORE_DATA[tier];

            if (isDoneToday(Q_EXPLORE)) {
                cm.sendOk(
                    "*unfolds a map and points to three marked locations* All three confirmed today — nice work!\r\n\r\n" +
                    "You visited " + ed[0][1] + ", " + ed[1][1] + ", and " + ed[2][1] + ".\r\n\r\n" +
                    "The cartographic data is excellent. Onto the jackpot if you haven't claimed it yet!"
                );
                cm.dispose();
                return;
            }

            // Check stop progress by date-stamp (stored by Field Journal NPCs 9999045-47)
            // Each stop var (2/3/4) = YYYYMMDD of last confirmation, or "" if never/stale.
            var todayStamp = getTodayStamp();
            var stop0 = false, stop1 = false, stop2 = false;
            try { stop0 = cm.getQuestProgress(Q_EXPLORE, 2) === todayStamp; } catch(e) {}
            try { stop1 = cm.getQuestProgress(Q_EXPLORE, 3) === todayStamp; } catch(e) {}
            try { stop2 = cm.getQuestProgress(Q_EXPLORE, 4) === todayStamp; } catch(e) {}
            var stops = (stop0 ? 1 : 0) + (stop1 ? 1 : 0) + (stop2 ? 1 : 0);

            var exploreStarted = cm.isQuestStarted(Q_EXPLORE);

            if (!exploreStarted) {
                cm.sendYesNo(
                    "#b[EXPLORE CHALLENGE]#k\r\n\r\n" +
                    "Visit three locations and stamp the Field Journal at each one. " +
                    "Each journal confirms your presence in that region.\r\n\r\n" +
                    "#bStop 1:#k " + ed[0][1] + " — " + ed[0][3] + "\r\n" +
                    "#bStop 2:#k " + ed[1][1] + " — " + ed[1][3] + "\r\n" +
                    "#bStop 3:#k " + ed[2][1] + " — " + ed[2][3] + "\r\n\r\n" +
                    "#dNote: Warp scrolls are fine — the journals track your visit, not the journey.#k\r\n\r\n" +
                    "Accept the Explore challenge?"
                );
                status = 22; // explore accept handler
            } else if (stops >= 3) {
                // All stops complete — turn in
                cm.sendYesNo(
                    "#b[EXPLORE CHALLENGE — READY TO TURN IN]#k\r\n\r\n" +
                    "All three Field Journals have confirmed your visit today!\r\n\r\n" +
                    (stop0 ? "#g[DONE]#k" : "#r[TODO]#k") + " " + ed[0][1] + " — " + ed[0][3] + "\r\n" +
                    (stop1 ? "#g[DONE]#k" : "#r[TODO]#k") + " " + ed[1][1] + " — " + ed[1][3] + "\r\n" +
                    (stop2 ? "#g[DONE]#k" : "#r[TODO]#k") + " " + ed[2][1] + " — " + ed[2][3] + "\r\n\r\n" +
                    "Return to claim your exploration reward?"
                );
                status = 12; // explore turnin handler
            } else {
                // In progress — show what's done
                var visitLog = "";
                visitLog += (stop0 ? "#g[DONE]#k " : "#r[TODO]#k ") + ed[0][1] + " — " + ed[0][3] + "\r\n";
                visitLog += (stop1 ? "#g[DONE]#k " : "#r[TODO]#k ") + ed[1][1] + " — " + ed[1][3] + "\r\n";
                visitLog += (stop2 ? "#g[DONE]#k " : "#r[TODO]#k ") + ed[2][1] + " — " + ed[2][3] + "\r\n";

                cm.sendOk(
                    "#b[EXPLORE CHALLENGE — IN PROGRESS]#k\r\n\r\n" +
                    "Confirmed stops so far: #b" + stops + "/3#k\r\n\r\n" +
                    visitLog + "\r\n" +
                    "Visit the remaining contacts and return here to collect your reward!"
                );
                cm.dispose();
            }
            return;
        }

    // ─── Status 10: Hunt turn-in confirm ────────────────────────────────────
    } else if (status == 10) {
        if (mode == 0) { cm.sendOk("No problem. Come back when you're ready."); cm.dispose(); return; }
        var tier = getTier();
        var hd = HUNT_DATA[tier];
        cm.gainExp(hd[3]);
        cm.gainMeso(hd[4]);
        markDoneToday(Q_HUNT);
        try { cm.forceCompleteQuest(Q_HUNT); } catch(e) {}
        cm.sendOk(
            "#b[Vesper the Wandering Chronicler]#k\r\n\r\n" +
            randomLine(COMPLETE_HUNT_LINES) + "\r\n\r\n" +
            "#b+" + hd[3] + " EXP  +" + hd[4] + " meso#k\r\n\r\n" +
            (allThreeDone() && !jackpotDoneToday() ? "#rAll 3 challenges complete! Come back to claim your jackpot bonus!#k" : "Two more challenges await!")
        );
        cm.dispose();

    // ─── Status 11: Collect turn-in confirm ─────────────────────────────────
    } else if (status == 11) {
        if (mode == 0) { cm.sendOk("Of course. Bring them back when you're ready."); cm.dispose(); return; }
        var tier = getTier();
        var cd = COLLECT_DATA[tier];
        var has = cm.itemQuantity(cd[0]);
        if (has < cd[2]) {
            cm.sendOk("You're still short! You have " + has + "/" + cd[2] + " " + cd[1] + ". Go collect the rest.");
            cm.dispose();
            return;
        }
        cm.gainItem(cd[0], -cd[2]);
        cm.gainExp(cd[3]);
        cm.gainMeso(cd[4]);
        markDoneToday(Q_COLLECT);
        try { cm.forceCompleteQuest(Q_COLLECT); } catch(e) {}
        cm.sendOk(
            "#b[Vesper the Wandering Chronicler]#k\r\n\r\n" +
            randomLine(COMPLETE_COLLECT_LINES) + "\r\n\r\n" +
            "#b+" + cd[3] + " EXP  +" + cd[4] + " meso#k\r\n\r\n" +
            (allThreeDone() && !jackpotDoneToday() ? "#rAll 3 challenges complete! Come back to claim your jackpot bonus!#k" : "Two more challenges await!")
        );
        cm.dispose();

    // ─── Status 12: Explore turn-in confirm ─────────────────────────────────
    } else if (status == 12) {
        if (mode == 0) { cm.sendOk("Come back when you've confirmed all three waypoints."); cm.dispose(); return; }
        var tier = getTier();
        var ed = EXPLORE_DATA[tier];
        // Re-validate stops using date stamps (prevents stale data exploits)
        var ts = getTodayStamp();
        var s0 = false, s1 = false, s2 = false;
        try { s0 = cm.getQuestProgress(Q_EXPLORE, 2) === ts; } catch(e) {}
        try { s1 = cm.getQuestProgress(Q_EXPLORE, 3) === ts; } catch(e) {}
        try { s2 = cm.getQuestProgress(Q_EXPLORE, 4) === ts; } catch(e) {}
        var stops = (s0 ? 1 : 0) + (s1 ? 1 : 0) + (s2 ? 1 : 0);
        if (stops < 3) {
            cm.sendOk("You still have stops to confirm. Find the Field Journal boards in Henesys, Ellinia, and Perion and stamp each one.");
            cm.dispose();
            return;
        }
        // Reward: flat EXP + meso + level-scaled bonus
        var expR  = [4000,  10000, 18000, 30000, 50000, 75000];
        var mesoR = [6000,  14000, 22000, 40000, 65000, 100000];
        cm.gainExp(expR[tier]);
        cm.gainMeso(mesoR[tier]);
        markDoneToday(Q_EXPLORE);
        try { cm.forceCompleteQuest(Q_EXPLORE); } catch(e) {}
        cm.sendOk(
            "#b[Vesper the Wandering Chronicler]#k\r\n\r\n" +
            randomLine(COMPLETE_EXPLORE_LINES) + "\r\n\r\n" +
            "#b+" + expR[tier] + " EXP  +" + mesoR[tier] + " meso#k\r\n\r\n" +
            (allThreeDone() && !jackpotDoneToday() ? "#r[!! ALL 3 DONE !!] Return to the board to claim your daily jackpot!#k" : "Excellent work!")
        );
        cm.dispose();

    // ─── Status 20: Hunt accept ──────────────────────────────────────────────
    } else if (status == 20) {
        if (mode == 0) { cm.sendOk("Reconsidering? Fair enough — the board will be here."); cm.dispose(); return; }
        try { cm.forceStartQuest(Q_HUNT); } catch(e) {}
        var tier = getTier();
        var hd = HUNT_DATA[tier];
        cm.sendOk(
            "#b[Vesper the Wandering Chronicler]#k\r\n\r\n" +
            randomLine(HUNT_ACCEPT_LINES) + "\r\n\r\n" +
            "#bHunt: " + hd[2] + " " + hd[1] + "#k\r\n" +
            "Where: #d" + hd[5] + "#k\r\n\r\n" +
            "Your progress will be tracked automatically. Return here when the job's done."
        );
        cm.dispose();

    // ─── Status 21: Collect accept ───────────────────────────────────────────
    } else if (status == 21) {
        if (mode == 0) { cm.sendOk("Take your time — I'll be here when you're ready."); cm.dispose(); return; }
        try { cm.forceStartQuest(Q_COLLECT); } catch(e) {}
        var tier = getTier();
        var cd = COLLECT_DATA[tier];
        cm.sendOk(
            "#b[Vesper the Wandering Chronicler]#k\r\n\r\n" +
            randomLine(COLLECT_ACCEPT_LINES) + "\r\n\r\n" +
            "#bCollect: " + cd[2] + "x #t" + cd[0] + "# " + cd[1] + "#k\r\n" +
            "From: #d" + cd[5] + "#k\r\n\r\n" +
            "Bring them all back to me and I'll examine them personally. And pay you. That too."
        );
        cm.dispose();

    // ─── Status 22: Explore accept ───────────────────────────────────────────
    } else if (status == 22) {
        if (mode == 0) { cm.sendOk("Wander when the spirit moves you. The contacts will wait."); cm.dispose(); return; }
        try { cm.forceStartQuest(Q_EXPLORE); } catch(e) {}
        var tier = getTier();
        var ed = EXPLORE_DATA[tier];
        cm.sendOk(
            "#b[Vesper the Wandering Chronicler]#k\r\n\r\n" +
            randomLine(EXPLORE_ACCEPT_LINES) + "\r\n\r\n" +
            "#bStop 1:#k " + ed[0][1] + " — Find #b" + ed[0][3] + "#k\r\n" +
            "#bStop 2:#k " + ed[1][1] + " — Find #b" + ed[1][3] + "#k\r\n" +
            "#bStop 3:#k " + ed[2][1] + " — Find #b" + ed[2][3] + "#k\r\n\r\n" +
            "Each contact will automatically log your visit when you speak to them. Return here once all three are confirmed."
        );
        cm.dispose();

    } else {
        cm.dispose();
    }
}
