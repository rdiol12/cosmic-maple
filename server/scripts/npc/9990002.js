/**
 * @NPC:     Elementalist Master (9990002)
 * @Purpose: Sage class 2nd job advancement
 * @Job:     SAGE(600) → ELEMENTALIST(610)
 * @Level:   30+
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
        if (cm.getLevel() < 30 || !(cm.getJobId() == 600)) {
            cm.sendOk("You must be a Sage of level 30 or higher to advance.");
            cm.dispose();
        } else {
            cm.sendYesNo("Greetings, traveler. I am Elementalist Master.\r\n\r\nYou have shown great potential. Are you ready to advance and become a #bElementalist#k?");
        }
    } else if (status == 1) {
        if (mode == 1) {
            cm.changeJobById(610);
        cm.teachSkill(6101003, 0, 15, -1);
        cm.teachSkill(6101004, 0, 20, -1);
            cm.sendOk("Congratulations! You are now a #bElementalist#k.\r\nYour journey on the path of elemental mastery begins now.\r\nNew skills have been granted — check your skill menu.");
        } else {
            cm.sendOk("Come back when you are ready to advance.");
        }
        cm.dispose();
    }
}
