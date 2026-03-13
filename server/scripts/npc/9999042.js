/**
 * @NPC:     Archivist Thessaly (9999042)
 * @Purpose: Sage class full gear shop — weapons + armor set
 * @Location: Sage Spire Library (990100100)
 * @Weapons:
 *   1372080 — Runic Orb       (Lv10, Sage 1st job)
 *   1372081 — Arcane Scepter  (Lv30, Elementalist 2nd job)
 *   1372086 — Spell Weaver's Rod (Lv70, Arcanum 3rd job)
 *   1382082 — Prism Staff     (Lv120, Archsage 4th job)
 * @Armor:
 *   1002978 — Sage's Crown    (Lv30, Hat, INT+8, MAD+5, MP+50)
 *   1050240 — Sage's Vestment (Lv35, Overall, INT+12, MAD+8, MP+80)
 *   1072375 — Sage's Sandals  (Lv30, Shoes, INT+5, MAD+3, MP+40)
 *   1082131 — Blue Sage       (Lv30, Gloves, INT+5, MAD+4, MP+30)
 */
var status = 0;
var shopMode = 0;   // 0=weapons, 1=armor
var selectedItem = -1;

var weapons = [
    ["Runic Orb",          1372080,  30000, 20,  "Wand",  "A floating orb etched with ancient runes. The Sage's first true focus — harmonises with the Order's elemental resonance."],
    ["Arcane Scepter",     1372081,  80000, 30,  "Wand",  "A scepter pulsing with elemental energy. The tool of the Elementalist — all elements answer to its wielder."],
    ["Spell Weaver's Rod", 1372086, 250000, 70,  "Wand",  "A crystalline rod that weaves multiple spell threads simultaneously. Arcanum scholars craft it through months of ritual."],
    ["Prism Staff",        1382082, 800000, 120, "Staff", "A towering staff crowned with a crystal prism splitting light into all elemental forces. Only an Archsage truly masters it."]
];

var armor = [
    ["Sage's Crown",    1003075,  80000, 30,  "Hat",     "A circlet of polished runestone, etched with the sigil of the Order. INT+8, MAD+5, MP+50."],
    ["Sage's Vestment", 1052236, 120000, 35,  "Overall", "Robes woven from elemental silk — each thread resonates with a different arcane frequency. INT+12, MAD+8, MP+80."],
    ["Sage's Sandals",  1072439,  60000, 30,  "Shoes",   "Sandals blessed by the Spire's foundation stones. Silent on any ground, warm in any weather. INT+5, MAD+3, MP+40."],
    ["Blue Sage",       1082131,  50000, 30,  "Gloves",  "Gloves channeling frost and storm energy — the preferred hand-guards of Sage scholars. INT+5, MAD+4, MP+30."]
];

function start() {
    status = 0;
    shopMode = 0;
    selectedItem = -1;

    var job = cm.getPlayer().getJob().getId ? cm.getPlayer().getJob().getId() : cm.getJobId();
    var isSage = (job >= 600 && job <= 699);

    if (!isSage) {
        cm.sendOk("#b[Archivist Thessaly]#k\r\n\r\n*adjusts spectacles and peers at you over the rims*\r\n\r\nThe Spire's archives are not a marketplace for wandering adventurers. These instruments are crafted for — and only respond to — members of the Sage Order.\r\n\r\nSeek out Sage Instructor Elara in Ellinia if you wish to join our ranks.");
        cm.dispose();
        return;
    }

    cm.sendNext("#b[Archivist Thessaly]#k\r\n\r\n*looks up from a sprawling stack of arcane manuscripts*\r\n\r\nAh. A fellow Scholar of the Spire. The Arcane Archives hold more than knowledge — each weapon and garment here has been attuned to the Order's resonance.\r\n\r\nBrowse at your leisure. I have catalogued every item personally.");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "#b[Archivist Thessaly — Sage Emporium]#k\r\n\r\n";
        menu += "#L0##b Browse arcane weapons (wands & staves)#k#l\r\n";
        menu += "#L1##b Browse Sage armour (hat, vestment, sandals, gloves)#k#l\r\n";
        menu += "#L2##b Ask about the Sage's equipment tradition#k#l\r\n";
        menu += "#L3##b Return to your studies#k#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == 3) {
            cm.sendOk("Knowledge first, equipment second. That is the Sage way.");
            cm.dispose();
            return;
        } else if (selection == 2) {
            cm.sendOk("#b[Sage Gear — The Order's Tradition]#k\r\n\r\n" +
                "#bRunic Orb#k (Lv10): The first focus of every Sage. Ancient symbols enhance mana flow.\r\n" +
                "#bArcane Scepter#k (Lv30): Elementalist's mark — every element bends to this scepter's will.\r\n" +
                "#bSpell Weaver's Rod#k (Lv70): Arcanum scholars weave complex spell matrices through this rod.\r\n" +
                "#bPrism Staff#k (Lv120): The pinnacle of Sage weaponcraft. The Archsage's eternal scepter.\r\n\r\n" +
                "#bSage's Crown#k (Lv30): INT+8, MAD+5, MP+50. Forged from runestone — focuses arcane thought.\r\n" +
                "#bSage's Vestment#k (Lv35): INT+12, MAD+8, MP+80. Woven from elemental silk — maximizes spell power.\r\n" +
                "#bSage's Sandals#k (Lv30): INT+5, MAD+3, MP+40. Foundation-blessed — stable footing for casting.\r\n" +
                "#bBlue Sage Gloves#k (Lv30): INT+5, MAD+4, MP+30. Channelling the frost and storm frequencies of the Order's first two elements.");
            cm.dispose();
            return;
        }
        shopMode = selection; // 0=weapons, 1=armor
        var catalog = (shopMode == 0) ? weapons : armor;
        var shopMenu = "#b[" + (shopMode == 0 ? "Arcane Arsenal — Weapons" : "Sage Attire — Equipment") + "]#k\r\n\r\n";
        for (var i = 0; i < catalog.length; i++) {
            shopMenu += "#L" + i + "##i" + catalog[i][1] + "# #b" + catalog[i][0] + "#k (" + catalog[i][4] + ", Lv" + catalog[i][3] + ") — " + catalog[i][2] + " mesos#l\r\n";
        }
        shopMenu += "#L" + catalog.length + "#Return to the index.#l";
        cm.sendSimple(shopMenu);

    } else if (status == 3) {
        var catalog = (shopMode == 0) ? weapons : armor;
        if (selection == catalog.length) {
            cm.sendOk("*returns to cataloguing*\r\nReturn when you have made your selection.");
            cm.dispose();
            return;
        }
        selectedItem = selection;
        var w = catalog[selectedItem];
        cm.sendYesNo("#b" + w[0] + "#k (" + w[4] + ", Lv" + w[3] + ")\r\n\r\n" + w[5] + "\r\n\r\nAcquisition cost: #r" + w[2] + " mesos#k\r\n\r\nShall I transfer this to your possession?");

    } else if (status == 4) {
        if (mode == 0) {
            cm.sendOk("*nods and resumes writing*\r\nAll items remain in archive until properly claimed.");
            cm.dispose();
            return;
        }
        var catalog = (shopMode == 0) ? weapons : armor;
        var w = catalog[selectedItem];
        if (cm.getMeso() < w[2]) {
            cm.sendOk("Your treasury is insufficient. This item requires #r" + w[2] + " mesos#k.\r\n\r\nThe archive does not operate on credit.");
        } else if (!cm.canHold(w[1])) {
            cm.sendOk("Your inventory is at capacity. The archive cannot release items to a full inventory. Please organise your belongings first.");
        } else {
            cm.gainMeso(-w[2]);
            cm.gainItem(w[1], 1);
            cm.sendOk("*stamps the acquisition ledger*\r\n\r\n#b#t" + w[1] + "#k has been transferred to your possession.\r\n\r\nWear it with the dignity befitting a Sage of the Order.");
        }
        cm.dispose();
    }
}
