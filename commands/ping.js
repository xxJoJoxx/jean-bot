module.exports = {
	name: 'ping',
	aliases: [ 'latency' ],
	description: 'Gives the latency in `ms`',
	cooldown: 5,
	guildOnly: true,
	async execute(message) {
		try {
			const msg = await message.channel.send('Ping is being appreciated... :slot_machine:');
			const ping = Math.round((msg.createdTimestamp - message.createdTimestamp));
			msg.edit(`Pong: \`${ping} ms\` :race_car::dash:`);
		}
		catch (error) {
			console.error(error);
		}
	},
};
