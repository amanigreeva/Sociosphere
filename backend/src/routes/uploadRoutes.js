const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.array('files', 10), async (req, res) => {
    try {
        // Return local URLs
        const urls = req.files.map((file) => {
            // Construct full URL assuming standard port or relative path
            // For simplicity, we return the relative path from the server root which frontend can direct to
            // Ensure we replace backslashes with forward slashes for URLs
            return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        });

        res.status(200).json(urls);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

module.exports = router;
