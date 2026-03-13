/**
 * @NPC:     Coliseum Chronicler (9999041)
 * @Location: Crimson Coliseum: Lobby (920000000)
 * @Purpose: PvP kill tracker + personal leaderboard — shows arena stats, milestones, titles
 *
 * Kill tracking uses quest progress (quest 29000):
 *   infoNumber 0 = total arena kills
 *   infoNumber 1 = Death Teddy kills
 *   infoNumber 2 = Tauromacis kills
 *   infoNumber 3 = Balrog kills
 */

var status = -1;
var selectedIdx = -1;

// Quest ID used for kill tracking (custom, not a real quest)
var KILL_QUEST = 29000;

// Arena Token item
var ARENA_TOKEN = 4039050;

// Kill milestones and titles
var MILESTONES = [
    { kills: 10,   title: "Arena Initiate",    reward: 5000 },
    { kills: 50,   title: "Pit Fighter",       reward: 20000 },
    { kills: 100,  title: "Coliseum Veteran",  reward: 50000 },
    { kills: 250,  title: "Bloodsand Champion", reward: 100000 },
    { kills: 500,  title: "Arbiter's Chosen",  reward: 250000 },
    { kills: 1000, title: "Legend of the Coliseum", reward: 500000 }
];

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
        var totalKills = parseInt(cm.getQuestProgress(KILL_QUEST, 0)) || 0;
        var tokens = cm.itemQuantity(ARENA_TOKEN);
        var currentTitle = getTitle(totalKills);

        cm.sendSimple(
            "*Coliseum Chronicler: An ancient scribe who records every battle fought on these sands.*\r\n\r\n" +
            "Greetings, #b" + currentTitle + "#k.\r\n" +
            "Your arena record stands at #b" + totalKills + " kills#k, with #b" + tokens + " Arena Tokens#k in your pouch.\r\n\r\n" +
            "#L0##bView Detailed Stats#k — Your kill breakdown#l\r\n" +
            "#L1##bMilestone Rewards#k — Claim rewards for kill milestones#l\r\n" +
            "#L2##bArena Rankings#k — How titles are earned#l\r\n" +
            "#L3##dLeave#k#l"
        );

    } else if (status == 1) {
        selectedIdx = selection;

        if (selectedIdx == 0) {
            // Detailed stats
            var totalKills = parseInt(cm.getQuestProgress(KILL_QUEST, 0)) || 0;
            var teddyKills = parseInt(cm.getQuestProgress(KILL_QUEST, 1)) || 0;
            var tauroKills = parseInt(cm.getQuestProgress(KILL_QUEST, 2)) || 0;
            var balrogKills = parseInt(cm.getQuestProgress(KILL_QUEST, 3)) || 0;

            cm.sendOk(
                "#b=== Arena Kill Record ===#k\r\n\r\n" +
                "#e Total Kills:#n #b" + totalKills + "#k\r\n\r\n" +
                " Death Teddy (Lv.80): #b" + teddyKills + "#k kills\r\n" +
                " Tauromacis (Lv.40): #b" + tauroKills + "#k kills\r\n" +
                " Balrog (Lv.100): #b" + balrogKills + "#k kills\r\n\r\n" +
                "#e Current Title:#n #b" + getTitle(totalKills) + "#k\r\n" +
                "#e Next Title:#n " + getNextMilestoneText(totalKills)
            );
            cm.dispose();

        } else if (selectedIdx == 1) {
            // Milestone rewards
            var totalKills = parseInt(cm.getQuestProgress(KILL_QUEST, 0)) || 0;
            var claimedMilestone = parseInt(cm.getQuestProgress(KILL_QUEST, 4)) || 0; // infoNumber 4 = highest claimed milestone index

            var menu = "#b=== Milestone Rewards ===#k\r\n\r\n";
            var hasClaimable = false;

            for (var i = 0; i < MILESTONES.length; i++) {
                var m = MILESTONES[i];
                var reached = totalKills >= m.kills;
                var claimed = i < claimedMilestone;

                if (reached && !claimed) {
                    menu += "#L" + i + "##b" + m.kills + " kills — " + m.title + "#k: Claim #b" + formatMeso(m.reward) + " mesos#k!#l\r\n";
                    hasClaimable = true;
                } else if (claimed) {
                    menu += "#d" + m.kills + " kills — " + m.title + ": CLAIMED#k\r\n";
                } else {
                    menu += "#r" + m.kills + " kills — " + m.title + ": " + formatMeso(m.reward) + " mesos (need " + (m.kills - totalKills) + " more kills)#k\r\n";
                }
            }

            if (!hasClaimable) {
                menu += "\r\nNo unclaimed rewards right now. Keep fighting!";
                cm.sendOk(menu);
                cm.dispose();
            } else {
                cm.sendSimple(menu);
            }

        } else if (selectedIdx == 2) {
            // Rankings info
            cm.sendOk(
                "#b=== Arena Titles ===#k\r\n\r\n" +
                "Earn kills in the Battle Floor to rise through the ranks:\r\n\r\n" +
                "#b  10 kills#k — Arena Initiate\r\n" +
                "#b  50 kills#k — Pit Fighter\r\n" +
                "#b 100 kills#k — Coliseum Veteran\r\n" +
                "#b 250 kills#k — Bloodsand Champion\r\n" +
                "#b 500 kills#k — Arbiter's Chosen\r\n" +
                "#b1000 kills#k — Legend of the Coliseum\r\n\r\n" +
                "Each title unlocks a meso reward from the Chronicler.\r\n" +
                "The sands remember all who fight."
            );
            cm.dispose();

        } else {
            cm.dispose();
        }

    } else if (status == 2) {
        // Claiming a milestone reward
        if (selectedIdx == 1) {
            var milestoneIdx = selection;
            var m = MILESTONES[milestoneIdx];
            var totalKills = parseInt(cm.getQuestProgress(KILL_QUEST, 0)) || 0;
            var claimedMilestone = parseInt(cm.getQuestProgress(KILL_QUEST, 4)) || 0;

            if (totalKills >= m.kills && milestoneIdx >= claimedMilestone) {
                cm.gainMeso(m.reward);
                cm.setQuestProgress(KILL_QUEST, 4, milestoneIdx + 1);
                cm.sendOk(
                    "The sands recognize your valor.\r\n\r\n" +
                    "Title earned: #b" + m.title + "#k\r\n" +
                    "Reward: #b" + formatMeso(m.reward) + " mesos#k\r\n\r\n" +
                    "May your blade never dull."
                );
            } else {
                cm.sendOk("You haven't earned this milestone yet.");
            }
        }
        cm.dispose();
    }
}

function getTitle(kills) {
    var title = "Unranked Fighter";
    for (var i = 0; i < MILESTONES.length; i++) {
        if (kills >= MILESTONES[i].kills) {
            title = MILESTONES[i].title;
        }
    }
    return title;
}

function getNextMilestoneText(kills) {
    for (var i = 0; i < MILESTONES.length; i++) {
        if (kills < MILESTONES[i].kills) {
            return "#b" + MILESTONES[i].title + "#k at " + MILESTONES[i].kills + " kills (" + (MILESTONES[i].kills - kills) + " to go)";
        }
    }
    return "#bAll milestones completed!#k";
}

function formatMeso(n) {
    if (n >= 1000000) return (n / 1000000) + "M";
    if (n >= 1000) return (n / 1000) + "K";
    return "" + n;
}
