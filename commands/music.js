const { play } = require('../utils/play');
const { skip } = require('../utils/skip');
const { stop } = require('../utils/stop');

module.exports = {
	name: 'music',
	description: 'enables audio playback for a given youtube video',
	usage: '[command]',
	example: 'play',
	guildOnly: true,
	async execute(message, args) {

		if (message.channel.type === 'dm') return;

		const serverQueue = message.client.queue.get(message.guild.id);

		if (args[0] === 'play') {
			play(message, serverQueue);
			return;
		}
		else if (args[0] === 'skip') {
			skip(message, serverQueue);
			return;
		}
		else if (args[0] === 'stop') {
			stop(message, serverQueue);
			return;
		}
		else {
			message.channel.send('You need to enter a valid command!');
		}
	},
};
