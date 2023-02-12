import { AllowedMentionsTypes } from "discord-api-types/v10";
import type { APIAllowedMentions } from "discord.js";

export function parseMentions(message_content: string): APIAllowedMentions {
  const mention_strings = message_content.match(/@everyone|@here|<@(?:&|!)?\d{17,20}>/gm);
  if (mention_strings === null) {
    return {};
  }
  let everyone_mention = false;
  const role_mentions: Set<string> = new Set();
  const user_mentions: Set<string> = new Set();
  for (let i = 0; i < mention_strings.length; i++) {
    const mention = mention_strings[i];
    if (mention === "@everyone" || mention === "@here") {
      everyone_mention = true;
    } else {
      const id = mention.slice(2, -1);
      if (id.startsWith("&")) {
        role_mentions.add(id.slice(1));
      } else if (id.startsWith("!")) {
        user_mentions.add(id.slice(1));
      } else {
        user_mentions.add(id);
      }
    }
  }
  return {
    parse: everyone_mention ? [AllowedMentionsTypes.Everyone] : [],
    roles: [...role_mentions],
    users: [...user_mentions],
  };
}
