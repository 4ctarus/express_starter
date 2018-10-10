const User = require('../models/user'),
  mongoose = require('mongoose'),
  config = require('../config'),
  should = require('chai').should(),
  expect = require('chai').expect,
  supertest = require('supertest');

const url = `${config.protocol}://${config.host}:${config.port}`;
const api = supertest(url.toLowerCase());

describe('User', function () {
  var test;

  before(function (done) {
    api.post('/auth/signup')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        email: 'test@test.com',
        password: '12345678',
        name: 'test',
        username: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(200, {
        email: 'test@test.com',
        name: 'test',
        username: 'test'
      })
      .end(function (err, res) {
        expect(res.body).to.not.have.property('password');
        expect(res.body).to.have.property('active');
        expect(res.body.active).to.not.equal(true);
        expect(res.body).to.have.property('admin');
        expect(res.body.admin).to.not.equal(true);
        test = res.body;
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
    User.findByIdAndUpdate(user._id, {
        active: true
      }, {
        new: true,
        select: '-password -recoveryCode -updatedAt'
      })
      .then(res => {
        console.log('user', res, user);
        done();
      })
      .catch(err => {
        console.log('err', err);
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
      .expect(200, done);
  });
});