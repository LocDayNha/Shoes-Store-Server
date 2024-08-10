
// Bắt lỗi form đăng ký
const validationRegister = async (req,res, next)=>{
    const {email, password, name, phoneNumber} = req.body;
    if(!email || !password || !name || !phoneNumber ){
        return res.status(400)
      .json({result: false, message:'Vui lòng nhập đầy đủ thông tin '});
    }else{
        return next();
    }
    // else{
    //     let regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    //     if (!regex.test(email)) {
    //         return res.status(400).json({ result: false,
    //              message: 'Email không hợp lệ' });
    //     }
    //     regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    //     if (!regex.test(password)) {
    //         return res.status(400).json({ result: false,
    //              message: 'Mật khẩu phải có ít nhất 8 ký tự, chữ và số' });
    //     }
    //     regex = /^[a-zA-Z0-9 ]{5,}$/;
    //     if (!regex.test(name)) {
    //         return res.status(400).json({ result: false,
    //              message: 'Tên phải có ít nhất 5 ký tự và không có ký tự đặc biệt' });
    //     }
    //     regex = /^\+84[3|5|7|8|9][0-9]{8}\b/;
    //     if (!regex.test(phoneNumer)) {
    //         return res.status(400).json({ result: false,
    //              message: 'Số điện thoại không hợp lệ (bắt đầu với +84)' });
    //     }
    //     return next();
    // }
}

module.exports = {validationRegister};