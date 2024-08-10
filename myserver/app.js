var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
//session. cookies
const session = require('express-session');
var logger = require('morgan');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

//mongo
const mongoose = require('mongoose');
const User = require('./models/user');
require('./components/brand/BrandModel');
require('./components/products/ProductModel');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//api
const userAPIRouter = require('./routes/api/UserApi');
const brandAPIRouter = require('./routes/api/BrandApi');
const productAPIRouter = require('./routes/api/ProductApi');
const uploadAPIRouter = require('./routes/api/UploadApi');
const CartAPIRouter = require('./routes/api/CartApi');
const OrderAPIRouter = require('./routes/api/OrderApi');
const paymentAPIRouter = require('./routes/api/PaymentApi');
const favoriteAPIRouter = require('./routes/api/FavoriteApi');
const statisticsAPIRouter = require('./routes/api/StatisticsApi');
const ratingAPIRouter = require('./routes/api/RatingApi');
const ratingProductAPIRouter = require('./routes/api/RatingProductApi');

var app = express();
//cors
var cors = require('cors');
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//khai báo thông tin session
app.use(
  session({
    secret: 'iloveyou',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

//connect database
//mongodb://127.0.0.1:27017/MyFpoly
mongoose
  .connect('mongodb+srv://tungh3210:tung@cluster0.cmonbw2.mongodb.net/GraduationProject', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('>>>>>>>>>> DB Connected!!!!!!'))
  .catch((err) => console.log('>>>>>>>>> DB Error: ', err));

// improt api
app.use('/', indexRouter);
app.use('/users', usersRouter);

//Dành cho API
//http:localhost:3000/api/user
app.use('/api/user', userAPIRouter);
//http:localhost:3000/api/brand
app.use('/api/brand', brandAPIRouter);
//http:localhost:3000/api/product
app.use('/api/product', productAPIRouter);
app.use('/api/upload', uploadAPIRouter);
//http:localhost:3000/api/cart
app.use('/api/cart', CartAPIRouter);
app.use('/api/order', OrderAPIRouter);
app.use('/api/payment', paymentAPIRouter);
//http:localhost:3000/api/favorite
app.use('/api/favorite', favoriteAPIRouter);
app.use('/api/statistics', statisticsAPIRouter);
//http:localhost:3000/api/rating
app.use('/api/rating', ratingAPIRouter);
//http:localhost:3000/api/ratingProduct
app.use('/api/ratingProduct', ratingProductAPIRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//function to send verification email to user
const sendVerificationEmail = async (email, verificationToken) => {
  //create a nodemailer transport
  const transporter = nodemailer.createTransport({
    //configure the email service
    service: 'gmail',
    auth: {
      user: 'tungh3210@gmail.com',
      pass: 'aeao ejjt xkqy jngb',
    },
  });

  //compose the email verification
  const mailOptions = {
    from: 'amazon.com',
    to: email,
    subject: 'Email Verification!',
    text: `Please click the link below to verify your Email! : http://localhost:3000/verify/${verificationToken}`,
  };

  //send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Error sending verification email', error);
  }
};

//register in the app
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Emaill already registered' });
    }

    //create new user
    const newUser = new User({ name, email, password });

    //generate and store the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString('hex');

    //save user to the database
    await newUser.save();

    //send verification email to user
    sendVerificationEmail(newUser.email, newUser.verificationToken);
  } catch (error) {
    console.log('register user error', error);
    res.status(500).json({ message: 'Register failed!' });
  }
});

//endoint veidication email
app.get('/verify/:token', async (req, res) => {
  try {
    const token = req.params.token;

    //Find the user with the given verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: 'Invalid verification token' });
    }

    //Mark the user as verified
    user.verified = true;
    user.verificationToken = undefined;

    await user.save();
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Email Verification Failed!' });
  }
});

module.exports = app;
