const crypto = require('crypto');

function encryptString(plaintext, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'binary');
  encrypted += cipher.final('binary');
  const encryptedBuffer = Buffer.concat([iv, Buffer.from(encrypted, 'binary')]);
  return encryptedBuffer.toString('base64');
}

function decryptString(base64Data, key) {
  const dataBuffer = Buffer.from(base64Data, 'base64');
  const iv = dataBuffer.slice(0, 16);
  const encryptedText = dataBuffer.slice(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), iv);
  let decrypted = decipher.update(encryptedText, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
//   MERCHANT_ID: 'IPCOS00024THA', // For UAT
//   ENCRYPTION_KEY: '8b3a40g766d94345b9d82ad02cfb1df1', // For UAT
  MERCHANT_ID: 'SLCOS00092BHO',
  ENCRYPTION_KEY: '7dncmvnb4rx93llu5y1ilm5k397wfevu',
//   PAYMENT_BASE_URL: 'https://uat.godemo.in/api/LincPayUAT/paymentrequest/seamless',
//   PAYMENT_BASE_URL: 'https://pg.icepe.in/paymentrequest', // For Web
//   PAYMENT_BASE_URL: 'https://uat.godemo.in/api/LincPayUAT/uat/payin/paymentrequest', // For Web
  PAYMENT_BASE_URL: 'https://pg.icepe.in/paymentrequest/seamless',
  CALLBACK_URL: 'https://yourdomain.com/callback.php', // Update to your domain
  encryptString,
  decryptString
};
