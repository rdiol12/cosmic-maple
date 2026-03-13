/**
 * NPC: Skill Tome Librarian Iris (9999064)
 * Location: Ellinia (101000000)
 * Purpose: Sells 4th job mastery books organized by class.
 *          Major meso sink — fills the huge gap where solo players can't find skill books.
 *
 * Pricing:
 *   ML20 books (70% success): 2,000,000 meso
 *   ML30 books (50% success): 5,000,000 meso
 *
 * Menu: Class → Skill → ML20 or ML30 → Confirm purchase
 */

var status = -1;
var selectedClass = -1;
var selectedBook = -1;
var selectedTier = -1;

// Book catalog: [ml20_id, ml30_id, skillName]
// Even IDs = ML20 (70% success), Odd IDs = ML30 (50% success)
var PRICE_ML20 = 2000000;
var PRICE_ML30 = 5000000;

var catalog = {
    warrior: [
        [2290000, 2290001, "Monster Magnet"],
        [2290002, 2290003, "Achilles"],
        [2290004, 2290005, "Rush"],
        [2290006, 2290007, "Power Stance"],
        [2290008, 2290009, "Advanced Combo Attack"],
        [2290010, 2290011, "Brandish"],
        [2290012, 2290013, "Blast"],
        [2290014, 2290015, "Guardian"],
        [2290016, 2290017, "Enrage"],
        [2290018, null, "Holy Charge"],
        [null, 2290019, "Divine Charge"],
        [2290020, 2290021, "Heaven's Hammer"],
        [2290022, 2290023, "Berserk"]
    ],
    mage: [
        [2290024, 2290025, "Mana Reflection"],
        [2290026, 2290027, "Big Bang"],
        [2290028, 2290029, "Infinity"],
        [2290030, 2290031, "Paralyze"],
        [2290032, 2290033, "Chain Lightning"],
        [2290034, 2290035, "Holy Shield"],
        [2290036, 2290037, "Fire Demon"],
        [2290038, 2290039, "Elquines"],
        [2290040, 2290041, "Meteor Shower"],
        [2290042, 2290043, "Ice Demon"],
        [2290044, 2290045, "Ifrit"],
        [2290046, 2290047, "Blizzard"],
        [2290048, 2290049, "Genesis"],
        [2290050, 2290051, "Angel Ray"]
    ],
    bowman: [
        [2290052, 2290053, "Sharp Eyes"],
        [2290054, 2290055, "Dragon's Breath"],
        [2290056, 2290057, "Bow Expert"],
        [2290058, 2290059, "Hamstring Shot"],
        [2290060, 2290061, "Hurricane"],
        [2290062, 2290063, "Phoenix"],
        [2290064, 2290065, "Concentrate"],
        [2290066, 2290067, "Marksman Boost"],
        [2290068, 2290069, "Blind"],
        [2290070, 2290071, "Piercing Arrow"],
        [2290072, 2290073, "Frostprey"],
        [2290074, 2290075, "Snipe"]
    ],
    thief: [
        [2290076, 2290077, "Shadow Shifter"],
        [2290078, 2290079, "Venomous Star/Stab"],
        [2290080, 2290081, "Taunt"],
        [2290082, 2290083, "Ninja Ambush"],
        [2290084, 2290085, "Triple Throw"],
        [2290086, 2290087, "Ninja Storm"],
        [2290088, 2290089, "Shadow Claw"],
        [2290090, 2290091, "Boomerang Step"],
        [2290092, 2290093, "Assassinate"],
        [2290094, 2290095, "Smokescreen"]
    ],
    pirate: [
        [2290096, null, "Maple Warrior"],
        [2290097, 2290098, "Dragon Strike"],
        [2290099, 2290100, "Energy Orb"],
        [2290101, null, "Super Transformation"],
        [2290102, 2290103, "Demolition"],
        [2290104, 2290105, "Snatch"],
        [2290106, 2290107, "Barrage"],
        [2290108, null, "Speed Infusion"],
        [2290110, 2290111, "Time Leap"],
        [2290112, 2290113, "Elemental Boost"],
        [2290114, null, "Wrath of the Octopi"],
        [2290115, 2290116, "Air Strike"],
        [2290117, 2290118, "Rapid Fire"],
        [2290119, 2290120, "Battleship Cannon"],
        [2290121, 2290122, "Battleship Torpedo"],
        [2290123, null, "Hypnotize"],
        [2290124, null, "Bullseye"]
    ],
    aran: [
        [2290126, 2290127, "Overswing"],
        [2290128, 2290129, "High Mastery"],
        [2290130, 2290131, "Freeze Standing"],
        [2290132, 2290133, "Final Blow"],
        [2290134, 2290135, "High Defense"],
        [2290136, 2290137, "Combo Tempest"],
        [2290138, 2290139, "Combo Barrier"]
    ]
};

var classNames = ["warrior", "mage", "bowman", "thief", "pirate", "aran"];
var classLabels = ["Warrior", "Mage", "Bowman", "Thief", "Pirate", "Aran"];

// Flat list of books for the currently selected class (rebuilt each menu)
var currentBooks = [];

function start() {
    status = -1;
    selectedClass = -1;
    selectedBook = -1;
    selectedTier = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1) { cm.dispose(); return; }
    if (mode === 0 && status <= 0) { cm.dispose(); return; }
    if (mode === 1) status++;
    else status--;

    if (status === 0) {
        // Main menu
        var text = "#e#bSkill Tome Librarian Iris#k#n\r\n\r\n";
        text += "Welcome to the Ellinia Archive of Mastery. I've spent decades collecting " +
                "every known #b4th Job Mastery Book#k in Maple World.\r\n\r\n";
        text += "These tomes are rare and valuable. My prices reflect that:\r\n";
        text += "  #rML20 books#k (70% success): #b" + formatMeso(PRICE_ML20) + " meso#k\r\n";
        text += "  #rML30 books#k (50% success): #b" + formatMeso(PRICE_ML30) + " meso#k\r\n\r\n";
        text += "Your meso: #b" + formatMeso(cm.getMeso()) + "#k\r\n\r\n";
        text += "#eChoose a class:#n\r\n\r\n";
        for (var i = 0; i < classLabels.length; i++) {
            text += "#L" + i + "##b" + classLabels[i] + " Mastery Books#k#l\r\n";
        }
        text += "#L6#What are mastery books?#l\r\n";
        text += "#L7#Goodbye#l";
        cm.sendSimple(text);

    } else if (status === 1) {
        if (selection === 7) {
            cm.sendOk("May your skills grow ever stronger. Return when you need a tome!");
            cm.dispose();
            return;
        }

        if (selection === 6) {
            var info = "#e#bAbout Mastery Books#k#n\r\n\r\n";
            info += "When you reach #b4th Job#k, many of your skills start with a max level of 10.\r\n\r\n";
            info += "To raise the max level, you need #bMastery Books#k:\r\n";
            info += "  #bML20#k — Raises max skill level to 20 (70% success rate)\r\n";
            info += "  #bML30#k — Raises max skill level to 30 (50% success rate)\r\n\r\n";
            info += "#rYou must use ML20 FIRST, then ML30.#k\r\n\r\n";
            info += "If a book fails, you lose the book but your skill stays at its current max level. " +
                    "You can try again with another copy.\r\n\r\n";
            info += "#eNote: You must have at least level 5 in a skill to use ML20, " +
                    "and level 15 to use ML30.#n";
            cm.sendOk(info);
            cm.dispose();
            return;
        }

        selectedClass = selection;
        if (selectedClass < 0 || selectedClass >= classNames.length) {
            cm.dispose();
            return;
        }

        // Build book list for this class
        var className = classNames[selectedClass];
        var books = catalog[className];
        currentBooks = books;

        var text = "#e#b" + classLabels[selectedClass] + " Mastery Books#k#n\r\n\r\n";
        text += "Select a skill to purchase its mastery book:\r\n\r\n";

        for (var i = 0; i < books.length; i++) {
            var b = books[i];
            var available = "";
            if (b[0] !== null && b[1] !== null) {
                available = "(ML20 + ML30)";
            } else if (b[0] !== null) {
                available = "(ML20 only)";
            } else {
                available = "(ML30 only)";
            }
            text += "#L" + i + "##b" + b[2] + "#k " + available + "#l\r\n";
        }
        text += "#L" + books.length + "#Back#l";
        cm.sendSimple(text);

    } else if (status === 2) {
        var className = classNames[selectedClass];
        var books = catalog[className];

        if (selection === books.length) {
            // Back
            status = -1;
            action(1, 0, 0);
            return;
        }

        selectedBook = selection;
        if (selectedBook < 0 || selectedBook >= books.length) {
            cm.dispose();
            return;
        }

        var b = books[selectedBook];
        var text = "#e" + b[2] + "#n\r\n\r\n";
        text += "Which mastery level do you want?\r\n\r\n";

        var idx = 0;
        if (b[0] !== null) {
            text += "#L" + idx + "##v" + b[0] + "# ML20 (70% success) — #r" + formatMeso(PRICE_ML20) + " meso#k#l\r\n";
            idx++;
        }
        if (b[1] !== null) {
            text += "#L" + idx + "##v" + b[1] + "# ML30 (50% success) — #r" + formatMeso(PRICE_ML30) + " meso#k#l\r\n";
            idx++;
        }
        text += "#L" + idx + "#Back#l";
        cm.sendSimple(text);

    } else if (status === 3) {
        var b = currentBooks[selectedBook];
        var hasML20 = (b[0] !== null);
        var hasML30 = (b[1] !== null);

        // Determine what was selected
        var backIdx = 0;
        if (hasML20) backIdx++;
        if (hasML30) backIdx++;

        if (selection === backIdx) {
            // Back
            status = 0;
            action(1, 0, selectedClass);
            return;
        }

        var itemId = 0;
        var price = 0;
        var tierName = "";

        if (hasML20 && hasML30) {
            if (selection === 0) {
                itemId = b[0]; price = PRICE_ML20; tierName = "ML20";
            } else {
                itemId = b[1]; price = PRICE_ML30; tierName = "ML30";
            }
        } else if (hasML20) {
            itemId = b[0]; price = PRICE_ML20; tierName = "ML20";
        } else {
            itemId = b[1]; price = PRICE_ML30; tierName = "ML30";
        }

        selectedTier = selection;
        cm.sendYesNo("Purchase #b[Mastery Book] " + b[2] + " (" + tierName + ")#k?\r\n\r\n" +
                     "#v" + itemId + "# #t" + itemId + "#\r\n\r\n" +
                     "Cost: #r" + formatMeso(price) + " meso#k\r\n" +
                     "Your meso: #b" + formatMeso(cm.getMeso()) + "#k\r\n\r\n" +
                     "#rRemember: The book has a chance to fail when used!#k");

    } else if (status === 4) {
        // Purchase confirmed
        var b = currentBooks[selectedBook];
        var hasML20 = (b[0] !== null);
        var hasML30 = (b[1] !== null);

        var itemId = 0;
        var price = 0;
        var tierName = "";

        if (hasML20 && hasML30) {
            if (selectedTier === 0) {
                itemId = b[0]; price = PRICE_ML20; tierName = "ML20";
            } else {
                itemId = b[1]; price = PRICE_ML30; tierName = "ML30";
            }
        } else if (hasML20) {
            itemId = b[0]; price = PRICE_ML20; tierName = "ML20";
        } else {
            itemId = b[1]; price = PRICE_ML30; tierName = "ML30";
        }

        if (cm.getMeso() < price) {
            cm.sendOk("You need #r" + formatMeso(price) + " meso#k but only have #r" + formatMeso(cm.getMeso()) + "#k.\r\n\r\n" +
                      "Come back when you've saved up! Try grinding at high-level maps or selling valuable drops.");
            cm.dispose();
            return;
        }

        if (!cm.canHold(itemId)) {
            cm.sendOk("Your USE inventory is full! Please make room and try again.");
            cm.dispose();
            return;
        }

        cm.gainMeso(-price);
        cm.gainItem(itemId, 1);
        cm.sendOk("#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n" +
                 "Purchased: #v" + itemId + "# #b#t" + itemId + "##k\r\n\r\n" +
                 "Use it from your USE inventory to apply the mastery level increase.\r\n" +
                 "Good luck — may the odds be in your favor!\r\n\r\n" +
                 "#eMeso remaining: " + formatMeso(cm.getMeso()) + "#n");
        cm.dispose();
    }
}

function formatMeso(amount) {
    var str = "" + amount;
    var result = "";
    var count = 0;
    for (var i = str.length - 1; i >= 0; i--) {
        result = str.charAt(i) + result;
        count++;
        if (count % 3 === 0 && i > 0) {
            result = "," + result;
        }
    }
    return result;
}
