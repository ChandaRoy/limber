module.exports = {
	'facebookAuth' : {
		'clientID': process.env.FACEBOOK_APP_CLIENTID||"580671975441189",
		'clientSecret': process.env.FACEBOOK_APP_CLIENTSECRET||"621ec83fdf51b5714b45c8402fe35095",
		'callbackURL': process.env.FACEBOOK_APP_CALLBACKURL||'http://limber.stackroute.in:8080/auth/facebook/callback'
	},
	'googleAuth' : {
		'clientID':process.env.GOOGLE_APP_CLIENTID||"245231146533-90modcq7ilo8186arqj00tsrccp2qmki.apps.googleusercontent.com" ,
		'clientSecret':process.env.GOOGLE_APP_CLIENTSECRET||"izowirUs3TSuKOzNabB0wAnL",
		'callbackURL': process.env.GOOGLE_APP_CALLBACKURL||'http://limber.stackroute.in:8080/auth/google/callback'
},
	'githubAuth' : {
		'clientID': process.env.GITHUB_APP_CLIENTID||"26f08576b86ec549a368",
    'clientSecret': process.env.GITHUB_APP_CLIENTSECRET||"0306c3f70e11af5a4ac9e11b7b41174a4e1b3a30",
    'callbackURL': process.env.GITHUB_APP_CALLBACKURL||"http://limber.stackroute.in:8080/auth/github/callback"
	},
	'dropboxAuth':{
		'clientID':process.env.DROPBOX_APP_CLIENTID||"xhr4rvb0mv5h05i",
		'clientSecret':process.env.DROPBOX_APP_CLIENTSECRET||"toy07da0j1ruu5y",
		'callbackURL': process.env.DROPBOX_APP_CALLBACKURL||"http://limber.stackroute.in:8080/auth/dropbox/callback"


	}
}
