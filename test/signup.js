const User = require('../models/user'),
  config = require('../config'),
  should = require('chai').should(),
  expect = require('chai').expect,
  supertest = require('supertest');

const url = `${config.protocol}://${config.host}:${config.port}`;
const api = supertest(url.toLowerCase());

describe('Signup', function () {

  // before(function () { });

  after(function (done) {
    User.deleteOne({
      email: 'test@test.com'
    }, (err) => {
      done();
    });
  });

  it('password too short', function (done) {
    api.post('/auth/signup')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        email: 'test@test.com',
        password: '1234567',
        name: 'test',
        username: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        expect(res.body).to.have.property('invalid');
        expect(res.body.invalid).to.be.an('array').that.include('password');
        done();
      });
  });

  it('invalid email', function (done) {
    api.post('/auth/signup')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        email: 'test@test',
        password: '12345678',
        name: 'test',
        username: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        expect(res.body).to.have.property('invalid');
        expect(res.body.invalid).to.be.an('array').that.include('email');
        done();
      });
  });

  it('invalid username', function (done) {
    api.post('/auth/signup')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        email: 'test@test.com',
        password: '12345678',
        name: 'test',
        username: 'test%'
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        expect(res.body).to.have.property('invalid');
        expect(res.body.invalid).to.be.an('array').that.include('username');
        done();
      });
  });

  it('create normal user', function (done) {
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
        done();
      });
  });

  it('create normal user with existing email', function (done) {
    api.post('/auth/signup')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        email: 'test@test.com',
        password: '12345678',
        name: 'test',
        username: 'test2'
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        expect(res.body).to.have.property('msg');
        expect(res.body.msg).to.equal('already_exist');
        done();
      });
  });

  it('create normal user with existing username', function (done) {
    api.post('/auth/signup')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send({
        email: 'test2@test.com',
        password: '12345678',
        name: 'test',
        username: 'test'
      })
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        expect(res.body).to.have.property('msg');
        expect(res.body.msg).to.equal('already_exist');
        done();
      });
  });
});