const ProductModel = require('./ProductModel');
const BrandModel = require('../brand/BrandModel');
const firebaseAdmin = require('../../utils/firebaseAdmin');
const { default: mongoose } = require('mongoose');
const { OrderStatusEnum } = require('../order/OrderStatusEnum');
const paginationUtil = require('../../utils/paginationUtil');

const getAllProducts = async (offset, size) => {
  try {
    const paginationValue = paginationUtil.validateAndGetValues(offset, size);
    const products = await ProductModel.find()
      .skip(paginationValue.offset)
      .limit(paginationValue.pageSize)
      .populate('brand', '');
    const total = await countAll();
    const metaData = paginationUtil.getMetaData(
      paginationValue.offset,
      paginationValue.pageSize,
      total
    );
    return {
      products: products,
      metaData: metaData,
    };
  } catch (error) {
    console.log('Get all products error', error);
    throw error;
  }
};
const getAllNewProducts = async () => {
  try {
    return await ProductModel.find().populate('brand', '');
  } catch (error) {
    console.log('Get all products error', error);
    throw error;
  }
};
const getLimitedProducts = async (limit) => {
  try {
    return await ProductModel.find().limit(limit).populate('brand', '');
  } catch (error) {
    console.log('Get limited products error', error);
    throw error;
  }
};
const getProductById = async (id) => {
  try {
    return await ProductModel.findById(id).populate('brand', '');
  } catch (error) {
    console.log('Get products by id error', error);
    return null;
  }
};

const getProductByBrandName = async (brandName) => {
  try {
    // Tìm ID của thương hiệu dựa trên tên
    const brand = await BrandModel.findOne({ name: brandName });

    if (!brand) {
      console.log('Không tìm thấy thương hiệu.');
      return null;
    }

    // Sử dụng ID của thương hiệu để tìm sản phẩm
    return await ProductModel.find({ brand: brand._id });
  } catch (error) {
    console.log('Lỗi khi lấy sản phẩm theo thương hiệu:', error);
    return null;
  }
};

const deleteProductById = async (id) => {
  try {
    let product = await ProductModel.findOne({ _id: id });
    await product?.variances?.forEach((variance) => {
      variance?.images.forEach((image) => {
        firebaseAdmin.deleteFirebaseStorageFile(image?.name);
      });
    });

    await ProductModel.findByIdAndDelete(id);
  } catch (error) {
    console.log('Delete products by id error', error);
    return false;
  }
};
const addNewProduct = async (product) => {
  try {
    const brand = await BrandModel.findOne({ _id: product?.brandId });
    if (!brand) {
      console.log('Không tìm thấy thương hiệu.');
      return false;
    }
    const newProduct = new ProductModel({
      title: product?.title,
      price: product?.price,
      discount: product?.discount,
      description: product?.description,
      brand: brand,
      isDisabled: product?.isDisabled,
      variances: product?.variances,
    });

    await newProduct.save();
    return newProduct;
  } catch (error) {
    console.log('Add new product error:', error);
    return false;
  }
};
const updateProductById = async (id, updateProduct) => {
  try {
    let product = await ProductModel.findById(id);
    if (!product) {
      throw 'Failed to find product with id = ' + id;
    }
    const updateBrand = await BrandModel.findById(updateProduct?.brandId);
    updateProduct['brand'] = updateBrand;

    let imagesOfUpdateProduct = [];
    let imagesOfExistingProduct = [];

    await updateProduct?.variances?.forEach((variance) => {
      variance?.images.forEach((image) => {
        imagesOfUpdateProduct.push(image.name);
      });
    });

    await product?.variances?.forEach((variance) => {
      variance?.images.forEach((image) => {
        imagesOfExistingProduct.push(image.name);
      });
    });

    let deleteImages = await imagesOfExistingProduct?.filter(
      (imageName) => !imagesOfUpdateProduct.includes(imageName)
    );
    deleteImages.forEach((imageName) => firebaseAdmin.deleteFirebaseStorageFile(imageName));
    await ProductModel.updateOne({ _id: id }, updateProduct);
    product = await ProductModel.findById(id);
    return product;
  } catch (error) {
    console.log('Update product by id error: ', error);
    return false;
  }
};

const getQuatityByProductIdAndSizeAndColor = async (product_id, size, color) => {
  try {
    const product = await ProductModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(product_id),
        },
      },
      {
        $unwind: {
          path: '$variances',
        },
      },
      {
        $unwind: {
          path: '$variances.varianceDetail',
        },
      },
      {
        $match: {
          'variances.varianceDetail.size': Number(size),
          'variances.color': color,
        },
      },
      {
        $project: {
          _id: 1,
          color: '$variances.color',
          quantity: '$variances.varianceDetail.quantity',
          size: '$variances.varianceDetail.size',
        },
      },
    ]);
    return product[0];
  } catch (error) {
    throw error;
  }
};

const updateQuantityForProductByOrder = async (orderProducts, orderStatus) => {
  const session = await ProductModel.startSession();
  session.startTransaction();
  try {
    for (const orderProduct of orderProducts) {
      const existingProduct = await getQuatityByProductIdAndSizeAndColor(
        orderProduct.productId,
        orderProduct.size,
        orderProduct.color
      );
      if (!existingProduct) {
        throw new Error('Không tìm thấy productId=' + orderProduct.productId);
      }
      let newQuantity = existingProduct.quantity - orderProduct.quantity;
      if (orderStatus === OrderStatusEnum.REFUNDED || orderStatus === OrderStatusEnum.CANCELED) {
        newQuantity = existingProduct.quantity + orderProduct.quantity;
      }
      if (newQuantity < 0) {
        throw new Error(
          'Vượt quá số lượng đơn hàng trong kho: productId=' + orderProduct.productId
        );
      } else {
        await ProductModel.updateOne(
          {
            _id: orderProduct.productId,
          },
          {
            $set: {
              'variances.$[colorFilter].varianceDetail.$[sizeFilter].quantity': newQuantity,
            },
          },
          {
            arrayFilters: [
              { 'colorFilter.color': orderProduct.color },
              { 'sizeFilter.size': orderProduct.size },
            ],
            session: session,
          }
        );
      }
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const searchByName = async (name) => {
  try {
    // Sử dụng biểu thức chính quy (regular expression) để tìm kiếm tên sản phẩm
    const regex = new RegExp(name, 'i');
    const products = await ProductModel.find({ title: regex });

    return products;
  } catch (error) {
    console.error('Search by name error in ProductService: ', error);
    throw error;
  }
};

const searchProductsByBrand = async (brandName, productName) => {
  try {
    const brand = await BrandModel.findOne({ name: brandName });

    if (!brand) {
      console.log('Không tìm thấy thương hiệu.');
      return null;
    }

    let products;
    if (productName) {
      products = await ProductModel.find({
        brand: brand._id,
        title: { $regex: new RegExp(productName, 'i') }, // Tìm kiếm tên sản phẩm có chứa từ khóa productName
      }).populate('brand', '');
    } else {
      products = await ProductModel.find({ brand: brand._id }).populate('brand', '');
    }

    return products;
  } catch (error) {
    console.log('Lỗi khi tìm kiếm sản phẩm theo thương hiệu:', error);
    return null;
  }
};

const countAll = async () => {
  const count = await ProductModel.count();
  return count;
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
  updateQuantityForProductByOrder,
  getAllNewProducts,
};
