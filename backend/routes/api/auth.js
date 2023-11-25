const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const gravatar = require('gravatar');
const { check, validationResult } = require('express-validator');


const auth = require('../../middleware/auth');
const User = require('../../models/Users');

// @route   GET api/auth
// @desc    Protected route (check if the user exists)
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    console.log(req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user + get token (login)
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //if errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // if user doesn't exist
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // if exist, we need to match the password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // return webtoken from user
      const payload = {
        user: {
          id: user.id,
          // this Id comes from DataBase when user is created
        },
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '3 days' },
        (err, serviceToken) => {
          if (err) throw err;
          console.log('User logged in');
          res.json({ serviceToken });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/users
// @desc    Register user (register)
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //if errors
    if (!errors.isEmpty()) {
      // 400 => bad request from the client
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    console.log('body.parser', name, email, password);

    try {
      // if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // get user gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      // create user
      user = new User({ name, email, avatar, password });

      // encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // save user in data base
      await user.save();

      // return webtoken from user
      const payload = {
        user: {
          id: user.id,
          // this Id comes from DataBase when user is created and is UNIQUE
        },
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: "3 days" },
        (err, serviceToken) => {
          if (err) throw err;
          console.log('User registered');
          res.json({ serviceToken });
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({_id: req.user.id});

    if (!user) {
      return res.status(400).json({ msg: 'There is no this user' });
    }

    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
