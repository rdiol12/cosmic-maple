/**
 * Captain Flint — NPC 9999008
 * Location: Lith Harbor (104000000)
 * Type: Inter-Town Ferry Captain
 * Transports players between Victoria Island towns for mesos
 */
var status = 0;
var selectedDest = -1;

var destinations = [
    { name: "Henesys",      mapId: 100000000, cost: 1000, desc: "The Bowman village surrounded by peaceful prairies." },
    { name: "Ellinia",      mapId: 101000000, cost: 1000, desc: "The magical Magician town high in the ancient trees." },
    { name: "Perion",       mapId: 102000000, cost: 1000, desc: "The rugged Warrior town carved into the red cliffs." },
    { name: "Kerning City", mapId: 103000000, cost: 1000, desc: "The shadowy city where Thieves make their home." },
    { name: "Sleepywood",   mapId: 105000000, cost: 2000, desc: "The remote village at the edge of the deep dungeon." }
];

function start() {
    status = 0;
    cm.sendNext("#b[Captain Flint]#k\r\nAhoy, adventurer! I'm Captain Flint, skipper of the #bMarietta Rosa#k — fastest vessel in the Victoria Island waterways.\r\n\r\nWant to cross the island without walking? I can get you there in a flash — for the right price.");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "Where can I take you?\r\n\r\n";
        for (var i = 0; i < destinations.length; i++) {
            menu += "#L" + i + "##b" + destinations[i].name + "#k — " + destinations[i].cost + " mesos#l\r\n";
        }
        menu += "#L" + destinations.length + "#Nowhere today, Captain#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == destinations.length) {
            cm.sendOk("Safe travels on foot, then! The seas will still be here.");
            cm.dispose();
            return;
        }
        selectedDest = selection;
        var d = destinations[selectedDest];
        cm.sendYesNo("#b" + d.name + "#k\r\n" + d.desc + "\r\n\r\nFare: #r" + d.cost + " mesos#k\r\n\r\nAll aboard?");

    } else if (status == 3) {
        if (mode == 0) {
            cm.sendOk("No rush! My ship sails when you're ready.");
            cm.dispose();
            return;
        }
        var d = destinations[selectedDest];
        if (cm.getMeso() < d.cost) {
            cm.sendOk("Sorry, mate. You need #r" + d.cost + " mesos#k for passage to " + d.name + ". You only have " + cm.getMeso() + " mesos.\r\n\r\nEarn a bit more and come back!");
        } else {
            cm.gainMeso(-d.cost);
            cm.sendNext("Hoist the anchor! Next stop: #b" + d.name + "#k!\r\n\r\nHold on tight — the Marietta Rosa doesn't slow down for anyone!");
            cm.warp(d.mapId, 0);
        }
        cm.dispose();
    }
}
