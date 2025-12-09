const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profiles');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

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
});

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
});

//@route DELETE api/profile
//@desc Delete profile
//@access Private
router.delete('/', auth, async (req, res) => { //<-- auth middleware for private routes
    try {
        await Profile.findOneAndDelete({ user: req.user.id });
        await User.findOneAndDelete({ _id: req.user.id });
        res.json({ msg: 'User Removed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error!');
    }
});

//@route PUT api/profile/experience
//@desc Add profile experience
//@access Private
router.put('/experience', [auth, [check('title', 'Title is required!').not().isEmpty(), check('company', 'Company is required!').not().isEmpty(), check('currentPosition', 'Current position is required!').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        duration,
        currentPosition
    } = req.body;

    const newEntity = {
        title,
        company,
        duration,
        currentPosition
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newEntity); //push to beginning of list
        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error!');
    }
});


//@route DELETE api/profile/experience/:exp_id
//@desc Delete experience entity
//@access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const toBeRemoved = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(toBeRemoved, 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


//-------------------------------------------------------

//@route PUT api/profile/education
//@desc Add profile education
//@access Private
router.put('/education', [auth, [check('level', 'Level is required!').not().isEmpty(), check('institution', 'Institution is required!').not().isEmpty(), check('currentlyStudying', 'Current status is required!').not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        level,
        institution,
        field,
        duration,
        currentlyStudying
    } = req.body;

    const newEntity = {
        level,
        institution,
        field,
        duration,
        currentlyStudying
    };

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEntity); //push to beginning of list
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error!');
    }
});

//@route DELETE api/profile/education/:edu_id
//@desc Delete education entity
//@access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const toBeRemoved = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(toBeRemoved, 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//-------------------------------------------------------

//@route GET api/profile/github/:username
//@desc Get github repo
//@access Public
router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=4&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'} //fixes 403 Forbidden – Missing User-Agent header
        };
        request(options, (error, response, body) => {
            if (error) {
                console.log(error);
            }
            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'Profile not found.' });
            }
            res.json(JSON.parse(body));
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error!');
    }
})


module.exports = router;