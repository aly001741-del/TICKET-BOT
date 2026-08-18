const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const TRANSCRIPT_LOG_ID = '1539066371344826580';
const REPORT_LOG_ID = '1539066194009661530';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === '!ticket') {
        const embed = new EmbedBuilder()
            .setTitle('🎫 نظام التكتات والبلاغات')
            .setDescription('اختر القسم المناسب لفتح تكت أو إرسال بلاغ:')
            .setColor(0x0099ff);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('فتح تكت (ملاحظات)')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝'),
            new ButtonBuilder()
                .setCustomId('open_report')
                .setLabel('تقديم بلاغ')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🚨')
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const guild = interaction.guild;
    const member = interaction.member;

    if (interaction.customId === 'open_ticket' || interaction.customId === 'open_report') {
        const isReport = interaction.customId === 'open_report';
        const channelName = isReport ? `report-${member.user.username}` : `ticket-${member.user.username}`;
        const parentId = isReport ? REPORT_LOG_ID : TRANSCRIPT_LOG_ID;

        try {
            const permissionOverwrites = [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: member.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                }
            ];

            const channelOptions = {
                name: channelName,
                type: ChannelType.GuildText,
                permissionOverwrites: permissionOverwrites
            };

            if (parentId) {
                channelOptions.parent = parentId;
            }

            const ticketChannel = await guild.channels.create(channelOptions);

            const controlRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('قفل التكت')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

            await ticketChannel.send({
                content: `مرحباً ${member}, تم فتح ${isReport ? 'البلاغ' : 'التكت'} بنجاح! سيتم خدمتك قريباً.`,
                components: [controlRow]
            });

            await interaction.reply({ content: `✅ تم إنشاء تكتك بنجاح: ${ticketChannel}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء إنشاء التكت، تأكد من صلاحيات البوت وأيديهات الرومات.', ephemeral: true });
        }
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply({ content: '🔒 جاري إغلاق التكت وحذفه...' });
        setTimeout(async () => {
            try {
                await interaction.channel.delete();
            } catch (e) {
                console.error(e);
            }
        }, 3000);
    }
});

client.login('MTM0MjIwMzM4NjE5OTU0Mzg5OQ.GtelrY.UhQPC0tEexfpG964eVeuI-W7OCDsivvY2RsDaM');
