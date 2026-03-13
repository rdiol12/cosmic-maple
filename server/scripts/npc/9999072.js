/**
 * NPC: Master Crafter Hephaestus (9999072)
 * Location: Perion (102000000)
 * Type: Item Fusion Crafting — combine common drops into useful items
 *
 * Gives players a reason to keep "junk" ETC drops. Recipes use common
 * farmable materials to produce scrolls, potions, and consumables.
 * Recipes have a cooldown (1 craft per recipe per 2 hours) to prevent abuse.
 * Some recipes have a success/fail chance for excitement.
 *
 * Tracking: Quest 99217 custom data stores last craft timestamps
 *   Format: "recipeIndex1:timestamp1,recipeIndex2:timestamp2,..."
 */

var status = -1;
var sel = -1;
var selectedRecipe = -1;
var QUEST_ID = 99217;
var COOLDOWN_MS = 7200000; // 2 hours in milliseconds

// Recipe definitions
var recipes = [
    {
        name: "Mushroom Elixir Bundle",
        desc: "Distill mushroom caps into potent healing elixirs.",
        ingredients: [
            { id: 4000019, qty: 100, name: "Orange Mushroom Cap" },
            { id: 4000015, qty: 50, name: "Horny Mushroom Cap" }
        ],
        result: { id: 2000005, qty: 30, name: "Power Elixir" },
        successRate: 100,
        minLevel: 20,
        mesoCost: 50000
    },
    {
        name: "Steel Forging Kit",
        desc: "Smelt raw ores into refined crafting materials worth trading.",
        ingredients: [
            { id: 4010001, qty: 30, name: "Steel Ore" },
            { id: 4010002, qty: 20, name: "Mithril Ore" }
        ],
        result: { id: 2000004, qty: 50, name: "Elixir" },
        successRate: 100,
        minLevel: 30,
        mesoCost: 80000
    },
    {
        name: "Dragon Scale Scroll",
        desc: "Combine dragon hides with ore to craft a powerful defense scroll.",
        ingredients: [
            { id: 4000030, qty: 50, name: "Dragon Skin" },
            { id: 4010003, qty: 10, name: "Adamantium Ore" },
            { id: 4010006, qty: 5, name: "Gold Ore" }
        ],
        result: { id: 2049003, qty: 1, name: "Clean Slate Scroll 10%" },
        successRate: 70,
        minLevel: 80,
        mesoCost: 500000
    },
    {
        name: "Shell Shield Polish",
        desc: "An old warrior trick - grind snail shells into a shield enhancement compound.",
        ingredients: [
            { id: 4000001, qty: 200, name: "Snail Shell" },
            { id: 4000003, qty: 100, name: "Tree Branch" }
        ],
        result: { id: 2002017, qty: 10, name: "Warrior Elixir" },
        successRate: 100,
        minLevel: 10,
        mesoCost: 30000
    },
    {
        name: "Chaos Transmutation",
        desc: "A dangerous alchemical process. Fuse rare ores with dragon essence into a Chaos Scroll.",
        ingredients: [
            { id: 4000030, qty: 100, name: "Dragon Skin" },
            { id: 4010005, qty: 20, name: "Orihalcon Ore" },
            { id: 4010006, qty: 15, name: "Gold Ore" }
        ],
        result: { id: 2049001, qty: 1, name: "Chaos Scroll 60%" },
        successRate: 40,
        minLevel: 120,
        mesoCost: 2000000
    },
    {
        name: "Nature's Blessing",
        desc: "Channel the forest's energy through mushroom caps and branches into a healing brew.",
        ingredients: [
            { id: 4000019, qty: 200, name: "Orange Mushroom Cap" },
            { id: 4000003, qty: 150, name: "Tree Branch" }
        ],
        result: { id: 2002015, qty: 5, name: "Elpam Elixir" },
        successRate: 80,
        minLevel: 50,
        mesoCost: 200000
    },
    {
        name: "Silver Star Refining",
        desc: "Pure silver, properly refined, makes excellent throwing stars.",
        ingredients: [
            { id: 4010004, qty: 50, name: "Silver Ore" },
            { id: 4010001, qty: 30, name: "Steel Ore" }
        ],
        result: { id: 2070006, qty: 500, name: "Ilbi" },
        successRate: 60,
        minLevel: 60,
        mesoCost: 300000
    },
    {
        name: "Apprentice's First Craft",
        desc: "A simple recipe for beginners. Turn mushroom caps into a basic healing salve.",
        ingredients: [
            { id: 4000015, qty: 30, name: "Horny Mushroom Cap" }
        ],
        result: { id: 2000004, qty: 20, name: "Elixir" },
        successRate: 100,
        minLevel: 1,
        mesoCost: 10000
    }
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
        var playerLevel = cm.getLevel();
        var text = "#e#dMaster Crafter Hephaestus#k#n\r\n\r\n";
        text += "Greetings, adventurer. I am Hephaestus, master of the ancient art of ";
        text += "#bItem Fusion#k. Bring me common materials and I will transform them ";
        text += "into something... #rextraordinary#k.\r\n\r\n";
        text += "#eAvailable Recipes:#n\r\n\r\n";

        var hasAny = false;
        for (var i = 0; i < recipes.length; i++) {
            var r = recipes[i];
            if (playerLevel >= r.minLevel) {
                var cooldownReady = isCooldownReady(i);
                var cdText = cooldownReady ? "" : " #r[Cooling Down]#k";
                text += "#L" + i + "#" + r.name + " (Lv." + r.minLevel + "+)" + cdText + "#l\r\n";
                hasAny = true;
            }
        }

        if (!hasAny) {
            text += "#rNo recipes available at your level yet. Come back when you are stronger!#k\r\n";
        }

        text += "\r\n#L100#How does Item Fusion work?#l";
        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;

        if (sel === 100) {
            cm.sendOk(
                "#e#dItem Fusion - How It Works#k#n\r\n\r\n" +
                "#b1.#k Choose a recipe from my list.\r\n" +
                "#b2.#k Gather the required materials.\r\n" +
                "#b3.#k Pay the crafting fee.\r\n" +
                "#b4.#k I attempt the fusion!\r\n\r\n" +
                "#eImportant Notes:#n\r\n" +
                "- Some recipes have a #rsuccess chance#k. If fusion fails, " +
                "materials are consumed but you get nothing!\r\n" +
                "- Each recipe has a #b2-hour cooldown#k after crafting.\r\n" +
                "- Higher-level recipes yield rarer rewards.\r\n" +
                "- All materials are consumed on attempt, success or fail.\r\n\r\n" +
                "#gTip:#k Farm common mobs for materials. Even Snail Shells are useful here!"
            );
            cm.dispose();
            return;
        }

        selectedRecipe = sel;
        if (selectedRecipe < 0 || selectedRecipe >= recipes.length) {
            cm.dispose();
            return;
        }

        var r = recipes[selectedRecipe];
        var playerLevel = cm.getLevel();

        if (playerLevel < r.minLevel) {
            cm.sendOk("You need to be at least level " + r.minLevel + " for this recipe.");
            cm.dispose();
            return;
        }

        if (!isCooldownReady(selectedRecipe)) {
            var remaining = getCooldownRemaining(selectedRecipe);
            cm.sendOk(
                "#e#dMaster Crafter Hephaestus#k#n\r\n\r\n" +
                "This recipe is still cooling down.\r\n\r\n" +
                "#eTime remaining:#n #r" + formatTime(remaining) + "#k\r\n\r\n" +
                "Come back later, or try a different recipe."
            );
            cm.dispose();
            return;
        }

        var text = "#e#dRecipe: " + r.name + "#k#n\r\n\r\n";
        text += r.desc + "\r\n\r\n";
        text += "#eRequired Materials:#n\r\n";
        for (var j = 0; j < r.ingredients.length; j++) {
            var ing = r.ingredients[j];
            var have = cm.getItemQuantity(ing.id);
            var enough = have >= ing.qty;
            text += "  #v" + ing.id + "# " + ing.name + " x" + ing.qty;
            text += enough ? " #g[" + have + "/" + ing.qty + " OK]#k" : " #r[" + have + "/" + ing.qty + " NEED MORE]#k";
            text += "\r\n";
        }
        text += "\r\n#eCrafting Fee:#n " + formatMeso(r.mesoCost) + " meso";
        var hasMeso = cm.getMeso() >= r.mesoCost;
        text += hasMeso ? " #g[OK]#k" : " #r[NOT ENOUGH]#k";
        text += "\r\n\r\n#eResult:#n #v" + r.result.id + "# " + r.result.name + " x" + r.result.qty;
        text += "\r\n#eSuccess Rate:#n ";
        if (r.successRate === 100) {
            text += "#g100% (Guaranteed)#k";
        } else {
            text += "#r" + r.successRate + "%#k";
        }
        text += "\r\n\r\nProceed with crafting?";
        cm.sendYesNo(text);

    } else if (status === 2) {
        if (mode === 0) {
            cm.sendOk("Come back when you are ready to craft.");
            cm.dispose();
            return;
        }

        var r = recipes[selectedRecipe];

        // Verify all ingredients
        for (var j = 0; j < r.ingredients.length; j++) {
            var ing = r.ingredients[j];
            if (cm.getItemQuantity(ing.id) < ing.qty) {
                cm.sendOk("You don't have enough #b" + ing.name + "#k! Need " + ing.qty + ".");
                cm.dispose();
                return;
            }
        }

        // Verify meso
        if (cm.getMeso() < r.mesoCost) {
            cm.sendOk("You don't have enough meso! Need " + formatMeso(r.mesoCost) + ".");
            cm.dispose();
            return;
        }

        // Verify can hold result
        if (!cm.canHold(r.result.id, r.result.qty)) {
            cm.sendOk("Your inventory is full! Make space for the crafted item.");
            cm.dispose();
            return;
        }

        // Consume ingredients
        for (var j = 0; j < r.ingredients.length; j++) {
            var ing = r.ingredients[j];
            cm.gainItem(ing.id, -ing.qty);
        }

        // Consume meso
        cm.gainMeso(-r.mesoCost);

        // Set cooldown
        setCooldown(selectedRecipe);

        // Roll for success
        var roll = Math.floor(Math.random() * 100) + 1;
        var success = roll <= r.successRate;

        if (success) {
            cm.gainItem(r.result.id, r.result.qty);

            if (r.successRate < 100) {
                cm.playerMessage(6, "[Crafting] " + cm.getPlayer().getName() + " successfully crafted " + r.result.name + "!");
            }

            var text = "#e#dMaster Crafter Hephaestus#k#n\r\n\r\n";
            text += "#fUI/UIWindow.img/QuestIcon/4/0#\r\n\r\n";
            text += "#g=== FUSION SUCCESS! ===#k\r\n\r\n";
            text += "Magnificent! The materials have fused perfectly.\r\n\r\n";
            text += "#eYou received:#n\r\n";
            text += "  #v" + r.result.id + "# " + r.result.name + " x" + r.result.qty + "\r\n\r\n";
            text += "#dThis recipe is on cooldown for 2 hours.#k";
            cm.sendOk(text);
        } else {
            var text = "#e#dMaster Crafter Hephaestus#k#n\r\n\r\n";
            text += "#r=== FUSION FAILED ===#k\r\n\r\n";
            text += "Blast! The materials couldn't hold together...\r\n";
            text += "The ingredients have been consumed.\r\n\r\n";
            text += "#eRoll:#n " + roll + " (needed " + r.successRate + " or less)\r\n\r\n";
            text += "Don't lose heart! Gather more materials and try again.\r\n\r\n";
            text += "#dThis recipe is on cooldown for 2 hours.#k";
            cm.sendOk(text);
        }
        cm.dispose();

    } else {
        cm.dispose();
    }
}

function parseCooldowns() {
    try {
        var rec = cm.getQuestRecord(QUEST_ID);
        var raw = rec.getCustomData();
        if (raw === null || raw === "") return {};
        var map = {};
        var pairs = raw.split(",");
        for (var i = 0; i < pairs.length; i++) {
            var kv = pairs[i].split(":");
            if (kv.length === 2) {
                map[parseInt(kv[0])] = parseInt(kv[1]);
            }
        }
        return map;
    } catch(e) {
        return {};
    }
}

function saveCooldowns(map) {
    try {
        var parts = [];
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                parts.push(key + ":" + map[key]);
            }
        }
        var rec = cm.getQuestRecord(QUEST_ID);
        rec.setCustomData(parts.join(","));
    } catch(e) {}
}

function isCooldownReady(recipeIndex) {
    var map = parseCooldowns();
    if (!(recipeIndex in map)) return true;
    var now = java.lang.System.currentTimeMillis();
    return (now - map[recipeIndex]) >= COOLDOWN_MS;
}

function getCooldownRemaining(recipeIndex) {
    var map = parseCooldowns();
    if (!(recipeIndex in map)) return 0;
    var now = java.lang.System.currentTimeMillis();
    var elapsed = now - map[recipeIndex];
    if (elapsed >= COOLDOWN_MS) return 0;
    return COOLDOWN_MS - elapsed;
}

function setCooldown(recipeIndex) {
    var map = parseCooldowns();
    map[recipeIndex] = java.lang.System.currentTimeMillis();
    saveCooldowns(map);
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

function formatTime(ms) {
    var totalSec = Math.floor(ms / 1000);
    var hours = Math.floor(totalSec / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) {
        return hours + "h " + mins + "m";
    }
    return mins + " minutes";
}
