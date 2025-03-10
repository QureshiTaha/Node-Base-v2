const jwt = require('jsonwebtoken');
const sql = require('./sqlHandler');
const sqlQuery = sql.query;

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the token exists in db_sessions
    const result = await sqlQuery(`SELECT * FROM db_sessions WHERE accessToken = '${token}'`);
    if (result.length < 1) {
      return res.status(403).json({ message: 'Invalid or expired token!' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token!' });
  }
};

module.exports = verifyToken;
