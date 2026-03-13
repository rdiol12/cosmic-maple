/**
 * @NPC:     Arcanum Council (9990003)
 * @Purpose: Sage class 3rd job advancement
 * @Job:     ELEMENTALIST(610) → ARCANUM(611)
 * @Level:   60+
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
        if (cm.getLevel() < 60 || !(cm.getJobId() == 610)) {
            cm.sendOk("You must be a Elementalist of level 60 or higher to advance.");
            cm.dispose();
        } else {
            cm.sendYesNo("Greetings, traveler. I am Arcanum Council.\r\n\r\nYou have shown great potential. Are you ready to advance and become a #bArcanum#k?");
        }
    } else if (status == 1) {
        if (mode == 1) {
            cm.changeJobById(611);
        cm.teachSkill(6111003, 0, 20, -1);
        cm.teachSkill(6111004, 0, 30, -1);
            cm.sendOk("Congratulations! You are now a #bArcanum#k.\r\nYour journey on the path of elemental mastery begins now.\r\nNew skills have been granted — check your skill menu.");
        } else {
            cm.sendOk("Come back when you are ready to advance.");
        }
        cm.dispose();
    }
}
