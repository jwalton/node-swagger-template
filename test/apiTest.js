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

});