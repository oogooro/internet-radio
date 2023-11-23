import express from 'express';
import { globSync } from 'glob';
import { shuffle } from 'lodash';
import Logger from 'log4uwu';
import moment from 'moment';
import Queue from './queue';

__dirname = __dirname.replaceAll('\\', '/'); // make it work with windows

const tracks = shuffle(globSync(`${__dirname}/../tracks/*.mp3`, { posix: true, }));

export const logger = new Logger({
    transports: [
        `${__dirname}/../logs/${moment(new Date()).format('D-M-YY-HH-mm-ss')}.log`,
    ],
});

const queue = new Queue(tracks);

const app = express();
const PORT = process.env.PORT || 80;

app.get('/eurobeat', (req, res, next) => {
    queue.addSink(res);
});

app.listen(PORT, () => {
    logger.log({
        level: 'init',
        message: `Running at *:${PORT}`,
        color: 'cyanBright',
    });
});