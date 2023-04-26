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
            {
                name: 'amount',
                description: 'how many images are you wanting to generate?',
                type: ApplicationCommandOptionType.Number,
                required: false,
                minValue: 1,
                maxValue: 10,
            },
        ],
    },

    run: async (client, interaction) => {
        try {
            // defer the reply so the user knows the bot is working
            await interaction.deferReply();
            const options = interaction.options;
            
            // get the options
            const prompt = options.getString('prompt');
            const cfg = options.getNumber('cfg');
            const steps = options.getNumber('steps');
            const seed = options.getNumber('seed');
            const negative = options.getString('negative');
            const amount = options.getNumber('amount');

            // create the data object
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
                "n_iter": amount || 1,
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
            // send the data to the api
            const response = await client.axios.post('http://127.0.0.1:7861/sdapi/v1/txt2img', data);

            // Create an array of files
            const files = response.data.images.map(imageData => ({
                attachment: Buffer.from(imageData, 'base64'),
                name: 'imagename.png',
                
            }));
            // save data to keyv db
            await client.keyv.set(interaction.user.id, response.data);

            // send the array of files there is a max of 10 files per message
            await interaction.editReply({ content: "here are your images", files });
        } catch (error) {
            // Log the error
            console.error(error);
            interaction.editReply('An error occurred while processing your request.');
            // Send the error to the owner
            client.users.fetch(client.config.ownerID).then(user => user.send(`An error occurred while processing a request in ${interaction.guild.name}:\n\`\`\`${error.stack}\`\`\``));
        }
    }
});
