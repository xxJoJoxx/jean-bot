const ytdl = require('ytdl-core');
const YouTubeAPI = require('simple-youtube-api');
const youtube = new YouTubeAPI(process.env.YOUTUBE_API_KEY);

exports.play = async (message, serverQueue) => {
	const args = message.content.split(' ');
	args.splice(0, 2);
	const search = args.join(' ');
	const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
	const urlValid = videoPattern.test(args[0]);

	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');

	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send(
			'I need the permissions to join and speak in your voice channel!',
		);
	}

	let songInfo = null;
	let song = null;

	if (urlValid) {
		try {
			songInfo = await ytdl.getInfo(args[0]);

			song = {
				title: songInfo.videoDetails.title,
				url: songInfo.videoDetails.video_url,
				duration: songInfo.videoDetails.lengthSeconds,
			};
		}
		catch (error) {
			console.error(error);
		}
	}
	else {
		try {
			const results = await youtube.searchVideos(search, 1);
			console.log(results);

			songInfo = await ytdl.getInfo(results[0].url);

			song = {
				title: songInfo.videoDetails.title,
				url: songInfo.videoDetails.video_url,
				duration: songInfo.videoDetails.lengthSeconds,
			};
		}
		catch (error) {
			console.error(error);
		}
	}

	if (!serverQueue) {
		// create queue construct object
		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 10,
			playing: true,
		};
		// Setting the queue using our contract
		message.client.queue.set(message.guild.id, queueConstruct);
		// Pushing the song to our songs array
		queueConstruct.songs.push(song);

		try {
			// Here we try to join the voicechat and save our connection into our object.
			const connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			await queueConstruct.connection.voice.setSelfDeaf(true);
			// Calling the play function to start a song
			playSong(queueConstruct.songs[0], message);
		}
		catch (err) {
			// Printing the error message if the bot fails to join the voicechat
			console.log(err);
			message.client.queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	}
	else {
		console.log(serverQueue);
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(
			`✅ **${song.title}** has been added to the queue by ${message.author}`,
		);
	}
};

async function playSong(song, message) {
	let playingMessage = null;
	const queue = message.client.queue.get(message.guild.id);
	if (!song) {
		queue.voiceChannel.leave();
		message.client.queue.delete(message.guild.id);
		return queue.textChannel.send('🚫 Music queue ended.').catch(console.error);
	}

	const dispatcher = queue.connection
		.play(ytdl(song.url))
		.on('finish', () => {
			queue.songs.shift();
			playSong(queue.songs[0], message);
		})
		.on('error', (error) => console.error(error));
	dispatcher.setVolumeLogarithmic(queue.volume / 10);

	try {
		playingMessage = await queue.textChannel.send(
			`🎶 Start playing: **${song.title}**`,
		);
		await playingMessage.react('⏭');
		await playingMessage.react('⏯');
		await playingMessage.react('🔇');
		await playingMessage.react('🔉');
		await playingMessage.react('🔊');
		await playingMessage.react('🔁');
		await playingMessage.react('⏹');
	}
	catch (error) {
		console.error(error);
	}

	const filter = (reaction, user) => user.id !== message.client.user.id;
	const collector = playingMessage.createReactionCollector(filter, {
		time: song.duration > 0 ? song.duration * 1000 : 600000,
	});

	collector.on('collect', (reaction, user) => {
		// console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
		if (!queue) return;
		// const member = message.guild.member(user);
		switch (reaction.emoji.name) {
		case '⏭':
			queue.playing = true;
			reaction.users.remove(user).catch(console.error);
			// if (!canModifyQueue(member)) return;
			queue.connection.dispatcher.end();
			queue.textChannel
				.send(`${user} ⏩ skipped the song`)
				.catch(console.error);
			collector.stop();
			break;
		case '⏯':
			reaction.users.remove(user).catch(console.error);
			// if (!canModifyQueue(member)) return;
			if (queue.playing) {
				queue.playing = !queue.playing;
				queue.connection.dispatcher.pause(true);
				queue.textChannel
					.send(`${user} ⏸ paused the music.`)
					.catch(console.error);
			}
			else {
				queue.playing = !queue.playing;
				queue.connection.dispatcher.resume();
				queue.textChannel
					.send(`${user} ▶️ resumed the music!`)
					.catch(console.error);
			}
			break;
		case '🔇':
			reaction.users.remove(user).catch(console.error);
			// if (!canModifyQueue(member)) return;
			if (queue.volume <= 0) {
				queue.volume = 10;
				queue.connection.dispatcher.setVolumeLogarithmic(10 / 10);
				queue.textChannel
					.send(`${user} 🔊 unmuted the music!`)
					.catch(console.error);
			}
			else {
				queue.volume = 0;
				queue.connection.dispatcher.setVolumeLogarithmic(0);
				queue.textChannel
					.send(`${user} 🔇 muted the music!`)
					.catch(console.error);
			}
			break;

		case '🔉':
			reaction.users.remove(user).catch(console.error);
			// if (!canModifyQueue(member)) return;
			if (queue.volume - 1 <= 0) queue.volume = 0;
			else queue.volume = queue.volume - 1;
			queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 10);
			queue.textChannel
				.send(
					`${user} 🔉 decreased the volume, the volume is now ${queue.volume}%`,
				)
				.catch(console.error);
			break;
		case '🔊':
			reaction.users.remove(user).catch(console.error);
			// if (!canModifyQueue(member)) return;
			if (queue.volume + 1 >= 10) queue.volume = 10;
			else queue.volume = queue.volume + 1;
			queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 10);
			queue.textChannel
				.send(
					`${user} 🔊 increased the volume, the volume is now ${queue.volume}%`,
				)
				.catch(console.error);
			break;
		case '🔁':
			reaction.users.remove(user).catch(console.error);
			// if (!canModifyQueue(member)) return;
			queue.loop = !queue.loop;
			queue.textChannel
				.send(`Loop is now ${queue.loop ? '**on**' : '**off**'}`)
				.catch(console.error);
			break;

		case '⏹':
			reaction.users.remove(user).catch(console.error);
			// if (!canModifyQueue(member)) return;
			queue.songs = [];
			queue.textChannel
				.send(`${user} ⏹ stopped the music!`)
				.catch(console.error);
			try {
				queue.connection.dispatcher.end();
			}
			catch (error) {
				console.error(error);
				queue.connection.disconnect();
			}
			collector.stop();
			break;

		default:
			reaction.users.remove(user).catch(console.error);
			break;
		}
	});

	collector.on('end', (collected) => {
		console.log(`Collected ${collected.size} items`);
	});
}
