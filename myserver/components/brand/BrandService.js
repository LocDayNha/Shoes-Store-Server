const BrandModel = require('./BrandModel');

const getAllBrands = async () => {
  try {
    // Sử dụng Mongoose để tìm tất cả các tài liệu thương hiệu
    const brands = await BrandModel.find();

    return brands;
  } catch (error) {
    console.log('Lỗi khi lấy tất cả thương hiệu:', error);
    throw error;
  }
};

const createBrand = async (name) => {
  try {
    // Tạo một thương hiệu mới sử dụng dữ liệu từ tham số
    const newBrand = new BrandModel(name);

    // Lưu thương hiệu mới vào cơ sở dữ liệu
    const savedBrand = await newBrand.save();

    return savedBrand;
  } catch (error) {
    console.log('Lỗi khi thêm mới thương hiệu:', error);
    throw error;
  }
};

// Hàm Xóa Thương Hiệu
const deleteBrand = async (brandId) => {
  try {
    // Sử dụng Mongoose để tìm và xóa thương hiệu dựa trên ID
    const deletedBrand = await BrandModel.findByIdAndRemove(brandId);

    if (!deletedBrand) {
      throw new Error('Không tìm thấy thương hiệu để xóa');
    }

    return deletedBrand;
  } catch (error) {
    throw error;
  }
};

module.exports = { getAllBrands, createBrand, deleteBrand };
