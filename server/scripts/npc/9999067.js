/**
 * NPC: Cosmic Oracle (9999067)
 * Location: Lith Harbor (104000000)
 * Type: Server Guide — introduces players to all custom Cosmic features
 *
 * Serves as a living wiki for the server's custom content:
 *   1. Custom Classes (Sage, Necromancer)
 *   2. Custom NPCs directory (buff shop, mystery boxes, daily challenges, etc.)
 *   3. Custom Weapons & how to get them
 *   4. Daily Systems (login rewards, challenges, mystery boxes)
 *   5. QoL Features (AP reset, training guide, buff service, skill books)
 *   6. Quest Chains (Lost Expedition, Collections)
 *
 * No cost, no limit — purely informational. A must-visit for new players.
 */

var status = -1;
var sel = -1;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1) { cm.dispose(); return; }
    if (mode === 0 && status <= 0) { cm.dispose(); return; }
    if (mode === 1) status++; else status--;

    if (status === 0) {
        cm.sendSimple(
            "#e#dCosmic Oracle#k#n\r\n\r\n" +
            "Welcome to #bCosmic MapleStory#k, adventurer! " +
            "This server has many unique features you won't find anywhere else.\r\n\r\n" +
            "What would you like to learn about?\r\n\r\n" +
            "#b#L0#Custom Classes (Sage & Necromancer)#l\r\n" +
            "#L1#Custom NPCs — Who & Where#l\r\n" +
            "#L2#Daily Systems (Rewards, Challenges, Mystery Boxes)#l\r\n" +
            "#L3#Quality of Life Features#l\r\n" +
            "#L4#Quest Chains & Adventures#l\r\n" +
            "#L5#Custom Weapons & Equipment#l\r\n" +
            "#L6#Server Rates & Info#l#k"
        );

    } else if (status === 1) {
        sel = selection;

        if (sel === 0) {
            cm.sendOk(
                "#e#dCosmic Oracle — Custom Classes#k#n\r\n\r\n" +
                "#e=== Sage (Job 600) ===#n\r\n" +
                "A powerful elemental caster who harnesses fire, ice, and lightning.\r\n" +
                "Advancement: Sage -> Elementalist -> Arcanum -> Archsage\r\n" +
                "Start: Talk to #bSage Instructor Elara#k in #rEllinia#k\r\n" +
                "Gear: #bArchivist Thessaly#k sells full Sage equipment\r\n\r\n" +
                "#e=== Necromancer (Job 700) ===#n\r\n" +
                "A dark summoner who commands the undead and drains life force.\r\n" +
                "Advancement: Necromancer -> Dark Acolyte -> Soul Reaper -> Lich King\r\n" +
                "Start: Talk to #bMordecai the Gravedigger#k in #rPerion#k\r\n" +
                "Gear: #bGrizelda the Bone Merchant#k sells Necromancer equipment\r\n\r\n" +
                "#dBoth classes have unique skill trees, dedicated training areas, " +
                "and custom sprites!#k"
            );

        } else if (sel === 1) {
            cm.sendOk(
                "#e#dCosmic Oracle — Custom NPC Directory#k#n\r\n\r\n" +
                "#e[Henesys]#n\r\n" +
                "  #bBrother Marcus#k — Stat buff service (STR/DEX/INT/LUK +15)\r\n" +
                "  #bStat Master Hiro#k — AP Reset (500K meso)\r\n" +
                "  #bExplorer's Guide Mira#k — Training map guide with warps\r\n" +
                "  #bFortune Keeper Navi#k — Daily login streak rewards\r\n" +
                "  #bChallenge Master Doran#k — Daily challenges for bonus rewards\r\n" +
                "  #bMystic Zara#k — Fortune telling & buff gambling\r\n" +
                "  #bWandering Collector Lena#k — Collection challenges\r\n" +
                "  #bBlacksmith Taro#k — Custom weapon merchant\r\n\r\n" +
                "#e[Ellinia]#n\r\n" +
                "  #bLibrarian Iris#k — 4th job mastery books for meso\r\n" +
                "  #bAlchemist Luna#k — Potion crafting\r\n\r\n" +
                "#e[Kerning City]#n\r\n" +
                "  #bShady Shane#k — Mystery Boxes (Bronze/Silver/Gold/Diamond)\r\n" +
                "  #bChef Momo#k — Food vendor\r\n\r\n" +
                "#e[Perion]#n\r\n" +
                "  #bScout Raven#k — Monster intelligence\r\n\r\n" +
                "#e[Lith Harbor]#n\r\n" +
                "  #bHistorian Elara#k — 'The Lost Expedition' quest chain\r\n" +
                "  #bCosmic Oracle#k — That's me!\r\n\r\n" +
                "#e[Leafre]#n\r\n" +
                "  #bAria the Boss Hunter#k — Boss Essence exchange"
            );

        } else if (sel === 2) {
            cm.sendOk(
                "#e#dCosmic Oracle — Daily Systems#k#n\r\n\r\n" +
                "#e1. Daily Login Rewards#n\r\n" +
                "Visit #bFortune Keeper Navi#k in Henesys every day.\r\n" +
                "Consecutive logins build a streak — day 7 gives a #bWhite Scroll#k!\r\n" +
                "Milestones at 10/30/50 total claims give bonus rewards.\r\n\r\n" +
                "#e2. Daily Challenges#n\r\n" +
                "Talk to #bChallenge Master Doran#k in Henesys.\r\n" +
                "3 challenges per day: Hunt, Collect, and Explore.\r\n" +
                "Scaled rewards based on your level.\r\n\r\n" +
                "#e3. Mystery Boxes#n\r\n" +
                "Find #bShady Shane#k in Kerning City.\r\n" +
                "4 tiers: Bronze (10K) / Silver (50K) / Gold (200K) / Diamond (1M)\r\n" +
                "Up to 10 boxes per day. Diamond can drop #bChaos Scrolls#k!\r\n\r\n" +
                "#e4. Buff Service#n\r\n" +
                "#bBrother Marcus#k in Henesys sells stat buffs (5 per day).\r\n" +
                "Great for solo players who need party buffs!\r\n\r\n" +
                "#dAll daily limits reset at midnight server time.#k"
            );

        } else if (sel === 3) {
            cm.sendOk(
                "#e#dCosmic Oracle — Quality of Life#k#n\r\n\r\n" +
                "#eAP Reset#n\r\n" +
                "#bStat Master Hiro#k in Henesys resets all your AP for 500K meso.\r\n" +
                "Misallocated stats? No problem! 3 resets per day.\r\n\r\n" +
                "#eTraining Guide#n\r\n" +
                "#bExplorer's Guide Mira#k in Henesys recommends maps by level\r\n" +
                "and warps you there for a fee. Covers Lv1-120+.\r\n\r\n" +
                "#eMastery Books#n\r\n" +
                "#bLibrarian Iris#k in Ellinia sells ALL 4th job skill books.\r\n" +
                "ML20: 2M meso | ML30: 5M meso. No more hunting!\r\n\r\n" +
                "#eCollection System#n\r\n" +
                "#bWandering Collector Lena#k in Henesys has themed collection\r\n" +
                "challenges from Lv10 to Lv70+ with great rewards.\r\n\r\n" +
                "#eBoss Essence Exchange#n\r\n" +
                "#bAria the Boss Hunter#k in Leafre trades boss drops\r\n" +
                "for powerful exclusive rewards."
            );

        } else if (sel === 4) {
            cm.sendOk(
                "#e#dCosmic Oracle — Quest Chains#k#n\r\n\r\n" +
                "#eThe Lost Expedition#n (by Historian Elara)\r\n" +
                "A 5-stage quest chain following Captain Voss's journal.\r\n" +
                "Travel: Henesys -> Ellinia -> Perion -> Kerning -> Sleepywood\r\n" +
                "Final reward: 200K EXP + 500K meso + Chaos Scroll 60%!\r\n" +
                "Start: Talk to #bHistorian Elara#k in #rLith Harbor#k.\r\n\r\n" +
                "#eCollection Challenges#n (by Wandering Collector Lena)\r\n" +
                "5 themed collection sets spanning Lv10-70+:\r\n" +
                "  Forest Forager -> Swamp Surveyor -> Fire & Ice\r\n" +
                "  -> Dark Expedition -> Master Naturalist\r\n" +
                "Start: Talk to #bWandering Collector Lena#k in #rHenesys#k.\r\n\r\n" +
                "#eSage Questline#n\r\n" +
                "Follow the path of elemental mastery through 4 job advancements.\r\n" +
                "Start: #bSage Instructor Elara#k in #rEllinia#k (Lv10+).\r\n\r\n" +
                "#eNecromancer Questline#n\r\n" +
                "Embrace the dark arts and command the undead.\r\n" +
                "Start: #bMordecai the Gravedigger#k in #rPerion#k (Lv10+)."
            );

        } else if (sel === 5) {
            cm.sendOk(
                "#e#dCosmic Oracle — Custom Weapons#k#n\r\n\r\n" +
                "Cosmic-exclusive weapons are available through:\r\n" +
                "  - #bShady Shane's#k Gold/Diamond Mystery Boxes\r\n" +
                "  - #bBlueprint Crafting#k system (class-specific blacksmiths)\r\n" +
                "  - Boss drops (rare)\r\n\r\n" +
                "#eCustom Weapons:#n\r\n" +
                "  #v1302134# #bCosmic Sword#k — Warriors\r\n" +
                "  #v1382081# #bCosmic Staff#k — Mages\r\n" +
                "  #v1452086# #bCosmic Bow#k — Bowmen\r\n" +
                "  #v1332100# #bCosmic Claw#k — Assassins\r\n" +
                "  #v1492049# #bCosmic Gun#k — Gunslingers\r\n" +
                "  #v1442104# #bCosmic Spear#k — Spearmen\r\n" +
                "  #v1472101# #bCosmic Knuckle#k — Brawlers\r\n" +
                "  #v1482047# #bCosmic Dagger#k — Bandits\r\n\r\n" +
                "#eBlueprintBlacksmiths:#n\r\n" +
                "  Warriors: #bGarvan the Ironsmith#k\r\n" +
                "  Mages: #bSera the Arcanist#k\r\n" +
                "  Bowmen: #bBrin the Fletchmaster#k\r\n" +
                "  Thieves: #bMara the Shadowsmith#k\r\n" +
                "  Pirates: #bCordell the Brawler#k\r\n" +
                "  Sages: #bYsolde the Lorekeeper#k\r\n" +
                "  Necromancers: #bOssifer Krell#k"
            );

        } else if (sel === 6) {
            cm.sendOk(
                "#e#dCosmic Oracle — Server Info#k#n\r\n\r\n" +
                "#eServer Rates:#n\r\n" +
                "  EXP: #b10x#k\r\n" +
                "  Meso: #b10x#k\r\n" +
                "  Drop: #b10x#k\r\n\r\n" +
                "#eFeatures:#n\r\n" +
                "  - Auto-register (create account on first login)\r\n" +
                "  - 2 custom classes: Sage & Necromancer\r\n" +
                "  - 20+ custom NPCs with unique services\r\n" +
                "  - Blueprint weapon crafting system\r\n" +
                "  - Daily login rewards with streak bonuses\r\n" +
                "  - Mystery Box gambling (4 tiers)\r\n" +
                "  - Boss Essence exchange system\r\n" +
                "  - AP Reset for meso (no cash shop needed)\r\n" +
                "  - All 4th job mastery books available for meso\r\n" +
                "  - Collection challenges across Victoria Island\r\n" +
                "  - Multi-stage quest chains\r\n\r\n" +
                "#dCosmic MapleStory — Your adventure starts here!#k"
            );
        }

        cm.dispose();
    }
}