const BrandService = require('./BrandService');

const getAllBrands = async () => {
  try {
    return await BrandService.getAllBrands();
  } catch (error) {
    throw error;
  }
};

const createBrand = async (name) => {
  try {
    return await BrandService.createBrand(name);
  } catch (error) {
    throw error;
  }
};

const deleteBrand = async (req, res) => {
  const brandId = req.params.id;

  try {
    const deletedBrand = await BrandService.deleteBrand(brandId);
    res.status(200).json({ result: true, message: 'Thương hiệu đã bị xóa', brands: deletedBrand });
  } catch (error) {
    console.error('Lỗi khi xóa thương hiệu:', error);
    res.status(500).json({ result: false, message: 'Lỗi khi xóa thương hiệu', brands: null });
  }
};

module.exports = { getAllBrands, createBrand, deleteBrand };
