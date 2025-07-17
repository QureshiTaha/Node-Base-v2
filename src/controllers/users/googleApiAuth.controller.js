const { OAuth2Client } = require('google-auth-library');
const userUseCase = require('./userUseCase');
const { sqlQuery } = require('../../Modules/sqlHandler');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');
const utils = require('../../Modules/utils');
const Mail = require('../../Modules/email');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// ⚙️ Creds In future move to ENV
const CLIENT_ID = '583864958599-g18apdb6lrnftdvk0olue7cdj909bngt.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

// Function to save user image from URL to disk
const saveImage = async (url, userId) => {
    const dir = path.join(__dirname, '../../../uploads/');
    const fileName = `${userId}.jpg`;
    const filePath = path.join(dir, fileName);

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error('Failed to download image'));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ Image saved to ${filePath}`);

                resolve(`/uploads/${fileName}`);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

// Helper to insert user data into the database
const insertNewUser = async (payload, imagePath) => {
    async function hashPassword(userPassword) {
        const password = userPassword;
        const saltRounds = 10;
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.genSalt(saltRounds, (err, salt) => {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) reject(err);
                    resolve(hash);
                });
            });
        });
        return hashedPassword;
    }
    const userPassword = utils.passwordGenerator();
    const userHashedPassword = await hashPassword(userPassword);
    const userEmail = payload.email;
    const userFirstName = payload.given_name || '';
    const userSurname = payload.family_name || '';
    const userID = uuidv4();

    const query = `
        INSERT INTO db_users (userID,userEmail, userFirstName, userSurname, profilePic, userPassword,userMeta)
        VALUES (?, ?,?, ?, ?, ?, ?)
    `;
    const values = [
        userID,
        payload.email,
        userFirstName,
        userSurname,
        imagePath,
        userHashedPassword,
        JSON.stringify({...payload, imagePath: imagePath})
    ];

    console.log("Sending Mail...");
    await Mail.send({
        userEmail: userEmail,
        subject: 'Welcome to Dating App! 🎉',
        body: 'Hello ' + userFirstName + ' ' + userSurname + ',<br><br>Welcome to Dating App! 🎉<br><br>You can now log in to your account using the following credentials:<br><br>Email: <strong>' + userEmail + '</strong><br>Password: <strong>' + userPassword + '</strong>',
        mailerType: 1
    });
    console.log('User Created with Creds :', userEmail, userPassword);


    const x = await sqlQuery(query, values);
    console.log(x);

};

// Main middleware function to handle Google authentication
module.exports = (dependencies) => {
    return async (req, res, next) => {
        const { credential } = req.body;

        try {
            // Verify the Google token
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: CLIENT_ID
            });

            const payload = ticket.getPayload();
            console.log("✅ Google User Recieved:", payload);

            // Save user image if available


            // Check if user exists in the database
            const user = await userUseCase.getUserByUserEmail(payload.email);
            console.log("user", user);

            if (user.length === 0) {
                let savedImage = '';
                if (payload.picture) {
                    savedImage = await saveImage(payload.picture, payload.sub);
                }
                // Insert new user if doesn't exist
                await insertNewUser(payload, savedImage);
            }

            // Respond with user data
            res.json({
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                googleID: payload.sub,
            });
        } catch (err) {
            console.error("Authentication Error:", err);
            res.status(401).json({
                message: 'Invalid token',
                error: err.message || err.toString()
            });
        }
    };
};
