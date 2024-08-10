const ProductModel = require('../products/ProductModel');
const CartModel = require('./CartModel');
const ProductService = require('../products/ProductService');

const getCartIdUser = async (idUser) => {
  try {
    const cart = await CartModel.find({ idUser: idUser }, '')
      .populate('idUser', 'email name')
      .populate('idProduct', '');
    if (cart != []) {
      return cart;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Get product by id error ' + error);
    return null;
  }
};

const addNewCart = async (idUser, idProduct, color, size, quantity) => {
  try {
    const cart = await CartModel.findOne({
      idUser: idUser,
      idProduct: idProduct,
      color: color,
      size: size,
    });

    if (cart) {
      // Nếu giỏ hàng đã tồn tại, kiểm tra và cập nhật số lượng
      const newQuantity = cart.quantity + quantity;
      console.log(newQuantity);

      // Tìm thông tin sản phẩm để kiểm tra số lượng ban đầu
      const productQuantity = await ProductService.getQuatityByProductIdAndSizeAndColor(
        idProduct,
        size,
        color
      );

      if (productQuantity) {
        if (newQuantity <= productQuantity.quantity) {
          // Cập nhật số lượng giỏ hàng nếu nhỏ hơn hoặc bằng số lượng sản phẩm ban đầu
          cart.quantity = newQuantity;
          await cart.save();
        } else {
          // Cập nhật giỏ hàng với số lượng sản phẩm ban đầu nếu số lượng mới lớn hơn
          cart.quantity = productQuantity.quantity;
          await cart.save();
        }
      }
    } else {
      // Nếu giỏ hàng chưa tồn tại, thêm mới giỏ hàng
      const newCart = { idUser, idProduct, color, size, quantity };
      const cartInstance = new CartModel(newCart);
      await cartInstance.save();
    }

    return true; // Thêm mới hoặc cập nhật giỏ hàng thành công
  } catch (error) {
    console.log('Lỗi khi thêm mới hoặc cập nhật giỏ hàng: ', error);
    return false; // Thêm mới hoặc cập nhật giỏ hàng thất bại
  }
};

const removeProductFromCart = async (productId) => {
  try {
    const result = await CartModel.deleteOne({ _id: productId });
    return result;
  } catch (error) {
    console.log('Lỗi khi xóa sản phẩm trong cart: ', error);
    return false;
  }
};

const removeAllProductsFromCart = async (idUser) => {
  try {
    const result = await CartModel.deleteMany({ idUser: idUser });
    return result;
  } catch (error) {
    console.log('Lỗi khi xóa tất cả sản phẩm trong giỏ hàng: ', error);
    return false;
  }
};


const updateQuantity = async (quantity, id) => {
  try {
    const cart = await CartModel.findOne({ _id: id });
    if (cart) {
      cart.quantity = quantity ? quantity : cart.quantity;
      await cart.save();
      return cart;
    }
  } catch (error) {
    console.log('update Quantity  error', error);
    return false;
  }
};
module.exports = {
  getCartIdUser,
  addNewCart,
  removeProductFromCart,
  updateQuantity,
  removeAllProductsFromCart
};
