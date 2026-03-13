/**
 * Old Man Kazuki - Beginner Guide & Lore NPC
 * Location: Lith Harbor (104000000)
 * Purpose: Welcomes new players, gives tips, one-time starter kit
 *
 * FIXES (quality pass):
 *  - Starter kit was given on ALL dialogue branches at status==3, even
 *    "I'll be on my way" — now it's only given when selection==1 is confirmed.
 *  - Goodbye branch no longer falls through into the gainItem block.
 *  - Returning-player goodbye no longer leaves dialogue open.
 *  - Dialogue rewritten: Kazuki now has a distinct voice — weathered sailor
 *    turned storyteller, nostalgic and dry-humored, with maritime metaphors.
 */
var status = 0;
var firstTimeSelection = -1;
var STARTER_KIT_MARKER = 4001100;

function start() {
    status = 0;
    firstTimeSelection = -1;

    if (cm.haveItem(STARTER_KIT_MARKER)) {
        cm.sendNext("Ah, you again. Good. That means you're not dead.\r\n\r\nSit, sit. An old man doesn't get many interesting visitors — mostly gulls and the smell of low tide. What is it you want to know?");
    } else {
        cm.sendNext("Ho there, stranger. You've got that look — wide eyes, light pack, soles that haven't worn through yet.\r\n\r\nI'm #bKazuki#k. Used to sail these waters before my knees had opinions. Now I sit at #bLith Harbor#k and tell people what I wish someone had told me.\r\n\r\nPull up a crate. I won't keep you long.");
    }
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
    status++;

    if (cm.haveItem(STARTER_KIT_MARKER)) {
        // ── Returning player ──────────────────────────────────────────────
        if (status == 1) {
            var menu = "What do you want from this old man?\r\n";
            menu += "#L0##bTell me about Victoria Island#l\r\n";
            menu += "#L1##bAny advice you've held back?#l\r\n";
            menu += "#L2##bJust checking in#l";
            cm.sendSimple(menu);
        } else if (status == 2) {
            if (selection == 0) {
                cm.sendOk("Four towns worth knowing on this island.\r\n\r\n#bHenesys#k — quiet, green, good people. Bowmen train in the fields to the east. Peaceful enough that you'll drop your guard, which is when it gets you.\r\n\r\n#bEllinia#k — tall trees, taller egos. The mages there forget that books don't stop arrows.\r\n\r\n#bPerion#k — warriors, dust, and pride. Hard place. Hardens you, if it doesn't break you first.\r\n\r\n#bKerning City#k — I've said too much already. Just... count your fingers when you leave.");
            } else if (selection == 1) {
                cm.sendOk("One thing I never told the fresh-faced ones: #bdon't fight fair#k.\r\n\r\nFair fights are for tournaments and tombstones. Use the terrain. Fight monsters below your level when you need to grind. Stock potions before you need them, not during.\r\n\r\nAnd save your mesos. Every adventurer I've seen who rushed their spending regretted it around level 30.");
            } else {
                cm.sendOk("Ha. 'Just checking in.' At my age that's what people say before they ask a favor.\r\n\r\nStay out of trouble. Or at least stay interesting.");
            }
            cm.dispose();
        } else {
            cm.dispose();
        }

    } else {
        // ── First-time player ─────────────────────────────────────────────
        if (status == 1) {
            var menu = "First time on the island, I can tell. What do you want from me?\r\n";
            menu += "#L0##bTell me about this world#l\r\n";
            menu += "#L1##bI could use some supplies#l\r\n";
            menu += "#L2##bAny advice for a beginner?#l\r\n";
            menu += "#L3##bI'll manage on my own#l";
            cm.sendSimple(menu);
        } else if (status == 2) {
            firstTimeSelection = selection;
            if (selection == 0) {
                cm.sendNext("They call it #bMaple World#k, which tells you it was named by someone who'd never left the orchard.\r\n\r\nIt's larger than it looks on any map. #bVictoria Island#k is where you are — four towns, forests, dungeons, creatures that'll cheerfully eat your face. From here, stronger adventurers push to #bOssyria#k, #bLudus Lake#k, places I've only heard described in bars.\r\n\r\nStart here. Get strong. The rest of the world will wait.");
            } else if (selection == 1) {
                cm.sendNext("You've got good instincts. A soldier without supplies is just someone standing in a dangerous place.\r\n\r\nI've got a small kit I set aside for travelers who seem like they'll actually use it:\r\n\r\n#i2000000# #bRed Potion#k ×20\r\n#i2000003# #bBlue Potion#k ×10\r\n#b5,000 mesos#k — enough for a decent weapon and still eat\r\n\r\nTake it. I've got another boat-full of supplies coming next week.");
            } else if (selection == 2) {
                cm.sendNext("Alright. Three things I wish I'd known:\r\n\r\nFirst — #bpotions#k. Carry more than you think you need. You'll use them.\r\n\r\nSecond — your #bjob advancement#k happens around level 8 to 10. Don't rush past towns without talking to the instructors. Miss that window and you'll wonder why you feel weak.\r\n\r\nThird — this one matters — #btalk to every NPC you meet#k. Half of them are useless. The other half will change your path completely. You won't know which is which until you ask.");
            } else {
                // "I'll manage on my own" — dispose cleanly, no kit given
                cm.sendOk("Ha! That spirit will either get you far or get you killed quickly.\r\n\r\nEither way — good luck out there.");
                cm.dispose();
                return;
            }
        } else if (status == 3) {
            // Only give starter kit if they chose "I could use some supplies"
            if (firstTimeSelection == 1 && !cm.haveItem(STARTER_KIT_MARKER)) {
                if (!cm.canHold(2000000) || !cm.canHold(2000003) || !cm.canHold(STARTER_KIT_MARKER)) {
                    cm.sendOk("Your inventory is full — make some room and come back. I'll hold it for you.");
                    cm.dispose();
                    return;
                }
                cm.gainItem(2000000, 20);
                cm.gainItem(2000003, 10);
                cm.gainMeso(5000);
                cm.gainItem(STARTER_KIT_MARKER, 1);
                cm.sendOk("There you go. Don't spend the mesos on something stupid.\r\n\r\nSafe travels — and if you come back through Lith Harbor, I'll be right here. I always am.");
            } else {
                // Tips or lore path — just close out
                cm.sendOk("That's all this old man has. Off you go, then.\r\n\r\nDon't forget what I said.");
            }
            cm.dispose();
        } else {
            cm.dispose();
        }
    }
}
