const Twitter = require('twitter-lite');
const { MessageEmbed } = require('discord.js');

const user = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const parameters = {
	track: '#GenshinImpact',
	follow: '1072404907230060544',
};

module.exports = {
	name: 'feed',
	aliases: ['f'],
	description: 'view contents from a twitter feed',
	usage: '[command] [params]',
	example: '@paimon',
	guildOnly: true,
	async execute(message) {
		// setting up a twitter stream
		user
			.stream('statuses/filter', parameters)
			.on('start', () => console.log('started streaming'))
			.on('data', (tweet) => {
				const feedEmbed = new MessageEmbed()
					.setTitle('Posts from twitter')
					.setColor('#F8AA2A')
					.setThumbnail(tweet.user.profile_image_url)
					.setAuthor(
						`${tweet.user.name} (@${tweet.user.screen_name})`,
						tweet.user.profile_image_url,
					)
					.addFields(
						{
							name: 'Tweet:',
							value:
								tweet.extended_tweet != null
									? tweet.extended_tweet.full_text
									: tweet.text,
						},
						{ name: 'Likes:', value: tweet.favorite_count },
						{ name: 'Retweets:', value: tweet.retweet_count },
					)
					.setFooter('Owner:xJonnyxx#4117', 'https://i.imgur.com/KcLf9OH.png');
				message.client.channels.cache.get('755272491810816062').send(feedEmbed);
			})
			.on('ping', () => console.log('ping'))
			.on('error', (error) => console.log('error', error))
			.on('end', () => console.log('end'));
	},
};
