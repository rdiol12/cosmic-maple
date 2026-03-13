/**
 * @NPC:     Lady Vesper (9990011)
 * @Purpose: Necromancer 2nd job advancement (Necromancer 700 → Dark Acolyte 710)
 * @Location: Shadow Crypts hub (990200000)
 * @Level:   30+ | Job: Necromancer (700)
 * @Personality: Elegant, refined, cold. Tests through composure, not raw power.
 *
 * Requirements to advance:
 *   - Level 30+ | Job = Necromancer (700)
 *   - Item 4032101: Mordecai's Referral Letter  (from NPC 9990010 / Mordecai)
 *   - Item 4032100 x20: Crypt Shade Tail  (drop from mobs in 990200100)
 *
 * Consumes: Referral Letter + 20 Crypt Shade Tails on advancement.
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

    var jobId = cm.getJobId();
    var level = cm.getLevel();

    // Already advanced beyond this tier
    if (jobId == 710 || jobId == 711 || jobId == 712) {
        if (status == 0) {
            cm.sendOk("*Lady Vesper gives you a measured nod.*\r\n\r\nYou represent this lineage... adequately. The Oracle and Kael'Mortis await those who seek the higher paths.");
            cm.dispose();
        }
        return;
    }

    // Wrong class
    if (jobId != 700) {
        if (status == 0) {
            cm.sendOk("*A woman in black silk looks up from her reading with polite disinterest.*\r\n\r\nYou are not one of mine. I have nothing for you here.");
            cm.dispose();
        }
        return;
    }

    // Level too low
    if (level < 30) {
        if (status == 0) {
            cm.sendOk("*She glances up, then returns to her book.*\r\n\r\nLevel " + level + ". The threshold is 30. Come back when you've earned it. I don't evaluate potential — I evaluate results.");
            cm.dispose();
        }
        return;
    }

    // No referral letter
    if (!cm.haveItem(4032101)) {
        if (status == 0) {
            cm.sendOk("*She sets down her book with a quiet, deliberate motion.*\r\n\r\nYou arrive without Mordecai's referral. Either he hasn't assessed you, or he has and found you lacking.\r\n\r\nSpeak to #bMordecai the Gravedigger#k first. I don't evaluate the uninvited.");
            cm.dispose();
        }
        return;
    }

    // Has letter but missing tails
    if (!cm.haveItem(4032100, 20)) {
        if (status == 0) {
            cm.sendNext("*She accepts Mordecai's letter and reads it with unhurried precision.*\r\n\r\nHis seal. He still uses the same wax. Sentimental.\r\n\r\nA letter is paper, darling. I need to see that your magic is more than theoretical.");
        } else if (status == 1) {
            cm.sendOk("The Crypt Shades haunt the Burial Vestibule below — your training ground. Bring me #b20 of their tails#k. I want controlled casting, not desperate hacking.\r\n\r\nYou have: #b" + (cm.itemQuantity ? cm.itemQuantity(4032100) : "some") + "/20#k Crypt Shade Tails. Return when you have enough.");
            cm.dispose();
        }
        return;
    }

    // Has everything — full advancement dialogue
    if (status == 0) {
        cm.sendNext("*She examines the tails with the detached precision of an appraiser.*\r\n\r\nTwenty. Clean kills, mostly. Your Bone Spear is developing a consistency that most at your level lack.\r\n\r\nVery well. Mordecai's instincts remain sound.");
    } else if (status == 1) {
        cm.sendNextPrev("A #bDark Acolyte#k is not merely a Necromancer who survived long enough. You are beginning to grasp the #iarchitecture#i of death — its patterns, its rules, the places where the rules bend.\r\n\r\nYou will summon more. Command more. And in time — #ibend#i more.");
    } else if (status == 2) {
        cm.sendNextPrev("When you reach level 60, seek the #bBone Oracle#k in the inner section of these crypts. She communicates through bone-casting divination — less conversational than I am, but her trials are what separate the second path from the third.\r\n\r\nShe will require the #bDark Soul Crystal#k from Bain in the Abyssal Corridor. Approach him prepared.");
    } else if (status == 3) {
        cm.sendYesNo("I will advance you to #bDark Acolyte#k. In return, represent this lineage with precision. Brutality is acceptable. Sloppiness is not.\r\n\r\nShall we proceed?");
    } else if (status == 4) {
        if (mode == 1) {
            cm.gainItem(4032101, -1);
            cm.gainItem(4032100, -20);
            cm.changeJobById(710);
            cm.teachSkill(7101003, 0, 20, -1); // Dark Mastery (passive)
            cm.sendOk("*She places one elegant hand briefly on your shoulder. Dark energy flows through you in a precise, controlled pulse.*\r\n\r\nWelcome to the second path, #bDark Acolyte#k.\r\n\r\nYour Bone Spear strikes multiple enemies now. Your Skeleton fights with greater ferocity. Use Curse of Weakness against anything that resists — it makes everything that follows easier.\r\n\r\nFind the #bBone Oracle#k at level 60. She is... brief. Do not take it personally.");
        } else {
            cm.sendOk("*She nods without expression.*\r\n\r\nReturn when you are ready. Hesitation is not a virtue I penalize — but it is one I remember.");
        }
        cm.dispose();
    }
}
