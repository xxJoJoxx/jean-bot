const axios = require('axios');
const moment = require('moment');

module.exports = {
	name: 'time',
	description: 'Gives the current time in specified timezone.',
	usage: '[<region>/<city/country>]',
	example: 'asia shanghai',
	guildOnly: true,
	async execute(message, args) {
		try {
			const res = await axios.get(`${process.env.TIMEZONE_SERVICE_BASE_URL}/${args[0]}/${args[1]}`);
			const datetimeInTimezone = moment.parseZone(res.data.datetime).format('MMMM Do YYYY, h:mm:ss a');
			message.channel.send(`The time is now \`${datetimeInTimezone}\` in \`${res.data.timezone}\` with an offset of: \`${res.data.utc_offset}\``);
		}
		catch (error) {
			if (error.response.status == 404) {
				message.channel.send(`Error: ${error.response.data.error}, please enter a valid location, use \`!help\` for assistance`);
			}
			console.error(error.response);
		}
	},
};
