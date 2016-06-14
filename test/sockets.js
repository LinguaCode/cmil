var mongoose = require('mongoose');
var app = require('../src/app');
var request = require('supertest')(app);

var testNameService = require('../src/api/v1/services/testName');

var Test = mongoose.model('Test');

var idOfTest = Math.round(Math.random() * 10000);
var userName = 'test_user_' + idOfTest;
var groupName = 'test_group_' + idOfTest;
var eventTitle = 'test_event_' + idOfTest;
var messageTitle = 'test_message_' + idOfTest;

var eventTitleChanged = 'test_event_changed_' + idOfTest;
var messageTitleChanged = 'test_message_changed_' + idOfTest;

var groupId;
var userId;
var memberId;
var eventId;
var messageId;
var commonId = mongoose.Types.ObjectId();
var fakeId = 'fakeId';

var token;

describe('Preparation', function () {

  it('create user and validate.', function (done) {
    this.timeout(5000);
    request
      .post('/api/v1/users/signup')
      .send({
        'name': userName,
        'password': 'password'
      })
      .expect(200, function (err, res) {
        if (err) {
          return done(err);
        }
        userService.forceVerify(userName)
          .then(function (user) {
            userId = user._id;
            token = 'JWT ' + jwt.encode(user, global.secret);

            return groupService.insert({
              name: groupName,
              ownerId: userId
            })
          })
          .then(function (group) {
            groupId = group._id;
            return groupService.addGroupMember(groupId, userId, true, 0);
          })
          .then(function (member) {
            memberId = member._id;
            return eventService.create({
              groupId: groupId,
              title: eventTitle
            })
          })
          .then(function (event) {
            eventId = event._id;
            return messageService.create({
              groupId: groupId,
              title: messageTitle
            });
          })
          .then(function (message) {
            messageId = message._id;

            console.log('token: ' + token);
            console.log('userId: ' + userId);
            console.log('memberId: ' + memberId);
            console.log('groupId: ' + groupId);
            console.log('eventId: ' + eventId);
            console.log('messageId: ' + messageId);
            done();
          })
          .catch(function (err) {
            return done(err);
          });
      });
  });

});

describe('Events', function () {

  describe('Create', function () {

    it('create: 201', function (done) {

      request
        .post('/api/v1/events/')
        .set('Authorization', token)
        .send({
          'groupId': groupId,
          'title': eventTitle,
          'description': 'description',
          'color': 'color',
          'dateTimeStart': 'Mon May 23 2016 19:29:26 GMT+0400 (AMT)',
          'duration': 60,
          'location': 'location',
          'notifyOnChange': true,
          'trackAttendance': false,
          'trackSignInSignOut': false
        })
        .expect(201, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('create: 400', function (done) {
      request
        .post('/api/v1/events/')
        .set('Authorization', token)
        .send({
          'title': eventTitle,
          'description': 'description',
          'color': 'color',
          'dateTimeStart': 'Mon May 23 2016 19:29:26 GMT+0400 (AMT)',
          'duration': 60,
          'location': 'location',
          'notifyOnChange': true,
          'trackAttendance': false,
          'trackSignInSignOut': false
        })
        .expect(400, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('Operations', function () {

    describe('SignIn and SignOut', function () {

      it('SignIn and SignOut: 200', function (done) {

        request
          .patch('/api/v1/events/' + eventId + '/members/' + memberId + '/signInOut')
          .set('Authorization', token)
          .send({
            'type': 'signIn',
            'pin': undefined
          })
          .expect(200, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

      it('SignIn and SignOut: 404', function (done) {

        request
          .patch('/api/v1/events/' + commonId + '/members/' + memberId + '/signInOut')
          .set('Authorization', token)
          .send({
            'type': 'signIn',
            'pin': undefined
          })
          .expect(404, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

    });

    describe('Reservation', function () {

      it('Reservation: 200', function (done) {
        request
          .patch('/api/v1/events/' + eventId + '/members/' + memberId + '/reserve')
          .set('Authorization', token)
          .expect(200, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

      it('Reservation: 404', function (done) {
        request
          .patch('/api/v1/events/' + commonId + '/members/' + memberId + '/reserve')
          .set('Authorization', token)
          .expect(404, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

    });

    describe('Operations', function () {

      it('Attendance: 200', function (done) {
        request
          .patch('/api/v1/events/' + eventId + '/members/' + memberId + '/attend')
          .set('Authorization', token)
          .expect(200, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

      it('Attendance: 404', function (done) {
        request
          .patch('/api/v1/events/' + commonId + '/members/' + memberId + '/attend')
          .set('Authorization', token)
          .expect(404, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

    });

  });

  describe('Update', function () {

    it('update: 200', function (done) {
      request
        .put('/api/v1/events/' + eventId)
        .set('Authorization', token)
        .send({
          'title': eventTitleChanged
        })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('update: 404', function (done) {
      request
        .put('/api/v1/events/' + commonId)
        .set('Authorization', token)
        .send({
          'title': eventTitleChanged
        })
        .expect(404, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('Delete', function () {

    it('delete: 200', function (done) {
      request
        .delete('/api/v1/events/' + eventId)
        .set('Authorization', token)
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('delete: 404', function (done) {
      request
        .delete('/api/v1/events/' + commonId)
        .set('Authorization', token)
        .expect(404, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('Get', function () {

    it('list: 200', function (done) {
      request
        .post('/api/v1/events/list')
        .set('Authorization', token)
        .send({
          'groupIds': [groupId]
        })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    describe('Instance', function () {

      it('Instance: 200', function (done) {
        request
          .get('/api/v1/events/' + eventId)
          .set('Authorization', token)
          .expect(200, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

      it('Instance: 404', function (done) {
        request
          .get('/api/v1/events/' + commonId)
          .set('Authorization', token)
          .expect(404, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

    });
  });

});

describe('Messages', function () {

  describe('Create', function () {

    it('create: 201', function (done) {
      request
        .post('/api/v1/messages/')
        .set('Authorization', token)
        .send({
          'groupId': groupId,
          'title': 'title',
          'messageText': 'messageText',
          'notifyOnChange': false
        })
        .expect(201, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('Operations', function () {

    it('Message read mark: 200', function (done) {
      request
        .patch('/api/v1/messages/' + messageId + '/msgRead')
        .set('Authorization', token)
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('Message read mark: 404', function (done) {
      request
        .patch('/api/v1/messages/' + commonId + '/msgRead')
        .set('Authorization', token)
        .expect(404, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('Update', function () {

    it('Update: 200', function (done) {
      request
        .put('/api/v1/messages/' + messageId)
        .set('Authorization', token)
        .send({
          'title': messageTitleChanged
        })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('Update: 404', function (done) {
      request
        .put('/api/v1/messages/' + commonId)
        .set('Authorization', token)
        .send({
          'title': messageTitleChanged
        })
        .expect(404, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('Delete', function () {

    it('delete: 200', function (done) {
      request
        .delete('/api/v1/messages/' + messageId)
        .set('Authorization', token)
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('delete: 404', function (done) {
      request
        .delete('/api/v1/messages/' + commonId)
        .set('Authorization', token)
        .expect(404, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

  describe('GET', function () {

    it('list: 200', function (done) {
      request
        .post('/api/v1/messages/list')
        .set('Authorization', token)
        .send({
          'groupIds': [groupId]
        })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    describe('Instance', function () {

      it('instance: 200', function (done) {
        request
          .get('/api/v1/messages/' + messageId)
          .set('Authorization', token)
          .expect(200, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

      it('instance: 404', function (done) {
        request
          .get('/api/v1/messages/' + commonId)
          .set('Authorization', token)
          .expect(404, function (err, res) {
            if (err) {
              return done(err);
            }
            done();
          });
      });

    });

  });

});