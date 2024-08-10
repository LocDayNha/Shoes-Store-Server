const express = require('express');
const router = express.Router();
var moment = require('moment');
var ip = require('ip');
var querystring = require('qs');
var crypto = require('crypto');
const request = require('request');

router.get('/vnpay/create_payment_url', function (req, res, next) {
  try {
    let { amount } = req.query;
    var ipAddr = '127.0.0.1';
    let tmnCode = process.env.VNPAY_TMN_CODE;
    var secretKey = process.env.VNPAY_SECRET_KEY;
    var vnpUrl = process.env.VNPAY_PAYMENT_ENDPOINT;
    var returnUrl = `http://${ip.address()}:3000/api/payment/vnpay/result`;
    var date = new Date();

    var createDate = moment(date).format('YYYYMMDDHHmmss');
    var orderId = crypto.randomUUID().slice(0, 6).toUpperCase();
    var bankCode = '';

    var orderInfo = 'Thanh Toan Cho Ma Giao Dich ' + orderId;
    var orderType = 'other';
    var locale = 'vn';
    var currCode = 'VND';
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    var signData = querystring.stringify(vnp_Params, { encode: false });

    var hmac = crypto.createHmac('sha512', secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return res.status(200).json({ url: vnpUrl });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: error.message() });
  }
});

router.get('/vnpay/result', function (req, res, next) {
  let vnp_Params = req.query;
  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];
  vnp_Params = sortObject(vnp_Params);
  var secretKey = process.env.VNPAY_SECRET_KEY;
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac('sha512', secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

    return res.status(200).json({
      responseCode: vnp_Params['vnp_ResponseCode'],
      transactionRef: vnp_Params['vnp_TxnRef'],
      amount: vnp_Params['vnp_Amount'] / 100,
      vendor: vnp_Params['vnp_BankCode'],
      description: vnp_Params['vnp_OrderInfo'],
      transactionDate: moment(vnp_Params['vnp_PayDate'], 'YYYYMMDDHHmmss').format(
        'YYYY-MM-DD HH:mm:ss'
      ),
    });
  } else {
    return res.status(200).json({ code: '97' });
  }
});

router.post('/vnpay/querydr', function (req, res, next) {
  try {
    let date = new Date();
    let vnp_TmnCode = process.env.VNPAY_TMN_CODE;
    var secretKey = process.env.VNPAY_SECRET_KEY;
    let vnp_Api = process.env.VNPAY_API_ENDPOINT;

    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = moment(date).format('YYYYMMDDHHmmss');
    console.log(vnp_TxnRef);
    console.log(vnp_TransactionDate);
    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'querydr';
    let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;

    let vnp_IpAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let currCode = 'VND';
    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

    let data =
      vnp_RequestId +
      '|' +
      vnp_Version +
      '|' +
      vnp_Command +
      '|' +
      vnp_TmnCode +
      '|' +
      vnp_TxnRef +
      '|' +
      vnp_TransactionDate +
      '|' +
      vnp_CreateDate +
      '|' +
      vnp_IpAddr +
      '|' +
      vnp_OrderInfo;

    let hmac = crypto.createHmac('sha512', secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest('hex');

    let dataObj = {
      vnp_RequestId: vnp_RequestId,
      vnp_Version: vnp_Version,
      vnp_Command: vnp_Command,
      vnp_TmnCode: vnp_TmnCode,
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_TransactionDate: vnp_TransactionDate,
      vnp_CreateDate: vnp_CreateDate,
      vnp_IpAddr: vnp_IpAddr,
      vnp_SecureHash: vnp_SecureHash,
    };
    // /merchant_webapi/api/transaction
    request(
      {
        url: vnp_Api,
        method: 'POST',
        json: true,
        body: dataObj,
      },
      function (error, response, body) {
        // console.log(response);
        console.log(body);
        console.log('error', error);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

module.exports = router;
