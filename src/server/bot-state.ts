import {Song} from "./song";
import Discord from 'discord.js';

export interface BotState {
    playlist: Song[];
    textChannel: Discord.TextChannel;
    voiceChannel: Discord.VoiceChannel;
    connection: Discord.VoiceConnection;
    playing: boolean;
}