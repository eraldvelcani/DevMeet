const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profiles');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

//@route GET api/profile/me
//@desc Get current profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found.' });
        }
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error!');
    }
});


//@route POST api/profile
//@desc Create / update profile
//@access Private
router.post('/', [auth, [check('currentStatus', 'Current status is required!').not().isEmpty()]],
async (req, res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        website,
        skills,
        currentStatus,
        bio,
        githubUser
    } = req.body;

    //profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    };
    if (currentStatus) profileFields.currentStatus = currentStatus;
    if (bio) profileFields.bio = bio;
    if (githubUser) profileFields.githubUser = githubUser;
    
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            //update profile
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
            return res.json(profile)
        }
            //create profile
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error!');
    }
});

//@route GET api/profile
//@desc Get profile list
//@access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error!');
    }
})

//@route GET api/profile/user/:user_id
//@desc Get profile by user_id
//@access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) return res.status(400).json({ msg: "Profile not found." })
        res.json(profile);
    } catch (error) {
        console.error(error);
        if (error.kind === "ObjectId") return res.status(400).json({ msg: "Profile not found." });
        res.status(500).send('Server Error!');
    }
})

module.exports = router;