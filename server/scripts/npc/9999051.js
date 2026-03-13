/**
 * @NPC:     Challenge Master Vorn (9999051)
 * @Purpose: Repeatable Kill Challenge system — 10 item-collection challenges with
 *           Challenge Coin rewards and a coin shop.
 * @Location: Henesys (100000000)
 * @Quests:  99060 – 99069
 * @CoinItem: 4039060 (Challenge Coin)
 *
 * Design philosophy: Vorn is a seasoned mercenary veteran — direct, no-nonsense,
 * professional. He respects capable adventurers and has little patience for
 * slackers. He's gruff but fair, and quietly proud of the challenge system
 * he built. Doesn't waste words, but when he does compliment you it means
 * something.
 */

/* global cm */

var status = -1;
var page = 0;   // 0=main, 1=board, 2=detail, 3=shop
var sel = -1;   // selected challenge index (0-9) or shop item index

// ── Challenge data ─────────────────────────────────────────────────────────────
// [questId, name, required item ID, item name, count, coin reward, exp reward]
var CHALLENGES = [
    [99060, "Snail Patrol",       4000000, "Snail Shell",             20, 2,  1500],
    [99061, "Mushroom Menace",    4000003, "Orange Mushroom Cap",     20, 2,  2200],
    [99062, "Pig Roundup",        4000007, "Ribbon Pig's Ribbon",     20, 2,  2500],
    [99063, "Slime Sweep",        4000001, "Slime Bubble",            25, 3,  3000],
    [99064, "Jr. Necki Hunt",     4000015, "Jr. Necki's Horn",        15, 3,  4500],
    [99065, "Wild Boar Culling",  4000019, "Wild Boar's Tooth",       15, 4,  6000],
    [99066, "Evil Eye Patrol",    4000016, "Evil Eye's Tear",         12, 4,  7000],
    [99067, "Zombie Purge",       4000024, "Zombie Mushroom Spore",   10, 5,  9000],
    [99068, "Drake Slayer",       4000047, "Drake Talon",              8, 6, 13000],
    [99069, "Balrog Slaying",     4007001, "Balrog's Blood Essence",   3, 10, 22000]
];

// ── Coin shop items ────────────────────────────────────────────────────────────
// [item ID, name, cost in Challenge Coins]
var SHOP = [
    [2000004, "Elixir",           3],
    [2000005, "Power Elixir",     8],
    [2022003, "Warrior Potion",   4],
    [2022000, "Magician Elixir",  4],
    [2022001, "Archer Elixir",    4],
    [2022002, "Thief Elixir",     4]
];

var COIN_ITEM = 4039060;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCoins() {
    return cm.itemQuantity(COIN_ITEM);
}

function challengeStatus(i) {
    // Returns: 0=not started, 1=in progress, 2=can claim (has items), 3=complete (awaiting reset)
    var c = CHALLENGES[i];
    var qId = c[0];
    if (cm.isQuestStarted(qId)) {
        var hasItems = cm.itemQuantity(c[2]) >= c[4];
        return hasItems ? 2 : 1;
    }
    return 0;
}

// ── Board menu builder ────────────────────────────────────────────────────────

function buildBoardMenu() {
    var menu = "#e#bChallenge Board#n#k — Vorn's Postings\r\n";
    menu += "Coins in pocket: #b" + getCoins() + "x Challenge Coin#k\r\n\r\n";
    for (var i = 0; i < CHALLENGES.length; i++) {
        var c = CHALLENGES[i];
        var cs = challengeStatus(i);
        var tag = "";
        if (cs == 0) { tag = "#k"; }
        else if (cs == 1) { tag = "#d[IN PROGRESS]#k"; }
        else if (cs == 2) { tag = "#r[CLAIM REWARD]#k"; }
        menu += "#L" + i + "#" + c[1] + " — +" + c[5] + " Coin" + (c[5] > 1 ? "s" : "") + "  " + tag + "#l\r\n";
    }
    menu += "\r\n#L99#Back to main menu#l";
    return menu;
}

// ── Shop menu builder ─────────────────────────────────────────────────────────

function buildShopMenu() {
    var menu = "#e#bCoin Exchange#n#k\r\n";
    menu += "Your coins: #b" + getCoins() + "x Challenge Coin#k\r\n\r\n";
    for (var i = 0; i < SHOP.length; i++) {
        var s = SHOP[i];
        menu += "#L" + i + "#" + s[1] + " — #b" + s[2] + " Coin" + (s[2] > 1 ? "s" : "") + "#k#l\r\n";
    }
    menu += "\r\n#L99#Back to main menu#l";
    return menu;
}

// ── Page handlers ─────────────────────────────────────────────────────────────

function mainMenu(mode, type, selection) {
    if (status == 0) {
        cm.sendSimple(
            "#b[Challenge Master Vorn]#k\r\n\r\n" +
            "You've got business, or you're wasting my time. Which is it?\r\n\r\n" +
            "#L0#Challenge Board — see what's posted.#l\r\n" +
            "#L1#Coin Exchange — spend what you've earned.#l\r\n" +
            "#L2#What is this place?#l\r\n" +
            "#L3#Nothing. I'll move on.#l"
        );
    } else if (status == 1) {
        if (selection == 0) {
            page = 1; status = 0; boardMenu(1, type, selection);
        } else if (selection == 1) {
            page = 3; status = 0; shopMenu(1, type, selection);
        } else if (selection == 2) {
            cm.sendOk(
                "#b[Challenge Master Vorn]#k\r\n\r\n" +
                "Fifteen years hunting monsters from one end of Victoria Island to the other. " +
                "Seen things that'd make most adventurers retire on the spot. Still standing.\r\n\r\n" +
                "Couple years back I put up this board. Posted ten challenges — real ones, not the " +
                "training-dummy garbage they hand out in the guilds. You want a challenge from me, " +
                "you go out and earn it. Bring back the proof. I pay in Coins.\r\n\r\n" +
                "#bChallenge Coins#k aren't meso. They're better. Spend them at my exchange " +
                "for supplies I've sourced personally. No middlemen. No markup. Fair deal.\r\n\r\n" +
                "Challenges reset whenever you claim a reward. Do them as many times as you want. " +
                "I don't care how many coins you stack — just means you've been working.\r\n\r\n" +
                "Any more questions? No? Good. Get to work."
            );
            cm.dispose();
        } else {
            cm.sendOk("Right. Don't let me keep you.");
            cm.dispose();
        }
    }
}

function boardMenu(mode, type, selection) {
    if (status == 0) {
        cm.sendSimple(buildBoardMenu());
    } else if (status == 1) {
        if (selection == 99) {
            page = 0; status = 0; mainMenu(1, type, selection);
            return;
        }
        if (selection < 0 || selection >= CHALLENGES.length) {
            cm.dispose();
            return;
        }
        sel = selection;
        page = 2; status = 0; detailView(1, type, selection);
    }
}

function detailView(mode, type, selection) {
    var c = CHALLENGES[sel];
    var cs = challengeStatus(sel);
    var qId = c[0];

    if (status == 0) {
        var body = "#b[" + c[1] + "]#k\r\n\r\n";

        if (cs == 0) {
            body += "Objective: Bring me #b" + c[4] + "x #t" + c[2] + "# (" + c[3] + ")#k.\r\n";
            body += "Reward: #b+" + c[5] + " Challenge Coin" + (c[5] > 1 ? "s" : "") + "  +" + c[6] + " EXP#k\r\n\r\n";
            body += "Well? You taking the job or not?";
            cm.sendYesNo(body);
        } else if (cs == 1) {
            var has = cm.itemQuantity(c[2]);
            body += "Status: #dIN PROGRESS#k\r\n";
            body += "Progress: #b" + has + "/" + c[4] + " " + c[3] + "#k\r\n\r\n";
            body += "You're not done. Keep hunting and bring back the full count.";
            cm.sendOk(body);
            cm.dispose();
            return;
        } else if (cs == 2) {
            body += "You've got the goods. #b" + c[4] + "x " + c[3] + "#k — all of them.\r\n";
            body += "Reward: #b+" + c[5] + " Challenge Coin" + (c[5] > 1 ? "s" : "") + "  +" + c[6] + " EXP#k\r\n\r\n";
            body += "Hand them over and collect your pay?";
            cm.sendYesNo(body);
        }

    } else if (status == 1) {
        if (mode == 0) {
            // Declined
            if (cs == 0) {
                cm.sendOk("Your call. The board stays open.");
            } else {
                cm.sendOk("Fine. Come back when you've got them all.");
            }
            cm.dispose();
            return;
        }

        if (cs == 0) {
            // Accept the quest
            cm.forceStartQuest(qId);
            cm.sendOk(
                "#b[Challenge Master Vorn]#k\r\n\r\n" +
                "Good. " + c[4] + "x " + c[3] + ". Not nine. Not nineteen. " + c[4] + ".\r\n" +
                "Don't come back short.\r\n\r\n" +
                "I'll be here."
            );
            cm.dispose();
        } else if (cs == 2) {
            // Claim reward — verify items still there (safeguard)
            if (cm.itemQuantity(c[2]) < c[4]) {
                cm.sendOk(
                    "Where are the rest? You were supposed to bring " + c[4] + " and you're short. " +
                    "Go finish the job."
                );
                cm.dispose();
                return;
            }
            cm.gainItem(c[2], -c[4]);
            cm.gainItem(COIN_ITEM, c[5]);
            cm.gainExp(c[6]);
            cm.forceCompleteQuest(qId);
            // Reset quest so it's repeatable
            cm.forceStartQuest(qId);
            cm.sendOk(
                "#b[Challenge Master Vorn]#k\r\n\r\n" +
                "*takes the items, counts them without looking up*\r\n\r\n" +
                "All there. " + c[5] + " Coin" + (c[5] > 1 ? "s" : "") + " and " + c[6] + " EXP. As agreed.\r\n\r\n" +
                "Challenge is reset. Run it again whenever you want. " +
                "Board doesn't care how many times you do it. Neither do I.\r\n\r\n" +
                "#bCoins now: " + getCoins() + "#k"
            );
            cm.dispose();
        } else {
            cm.dispose();
        }
    }
}

function shopMenu(mode, type, selection) {
    if (status == 0) {
        cm.sendSimple(buildShopMenu());
    } else if (status == 1) {
        if (selection == 99) {
            page = 0; status = 0; mainMenu(1, type, selection);
            return;
        }
        if (selection < 0 || selection >= SHOP.length) {
            cm.dispose();
            return;
        }
        sel = selection;
        page = 3; status = 1;

        var s = SHOP[sel];
        var coins = getCoins();
        if (coins < s[2]) {
            cm.sendOk(
                "You need #b" + s[2] + " Challenge Coin" + (s[2] > 1 ? "s" : "") + "#k for " + s[1] + ".\r\n" +
                "You've got " + coins + ". " +
                (coins == 0 ? "Nothing. Go earn some first." : "Short by " + (s[2] - coins) + ". Get back to work.")
            );
            cm.dispose();
            return;
        }

        cm.sendYesNo(
            "#b[Coin Exchange]#k\r\n\r\n" +
            "Buy #b1x " + s[1] + "#k for #b" + s[2] + " Challenge Coin" + (s[2] > 1 ? "s" : "") + "#k?\r\n\r\n" +
            "Coins after purchase: " + (coins - s[2])
        );

    } else if (status == 2) {
        var s = SHOP[sel];
        if (mode == 0) {
            cm.sendOk("Changed your mind. Fair enough.");
            cm.dispose();
            return;
        }
        var coins = getCoins();
        if (coins < s[2]) {
            cm.sendOk("You don't have enough coins. Come back when you do.");
            cm.dispose();
            return;
        }
        cm.gainItem(COIN_ITEM, -s[2]);
        cm.gainItem(s[0], 1);
        cm.sendOk(
            "*slides the item across without ceremony*\r\n\r\n" +
            "1x #b" + s[1] + "#k. " + s[2] + " Coin" + (s[2] > 1 ? "s" : "") + " deducted.\r\n" +
            "Coins remaining: #b" + getCoins() + "#k\r\n\r\n" +
            "Anything else, or are we done?"
        );
        cm.dispose();
    }
}

// ── Entry point ───────────────────────────────────────────────────────────────

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) { cm.dispose(); return; }
    if (mode == 0 && status == 0 && page == 0) { cm.dispose(); return; }
    if (mode == 1) { status++; } else { if (status > 0) status--; }

    if (page == 0) { mainMenu(mode, type, selection); }
    else if (page == 1) { boardMenu(mode, type, selection); }
    else if (page == 2) { detailView(mode, type, selection); }
    else if (page == 3) { shopMenu(mode, type, selection); }
    else { cm.dispose(); }
}
