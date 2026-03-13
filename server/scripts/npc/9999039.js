/**
 * @NPC:     Arbiter Vex (9999039)
 * @Location: Crimson Coliseum: Lobby (920000000)
 * @Purpose: PvP Zone entry NPC — rules, lore, arena warp, Arena Token info
 */

var status = -1;
var selectedIdx = -1;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) { cm.dispose(); return; }
    if (mode == 0 && status == 0) { cm.dispose(); return; }
    if (mode == 1) status++;
    else status--;

    if (status == 0) {
        cm.sendSimple(
            "*Arbiter Vex: Scarred veteran of a hundred arena battles, now keeper of the Coliseum's ancient traditions.*\r\n\r\n" +
            "Welcome to the #bCrimson Coliseum#k, adventurer. These sands have drunk the blood of warriors since before Victoria Island had kings.\r\n\r\n" +
            "#L0##bEnter the Battle Floor#k — Fight the Coliseum's challengers#l\r\n" +
            "#L1##bWhat are Arena Tokens?#k — Learn the reward system#l\r\n" +
            "#L2##bColiseum Lore#k — The history of these halls#l\r\n" +
            "#L3##dLeave#k#l"
        );
    } else if (status == 1) {
        selectedIdx = selection;

        if (selectedIdx == 0) {
            // Enter arena
            cm.sendYesNo(
                "The Battle Floor awaits. Three tiers of challengers stand between you and glory:\r\n\r\n" +
                "#b• Ground tier#k — Death Teddies (Lv.80) — fast kills, drop #bArena Tokens#k\r\n" +
                "#b• Platform tier#k — Tauromacis (Lv.40) — easier warm-up combat\r\n" +
                "#b• High throne#k — Balrogs (Lv.100) — elite test of strength\r\n\r\n" +
                "Defeat enemies to earn #bArena Tokens#k. Bring them to the Quartermaster for rewards.\r\n\r\n" +
                "If you fall, you'll be returned here safely. Ready?"
            );
        } else if (selectedIdx == 1) {
            // Token info
            cm.sendOk(
                "#bArena Token#k — Proof of valor earned in the Coliseum.\r\n\r\n" +
                "Tokens drop from challengers on the Battle Floor:\r\n" +
                "• Tauromacis: low chance (~10%)\r\n" +
                "• Death Teddies: moderate chance (~20%)\r\n" +
                "• Balrogs: high chance (~40%)\r\n\r\n" +
                "Bring your tokens to the #bColiseum Quartermaster#k (to my right) to exchange for mesos, potions, and special rewards."
            );
            cm.dispose();
        } else if (selectedIdx == 2) {
            // Lore
            cm.sendNext(
                "The Crimson Coliseum was built by the First Warriors — adventurers who survived the Age of Chaos by forging strength through endless battle.\r\n\r\n" +
                "When the monsters were driven back to the outer reaches, the great warriors refused to let their art die. They built these halls so that future generations would never grow soft.\r\n\r\n" +
                "Every scar on these walls is a lesson. Every flagstone was laid by someone who bled for it."
            );
            cm.dispose();
        } else {
            cm.dispose();
        }
    } else if (status == 2) {
        if (selectedIdx == 0) {
            if (mode == 1) {
                // Warp to arena
                cm.warp(920000001, 0);
            } else {
                cm.sendOk("Come back when you're ready for the arena.");
            }
        }
        cm.dispose();
    }
}
