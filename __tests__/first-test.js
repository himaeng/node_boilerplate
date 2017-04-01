import request from 'supertest-as-promised';
import express from 'express';
import api from '../src/api';
import { version } from '../package.json';

let app = express();
app.use('/api', api());

describe('Flow API', () => {
  it('root test', () => {
    return request(app).get('/api')
    .expect(200)
    .then((res) => {
      expect(typeof res.body.version).toBe('string');
      expect(res.body.version).toBe(version);
    });
  });
});
