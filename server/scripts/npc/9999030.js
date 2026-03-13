/**
 * NPC: Sage Instructor Elara (9999030)
 * Location: Sage Hall (101050000) and Ellinia (101000000)
 * Purpose: Job advancements + Sage Hall quest chain (99210-99212)
 *
 * 1st Job: Beginner -> Sage (600) at Lv10
 * 2nd Job: Sage -> Elementalist (610) at Lv30
 * 3rd Job: Elementalist -> Arcanum (611) at Lv70
 * 4th Job: Arcanum -> Archsage (612) at Lv120
 *
 * Quests (Sage Hall chain):
 *   99210 - A New Beginning (lv1, Green Snail Shells)
 *   99211 - The Shroom Menace (lv8, Shroom Caps)
 *   99212 - Awakening the Inner Sanctum (lv15, Runic Orb reward)
 */

var status;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1) {
        cm.dispose();
        return;
    }
    if (mode === 0 && status === 0) {
        cm.dispose();
        return;
    }
    if (mode === 1) {
        status++;
    } else {
        status--;
    }

    var job = cm.getJobId();
    var level = cm.getLevel();

    if (status === 0) {
        // Build menu based on available quests and job
        var options = [];
        if (job === 0 && level >= 10) options.push("Become a Sage (Job Advancement)");
        else if (job === 600 && level >= 30) options.push("Advance to Elementalist");
        else if (job === 610 && level >= 70) options.push("Advance to Arcanum");
        else if (job === 611 && level >= 120) options.push("Advance to Archsage");

        if (!cm.isQuestStarted(99210) && !cm.isQuestCompleted(99210)) {
            options.push("Quest: A New Beginning");
        }
        if (cm.isQuestCompleted(99210) && !cm.isQuestStarted(99211) && !cm.isQuestCompleted(99211)) {
            options.push("Quest: The Shroom Menace");
        }
        if (cm.isQuestCompleted(99211) && !cm.isQuestStarted(99212) && !cm.isQuestCompleted(99212)) {
            options.push("Quest: Awakening the Inner Sanctum");
        }
        if (cm.isQuestStarted(99210)) options.push("Turn in: A New Beginning");
        if (cm.isQuestStarted(99211)) options.push("Turn in: The Shroom Menace");
        if (cm.isQuestStarted(99212)) options.push("Turn in: Awakening the Inner Sanctum");
        options.push("Tell me about Sage Hall");

        if (options.length === 1) {
            // Only "Tell me about Sage Hall"
            cm.sendOk("Welcome to Sage Hall! The Training Ground is through the portal on the right — enter to hone your arcane skills. The Inner Sanctum lies beyond for more experienced Sages.\r\n\r\nReturn when you are level 10 or higher to begin your journey as a true Sage!");
            cm.dispose();
            return;
        }
        cm.sendSimple("Greetings, student. I am Elara, Sage Instructor. How may I guide you?\r\n\r\n#b" + options.map(function(o, i) { return "#L" + i + "#" + o + "#l"; }).join("\r\n") + "#k");
    } else if (status === 1) {
        var job2 = cm.getJobId();
        var level2 = cm.getLevel();
        var options2 = [];
        if (job2 === 0 && level2 >= 10) options2.push("Become a Sage (Job Advancement)");
        else if (job2 === 600 && level2 >= 30) options2.push("Advance to Elementalist");
        else if (job2 === 610 && level2 >= 70) options2.push("Advance to Arcanum");
        else if (job2 === 611 && level2 >= 120) options2.push("Advance to Archsage");
        if (!cm.isQuestStarted(99210) && !cm.isQuestCompleted(99210)) options2.push("Quest: A New Beginning");
        if (cm.isQuestCompleted(99210) && !cm.isQuestStarted(99211) && !cm.isQuestCompleted(99211)) options2.push("Quest: The Shroom Menace");
        if (cm.isQuestCompleted(99211) && !cm.isQuestStarted(99212) && !cm.isQuestCompleted(99212)) options2.push("Quest: Awakening the Inner Sanctum");
        if (cm.isQuestStarted(99210)) options2.push("Turn in: A New Beginning");
        if (cm.isQuestStarted(99211)) options2.push("Turn in: The Shroom Menace");
        if (cm.isQuestStarted(99212)) options2.push("Turn in: Awakening the Inner Sanctum");
        options2.push("Tell me about Sage Hall");

        var sel = selection;
        var chosen = options2[sel];

        if (chosen === "Become a Sage (Job Advancement)") {
            cm.changeJobById(600);
            cm.gainItem(1382081, 1);
            cm.gainItem(2002037, 100);
            cm.sendOk("Welcome to the Order of Sages! You have been granted the power of #bArcane Bolt#k and #bRunic Strike#k. Train well.\r\n\r\n#v1382081# 1 #t1382081#\r\n#v2002037# 100 #t2002037#");
            cm.dispose();
        } else if (chosen === "Advance to Elementalist") {
            cm.changeJobById(610);
            cm.sendOk("You are now an #bElementalist#k! New skills: #bFlame Pillar#k, #bFrost Nova#k, #bLightning Chain#k, and #bElemental Boost#k.");
            cm.dispose();
        } else if (chosen === "Advance to Arcanum") {
            cm.changeJobById(611);
            cm.sendOk("Rise, #bArcanum#k! You now command: #bMeteor Shower#k, #bBlizzard#k, #bThunder Spear#k, and #bArcane Explosion#k.");
            cm.dispose();
        } else if (chosen === "Advance to Archsage") {
            cm.changeJobById(612);
            cm.sendOk("You are now an #bArchsage#k! Ultimate skills: #bPrimordial Inferno#k, #bAbsolute Zero#k, #bDivine Thunder#k, and #bElemental Storm#k.");
            cm.dispose();
        } else if (chosen === "Quest: A New Beginning") {
            cm.startQuest(99210);
            cm.sendOk("Your first test: go to the Training Ground and collect #b10 Green Snail Shells#k (#t4000000#). The portal is to the right of the hall!");
            cm.dispose();
        } else if (chosen === "Quest: The Shroom Menace") {
            cm.startQuest(99211);
            cm.sendOk("Defeat #b15 Shrooms#k in the Training Ground and bring me #b15 #t4000019##k. They have been overrunning the area!");
            cm.dispose();
        } else if (chosen === "Quest: Awakening the Inner Sanctum") {
            cm.startQuest(99212);
            cm.sendOk("Enter the Inner Sanctum (through the Training Ground) and collect #b20 Horny Mushroom Spores#k and #b10 Curse Eye Tails#k. The #bRunic Orb#k awaits you!");
            cm.dispose();
        } else if (chosen === "Turn in: A New Beginning") {
            if (cm.haveItem(4000000, 10)) {
                cm.gainItem(4000000, -10);
                cm.gainExp(500);
                cm.gainMeso(5000);
                cm.completeQuest(99210);
                cm.sendOk("Well done! 500 EXP and 5,000 meso for your effort. The next quest will be available when you are ready.");
            } else {
                cm.sendOk("You still need #b10 #t4000000##k. Keep training in the Training Ground!");
            }
            cm.dispose();
        } else if (chosen === "Turn in: The Shroom Menace") {
            if (cm.haveItem(4000019, 15)) {
                cm.gainItem(4000019, -15);
                cm.gainExp(2000);
                cm.gainMeso(15000);
                cm.completeQuest(99211);
                cm.sendOk("Excellent work! 2,000 EXP and 15,000 meso earned. The Inner Sanctum quest is now available!");
            } else {
                cm.sendOk("I need #b15 #t4000019##k. Keep defeating Shrooms in the Training Ground!");
            }
            cm.dispose();
        } else if (chosen === "Turn in: Awakening the Inner Sanctum") {
            if (cm.haveItem(4000024, 20) && cm.haveItem(4000005, 10)) {
                cm.gainItem(4000024, -20);
                cm.gainItem(4000005, -10);
                cm.gainExp(8000);
                cm.gainMeso(40000);
                cm.gainItem(1372080, 1);
                cm.completeQuest(99212);
                cm.sendOk("You have conquered the Inner Sanctum! 8,000 EXP, 40,000 meso, and the #bRunic Orb#k are yours. The path to Archsage is open before you!");
            } else {
                cm.sendOk("I need #b20 Horny Mushroom Spores#k (#t4000024#) AND #b10 Curse Eye Tails#k (#t4000005#). Fight on in the Inner Sanctum!");
            }
            cm.dispose();
        } else {
            // Tell me about Sage Hall
            cm.sendOk("Sage Hall is a sanctuary of arcane learning built within Ellinia's ancient trees.\r\n\r\n#bSage Training Ground#k (right portal): Beginner training with Snails and Shrooms (lv1-15)\r\n#bInner Sanctum#k (deeper portal): Advanced training with Horny Mushrooms and Curse Eyes (lv15-30)\r\n\r\nComplete my quests to earn EXP, meso, and the legendary #bRunic Orb#k!");
            cm.dispose();
        }
    }
}
