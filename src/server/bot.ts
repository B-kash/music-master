import {Song} from "./song";
import ytdl from 'ytdl-core';
import {BotState} from "./bot-state";

export class Bot {
    state: BotState;

    async joinVoice(): Promise<void> {
        try {
            this.state.connection = await this.state.voiceChannel.join();
            this.play().catch((err: Error) => {
                console.log('Something went wrong try again', err);
            });
        } catch (e) {
            console.log('Cant join with error ', e);
            this.state.textChannel.send('Cant join with error ' + e);
        }

    }

    async play(): Promise<void> {
        if (this.state.playlist.length === 0) {
            this.state.voiceChannel.leave();
            this.state = null;
            return;
        }
        const connection = this.state.connection;
        const song: Song = this.state.playlist.shift();
        connection
            .play(await ytdl(song.url))
            .once('speaking', () => {
                this.state.playing = true;
            }).on("finish", () => {
            console.log('finished playing');
            this.play();
        }).on('error', () => {
            console.log("Fuck you error come");
            this.state.textChannel.send('Error while trying to play. Try disconnecting and reconnecting the bot again');
        });
    }

    async getSong(url: string, requestedBy: string): Promise<Song> {
        const details = await ytdl.getBasicInfo(url);
        return {
            title: details.videoDetails.title,
            url: details.videoDetails.video_url,
            requestedBy: requestedBy
        };
    }

    skip(): void {
        this.state.connection.dispatcher.end();
    }

    pause(): void {
        this.state.connection.dispatcher.pause();
    }

    resume(): void {
        this.state.connection.dispatcher.resume();
    }

    stop(): void {
        this.state.connection.dispatcher.end();
        this.state.playlist.length = 0;
    }

    isPlaying(): boolean {
        return this.state?.playing;
    }

    updateState(state: BotState): void {
        this.state = state;
    }
}