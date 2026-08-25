const express = require('express');
const path = require('path');

const app = express();
const PORT = 9999;

// Serve the phishing page for any request
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'phishing_page.html'));
});

app.listen(PORT, () => {
    console.log(`Attacker server listening on http://localhost:${PORT}`);
});
