/**
 * 9999020.js — Frost Warden Kira
 * Entrance NPC for Frozen Caverns dungeon (map 211090000).
 * Gives info about the dungeon and offers the entry quest.
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
      "You have found the Frozen Caverns, traveler.",
      "These icy depths were sealed long ago after something ancient stirred within.",
      "I am Kira — sworn to guard this entrance and turn back the unprepared.",
      "\nThe caverns are split into three zones:",
      "  #b[ Entrance Cave ]#k — Levels 35-45. Cold Eye and Leatty roam freely.",
      "  #b[ Frozen Halls ]#k — Levels 42-50. Jr. Yetis and Hectors lurk in the dark.",
      "  #b[ Ice Chamber ]#k  — Levels 48-60. The beast at the heart of the frost.",
      "\nBring warm gear. The cold saps your strength. Are you ready to enter?"
    ];
    cm.sendNext(lines.join("\n"));
  } else if (status === 1) {
    var menu = "#b#L0# Tell me about the Ice Chamber#l\n#L1# What rewards await inside?#l\n#L2# I need nothing. Farewell.#l";
    cm.sendSimple("What would you like to know?\r\n\r\n" + menu);
  } else if (status === 2) {
    if (selection === 0) {
      cm.sendNext(
        "The Ice Chamber is the deepest point of the Frozen Caverns.\n\n" +
        "A creature called the #bGlacial Overlord#k slumbers there. " +
        "No one who has faced it has returned to speak of it... yet.\n\n" +
        "Defeat it, and the caverns will be yours to claim."
      );
    } else if (selection === 1) {
      cm.sendNext(
        "The creatures inside carry rare icy essences and crafting materials.\n\n" +
        "#b[ Cold Eye ]#k — Drops Icy Orb, Frost Crystal, Cold Eye Lens\n" +
        "#b[ Jr. Yeti ]#k — Drops Yeti Pelt, Frozen Shard\n" +
        "#b[ Hector ]#k — Drops Hector's Fang, Glacial Core\n" +
        "#b[ White Fang ]#k — Drops White Fur, Frostbite Essence\n\n" +
        "Collect #bFrost Crystals#k and bring them to me for a special reward."
      );
    } else {
      cm.sendOk("Stay warm out there, traveler. The frost shows no mercy.");
    }
    cm.dispose();
  } else {
    cm.dispose();
  }
}
