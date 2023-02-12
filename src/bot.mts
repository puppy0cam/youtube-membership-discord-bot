import { Client, GatewayIntentBits } from "discord.js";
import config from "./config.mjs";
import { refreshYouTubeMembers } from "./refresh_youtube_members.mjs";

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "info") {
    await interaction.reply({
      content: `This bot is used to sync YouTube channel members into a Discord server.\nAdd the bot to your own server with this link: https://discord.com/api/oauth2/authorize?client_id=${config.discord.bot.id}&scope=bot%20applications.commands`,
      ephemeral: true,
    });
    return;
  }
  if (interaction.inCachedGuild()) {
    if (interaction.commandName === "force_sync_yt") {
      const defer = interaction.deferReply();
      try {
        await refreshYouTubeMembers();
        await defer;
        await interaction.editReply({
          content: "Successfully synced the YouTube members.",
        });
      } catch (e) {
        console.error(e);
        await defer;
        await interaction.editReply({
          content: "An error occurred while syncing the YouTube members.",
        });
      }
    }
  }
});

await bot.login(config.discord.bot.token);
