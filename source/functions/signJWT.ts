import jwt from 'jsonwebtoken';
import config from '../config/config';
import { User } from '../models/user.model';

const signJWT = (user: User, callback: (error: Error | null, token: string | null) => void): void => {
    var timeSinceEpoch = new Date().getTime();
    var expirationTime = timeSinceEpoch + Number(config.server.token.expireTime) * 100000;
    var expirationTimeInSeconds = Math.floor(expirationTime / 1000);

    // TODO: See if the user has admin priviliges from db

    try {
        jwt.sign(
            {
                userId: user.id, // Adding this so you can identify the user from the token itself
                username: user.username,
                administrator: user.administrator // This will include the administrator status in the token
            },
            config.server.token.secret,
            {
                issuer: config.server.token.issuer,
                algorithm: 'HS256',
                expiresIn: expirationTimeInSeconds
            },
            (error, token) => {
                if (error) {
                    callback(error, null);
                } else if (token) {
                    callback(null, token);
                }
            }
        );
    } catch (error: any) {
        callback(error, null);
    }
};

export default signJWT;
