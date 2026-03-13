/* NPC 9999011: Guide Mira — Cosmic Content Guide
 * Location: Henesys (100000000)
 * Purpose: Tells players about all custom content on this server.
 * Created by: modules/maplestory (Phase 2 deployment)
 */
var status = -1;
var selection = -1;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, sel) {
    if (mode == -1) {
        cm.dispose();
        return;
    }
    if (mode == 0 && type > 0) {
        cm.dispose();
        return;
    }

    if (status == -1 || (mode == 0 && status == 1)) {
        // Reset to main menu
        status = 0;
        selection = -1;
        cm.sendSimple(
            "Welcome, adventurer! I'm #bGuide Mira#k, your source for info about this Cosmic v83 server.\n\n" +
            "What would you like to know?\n\n" +
            "#L0# \uD83D\uDCCC Custom NPCs — shops and services#l\n" +
            "#L1# \u2694\uFE0F Custom weapons by job class#l\n" +
            "#L2# \uD83E\uDDEA Custom consumable items and buffs#l\n" +
            "#L3# \uD83D\uDCDC Custom quests and rewards#l\n" +
            "#L4# \uD83D\uDC80 Custom monster drops#l\n" +
            "#L5# \uD83C\uDF1F Server rates and events#l\n" +
            "#L6# \u2694\uFE0F Skill rebalances (what's buffed)#l"
        );
        return;
    }

    if (status == 0) {
        selection = sel;
        status = 1;

        if (selection == 0) {
            cm.sendNextPrev(
                "#bCustom NPCs on Cosmic v83:#k\n\n" +
                "#r[ Henesys - 100000000 ]#k\n" +
                "  Blacksmith Taro (9999001) — Job-specific weapon shop\n" +
                "  Arena Master Rex (9999006) — Training advisor + map warps\n" +
                "  Nurse Joy (9999009) — Free HP/MP heal, clinic supplies\n" +
                "  Challenge Master Doran (9999056) — Daily challenges + tiered rewards\n" +
                "  Mystic Zara (9999057) — Fortune reading + Cosmic Gamble (meso sink)\n" +
                "  Pathfinder Yuki (9999058) — Training spot recommendations\n\n" +
                "#r[ Ellinia - 101000000 ]#k\n" +
                "  Alchemist Luna (9999002) — Potion shop\n" +
                "  Gem Trader Safi (9999007) — Ore buyer + crystal seller\n\n" +
                "#r[ Perion - 102000000 ]#k\n" +
                "  Scout Raven (9999003) — Monster intel + quest giver\n" +
                "  Treasure Hunter Kai (9999010) — Drop exchange shop\n\n" +
                "#r[ Kerning City - 103000000 ]#k\n" +
                "  Chef Momo (9999004) — Stat-boosting food vendor\n\n" +
                "#r[ Lith Harbor - 104000000 ]#k\n" +
                "  Old Man Kazuki (9999005) — Lore + one-time starter kit\n" +
                "  Captain Flint (9999008) — Inter-town ferry transport"
            );
        } else if (selection == 1) {
            cm.sendNextPrev(
                "#bCustom Weapons (one per job class):#k\n\n" +
                "  #bCrystal Fang#k (ID 1302134) — Warrior 1H Sword | Stumpy drops 1%\n" +
                "  #bPhoenix Staff#k (ID 1382081) — Magician Staff\n" +
                "  #bWind Piercer#k (ID 1452086) — Bowman Bow | Curse Eye drops 0.5%\n" +
                "  #bShadow Fang#k (ID 1332100) — Thief Dagger | Ligator drops 0.5%\n" +
                "  #bThunder Barrel#k (ID 1492049) — Pirate Gun\n" +
                "  #bEarth Cleaver#k (ID 1442104) — Warrior Polearm\n" +
                "  #bVenom Claw#k (ID 1472101) — Thief Claw\n" +
                "  #bIron Fist#k (ID 1482047) — Pirate Knuckle\n\n" +
                "#eTip:#k Buy starter versions from Blacksmith Taro in Henesys.\n" +
                "Rare drops from Stumpy, Curse Eye, and Ligator!"
            );
        } else if (selection == 2) {
            cm.sendNextPrev(
                "#bCustom Consumable Items:#k\n\n" +
                "#r[ Timed Buffs ]#k\n" +
                "  Elixir of Rage (2002031) — Weapon ATK +10 for 3 minutes\n" +
                "  Mana Crystal (2002032) — Magic ATK +10 for 3 minutes\n" +
                "  Iron Shield Scroll (2002033) — Weapon DEF +15 for 5 minutes\n" +
                "  Swift Boots Potion (2002034) — Speed +20 for 2 minutes\n" +
                "  Lucky Clover (2002035) — ACC + Avoidability +15 for 5 minutes\n\n" +
                "#r[ Recovery ]#k\n" +
                "  Giant's Meat (2002036) — Instantly restores 800 HP\n" +
                "  Sage Tea (2002037) — Instantly restores 600 MP\n\n" +
                "#r[ Utility ]#k\n" +
                "  Return Scroll (2030021) — Teleports you to Henesys\n\n" +
                "#eTip:#k These drop from custom mobs. Ask me about drops (option 4)!"
            );
        } else if (selection == 3) {
            cm.sendNextPrev(
                "#bCustom Quests:#k\n\n" +
                "#bMushroom Menace#k [Q.99001 — Scout Raven, Perion]\n" +
                "  Collect 30 Orange Mushroom Caps\n" +
                "  Reward: 5000 EXP + 3x Iron Shield Scroll\n\n" +
                "#bPotion Ingredients#k [Q.99002 — Alchemist Luna, Ellinia]\n" +
                "  Collect 20 Mushroom Spores + 10 Blue Snail Shells\n" +
                "  Reward: 3000 EXP + 10x Elixir of Rage\n\n" +
                "#bLost Treasure Map#k [Q.99003 — Captain Flint, Lith Harbor]\n" +
                "  Collect 5 Jr. Necki Furs\n" +
                "  Reward: 4000 EXP + 50,000 meso + 3x Return Scroll\n\n" +
                "#bArena Challenge#k [Q.99004 — Arena Master Rex, Henesys]\n" +
                "  Collect 30 Pig's Heads\n" +
                "  Reward: 3000 EXP + 5x Lucky Clover\n\n" +
                "#bBlacksmith's Request#k [Q.99005 — Blacksmith Taro, Henesys]\n" +
                "  Collect 30 Steel Ores\n" +
                "  Reward: 5000 EXP + Crystal Fang (custom weapon!)"
            );
        } else if (selection == 4) {
            cm.sendNextPrev(
                "#bCustom Monster Drops:#k\n\n" +
                "#r[ Easy Mobs ]#k\n" +
                "  Snail / Blue Snail / Slime — Return Scroll 0.5-1%\n" +
                "  Green Mushroom — Elixir of Rage 5%\n" +
                "  Pig — Swift Boots Potion 6%\n" +
                "  Orange Mushroom — Elixir of Rage 8%\n" +
                "  Axe Stump — Sage Tea 8%\n\n" +
                "#r[ Medium Mobs ]#k\n" +
                "  Jr. Necki — Lucky Clover 3%, Return Scroll 5%\n" +
                "  Horny Mushroom — Mana Crystal 5%, Iron Shield Scroll 4%\n" +
                "  Zombie Mushroom — Mana Crystal 6%, Sage Tea 7%\n\n" +
                "#r[ Strong Mobs (Rare Weapon Drops!) ]#k\n" +
                "  Fire Boar — Elixir of Rage 8%, Giant's Meat 10%\n" +
                "  Curse Eye — Lucky Clover 5%, Wind Piercer 0.5%\n" +
                "  Ligator — Iron Shield Scroll 5%, Shadow Fang 0.5%\n" +
                "  Stumpy — Giant's Meat 15%, Lucky Clover 8%, Crystal Fang 1%"
            );
        } else if (selection == 5) {
            cm.sendNextPrev(
                "#bServer Rates and Events:#k\n\n" +
                "#r[ Base Rates ]#k\n" +
                "  EXP Rate: 10x\n" +
                "  Drop Rate: 5x\n" +
                "  Meso Rate: 5x\n\n" +
                "#r[ Server Events (triggered by GMs) ]#k\n" +
                "  #bCosmic EXP Weekend#k — EXP boosted to 20x for duration\n" +
                "  #bCosmic Drop Fest#k — Drop rate boosted to 10x for duration\n" +
                "  #bCosmic Gold Rush#k — Meso rate boosted to 10x for duration\n\n" +
                "#eTip:#k Events are announced with an orange server message.\n" +
                "All events are reversible — check back after they end!"
            );
        } else if (selection == 6) {
            cm.sendNextPrev(
                "#bSkill Rebalances on Cosmic:#k\n\n" +
                "#bRage#k [Warrior - Fighter]\n" +
                "  The pdd penalty has been REMOVED. Now a clean ATK buff!\n\n" +
                "#bCold Beam#k [IL Magician - IL Wizard]\n" +
                "  +20 Magic ATK all levels.\n" +
                "  Freeze extended: lv1-15 = 2s, lv16-30 = 4s\n\n" +
                "#bArrow Bomb#k [Bowman - Hunter]\n" +
                "  +20 damage all levels, +10% stun chance (max 90%)\n\n" +
                "#bDouble Stab#k [Thief - Rogue]\n" +
                "  +20 damage all levels, -2 MP cost all levels (min 5)\n\n" +
                "#bBackspin Blow#k [Pirate - Brawler]\n" +
                "  +30 damage all levels, -4 MP cost all levels (min 8)"
            );
        } else {
            cm.dispose();
            return;
        }
        return;
    }

    if (status == 1) {
        // After reading a section, go back to main menu
        status = -1;
        action(1, 0, -1);
    }
}
