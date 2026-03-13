/**
 * @NPC:     Nurse Joy (9999077)
 * @Purpose: Free healer NPC — restores HP/MP to full
 * @Location: Sage Spire Library (990100100)
 */
var status = 0;

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
        var hp = cm.getPlayer().getHp();
        var maxHp = cm.getPlayer().getMaxHp();
        var mp = cm.getPlayer().getMp();
        var maxMp = cm.getPlayer().getMaxMp();

        if (hp >= maxHp && mp >= maxMp) {
            cm.sendOk("#b[Nurse Joy]#k\r\n\r\n*smiles warmly*\r\n\r\nYou look perfectly healthy! No need for treatment today.\r\n\r\nStay safe out there, adventurer!");
            cm.dispose();
        } else {
            cm.sendYesNo("#b[Nurse Joy]#k\r\n\r\n*examines you carefully*\r\n\r\nOh my, you've been through quite a battle!\r\nYour HP is #r" + hp + "/" + maxHp + "#k and MP is #r" + mp + "/" + maxMp + "#k.\r\n\r\nWould you like me to heal you? It's free of charge!");
        }
    } else if (status == 1) {
        cm.getPlayer().setHp(cm.getPlayer().getMaxHp());
        cm.getPlayer().setMp(cm.getPlayer().getMaxMp());
        cm.sendOk("#b[Nurse Joy]#k\r\n\r\n*waves her healing staff*\r\n\r\nAll better! Your HP and MP have been fully restored.\r\n\r\nRemember to rest between battles, okay?");
        cm.dispose();
    }
}
