/**
 * 9999021.js — Crypt Warden Moros
 * Entrance NPC for Shadow Crypts dungeon (map 261090000).
 * Dark, foreboding gatekeeper who warns players about the dungeon.
 */
var status = -1;

function start() {
  status = -1;
  action(1, 0, 0);
}

function action(mode, type, selection) {
  if (mode === -1) {
    cm.dispose();
    return;
  }

  if (mode === 0 && type > 0) {
    cm.dispose();
    return;
  }

  status++;

  if (status === 0) {
    var lines = [
      "... You should not have come here, mortal.",
      "I am #bMoros#k, warden of the Shadow Crypts.",
      "Centuries ago, the alchemists of Magatia uncovered this crypt.",
      "What they found... consumed them.",
      "\nThe crypts stretch deep beneath the desert sands:",
      "  #r[ Forsaken Entrance ]#k — Levels 78-85. Ghost Pirates and Lycanthropes patrol.",
      "  #r[ Hall of Whispers ]#k — Levels 83-90. Dual Ghost Pirates and Death Teddies.",
      "  #r[ Abyssal Corridor ]#k — Levels 88-95. Phantom Watches and Bain guard the path.",
      "  #r[ Throne of Shadows ]#k — Levels 95-100. The Grim Phantom Watch awaits.",
      "\nOnly those above level 78 should dare enter. The shadows show no mercy."
    ];
    cm.sendNext(lines.join("\n"));
  } else if (status === 1) {
    var menu = "#b#L0# Tell me about the Throne of Shadows#l\n#L1# What treasures lie within?#l\n#L2# I fear nothing. Farewell.#l";
    cm.sendSimple("What knowledge do you seek?\n\n" + menu);
  } else if (status === 2) {
    if (selection === 0) {
      cm.sendNext(
        "The Throne of Shadows is the heart of this cursed place.\n\n" +
        "A creature called the #rGrim Phantom Watch#k sits upon the throne of bones. " +
        "It was once a great alchemist, twisted by forbidden experiments.\n\n" +
        "Its gaze alone can freeze your soul. Bring your strongest allies."
      );
    } else if (selection === 1) {
      cm.sendNext(
        "The undead within hoard ancient relics and dark essences.\n\n" +
        "#b[ Ghost Pirate ]#k — Drops Shadow Essence, Pirate's Cursed Coin\n" +
        "#b[ Lycanthrope ]#k — Drops Dark Pelt, Lycan Fang\n" +
        "#b[ Death Teddy ]#k — Drops Cursed Stuffing, Shadow Thread\n" +
        "#b[ Phantom Watch ]#k — Drops Phantom's Eye, Temporal Shard\n" +
        "#b[ Grim Phantom Watch ]#k — Drops Grim Reaper's Pendant, Abyssal Core\n\n" +
        "Collect #rShadow Essences#k and bring them to me for a reward."
      );
    } else {
      cm.sendOk("Then go, fool. The shadows will claim you soon enough.");
    }
    cm.dispose();
  } else {
    cm.dispose();
  }
}
