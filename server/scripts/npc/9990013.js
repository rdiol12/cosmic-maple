/**
 * @NPC:     Kael'Mortis the Eternal (9990013)
 * @Purpose: Necromancer 4th job advancement (Soul Reaper 711 → Lich King 712)
 * @Location: Shadow Crypts hub (990200000) — inner sanctum section
 * @Level:   100+ | Job: Soul Reaper (711)
 * @Personality: Imperious, ancient, absolute authority. Dark wisdom without cruelty.
 *               Chose to remain as a guide rather than conquer. He has already ruled.
 *
 * Requirements to advance:
 *   - Level 100+ | Job = Soul Reaper (711)
 *   - Item 4032103: Soul Fragment of Courage    (drops from Lycanthrope, mob 8140000)
 *   - Item 4032104: Soul Fragment of Wisdom     (drops from Phantom Watch, mob 8142000)
 *   - Item 4032105: Soul Fragment of Darkness   (drops from Grim Phantom Watch, mob 8143000)
 *
 * Consumes: All 3 Soul Fragments on advancement.
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

    // Already the Lich King
    if (jobId == 712) {
        if (status == 0) {
            cm.sendOk("*Kael'Mortis regards you from his throne with something that might, in a lich, pass for approval.*\r\n\r\nYou carry the title well. Continue to grow. The dead expect excellence from their sovereign.\r\n\r\nIf you find yourself facing what you cannot defeat — return. Even I occasionally have advice worth hearing.");
            cm.dispose();
        }
        return;
    }

    // Wrong class
    if (jobId != 711) {
        if (status == 0) {
            cm.sendOk("*A towering lich sits upon a throne of bone. His presence presses against your mind like cold stone.*\r\n\r\nYou are... not ready for this chamber. The path to this throne is long, and it begins with Mordecai in the upper crypts.\r\n\r\nTurn back.");
            cm.dispose();
        }
        return;
    }

    // Level too low
    if (level < 100) {
        if (status == 0) {
            cm.sendOk("*Kael'Mortis looks at you with eyes that have watched civilizations end.*\r\n\r\nYou stand before me prematurely.\r\n\r\nLevel " + level + " Soul Reaper. You are powerful — more powerful than most who have stood in this room. But one hundred is the threshold. Not ninety-eight. Not ninety-nine.\r\n\r\nReturn when you have earned that right.");
            cm.dispose();
        }
        return;
    }

    // Check fragments
    var hasCourage  = cm.haveItem(4032103);
    var hasWisdom   = cm.haveItem(4032104);
    var hasDarkness = cm.haveItem(4032105);

    if (!hasCourage || !hasWisdom || !hasDarkness) {
        if (status == 0) {
            cm.sendNext("*The lich leans forward from his throne — a rare gesture that makes the shadows in the room shift.*\r\n\r\nI have waited centuries for one worthy of the Lich King's mantle. I will not rush it now for the sake of impatience.\r\n\r\nThree trials. Three soul fragments. You must collect all of them.");
        } else if (status == 1) {
            cm.sendNextPrev("The #bSoul Fragment of Courage#k — take it from the Lycanthrope that prowls the Forsaken Entrance to the Shadow Crypts. A creature of primal fury. It will test your nerve.\r\n\r\nThe #bSoul Fragment of Wisdom#k — claim it from the Phantom Watch in the Hall of Whispers. They are cunning, patient. Do not rush them.\r\n\r\nThe #bSoul Fragment of Darkness#k — claim it from the Grim Phantom Watch, who guards this very throne room. He will not yield it casually.");
        } else if (status == 2) {
            var missing = [];
            if (!hasCourage)  missing.push("#bSoul Fragment of Courage#k (Lycanthrope — Forsaken Entrance)");
            if (!hasWisdom)   missing.push("#bSoul Fragment of Wisdom#k (Phantom Watch — Hall of Whispers)");
            if (!hasDarkness) missing.push("#bSoul Fragment of Darkness#k (Grim Phantom Watch — Throne Room)");
            cm.sendOk("You still require:\r\n" + missing.join("\r\n") + "\r\n\r\nI have waited this long. I can wait longer. Return when you carry all three.");
            cm.dispose();
        }
        return;
    }

    // Has all three — full advancement dialogue
    if (status == 0) {
        cm.sendNext("*All three fragments pulse as you approach the throne. The darkness in the room deepens — listening.*\r\n\r\n*Kael'Mortis rises from his throne for the first time. He is taller than you expected.*\r\n\r\nYou carry the fury of the Lycanthrope. The cunning of the Phantom Watch. And the darkness of the Grim Warden himself.\r\n\r\nFew have stood here with all three. Most abandon after the first trial.");
    } else if (status == 1) {
        cm.sendNextPrev("The #bLich King#k is not a title. It is a burden willingly chosen.\r\n\r\nYou will command the dead with absolute authority. You will unleash devastation that unmakes battlefields. Apocalypse. Necrotic Blast that tears through everything in its path. Summon Lich — a companion of dark magic that fights with intelligence, not just instinct.\r\n\r\nYou will #iendure#i. Beyond what flesh imagines possible. That is the truest power of this path.");
    } else if (status == 2) {
        cm.sendNextPrev("I am the third to hold this title. The first was my teacher — she chose undeath to preserve her knowledge, not to conquer. The second was a warrior who mistook power for wisdom and eventually became lost in it.\r\n\r\nI chose to remain as a guide. When you are strong enough, I expect the same consideration of you — that you will pass this forward, rather than hoard it.\r\n\r\nThe dead serve the living. Never the other way.");
    } else if (status == 3) {
        cm.sendYesNo("I am satisfied. You have survived, demonstrated courage, cunning, and mastery of darkness — and you have listened.\r\n\r\nWill you take the fourth path — and become the #bLich King#k?");
    } else if (status == 4) {
        if (mode == 1) {
            cm.gainItem(4032103, -1);
            cm.gainItem(4032104, -1);
            cm.gainItem(4032105, -1);
            cm.changeJobById(712);
            cm.teachSkill(7121004, 0, 10, -1); // Undying Will (passive)
            cm.teachSkill(7121005, 0, 30, -1); // Dark Crescendo (passive)
            cm.sendOk("*He raises one hand. The three fragments explode into light — dark light, purple-black, impossible. The essence pours into you. The power is immense.*\r\n\r\n*He sits back on his throne.*\r\n\r\nYou are now the #bLich King#k. Your own name. Your own legacy — not mine.\r\n\r\nNecrotic Blast will clear the battlefield. Summon Lich will fight beside you. Apocalypse, when you choose to use it, will leave nothing standing. Dark Crescendo rewards discipline — learn its rhythm.\r\n\r\nI remain here. I always remain here. If you have questions — and in time, you will have questions — I will answer them.\r\n\r\nNow go. The dead are waiting for someone to lead them.");
        } else {
            cm.sendOk("*He settles back into his throne.*\r\n\r\nWhen you are ready. The fragments will not expire. I will not expire.\r\n\r\nWe are, after all, eternal.");
        }
        cm.dispose();
    }
}
