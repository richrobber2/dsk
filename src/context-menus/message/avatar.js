const logger = require('@mirasaki/logger');
const { MessageContextCommand } = require('../../classes/Commands');
const { EMBED_DESCRIPTION_MAX_LENGTH } = require('../../constants');
const { colorResolver } = require('../../util');

module.exports = new MessageContextCommand({
  clientPerms: ['EmbedLinks'],
  global: true,
  cooldown: {
    type: 'guild',
    usages: 2,
    duration: 30,
  },
  data: { description: "get the users avatar" },

  run: async (client, interaction) => {
    // destructure interaction data
    const { member, targetId, channel } = interaction;
    const { emojis, colors } = client.container;

    // defer reply so the user knows the bot is working
    await interaction.deferReply();
    let targetMessage;

    try {
      // fetch the message from the channel the command was used in
      targetMessage = await channel.messages.fetch(targetId);
    } catch (err) {
      // if the message can't be fetched, reply with an error message
      interaction.editReply({ content: `${emojis.error} ${member}, can't fetch message **\`${targetId}\`**, please try again later.` });
      logger.syserr(`<Message Context Menu - Info> Unable to fetch message ${targetId}`);
      console.error(err.stack || err);
      return;
    }
    // check if the user has an avatar by using the target message's author
    if (!targetMessage.author.avatarURL) {
      interaction.editReply({ content: `${emojis.error} ${member}, that user doesn't have an avatar.` });
      return;
    }

    const embed = {
      title: `${targetMessage.author.username}'s avatar`,
      description: `[png](${targetMessage.author.avatarURL({ format: 'png', dynamic: true, size: 1024 })}) | [jpg](${targetMessage.author.avatarURL({ format: 'jpg', dynamic: true, size: 1024 })}) | [webp](${targetMessage.author.avatarURL({ format: 'webp', dynamic: true, size: 1024 })}) | [gif](${targetMessage.author.avatarURL({ format: 'gif', dynamic: true, size: 1024 })})`,
      color: colorResolver(colors.blue),
      image: {
        url: targetMessage.author.avatarURL({ format: 'png', dynamic: true, size: 1024 })
      }
    };

    // send the embed
    interaction.editReply({ embeds: [embed] });

  },
});
