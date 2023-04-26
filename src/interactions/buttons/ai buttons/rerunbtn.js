const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { colorResolver, getRuntime } = require('../../../util');
const util = require('util');
const {
    EMBED_FIELD_VALUE_MAX_LENGTH, ACCEPT_EVAL_CODE_EXECUTION, ZERO_WIDTH_SPACE_CHAR_CODE
} = require('../../../constants');
const logger = require('@mirasaki/logger');
const { ComponentCommand } = require('../../../classes/Commands');


module.exports = new ComponentCommand({
    permLevel: 'Developer',
    data: { name: 'rerunbtn' },
    run: async (client, interaction) => {
        // Destructure from interaction and client
        const { member, message } = interaction;
        const { emojis, colors } = client.container;

        // Editing original command interaction
        const originalEmbed = message.embeds[0].data;
        // get original message
        await message.edit({
            content: `${emojis.success} ${member}, this code is now executing...`,
            embeds: [
                {
                    // Keep the original embed but change color
                    ...originalEmbed,
                    color: colorResolver(colors.error)
                }
            ],
            // Remove decline button and disable accept button
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(ACCEPT_EVAL_CODE_EXECUTION)
                        .setDisabled(true)
                        .setLabel('Executing...')
                        .setStyle('Success')
                )
            ]
        });
    }
});
