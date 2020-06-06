import Discord from 'discord.js';
import {BotState} from "./bot-state";
import {Song} from "./song";
import {BotActions} from "./bot-actions";

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
                            BotActions.joinVoice(this.state);
                        }
                        break;
                    case 'skip':
                        BotActions.skip(this.state);
                        break;
                    case 'pause':
                        BotActions.pause(this.state);
                        break;
                    case 'resume':
                        BotActions.resume(this.state);
                        break;
                    case 'stop':
                        BotActions.stop(this.state);
                        break;
                    default:
                        message.channel.send('DAMNN!!');
                }
            } else {
                console.log('Not mine!!');
            }
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
        const song: Song = await BotActions.getSong(url, message.author.username);
        if (!this.state) {
            this.state = {
                playlist: [song],
                textChannel: message.channel as Discord.TextChannel,
                voiceChannel: voiceChannel,
                connection: null,
                playing: false
            }
        } else {
            this.state.playlist.push(song);
        }
    }

}