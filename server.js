const express = require('express');
require('dotenv').config()
//bring in mongoose
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//bring in method override
const methodOverride = require('method-override');

const blogRouter = require('./routes/blogs');
const Blog = require('./models/Blog');
const Product = require('./models/product');
const User = require('./models/user');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const app = express();
const isAuth = require('./middleware/is-auth');

//connect to mongoose
let MONGODB_URI = 'mongodb+srv://rv:rv@varni.lzwad.mongodb.net/hiralShop?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

//set template engine
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
//route for the index
app.get('/', async (request, response) => {
  let blogs = await Blog.find().sort({ timeCreated: 'desc' });
  let user = await User.findOne({});
  response.render('index', { blogs: blogs, user: user });
});
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});


app.use(express.static('public'));
app.use('/blogs', blogRouter);

app.get('/profile', async (req, res) => {
  let user = await User.findOne({});
  res.render('profile', { user: user })
})


app.get('/admin', async (req, res) => {
  let blog = await Blog.find({});

  if (blog) {
    res.render('admin', { blogs: blog });
  } else {
    response.redirect('/');
  }
})
app.get('/login', (req, res, next) => {
  res.render('login', { title: 'login page' })
})
app.post('/login', async (req, res, next) => {
  const { email, password, name } = req.body;


  // let hasPass = bcrypt.hashSync(password, 10);
  // console.log(hasPass)

  // name: String,
  //   email: { type: String, lowercase: true, trim: true },
  // password: { type: String, },
  // profile_pic: String,
  //   profile: String,
  //     userId: { type: String, default: null }
  // let user = new User({
  //   name: name, email: email, password: hasPass, userId: Date.now()
  // });
  // user.save();
  try {
    let findUser = await User.findOne({ email: email });
    let passValid = bcrypt.compareSync(password, findUser.password);
    if (passValid) {
      if (findUser) {
        let blog = await Blog.find({});
        console.log(blog)
        if (blog) {
          res.render('admin', { blogs: blog });
        } else {
          response.redirect('/');
        }
      } else {
        res.render('login', { title: 'Home page' })
      }
    } else {
      res.render('login', { title: 'Home page' })
    }


  } catch (error) {
    console.log(error);
  }
});

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

//listen port
let port = process.env.PORT || 5009;
app.listen(port, () => {
  console.log('server on ' + port);
});
