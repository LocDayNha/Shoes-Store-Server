const CartService = require('./CartService');
const addNewCart = async (idUser, idRecipe, color, size, quantity) => {
  try {
    return await CartService.addNewCart(idUser, idRecipe, color, size, quantity);
  } catch (error) {
    return false;
  }
};
// const addNewCart = async (idUser, idProduct, color, size, quantity) => {
//   try {
//     return await CartService.addNewCart(idUser, idProduct, color, size, quantity);
//   } catch (error) {
//     return false;
//   }
// };

const getCartByIdUser = async (idUser) => {
  try {
    return await CartService.getCartIdUser(idUser);
  } catch (error) {
    return null;
  }
};

const removeProductFromCart = async (productId) => {
  try {
    return await CartService.removeProductFromCart(productId);
  } catch (error) {
    throw error;
  }
};

const updateQuantity = async (quantity, id) => {
  try {
    return await CartService.updateQuantity(quantity, id);
  } catch (error) {
    return false;
  }
};

module.exports = {
  getCartByIdUser,
  addNewCart,
  updateQuantity,
  removeProductFromCart,
};
