const express = require('express');
const router = express.Router();
const auth = require('/home/erald/mern/middleware/auth,js');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');

//@route GET api/auth
//@desc Test route
//@access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

});

//@route POST api/auth
//@desc Auth user + get token
//@access Public
router.post('/', 
    [
    check('email', 'Email required.').isEmail(),
    check('password', 'Password with 6+ characters required.').exists()
    ], 
    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        //check credentials
        let user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ errors: [{msg: 'Invalid password or email.'}] });
        }

        //compare entered pw with encrypted pw
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{msg: 'Invalid password or email.'}] });
        }

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