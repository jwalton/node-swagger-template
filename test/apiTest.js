import {expect} from 'chai';
import request from 'supertest';

import {makeServer} from '../src/server';

const USER_ID = '54f0be26ae8aba260b8f6db7';

describe('api /user tests', function() {
    before(async function() {
        this.app = await makeServer();
    });

    it('should GET a user', function() {
        return request(this.app)
        .get(`/api/v1/user?id=${USER_ID}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, {
            id: USER_ID,
            username: 'jwalton'
        });
    });

    it('should not GET a user with an invalid ID', async function() {
        const response = await request(this.app)
        .get(`/api/v1/user?id=foo`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400);

        expect(response.body.message).to.equal('Validation errors');
        expect(response.body.errors[0].message)
            .to.equal("Invalid parameter (id): Value failed JSON Schema validation");
        expect(response.body.errors[0].errors[0].message)
            .to.equal("Object didn't pass validation for format ObjectId: foo");
    });

});