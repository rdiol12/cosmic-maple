/*
 * NPC 9999046 — Vesper's Field Journal [Ellinia]
 * Location: Ellinia (101000000)
 *
 * Part of the Vesper Daily Challenge Explore system (Quest 99102).
 * Stores today's date-stamp (YYYYMMDD) in progress var 3.
 *
 * Progress tracking (Quest 99102):
 *   var 2 = YYYYMMDD for Henesys
 *   var 3 = YYYYMMDD when Ellinia was confirmed (or "" if not yet)
 *   var 4 = YYYYMMDD for Perion
 */

/* global cm, java */

var Q_EXPLORE = 99202; // 99102 is taken by Mushroom Harvest standalone quest
var STOP_IDX  = 3; // Ellinia = progress var index 3
var TOWN_NAME = "Ellinia";

function getTodayStamp() {
    var cal = java.util.Calendar.getInstance();
    var y = cal.get(java.util.Calendar.YEAR);
    var m = cal.get(java.util.Calendar.MONTH) + 1;
    var d = cal.get(java.util.Calendar.DAY_OF_MONTH);
    return "" + y + (m < 10 ? "0" : "") + m + (d < 10 ? "0" : "") + d;
}

function start() {
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode < 1) {
        cm.dispose();
        return;
    }

    if (!cm.isQuestStarted(Q_EXPLORE)) {
        cm.sendOk(
            "#b[Vesper's Field Journal — " + TOWN_NAME + "]#k\r\n\r\n" +
            "*A small journal pinned to an ancient oak, stamped with Vesper's cartographer's crest*\r\n\r\n" +
            "\"Daily Expedition Waypoint — " + TOWN_NAME + "\"\r\n\r\n" +
            "This is one of Vesper's regional check-in points. Accept her #bExplore Challenge#k " +
            "at the Adventure Board in Henesys to activate it."
        );
        cm.dispose();
        return;
    }

    var today = getTodayStamp();
    var stampedToday = cm.getQuestProgress(Q_EXPLORE, STOP_IDX) === today;

    if (stampedToday) {
        cm.sendOk(
            "#b[Vesper's Field Journal — " + TOWN_NAME + "]#k\r\n\r\n" +
            "*A green stamp marks today's entry: CONFIRMED*\r\n\r\n" +
            "Your visit to " + TOWN_NAME + " has already been logged today. " +
            "Visit Henesys and Perion, then return to Vesper to claim your reward!"
        );
    } else {
        cm.setQuestProgress(Q_EXPLORE, STOP_IDX, today);
        cm.sendOk(
            "#b[Vesper's Field Journal — " + TOWN_NAME + "]#k\r\n\r\n" +
            "*You trace Vesper's stamp onto the moss-covered page — the ink glows faintly*\r\n\r\n" +
            "#g" + TOWN_NAME + " — CONFIRMED!#k\r\n\r\n" +
            "Your presence in the magical forests of " + TOWN_NAME + " has been logged. " +
            "Visit the Field Journals in #bHenesys#k and #bPerion#k, then return to Vesper!"
        );
    }
    cm.dispose();
}
