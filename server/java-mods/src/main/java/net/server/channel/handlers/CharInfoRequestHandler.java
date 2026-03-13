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
package net.server.channel.handlers;

import client.Character;
import client.Client;
import client.inventory.Item;
import net.AbstractPacketHandler;
import net.packet.InPacket;
import server.life.BotManager;
import server.maps.MapObject;
import tools.PacketCreator;

import java.util.List;

public final class CharInfoRequestHandler extends AbstractPacketHandler {

    @Override
    public final void handlePacket(InPacket p, Client c) {
        p.skip(4);
        int cid = p.readInt();
        MapObject target = c.getPlayer().getMap().getMapObject(cid);
        if (target != null) {
            if (target instanceof Character player) {
                BotManager bm = BotManager.getInstance();

                // GM clicking on a bot → open bot inventory UI (storage-style)
                if (bm.isBot(player.getId()) && c.getPlayer().gmLevel() >= 2) {
                    openBotInventory(c, player, bm);
                    return;
                }

                if (c.getPlayer().getId() != player.getId()) {
                    player.exportExcludedItems(c);
                }
                c.sendPacket(PacketCreator.charInfo(player));
            }
        }
    }

    private void openBotInventory(Client c, Character bot, BotManager bm) {
        Character gm = c.getPlayer();

        // Track that this GM is viewing this bot
        bm.startViewingBot(gm.getId(), bot.getId());

        // Collect all bot items for storage display
        List<Item> botItems = bm.collectBotItems(bot);

        // Use a fake NPC ID (Fredrick - hired merchant keeper) for the storage UI
        int fakeNpcId = 9030000;
        byte slots = (byte) Math.max(botItems.size() + 10, 48); // enough slots to show everything

        // Send a message header so the GM knows whose inventory they're looking at
        gm.dropMessage(5, "[Bot Inventory] " + bot.getName() + " (Lv" + bot.getLevel() + ") | HP: " + bot.getHp() + "/" + bot.getMaxHp() + " | Mesos: " + bot.getMeso());

        // Open storage UI with bot's items
        c.sendPacket(PacketCreator.getStorage(fakeNpcId, slots, botItems, bot.getMeso()));
    }
}
