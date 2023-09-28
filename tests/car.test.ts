import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../source/server';

chai.use(chaiHttp);

const token = process.env.TEST_TOKEN as string;

describe('Car Functionalities', () => {
    let carId: string;

    it('should add a new car', (done) => {
        const car = {
            name: 'Test Car',
            stateNumber: '123ABC',
            type: 'Sedan'
        };
        chai.request(app)
            .post('/cars')
            .set('Authorization', `Bearer ${token}`)
            .send(car)
            .end((err, res) => {
                expect(res.status).to.equal(201);
                expect(res.body.car).to.be.an('object');
                carId = res.body.car.id;
                done();
            });
    });

    it('should edit the car', (done) => {
        const updatedCar = {
            name: 'Updated Car',
            stateNumber: '456DEF',
            type: 'Convertible'
        };
        chai.request(app)
            .patch(`/cars/${carId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedCar)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.car.name).to.equal('Updated Car');
                expect(res.body.car.stateNumber).to.equal('456DEF');
                expect(res.body.car.type).to.equal('Convertible');
                done();
            });
    });

    it('should get the user’s cars', (done) => {
        chai.request(app)
            .get('/cars')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.cars).to.be.an('array');
                expect(res.body.cars).to.have.length.greaterThan(0);
                done();
            });
    });

    it('should delete the car', (done) => {
        chai.request(app)
            .delete(`/cars/${carId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal('Car deleted successfully');
                done();
            });
    });

    
});
