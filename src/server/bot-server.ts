import Discord from 'discord.js';
import {BotState} from "./bot-state";
import {Song} from "./song";
import {Bot} from "./bot";

export class BotServer {
    private client: Discord.Client;
    private bot: Bot;

    constructor() {
        this.client = new Discord.Client();
    }

    start(): void {
        this.bot = new Bot();
        this.setUpListeners();
        this.client.login(process.env.BOT_TOKEN);
    }

    private setUpListeners(): void {
        this.client.on('ready', () => {
            console.log('HEllo world i am here');
        });
        this.client.on('message', this.onMessage);
    }

    private onMessage = async (message: Discord.Message): Promise<void> => {
        if (message.author.bot) {
            return;
        }
        try {
            if (message.content.substring(0, process.env.PREFIX.length) === process.env.PREFIX) {
                const args = message.content.substring(process.env.PREFIX.length).split(" ");
                const command = args.shift();
                switch (command) {
                    case 'play':
                        this.checkForError(message);
                        await this.manageState(args.shift(), message);
                        if (!this.bot.isPlaying()) {
                            this.bot.joinVoice().catch((err: Error) => {
                                throw err;
                            });
                        }
                        break;
                    case 'skip':
                        this.checkForError(message);
                        this.bot.skip();
                        break;
                    case 'pause':
                        this.checkForError(message);
                        this.bot.pause();
                        break;
                    case 'resume':
                        this.checkForError(message);
                        this.bot.resume();
                        break;
                    case 'stop':
                        this.checkForError(message);
                        this.bot.stop();
                        break;
                    default:
                        message.channel.send('DAMNN!!');
                }
            } else {
                console.log('Not mine!!');
            }
        } catch (e) {
            return;
        }
    };

    private checkForError(message: Discord.Message) {
        const voiceChannel: Discord.VoiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.channel.send(
                "You need to be in a voice channel to play music!"
            );
            throw new Error();
        }
        const permissions: Readonly<Discord.Permissions> = voiceChannel.permissionsFor(message.client.user);
        if (
            !permissions.has("CONNECT")
            || !permissions.has("SPEAK")
        ) {
            message.channel.send(
                "I need the permissions to join and speak in your voice channel!"
            );
            throw new Error();
        }
    }

    private async manageState(url: string, message: Discord.Message) {
        const voiceChannel: Discord.VoiceChannel = message.member.voice.channel;
        const song: Song = await this.bot.getSong(url, message.author.username);
        let state: BotState = this.bot.state;
        if (!state) {
            state = {
                playlist: [song],
                textChannel: message.channel as Discord.TextChannel,
                voiceChannel: voiceChannel,
                connection: null,
                playing: false
            };
            this.bot.updateState(state);
        } else {
            state.playlist.push(song);
        }
    }

}