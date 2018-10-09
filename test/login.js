const supertest = require('supertest'),
  api = supertest('http://192.168.0.12:3000');

describe('User', function () {

  before(function (done) {
    api.post('/auth/signup')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        email: 'kill88ma@gmail.com',
        password: '12345678',
        name: 'hemaidia',
        username: 'test136'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        console.log(res.body, err);
        done();
      });
  });

  it('should return a 200 response', function (done) {
    api.get('/users/1')
      .set('Accept', 'application/json')
      .expect(200, done);
  });
});