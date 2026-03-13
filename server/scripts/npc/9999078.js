/**
 * NPC: Cosmic Guide Stella (9999078)
 * Location: Henesys (100000000), Lith Harbor (104000000)
 * Type: Server Guide — introduces players to all custom Cosmic features
 *
 * A friendly guide who helps new and returning players discover all the
 * custom content on the Cosmic server. Acts as a directory to all custom
 * NPCs, features, and systems with brief descriptions and optional warps.
 *
 * Categories:
 *   1. Getting Started (beginner tips, milestone rewards)
 *   2. Daily Activities (challenges, fortune, mystery boxes)
 *   3. Economy & Shops (merchants, crafting, trading)
 *   4. Training & Combat (training guide, boss hunting)
 *   5. Character Growth (AP/SP reset, rebirth, skill tomes)
 *   6. Travel & Transport (dimensional mirror, teleporters)
 *   7. Custom Classes (Sage, Necromancer info)
 */

var status = -1;
var sel = -1;
var category = -1;

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
        var text = "#e#dCosmic Guide Stella#k#n\r\n\r\n";
        text += "Welcome to #bCosmic MapleStory#k, adventurer! ";
        text += "I know #eeverything#n about this server's special features.\r\n\r\n";
        text += "What would you like to learn about?\r\n\r\n";
        text += "#L0##bGetting Started#k — beginner tips & milestone rewards#l\r\n";
        text += "#L1##bDaily Activities#k — challenges, fortune telling & more#l\r\n";
        text += "#L2##bEconomy & Shops#k — merchants, crafting & trading#l\r\n";
        text += "#L3##bTraining & Combat#k — training spots & boss hunting#l\r\n";
        text += "#L4##bCharacter Growth#k — AP/SP reset, rebirth & skill books#l\r\n";
        text += "#L5##bTravel & Transport#k — teleporters & town warps#l\r\n";
        text += "#L6##bCustom Classes#k — Sage & Necromancer info#l\r\n";
        text += "#L7##bServer Info#k — rates, rules & tips#l\r\n";
        cm.sendSimple(text);

    } else if (status === 1) {
        category = selection;

        if (category === 0) {
            // Getting Started
            var text = "#e#dGetting Started#k#n\r\n\r\n";
            text += "New to Cosmic? Here's what you need to know:\r\n\r\n";
            text += "#e1. Milestone Rewards#n\r\n";
            text += "Talk to #bMilestone Maven Celeste#k in #rHenesys#k.\r\n";
            text += "She gives #efree reward packages#n at every milestone level ";
            text += "(10, 20, 30... up to 200). Even if you're already high level, ";
            text += "you can claim past milestones!\r\n\r\n";
            text += "#e2. Free Healing#n\r\n";
            text += "Talk to #bNurse Joy#k in #rHenesys#k for free HP/MP recovery.\r\n\r\n";
            text += "#e3. Beginner Guide#n\r\n";
            text += "Talk to #bOld Man Kazuki#k in #rLith Harbor#k for beginner tips ";
            text += "and starting equipment recommendations.\r\n\r\n";
            text += "#e4. Monster Book#n\r\n";
            text += "Talk to #bProfessor Foxwit#k in #rHenesys#k — he'll recommend ";
            text += "the best training spots for your level and teleport you there!\r\n\r\n";
            text += "#L100#Take me to #bMilestone Maven Celeste#k (Henesys)#l\r\n";
            text += "#L101#Take me to #bProfessor Foxwit#k (Henesys)#l\r\n";
            text += "#L999#Back to main menu#l\r\n";
            cm.sendSimple(text);

        } else if (category === 1) {
            // Daily Activities
            var text = "#e#dDaily Activities#k#n\r\n\r\n";
            text += "Log in daily for these activities:\r\n\r\n";
            text += "#e1. Daily Challenges#n\r\n";
            text += "Talk to #bCaptain Vega#k in #rHenesys#k or #rKerning City#k.\r\n";
            text += "Get randomized daily missions with 3 difficulty tiers. ";
            text += "Build streaks for bonus multipliers (up to 2x)!\r\n\r\n";
            text += "#e2. Fortune Telling#n\r\n";
            text += "Visit #bMystic Zara#k in #rHenesys#k for daily fortune readings. ";
            text += "Get buff bonuses and try the gambling mini-game.\r\n\r\n";
            text += "#e3. Mystery Boxes#n\r\n";
            text += "Find #bShady Shane#k in #rKerning City#k. ";
            text += "Buy mystery boxes in 4 tiers (Bronze/Silver/Gold/Diamond) ";
            text += "for random loot. 10 boxes per day max.\r\n\r\n";
            text += "#e4. Rotating Shop#n\r\n";
            text += "Check #bTraveling Merchant Zephyr#k in #rOrbis#k — ";
            text += "different stock every day of the week!\r\n\r\n";
            text += "#e5. Bounty Hunts#n\r\n";
            text += "Visit #bBounty Board Mika#k in #rHenesys#k or #rPerion#k. ";
            text += "Accept timed hunting contracts — kill targets within 30 min for ";
            text += "bonus EXP and meso. Complete fast (under 15 min) for 1.5x rewards!\r\n\r\n";
            text += "#L200#Take me to #bCaptain Vega#k (Henesys)#l\r\n";
            text += "#L201#Take me to #bShady Shane#k (Kerning City)#l\r\n";
            text += "#L203#Take me to #bBounty Board Mika#k (Henesys)#l\r\n";
            text += "#L202#Take me to #bZephyr#k (Orbis)#l\r\n";
            text += "#L999#Back to main menu#l\r\n";
            cm.sendSimple(text);

        } else if (category === 2) {
            // Economy & Shops
            var text = "#e#dEconomy & Shops#k#n\r\n\r\n";
            text += "Custom merchants and crafting:\r\n\r\n";
            text += "#e1. Blacksmith Taro#n — #rHenesys#k\r\n";
            text += "Sells custom weapons for all classes.\r\n\r\n";
            text += "#e2. Alchemist Luna#n — #rEllinia#k\r\n";
            text += "Crafts custom potions and consumables.\r\n\r\n";
            text += "#e3. Gem Trader Safi#n — #rEllinia#k\r\n";
            text += "Trades ores and gems for useful items.\r\n\r\n";
            text += "#e4. Treasure Hunter Kai#n — #rPerion#k\r\n";
            text += "Exchanges monster drops for rewards.\r\n\r\n";
            text += "#e5. Master Crafter Hephaestus#n — #rPerion#k\r\n";
            text += "Fuse common ETC drops into scrolls and potions. 8 recipes!\r\n\r\n";
            text += "#e6. Chef Momo#n — #rKerning City#k\r\n";
            text += "Sells food items with unique buffs.\r\n\r\n";
            text += "#e7. Brother Marcus#n — #rHenesys#k\r\n";
            text += "Sells temporary stat buffs (STR/DEX/INT/LUK +15, ATK/MATK +100). ";
            text += "Great for solo players!\r\n\r\n";
            text += "#L300#Take me to #bBlacksmith Taro#k (Henesys)#l\r\n";
            text += "#L301#Take me to #bAlchemist Luna#k (Ellinia)#l\r\n";
            text += "#L302#Take me to #bMaster Crafter Hephaestus#k (Perion)#l\r\n";
            text += "#L999#Back to main menu#l\r\n";
            cm.sendSimple(text);

        } else if (category === 3) {
            // Training & Combat
            var text = "#e#dTraining & Combat#k#n\r\n\r\n";
            text += "Get help with grinding and bossing:\r\n\r\n";
            text += "#e1. Professor Foxwit#n — #rHenesys#k & #rEllinia#k\r\n";
            text += "Monster Book Librarian. Shows best training maps for your level ";
            text += "and teleports you there. 8 level tiers with 24 spots!\r\n\r\n";
            text += "#e2. Scout Raven#n — #rPerion#k\r\n";
            text += "Monster intelligence specialist. Provides mob data and hunt tips.\r\n\r\n";
            text += "#e3. Arena Master Rex#n — #rHenesys#k\r\n";
            text += "Training advisor for combat strategies.\r\n\r\n";
            text += "#e4. Aria the Boss Hunter#n — #rLeafre#k\r\n";
            text += "Exchange boss drops (essences) for powerful reward items. ";
            text += "Defeat bosses like Zakum, Horntail, and Pink Bean to collect essences!\r\n\r\n";
            text += "#e5. Collection Challenges#n\r\n";
            text += "Visit #bWandering Collector Lena#k in #rHenesys#k for 5 themed ";
            text += "collection sets with escalating rewards.\r\n\r\n";
            text += "#L400#Take me to #bProfessor Foxwit#k (Henesys)#l\r\n";
            text += "#L401#Take me to #bAria the Boss Hunter#k (Leafre)#l\r\n";
            text += "#L999#Back to main menu#l\r\n";
            cm.sendSimple(text);

        } else if (category === 4) {
            // Character Growth
            var text = "#e#dCharacter Growth#k#n\r\n\r\n";
            text += "Power up your character:\r\n\r\n";
            text += "#e1. AP/SP Reset#n\r\n";
            text += "Visit #bCrystal Sage Yuki#k in #rEl Nath#k to reset your ";
            text += "Ability Points or Skill Points. Level-scaled pricing. 3 resets/day.\r\n\r\n";
            text += "#e2. Skill Books#n\r\n";
            text += "Talk to #bLibrarian Iris#k in #rEllinia#k for ALL 4th job mastery ";
            text += "books. ML20 costs 2M, ML30 costs 5M. All classes supported.\r\n\r\n";
            text += "#e3. Rebirth System#n\r\n";
            text += "At level 200, visit #bElder Chronos#k in #rLeafre#k to rebirth. ";
            text += "Reset to Lv1 but keep #e+5 all stats#n and #e+500 HP/MP#n permanently! ";
            text += "Up to 10 rebirths possible (+50 all stats, +5000 HP/MP).\r\n\r\n";
            text += "#e4. Quest Chain: The Lost Expedition#n\r\n";
            text += "Start with #bHistorian Elara#k in #rLith Harbor#k. A 5-stage quest ";
            text += "spanning all Victoria Island towns. Great rewards including Chaos Scrolls!\r\n\r\n";
            text += "#L500#Take me to #bCrystal Sage Yuki#k (El Nath)#l\r\n";
            text += "#L501#Take me to #bLibrarian Iris#k (Ellinia)#l\r\n";
            text += "#L502#Take me to #bElder Chronos#k (Leafre)#l\r\n";
            text += "#L503#Take me to #bHistorian Elara#k (Lith Harbor)#l\r\n";
            text += "#L999#Back to main menu#l\r\n";
            cm.sendSimple(text);

        } else if (category === 5) {
            // Travel & Transport
            var text = "#e#dTravel & Transport#k#n\r\n\r\n";
            text += "Get around the Maple World fast:\r\n\r\n";
            text += "#e1. Dimensional Mirror (Mira)#n\r\n";
            text += "Found in ALL Victoria Island towns (Henesys, Ellinia, Perion, ";
            text += "Kerning City, Lith Harbor). Teleports to any major town, training area, ";
            text += "or boss dungeon. Victoria towns are #bfree#k; distant destinations cost meso.\r\n\r\n";
            text += "#e2. Captain Flint#n — #rLith Harbor#k\r\n";
            text += "Ferry captain for sea routes.\r\n\r\n";
            text += "#e3. Professor Foxwit#n — #rHenesys#k & #rEllinia#k\r\n";
            text += "Teleports you directly to recommended training maps!\r\n\r\n";
            text += "#eTip:#n Return Scrolls (available from shops) instantly take you ";
            text += "to the nearest town. Stock up before grinding!\r\n\r\n";
            text += "#L600#Take me to #bMira#k (Henesys)#l\r\n";
            text += "#L999#Back to main menu#l\r\n";
            cm.sendSimple(text);

        } else if (category === 6) {
            // Custom Classes
            var text = "#e#dCustom Classes#k#n\r\n\r\n";
            text += "Cosmic features #e2 unique custom classes#n with original skills!\r\n\r\n";
            text += "#e1. Sage (Mage variant)#n\r\n";
            text += "Master the elements of fire, ice, and lightning.\r\n";
            text += "   - 1st Job: #bSage#k (Arcane Bolt, Mana Shield, Runic Strike)\r\n";
            text += "   - 2nd Job: #bElementalist#k (Flame Pillar, Frost Nova, Lightning Chain)\r\n";
            text += "   - 3rd Job: #bArcanum#k (Meteor Shower, Blizzard, Thunder Spear)\r\n";
            text += "   - 4th Job: #bArchsage#k (Primordial Inferno, Absolute Zero, Divine Thunder)\r\n";
            text += "32 unique skills with custom LoRA-generated visual effects!\r\n\r\n";
            text += "#e2. Necromancer (Dark Mage variant)#n\r\n";
            text += "Command the forces of death and undeath.\r\n";
            text += "   - 1st Job: #bNecromancer#k (Dark Bolt, Soul Drain, Bone Shield)\r\n";
            text += "   - 2nd Job: #bDark Acolyte#k (Corpse Explosion, Summon Skeleton)\r\n";
            text += "   - 3rd Job: #bSoul Reaper#k (Death Coil, Army of the Dead)\r\n";
            text += "   - 4th Job: #bLich King#k (Doom, Raise Lich, Soul Shatter)\r\n";
            text += "32 unique skills with custom visual effects!\r\n\r\n";
            text += "#eTo create a custom class#n, choose Magician at job advancement ";
            text += "and speak to the class NPC in their respective training grounds.\r\n\r\n";
            text += "#L999#Back to main menu#l\r\n";
            cm.sendSimple(text);

        } else if (category === 7) {
            // Server Info
            var text = "#e#dCosmic Server Info#k#n\r\n\r\n";
            text += "#eRates:#n\r\n";
            text += "   EXP: #b10x#k | Meso: #b10x#k | Drop: #b10x#k\r\n\r\n";
            text += "#eKey Features:#n\r\n";
            text += "   - Auto-register: Create accounts by logging in\r\n";
            text += "   - 3 channels available\r\n";
            text += "   - 2 custom classes (Sage & Necromancer)\r\n";
            text += "   - 20+ custom NPCs with unique features\r\n";
            text += "   - Daily challenges, mystery boxes, rebirth system\r\n";
            text += "   - Custom weapons and items\r\n";
            text += "   - AP/SP reset NPC\r\n";
            text += "   - Boss essence exchange system\r\n\r\n";
            text += "#eTips:#n\r\n";
            text += "   - Talk to #bMilestone Maven Celeste#k first for free level rewards!\r\n";
            text += "   - Visit #bCaptain Vega#k daily for challenge rewards\r\n";
            text += "   - Use #bMira#k (Dimensional Mirror) for fast travel\r\n";
            text += "   - Save meso early — rebirth costs 10M per reset!\r\n\r\n";
            text += "#L999#Back to main menu#l\r\n";
            cm.sendSimple(text);
        }

    } else if (status === 2) {
        // Handle teleport selections and back button
        sel = selection;

        if (selection === 999) {
            // Back to main menu
            status = -1;
            action(1, 0, 0);
            return;
        }

        // Map teleport destinations
        var warpDest = getWarpDestination(selection);

        if (warpDest !== null) {
            cm.sendYesNo("Warp to #b" + warpDest.name + "#k for #e5,000 meso#n?\r\n\r\n" +
                "#e(Free for players under level 30!)#n");
        } else {
            status = -1;
            action(1, 0, 0);
            return;
        }

    } else if (status === 3) {
        // Confirm warp (sendYesNo callback — mode=1 means Yes)
        var warpDest = getWarpDestination(sel);
        var cost = 5000;

        if (cm.getLevel() < 30) cost = 0;

        if (warpDest !== null) {
            if (cost > 0 && cm.getMeso() < cost) {
                cm.sendOk("You don't have enough meso! You need #b" + cost + " meso#k.");
            } else {
                if (cost > 0) cm.gainMeso(-cost);
                cm.warp(warpDest.map, 0);
            }
        }
        cm.dispose();
    }
}

function getWarpDestination(code) {
    switch (code) {
        case 100: return { map: 100000000, name: "Henesys (Celeste)" };
        case 101: return { map: 100000000, name: "Henesys (Prof. Foxwit)" };
        case 200: return { map: 100000000, name: "Henesys (Captain Vega)" };
        case 201: return { map: 103000000, name: "Kerning City (Shady Shane)" };
        case 202: return { map: 200000000, name: "Orbis (Zephyr)" };
        case 203: return { map: 100000000, name: "Henesys (Bounty Board Mika)" };
        case 300: return { map: 100000000, name: "Henesys (Blacksmith Taro)" };
        case 301: return { map: 101000000, name: "Ellinia (Alchemist Luna)" };
        case 302: return { map: 102000000, name: "Perion (Hephaestus)" };
        case 400: return { map: 100000000, name: "Henesys (Prof. Foxwit)" };
        case 401: return { map: 240000000, name: "Leafre (Aria)" };
        case 500: return { map: 211000000, name: "El Nath (Crystal Sage Yuki)" };
        case 501: return { map: 101000000, name: "Ellinia (Librarian Iris)" };
        case 502: return { map: 240000000, name: "Leafre (Elder Chronos)" };
        case 503: return { map: 104000000, name: "Lith Harbor (Historian Elara)" };
        case 600: return { map: 100000000, name: "Henesys (Mira)" };
        default: return null;
    }
}
