/* Blacksmith Taro - Henesys Weapon Merchant (NPC 9999001)
 * Location: Henesys (100000000)
 *
 * Sells beginner weapons via shop ID 9001.
 * Fixed: "Browse wares" now correctly opens the shop instead of just showing text.
 */
var status = 0;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    status++;

    if (status == 0) {
        cm.sendSimple("Welcome, brave adventurer! I am Blacksmith Taro, purveyor of fine weapons.\r\n#L0#Browse my wares#l\r\n#L1#Tell me about yourself#l\r\n#L2#Goodbye#l");
    } else if (status == 1) {
        if (selection == 0) {
            // Open shop with beginner weapons
            cm.openShop(9001);
            cm.dispose();
        } else if (selection == 1) {
            cm.sendNext("I am Blacksmith Taro, master of forge and flame. For years I have crafted weapons for Henesys. A warrior is only as strong as their blade - let me help you find the perfect weapon to begin your journey!");
            cm.dispose();
        } else if (selection == 2) {
            cm.sendNext("Safe travels, adventurer! May fortune favor your path!");
            cm.dispose();
        }
    }
}
