const {
    ModalBuilder, TextInputBuilder, ActionRowBuilder
} = require('@discordjs/builders');
const { TextInputStyle } = require('discord.js');
const { ChatInputCommand } = require('../../classes/Commands');

module.exports = new ChatInputCommand({
    permLevel: 'User',
    clientPerms: ['EmbedLinks', 'AttachFiles'],
    data: {
        description: 'run api requests with default settings',
    },
    run: async (client, interaction) => {
        try {
            // Code Modal
            const codeModal = new ModalBuilder()
                .setCustomId("test")
                .setTitle('this is a test modal');

            // create 2 text inputs
            const input1 = new TextInputBuilder()
                .setCustomId("input1")
                .setLabel('prompt text')
                .setStyle(TextInputStyle.Paragraph);

            const input2 = new TextInputBuilder()
                .setCustomId("input2")
                .setLabel('negative prompt text')
                .setStyle(TextInputStyle.Paragraph);

            const seed = new TextInputBuilder()
                .setCustomId("seed")
                .setLabel('the seed that will be used in the generation')
                .setStyle(TextInputStyle.Paragraph);
            const amount = new TextInputBuilder()
                .setCustomId("amount")
                .setLabel('how many images are you wanting to generate?')
                .setStyle(TextInputStyle.Paragraph);

            // Modal Rows
            const input1Row = new ActionRowBuilder().addComponents(input1);
            const input2Row = new ActionRowBuilder().addComponents(input2);
            const seedRow = new ActionRowBuilder().addComponents(seed);
            const amountRow = new ActionRowBuilder().addComponents(amount);


            // Adding the components to our modal
            codeModal.addComponents(input1Row, input2Row, seedRow, amountRow);

            // Showing the modal to the user
            await interaction.showModal(codeModal);
        }
        catch (err) {
            console.log(err);
        }
    }
});
