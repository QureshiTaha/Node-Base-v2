const querystring = require('querystring');

// ⚙️ Creds In future move to ENV
const CLIENT_ID = '715055673513-j69r1emipult6kbovbv0t2da7ots0i03.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:5000/api/v1/users/google-callback'; // or your domain


module.exports = (dependencies) => {
    return async (req, res, next) => {
        const query = querystring.stringify({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent',
        });

        res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${query}`);
    };
};