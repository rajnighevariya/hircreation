//blog routes

const express = require('express');
const Blog = require('./../models/Blog');
const router = express.Router();
const multer = require('multer');
const Prouct = require('./../models/product');
const User = require('./../models/user');

//define storage for the images

const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null, './public/uploads/images');
  },

  //add back the extension
  filename: function (request, file, callback) {
    callback(null, file.originalname);
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

router.get('/new', (request, response) => {
  response.render('new');
});

//view route
router.get('/:slug', async (request, response) => {
  let blog = await Blog.findOne({ slug: request.params.slug });

  if (blog) {
    response.render('show', { blog: blog });
  } else {
    response.redirect('/admin');
  }
});
router.post('/profile/update', upload.single('profile_pic'), async (req, res, next) => {

  const { username, useremail, usermobile, userprofile } = req.body;
  let finduser = await User.findOne({ email: useremail });

  let imageUrl = `${req.protocol}://${req.hostname}/uploads/images/${req.file.filename}`
  if (finduser) {
    let data = {
      name: username,
      email: useremail,
      mobile: usermobile,
      profile_pic: imageUrl,
      profile: userprofile,
    }
    let newuser = await User.findOneAndUpdate({ email: useremail }, { $set: { ...data } }, {
      new: true
    });
    res.redirect('/admin');
  } else {
    res.redirect('/profile')
  }

})



//route that handles new post
// router.post('/', upload.single('image'), async (request, response) => {
//   console.log(request.file);
//   // console.log(request.body);
//   let blog = new Blog({
//     title: request.body.title,
//     author: request.body.author,
//     description: request.body.description,
//     img: request.file.filename,
//   });

//   try {
//     blog = await blog.save();

//     response.redirect(`blogs/${blog.slug}`);
//   } catch (error) {
//     console.log(error);
//   }
// });
// 'http://localhost:5000/' + request.file.filename,

router.post('/', upload.single('image'), async (request, response) => {

  let imageUrl = `${request.protocol}://${request.hostname}/uploads/images/${request.file.filename}`

  let product = new Blog({
    title: request.body.title,
    img: imageUrl,
  });

  try {
    product = await product.save();

    response.redirect(`/admin`);
  } catch (error) {
    console.log(error);
  }
});

// route that handles edit view
router.get('/edit/:id', async (request, response) => {
  let blog = await Blog.findById(request.params.id);
  response.render('edit', { blog: blog });
});

//route to handle updates
router.put('/:id', upload.single('image'), async (request, response) => {
  request.blog = await Blog.findById(request.params.id);

  // let imageUrl = `${request.protocol}://${request.hostname}:${process.env.PORT}/uploads/images/${request.body.image}`

  let imageUrl = `${request.protocol}://${request.hostname}/uploads/images/${request.body.image}`
  let blog = request.blog;
  blog.title = request.body.title;
  blog.author = request.body.author;
  // blog.description = request.body.description;

  blog.img = imageUrl

  try {
    blog = await blog.save();
    //redirect to the view route
    // blogs/${blog.slug}
    response.redirect(`/admin`);
  } catch (error) {
    console.log(error);
    response.redirect(`/seblogs/edit/${blog.id}`, { blog: blog });
  }
});

///route to handle delete
router.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.redirect('admin');
});

module.exports = router;
