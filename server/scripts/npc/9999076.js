/**
 * NPC: Professor Foxwit (9999076)
 * Location: Henesys (100000000)
 * Type: Monster Book Librarian — training spot recommender
 *
 * A scholarly fox NPC who recommends optimal training maps based on
 * the player's current level. Shows mob names, map names, and
 * approximate EXP rates. Can teleport the player to recommended maps.
 *
 * Features:
 *   - Detects player level and shows 3 recommended training spots
 *   - Offers teleportation to any recommended map
 *   - "View All Ranges" option shows the full tier list
 *   - Academic personality — uses words like "specimen", "research", "field study"
 *
 * All map IDs and mob IDs are real v83 IDs.
 */

var status = -1;
var sel = -1;
var selectedTier = -1;

// Training tiers: [minLevel, maxLevel, tierName, spots]
// Each spot: [mapId, mapName, mobName, mobLevel, expPerMob, description]
var TIERS = [
    [1, 10, "Novice Naturalist", [
        [40000, "Snail Hunting Ground", "Blue Snail", 4, 8, "Docile specimens. Perfect for initial field observations."],
        [100020000, "Mushroom Garden", "Orange Mushroom", 8, 18, "Fungal colonies with moderate aggression patterns."],
        [104000000, "Henesys Hunting Ground I", "Stump", 6, 14, "Arboreal specimens. Surprisingly mobile for timber."]
    ]],
    [10, 20, "Apprentice Researcher", [
        [104040000, "Henesys Pig Beach", "Ribbon Pig", 15, 42, "Ornamental swine. Excellent yield for low-risk engagement."],
        [101010100, "Green Mushroom Forest", "Green Mushroom", 18, 54, "Chlorophyll-rich mycological variants. Fascinating."],
        [104010001, "Pig Beach", "Iron Pig", 18, 58, "Armored porcine subspecies. Higher durability, higher reward."]
    ]],
    [20, 30, "Junior Field Analyst", [
        [102040200, "Wild Boar Land", "Wild Boar", 22, 82, "Aggressive tusked specimens. Pack behavior observed."],
        [105070001, "Ant Tunnel I", "Zombie Mushroom", 28, 120, "Reanimated fungal matter. Disturbing yet productive."],
        [101030100, "Sleepywood Dungeon", "Evil Eye", 27, 105, "Monocular aberrations. Handle with caution."]
    ]],
    [30, 50, "Associate Zoologist", [
        [102040400, "Fire Boar Land", "Fire Boar", 35, 165, "Pyrogenic boar variant. Bring fire-resistant gloves."],
        [105090300, "Cave of Mushrooms", "Zombie Mushroom", 28, 120, "Dense fungal infestation. Excellent specimen density."],
        [200010300, "Cloud Park III", "Lunar Pixie", 42, 230, "Celestial luminescent beings. Fragile but numerous."]
    ]],
    [50, 70, "Senior Cryptozoologist", [
        [541010100, "Ghost Ship 1", "Slimy", 52, 320, "Spectral maritime entities. Bring holy water."],
        [250020000, "Mu Lung Temple", "Straw Target Dummy", 55, 350, "Inanimate yet hostile. Martial arts enchantment suspected."],
        [251010000, "Herb Town Entrance", "Jar of Dew", 58, 380, "Sentient pottery. Yes, I was surprised too."]
    ]],
    [70, 100, "Principal Investigator", [
        [211040800, "Ice Valley II", "White Fang", 75, 580, "Cryogenic canine specimen. Remarkably territorial."],
        [220050200, "Ludibrium Clocktower", "Master Chronos", 80, 650, "Temporal anomaly entities. Fascinating clockwork biology."],
        [540010100, "Mysterious Path 1", "Selkie Jr.", 72, 520, "Juvenile aquatic chimera. Singapore waters breed oddities."]
    ]],
    [100, 120, "Distinguished Scholar", [
        [240040500, "Leafre Dragon Canyon", "Skeleton Wyvern", 105, 1200, "Fossilized draconic specimens. My finest research subjects."],
        [270010100, "Temple of Time Entrance", "Memory Monk", 108, 1350, "Entities of pure temporal energy. Extraordinary."],
        [220060000, "Ludibrium Toy Factory", "Toy Trojan", 95, 980, "Enchanted playthings. Surprisingly lethal for toys."]
    ]],
    [120, 200, "Emeritus Professor", [
        [271000000, "Future Henesys", "Berserky", 125, 2200, "Temporally displaced monsters. Peak-tier research material."],
        [271040000, "Knight Stronghold", "Official Knight A", 135, 2800, "Armored phantoms of a forgotten order. Superb EXP yield."],
        [270040000, "Temple of Time Deep", "Dodo", 120, 1950, "Ancient guardian specimen. Mythical-grade encounter."]
    ]]
];

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1) { cm.dispose(); return; }
    if (mode === 0 && status <= 0) { cm.dispose(); return; }
    if (mode === 1) status++;
    else status--;

    if (status === 0) {
        // Main menu
        var playerLevel = cm.getLevel();
        var tier = getTierForLevel(playerLevel);

        var text = "#e#dProfessor Foxwit - Monster Book Librarian#k#n\r\n\r\n";
        text += "*adjusts spectacles and peers at you over a towering stack of field journals*\r\n\r\n";
        text += "Ah, a level #b" + playerLevel + "#k specimen — I mean, #badventurer#k! ";
        text += "Welcome to my mobile research station. I have spent decades cataloguing ";
        text += "every creature in the Maple World and mapping their habitats.\r\n\r\n";

        if (tier !== null) {
            text += "Based on my analysis of your combat proficiency, I classify you as ";
            text += "a #e" + tier[2] + "#n (Lv. " + tier[0] + "-" + tier[1] + ").\r\n\r\n";
            text += "#L0##bView my recommended training spots#k#l\r\n";
        } else {
            text += "Remarkable! You have surpassed all my classification tiers. ";
            text += "Truly a once-in-a-generation specimen.\r\n\r\n";
        }

        text += "#L1##bView all level range tiers#k#l\r\n";
        text += "#L2##bTell me about your research#k#l\r\n";
        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;

        if (sel === 0) {
            // Show recommendations for player's level
            var playerLevel = cm.getLevel();
            var tier = getTierForLevel(playerLevel);
            if (tier === null) {
                cm.sendOk("You have transcended my research data! Perhaps #byou#k should be writing the field guides.");
                cm.dispose();
                return;
            }
            showTierSpots(tier);

        } else if (sel === 1) {
            // Show all tiers menu
            var text = "#e#dProfessor Foxwit - Complete Field Guide#k#n\r\n\r\n";
            text += "*unfurls an enormous scroll covered in ink-stained annotations*\r\n\r\n";
            text += "Behold! My life's work — a comprehensive taxonomy of training habitats, ";
            text += "organized by adventurer proficiency level. Select a research tier:\r\n\r\n";

            for (var i = 0; i < TIERS.length; i++) {
                var t = TIERS[i];
                text += "#L" + (100 + i) + "#";
                text += "#bLv. " + t[0] + "-" + t[1] + ": " + t[2] + "#k#l\r\n";
            }

            cm.sendSimple(text);

        } else if (sel === 2) {
            // About info
            cm.sendOk(
                "#e#dProfessor Foxwit - About My Research#k#n\r\n\r\n" +
                "*polishes monocle with great enthusiasm*\r\n\r\n" +
                "I am Professor Foxwit, holder of three doctoral degrees in " +
                "Applied Monsterology, Comparative Habitat Analysis, and " +
                "Theoretical EXP Dynamics.\r\n\r\n" +
                "#eWhat I do:#n\r\n" +
                "  - I analyze your combat level and cross-reference it with\r\n" +
                "    my database of #b" + countTotalSpots() + " documented habitats#k.\r\n" +
                "  - I recommend three optimal training locations based on\r\n" +
                "    mob density, EXP yield, and survivability metrics.\r\n" +
                "  - I can #bteleport#k you directly to any recommended site\r\n" +
                "    for immediate field study.\r\n\r\n" +
                "#eField Safety Notice:#n\r\n" +
                "  The monsters in recommended zones WILL fight back.\r\n" +
                "  This is normal. Please do not file complaints\r\n" +
                "  with the Henesys Ethics Board. Again.\r\n\r\n" +
                "#d— Prof. Foxwit, Ph.D., Ph.D., Ph.D.#k"
            );
            cm.dispose();
            return;

        } else if (sel >= 100 && sel < 100 + TIERS.length) {
            // Selected a tier from "View All" menu
            var tierIndex = sel - 100;
            var tier = TIERS[tierIndex];
            showTierSpots(tier);

        } else {
            cm.dispose();
            return;
        }

    } else if (status === 2) {
        sel = selection;

        if (sel >= 100 && sel < 100 + TIERS.length) {
            // Coming from "View All" — a tier was picked, show spots
            var tierIndex = sel - 100;
            var tier = TIERS[tierIndex];
            showTierSpots(tier);
            // Reset status so teleport selection works at status 2
            return;
        }

        // Selection is a map warp from tier spots (sel = spot index 0-2)
        if (sel >= 0 && sel <= 2) {
            // Need to figure out which tier we were looking at
            var tier = getActiveTier();
            if (tier === null) {
                cm.dispose();
                return;
            }
            var spot = tier[3][sel];
            var mapId = spot[0];
            var mapName = spot[1];

            var text = "#e#dProfessor Foxwit#k#n\r\n\r\n";
            text += "*scribbles furiously in notebook*\r\n\r\n";
            text += "Excellent choice! I shall deploy my experimental Foxwit ";
            text += "Spatial Relocator\u2122 to transport you to:\r\n\r\n";
            text += "#e" + mapName + "#n (Map " + mapId + ")\r\n\r\n";
            text += "#rWARNING: Field conditions may be hazardous. ";
            text += "The university accepts no liability.#k\r\n\r\n";
            text += "Proceed with teleportation?";
            cm.sendYesNo(text);

        } else if (sel === 99) {
            // "Back" was selected — go back to main menu
            status = -1;
            action(1, 0, 0);
            return;
        } else {
            cm.dispose();
            return;
        }

    } else if (status === 3) {
        // Teleport confirmation (Yes/No response)
        if (mode === 0) {
            cm.sendOk("#e#dProfessor Foxwit#k#n\r\n\r\nPrudent decision. A cautious researcher lives to publish another paper. Come back anytime!");
            cm.dispose();
            return;
        }

        // Find the spot to warp to
        var tier = getActiveTier();
        if (tier === null || sel < 0 || sel > 2) {
            cm.dispose();
            return;
        }

        var spot = tier[3][sel];
        var mapId = spot[0];
        var mapName = spot[1];

        cm.sendOk(
            "#e#dProfessor Foxwit#k#n\r\n\r\n" +
            "#g=== SPATIAL RELOCATION ENGAGED ===#k\r\n\r\n" +
            "Teleporting to #b" + mapName + "#k...\r\n\r\n" +
            "*adjusts dials on a suspicious-looking contraption*\r\n\r\n" +
            "Remember: document your kills for science! And do come back " +
            "when you have outgrown this habitat. I shall have new " +
            "recommendations waiting.\r\n\r\n" +
            "#d— Happy hunting, from Prof. Foxwit#k"
        );
        cm.warp(mapId, 0);
        cm.dispose();

    } else {
        cm.dispose();
    }
}

function showTierSpots(tier) {
    // Store active tier index for later reference
    for (var t = 0; t < TIERS.length; t++) {
        if (TIERS[t] === tier) {
            selectedTier = t;
            break;
        }
    }

    var spots = tier[3];
    var text = "#e#dProfessor Foxwit - Field Report#k#n\r\n";
    text += "#e" + tier[2] + " (Lv. " + tier[0] + "-" + tier[1] + ")#n\r\n\r\n";
    text += "*flips open a leather-bound research journal*\r\n\r\n";
    text += "After extensive field study, I recommend the following habitats ";
    text += "for your current proficiency level:\r\n\r\n";

    for (var i = 0; i < spots.length; i++) {
        var s = spots[i];
        text += "#e" + (i + 1) + ". " + s[1] + "#n\r\n";
        text += "    Specimen: #b" + s[2] + "#k (Lv. " + s[3] + ")\r\n";
        text += "    EXP per kill: #g~" + formatNum(s[4]) + "#k\r\n";
        text += "    Field notes: #d" + s[5] + "#k\r\n";
        text += "    #L" + i + "#" + "#bTeleport to " + s[1] + "#k#l\r\n\r\n";
    }

    text += "#L99##dReturn to main menu#k#l";
    cm.sendSimple(text);
}

function getTierForLevel(level) {
    for (var i = TIERS.length - 1; i >= 0; i--) {
        if (level >= TIERS[i][0]) {
            return TIERS[i];
        }
    }
    return TIERS[0];
}

function getActiveTier() {
    if (selectedTier >= 0 && selectedTier < TIERS.length) {
        return TIERS[selectedTier];
    }
    // Fallback to player level tier
    return getTierForLevel(cm.getLevel());
}

function countTotalSpots() {
    var count = 0;
    for (var i = 0; i < TIERS.length; i++) {
        count += TIERS[i][3].length;
    }
    return count;
}

function formatNum(amount) {
    var s = "" + amount;
    var result = "";
    var count = 0;
    for (var i = s.length - 1; i >= 0; i--) {
        result = s.charAt(i) + result;
        count++;
        if (count % 3 === 0 && i > 0) {
            result = "," + result;
        }
    }
    return result;
}
