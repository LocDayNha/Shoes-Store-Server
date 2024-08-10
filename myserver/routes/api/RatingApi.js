const express = require('express');
const router = express.Router();
const RatingController = require('../../components/rating/RatingController');
const uploadVideo = require('../../middle/UploadVideo');
const upload = require('../../middle/UploadImg');
const uploadFile = require('../../middle/UploadFile');
const firebaseAdmin = require('../../utils/firebaseAdmin');

//http://localhost:3000/api/rating/get-all-ratings
router.get('/get-all-ratings', [], async (req, res, next) => {
  try {
    const ratings = await RatingController.getAllRatings();
    return res.status(200).json({ result: true, ratings: ratings });
  } catch (error) {
    console.log('Get all error: ', error);
    return res.status(500).json({ result: false, ratings: null });
  }
});

//http://localhost:3000/api/rating/get-by-id?orderId=

router.get('/get-by-id', async (req, res, next) => {
  try {
    const { orderId } = req.query;
    const rating = await RatingController.getRatingById(orderId);
    if (rating) {
      return res.status(200).json({ result: true, rating: rating });
    }
    return res.status(400).json({ result: true, rating: false });
  } catch (error) {
    return res.status(500).json({ result: false, rating: null });
  }
});

//http://localhost:3000/api/rating/add-new-rating
// API để thêm mới đánh giá
router.post(
  '/add-new-rating',
  [upload.single('image'), uploadVideo.single('video')],
  async (req, res, next) => {
    try {
      let { file, body, files } = req;

      const { idUser, idOrder, ratingStatus, star, image, video } = body;
      const rating = RatingController.createRaing(
        idUser,
        idOrder,
        ratingStatus,
        star,
        image,
        video
      );

      if (rating) {
        return res.status(200).json({ result: true, rating: true });
      }

      return res.status(400).json({ result: false, rating: null });
    } catch (error) {
      console.error('Error ratingProduct:', error);
      return res.status(500).json({ result: false, message: 'Internal server error', error });
    }
  }
);

router.post('/upload-image', uploadFile.single('image'), async (req, res, next) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const imageFileName = `image${Date.now()}_${file.originalname}`;
    const imageUrl = await firebaseAdmin.uploadToFirebaseStorage(imageFileName, file.buffer);
    req.imageUrl = imageUrl; // Lưu URL của video vào request để sử dụng trong endpoint /add
    return res.status(200).json({ result: true, link: imageUrl });
    // return next(); // Chuyển tiếp sang xử lý logic trong endpoint /add
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/upload-video', uploadFile.single('video'), async (req, res, next) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No video file provided' });
    }
    const videoFileName = `video_${Date.now()}_${file.originalname}`;
    const videoUrl = await firebaseAdmin.uploadToFirebaseStorage(videoFileName, file.buffer);
    req.videoUrl = videoUrl; // Lưu URL của video vào request để sử dụng trong endpoint /add
    return res.status(200).json({ result: true, link: videoUrl });
    // return next(); // Chuyển tiếp sang xử lý logic trong endpoint /add
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//http://localhost:3000/api/ratingProduct/add
router.post(
  '/add',
  uploadFile.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const { files, body } = req;
      if (files) {
        const uploadedImage = files['image'][0];
        const uploadedVideo = files['video'][0];
        if (uploadedImage) {
          const imageFileName = `image_${Date.now()}_${uploadedImage.originalname}`;
          const imageUrl = await firebaseAdmin.uploadToFirebaseStorage(
            imageFileName,
            uploadedImage.buffer
          );
          body.image = imageUrl;
        }
        if (uploadedVideo) {
          const videoFileName = `video_${Date.now()}_${uploadedVideo.originalname}`;
          const videoUrl = await firebaseAdmin.uploadToFirebaseStorage(
            videoFileName,
            uploadedVideo.buffer
          );
          body.video = videoUrl;
        }

        const { idUser, idOrder, ratingStatus, star, image, video } = body;
        const rating = RatingController.createRaing(
          idUser,
          idOrder,
          ratingStatus,
          star,
          image,
          video
        );

        if (rating) {
          return res.status(200).json({ result: true, rating: true });
        }
      }
      return res.status(400).json({ result: false, rating: null });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Xóa đánh giá dựa trên ID
//http://localhost:3000/api/rating/delete-ratings/:ratingId
router.delete('/delete-ratings/:ratingId', RatingController.deleteRating);

module.exports = router;
