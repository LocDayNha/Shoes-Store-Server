const express = require('express');
const router = express.Router();
const RatingPRoductController = require('../../components/rating/RatingProductController');
const uploadVideo = require('../../middle/UploadVideo');
const upload = require('../../middle/UploadImg');
const uploadFile = require('../../middle/UploadFile');
const firebaseAdmin = require('../../utils/firebaseAdmin');

//http://localhost:3000/api/ratingProduct/products/ratings
router.get('/products/ratings', RatingPRoductController.getAllProductRatings);

//http://localhost:3000/api/ratingProduct/get-by-id?productId=

router.get('/get-by-id', async (req, res, next) => {
  try {
    const { productId } = req.query;
    const rating = await RatingPRoductController.getRatingById(productId);
    if (rating) {
      return res.status(200).json({ result: true, rating: rating });
    }
    return res.status(400).json({ result: true, rating: false });
  } catch (error) {
    return res.status(500).json({ result: false, rating: null });
  }
});
//http://localhost:3000/api/ratingProduct/get-by-star?idProduct=&star=

router.get('/get-by-star', async (req, res, next) => {
  try {
    const { idProduct, star } = req.query;
    const rating = await RatingPRoductController.getRatingByStar(idProduct, star);
    if (rating) {
      return res.status(200).json({ result: true, rating: rating });
    }
    return res.status(400).json({ result: true, rating: false });
  } catch (error) {
    return res.status(500).json({ result: false, rating: null });
  }
});

//http://localhost:3000/api/ratingProduct/add-new-rating
// API để thêm mới đánh giá
router.post(
  '/add-new-rating',
  [upload.single('image'), uploadVideo.single('video')],
  async (req, res, next) => {
    try {
      let { file, body, files } = req;

      const { idUser, idOrder, idProduct, ratingStatus, star, image, video, israting } = body;
      const rating = RatingPRoductController.createRaingPRoduct(
        idUser,
        idOrder,
        idProduct,
        ratingStatus,
        star,
        image,
        video,
        israting
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

//http://localhost:3000/api/rating/add
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

        const { idUser, idOrder, idProduct, ratingStatus, star, image, video } = body;
        const rating = RatingPRoductController.createRaingPRoduct(
          idUser,
          idOrder,
          idProduct,
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

//http://localhost:3000/api/ratingProduct/updateCountHearts?id=
router.post('/updateCountHearts', RatingPRoductController.updateCountHeartsController);

// Xóa đánh giá sản phẩm
//http://localhost:3000/api/ratingProduct/delete/:ratingId
router.delete('/delete/:ratingId', RatingPRoductController.deleteRating);

module.exports = router;
