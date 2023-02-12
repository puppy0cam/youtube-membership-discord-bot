import config from "./config.mjs";
import { REST, Routes } from "discord.js";

const rest = new REST({
  version: "10",
});

rest.setToken(config.discord.bot.token);

await rest.put(Routes.applicationRoleConnectionMetadata(config.discord.bot.id), {
  body: [
    {
      type: 2,
      key: "total_membership_months",
      name: "Total Membership (Months)",
      description: "The total number of months the user has been a YouTube channel member.",
    },
    {
      type: 2,
      key: "membership_streak_months",
      name: "Membership Streak (Months)",
      description: "The number of consecutive months the user has been a YouTube channel member.",
    },
  ],
});
