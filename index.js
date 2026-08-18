const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// تم وضع التوكن والآيدي الخاص بك هنا مباشرة
const TOKEN = 'MTM0MjIwMzM4NjE5OTU0Mzg5OQ.G-cMC9.qDsTVByFcB_lyjoWuv2wqit8m3fKBE3kpdKWI4';
const OWNER_ID = '1120390766913667214'; // الآيدي الخاص بك للتحكم الكامل
const SUPPORT_ROLE_ID = 'حط_ايدي_رتبة_الإدارة_هنا'; // استبدل هذه برتبة الإداريين بسيرفرك

client.once('ready', () => {
    console.log(`[BOT READY] تم تسجيل الدخول بنجاح باسم: ${client.user.tag}`);
});

// أمر !tsetup لإرسال القائمة الاحترافية (متاح للأدمن أو لك خصيصاً)
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === '!tsetup') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator) && message.author.id !== OWNER_ID) {
            return message.reply('❌ ما عندك صلاحية لإستخدام هذا الأمر!');
        }

        const embed = new EmbedBuilder()
            .setTitle('🎫 مركز الدعم الفني والتكتات الرسمي')
            .setDescription('أهلاً بك عزيزي العضو!\nلفتح تكت جديدة، يرجى اختيار القسم المناسب من القائمة أدناه، وسيقوم فريق الإدارة بخدمتك بأسرع وقت ممكن.')
            .setColor('#2b2d31')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'نظام التكتات المتطور', iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_menu')
                    .setPlaceholder('📌 | اضغط هنا لاختيار قسم التكت')
                    .addOptions([
                        {
                            label: 'الدعم الفني العام',
                            description: 'لحل المشاكل والاستفسارات العامة',
                            value: 'ticket_general',
                            emoji: '🛠️'
                        },
                        {
                            label: 'الشكاوى والإبلاغات',
                            description: 'للإبلاغ عن عضو أو إداري مخالف',
                            value: 'ticket_report',
                            emoji: '⚠️'
                        },
                        {
                            label: 'الرعاية والشراء',
                            description: 'للاستفسار عن العروض والخدمات المدفوعة',
                            value: 'ticket_shop',
                            emoji: '🛒'
                        }
                    ])
            );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete();
    }
});

// التعامل مع اختيارات القائمة والأزرار
client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_menu') {
        const guild = interaction.guild;
        const member = interaction.member;
        const selectedValue = interaction.values[0];
        
        let categoryName = 'الدعم الفني';
        if (selectedValue === 'ticket_report') categoryName = 'شكاوى';
        if (selectedValue === 'ticket_shop') categoryName = 'مشتريات';

        await interaction.deferReply({ ephemeral: true });

        try {
            const ticketChannel = await guild.channels.create({
                name: `ticket-${member.user.username}-${categoryName}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: member.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles],
                    },
                    {
                        id: SUPPORT_ROLE_ID,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles],
                    },
                    {
                        id: client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
                    },
                ],
            });

            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`🎫 تكت جديدة: ${categoryName}`)
                .setDescription(`مرحباً بك <@${member.id}>!\nتم فتح التكت بنجاح. يرجى توضيح مشكلتك أو طلبك بالتفصيل، وسيقوم أحد الإداريين بالرد عليك قريباً.\n\n**أزرار التحكم بالتكت في الأسفل:**`)
                .setColor('#5865F2')
                .setTimestamp();

            const controlRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('claim_ticket')
                        .setLabel('استلام التكت 🙋‍♂️')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('إغلاق التكت 🔒')
                        .setStyle(ButtonStyle.Danger)
                );

            await ticketChannel.send({ content: `<@${member.id}> | <@&${SUPPORT_ROLE_ID}>`, embeds: [welcomeEmbed], components: [controlRow] });
            await interaction.editReply({ content: `✅ تم إنشاء تكت الخاص بك بنجاح: ${ticketChannel}` });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ حدث خطأ أثناء إنشاء روم التكت، تأكد من صلاحيات البوت.' });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'claim_ticket') {
            if (!interaction.member.roles.cache.has(SUPPORT_ROLE_ID) && interaction.user.id !== OWNER_ID) {
                return interaction.reply({ content: '❌ هذا الزر مخصص للإدارة فقط!', ephemeral: true });
            }
            const embed = new EmbedBuilder()
                .setDescription(`🙋‍♂️ **تم استلام التكت بواسطة الإداري:** <@${interaction.user.id}>`)
                .setColor('#00FF00');
            await interaction.reply({ embeds: [embed] });
        }

        if (interaction.customId === 'close_ticket') {
            const channel = interaction.channel;
            await interaction.reply({ content: '🔒 **جاري إغلاق وتدمير التكت خلال 5 ثوانٍ...**' });
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (err) {
                    console.error('فشل الحذف:', err);
                }
            }, 5000);
        }
    }
});

client.login(TOKEN);