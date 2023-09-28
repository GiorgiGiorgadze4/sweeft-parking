import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../source/server';
import { v4 as uuid } from "uuid";

chai.use(chaiHttp);

const token = process.env.TEST_TOKEN;  

describe('Parking Functionalities', () => {
    let parkingZoneId: string;

    it('should get all parking zones', (done) => {
        chai.request(app)
            .get('/parking')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('array');
                parkingZoneId = res.body[0].id;
                done();
            });
    });

    it('should reserve a parking zone', (done) => {
        const reservation = {
            carId: '1',
            parkingZoneId: parkingZoneId
        };
        chai.request(app)
            .post('/parking/reserve')
            .set('Authorization', `Bearer ${token}`)
            .send(reservation)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal('Parking zone reserved successfully');
                done();
            });
    });

    it('should get parking history for a user', (done) => {
        chai.request(app)
            .get('/parking/history')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('array');
                done();
            });
    });

    const zoneName = `New Zone ${uuid()}`;

    it('should add a parking zone (admin functionality)', (done) => {
        const newZone = {
            name: zoneName,
            location: '123 Test St',
            hourlyRate: 5
        };
        chai.request(app)
            .post('/admin/parking/zone/add') 
            .set('Authorization', `Bearer ${token}`)
            .send(newZone)
            .end((err, res) => {
                expect(res.status).to.equal(201);
                expect(res.body.message).to.equal('Parking zone added successfully');
                done();
            });
    });

    const updatedZoneName = `Updated Zone ${uuid()}`;

    it('should edit a parking zone (admin functionality)', (done) => {
        const updatedZone = {
            name: updatedZoneName,
            location: '456 Test Ave',
            hourlyRate: 10
        };
        chai.request(app)
            .patch(`/admin/parking/zone/${parkingZoneId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedZone)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal('Parking zone updated successfully');
                done();
            });
    });

    it('should delete a parking zone (admin functionality)', (done) => {
        chai.request(app)
            .delete(`/admin/parking/zone/${parkingZoneId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.message).to.equal('Parking zone deleted successfully');
                done();
            });
    });
});
