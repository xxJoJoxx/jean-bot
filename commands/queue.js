const { escapeMarkdown, MessageEmbed, splitMessage } = require('discord.js');

module.exports = {
	name: 'queue',
	aliases: ['q'],
	description: 'view contents of the music queue',
	usage: '[command] [params]',
	example: 'queue',
	guildOnly: true,
	execute(message) {
		const queue = message.client.queue.get(message.guild.id);
		if (!queue) return message.reply('There is nothing playing.').catch(console.error);

		console.log(queue.songs);
		const description = queue.songs.map(
			(song, index) => `${index + 1}. ${escapeMarkdown(song.title)}`,
		);

		const queueEmbed = new MessageEmbed()
			.setTitle('DJ Jean\'s Music Queue')
			.setDescription(description)
			.setColor('#F8AA2A')
			.setThumbnail('https://i.imgur.com/nrzlK8T.png')
			.setFooter('Owner:xJonnyxx#4117', 'https://i.imgur.com/KcLf9OH.png');

		const splitDescription = splitMessage(description, {
			maxLength: 2048,
			char: '\n',
			prepend: '',
			append: '',
		});

		splitDescription.forEach(async (m) => {
			queueEmbed.setDescription(m);
			message.channel.send(queueEmbed);
		});
	},
};
