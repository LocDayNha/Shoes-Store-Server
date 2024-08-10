const express = require('express');
const router = express.Router();
const favoriteController = require('../../components/Favorite/FavoriteController');
const favoriteService = require('../../components/Favorite/FavoriteService');

//http://localhost:3000/api/favorite/add-to-favorites
router.post('/add-to-favorites/', async (req, res, next) => {
  const { idUser, idProduct } = req.body;

  try {
    const favoriteProduct = await favoriteService.addToFavorites(idUser, idProduct);

    if (!favoriteProduct) {
      return res.status(404).json({
        result: false,
        message: 'Sản phẩm không tồn tại hoặc đã có trong danh sách yêu thích',
      });
    }

    return res.status(200).json({ result: true, favoriteProduct });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ result: false, message: 'Lỗi khi thêm sản phẩm vào danh sách yêu thích' });
  }
});

//http://localhost:3000/api/favorite/:userId
router.get('/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const favorites = await favoriteService.getFavoritesByUser(userId);

    res.status(200).json({ result: true, favorites });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

//http://localhost:3000/api/favorite/check-favorite/:userId/:productId
router.get('/check-favorite/:userId/:productId', async (req, res, next) => {
  const { userId, productId } = req.params;

  try {
    const isFavorite = await favoriteService.checkFavorite(userId, productId);

    return res.status(200).json({ isFavorite });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi kiểm tra sản phẩm yêu thích' });
  }
});

//http://localhost:3000/api/favorite/remove-from-favorites/:userId/:productId
router.delete('/remove-from-favorites/:userId/:productId', async (req, res, next) => {
  const { userId, productId } = req.params;

  try {
    // Gọi hàm xóa sản phẩm khỏi danh sách yêu thích từ service
    const removedFavorite = await favoriteService.removeFromFavorites(userId, productId);

    if (removedFavorite) {
      return res.status(200).json({
        result: true,
        message: 'Sản phẩm đã được xóa khỏi danh sách yêu thích',
      });
    } else {
      return res.status(404).json({
        result: false,
        message: 'Sản phẩm không tồn tại trong danh sách yêu thích hoặc đã bị xóa',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      result: false,
      message: 'Lỗi khi xóa sản phẩm khỏi danh sách yêu thích',
    });
  }
});

module.exports = router;
