import Discord from 'discord.js';

export class Server {
    private bot: Discord.Client;

    constructor() {
        this.bot = new Discord.Client();
    }

    start(): void {
        this.setUpListeners();
        this.bot.login(process.env.BOT_TOKEN);
    }

    private setUpListeners() {
        this.bot.on('ready', () => {
            console.log('HEllo world i am here');
        });
        this.bot.on('message', (message: Discord.Message) => {
            if (message.content.substring(0, process.env.PREFIX.length) === process.env.PREFIX) {
                const args = message.content.substring(process.env.PREFIX.length).split(" ");
                const command = args.shift();
                switch (command) {
                    case 'ping':
                        message.reply('Pong!');
                        break;
                    case 'tic':
                        message.reply('TAC!');
                        break;
                    default:
                        message.channel.send('DAMNN!!');
                }
            } else {
                console.log('Not mine!!');
            }
        });
    }
}