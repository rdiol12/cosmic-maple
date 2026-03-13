/**
 * @NPC:     Sage Instructor (9990001)
 * @Purpose: Sage class 1st job advancement
 * @Job:     BEGINNER(0) → SAGE(600)
 * @Level:   10+
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
        if (cm.getLevel() < 10 || !(cm.getJobId() == 0)) {
            cm.sendOk("You must be a Beginner of level 10 or higher to become a Sage.");
            cm.dispose();
        } else {
            cm.sendYesNo("Greetings, traveler. I am Sage Instructor.\r\n\r\nYou have shown great potential. Are you ready to advance and become a #bSage#k?");
        }
    } else if (status == 1) {
        if (mode == 1) {
            cm.changeJobById(600);
        cm.teachSkill(6001001, 0, 15, -1);
        cm.teachSkill(6001002, 0, 10, -1);
            cm.sendOk("Congratulations! You are now a #bSage#k.\r\nYour journey on the path of elemental mastery begins now.\r\nNew skills have been granted — check your skill menu.");
        } else {
            cm.sendOk("Come back when you are ready to advance.");
        }
        cm.dispose();
    }
}
