/**
 * @NPC:     Mordecai the Gravedigger (9990010)
 * @Purpose: Necromancer 1st job advancement (Beginner → Necromancer 700)
 *           + issues Referral Letter to Lv30+ Necromancers seeking 2nd job
 * @Location: Shadow Crypts hub (990200000)
 * @Personality: Gruff, pragmatic, dark humor. Forty years among the dead.
 *
 * Quest items used:
 *   4032101 — Mordecai's Referral Letter  (given here for 2nd job seekers)
 */

var status = -1;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) { cm.dispose(); return; }
    if (mode == 0 && status == 0) { cm.dispose(); return; }
    if (mode == 1) status++;
    else status--;

    var jobId  = cm.getJobId();
    var level  = cm.getLevel();

    // ── Referral branch: Level 30+ Necromancer seeking 2nd job ──────────────
    if (jobId == 700 && level >= 30 && !cm.haveItem(4032101)) {
        if (status == 0) {
            cm.sendNext("*Mordecai sets down his shovel and looks you over with the practiced eye of someone who has sorted the dead from the soon-to-be-dead for forty years.*\r\n\r\nSo. You've grown into your power, #b" + cm.getChar().getName() + "#k. The shades whisper your name now — I can feel them watching you.\r\n\r\nLady Vesper will want proof I found you worthy before she gives you the time of day. She's particular like that.");
        } else if (status == 1) {
            cm.sendNextPrev("You've survived the first lessons. Bone Spear, Summon Skeleton... you've started commanding the dead rather than fearing them. That's no small thing.\r\n\r\nI'll write you a letter of introduction. Guard it — she'll use any excuse to turn away the unworthy.");
        } else if (status == 2) {
            cm.gainItem(4032101, 1);
            cm.sendOk("*He pulls a folded letter from his coat pocket, already sealed.*\r\n\r\nAlmost like I was expecting you.\r\n\r\nTake this to #bLady Vesper#k. She stands deeper in the crypts — you'll smell the perfume before you see her. And bring her #b20 Crypt Shade Tails#k as well. Paper alone won't satisfy her.\r\n\r\nDon't come back until you're ready to move on.");
            cm.dispose();
        }
        return;
    }

    // ── Already has letter ───────────────────────────────────────────────────
    if (jobId == 700 && cm.haveItem(4032101)) {
        if (status == 0) {
            cm.sendOk("You still have my letter. Good — don't lose it.\r\n\r\n#bLady Vesper#k is further in the crypts. Bring her the letter and #b20 Crypt Shade Tails#k. The shades train in the Burial Vestibule below — you know the place.");
            cm.dispose();
        }
        return;
    }

    // ── 1st job advancement: Beginner, Level 10+ ────────────────────────────
    if (jobId == 0 && level >= 10) {
        if (status == 0) {
            cm.sendNext("*An old man with dirt-stained hands and sharp eyes looks up from the grave he is digging. He does not look surprised to see you.*\r\n\r\nYou have the look of someone the dead find interesting. Most people don't get that look.\r\n\r\nI am Mordecai. I have tended these crypts for forty years. The dead don't bother me. It's the living I find suspicious — especially the ones drawn to places like this.");
        } else if (status == 1) {
            cm.sendNextPrev("Most people who wander down here run screaming within the hour. You're still standing. That tells me something important about you.\r\n\r\nThe Necromancer's path is not about darkness for its own sake. Death is simply another state — like sleep, like waking. We who walk the boundary between living and dead... we understand what others are too frightened to look at directly.");
        } else if (status == 2) {
            cm.sendNextPrev("I've been watching you since you stepped into the crypts. You have what we call the Sensitivity — that rare awareness of the membrane between the living and the dead. Not everyone has it. Most who do waste it on fear.\r\n\r\nYou didn't run. You came deeper.");
        } else if (status == 3) {
            cm.sendYesNo("I can open that door for you. Make you a #bNecromancer#k. The dead will stop being background noise and start being something you can actually work with.\r\n\r\nBut I'll be honest with you: once you step through, the shadows never quite leave you. They follow. They watch. You won't mind it after a while — but you'll notice it forever.\r\n\r\nAre you ready for that?");
        } else if (status == 4) {
            if (mode == 1) {
                cm.changeJobById(700);
                cm.teachSkill(7001001, 0, 10, -1); // Soul Siphon
                cm.teachSkill(7001002, 0, 15, -1); // Dark Pact
                cm.sendOk("*He reaches out and places two fingers briefly on your forehead. Something cold passes through you — not unpleasant. Like a door opening.*\r\n\r\nThere it is. Feel that? That awareness settling into your bones — that's your connection to the dead waking up.\r\n\r\nYou are now a #bNecromancer#k. Check your skills. Train them. The Bone Spear is straightforward. The Soul Siphon takes practice — focus on what you're drawing from them, not on the target.\r\n\r\nWhen you reach level 30... come back and speak to me again.");
            } else {
                cm.sendOk("*He nods slowly and goes back to his digging.*\r\n\r\nCome back when you've made up your mind. The dead aren't going anywhere.");
            }
            cm.dispose();
        }
        return;
    }

    // ── Too low level ────────────────────────────────────────────────────────
    if (jobId == 0 && level < 10) {
        if (status == 0) {
            cm.sendOk("*The gravedigger barely glances up.*\r\n\r\nNot yet. Come back when you've reached level 10. The path takes a minimum of readiness.");
            cm.dispose();
        }
        return;
    }

    // ── Already advanced or wrong class ─────────────────────────────────────
    if (status == 0) {
        if (jobId == 710 || jobId == 711 || jobId == 712) {
            cm.sendOk("*Mordecai nods with quiet approval.*\r\n\r\nYou've come far from that first conversation. The crypts remember those who honor their path.\r\n\r\nKeep walking it.");
        } else {
            cm.sendOk("*The gravedigger eyes you with mild suspicion.*\r\n\r\nNothing for you here, wanderer. Move along before the dead take an interest in you specifically.");
        }
        cm.dispose();
    }
}
