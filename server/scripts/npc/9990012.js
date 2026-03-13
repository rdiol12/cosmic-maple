/**
 * @NPC:     The Bone Oracle (9990012)
 * @Purpose: Necromancer 3rd job advancement (Dark Acolyte 710 → Soul Reaper 711)
 * @Location: Shadow Crypts hub (990200000)
 * @Level:   60+ | Job: Dark Acolyte (710)
 * @Personality: Ancient undead seer. Speaks in fragments. Orbited by bone shards.
 *               Communicates through divination, not conversation.
 *
 * Requirements to advance:
 *   - Level 60+ | Job = Dark Acolyte (710)
 *   - Item 4032102: Dark Soul Crystal  (drops from Bain, mob ID 8140500, in Shadow Crypts)
 *
 * Consumes: Dark Soul Crystal on advancement.
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
    if (jobId == 711 || jobId == 712) {
        if (status == 0) {
            cm.sendOk("*The Oracle's burning gaze rests on you.*\r\n\r\n...The bones remember what you were.\r\n\r\n...Walk your path. Kael'Mortis waits for those who seek what comes after.");
            cm.dispose();
        }
        return;
    }

    // Wrong class
    if (jobId != 710) {
        if (status == 0) {
            cm.sendOk("*A skeletal figure draped in dark robes does not turn toward you. Dozens of tiny bone fragments orbit her in slow, deliberate patterns.*\r\n\r\n...The bones sense a presence that does not belong here.\r\n\r\n...This path is not yours.");
            cm.dispose();
        }
        return;
    }

    // Level too low
    if (level < 60) {
        if (status == 0) {
            cm.sendOk("*The Oracle tilts her skull — the closest she comes to an expression.*\r\n\r\n...The bones speak of insufficient power. Level " + level + ".\r\n\r\n...The threshold is sixty. Thirty more. Return then.\r\n\r\n...The Oracle will be here.");
            cm.dispose();
        }
        return;
    }

    // No crystal
    if (!cm.haveItem(4032102)) {
        if (status == 0) {
            cm.sendNext("*The bone shards orbiting the Oracle slow. She turns toward you with deliberate, ancient attention.*\r\n\r\n...You seek the Soul Reaper's mantle. The bones have seen this moment approaching.\r\n\r\nBut you carry no proof of death-mastery. The #bDark Soul Crystal#k — it must be claimed from Bain.");
        } else if (status == 1) {
            cm.sendNextPrev("...Bain dwells in the #bAbyssal Corridor#k — beyond the Hall of Whispers, deeper in the Shadow Crypts. He is old. Patient. He does not surrender the crystal willingly.\r\n\r\n...Defeat him. Take what he holds. The crystal is made of condensed soul-essence — you will know it when you see it.");
        } else if (status == 2) {
            cm.sendOk("...Return when you carry the Dark Soul Crystal. The Oracle will be waiting.\r\n\r\n...The bones never forget.");
            cm.dispose();
        }
        return;
    }

    // Has crystal — full advancement dialogue
    if (status == 0) {
        cm.sendNext("*The crystal pulses as you approach. The bone shards around the Oracle freeze mid-orbit. For a long moment, there is only silence.*\r\n\r\n...You have taken Bain's soul-essence. He does not give that willingly.\r\n\r\n...The bones approve.");
    } else if (status == 1) {
        cm.sendNextPrev("...The #bSoul Reaper#k walks between worlds. You will harvest souls not for destruction but for #ipower#i — power to summon, to sustain, to #idominate#i.\r\n\r\n...You will raise an army where others raise one warrior. You will plague where others strike. You will shield your allies with spectral armor where others leave them exposed.");
    } else if (status == 2) {
        cm.sendNextPrev("...When you reach level 100 — seek #bKael'Mortis the Eternal#k in the inner sanctum at the heart of these crypts. He will not come to you.\r\n\r\n...He will require three soul fragments from the guardians of the Shadow Crypts. Prepare accordingly.\r\n\r\n...The Oracle has foreseen it.");
    } else if (status == 3) {
        cm.sendYesNo("*The bone shards resume their orbit — faster now.*\r\n\r\n...The Oracle sees your future. An army of undead answering your call across shattered battlefields.\r\n\r\n...Shall the third path open?");
    } else if (status == 4) {
        if (mode == 1) {
            cm.gainItem(4032102, -1);
            cm.changeJobById(711);
            cm.teachSkill(7111003, 0, 20, -1); // Soul Shield (buff)
            cm.sendOk("*She crushes the crystal in her skeletal palm. The soul-essence flows outward and into you. The sensation is vast and cold and entirely unlike anything you have felt before.*\r\n\r\n...You are now a #bSoul Reaper#k.\r\n\r\nYour undead army grows larger. Your plague strikes deeper. Death Mark weakens those who stand against you and your allies.\r\n\r\n...Seek Kael'Mortis at level 100. He waits in the innermost sanctum.\r\n\r\n...The bones have spoken.");
        } else {
            cm.sendOk("...Return when you are ready. The bones will remember.\r\n\r\n...The Oracle has time.");
        }
        cm.dispose();
    }
}
