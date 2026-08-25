# Testing Guide: TechBazaar Open Redirect Vulnerability

This guide provides step-by-step instructions for demonstrating the Open Redirect vulnerability in the TechBazaar application. This is ideal for recording a walkthrough or demonstrating the exploit to a class.

---

## Prerequisites

Ensure both the legitimate application and the attacker server are running. 

1. **Start the legitimate app (Terminal 1):**
   ```bash
   npm start
   ```
   *(Runs on http://localhost:3000)*

2. **Start the attacker server (Terminal 2):**
   ```bash
   node attacker-server.js
   ```
   *(Runs on http://localhost:9999)*

---

## Step 1: Demonstrate the Normal, Intended Flow

First, show how the application is supposed to work under normal circumstances.

1. Open your web browser and navigate to:
   `http://localhost:3000/`
2. Click the **Login** button on the homepage.
3. Observe the URL in the address bar. It should be:
   `http://localhost:3000/login?redirect_to=/dashboard`
   *(Point out that the application uses the `redirect_to` parameter to know where to send the user after logging in.)*
4. Enter the valid credentials:
   - **Username:** `admin`
   - **Password:** `password`
5. Click **Log In**.
6. Verify that you successfully land on the Dashboard page (`http://localhost:3000/dashboard`).

---

## Step 2: Execute the Open Redirect Attack (The Exploit)

Now, demonstrate how an attacker can abuse the `redirect_to` parameter to steal credentials.

1. **Log out** by clicking the "Log out" button on the dashboard, or open a new Incognito/Private window.
2. Imagine an attacker sends a malicious link via an email (phishing). Copy and paste this exact malicious URL into your browser:
   `http://localhost:3000/login?redirect_to=http://localhost:9999/phishing_page`
3. Hit Enter. You will land on the legitimate TechBazaar login page on `localhost:3000`. 
   *(Point out to your audience that the page is genuine, the SSL certificate (if it existed) would be valid, and the user has no reason to be suspicious yet.)*
4. Enter the credentials again:
   - **Username:** `admin`
   - **Password:** `password`
5. Click **Log In**.
6. **The Exploit:** Notice that instead of going to the dashboard, the application immediately redirects you to the attacker's server! You should see a large red banner reading **"ATTACKER SERVER — CREDENTIALS STOLEN"**. 
7. Check the URL bar; it now reads `http://localhost:9999/phishing_page`.
   *(Explain that the attacker now has the user's valid credentials because the user submitted them to a fake page, or a fake page was able to capture the session because of the redirect.)*

---

## Step 3: Demonstrate the Fix (Safe Route)

Finally, show how the vulnerability was patched in the code.

1. Open the project code in your editor.
2. Open the file `views/login.html`.
3. Change the form action on line 17 from `/login` to the patched route `/login-safe`:
   ```html
   <!-- Change this: -->
   <form action="/login" method="POST">
   
   <!-- To this: -->
   <form action="/login-safe" method="POST">
   ```
4. Save the file.
5. Go back to your browser and try the exact same malicious link from Step 2:
   `http://localhost:3000/login?redirect_to=http://localhost:9999/phishing_page`
6. Enter the credentials (`admin` / `password`) and click **Log In**.
7. **The Fix:** Notice that this time, you safely land on the `http://localhost:3000/dashboard` page. The application detected that `http://localhost:9999/phishing_page` was an external URL and safely ignored it.

---

## Technical Explanation (For Your Video)

In `app.js`, the vulnerable route simply takes the `redirect_to` parameter and passes it directly into the `res.redirect()` function without checking if it's safe:

```javascript
// app.js (Line 42)
const targetUrl = redirect_to || '/dashboard';
// VULNERABLE: redirect_to is used without validation (Open Redirect)
res.redirect(targetUrl);
```

The fixed route (`/login-safe`) validates the parameter by ensuring it starts with a `/` and does not contain `http://`, `https://`, or `//` (which could indicate a protocol-relative external URL). If it's malicious, it defaults back to the safe `/dashboard`.
