const userService = require('./UserService');
const mailer = require('nodemailer');
const UserModel = require('./UserModel');

const login = async (email, password) => {
  return await userService.login(email, password);
};

const register = async (email, password, name, address, phoneNumber) => {
  return await userService.register(email, password, name, address, phoneNumber);
};

const sendVerifyCode = async (email, subject, verifyCode) => {
  try {
    const mailOptions = {
      from: 'ADMIN <thefivemensshoesshop@gmail.com>',
      to: email,
      subject: subject,
      html:
        'Mã OTP của bạn là : ' +
        verifyCode +
        '<br/>' +
        'Mã OTP có hiệu lực trong 5 phút. Vui lòng không cung cấp mã OTP này cho bất cứ ai!',
    };
    await UserModel.updateOne({ email }, { verificationCode: verifyCode });
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Send email error:', error);
  }
  return false;
};

const sendVerifyCodePhone = async (phoneNumber, subject, verifyCode) => {
  try {
  } catch (error) {
    console.log(error);
  }
};
const sendVerifyCodeNew = async (email, subject, verifyCode) => {
  try {
    const mailOptions = {
      from: 'Admin <thefivemensshoesshop@gmail.com>',
      to: email,
      subject: subject,
      html:
        'Mã OTP của bạn là :  ' +
        verifyCode +
        '<br/>' +
        'Mã OTP có hiệu lực trong 5 phút. Vui lòng không cung cấp mã OTP này cho bất cứ ai!',
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log('Send email error:', error);
  }
  return false;
};

const verifyCode = async (email, verifyCode) => {
  try {
    console.log(email, verifyCode);
    const user = await UserModel.findOne({ email: email });
    console.log(user);
    if (user) {
      console.log('=====>', user.verificationCode);
      if (user.verificationCode === verifyCode) {
        console.log('Nay la user voi code nhap vao', user.verificationCode);
        await UserModel.updateOne({ email }, { isVerified: true });
        return true;
      } else {
        return false;
      }
    } else {
      console.log('Khong tim thay user');
      return false;
    }
  } catch (error) {
    console.log('Verify email error:', error);
  }
};

const changeForgotPassword = async (email, newPassword) => {
  try {
    return await userService.changeForgotPassword(email, newPassword);
  } catch (error) {
    throw error;
  }
};

const changePasswordPhone = async (phoneNumber, newPassword) => {
  try {
    return await userService.changePasswordPhone(phoneNumber, newPassword);
  } catch (error) {
    throw error;
  }
};

const transporter = mailer.createTransport({
  pool: true,
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use TLS
  auth: {
    user: 'thefivemensshoesshop@gmail.com',
    pass: 'gtqj dgsg ppxj ljqj',
  },
  tls: { rejectUnauthorized: false },
});

const updateUser = async (
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
) => {
  try {
    return await userService.updateUser(
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
  } catch (error) {
    return false;
  }
};
const getAllUsers = async (role) => {
  try {
    return await userService.getAllUsers(role);
  } catch (error) {
    throw error;
  }
};
const getUserById = async (id) => {
  try {
    return await userService.getUserById(id);
  } catch (error) {
    return null;
  }
};
const deleteUserById = async (id) => {
  try {
    return await userService.deleteUserById(id);
  } catch (error) {
    throw false;
  }
}

module.exports = {
  login,
  register,
  sendVerifyCodeNew,
  sendVerifyCode,
  verifyCode,
  changeForgotPassword,
  updateUser,
  changePasswordPhone,
  sendVerifyCodePhone,
  getAllUsers, 
  getUserById, 
  deleteUserById
};
