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
    data: { description: "rerun stable diffusion job" },

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
       
        // get images from target message and convert them to base64
        const images = targetMessage.attachments.map(attachment => attachment.url);
        const base64Images = images.map(image => {
            const base64 = Buffer.from(image).toString('base64');
            return base64;
        });

          
        // create data object to send to the api
        const data = {
            "init_images": [
                "string"
            ],
            "resize_mode": 0,
            "denoising_strength": 0.75,
            "image_cfg_scale": 0,
            "mask": "string",
            "mask_blur": 4,
            "inpainting_fill": 0,
            "inpaint_full_res": true,
            "inpaint_full_res_padding": 0,
            "inpainting_mask_invert": 0,
            "initial_noise_multiplier": 0,
            "prompt": "temp preompt",
            "styles": [
              "string"
            ],
            "seed": -1,
            "subseed": -1,
            "subseed_strength": 0,
            "seed_resize_from_h": -1,
            "seed_resize_from_w": -1,
            "sampler_name": "string",
            "batch_size": 1,
            "n_iter": 1,
            "steps": 50,
            "cfg_scale": 7,
            "width": 512,
            "height": 512,
            "restore_faces": false,
            "tiling": false,
            "do_not_save_samples": false,
            "do_not_save_grid": false,
            "negative_prompt": "temp negative prompt",
            "eta": 0,
            "s_churn": 0,
            "s_tmax": 0,
            "s_tmin": 0,
            "s_noise": 1,
            "override_settings": {},
            "override_settings_restore_afterwards": true,
            "script_args": [],
            "sampler_index": "Euler",
            "include_init_images": false,
            "script_name": "string",
            "send_images": true,
            "save_images": false,
            "alwayson_scripts": {}
          }

        // loop through base64 images one by one and send them to the api
        for (let i = 0; i < base64Images.length; i++) {
            data.image = base64Images[i];
            await client.axios.post('http://127.0.0.1:7860/sdapi/v1/img2img', data);
        }
    },
});
