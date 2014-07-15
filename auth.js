var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    config = require('./config'),
    userdb = require('./db/users')
    ;


//This happens once, right after login.  user is a user instance, from the DB.  put the userid in the session.
passport.serializeUser(function(user, done) {
  done(null, user.UserId);
});

//every request after login, this happens.  Get the user from the database.  That user becomes a property on the request
passport.deserializeUser(function(obj, done) {
    userdb.findUser({ UserId: obj }, function(user) {
        if (user) {
            done(null, user);
        } else {
            done('could not find user');
        }
    });
});

passport.use(new FacebookStrategy(config.passport.facebook,
  function(accessToken, refreshToken, profile, done) {
      //this is where you get or create the user.  It happens after user is authenticated by facebook.
      getOrCreateUser(profile,done);
  }
));


passport.use(new GoogleStrategy(config.passport.google,
  function(accessToken, refreshToken, profile, done) {
      //this is where you get or create the user.  It happens after user is authenticated by google.
      getOrCreateUser(profile,done);
  }
));

function getOrCreateUser(profile, done){
      userdb.getOrCreateUserFromOAuthProfile(profile, function(user) {
          userdb.setUserLoggedInNow(user, function() {
              done(null, user);
          });
      });

}

module.exports.setUp = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

};

module.exports.routes = function(app) {
    
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }));

app.get('/auth/facebook', passport.authenticate('facebook'));

var authRedirects ={ 
    successRedirect: '/',
    failureRedirect: '/' };

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
    app.get('/auth/googlecallback', passport.authenticate('google', authRedirects));


    app.get('/auth/facebookcallback', passport.authenticate('facebook', authRedirects));

    app.get('/auth/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


}