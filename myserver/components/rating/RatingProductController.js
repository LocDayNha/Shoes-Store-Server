const RatingPRoductService = require('./RatingProductService');

const getRatingById = async (productId) => {
  try {
    return await RatingPRoductService.getRatingsByProductId(productId);
  } catch (error) {
    return null;
  }
};
const getRatingByStar = async (idProduct, star) => {
  try {
    return await RatingPRoductService.getRatingsByProductStar(idProduct, star);
  } catch (error) {
    return null;
  }
};
const updateCountHeartsController = async (req, res) => {
  try {
    const { id, action, idUser } = req.body; // Lấy cả idUser từ request body
    const updatedRating = await RatingPRoductService.updateCountHearts(id, action, idUser);
    if (updatedRating) {
      res.status(200).json({ result: true, updatedRating: updatedRating });
    } else {
      res.status(500).json({ error: 'Failed to update countHearts' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRaingPRoduct = async (
  idUser,
  idOder,
  idProduct,
  ratingStatus,
  star,
  image,
  video,
  israting
) => {
  try {
    return await RatingPRoductService.createRatingProduct(
      idUser,
      idOder,
      idProduct,
      ratingStatus,
      star,
      image,
      video,
      israting
    );
  } catch (error) {
    throw error;
  }
};

const getAllProductRatings = async (req, res) => {
  try {
    const ratings = await RatingPRoductService.getAllProductRatings();
    return res.status(200).json({ success: true, ratings });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params; // Lấy ID đánh giá từ URL
    await RatingPRoductService.deleteRatingById(ratingId); // Gọi service để xóa đánh giá

    res.status(200).json({ message: 'Đánh giá đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xóa đánh giá', details: error.message });
  }
};

module.exports = {
  createRaingPRoduct,
  getRatingById,
  getRatingByStar,
  updateCountHeartsController,
  getAllProductRatings,
  deleteRating,
};
