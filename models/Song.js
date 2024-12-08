const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    songName: { type: String, required: true },
    tags: { type: [String], required: true },
    preAudio: { type: Buffer, required: true }, // Pre-audio buffer
    preAudioType: { type: String, required: true }, // MIME type
    audio: { type: Buffer, required: true }, // Main song buffer
    audioType: { type: String, required: true }, // MIME type
});

module.exports = mongoose.model('Song', songSchema);
