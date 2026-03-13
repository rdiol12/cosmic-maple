/*
	This file is part of the OdinMS Maple Story Server
    Copyright (C) 2008 Patrick Huy <patrick.huy@frz.cc>
		       Matthias Butz <matze@odinms.de>
		       Jan Christian Meyer <vimes@odinms.de>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation version 3 as published by
    the Free Software Foundation. You may not use, modify or distribute
    this program under any other version of the GNU Affero General Public
    License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package client.processor.npc;

import client.Character;
import client.Client;
import client.autoban.AutobanFactory;
import client.inventory.Inventory;
import client.inventory.InventoryType;
import client.inventory.Item;
import client.inventory.manipulator.InventoryManipulator;
import client.inventory.manipulator.KarmaManipulator;
import config.YamlConfig;
import constants.id.ItemId;
import constants.inventory.ItemConstants;
import net.packet.InPacket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import server.ItemInformationProvider;
import server.Storage;
import tools.PacketCreator;

/**
 * @author Matze
 * @author Ronan - inventory concurrency protection on storing items
 */
public class StorageProcessor {
    private static final Logger log = LoggerFactory.getLogger(StorageProcessor.class);

    public static void storageAction(InPacket p, Client c) {
        ItemInformationProvider ii = ItemInformationProvider.getInstance();
        Character chr = c.getPlayer();

        byte mode = p.readByte();

        // Check if GM is viewing a bot's inventory via storage UI
        server.life.BotManager bm = server.life.BotManager.getInstance();
        if (bm.isViewingBot(chr.getId())) {
            handleBotStorageAction(p, c, chr, bm, mode);
            return;
        }

        Storage storage = chr.getStorage();
        String gmBlockedStorageMessage = "You cannot use the storage as a GM of this level.";

        if (chr.getLevel() < 15) {
            chr.dropMessage(1, "You may only use the storage once you have reached level 15.");
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        if (c.tryacquireClient()) {
            try {
                switch (mode) {
                case 4: { // Take out
                    byte type = p.readByte();
                    byte slot = p.readByte();
                    if (slot < 0 || slot > storage.getSlots()) { // removal starts at zero
                        AutobanFactory.PACKET_EDIT.alert(c.getPlayer(), c.getPlayer().getName() + " tried to packet edit with storage.");
                        log.warn("Chr {} tried to work with storage slot {}", c.getPlayer().getName(), slot);
                        c.disconnect(true, false);
                        return;
                    }

                    slot = storage.getSlot(InventoryType.getByType(type), slot);
                    Item item = storage.getItem(slot);

                    if (hasGMRestrictions(chr)) {
                        chr.dropMessage(1, gmBlockedStorageMessage);
                        log.info(String.format("GM %s blocked from using storage", chr.getName()));
                        chr.sendPacket(PacketCreator.enableActions());
                        return;
                    }

                    if (item != null) {
                        if (ii.isPickupRestricted(item.getItemId()) && chr.haveItemWithId(item.getItemId(), true)) {
                            c.sendPacket(PacketCreator.getStorageError((byte) 0x0C));
                            return;
                        }

                        int takeoutFee = storage.getTakeOutFee();
                        if (chr.getMeso() < takeoutFee) {
                            c.sendPacket(PacketCreator.getStorageError((byte) 0x0B));
                            return;
                        } else {
                            chr.gainMeso(-takeoutFee, false);
                        }

                        if (InventoryManipulator.checkSpace(c, item.getItemId(), item.getQuantity(), item.getOwner())) {
                            if (storage.takeOut(item)) {
                                chr.setUsedStorage();

                                KarmaManipulator.toggleKarmaFlagToUntradeable(item);
                                InventoryManipulator.addFromDrop(c, item, false);

                                String itemName = ii.getName(item.getItemId());
                                log.debug("Chr {} took out {}x {} ({})", c.getPlayer().getName(), item.getQuantity(), itemName, item.getItemId());

                                storage.sendTakenOut(c, item.getInventoryType());
                            } else {
                                c.sendPacket(PacketCreator.enableActions());
                                return;
                            }
                        } else {
                            c.sendPacket(PacketCreator.getStorageError((byte) 0x0A));
                        }
                    }
                    break;
                }
                case 5: { // Store
                    short slot = p.readShort();
                    int itemId = p.readInt();
                    short quantity = p.readShort();
                    InventoryType invType = ItemConstants.getInventoryType(itemId);
                    Inventory inv = chr.getInventory(invType);
                    if (slot < 1 || slot > inv.getSlotLimit()) { // player inv starts at one
                        AutobanFactory.PACKET_EDIT.alert(c.getPlayer(),
                                c.getPlayer().getName() + " tried to packet edit with storage.");
                        log.warn("Chr {} tried to store item at slot {}", c.getPlayer().getName(), slot);
                        c.disconnect(true, false);
                        return;
                    }

                    if (hasGMRestrictions(chr)) {
                        chr.dropMessage(1, gmBlockedStorageMessage);
                        log.info(String.format("GM %s blocked from using storage", chr.getName()));
                        chr.sendPacket(PacketCreator.enableActions());
                        return;
                    }

                    if (quantity < 1) {
                        c.sendPacket(PacketCreator.enableActions());
                        return;
                    }
                    if (storage.isFull()) {
                        c.sendPacket(PacketCreator.getStorageError((byte) 0x11));
                        return;
                    }
                    int storeFee = storage.getStoreFee();
                    if (chr.getMeso() < storeFee) {
                        c.sendPacket(PacketCreator.getStorageError((byte) 0x0B));
                    } else {
                        Item item;

                        inv.lockInventory(); // thanks imbee for pointing a dupe within storage
                        try {
                            item = inv.getItem(slot);
                            if (item != null && item.getItemId() == itemId
                                    && (item.getQuantity() >= quantity || ItemConstants.isRechargeable(itemId))) {
                                if (ItemId.isWeddingRing(itemId) || ItemId.isWeddingToken(itemId)) {
                                    c.sendPacket(PacketCreator.enableActions());
                                    return;
                                }

                                if (ItemConstants.isRechargeable(itemId)) {
                                    quantity = item.getQuantity();
                                }

                                InventoryManipulator.removeFromSlot(c, invType, slot, quantity, false);
                            } else {
                                c.sendPacket(PacketCreator.enableActions());
                                return;
                            }

                            item = item.copy(); // thanks Robin Schulz & BHB88 for noticing a inventory glitch when storing items
                        } finally {
                            inv.unlockInventory();
                        }

                        chr.gainMeso(-storeFee, false, true, false);

                        KarmaManipulator.toggleKarmaFlagToUntradeable(item);
                        item.setQuantity(quantity);

                        storage.store(item); // inside a critical section, "!(storage.isFull())" is still in effect...
                        chr.setUsedStorage();

                        String itemName = ii.getName(item.getItemId());
                        log.debug("Chr {} stored {}x {} ({})", c.getPlayer().getName(), item.getQuantity(), itemName, item.getItemId());
                        storage.sendStored(c, ItemConstants.getInventoryType(itemId));
                    }
                    break;
                }
                case 6: // Arrange items
                    if (YamlConfig.config.server.USE_STORAGE_ITEM_SORT) {
                        storage.arrangeItems(c);
                    }
                    c.sendPacket(PacketCreator.enableActions());
                    break;
                case 7: { // Mesos
                    int meso = p.readInt();
                    int storageMesos = storage.getMeso();
                    int playerMesos = chr.getMeso();

                    if (hasGMRestrictions(chr)) {
                        chr.dropMessage(1, gmBlockedStorageMessage);
                        log.info(String.format("GM %s blocked from using storage", chr.getName()));
                        chr.sendPacket(PacketCreator.enableActions());
                        return;
                    }

                    if ((meso > 0 && storageMesos >= meso) || (meso < 0 && playerMesos >= -meso)) {
                        if (meso < 0 && (storageMesos - meso) < 0) {
                            meso = Integer.MIN_VALUE + storageMesos;
                            if (meso < playerMesos) {
                                c.sendPacket(PacketCreator.enableActions());
                                return;
                            }
                        } else if (meso > 0 && (playerMesos + meso) < 0) {
                            meso = Integer.MAX_VALUE - playerMesos;
                            if (meso > storageMesos) {
                                c.sendPacket(PacketCreator.enableActions());
                                return;
                            }
                        }
                        storage.setMeso(storageMesos - meso);
                        chr.gainMeso(meso, false, true, false);
                        chr.setUsedStorage();
                        log.debug("Chr {} {} {} mesos", c.getPlayer().getName(), meso > 0 ? "took out" : "stored", Math.abs(meso));
                        storage.sendMeso(c);
                    } else {
                        c.sendPacket(PacketCreator.enableActions());
                        return;
                    }
                    break;
                }
                case 8: // Close (unless the player decides to enter cash shop)
                    storage.close();
                    break;
                }
            } finally {
                c.releaseClient();
            }
        }
    }

    private static boolean hasGMRestrictions(Character character) {
        return character.isGM() && character.gmLevel() < YamlConfig.config.server.MINIMUM_GM_LEVEL_TO_USE_STORAGE;
    }

    /**
     * Handle storage UI actions when a GM is viewing a bot's inventory.
     * Mode 4 = take item from bot → GM's inventory
     * Mode 5 = give item from GM → bot's inventory
     * Mode 8 = close
     */
    private static void handleBotStorageAction(InPacket p, Client c, Character gm,
                                                server.life.BotManager bm, byte mode) {
        Character bot = bm.getViewedBot(gm.getId());
        if (bot == null) {
            bm.stopViewingBot(gm.getId());
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        ItemInformationProvider ii = ItemInformationProvider.getInstance();

        switch (mode) {
            case 4: { // Take out from bot → GM inventory
                byte type = p.readByte();
                byte slot = p.readByte();

                // Collect the bot's items in storage order to find the right one
                java.util.List<Item> botItems = bm.collectBotItems(bot);
                InventoryType targetType = InventoryType.getByType(type);

                // Filter to matching type — equipped items (EQUIPPED) show under EQUIP tab
                java.util.List<Item> typeItems = new java.util.ArrayList<>();
                for (Item item : botItems) {
                    InventoryType displayType = item.getInventoryType();
                    if (displayType == InventoryType.EQUIPPED) displayType = InventoryType.EQUIP;
                    if (displayType == targetType) {
                        typeItems.add(item);
                    }
                }

                if (slot < 0 || slot >= typeItems.size()) {
                    c.sendPacket(PacketCreator.enableActions());
                    return;
                }

                Item item = typeItems.get(slot);

                // Check GM has space
                if (!InventoryManipulator.checkSpace(c, item.getItemId(), item.getQuantity(), item.getOwner())) {
                    c.sendPacket(PacketCreator.getStorageError((byte) 0x0A));
                    return;
                }

                // Remove from bot's actual inventory (equipped items have negative positions)
                short botSlot = item.getPosition();
                InventoryType botInvType = botSlot < 0 ? InventoryType.EQUIPPED : item.getInventoryType();
                Inventory botInv = bot.getInventory(botInvType);
                botInv.removeSlot(botSlot);

                // Give to GM
                InventoryManipulator.addFromDrop(c, item, false);

                String itemName = ii.getName(item.getItemId());
                gm.dropMessage(5, "[Bot] Took " + (itemName != null ? itemName : "item") + " from " + bot.getName());

                // Update bot appearance if it was equipped
                if (botInvType == InventoryType.EQUIPPED && bot.getMap() != null) {
                    try {
                        bot.getMap().broadcastMessage(PacketCreator.updateCharLook(c, bot));
                    } catch (Exception ignored) {}
                }

                // Refresh the storage UI with updated bot items
                java.util.List<Item> updatedItems = bm.collectBotItems(bot);
                java.util.List<Item> updatedTypeItems = new java.util.ArrayList<>();
                for (Item i : updatedItems) {
                    InventoryType dt = i.getInventoryType();
                    if (dt == InventoryType.EQUIPPED) dt = InventoryType.EQUIP;
                    if (dt == targetType) {
                        updatedTypeItems.add(i);
                    }
                }
                byte slots = (byte) Math.max(updatedItems.size() + 10, 48);
                c.sendPacket(PacketCreator.takeOutStorage(slots, targetType, updatedTypeItems));
                break;
            }
            case 5: { // Store: give item from GM → bot inventory
                short slot = p.readShort();
                int itemId = p.readInt();
                short quantity = p.readShort();
                InventoryType invType = ItemConstants.getInventoryType(itemId);
                Inventory gmInv = gm.getInventory(invType);

                if (slot < 1 || slot > gmInv.getSlotLimit()) {
                    c.sendPacket(PacketCreator.enableActions());
                    return;
                }

                Item gmItem = gmInv.getItem(slot);
                if (gmItem == null || gmItem.getItemId() != itemId) {
                    c.sendPacket(PacketCreator.enableActions());
                    return;
                }

                if (quantity < 1) {
                    c.sendPacket(PacketCreator.enableActions());
                    return;
                }

                // Check bot has space
                Inventory botInv = bot.getInventory(invType);
                short freeSlot = botInv.getNextFreeSlot();
                if (freeSlot < 0) {
                    gm.dropMessage(5, "[Bot] " + bot.getName() + "'s inventory is full!");
                    c.sendPacket(PacketCreator.enableActions());
                    return;
                }

                // Remove from GM
                short actualQty = (short) Math.min(quantity, gmItem.getQuantity());
                Item givenItem = gmItem.copy();
                givenItem.setQuantity(actualQty);
                InventoryManipulator.removeFromSlot(c, invType, slot, actualQty, false);

                // Add to bot
                givenItem.setPosition(freeSlot);
                botInv.addItemFromDB(givenItem);

                String itemName = ii.getName(itemId);
                gm.dropMessage(5, "[Bot] Gave " + (itemName != null ? itemName : "item") + " x" + actualQty + " to " + bot.getName());

                // Refresh storage UI
                java.util.List<Item> updatedItems = bm.collectBotItems(bot);
                java.util.List<Item> updatedTypeItems = new java.util.ArrayList<>();
                for (Item i : updatedItems) {
                    if (i.getInventoryType() == invType) {
                        updatedTypeItems.add(i);
                    }
                }
                byte slots = (byte) Math.max(updatedItems.size() + 10, 48);
                c.sendPacket(PacketCreator.storeStorage(slots, invType, updatedTypeItems));
                break;
            }
            case 8: // Close
                bm.stopViewingBot(gm.getId());
                break;
            default:
                c.sendPacket(PacketCreator.enableActions());
                break;
        }
    }
}
