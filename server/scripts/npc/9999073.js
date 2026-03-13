/**
 * NPC: Dimensional Mirror Mira (9999073)
 * Location: Henesys (100000000), Ellinia (101000000), Perion (102000000),
 *           Kerning City (103000000), Lith Harbor (104000000)
 * Type: Universal Teleporter — warp to any major town or training area
 *
 * Essential QoL NPC. Costs meso to teleport (scales with distance/level).
 * Free warps to beginner towns, paid warps to higher areas.
 * VIP destinations unlock at higher levels.
 *
 * Categories: Towns, Training Areas, Dungeons, Special Areas
 */

var status = -1;
var sel = -1;
var category = -1;

// Destination categories
var towns = [
    { name: "Henesys", map: 100000000, cost: 0, level: 1 },
    { name: "Ellinia", map: 101000000, cost: 0, level: 1 },
    { name: "Perion", map: 102000000, cost: 0, level: 1 },
    { name: "Kerning City", map: 103000000, cost: 0, level: 1 },
    { name: "Lith Harbor", map: 104000000, cost: 0, level: 1 },
    { name: "Sleepywood", map: 105040300, cost: 5000, level: 15 },
    { name: "Orbis", map: 200000000, cost: 10000, level: 30 },
    { name: "El Nath", map: 211000000, cost: 10000, level: 40 },
    { name: "Ludibrium", map: 220000000, cost: 15000, level: 50 },
    { name: "Omega Sector", map: 221000000, cost: 15000, level: 50 },
    { name: "Aqua Road", map: 230000000, cost: 20000, level: 55 },
    { name: "Leafre", map: 240000000, cost: 30000, level: 80 },
    { name: "Mu Lung", map: 250000000, cost: 20000, level: 60 },
    { name: "Herb Town", map: 251000000, cost: 20000, level: 60 },
    { name: "Ariant", map: 260000000, cost: 25000, level: 60 },
    { name: "Magatia", map: 261000000, cost: 25000, level: 70 },
    { name: "Temple of Time", map: 270000100, cost: 50000, level: 120 }
];

var training = [
    { name: "Henesys Hunting Ground I", map: 104040000, cost: 3000, level: 10, desc: "Lv.10-20" },
    { name: "Ant Tunnel", map: 105010100, cost: 5000, level: 20, desc: "Lv.20-35" },
    { name: "Wild Boar Land", map: 101040001, cost: 5000, level: 20, desc: "Lv.20-30" },
    { name: "Sleepywood Dungeon", map: 105040300, cost: 8000, level: 30, desc: "Lv.30-50" },
    { name: "Orbis Tower", map: 200080100, cost: 10000, level: 35, desc: "Lv.35-50" },
    { name: "Ice Valley II", map: 211040200, cost: 15000, level: 50, desc: "Lv.50-65" },
    { name: "Toy Factory", map: 220020000, cost: 15000, level: 55, desc: "Lv.55-70" },
    { name: "Pirate Ship", map: 230040200, cost: 20000, level: 60, desc: "Lv.60-75" },
    { name: "Mu Lung Training Center", map: 250010304, cost: 20000, level: 65, desc: "Lv.65-80" },
    { name: "Leafre: Dragon Forest", map: 240020400, cost: 30000, level: 80, desc: "Lv.80-100" },
    { name: "Temple of Time: Road of Regrets", map: 270010100, cost: 50000, level: 120, desc: "Lv.120+" },
    { name: "Phantom Forest", map: 610010000, cost: 30000, level: 100, desc: "Lv.100-120" }
];

var dungeons = [
    { name: "Zakum Entrance", map: 211042300, cost: 50000, level: 50, desc: "Boss: Lv.50+" },
    { name: "Horntail Cave", map: 240050000, cost: 80000, level: 100, desc: "Boss: Lv.100+" },
    { name: "Papulatus Clock Tower", map: 220080001, cost: 50000, level: 80, desc: "Boss: Lv.80+" },
    { name: "Pianus Cave", map: 230040420, cost: 40000, level: 80, desc: "Boss: Lv.80+" },
    { name: "Crimsonwood Keep", map: 610030010, cost: 60000, level: 100, desc: "Boss: Lv.100+" }
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
        var text = "#e#dDimensional Mirror — Mira#k#n\r\n\r\n";
        text += "Step through the looking glass, dear traveler. ";
        text += "I can bend the very fabric of space to send you ";
        text += "wherever your heart desires.\r\n\r\n";
        text += "#eWhere would you like to go?#n\r\n\r\n";
        text += "#L0##bTowns#k — Major cities and rest areas#l\r\n";
        text += "#L1##bTraining Areas#k — Level-appropriate grinding spots#l\r\n";
        text += "#L2##bDungeons & Bosses#k — Dangerous encounters#l\r\n";
        text += "#L3##bReturn to Nearest Town#k — Free emergency warp#l\r\n";
        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;
        category = sel;
        var playerLevel = cm.getLevel();

        if (sel === 3) {
            // Free return to nearest town
            cm.warp(cm.getPlayer().getMap().getReturnMapId());
            cm.dispose();
            return;
        }

        var list;
        var catName;
        if (sel === 0) { list = towns; catName = "Towns"; }
        else if (sel === 1) { list = training; catName = "Training Areas"; }
        else if (sel === 2) { list = dungeons; catName = "Dungeons & Bosses"; }
        else { cm.dispose(); return; }

        var text = "#e#d" + catName + "#k#n\r\n\r\n";
        var hasAny = false;

        for (var i = 0; i < list.length; i++) {
            var dest = list[i];
            if (playerLevel >= dest.level) {
                var costText = dest.cost === 0 ? "#g[FREE]#k" : "#b" + formatMeso(dest.cost) + " meso#k";
                var descText = dest.desc ? " — " + dest.desc : "";
                text += "#L" + i + "#" + dest.name + descText + " " + costText + "#l\r\n";
                hasAny = true;
            }
        }

        if (!hasAny) {
            text += "#rNo destinations available at your level.#k\r\n";
            text += "Come back when you're stronger!";
            cm.sendOk(text);
            cm.dispose();
            return;
        }

        text += "\r\n#r* Victoria Island towns are free. Other destinations have a teleportation fee.#k";
        cm.sendSimple(text);

    } else if (status === 2) {
        var list;
        if (category === 0) list = towns;
        else if (category === 1) list = training;
        else if (category === 2) list = dungeons;
        else { cm.dispose(); return; }

        var destIndex = selection;
        if (destIndex < 0 || destIndex >= list.length) {
            cm.dispose();
            return;
        }

        var dest = list[destIndex];
        var playerLevel = cm.getLevel();

        if (playerLevel < dest.level) {
            cm.sendOk("You must be at least level " + dest.level + " to go there.");
            cm.dispose();
            return;
        }

        if (dest.cost > 0 && cm.getMeso() < dest.cost) {
            cm.sendOk(
                "#e#dDimensional Mirror — Mira#k#n\r\n\r\n" +
                "The dimensional rift requires " + formatMeso(dest.cost) + " meso to stabilize.\r\n" +
                "You only have " + formatMeso(cm.getMeso()) + " meso.\r\n\r\n" +
                "#rInsufficient funds!#k"
            );
            cm.dispose();
            return;
        }

        // Charge and warp
        if (dest.cost > 0) {
            cm.gainMeso(-dest.cost);
        }

        cm.playerMessage(5, "[Teleport] Warping to " + dest.name + "...");
        cm.warp(dest.map, 0);
        cm.dispose();

    } else {
        cm.dispose();
    }
}

function formatMeso(amount) {
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
