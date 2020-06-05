import Discord from 'discord.js';
import ytdl from 'ytdl-core';
export class BotServer {
    private bot: Discord.Client;
    constructor() {
        this.bot = new Discord.Client();
    }

    start(): void {
        this.setUpListeners();
        this.bot.login(process.env.BOT_TOKEN);
    }

    private setUpListeners(): void {
        this.bot.on('ready', () => {
            console.log('HEllo world i am here');
        });
        this.bot.on('message', (message: Discord.Message) => {
            if (message.author.bot) {
                return;
            }
            if (message.content.substring(0, process.env.PREFIX.length) === process.env.PREFIX) {
                const args = message.content.substring(process.env.PREFIX.length).split(" ");
                const command = args.shift();
                switch (command) {
                    case 'tic':
                        message.reply('TAC!');
                        break;
                    case 'join':
                        this.joinVoice(message, args.shift());
                    default:
                        message.channel.send('DAMNN!!');
                }
            } else {
                console.log('Not mine!!');
            }
        });
    }

    private async joinVoice(message: Discord.Message, url: string) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.channel.send(
                "You need to be in a voice channel to play music!"
            );
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (
            !permissions.has("CONNECT")
            || !permissions.has("SPEAK")
        ) {
            return message.channel.send(
                "I need the permissions to join and speak in your voice channel!"
            );
        }
        try {
            let connection = await voiceChannel.join();
            this.play(connection, url);
        } catch (e) {
            console.log('Cant join with error ', e);
            return message.reply('Cant join with error ' + e);
        }

    }

    private async play(connection: Discord.VoiceConnection, url: string) {

        connection.play(await ytdl(url)).on("finish", () => {
            console.log('finished playing')
        }).on('error', () => {
            console.log("Fuck you error come")
        });

    }
}