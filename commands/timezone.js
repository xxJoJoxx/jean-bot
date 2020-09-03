module.exports = {
	name: 'localtime',
	aliases: ['lt'],
	description:
		'Converts a given time and timezone to the requestor\'s local time',
	guildOnly: true,
	execute(message, time) {
		message.channel.send(`Your local time will be ${time}`);
	},
};
