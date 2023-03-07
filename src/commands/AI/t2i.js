const { ApplicationCommandOptionType, InteractionReplyOptions, AttachmentBuilder } = require('discord.js');
const { ChatInputCommand } = require('../../classes/Commands');
const axios = require('axios');

module.exports = new ChatInputCommand({
    permLevel: 'User',
    data: {
        description: 'Test command for the developers',
        SFW: false,
        options: [
            {
                name: 'prompt',
                description: 'what do you want to generate?',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'cfg',
                description: '3 - 12 should be good',
                type: ApplicationCommandOptionType.Number,
                required: false,
                maxValue: 30,
                minValue: 1,
            },
            {
                name: 'steps',
                description: 'how many steps will the bot run for (20 - 40 is best but anything is fine)',
                type: ApplicationCommandOptionType.Number,
                required: false,
                maxValue: 1000,
                minValue: 1,
            },
            {
                name: 'seed',
                description: 'like an image from a previous generation use this to get it again but change your prompt',
                type: ApplicationCommandOptionType.Number,
                required: false,
                maxValue: 2147483647
            },
            {
                name: 'negative',
                description: 'use if u need it not to generate certain things',
                type: ApplicationCommandOptionType.String,
                required: false
            },
        ],
        // Unavailable to non-admins in guilds
        default_member_permissions: 0
    },

    run: async (client, interaction) => {
        try {
            await interaction.deferReply();

            // Get all the options from the interaction
            const options = interaction.options;

            // Access individual options using their names
            const prompt = options.getString('prompt');
            const cfg = options.getNumber('cfg');
            const steps = options.getNumber('steps');
            const seed = options.getNumber('seed');
            const negative = options.getString('negative');

            const data = {
                "enable_hr": false,
                "denoising_strength": 0,
                "firstphase_width": 0,
                "firstphase_height": 0,
                "prompt": prompt,
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
                "n_iter": 4,
                "steps": steps | 40,
                "cfg_scale": cfg | 7,
                "width": 512,
                "height": 512,
                "restore_faces": false,
                "tiling": false,
                "negative_prompt": negative | "",
                "eta": 0,
                "s_churn": 0,
                "s_tmax": 0,
                "s_tmin": 0,
                "s_noise": 1,
                "override_settings": {},
                "sampler_index": "DDIM"
            }


            const response = await axios.post('http://127.0.0.1:7860/sdapi/v1/txt2img', data);
            const files = [];
            for (const imageData of response.data.images) {
                files.push({
                    attachment: Buffer.from(imageData, 'base64'),
                    name: 'imagename.png'
                });
            }


            await interaction.editReply({
                content: "here is your images",
                files
            });


        } catch (error) {
            console.error(error);
            interaction.editReply('An error occurred while processing your request.');
        }
    }
});
