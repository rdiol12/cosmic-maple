/**
 * @NPC:     Grizelda the Bone Merchant (9990014)
 * @Purpose: Necromancer class full gear shop — weapons + armor set
 * @Location: Shadow Crypts Hub (990000000)
 * @Weapons:
 *   1372082 — Dark Wand      (Lv10, Necromancer 1st job)
 *   1382083 — Shadow Staff   (Lv30, Dark Acolyte 2nd job)
 *   1372083 — Soul Reaper's Wand (Lv70, Soul Reaper 3rd job)
 *   1382084 — Lich King's Staff  (Lv120, Lich King 4th job)
 * @Armor:
 *   1003074 — Bone Crown     (Lv30, Hat, INT+8, MAD+5)
 *   1052235 — Necromancer's Robes (Lv35, Overall, INT+12, MAD+8)
 *   1072438 — Shadow Treads  (Lv30, Shoes, INT+5, MAD+3)
 *   1082263 — Bone Gauntlets (Lv30, Gloves, INT+5, MAD+4)
 */
var status = 0;
var shopMode = 0;   // 0=weapons, 1=armor
var selectedItem = -1;

var weapons = [
    ["Dark Wand",           1372082,  30000, 10,  "Wand",    "A gnarled wand carved from bone and shadow. Perfect for a fledgling Necromancer."],
    ["Shadow Staff",        1382083,  80000, 30,  "Staff",   "A crooked staff wreathed in necrotic energy. Dark Acolytes draw power from fallen souls."],
    ["Soul Reaper's Wand",  1372083, 250000, 70,  "Wand",    "A wand tipped with a glowing soul gem. The instrument of conquest for Soul Reapers."],
    ["Lich King's Staff",   1382084, 800000, 120, "Staff",   "The supreme scepter of undeath. Only the Lich King may wield this relic."]
];

var armor = [
    ["Bone Crown",          1003074,  80000, 30,  "Hat",     "A crown of shadow-hardened bone. INT+8, MAD+5, MP+50."],
    ["Necromancer's Robes", 1052235, 120000, 35,  "Overall", "Robes stitched from shadow-silk and bone dust. INT+12, MAD+8, MP+80."],
    ["Shadow Treads",       1072438,  60000, 30,  "Shoes",   "Boots of shadow-leather. Silent on any ground. INT+5, MAD+3, MP+40."],
    ["Bone Gauntlets",      1082263,  50000, 30,  "Gloves",  "Gauntlets forged from knucklebones. INT+5, MAD+4, MP+30."]
];

function start() {
    status = 0;
    shopMode = 0;
    selectedItem = -1;
    cm.sendNext("#b[Grizelda the Bone Merchant]#k\r\n\r\nThe dead have fine taste in equipment, and so do their masters.\r\n\r\nI deal only in instruments of darkness — weapons forged from shadow, armour fashioned from bone. Each piece carries a fragment of necromantic power.\r\n\r\nWhat catches your eye?");
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 1) {
        var menu = "#b[Grizelda's Dark Emporium]#k\r\n\r\n";
        menu += "#L0##b Browse weapons (wands & staves)#k#l\r\n";
        menu += "#L1##b Browse armour (hat, robes, shoes, gloves)#k#l\r\n";
        menu += "#L2##b About the Necromancer's gear#k#l\r\n";
        menu += "#L3##b Leave — the shadows await#k#l";
        cm.sendSimple(menu);

    } else if (status == 2) {
        if (selection == 3) {
            cm.sendOk("The dead can wait. Return when you are ready.");
            cm.dispose();
            return;
        } else if (selection == 2) {
            cm.sendOk("#b[Necromancer's Gear — Lore]#k\r\n\r\n" +
                "#bDark Wand#k (Lv10): First weapon of the Necromancer. Carved from shadow-bone.\r\n" +
                "#bShadow Staff#k (Lv30): Dark Acolyte staff. Commands the first skeleton warriors.\r\n" +
                "#bSoul Reaper's Wand#k (Lv70): Soul gem wand. Harvests power from mass death.\r\n" +
                "#bLich King's Staff#k (Lv120): The final relic. Death itself bends to its wielder.\r\n\r\n" +
                "#bBone Crown#k (Lv30): INT+8, MAD+5, MP+50. The mark of a true Necromancer.\r\n" +
                "#bNecromancer's Robes#k (Lv35): INT+12, MAD+8, MP+80. Ancient shadow-silk armour.\r\n" +
                "#bShadow Treads#k (Lv30): INT+5, MAD+3, MP+40, Speed+3. Makes no sound.\r\n" +
                "#bBone Gauntlets#k (Lv30): INT+5, MAD+4, MP+30. Forged from enemy knucklebones.");
            cm.dispose();
            return;
        }
        shopMode = selection; // 0=weapons, 1=armor
        var catalog = (shopMode == 0) ? weapons : armor;
        var shopMenu = "#b[" + (shopMode == 0 ? "Dark Arsenal — Weapons" : "Bone Armour — Equipment") + "]#k\r\n\r\n";
        for (var i = 0; i < catalog.length; i++) {
            shopMenu += "#L" + i + "##i" + catalog[i][1] + "# #b" + catalog[i][0] + "#k (" + catalog[i][4] + ", Lv" + catalog[i][3] + ") — " + catalog[i][2] + " mesos#l\r\n";
        }
        shopMenu += "#L" + catalog.length + "#Never mind.#l";
        cm.sendSimple(shopMenu);

    } else if (status == 3) {
        var catalog = (shopMode == 0) ? weapons : armor;
        if (selection == catalog.length) {
            cm.sendOk("The dead can wait. Return when you are ready.");
            cm.dispose();
            return;
        }
        selectedItem = selection;
        var w = catalog[selectedItem];
        cm.sendYesNo("#b" + w[0] + "#k (" + w[4] + ", Lv" + w[3] + ")\r\n\r\n" + w[5] + "\r\n\r\nPrice: #r" + w[2] + " mesos#k\r\n\r\nShall I part with it?");

    } else if (status == 4) {
        if (mode == 0) {
            cm.sendOk("The item will wait. It has been waiting since before you were born.");
            cm.dispose();
            return;
        }
        var catalog = (shopMode == 0) ? weapons : armor;
        var w = catalog[selectedItem];
        if (cm.getMeso() < w[2]) {
            cm.sendOk("You lack the mesos. The living deal in coin, even when they seek death's power.\r\n\r\nYou need #r" + w[2] + " mesos#k.");
        } else if (!cm.canHold(w[1])) {
            cm.sendOk("Your inventory is full of life's clutter. Make room for instruments of death.");
        } else {
            cm.gainMeso(-w[2]);
            cm.gainItem(w[1], 1);
            cm.sendOk("Wise choice. #b#t" + w[1] + "#k is yours.\r\n\r\nMay it serve you well in the endless darkness.");
        }
        cm.dispose();
    }
}
