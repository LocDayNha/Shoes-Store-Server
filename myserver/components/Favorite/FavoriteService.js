const Favorite = require('./FavoriteModel');
const Product = require('../products/ProductModel');

const addToFavorites = async (idUser, idProduct) => {
  try {
    const product = await Product.findById(idProduct);
    if (!product) {
      return null;
    }

    const existingFavorite = await Favorite.findOne({ idUser: idUser, idProduct: idProduct });

    if (existingFavorite) {
      return null;
    }

    const newFavorite = new Favorite({ idUser: idUser, idProduct: idProduct });
    await newFavorite.save();

    return newFavorite;
  } catch (error) {
    throw new Error('Error adding to favorites');
  }
};

const getFavoritesByUser = async (userId) => {
  try {
    const favorites = await Favorite.find({ idUser: userId }).populate('idProduct');

    return favorites;
  } catch (error) {
    throw new Error('Error while fetching favorites');
  }
};

const checkFavorite = async (userId, productId) => {
  try {
    //kiểm tra xem sản phẩm có trong danh sách yêu thích của người dùng không
    const userFavorites = await Favorite.findOne({
      idUser: userId,
      idProduct: productId,
    });

    return !!userFavorites;
  } catch (error) {
    throw new Error('Lỗi khi kiểm tra sản phẩm yêu thích');
  }
};

const removeFromFavorites = async (userId, productId) => {
  try {
    // Tìm và xóa sản phẩm khỏi danh sách yêu thích của người dùng
    const removedFavorite = await Favorite.findOneAndDelete({
      idUser: userId,
      idProduct: productId,
    });

    return removedFavorite; // Trả về thông tin sản phẩm đã xóa nếu thành công
  } catch (error) {
    throw new Error('Lỗi khi xóa sản phẩm khỏi danh sách yêu thích');
  }
};

module.exports = { addToFavorites, getFavoritesByUser, checkFavorite, removeFromFavorites };
