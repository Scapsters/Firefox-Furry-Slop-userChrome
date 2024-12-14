import express, { Request, Response } from 'express';
import https from 'https';
import { DB_RESTART } from './db/db.ts';
import path from 'path';
import cors from 'cors';

import { getPostForTweetID, getRandomTweetData, makePath } from './images.ts';
import AbsolutePathToRepositoryRoot from './AbsolutePathToRepositoryRoot.ts';
import type TweetData from '../../interfaces/TweetData.ts';

// Set to false for deployment
const DEV = true;
const port = DEV ? 5000 : 80;

// Set to true to RESET THE DATABASE. TURN IT OFF AFTER
const RESET_DATABASE = false;

const buildPath = path.join(AbsolutePathToRepositoryRoot, 'client', 'build');
const RandomTweetData = async (_: Request, res: Response) => { res.send(await getRandomTweetData()); };

const Posts = async (req: Request, res: Response) => { 
    const tweetidString = req.params.tweetid
    console.log(req.ip)

    if(tweetidString === undefined) {
        res.send({ response: "No body" })
        return
    }

    const tweetid = Number(tweetidString)
    if(!tweetid) {
        res.send({ response: "Invalid tweetid" })
        return
    }

    const tweetData: TweetData = await getPostForTweetID(tweetid)
    res.send(tweetData)
}


express()
    .use(cors())
    .use('/.well-known/acme-challenge', express.static(makePath('/.well-known/acme-challenge')))    // HTTPS Certificate Renewal
    .use(express.static(buildPath))         // Host the prod build of the site                                                   
    .get('/', express.static(buildPath))    // Serve the prod build                                                      
    .get('/RandomTweetData', RandomTweetData)
    .get('/Posts/:tweetid', Posts)
    .listen(port, '0.0.0.0', () => {console.log(`Server is running on port ${port}`)})

if (RESET_DATABASE) {
    console.log("Resetting the database")
    DB_RESTART()
}