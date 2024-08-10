const express = require('express');
const router = express.Router();
const ProductController = require('../../components/products/ProductController');
const UploadFile = require('../../middle/UploadFile');

// http://localhost:3000/api/product/get-all
// api get all product
router.get('/get-all', [], async (req, res, next) => {
  try {
    let { pageSize, offset } = req.query;
    const { products, metaData } = await ProductController.getAllProducts(offset, pageSize);
    return res.status(200).json({ result: true, products: products, metaData: metaData });
  } catch (error) {
    console.log('Get all error: ', error);
    return res.status(500).json({ result: false, products: null });
  }
});

router.get('/get-all-new', [], async (req, res, next) => {
  try {
    const products = await ProductController.getAllNewProducts();
    return res.status(200).json({ result: true, products: products });
  } catch (error) {
    console.log('Get all error: ', error);
    return res.status(500).json({ result: false, products: null });
  }
});

// http://localhost:3000/api/product/get-by-id?id=
// api get product by id
router.get('/get-by-id', async (req, res, next) => {
  try {
    const { id } = req.query;
    const product = await ProductController.getProductById(id);
    return res.status(200).json({ result: true, product: product });
  } catch (error) {
    console.log('Get by id error: ', error);
    return res.status(500).json({ result: false, product: null });
  }
});

// http://localhost:3000/api/product/get-by-brand?brandName=
// api get product by brands
router.get('/get-by-brand', async (req, res, next) => {
  try {
    const { brandName } = req.query;
    const product = await ProductController.getProductByBrandName(brandName);
    return res.status(200).json({ result: true, products: product });
  } catch (error) {
    console.log('Get by brand error: ', error);
    return res.status(500).json({ result: false, products: null });
  }
});

// http://localhost:3000/api/product/delete-by-id/:id
router.delete('/delete/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await ProductController.deleteProductById(id);
    return res.status(200).json({ result: true, products: products });
  } catch (error) {
    return res.status(500).json({ result: false, products: null });
  }
});
// http://localhost:3000/api/product/add-new
// api
router.post('/', async (req, res, next) => {
  try {
    let { body } = req;
    const product = await ProductController.addNewProduct(body);

    return res.status(200).json({ result: true, product: product });
  } catch (error) {
    console.log('Add new product error: ', error);
    return res.status(500).json({ result: false, product: null });
  }
});

// http://localhost:3000/api/product/edit-new/:id
// api
router.put('/update/:id', async (req, res, next) => {
  try {
    let { body } = req;
    let { id } = req.params;
    const product = await ProductController.updateProductById(id, body);
    return res.status(200).json({ result: true, product: product });
  } catch (error) {
    console.log('Edit new product error: ', error);
    return res.status(500).json({ result: false, product: null });
  }
});
// http://localhost:3000/api/product/upload-image
// upload 1 ảnh
router.post('/upload-image', [UploadFile.single('image')], async (req, res, next) => {
  try {
    const { file } = req;
    if (file) {
      const link = `http://192.168.1.8:3000/images/${file.filename}`;
      return res.status(200).json({ result: true, link: link });
    }

    return res.status(400).json({ result: true, link: null });
  } catch (error) {
    console.log('Edit new product error: ', error);
    return res.status(500).json({ result: false });
  }
});

// http://localhost:3000/api/product/upload-images
// upload nhiều ảnh
router.post('/upload-images', [UploadFile.array('image', 2)], async (req, res, next) => {
  try {
    const { files } = req;
    if (files && files.length > 0) {
      const links = [];
      for (let index = 0; index < files.length; index++) {
        const element = files[index];
        links.push = `http://192.168.1.8:3000/images/${element.filename}`;
      }

      return res.status(200).json({ result: true, links: links });
    }
    return res.status(400).json({ result: true, links: null });
  } catch (error) {
    console.log('Upload image error: ', error);
    return res.status(500).json({ result: false });
  }
});

// http://localhost:3000/api/product/filter-by-brand
router.get('/filter-by-brand', [], async (req, res, next) => {
  try {
    const { brand } = req.query;
    // console.log(brand)
    const recipe = await ProductController.filterProductByBrand(brand);
    if (recipe) {
      return res.status(200).json({ result: true, recipe: recipe });
    }
    return res.status(400).json({ result: false });
  } catch (error) {
    return res.status(500).json({ result: false, recipe: null });
  }
});

//http://localhost:3000/api/product/get-quantity?product_id=6540963521c273ca720f8809&size=42&color=cream-white
router.get('/get-quantity', async (req, res, next) => {
  try {
    const { product_id, size, color } = req.query;
    const result = await ProductController.getQuatityByProductIdAndSizeAndColor(
      product_id,
      size,
      color
    );

    return res.status(200).json({ result: result });
  } catch (error) {
    return res.status(500).json({ result: 'Not found' });
  }
});

// http://localhost:3000/api/product/search-by-name
// api search products by name
router.get('/search-by-name', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await ProductController.searchByName(query);
    return res.status(200).json({ result: true, products: products });
  } catch (error) {
    console.error('Search by name route error: ', error);
    return res.status(500).json({ result: false, products: null });
  }
});
router.get('/search-by-brand', async (req, res, next) => {
  try {
    const { brandName, productName } = req.query;
    const products = await ProductController.searchProductsByBrand(brandName, productName);
    return res.status(200).json({ result: true, products: products });
  } catch (error) {
    console.log('Search products by brand error: ', error);
    return res.status(500).json({ result: false, products: null });
  }
});
//http://localhost:3000/api/product/get-limited
// api get san pham limit ( 6 san pham )
router.get('/get-limited', [], async (req, res, next) => {
  try {
    const limit = req.query.limit || 6; // Số sản phẩm mặc định là 6 nếu không có tham số limit
    const products = await ProductController.getLimitedProducts(limit);
    return res.status(200).json({ result: true, products: products });
  } catch (error) {
    console.log('Get limited products error: ', error);
    return res.status(500).json({ result: false, products: null });
  }
});
module.exports = router;
