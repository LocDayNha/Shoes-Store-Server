const UserModel = require('./UserModel');
const userModel = require('./UserModel');
const bcrypt = require('bcryptjs');

//1. kiem tra email,password
//2. kiem tra email co ton tai trong database khong
//3. kiem tra password co dung ko
//4. neu dung, tra ve thong tin user
//5. neu sai, tra ve null
const login = async (email, password) => {
  // const user=users.find(u => u.email==email);
  // if(user && user.password==password)
  // {
  //     return user;
  // }
  // return null;

  try {
    const user = await userModel.findOne({ email: email });

    if (user) {
      const result = bcrypt.compareSync(password, user.password);
      return result ? user : false;
    }
  } catch (error) {
    console.log('login error: ', error);
  }
  return false;
};

const register = async (email, password, name, address, phoneNumber) => {
  try {
    // kiem tra email da co hnay chua
    // selec * form users where email=email
    const user = await userModel.findOne({ email: email });
    if (user) {
      console.log('Email đã được đăng kí');
      return false;
    }
    // them moi user vao data
    // ma hoa password
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    const newUser = { email, password: hash, name, address, phoneNumber, role: 1 };
    const u = new userModel(newUser);
    await u.save();
    return true;
  } catch (error) {
    console('register error: ', error);
  }
  return false;
};

const changeForgotPassword = async (email, newPassword) => {
  try {
    const user = await userModel.findOne({ email: email });
    console.log('INFO USER:', user);
    if (user) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);
      user.password = hash;
      await user.save();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Change Password got an error: ', error);
    throw error;
  }
};

const changePasswordPhone = async (phoneNumber, newPassword) => {
  try {
    const user = await userModel.findOne({ phoneNumber: phoneNumber });
    if (user) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);
      user.password = hash;
      await user.save();
      return true;
    } else {
      console.log('Khong tim thay user');
      return false;
    }
  } catch (error) {
    console.log('Change Password got an error: ', error);
    throw error;
  }
};

//// //name: { type: String },
// email: { type: String },
// password: { type: String },
// address:{type: String},
// phoneNumber:{type:Number},
// gender
// role:{type: Number,default:1},
// image: { type: String, default: "" },
const updateUser = async (name, email, password, address, phoneNumber, gender, dob, image) => {
  try {
    const user = await UserModel.findOne({ email: email });
    if (user) {
      user.name = name ? name : user.name;
      user.email = email ? email : user.email;
      user.password = password ? password : user.password;
      user.address = address ? address : user.address;
      user.gender = gender ? gender : user.gender;
      user.phoneNumber = phoneNumber ? phoneNumber : user.phoneNumber;
      user.dob = dob ? dob : user.dob;
      user.image = image ? image : user.image;

      await user.save();
      console.log('INFO USER:', user);

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Update User  error', error);
    return false;
  }
};

const getAllUsers = async (role) => {
  try {
    return await userModel.find(role);
  } catch (error) {
    console.log('Get all users error', error);
    throw error;
  }
};
const getUserById = async (id) => {
  try {
  return await userModel.findById(id);
  } catch (error) {
  console.log('Get users by id error', error);
  return null;
  }
};
const deleteUserById = async (id) => {
  try {
    await userModel.findByIdAndDelete(id);
    return true;
  } catch (error) {
      console('register error: ', error);
    console.log('Delete users by id error', error);
    return false;
  }
}
module.exports = { login, register, updateUser, changeForgotPassword, changePasswordPhone, getAllUsers, getUserById, deleteUserById };
