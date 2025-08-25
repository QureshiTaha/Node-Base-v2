
// ⚙️ Creds In future move to ENV
const CLIENT_ID = '583864958599-rq6g914k9ffncjphlil70j8asjnrmotg.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_SECRET || ''; // from Google Console
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback'; // or your domain
const DEEP_LINK_URI = 'myapp://login';

module.exports = (dependencies) => {
    return async (req, res, next) => {
        const code = req.query.code;

        try {
            const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            });

            const id_token = tokenRes.data.id_token;
            const ticket = await client.verifyIdToken({
                idToken: id_token,
                audience: CLIENT_ID,
            });

            const payload = ticket.getPayload();
            console.log("✅ Google User:", payload);

            // ➡️ Send to app via deep link
            const redirectURL = `${DEEP_LINK_URI}?token=${id_token}`;
            return res.redirect(redirectURL);
        } catch (err) {
            console.error('Google Auth Error:', err);
            return res.status(500).send('Authentication failed');
        }
    }
};