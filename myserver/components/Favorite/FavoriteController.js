const favoriteService = require('./FavoriteService');

// const addToFavorites = async (req, res) => {
//   const { idUser, idProduct } = req.body;

//   try {
//     const favoriteProduct = await favoriteService.addToFavorites(idUser, idProduct);

//     if (!favoriteProduct) {
//       return res
//         .status(404)
//         .json({
//           result: false,
//           message: 'Sản phẩm không tồn tại hoặc đã có trong danh sách yêu thích',
//         });
//     }

//     return res.status(200).json({ result: true, favoriteProduct });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ result: false, message: 'Lỗi khi thêm sản phẩm vào danh sách yêu thích' });
//   }
// };

// const getFavoritesByUser = async (req, res) => {
//   try {
//     const userId = req.params.userId; // Lấy userId từ request

//     // Gọi service để lấy danh sách yêu thích của người dùng
//     const favorites = await favoriteService.getFavoritesByUser(userId);

//     res.status(200).json({ success: true, favorites });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

module.exports = {};
