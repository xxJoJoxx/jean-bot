module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	execute(message, args) {
		const { commands } = message.client;

		if (!args.length) {
			const basicHelpEmbed = {
				color: 0x0099ff,
				title: 'Standard Help commands:',
				description: `\nYou can send \`${process.env.COMMAND_PREFIX}help [command name]\` to get info on a specific command!`,
				thumbnail: {
					url: 'https://i.imgur.com/tCfRGCH.png',
				},
				fields: [
					{
						name: 'General Help',
						value: commands.map(command => `\t \`${command.name}\``).join(' '),
					},
					{
						name: '\u200b',
						value: '\u200b',
						inline: false,
					},
				],
				timestamp: new Date(),
				footer: {
					text: 'Owner: xJonnyxx#4117',
					icon_url: 'https://i.imgur.com/KcLf9OH.png',
				},
			};

			return message.channel.send({ embed: basicHelpEmbed })
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('it seems like I can\'t DM you!');
				});
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		const detailedHelpEmbed = {
			color: 0x0099ff,
			title: `${command.name}`,
			description: 'I hope the knights of favonius don\'t mind me telling you this.',
			thumbnail: {
				url: 'https://i.imgur.com/tCfRGCH.png',
			},
			fields: [],
			timestamp: new Date(),
			footer: {
				text: 'Owner: xJonnyxx#4117',
				icon_url: 'https://i.imgur.com/KcLf9OH.png',
			},
		};

		if (command.aliases) detailedHelpEmbed.fields.push({ name: 'Aliases:', value: `${command.aliases.join(', ')}` });
		if (command.description) detailedHelpEmbed.fields.push({ name: 'Description:', value: `${command.description}` });
		if (command.usage) detailedHelpEmbed.fields.push({ name: 'Usage:', value: `${process.env.COMMAND_PREFIX}${command.name} ${command.usage}` });
		if (command.example) detailedHelpEmbed.fields.push({ name: 'Example:', value: `${process.env.COMMAND_PREFIX}${command.name} ${command.example}` });

		detailedHelpEmbed.fields.push({ name:'Cooldown:', value:`${command.cooldown || 3} second(s)` });

		message.channel.send({ embed: detailedHelpEmbed });
	},
};