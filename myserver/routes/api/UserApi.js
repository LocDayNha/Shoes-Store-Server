const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const accountSid = 'AC5f766bfe64dd2ab23d891861d3e81ddd';
const authToken = '4004797e8187388d104009a996bbab15';
const client = require('twilio')(accountSid, authToken);

// const twilio = require('twilio');
// const bodyParser = require('body-parser');
const userController = require('../../components/user/UserController');
const upload = require('../../middle/UploadImg');
const { validationRegister } = require('../../middle/Validation');

//http://localhost:3000/api/user/login
// api login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userController.login(email, password);
    if (user) {
      // tao token
      const token = jwt.sign({ user }, 'secret', { expiresIn: '1h' });
      const returnData = {
        error: false,
        responseTimestamp: new Date(),
        statusCode: 200,
        data: {
          token: token,
          user: user,
        },
      };
      return res.status(200).json(returnData);
    } else {
      return res.status(400).json({ result: false, user: null });
    }
  } catch (error) {
    console.log(error);
    next(error); //danh cho web
    return res.status(500).json({ result: false, message: 'loi he thong' });
  }
});

//http://localhost:3000/api/user/register
router.post('/register', [validationRegister], async (req, res, next) => {
  try {
    const { email, password, name, address, phoneNumber } = req.body;
    const user = await userController.register(email, password, name, address, phoneNumber);
    if (user) {
      return res.status(200).json({ result: true, user: user });
    } else {
      return res.status(400).json({ result: false, user: null, message: '111' });
    }
  } catch (error) {
    console.log(error);
    next(error); //danh cho web
    return res.status(500).json({ result: false, message: 'loi he thong' });

    next(error); //danh cho web
    return res.status(500).json({ result: false, message: 'loi he thong' });
  }
});
//http://localhost:3000/api/user/update
router.post('/update', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      address,
      phoneNumber,
      gender,
      dob,
      image,
      isVerified,
      verificationCode,
    } = req.body;
    // console.log(email, password, name, description,gender, dob, avatar, role, createAt, updateAt, isLogin);

    const user = await userController.updateUser(
      name,
      email,
      password,
      address,
      phoneNumber,
      gender,
      dob,
      image,
      isVerified,
      verificationCode
    );
    // console.log(user)
    if (user) {
      return res.status(200).json({ result: true, user: user, message: 'Update Success' });
    } else {
      return res.status(400).json({ result: false, user: null, message: ' user not exist' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ result: false, user: null });
  }
});
//http://localhost:3000/api/user/upload-image
router.post('/upload-image', [upload.single('image')], async (req, res, next) => {
  try {
    const { file } = req;
    if (file) {
      const link = `http://192.168.1.219:3000/images/${file.filename}`;
      return res.status(200).json({ result: true, link: link });
    }

    return res.status(400).json({ result: true, link: null });
  } catch (error) {
    console.log('Edit new product error: ', error);
    return res.status(500).json({ result: false });
  }
});

//http://localhost:3000/api/user/send-otp-new
router.post('/send-otp-new', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    let subject = 'THE FIVE MAN SHOES SHOP RESEND OTP';
    const verifyCode = Math.floor(Math.random() * 90000) + 10000;
    number = verifyCode;
    console.log('--->', verifyCode);
    console.log('number', number);
    const result = await userController.sendVerifyCodeNew(email, subject, verifyCode);
    return res.status(200).json({ message: 'Send Success', result: result });
  } catch (error) {
    console.log('MAIL:' + error); //API
    return res.status(500).json({ result: false, massage: 'ERROR Send' }); //app
  }
});

// for forgot password
//http://localhost:3000/api/user/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    let subject = 'THE FIVE MAN SHOES SHOP SEND OTP';
    const verifyCode = Math.floor(Math.random() * 90000) + 100000;
    number = verifyCode;
    console.log('--->', verifyCode);
    console.log('number', number);
    const result = await userController.sendVerifyCode(email, subject, verifyCode);
    return res.status(200).json({ message: 'Send Success', result: result });
  } catch (error) {
    console.log('MAIL:' + error); //API
    return res.status(500).json({ result: false, massage: 'ERROR Send' }); //app
  }
});

const users = {};
//http://localhost:3000/api/user/send-otp-phone
router.post('/send-otp-phone', async (req, res) => {
  const { phoneNumber } = req.body;

  // Kiểm tra xem số điện thoại đã được đăng ký chưa
  if (users[phoneNumber]) {
    res.status(400).json({ error: 'Phone number already registered' });
    return;
  }

  // Tạo một mã OTP ngẫu nhiên
  const otpCode = Math.floor(Math.random() * 90000) + 100000;

  // Lưu trữ thông tin người dùng và mã OTP
  users[phoneNumber] = otpCode;

  // Gửi mã OTP đến số điện thoại sử dụng Twilio
  client.messages
    .create({
      body: `Mã OTP của bạn là: ${otpCode}`,
      from: '+12246331227',
      to: phoneNumber,
    })
    .then(() => {
      res.json({ message: 'OTP sent successfully' });
    })
    .catch((error) => {
      console.error('Twilio error:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    });
});

router.post('/verify-otp-phone', async (req, res) => {
  const { phoneNumber, otpCode } = req.body;

  // Kiểm tra xem số điện thoại đã được đăng ký chưa
  if (!users[phoneNumber]) {
    res.status(400).json({ error: 'Phone number not registered' });
    return;
  }

  // Kiểm tra mã OTP
  if (users[phoneNumber] !== otpCode) {
    res.status(400).json({ error: 'Invalid OTP', otpCode: otpCode });

    return;
  }

  // Xác minh thành công - xóa thông tin người dùng và mã OTP khỏi lưu trữ
  delete users[phoneNumber];

  res.json({ message: 'OTP verified successfully' });
});

//http://localhost:3000/api/user/change-forgot-password
router.put('/change-forgot-password', [], async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    console.log(email, newPassword);
    const user = await userController.changeForgotPassword(email, newPassword);
    console.log(user);
    if (user) {
      res.status(200).json({ result: true, message: 'Change Forgot Password Success' });
    } else {
      res.status(400).json({ result: false, massage: 'Change Forgot Password Failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

//Change password with phone number
//http://localhost:3000/api/user/change-password-phone
router.put('/change-password-phone', [], async (req, res, next) => {
  try {
    const { phoneNumber, newPassword } = req.body;
    console.log(phoneNumber, newPassword);
    const user = await userController.changePasswordPhone(phoneNumber, newPassword);
    console.log(user);
    if (user) {
      res.status(200).json({ result: true, message: 'Change Password Success' });
    } else {
      res.status(400).json({ result: false, massage: 'Change Password Failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

//confirmOTP
//http://localhost:3000/api/user/confirm-otp
router.post('/confirm-otp', async (req, res) => {
  try {
    const { email, verifyCode } = req.body;
    const result = await userController.verifyCode(email, verifyCode);
    console.log(result);
    if (result) {
      return res.status(200).json({ result: true, message: 'Verify Success' });
    } else {
      return res.status(400).json({ result: false, message: 'Verify Failed' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ result: false, message: 'Verify Failed' });
  }
});
//http://localhost:3000/api/user/update/
router.put('/update/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, address, gender, dob, image } = req.body;
    const user = await userController.updateUser(
      id,
      name,
      email,
      phoneNumber,
      address,
      gender,
      dob,
      image
    );
    console.log(user);
    if (user) {
      return res.status(200).json({ result: true, user: user, message: 'Update Success' });
    } else {
      return res.status(400).json({ result: false, user: null, message: ' user not exist' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ result: false, user: null });
  }
});

// http://localhost:3000/api/user/delete/:id
router.delete('/delete/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userController.deleteUserById(id);
    return res.status(200).json({ result: true, users: user });
  } catch (error) {
    return res.status(500).json({ result: false, users: null });
  }
});

// http://localhost:3000/api/user/get-all?role=1
router.get('/get-all', [], async (req, res, next) => {
  try {
    const role = req.query;
    const user = await userController.getAllUsers(role);
    return res.status(200).json({ result: true, user: user });
  } catch (error) {
    console.log('Get all error: ', error);
    return res.status(500).json({ result: false, user: null });
  }
});
// http://localhost:3000/api/user/get-by-id?id=
router.get('/get-by-id', async (req, res, next) => {
  try {
    const { id } = req.query;
    const user = await userController.getUserById(id);
    return res.status(200).json({ result: true, user: user });
  } catch (error) {
    console.log('Get by id error: ', error);
    return res.status(500).json({ result: false, user: null });
  }
});

module.exports = router;
