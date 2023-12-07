const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { Command } = require('../../../structures');

module.exports = class EmbedCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'embed',
      data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create or edit a custom embed')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('The name of the embed')
            .setRequired(true)
        ),
      enabled: true,
    });
  }

  async execute(interaction) {
    const embedName = interaction.options.getString('name');
    const guildId = interaction.guild.id;

    // Create an initial embed
    let currentEmbed = new EmbedBuilder()
      .setDescription(`Created embed with the name \`${embedName}\``)

    // Function to create button row
    const createButtonRow = () => new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`editBasic-${guildId}-${embedName}`)
          .setLabel('Edit the basic information')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`editAuthor-${guildId}-${embedName}`)
          .setLabel('Edit the author')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`editFooter-${guildId}-${embedName}`)
          .setLabel('Edit the footer')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`editImages-${guildId}-${embedName}`)
          .setLabel('Edit the images')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel('Need help? Join the Support Server')
          .setURL('https://discord.gg/qsT8rD8CQS')
          .setStyle(ButtonStyle.Link),
        // Add other buttons for 'editFooter', 'editImages', etc.
      );

    // Send the initial embed with buttons
    let sentMessage = await interaction.reply({
      embeds: [currentEmbed],
      components: [createButtonRow()],
      fetchReply: true
    });

    const collector = interaction.channel.createMessageComponentCollector({ componentType: 'BUTTON', time: 60000 });

    collector.on('collect', async i => {
        if (i.customId === `editBasic-${guildId}-${embedName}`) {
          // Modal for editing basic information
          const modalBasic = new ModalBuilder()
            .setCustomId(`modalBasic-${guildId}-${embedName}`)
            .setTitle('Edit Basic Information')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('title')
                  .setLabel('Title')
                  .setStyle(TextInputStyle.Short),
                new TextInputBuilder()
                  .setCustomId('description')
                  .setLabel('Description')
                  .setStyle(TextInputStyle.Paragraph)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('color')
                  .setLabel('Color (Hex Code)')
                  .setStyle(TextInputStyle.Short)
              )
            );
      
          await i.showModal(modalBasic);
        } else if (i.customId === `editAuthor-${guildId}-${embedName}`) {
          // Modal for editing author
          const modalAuthor = new ModalBuilder()
            .setCustomId(`modalAuthor-${guildId}-${embedName}`)
            .setTitle('Edit Author')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('authorName')
                  .setLabel('Author Name')
                  .setStyle(TextInputStyle.Short),
                new TextInputBuilder()
                  .setCustomId('authorIcon')
                  .setLabel('Author Icon URL')
                  .setStyle(TextInputStyle.Short)
              )
            );
      
          await i.showModal(modalAuthor);
        } else if (i.customId === `editFooter-${guildId}-${embedName}`) {
          // Modal for editing footer
          const modalFooter = new ModalBuilder()
            .setCustomId(`modalFooter-${guildId}-${embedName}`)
            .setTitle('Edit Footer')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('footerText')
                  .setLabel('Footer Text')
                  .setStyle(TextInputStyle.Short),
                new TextInputBuilder()
                  .setCustomId('footerIcon')
                  .setLabel('Footer Icon URL')
                  .setStyle(TextInputStyle.Short)
              )
            );
      
          await i.showModal(modalFooter);
        } else if (i.customId === `editImages-${guildId}-${embedName}`) {
          // Modal for editing images
          const modalImages = new ModalBuilder()
            .setCustomId(`modalImages-${guildId}-${embedName}`)
            .setTitle('Edit Images')
            .addComponents(
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId('imageURL')
                  .setLabel('Image URL')
                  .setStyle(TextInputStyle.Short),
                new TextInputBuilder()
                  .setCustomId('thumbnailURL')
                  .setLabel('Thumbnail URL')
                  .setStyle(TextInputStyle.Short)
              )
            );
      
          await i.showModal(modalImages);
        }
      });

    collector.on('end', () => console.log('Button interaction ended.'));

    // Await modal submission
    try {
        const modalInteraction = await interaction.awaitModalSubmit({ time: 60000 });
      
        // Process modal submission for basic information
        if (modalInteraction.customId.startsWith(`modalBasic-${guildId}-${embedName}`)) {
          const title = modalInteraction.fields.getTextInputValue('title');
          const description = modalInteraction.fields.getTextInputValue('description');
          const color = modalInteraction.fields.getTextInputValue('color');
      
          if (title) currentEmbed.setTitle(title);
          if (description) currentEmbed.setDescription(description);
          if (color) currentEmbed.setColor(color);
        }
        // Process modal submission for author
        else if (modalInteraction.customId.startsWith(`modalAuthor-${guildId}-${embedName}`)) {
          const authorName = modalInteraction.fields.getTextInputValue('authorName');
          const authorIcon = modalInteraction.fields.getTextInputValue('authorIcon');
      
          if (authorName || authorIcon) {
            currentEmbed.setAuthor({ name: authorName, iconURL: authorIcon });
          }
        }
        // Process modal submission for footer
        else if (modalInteraction.customId.startsWith(`modalFooter-${guildId}-${embedName}`)) {
          const footerText = modalInteraction.fields.getTextInputValue('footerText');
          const footerIcon = modalInteraction.fields.getTextInputValue('footerIcon');
      
          if (footerText || footerIcon) {
            currentEmbed.setFooter({ text: footerText, iconURL: footerIcon });
          }
        }
        // Process modal submission for images
        else if (modalInteraction.customId.startsWith(`modalImages-${guildId}-${embedName}`)) {
          const imageURL = modalInteraction.fields.getTextInputValue('imageURL');
          const thumbnailURL = modalInteraction.fields.getTextInputValue('thumbnailURL');
      
          if (imageURL) currentEmbed.setImage(imageURL);
          if (thumbnailURL) currentEmbed.setThumbnail(thumbnailURL);
        }
      
        // Update the original message with the new embed
        await sentMessage.edit({ embeds: [currentEmbed], components: [createButtonRow()] });
      
        await modalInteraction.reply({ content: 'Embed updated successfully!', ephemeral: true });
      } catch (error) {
        console.error('Error handling modal submission:', error);
        // Handle error (e.g., modal was not submitted in time)
      }      
  }
};
