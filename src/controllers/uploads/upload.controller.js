const path = require('path');
const fs = require('fs');
const { sqlQuery } = require('../../Modules/sqlHandler');

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded!'
    });
  }

  //  validations
  if (!req.body.userID) return res.status(400).json({ success: false, message: 'UserID is required' });
  const user = await sqlQuery(`SELECT id FROM db_users WHERE userID = '${req.body.userID}'`);
  if (user.length === 0) {
    fs.unlink(path.join(__dirname, '../../../uploads', req.file.filename), (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'File not found or already deleted' });
      }
    });
  } else {
    sqlQuery(
      `INSERT INTO db_uploads (userID, filePath) VALUES ('${req.body.userID}', '/uploads/${req.file.filename}')`
    );
  }

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully!',
    filePath: `/uploads/${req.file.filename}`
  });
};

const uploadMultipleFiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded!'
    });
  }
  //  validations
  if (!req.body.userID) return res.status(400).json({ success: false, message: 'UserID is required' });
  const user = await sqlQuery(`SELECT id FROM db_users WHERE userID = '${req.body.userID}'`);
  if (user.length === 0) {
    req.files.forEach((file) => {
      fs.unlink(path.join(__dirname, '../../../uploads', file.filename), (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: 'File not found or already deleted' });
        }
      });
    });
    return res.status(400).json({ success: false, message: 'User not found' });
  } else {
    req.files.forEach((file) => {
      sqlQuery(`INSERT INTO db_uploads (userID, filePath) VALUES ('${req.body.userID}', '/uploads/${file.filename}')`);
    });
  }

  const filePaths = req.files.map((file) => `/uploads/${file.filename}`);

  res.status(200).json({
    success: true,
    message: 'Files uploaded successfully!',
    filePaths: filePaths
  });
};

// Delete a single file
const deleteFile = (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, '../../../uploads', fileName);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File not found or already deleted' });
    }
    res.json({ success: true, message: 'File deleted successfully' });
  });
};

// Delete multiple files
const deleteMultipleFiles = (req, res) => {
  const { files } = req.body; // Expect an array of filenames

  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files provided' });
  }

  let errors = [];
  files.forEach((fileName) => {
    const filePath = path.join(__dirname, '../../../uploads', fileName);

    fs.unlink(filePath, (err) => {
      if (err) errors.push(fileName);
    });
  });

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Some files could not be deleted', failedFiles: errors });
  }

  res.json({ success: true, message: 'Files deleted successfully' });
};

module.exports = { uploadFile, uploadMultipleFiles, deleteFile, deleteMultipleFiles };
