import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../source/server';
import { v4 as uuid } from "uuid";

chai.use(chaiHttp);

describe('User Registration and Authentication', () => {

    const username = `testuser ${uuid()}`

    it('should register a new user', (done) => {
        const user = {
            username: username,
            password: 'testpassword'
        };
        chai.request(app)
            .post('/users/register')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.equal(201);
                expect(res.body.user).to.be.an('object');
                done();
            });
    });

    it('should authenticate a user', (done) => {
        const user = {
            username: username,
            password: 'testpassword'
        };
        chai.request(app)
            .post('/users/login')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.token).to.be.a('string');
                done();
            });
    });
});