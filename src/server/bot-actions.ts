import {Song} from "./song";
import {BotState} from "./bot-state";
import ytdl from 'ytdl-core';

export class BotActions {
    static async joinVoice(state: BotState) {
        try {
            state.connection = await state.voiceChannel.join();
            BotActions.play(state).catch((err: Error) => {
                console.log('Something went wrong try again', err)
            });
        } catch (e) {
            console.log('Cant join with error ', e);
            return state.textChannel.send('Cant join with error ' + e);
        }

    }

    static async play(state: BotState) {
        if (state.playlist.length === 0) {
            state.voiceChannel.leave();
            state = null;
            return;
        }
        const connection = state.connection;
        const song: Song = state.playlist.shift();
        connection
            .play(await ytdl(song.url))
            .once('speaking', () => {
                state.playing = true
            })
            .on("finish", () => {
                console.log('finished playing');
                BotActions.play(state);
            }).on('error', () => {
            console.log("Fuck you error come");
            state.textChannel.send('Error while trying to play. Try disconnecting and reconnecting the bot again')
        });
    }

    static async getSong(url: string, requestedBy: string): Promise<Song> {
        const details = await ytdl.getBasicInfo(url);
        return {
            title: details.videoDetails.title,
            url: details.videoDetails.video_url,
            requestedBy: requestedBy
        };
    }
}