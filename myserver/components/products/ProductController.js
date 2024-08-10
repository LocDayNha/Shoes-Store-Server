const ProductService = require('./ProductService');

const getAllProducts = async (offset, size) => {
  try {
    return await ProductService.getAllProducts(offset, size);
  } catch (error) {
    throw error;
  }
};
const getAllNewProducts = async () => {
  try {
    return await ProductService.getAllNewProducts();
  } catch (error) {
    throw error;
  }
};
const getLimitedProducts = async (limit) => {
  try {
    return await ProductService.getLimitedProducts(limit);
  } catch (error) {
    throw error;
  }
};
const getProductById = async (id) => {
  try {
    return await ProductService.getProductById(id);
  } catch (error) {
    return null;
  }
};

const getProductByBrandName = async (brandName) => {
  try {
    return await ProductService.getProductByBrandName(brandName);
  } catch (error) {
    return null;
  }
};

const deleteProductById = async (id) => {
  try {
    return await ProductService.deleteProductById(id);
  } catch (error) {
    throw error;
  }
};

const addNewProduct = async (product) => {
  try {
    return await ProductService.addNewProduct(product);
  } catch (error) {
    return false;
  }
};
const updateProductById = async (id, updateProduct) => {
  try {
    return await ProductService.updateProductById(id, updateProduct);
  } catch (error) {
    console.log(error);
    return false;
  }
};
const getQuatityByProductIdAndSizeAndColor = async (product_id, size, color) => {
  try {
    return await ProductService.getQuatityByProductIdAndSizeAndColor(product_id, size, color);
  } catch (error) {
    throw error;
  }
};

const searchByName = async (name) => {
  try {
    return await ProductService.searchByName(name);
  } catch (error) {
    console.error('Search by name error: ', error);
    throw error;
  }
};

const searchProductsByBrand = async (brandName, productName) => {
  try {
    return await ProductService.searchProductsByBrand(brandName, productName);
  } catch (error) {
    return null;
  }
};
module.exports = {
  getAllProducts,
  getProductById,
  deleteProductById,
  addNewProduct,
  updateProductById,
  getProductByBrandName,
  getQuatityByProductIdAndSizeAndColor,
  searchByName,
  searchProductsByBrand,
  getLimitedProducts,
  getAllNewProducts,
};
