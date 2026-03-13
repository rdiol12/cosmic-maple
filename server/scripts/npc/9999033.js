/**
 * @NPC:     Sera the Arcanist (9999033)
 * @Purpose: Blueprint weapon crafting — Mage class
 * @Handles: Tiers 1-10, levels 10-100
 * @Recipe:  Blueprint + crafting materials + mesos → crafted weapon
 * @Generated: generateBlacksmithNpcScript() — blueprint-crafting.js
 */

var status = -1;
var selectedIdx = -1;

var WEAPONS = [
    { bpId: 4032210, weaponId: 1372150, name: "Dustwood Wand", tier: 1, level: 10, atk: 22, meso: 10000, mat: { itemId: 4000001, name: "Snail Shell", qty: 5 } },
    { bpId: 4032211, weaponId: 1372151, name: "Amber Rod", tier: 2, level: 20, atk: 34, meso: 25000, mat: { itemId: 4000001, name: "Snail Shell", qty: 10 } },
    { bpId: 4032212, weaponId: 1372152, name: "Cerulean Staff", tier: 3, level: 30, atk: 48, meso: 50000, mat: { itemId: 4000003, name: "Blue Snail Shell", qty: 5 } },
    { bpId: 4032213, weaponId: 1372153, name: "Mystic Bough", tier: 4, level: 40, atk: 63, meso: 90000, mat: { itemId: 4000021, name: "Leather", qty: 5 } },
    { bpId: 4032214, weaponId: 1372154, name: "Voidtipped Wand", tier: 5, level: 50, atk: 79, meso: 140000, mat: { itemId: 4000021, name: "Leather", qty: 10 } },
    { bpId: 4032215, weaponId: 1372155, name: "Runeglass Staff", tier: 6, level: 60, atk: 97, meso: 210000, mat: { itemId: 4010000, name: "Garnet", qty: 3 } },
    { bpId: 4032216, weaponId: 1372156, name: "Arcane Conductor", tier: 7, level: 70, atk: 117, meso: 300000, mat: { itemId: 4010000, name: "Garnet", qty: 5 } },
    { bpId: 4032217, weaponId: 1372157, name: "Spellfused Rod", tier: 8, level: 80, atk: 139, meso: 420000, mat: { itemId: 4011001, name: "Steel Plate", qty: 3 } },
    { bpId: 4032218, weaponId: 1372158, name: "Aetherspire Staff", tier: 9, level: 90, atk: 163, meso: 570000, mat: { itemId: 4011002, name: "Mithril Plate", qty: 3 } },
    { bpId: 4032219, weaponId: 1372159, name: "Eternal Prism Staff", tier: 10, level: 100, atk: 190, meso: 750000, mat: { itemId: 4011004, name: "Orihalcon Plate", qty: 3 } }
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
        // Build crafting menu — mark entries green if craftable, grey if missing materials
        var menu = "*Sera the Arcanist: An elven enchantress who binds arcane energy into hand-crafted staves.*\r\n\r\nShow me a #bBlueprint#k and the required materials — I'll forge the weapon.\r\n\r\n";
        for (var i = 0; i < WEAPONS.length; i++) {
            var w = WEAPONS[i];
            var hasBp  = cm.haveItem(w.bpId);
            var hasMat = w.mat == null || cm.haveItem(w.mat.itemId, w.mat.qty);
            var canCraft = hasBp && hasMat && cm.getMeso() >= w.meso;
            var mark = canCraft ? "#b" : (hasBp ? "#i" : "#d");
            var matLine = w.mat ? " + " + w.mat.qty + "x " + w.mat.name : "";
            menu += "#L" + i + "#" + mark + "T" + w.tier + " " + w.name
                 + " (lv" + w.level + ", +" + w.atk + " atk)"
                 + " — " + (w.meso/1000) + "k" + matLine
                 + "#k#l\r\n";
        }
        cm.sendSimple(menu);

    } else if (status == 1) {
        selectedIdx = selection;
        var w = WEAPONS[selectedIdx];

        // --- Validate all requirements ---
        if (!cm.haveItem(w.bpId)) {
            cm.sendOk("You are missing the #b" + w.name + " Blueprint#k.\r\nFind it as a drop from the relevant monsters first.");
            cm.dispose();
            return;
        }
        if (w.mat != null && !cm.haveItem(w.mat.itemId, w.mat.qty)) {
            var have = cm.itemQuantity ? cm.itemQuantity(w.mat.itemId) : "?";
            cm.sendOk("You need #b" + w.mat.qty + "x " + w.mat.name + "#k to forge this weapon.\r\nYou currently have: " + have + "/" + w.mat.qty + ".");
            cm.dispose();
            return;
        }
        if (cm.getMeso() < w.meso) {
            cm.sendOk("The forge fee for #b" + w.name + "#k is #b" + w.meso + " mesos#k.\r\nYou have " + cm.getMeso() + " — come back with enough.");
            cm.dispose();
            return;
        }

        // Confirmation with full recipe
        var recipe = "Blueprint: 1x " + w.name + " Blueprint\r\n";
        if (w.mat != null) recipe += "Materials: " + w.mat.qty + "x " + w.mat.name + "\r\n";
        recipe += "Forge fee: " + (w.meso/1000) + "k mesos";
        cm.sendYesNo("I can forge #b" + w.name + "#k (lv" + w.level + ", +" + w.atk + " atk).\r\n\r\nRecipe:\r\n" + recipe + "\r\n\r\nProceed?");

    } else if (status == 2) {
        if (mode == 1) {
            var w = WEAPONS[selectedIdx];
            cm.gainItem(w.bpId, -1);
            if (w.mat != null) cm.gainItem(w.mat.itemId, -w.mat.qty);
            cm.gainMeso(-w.meso);
            cm.gainItem(w.weaponId, 1);
            cm.sendOk("*The forge ignites. The blueprint dissolves into the metal.*\r\n\r\nYour #b" + w.name + "#k is ready. It was forged to last — treat it accordingly.");
        } else {
            cm.sendOk("Gather what you need and return. I don't rush good work.");
        }
        cm.dispose();
    }
}
