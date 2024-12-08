const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const Song = require('./models/Song');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
let MONGO_URI = '';
const mongoose = require('mongoose');
// Store songs in-memory (replace with a database if needed)
let songs = [];
// connecting to mangoose 
// mongoose.connect(MONGO_URI)
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('MongoDB connection error:', err));

const storage = multer.memoryStorage(); // Use memory storage to keep files in memory as buffers
const upload = multer({ storage: storage });
// Multer setup to handle buffer upload
// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 100 * 1024 * 1024 }, // 100MB size limit
// }).fields([
//     { name: 'song', maxCount: 1 }, // For the main song
//     { name: 'preAudio', maxCount: 1 }, // For the pre-audio
// ]);

// // Home page where we show songs grouped by tags
// app.get('/', async (req, res) => {
//     try {
//         const songs = await Song.find({});
//         const songsByTags = {};

//         songs.forEach(song => {
//             song.tags.forEach(tag => {
//                 if (!songsByTags[tag]) {
//                     songsByTags[tag] = [];
//                 }
//                 songsByTags[tag].push(song);
//             });
//         });

//         res.render('index', { songsByTags });
//     } catch (err) {
//         console.error('Error fetching songs:', err);
//         res.status(500).send('Error fetching songs.');
//     }
// });

// // Page for uploading a song
// app.get('/upload', (req, res) => {
//     res.render('upload');
// });

// // Handle song upload
// app.post(
//     '/upload',
//     upload.fields([
//         { name: 'preAudio', maxCount: 1 },
//         { name: 'song', maxCount: 1 },
//     ]),
//     async (req, res) => {
//         const { songName, songTags } = req.body;
//         const tagsArray = songTags.split(',').map(tag => tag.trim());

//         if (!req.files || !req.files.preAudio || !req.files.song) {
//             return res.status(400).send('Both pre-audio and song files are required.');
//         }

//         try {
//             const newSong = new Song({
//                 songName,
//                 tags: tagsArray,
//                 preAudio: req.files.preAudio[0].buffer,
//                 preAudioType: req.files.preAudio[0].mimetype,
//                 audio: req.files.song[0].buffer,
//                 audioType: req.files.song[0].mimetype,
//             });

//             await newSong.save();
//             res.redirect('/');
//         } catch (err) {
//             console.error('Error saving song:', err);
//             res.status(500).send('Error saving song.');
//         }
//     }
// );

// // Serve song buffer as a playable file (MP3)
// app.get('/preaudio/:songName', async (req, res) => {
//     try {
//         const song = await Song.findOne({ songName: req.params.songName });
//         if (!song) {
//             return res.status(404).send('Pre-audio not found.');
//         }
//         res.set('Content-Type', song.preAudioType);
//         res.send(song.preAudio);
//     } catch (err) {
//         console.error('Error fetching pre-audio:', err);
//         res.status(500).send('Error fetching pre-audio.');
//     }
// });

// app.get('/song/:songName', async (req, res) => {
//     try {
//         const song = await Song.findOne({ songName: req.params.songName });
//         if (!song) {
//             return res.status(404).send('Song not found.');
//         }
//         res.set('Content-Type', song.audioType);
//         res.send(song.audio);
//     } catch (err) {
//         console.error('Error fetching song:', err);
//         res.status(500).send('Error fetching song.');
//     }
// });

// app.get('/tags', async (req, res) => {
//     try {
//         const tags = await Song.distinct('tags'); // Get unique tags
//         res.json(tags);
//     } catch (err) {
//         console.error('Error fetching tags:', err);
//         res.status(500).send('Error fetching tags.');
//     }
// });
// app.get('/songs/:tag', async (req, res) => {
//     try {
//         const tag = req.params.tag;
//         const songs = await Song.find({ tags: tag });
//         res.json(songs);
//     } catch (err) {
//         console.error('Error fetching songs:', err);
//         res.status(500).send('Error fetching songs.');
//     }
// });

// Display the login page
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Update the MongoDB URI with the provided username and password
    MONGO_URI = `mongodb+srv://${username}:${password}@musicapp.3kaac.mongodb.net/?retryWrites=true&w=majority&appName=musicApp`;
    // mongodb+srv://bakichekam1997:<db_password>@musicapp.3kaac.mongodb.net/?retryWrites=true&w=majority&appName=musicApp
    // Authenticate with MongoDB using the credentials
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log('Connected to MongoDB');
            res.redirect('/'); // Redirect to the index page after successful connection
        })
        .catch((err) => {
            console.error('MongoDB connection error:', err);
            res.status(500).send('Failed to connect to MongoDB with the provided credentials.');
        });
});

app.get('/', async (req, res) => {
    if (!MONGO_URI) {
        return res.redirect('/login'); // Redirect to login if MongoDB connection is not established
    }

    try {
        const songs = await Song.find({});
        const songsByTags = {};

        songs.forEach(song => {
            song.tags.forEach(tag => {
                if (!songsByTags[tag]) {
                    songsByTags[tag] = [];
                }
                songsByTags[tag].push(song);
            });
        });

        res.render('index', { songsByTags });
    } catch (err) {
        console.error('Error fetching songs:', err);
        res.status(500).send('Error fetching songs.');
    }
});

app.get('/upload', (req, res) => {
    res.render('upload');
});

// Handle song upload
app.post(
    '/upload',
    upload.fields([
        { name: 'preAudio', maxCount: 1 },
        { name: 'song', maxCount: 1 },
    ]),
    async (req, res) => {
        const { songName, songTags } = req.body;
        const tagsArray = songTags.split(',').map(tag => tag.trim());

        if (!req.files || !req.files.preAudio || !req.files.song) {
            return res.status(400).send('Both pre-audio and song files are required.');
        }

        try {
            const newSong = new Song({
                songName,
                tags: tagsArray,
                preAudio: req.files.preAudio[0].buffer,
                preAudioType: req.files.preAudio[0].mimetype,
                audio: req.files.song[0].buffer,
                audioType: req.files.song[0].mimetype,
            });

            await newSong.save();
            res.redirect('/');
        } catch (err) {
            console.error('Error saving song:', err);
            res.status(500).send('Error saving song.');
        }
    }
);

// Serve song buffer as a playable file (MP3)
app.get('/preaudio/:songName', async (req, res) => {
    try {
        const song = await Song.findOne({ songName: req.params.songName });
        if (!song) {
            return res.status(404).send('Pre-audio not found.');
        }
        res.set('Content-Type', song.preAudioType);
        res.send(song.preAudio);
    } catch (err) {
        console.error('Error fetching pre-audio:', err);
        res.status(500).send('Error fetching pre-audio.');
    }
});

app.get('/song/:songName', async (req, res) => {
    try {
        const song = await Song.findOne({ songName: req.params.songName });
        if (!song) {
            return res.status(404).send('Song not found.');
        }
        res.set('Content-Type', song.audioType);
        res.send(song.audio);
    } catch (err) {
        console.error('Error fetching song:', err);
        res.status(500).send('Error fetching song.');
    }
});

app.get('/tags', async (req, res) => {
    try {
        const tags = await Song.distinct('tags'); // Get unique tags
        res.json(tags);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).send('Error fetching tags.');
    }
});

app.get('/songs/:tag', async (req, res) => {
    try {
        const tag = req.params.tag;
        const songs = await Song.find({ tags: tag });
        res.json(songs);
    } catch (err) {
        console.error('Error fetching songs:', err);
        res.status(500).send('Error fetching songs.');
    }
});
// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
