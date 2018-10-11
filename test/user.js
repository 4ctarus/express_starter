const User = require('../models/user'),
  mongoose = require('mongoose'),
  config = require('../config'),
  should = require('chai').should(),
  expect = require('chai').expect,
  supertest = require('supertest');

const url = `${config.protocol}://${config.host}:${config.port}`;
const api = supertest(url.toLowerCase());

describe('User', function () {
  var test_user;
  var token;

  before(function (done) {
    test_user = new User({
      email: 'test@test.com',
      password: '12345678',
      name: 'test',
      username: 'test'
    });
    test_user.save(function (err) {
      if (err) console.log(err);
      done();
    });
  });

  after(function (done) {
    User.deleteOne({
      email: 'test@test.com'
    }, (err) => {
      if (err) console.log('error', err);
      done();
    });
  });

  it('login not active', function (done) {
    api.post('/auth')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        email: 'test@test.com',
        password: '12345678'
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        expect(res.body).to.have.property('msg');
        expect(res.body.msg).to.equal('auth_login_user_400');
        done();
      });
  });

  it('active user', function (done) {
    test_user.active = true;
    test_user.save(function (err) {
      if (err) console.log(err);
      done();
    });
  });

  it('login', function (done) {
    api.post('/auth')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        email: 'test@test.com',
        password: '12345678'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        expect(res.body).to.have.property('token');
        expect(res.body.token).to.not.equal(null);
        token = res.body.token;
        done();
      });
  });

  it('get user without authorization Bearer', function (done) {
    api.get(`/users/${test_user._id}`)
      .expect('Content-Type', /json/)
      .expect(401)
      .end(function (err, res) {
        expect(res.body).to.have.property('msg');
        expect(res.body.msg).to.equal('unauthorized');
        done();
      });
  });

  it('get user with authorization Bearer', function (done) {
    api.get(`/users/${test_user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});