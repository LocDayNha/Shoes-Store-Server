const express = require('express');
const router = express.Router();
const multer = require('../../middle/UploadFile');
const firebaseAdmin = require('../../utils/firebaseAdmin');

router.post('/', multer.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9) + '-';
    const fileName = uniquePrefix + file.originalname;
    let downloadURL = await firebaseAdmin.uploadToFirebaseStorage(fileName, file.buffer);

    res.status(200).json({ name: fileName, url: downloadURL });
  } catch (error) {
    console.error('Lỗi khi upload file:', error);
    res.status(500).json({ result: false, content: 'Lỗi khi upload file:' });
  }
});

router.get('/delete/:fileName', multer.single('file'), async (req, res) => {
  try {
    const { fileName } = req.params;
    if (firebaseAdmin.deleteFirebaseStorageFile(fileName)) {
      res.status(200).json({ success: true, fileName: fileName });
    }
  } catch (error) {
    console.error('Lỗi khi xóa file:', error);
    res.status(500).json({ result: false, content: 'Lỗi khi xóa file:' });
  }
});

router.post('/delete', multer.single('file'), async (req, res) => {
  try {
    const { unUsedFiles } = req.body;
    console.log(unUsedFiles);
    unUsedFiles.forEach((unUsedFile) => {
      firebaseAdmin.deleteFirebaseStorageFile(unUsedFile);
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa file:', error);
    res.status(500).json({ result: false, content: 'Lỗi khi xóa file:' });
  }
});

module.exports = router;
