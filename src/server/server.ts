import Discord from 'discord.js';

export class Server {
    private bot: Discord.Client;

    constructor() {
        this.bot = new Discord.Client();
    }

    start(): void {
        this.bot.on('ready', () => {
            console.log('Hello world i am here');
        });
        this.bot.on('message', (msg) => {
            if (msg.content == "HELLO") {
                msg.reply("HEY THERE!!");
            }
        });
        this.bot.login(process.env.BOT_TOKEN);
    }
}