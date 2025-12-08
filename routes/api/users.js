const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//@route POST api/users
//@desc Reg user
//@access Public
router.post('/', 
    [
    check('name', 'Name required.').not().isEmpty(),
    check('email', 'Email required.').isEmail(),
    check('password', 'Password with 6+ characters required.').isLength({ min: 6 })
    ], 
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        //check user existence
        let user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({ errors: [{msg: 'User already exists.'}] });
        }

        //get gravatar
        const avatar = gravatar.url(email, {
            s: '200', //size
            r: 'pg', //rating
            d: 'mm' //default
        });

        user = new User({ name, email, avatar, password }); //create user instance if user doesn't exist

        //crypt pw
        const salt = await bcrypt.genSalt(10); //roundnr, recommended amount is 10
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        //json webtoken
        const payload = {
            user: {id: user.id}
        };

        jwt.sign(payload, config.get('jwtSecret'), (err, token) => {
            if(err) throw err;
            res.json({ token })
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }


    }
);

module.exports = router;