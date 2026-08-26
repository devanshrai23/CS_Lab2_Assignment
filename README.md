# TechBazaar Open Redirect Demo

**Project Title:** TechBazaar Open Redirect Vulnerability Demo
**Group ID:** [Your Group ID Here]

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the main application (TechBazaar):**
   ```bash
   npm start
   ```
   *The main app will run on http://localhost:3000*

3. **Start the attacker server:**
   Open a second terminal window in the same directory and run:
   ```bash
   node attacker-server.js
   ```
   *The attacker server will run on http://localhost:9999*

## How to Test the Normal Flow

1. Go to the legitimate TechBazaar homepage: `http://localhost:3000/`
2. Click on the **Login** button. Notice the URL is `http://localhost:3000/login?redirect_to=/dashboard`
3. Enter the valid credentials:
   - Username: `admin`
   - Password: `password`
4. Click **Log In**. You should be successfully redirected to the dashboard page (`/dashboard`).

## How to Test the Exploit

1. Imagine an attacker sends the following malicious link to a victim:
   ```
   http://localhost:3000/login?redirect_to=http://localhost:9999/phishing_page
   ```
2. The victim clicks the link and is taken to the legitimate TechBazaar login page on `localhost:3000`. It looks perfectly safe.
3. The victim enters their credentials (`admin` / `password`) and submits the form.
4. Because the application blindly trusts the `redirect_to` parameter, the server issues a redirect to `http://localhost:9999/phishing_page`.
5. The victim lands on the attacker's server, which visually mimics the legitimate site but displays a red banner indicating the credentials have been stolen.

## How to Test the Fixed Route

1. The application also includes a safe login route at `/login-safe`.
2. To test it, modify `views/login.html` and change `<form action="/login" method="POST">` to `<form action="/login-safe" method="POST">`.
3. Try the exploit URL again:
   ```
   http://localhost:3000/login?redirect_to=http://localhost:9999/phishing_page
   ```
4. Enter the credentials. You will notice that the application validates the redirect URL, detects that it is not a safe relative path, and safely falls back to `/dashboard`.

## Video Demonstration

[Watch the Demonstration Video](https://drive.google.com/file/d/1X8TtVJAEfvX6ienManPCXE2W6ercon-x/view?usp=drive_link)
