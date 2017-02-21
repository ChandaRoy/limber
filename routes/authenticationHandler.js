var express = require('express'),
router = express.Router();
var mongoose = require('mongoose'),
User = require('../models/user.js');
var nodemailer=require('nodemailer');


module.exports = function(passport){

	//sends successful login state back to angular
	router.get('/success', function(req, res){
		res.send({error:null});
    	//res.send({redirect: '/home'});
  //  res.status(200).json();
});

	//sends failure login state back to angular
	router.get('/failure', function(req, res){
		res.send({ error: "PASSWORD_ERR"});
		// req.session.user=null;
	});
  router.get('/regfailure', function(req, res){
    res.send({ error: "EMAIL_ERR"});
		// req.session.user=null;
	});

  router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure'
  }));

	//sign up
  router.use('/register',function(req,res,next) {
    next();
  });

  router.post('/register', passport.authenticate('sign-up', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/regfailure'
  }));

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/index.html');
  });
router.get('/home',function(req,res) {
  });

// var projectId="";
// router.get('/dropbox',function(req,res,next){
//    var projectId=req.body.projectId;
//   console.log(" I got : ", projectId);
//   passport.authorize('dropbox-oauth2');
// })

router.get('/dropbox',passport.authorize('dropbox-oauth2'));
  router.get('/dropbox/callback',passport.authorize('dropbox-oauth2', { successRedirect: '/home.html',failureRedirect: '/home.html' }),
    function(req,res){
      res.redirect('/home.html');
    });
  router.get('/github',passport.authorize('github', { scope: ['repo','user','read:org']}));
  router.get('/github/callback',passport.authorize('github', { successRedirect: '/home.html',failureRedirect: '/home.html' }),
    function(req,res){
      //console.log(req);
      res.redirect('/home.html');
    });

//login using facebook
router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));

router.get('/facebook/callback',
 passport.authenticate('facebook', { successRedirect: '/home.html',
   failureRedirect: '/index.html' }));

  	//login using google
  	router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    router.get('/google/callback',
     passport.authenticate('google', { successRedirect: '/home.html',
       failureRedirect: '/index.html'}));

    router.post('/register', passport.authenticate('sign-up', {
      successRedirect: '/auth/success',
      failureRedirect: '/auth/regfailure'
    }));
      // this is for resetting the password
      router.post('/resetPassword',function(req,res,next){
        User.findOne({
          'email':req.body.email
        }).exec(function(err,user)
        {
          if(err)
            {    console.log("In data base error " , err);
        }
        else if (!user){

        } else{


          user.password=req.body.password;
          user.save();
          next();
        }


      })

      });
      //verify new user starts
      router.post('/verifycode',function(req,res,next){
        var email=req.body.email;
        var code=Math.floor(Math.random()*90000) + 10000;
        User.findOne({'email':req.body.email}).exec(function(err,user){
          if(err){
            res.send({error:"Something went wrong. Please try again."});
          }else if(user){

         res.send({error:"EMAIL_ERR"})
          } else{
              var transporter=nodemailer.createTransport({

              service:'Gmail',
              auth:{
                user:'mylimberapp@gmail.com',
                pass: 'mylimber@123'
              }
            });

             var mailOption={
              from:'Limber <mylimberapp@gmail.com>',
              to:email,
              subject:'Welcome to Limber',
              text:"Your verification code is "+code+"Enter this code to register.",
              html:'<b>Limber </b>helps you to manage your project in better way.<h2>Verification code for registering Limber app </h2> Verification code :<b>'+code+'</b> <br><b>Enter this code in Limber App to register.</b>'
            }
            transporter.sendMail(mailOption,function(error,info){
              if(error){

                res.redirect('/index.html')
				//res.send({code:"1234"});
              }
              else{
                        //res.send(code);
                    res.send({code:code});
                    //res.redirect('/index.html')
                  }
                });

          }//main else

        });


      });
      //verify new user ends
      //this is for forgot password
      router.post('/forgotpass',function(req,res,next)
        { var email=req.body.email;
          User.findOne({
            'email': req.body.email
          }).exec(function(err,user){
            if(err){
              res.send({error:"Something went wrong. Please try again."});
            } else if(!user){
              res.send({error:"User not found. Please sign-up."});

            } else{
             var transporter=nodemailer.createTransport({

              service:'Gmail',
              auth:{
                user:'mylimberapp@gmail.com',
                pass: 'mylimber@123'
              }
            });
             var code=req.body.code;
             var mailOption={
              from:'Limber <mylimberapp@gmail.com>',
              to:email,
              subject:'Limber Password Reset',
              text:"We heard you need a password reset. Code is: "+code+"\nEnter this code to reset your password.",
              html:'<h2>Hello,</h2><h3>We heard you need a password reset. </h3><b>Enter this code to reset your password:'+code+'</b> '
            }
            transporter.sendMail(mailOption,function(error,info){
              if(error){

                res.redirect('/forgot.html')
              }
              else{
                        //res.send(code);
                        res.redirect('/forgot.html')
                      }
                    });
            } //end of final else
          })
     });
      //forgot passwords ends here




      return router;

    }
