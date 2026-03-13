/* Sheriff Aldric — Kill Board NPC (9999050)
 * Located in Henesys (100000000)
 * Gives 10 one-time bounty quests for hunting Victoria Island monsters.
 */
var status = -1;
var selected = -1;

var quests  = [99050, 99051, 99052, 99053, 99054, 99055, 99056, 99057, 99058, 99059];
var titles  = [
    "Snail Extermination",
    "Mushroom Clearance",
    "Pig Population Control",
    "Slime Containment",
    "Orange Mushroom Warning",
    "Evil Eye Suppression",
    "Wild Boar Culling",
    "Jr. Necki Bounty",
    "Zombie Eradication",
    "Jr. Balrog Hunt"
];
var targets = [
    "Blue Snails", "Mushrooms", "Pigs", "Slimes",
    "Orange Mushrooms", "Evil Eyes", "Wild Boars",
    "Jr. Neckis", "Zombie Mushrooms", "Jr. Balrogs"
];
var counts  = [100, 80, 60, 80, 50, 40, 50, 30, 40, 15];
var expR    = [20000, 25000, 20000, 25000, 32000, 38000, 45000, 50000, 55000, 80000];
var mesoR   = [10000, 12000, 10000, 12000, 16000, 19000, 22000, 25000, 28000, 40000];

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1 || mode == 0) {
        cm.dispose();
        return;
    }
    status++;

    if (status == 0) {
        var board = "#b[VICTORIA ISLAND KILL BOARD]#k\r\n" +
            "I'm Sheriff Aldric — retired Warrior, now Victoria Island's chief monster liaison. " +
            "Citizens pay me to deal with infestations. I pay hunters like you to do the actual hunting.\r\n\r\n" +
            "Select a bounty:\r\n";
        var hasAny = false;
        for (var i = 0; i < titles.length; i++) {
            var tag = "";
            if (cm.isQuestCompleted(quests[i])) {
                tag = " #g[CLAIMED]#k";
            } else if (cm.isQuestStarted(quests[i])) {
                tag = " #b[ACTIVE]#k";
                hasAny = true;
            } else {
                hasAny = true;
            }
            board += "\r\n#L" + i + "#" + titles[i] + " — " + counts[i] + " " + targets[i] + tag + "#l";
        }
        board += "\r\n#L10#I'm just browsing.#l";
        if (!hasAny) {
            cm.sendOk("*leans back in chair* Well I'll be darned. You've cleared every bounty on the board. " +
                "Victoria Island is safer thanks to you. Check back after maintenance — the farmers never rest!");
            cm.dispose();
            return;
        }
        cm.sendSimple(board);
        return;
    }

    if (status == 1) {
        if (selection == 10) {
            cm.sendOk("*nods* The board's always open. Come back when you're ready to hunt.");
            cm.dispose();
            return;
        }
        selected = selection;
        var qid = quests[selected];
        if (cm.isQuestCompleted(qid)) {
            cm.sendOk("*flips through ledger* You've already claimed that bounty. Check the board for others!");
            cm.dispose();
            return;
        }
        if (cm.isQuestStarted(qid)) {
            cm.sendYesNo("*peers at clipboard* '" + titles[selected] + "'\r\n\r\n" +
                "Status: In progress — " + counts[selected] + " " + targets[selected] + " needed.\r\n" +
                "Reward: #b" + expR[selected] + " EXP + " + mesoR[selected] + " meso#k\r\n\r\n" +
                "Ready to turn in your kill report?");
            return;
        }
        cm.sendYesNo("*stamps bounty form with a thud*\r\n\r\n" +
            "#b" + titles[selected].toUpperCase() + "#k\r\n" +
            "TARGET: " + counts[selected] + " " + targets[selected] + "\r\n" +
            "REWARD: #b" + expR[selected] + " EXP + " + mesoR[selected] + " meso#k\r\n\r\n" +
            "These pests won't stop themselves. Accept this bounty?");
        return;
    }

    if (status == 2) {
        var qid = quests[selected];
        if (cm.isQuestStarted(qid)) {
            cm.forceCompleteQuest(qid);
            if (cm.isQuestCompleted(qid)) {
                cm.gainExp(expR[selected]);
                cm.gainMeso(mesoR[selected]);
                cm.sendOk("*stamps 'COMPLETE' in red ink* Outstanding! " +
                    counts[selected] + " " + targets[selected] + " dealt with.\r\n\r\n" +
                    "#b+" + expR[selected] + " EXP  +" + mesoR[selected] + " meso#k\r\n\r\n" +
                    "The citizens sleep easier tonight. Well done, hunter.");
            } else {
                cm.sendOk("*squints at the report* The numbers don't add up. " +
                    "You still need to kill " + counts[selected] + " " + targets[selected] + " total. Keep at it!");
            }
        } else {
            cm.forceStartQuest(qid);
            cm.sendOk("*slides bounty form across the desk*\r\n\r\n" +
                "Bounty accepted: #b" + titles[selected] + "#k\r\n" +
                "Hunt: " + counts[selected] + " " + targets[selected] + "\r\n\r\n" +
                "Your kills will be tracked automatically. Return here when the job's done.\r\n" +
                "#bGood hunting.#k");
        }
        cm.dispose();
    }
}
