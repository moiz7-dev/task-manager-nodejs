const express = require('express');
const router = new express.Router();
const User = require('../models/users');
const auth = require('../middlewares/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

//login user
router.post('/users/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findByCredentials(email, password);

        const token = await user.generateAuthToken();
        res.send({user, token})
    } catch (e) {
        res.status(400).send(e.message);
    }
})

//signup user
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        console.log(e)
        res.status(400).send(e);
    }
    
})

//fetch all users
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

///fetch single user
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findOne({ _id });
        
        if (!user) {
            res.status(404).send({error: 'No users found!'})
        }
        
        res.send(user);
    } catch (err) {
        res.status(500).send(err)
    }
})

//update user
router.patch('/users/me', auth, async (req, res) => {
    const data = req.body
    const updates = Object.keys(data);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid operation!' })
    }
    
    try {
        updates.forEach((update) => {
            req.user[update] = data[update];
        })
        
        await req.user.save();
        // const user = await User.findByIdAndUpdate(_id, data, { new: true, runValidators: true })
        res.send({ success: true, message: 'Your account has been updated successfully!'})
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name)
        res.send({ success: true, message: 'Your account has been removed successfully' });
    } catch (e) {
        res.status(500).send(e)
    }
})

//logout user
router.post('/users/logout', auth, async (req, res) => {
    
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save();
        
        res.send({ success: 'Successfully Logged Out!'})
        
    } catch (e) {
        res.send(500).send({ error: e.message })
    }
})

//logoutAll
router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save();
        
        res.send({ success: 'Successfully logged out from all devices.'})
    } catch(e) {
        res.status(500).send({ error: e.message})
    }
})

const upload = multer({
    limits: {
        fileSize: 1024 * 1024 // 1mb size 
    },
    fileFilter(req, file, cb) {
        
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File type must be jpg, jpeg or png'));
        }
        
        cb(undefined, true);
    }
}) 

// insert/update image
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    
    const bufferImage = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    req.user.avatar = bufferImage;
    await req.user.save();
    res.send('Profile picture upload successfully!');
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// delete image
router.delete('/users/me/avatar', auth, async (req, res) => {

    req.user.avatar = undefined;
    await req.user.save();
    res.send('Profile picture deleted successfully!');
})

// Open image
router.get('/users/:id/avatar', async (req, res) => {
    const user = await User.findById(req.params.id);

    try
    {
        if(!user || !user.avatar) {
        throw new Error()
        }

        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send('Image not found!');
    }
})

module.exports = router;