const express = require('express');
const router = express.Router();
const BrandController = require('../../components/brand/BrandController');

// http://localhost:3000/api/brand/get-all-brands
// api get all brands
router.get('/get-all-brands', async (req, res) => {
  try {
    const brands = await BrandController.getAllBrands();
    res.status(200).json({ result: true, brands: brands });
  } catch (error) {
    console.error('Lỗi khi lấy tất cả thương hiệu:', error);
    res.status(500).json({ result: false, brands: null });
  }
});

//http://localhost:3000/api/brand/add-new-brand
// API để thêm mới thương hiệu
router.post('/add-new-brand', async (req, res) => {
  try {
    const { name } = req.body; // Lấy thông tin thương hiệu từ dữ liệu gửi lên.

    // Kiểm tra xem có thông tin thương hiệu hợp lệ không
    if (!name) {
      return res.status(400).json({ result: false, message: 'Tên thương hiệu là bắt buộc.' });
    }

    // Tạo một thương hiệu mới
    const newBrand = await BrandController.createBrand({ name });

    // Trả về phản hồi thành công
    res.status(201).json({ result: true, brands: newBrand });
  } catch (error) {
    console.error('Lỗi khi thêm mới thương hiệu:', error);
    res.status(500).json({ result: false, message: 'Lỗi khi thêm mới thương hiệu.' });
  }
});
//http://localhost:3000/api/brand/delete/:id
// API Xóa Thương Hiệu
router.delete('/delete/:id', BrandController.deleteBrand);

module.exports = router;
