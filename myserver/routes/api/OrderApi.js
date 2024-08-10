const express = require('express');
const router = express.Router();
var moment = require('moment');
var ip = require('ip');
var querystring = require('qs');
var crypto = require('crypto');
const request = require('request');
require('dotenv').config();
const orderService = require('../../components/order/OrderService');
const orderController = require('../../components/order/OrderController');

router.post('/', async function (req, res, next) {
  try {
    let newOrder = await orderService.createOrder(req.body);
    return res.status(200).json({ order: newOrder });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

//http://localhost:3000/api/order/all
router.get('/all', async function (req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//http://localhost:3000/api/order/get-order-detail/:orderId
router.get('/get-order-detail/:orderId', async function (req, res, next) {
  const { orderId } = req.params;
  try {
    const orders = await orderService.getOrderByOrderId(orderId);
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//http://localhost:3000/api/order/user-orders/:userId
router.get('/user-orders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await orderService.getUserOrders(userId);
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    const orders = result.orders;

    // Đếm số mặt hàng trong mỗi đơn hàng
    const ordersWithProductCount = await Promise.all(
      orders.map(async (order) => {
        const productCountResult = await orderService.getProductCountInOrder(order._id);

        if (productCountResult.success) {
          return { ...order._doc, productCount: productCountResult.productCount };
        } else {
          return { ...order._doc, productCount: 0 };
        }
      })
    );

    // lấy số lượng đơn hàng của người dùng
    const resultOrderCount = await orderService.getUserOrderCount(userId);
    if (!resultOrderCount.success) {
      return res.status(500).json({ message: resultOrderCount.message });
    }

    res.status(200).json({
      orders: result.orders,
      orderCount: resultOrderCount.orderCount,
      orders: ordersWithProductCount,
    });
  } catch (error) {
    res.status(500).json({ result: false, error: error.message });
  }
});

router.put('/update-status', async function (req, res, next) {
  const { orderId, status, isPaid } = req.body; // Lấy giá trị isPaid từ request body
  try {
    const orders = await orderService.updateOrderStatus(orderId, status, isPaid); // Truyền giá trị isPaid vào service
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
//http://localhost:3000/api/order/getTotalAmount
// router.get('/getTotalAmount', async (req, res, next) => {
//   try {
//     const { userId, isPaid, fromDate, toDate } = req.query;
//     const totalAmount  = await orderController.getTotalAmountByUserAndStatus(userId, isPaid, fromDate, toDate);
//     if (totalAmount) {
//       return res.status(200).json({ result: true, totalAmount: totalAmount, message: 'Success' });
//     }
//     return res.status(400).json({ result: false, totalAmount: null, message: 'Failed' });
//   } catch (error) {
//     return res.status(500).json({ result: false, totalAmount: null });
//   }
// });
router.get('/getTotalAmount', orderController.getTotalAmountByUserAndStatus);
//http://localhost:3000/api/order/getTotalAmountByMonth
router.get('/getTotalAmountByMonth', orderController.getTotalAmountByMonthAndStatus);
//http://localhost:3000/api/order/getDailyPayments
router.post('/getDailyPayments', orderController.getDailyPayments);
//http://localhost:3000/api/order/getProductCountByDay
router.get('/getProductCountByDay', orderController.getProductCountByDay);

module.exports = router;
