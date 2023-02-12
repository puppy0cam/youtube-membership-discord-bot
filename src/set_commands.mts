import { REST, Routes, PermissionFlagsBits } from "discord.js";
import config from "./config.mjs";

const rest = new REST({
  version: "10",
});
rest.setToken(config.discord.bot.token);

await rest.put(Routes.applicationCommands(config.discord.bot.id), {
  body: [
    {
      name: "info",
      description: "Get information about the bot.",
      type: 1,
      dm_permission: true,
    },
  ],
});

await rest.put(Routes.applicationGuildCommands(config.discord.bot.id, config.discord.owner.guild_id), {
  body: [
    {
      name: "force_sync_yt",
      description: "Force a sync of the YouTube channel members into the database.",
      dm_permission: false,
      type: 1,
      default_member_permissions: (PermissionFlagsBits.ManageRoles).toString(),
    },
  ],
});
