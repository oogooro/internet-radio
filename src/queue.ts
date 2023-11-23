import { ffprobe } from '@dropb/ffprobe';
import { createReadStream } from 'fs';
import Throttle from 'throttle';
import { Response } from 'express';
import { logger } from '.';

export default class Queue {
    private sinks: Response[] = [];
    songs: string[] = [];

    constructor(songs: string[]) {
        this.songs = songs;

        const loop = async () => {
            const stream = await this.getStream(this.songs[0]);

            logger.log({
                level: 'info',
                message: `Now playing: ${this.songs[0].split('/').at(-1)}`,
                color: 'blueBright',
            });

            stream.on('data', (chunk: Buffer) => this.broadcastToAllSinks(chunk));
            stream.once('end', () => {
                this.songs.push(this.songs.shift());
                loop();
            });
        }

        loop();
    }

    private broadcastToAllSinks(chunk: Buffer) {
        for (const sink of this.sinks) {
            sink.write(chunk);
        }
    }

    private async getStream(path: string): Promise<Throttle> {
        const bitRate = (await ffprobe(path)).format.bit_rate;
        const throttle = new Throttle(parseInt(bitRate) / 8);
        
        return createReadStream(path).pipe(throttle);
    }
    
    public addSink(sink: Response) {
        sink.status(206);
        sink.setHeader('Content-Type', 'audio/mpeg');
        this.sinks.push(sink);
    }

    public appendSongs(songs: string[]) {
        this.songs.concat(songs);
    }
}