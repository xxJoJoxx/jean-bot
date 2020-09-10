const moment = require('moment');

module.exports = {
	name: 'localtime',
	aliases: ['lt'],
	usage: '[command name/alias]',
	example: 'August 18 23:59:59 GMT+8',
	description:
		'Converts a given date, time and timezone to the requestor\'s local date and time',
	guildOnly: true,
	execute(message, args) {
		args = args.map((arg) => arg.replace('th', ''));
		(!moment(args[2], 'YYYY', true).isValid()) && args.splice(2, 0, new Date().getFullYear());
		const userDateTime = args.join(' ');
		const utcTime = new Date(userDateTime);
		message.channel.send(`Your local time would be \`${utcTime}\``);
	},
};
