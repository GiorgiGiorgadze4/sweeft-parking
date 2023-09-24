import jwt from 'jsonwebtoken';
import config from '../config/config';
import logging from '../config/logging';
import { Request, Response, NextFunction } from 'express';

const NAMESPACE = 'Auth';

const extractJWT = (req: Request, res: Response, next: NextFunction) => {
    req.headers.chemidamatebuli = 'asd';

    // logging.info(NAMESPACE, 'Validating token');

    console.log('\n\n');
    console.log('Extracting JWT...');
    console.log(req.url);
    console.log(req.method);
    console.log(req.headers.authorization);
    console.log('\n\n');

    // res.send('aq morchi');

    if (req.url === '/users/login') {
        console.log('user is logging in, no need to validate jwt token');
        return next();
    }
    if (req.url === '/users/register') {
        console.log('user is registering , no need to validate jwt token');
        return next();
    }

    let token = req.headers.authorization?.split(' ')[1];

    console.log('token: ', token);

    if (token) {
        jwt.verify(token, config.server.token.secret, (error, decoded) => {
            if (error) {
                console.log('jwt token is not valid!!!');
                return res.status(402).json({
                    message: 'Unauthorized'
                });
            } else {
                console.log('jwt token is valid, successfully authorized!!!');

                console.log('decoded: ', decoded);

                res.locals.jwt = decoded;
                next();
            }
        });
    } else {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }
};

export default extractJWT;
