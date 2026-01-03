# Quick Setup Guide

Since you mentioned you don't know coding, here are the **exact commands** you need to run in your terminal to get the site live on your local machine.

## Step-by-Step Instructions

### Step 1: Open Terminal

1. Press `Windows Key + R` to open the Run dialog
2. Type `powershell` and press Enter
3. Navigate to your project folder by typing:
   ```powershell
   cd C:\Users\comez\Desktop\error-project
   ```

### Step 2: Install Node.js (If Not Already Installed)

If you see an error saying "node is not recognized", you need to install Node.js first:

1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Run the installer and follow the instructions
4. **Restart your terminal** after installation
5. Verify installation by running:
   ```powershell
   node --version
   ```
   You should see a version number like `v20.x.x`

### Step 3: Install Project Dependencies

In your terminal (still in the `error-project` folder), run:

```powershell
npm install
```

**What this does:** Downloads and installs all the code libraries needed for the project.

**How long it takes:** Usually 1-3 minutes. You'll see a lot of text scrolling - this is normal!

**When it's done:** You'll see something like "added 500 packages" and your cursor will return.

### Step 4: Start the Development Server

Once installation is complete, run:

```powershell
npm run dev
```

**What this does:** Starts a local web server on your computer.

**What you'll see:** You should see output like:
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Step 5: Open the Website

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. In the address bar, type:
   ```
   http://localhost:3000
   ```
3. Press Enter

**You should now see your Error Code Reference website!**

## Important Notes

- **Keep the terminal open** while the site is running. If you close it, the site will stop working.
- To stop the server, press `Ctrl + C` in the terminal
- To start it again, just run `npm run dev` again
- The site only works on your computer while the server is running

## Troubleshooting

### "npm is not recognized"
- You need to install Node.js (see Step 2 above)
- Make sure to restart your terminal after installing Node.js

### "Port 3000 is already in use"
- Another program is using port 3000
- Next.js will automatically try port 3001, 3002, etc.
- Check the terminal output for the actual port number
- Use that port number in your browser instead

### "Cannot find module" errors
- Try deleting `node_modules` folder and `package-lock.json` file
- Then run `npm install` again

### The page shows errors
- Make sure you completed Step 3 (`npm install`)
- Check the terminal for error messages
- Try stopping the server (Ctrl+C) and starting it again (`npm run dev`)

## Next Steps

Once your site is running:
- Visit `http://localhost:3000` to see the homepage
- Visit `http://localhost:3000/errors` to see all error codes
- Visit `http://localhost:3000/errors/http/404` to see an example error page

## Summary of Commands

Here are the commands in order (copy and paste each one):

```powershell
cd C:\Users\comez\Desktop\error-project
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

That's it! You're all set! 🎉


