const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to render login page with optional error and redirect_to value
function renderLogin(res, error = '', redirectTo = '') {
    let html = fs.readFileSync(path.join(__dirname, 'views', 'login.html'), 'utf8');
    
    if (error) {
        html = html.replace('{{#if error}}', '').replace('{{/if}}', '').replace('{{error}}', error);
    } else {
        html = html.replace(/\{\{#if error\}\}[\s\S]*?\{\{\/if\}\}/, '');
    }
    
    html = html.replace('{{redirectTo}}', redirectTo);
    res.send(html);
}

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// --- VULNERABLE ROUTE ---

// Render login page
app.get('/login', (req, res) => {
    const redirectTo = req.query.redirect_to || '';
    renderLogin(res, '', redirectTo);
});

// Handle login submission (Vulnerable)
app.post('/login', (req, res) => {
    const { username, password, redirect_to } = req.body;

    if (username === 'admin' && password === 'password') {
        const targetUrl = redirect_to || '/dashboard';
        // VULNERABLE: redirect_to is used without validation (Open Redirect)
        res.redirect(targetUrl);
    } else {
        renderLogin(res, 'Invalid credentials', redirect_to);
    }
});


// --- FIXED ROUTE ---

// Handle login submission (Safe)
app.post('/login-safe', (req, res) => {
    const { username, password, redirect_to } = req.body;

    if (username === 'admin' && password === 'password') {
        let targetUrl = '/dashboard';
        
        // FIXED: redirect_to is validated as a safe relative path
        if(redirect_to && redirect_to.startsWith('/') && !redirect_to.startsWith('//') && !redirect_to.includes('http://') && !redirect_to.includes('https://')) {
            targetUrl = redirect_to;
        }

        res.redirect(targetUrl);
    } else {
        renderLogin(res, 'Invalid credentials', redirect_to);
    }
});

app.listen(PORT, () => {
    console.log(`TechBazaar app listening on http://localhost:${PORT}`);
});
