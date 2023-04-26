const { stripIndents } = require('common-tags/lib');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { ComponentCommand } = require('../../classes/Commands');
const {
    EVAL_CODE_INPUT, ACCEPT_EVAL_CODE_EXECUTION, DECLINE_EVAL_CODE_EXECUTION, EVAL_CODE_MODAL
} = require('../../constants');
const { colorResolver } = require('../../util');
const axios = require('axios');
module.exports = new ComponentCommand({
    // Overwriting the default file name with our owm custom component id
    data: { name: "test" },
    run: async (client, interaction) => {
        const { member } = interaction;
        const { emojis } = client.container;

        // Defer our reply
        await interaction.deferReply();

        // Code Input
        const Pprompt = interaction.fields.getTextInputValue("input1");
        const Nprompt = interaction.fields.getTextInputValue("input2");
        const seed = interaction.fields.getTextInputValue("seed");
        const amount = interaction.fields.getTextInputValue("amount");
        // check if amount is a number if it is then continue if not then send error message
        if (isNaN(amount)) {
            return interaction.reply({
                content: 'amount must be a number',
                ephemeral: true
            });
        }
        // make sure the amount is between 1 and 10
        if (amount < 1 || amount > 10) {
            return interaction.reply({
                content: 'amount must be between 1 and 10',
                ephemeral: true
            });
        }
        // create the data object
        const data = {
            "enable_hr": false,
            "denoising_strength": 0,
            "firstphase_width": 0,
            "firstphase_height": 0,
            "prompt": Pprompt,
            "styles": [
                "string"
            ],
            "seed": seed | -1,
            "subseed": -1,
            "subseed_strength": 0,
            "seed_resize_from_h": -1,
            "seed_resize_from_w": -1,
            "sampler_name": null,
            "batch_size": 1,
            "n_iter": amount || 1,
            "steps": 40,
            "cfg_scale": 7,
            "width": 512,
            "height": 512,
            "restore_faces": false,
            "tiling": false,
            "negative_prompt": Nprompt | "",
            "eta": 0,
            "s_churn": 0,
            "s_tmax": 0,
            "s_tmin": 0,
            "s_noise": 1,
            "override_settings": {},
            "sampler_index": "DDIM"
        }
        // send the data to the api
        const response = await axios.post('http://127.0.0.1:7860/sdapi/v1/txt2img', data);

        // Create an array of files
        const files = response.data.images.map(imageData => ({
            attachment: Buffer.from(imageData, 'base64'),
            name: 'imagename.png',

        }));
        // save data to keyv db
        await client.keyv.set(interaction.user.id, response.data);

        // Verification prompt
        await interaction.editReply({
            content: `${emojis.wait} ${member}, ran your prompt:`,
            embeds: [
                {
                    color: colorResolver(),
                    description: stripIndents`
            **Positive prompt: **: \`${Pprompt}\`
            **Negitive prompt: ** \`${Nprompt}\`
            **Seed: ** \`${seed}\`
            **Amount: ** \`${amount}\`
          `
                }
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(ACCEPT_EVAL_CODE_EXECUTION)
                        .setLabel('Accept')
                        .setDisabled(true)
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId(DECLINE_EVAL_CODE_EXECUTION)
                        .setLabel('Decline')
                        .setDisabled(true)
                        .setStyle('Danger')
                )
            ],
            files: files
        });
    }
});
