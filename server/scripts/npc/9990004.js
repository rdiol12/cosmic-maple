/**
 * @NPC:     Archsage Elder (9990004)
 * @Purpose: Sage class 4th job advancement
 * @Job:     ARCANUM(611) → ARCHSAGE(612)
 * @Level:   100+
 */

var status;

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
    if (mode == 1) status++;
    else status--;

    if (status == 0) {
        if (cm.getLevel() < 100 || !(cm.getJobId() == 611)) {
            cm.sendOk("You must be a Arcanum of level 100 or higher to advance.");
            cm.dispose();
        } else {
            cm.sendYesNo("Greetings, traveler. I am Archsage Elder.\r\n\r\nYou have shown great potential. Are you ready to advance and become a #bArchsage#k?");
        }
    } else if (status == 1) {
        if (mode == 1) {
            cm.changeJobById(612);
        cm.teachSkill(6121003, 0, 30, -1);
        cm.teachSkill(6121004, 0, 30, -1);
            cm.sendOk("Congratulations! You are now a #bArchsage#k.\r\nYour journey on the path of elemental mastery begins now.\r\nNew skills have been granted — check your skill menu.");
        } else {
            cm.sendOk("Come back when you are ready to advance.");
        }
        cm.dispose();
    }
}
