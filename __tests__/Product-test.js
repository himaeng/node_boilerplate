import request from 'supertest-as-promised';
import express from 'express';
import api from '../src/api';

let app = express();
app.use('/api', api());

describe('FlowAPI', () => {
  describe('GET /api/v1/product - get all product', () => {
    let expectedProps = ['id', 'name', 'quantity', 'price'];
    it('should return JSON array', () => {
      return request(app).get('/api/v1/product')
        .expect(200)
        .then(response => {
          expect(response.body).toBeInstanceOf(Array);
        })
    });
  });

});
