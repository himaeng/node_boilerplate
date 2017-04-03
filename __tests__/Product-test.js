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

    it('should return objs with correct props', () => {
      return request(app).get('/api/v1/product')
        .expect(200)
        .then(response => {
          let sampleKeys = Object.keys(response.body[0]);
          expectedProps.forEach((key) => {
            expect(sampleKeys.includes(key)).toBe(true);
          })
        })
    });

    it('should not return objects with extra props', () => {
      return request(app).get('/api/v1/product')
        .expect(200)
        .then(response => {
          let extraProps = Object.keys(response.body[0]).filter((key) => {
            return !expectedProps.includes(key);
          });
          expect(extraProps.length).toBe(0);
        })
    })
  });

  describe('GET /api/v1/product/:id - get product item by id', () => {
    it('should return an object of type Product', () => {
      return request(app).get('/api/v1/product/1')
        .expect(200)
        .then((response) => {
          const reqKeys = ['id', 'name', 'price', 'quantity'];
          const {item} = response.body;
          reqKeys.forEach((key) => {
            expect(Object.keys(item)).toContain(key);
          });
        })
    });

    it('should return a Product with request id', () => {
      return request(app).get('/api/v1/product/1')
        .expect(200)
        .then((response) => {
          expect(response.body.item).toEqual({
            "id": 1,
            "name": "banana",
            "quantity": 15,
            "price": 1
          })
        })
    })
  })

});
