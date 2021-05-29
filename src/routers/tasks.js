const express = require('express');
const router = new express.Router();
const Task = require('../models/tasks');
const auth = require('../middlewares/auth');
const multer = require('multer')
const sharp = require('sharp');


// add new task
router.post('/tasks', auth,  async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//fetch all tasks
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    
    if(req.query.completed){
        match.completed = (req.query.completed === 'true');
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = (parts[1] === 'asc') ? 1 : -1;
    }

    try {
        // const task = await Task.find({ owner: req.user._id})
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

//fetch single task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        
        if (!task) {
            return res.status(404).send('No task found!');
        }
        res.send(task);
    } catch (err) {
        res.status(500).send(err)
    }
})

//update task
router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const data = req.body;
    const updates = Object.keys(data);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid operation' });
    }

    try {
        const task = await Task.findOne({_id, owner: req.user._id});

        if (!task) {
            return res.status(404).send('No Task found!');
        }

        updates.forEach((update) =>{
            task[update] = data[update]
        })

        task.save();

        // const task = await Task.findByIdAndUpdate(_id, data, { new: true, runValidators: true });


        res.send({ success: true, message: 'Task saved successfully'})
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete task
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id});

        if (!task) {
            return res.status(404).send('No task found!')
        }

        res.send({ success: true, message: 'Task deleted successfully' })
    } catch (e) {
        res.status(500).send(e)
    }
})

//image
const upload = multer({
    limits: {
        fileSize: 1024 * 1024 // 1mb size 
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File type must be jpg, jpeg or png'));
        }

        cb(undefined, true);
    }
})

// insert/update image
router.post('/tasks/:id/document', auth, upload.single('document'), async (req, res) => {

    const bufferImage = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    try{
        const task = await Task.findById(req.params.id)

        if(!task){
            res.status(404).send({ error: 'No task found!'})
        }

        task.document = bufferImage;
        await task.save()
        res.send({ success: 'Task document uploaded successfully!'})
    } catch (e) {
        res.status(400).send(e)
    }

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// delete image
router.delete('/tasks/:id/document', auth, async (req, res) => {
    try{
        const task = await Task.findById(req.params.id)

        if(!task){
            res.status(400).send({ error: 'No task found!'})
        }

        task.document = undefined;

        await task.save();

        res.send({ success: 'Task document deleted successfully!'})

    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

// Open image
router.get('/tasks/:id/document', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || !task.document) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg');
        res.send(task.document)
    } catch (e) {
        res.status(404).send('Image not found!');
    }
})

module.exports = router;