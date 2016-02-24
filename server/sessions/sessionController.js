var Session = require('../../db/models').Session;
var User = require('../../db/models').User;
var Mailgun = require('mailgun-js');
var config = require('../config/config');

module.exports.addSession = function(req, res){
  Session.create(req.body).then(function(session) {
    res.send(session)
  })
  .catch(function(err) {
    console.error('Error creating session: ', err);
  });
};

module.exports.getSessions = function(req, res){
  Session.findAll({ where: req.body, include: [User]}).then(function(sessions) { // 
    if (sessions){
      res.json(sessions);
    } else {
      console.log('No sessions found');
      res.end();
    }
  })
  .catch(function(err) {
    console.error('Error getting sessions: ', err);
    res.end();
  });
};
module.exports.updateStatus = function(req, res){
  var status = req.body.status;
  var id = parseInt(req.body.id);

  Session.findById(id).then(function(session){
    session.status = status;
    session.save().then(function(){
      res.send(session);
    }).catch(function(err){
      console.log(err);
    });
  });
};
module.exports.deleteSession = function(req, res){
  Session.findById(req.id).then(function(session){
    return session.destroy();
  }).then(function(){
    console.log('Session was deleted.');
  });
};

module.exports.checkAuth = function(req, res, next) {
  if(req.user && req.user.id) {
    next();
  } else {
    res.send('Please sign in to create a session.');
  }
};

module.exports.registerSession = function(req, res) {
  var mailgun = new Mailgun({ apiKey: config.mailGunAPIKey, domain: config.mailGunDomain });
  
  var dataTutee = {
    from: 'learnitnow@learnitnow.herokuapp.com',
    to: [req.body.tuteeEmail, req.body.tutorEmail],
    subject: 'Session Registration',
    html: 'Hello, thank you for registering for the session. This is your hangout link: ' + req.body.link + '.'
  };
  
  mailgun.messages().send(dataTutee, function(err, body) {
    if (err) {
      res.send('error', { error: err });
    } else {
      res.send('submitted', { email: req.body.tuteeEmail });
    }
  });
};