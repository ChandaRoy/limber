var mongoose = require('mongoose'),
		User = require('./models/user'),
		Project=require('./models/project'),
		LocalStrategy   = require('passport-local').Strategy,
		FacebookStrategy = require('passport-facebook').Strategy,
		GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
		configAuth = require('./config/auth'),
		bCrypt = require('bcrypt-nodejs');
		GitHubStrategy = require('passport-github2').Strategy;
		DropboxStrategy=require('passport-dropbox-oauth2').Strategy;
		module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
	passport.serializeUser(function(user, done) {

		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {

			// console.log("In desrialize",user);
			//console.log('deserializing user:',user.username);
			done(err, user);
		});
	});

	passport.use('local-login', new LocalStrategy({
			passReqToCallback : true,
			usernameField: 'email',
			passwordField: 'password'
		},
		function(req, email, password, done) {

			// check in mongo if a user with email exists or not
			User.findOne({ 'email' :  email },
				function(err, user) {
					// In case of any error, return using the done method
					if (err)
						return done(err);
					// Email does not exist, log the error and redirect back
					if (!user){
						return done(null, false);
					}
					// User exists but wrong password, log the error
					if (user.password !== password){
						return done(null, false); // redirect back to login page
					}
					else {
						// console.log("passing This: ");
						// console.log(user);
						return done(null,user);
					}

			});
		}
	));

	passport.use('sign-up', new LocalStrategy({
			passReqToCallback : true,// allows us to pass back the entire request to the callback
			usernameField: 'email',
			passwordField: 'password'
		},

		function(req, email, password, done) {
			// find a user in mongo with provided email
			User.findOne({ 'email' :  email }, function(err, user) {
				// In case of any error, return using the done method
				if (err){
					return done(err);
				}
				// already exists
				if (user) {
					return done(null, false);
				} else {
					// if there is no user, create the user
					var newUser = new User();

					// set the user's local credentials
					newUser.email = email;
					newUser.password = password;
					if(req.body.firstName===undefined)
					{
					newUser.firstName = "";
				  }
					else{
						newUser.firstName=req.body.firstName;
					}
					if(req.body.lastName===undefined)
					{
					newUser.lastName = "";
				  }
					else{
						newUser.lastName=req.body.lastName;
					}
					// save the user
					newUser.save(function(err) {
						if (err){
							throw err;
						}
						return done(null, newUser);
					});
				}
			});
		})
	);

	passport.use(new FacebookStrategy({
		    clientID: configAuth.facebookAuth.clientID,
		    clientSecret: configAuth.facebookAuth.clientSecret,
		    callbackURL: configAuth.facebookAuth.callbackURL,
				profileFields:['id','email','name','displayName','photos']
		  },
		  function(accessToken, refreshToken, profile, done) {
		    	process.nextTick(function(){
		    		User.findOne({'facebook.id': profile.id}, function(err, user){
		    			if(err)
		    				return done(err);
		    			if(user) {
		    				return done(null, user);
		    			} else {

		    				var newUser = new User();
		    				newUser.facebook.id = profile.id;
		    				newUser.facebook.token = accessToken;
								newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
		    				newUser.facebook.email = profile.emails[0].value;
								newUser.firstName=profile.name.givenName;
								newUser.lastName=profile.name.familyName;
								newUser.email=profile.emails[0].value;
								newUser.photo = profile.photos[0].value ;

		    				newUser.save(function(err){
		    					if(err)
		    						throw err;
		    					return done(null, newUser);
		    				})
		    			}
		    		});
		    	});
		    }

		));

		passport.use(new GoogleStrategy({
		    clientID: configAuth.googleAuth.clientID,
		    clientSecret: configAuth.googleAuth.clientSecret,
		    callbackURL: configAuth.googleAuth.callbackURL
		  },
		  function(accessToken, refreshToken, profile, done) {
		    	process.nextTick(function(){

		    		User.findOne({'google.id': profile.id}, function(err, user){
		    			if(err)
		    				return done(err);
		    			if(user)
		    				return done(null, user);
		    			else {
		    				var newUser = new User();
		    				newUser.google.id = profile.id;
		    				newUser.google.token = accessToken;
								newUser.google.name = profile.displayName;
		    				newUser.google.email = profile.emails[0].value;

								a=profile.displayName.split(" ");
								newUser.firstName=a[0];
								newUser.lastName=a[a.length-1];
								newUser.email=profile.emails[0].value;


		    				newUser.save(function(err){
		    					if(err)
		    						throw err;
		    					return done(null, newUser);
		    				})
		    				//console.log(profile);
		    			}
		    		});
		    	});
		    }

		));
			//================ Dropbox start: This has to use for uploading file to projects
			passport.use(new DropboxStrategy({
			    apiVersion: '2',
			    clientID: configAuth.dropboxAuth.clientID,
			    clientSecret: configAuth.dropboxAuth.clientSecret,
			    callbackURL: configAuth.dropboxAuth.callbackURL
			  },
			  function(accessToken, refreshToken, profile, done) {
			   Project.findOne({ 'dropbox.id': profile.id }, function (err, project) {
			      	if(err){
			      		return done(err);
			      	}else {

			     return done(null, project);}
			     });
			  }
			));

			//================Dropbox ends
		passport.use(new GitHubStrategy({
			apiVersion: '2',
			clientID: configAuth.githubAuth.clientID,
			clientSecret: configAuth.githubAuth.clientSecret,
			callbackURL: configAuth.githubAuth.callbackURL,
			passReqToCallback: true
		  },
		  function(req,accessToken, refreshToken, profile, done) {

		    // asynchronous verification, for effect...
		    process.nextTick(function () {
					User.findOne({'github.id': profile.id}, function(err, user){
						if(err){
							return done(err);}
						if(user){

							user.github.token=accessToken;
							user.save(function(err){
								if(err)
								throw err;
								return done(null, user.github);
							})
							}
						else {

							//req.user.github=github;
							User.findOne({'_id':req.user._id},function(err,doc){
								if(err){
									return done(err);
								}
								var github={};
								github.id=profile.id;
								github.token=accessToken;
								github.name=profile.username;
								doc.github=github;
								req.user.github=github;
								doc.save(function(err){
									if(err)
									throw err;
									return done(null,github);
								});

							});


		      // To keep the example simple, the user's GitHub profile is returned to
		      // represent the logged-in user.  In a typical application, you would want
		      // to associate the GitHub account with a user record in your database,
		      // and return that user instead.

		    }});
		  });
		}));


	var isValidPassword = function(user, password){
		return bCrypt.compareSync(password, user.local.password);
	};
	// Generates hash using bCrypt
	var createHash = function(password){
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	};

};
