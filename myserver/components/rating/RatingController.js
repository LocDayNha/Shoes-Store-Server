const RatingService = require('./RatingService');

const getRatingById = async (orderId) => {
  try {
    return await RatingService.getRatingsByOrderId(orderId);
  } catch (error) {
    return null;
  }
};

const createRaing = async (idUser, idOder, ratingStatus, star, image, video) => {
  try {
    return await RatingService.createRating(idUser, idOder, ratingStatus, star, image, video);
  } catch (error) {
    throw error;
  }
};

const getAllRatings = async () => {
  try {
    return await RatingService.getAllRatings();
  } catch (err) {
    throw err;
  }
};

const deleteRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params; // Lấy ID đánh giá từ URL
    await RatingService.deleteRatingById(ratingId); // Gọi service để xóa đánh giá

    res.status(200).json({ message: 'Đánh giá đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xóa đánh giá', details: error.message });
  }
};

module.exports = { createRaing, getRatingById, getAllRatings, deleteRating };
