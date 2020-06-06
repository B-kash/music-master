import Discord from 'discord.js';
import ytdl from 'ytdl-core';

export interface Song {
    title: string;
    url: string;
    requestedBy: string;
}

export interface BotState {
    playlist: Song[];
    textChannel: Discord.TextChannel;
    voiceChannel: Discord.VoiceChannel;
    connection: Discord.VoiceConnection;
    playing: boolean;
}

export class BotServer {
    private bot: Discord.Client;
    private state: BotState | undefined;

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
        this.bot.on('message', async (message: Discord.Message) => {
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
                    case 'play':
                        await this.manageState(args.shift(), message);
                        if (!this.state.playing) {
                            this.joinVoice();
                        }
                        break;
                    case 'skip':
                        this.skip();
                        break;
                    default:
                        message.channel.send('DAMNN!!');
                }
            } else {
                console.log('Not mine!!');
            }
        });
    }

    private async joinVoice() {
        try {
            this.state.connection = await this.state.voiceChannel.join();
            this.play();
        } catch (e) {
            console.log('Cant join with error ', e);
            return this.state.textChannel.send('Cant join with error ' + e);
        }

    }

    private async play() {
        if (this.state.playlist.length === 0) {
            this.state.voiceChannel.leave();
            this.state = null;
            return ;
        }
        const connection = this.state.connection;
        const song: Song = this.state.playlist.shift();
        connection
            .play(await ytdl(song.url))
            .once('speaking', () => {
                this.state.playing = true
            })
            .on("finish", () => {
                console.log('finished playing');
                this.play();
            }).on('error', () => {
            console.log("Fuck you error come");
            this.state.textChannel.send('Error while trying to play. Try disconnecting and reconnecting the bot again')
        });

    }

    private async manageState(url: string, message: Discord.Message) {
        const voiceChannel: Discord.VoiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.channel.send(
                "You need to be in a voice channel to play music!"
            );
        const permissions: Readonly<Discord.Permissions> = voiceChannel.permissionsFor(message.client.user);
        if (
            !permissions.has("CONNECT")
            || !permissions.has("SPEAK")
        ) {
            return message.channel.send(
                "I need the permissions to join and speak in your voice channel!"
            );
        }
        const details = await ytdl.getBasicInfo(url);
        const song: Song = {
            title: details.videoDetails.title,
            url: details.videoDetails.video_url,
            requestedBy: message.author.username
        };
        if (!this.state) {
            this.state = {
                playlist: [song],
                textChannel: message.channel as Discord.TextChannel,
                voiceChannel: voiceChannel,
                connection: null,
                playing: false
            }
        }else{
            this.state.playlist.push(song);
        }
    }

    private skip() {
        this.state.connection.dispatcher.end();
    }
}