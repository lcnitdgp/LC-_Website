# The Literary Circle - Website Project 📚

Welcome to the official repository for **The Literary Circle Website**! If you are a new inductee of the WebD Domain, **WELCOME TO THE TECH TEAM!** This document is written specifically for you to help you get started from scratch.

Even if you have never coded before or used Git, follow this guide step-by-step, and you will be up and running in no time.

---

## 🚫 1. DO NOT TOUCH (Danger Zone)

These files are critical for the project to run. **Modifying them directly can break the entire website.**

| File/Folder | What it does | Risk if changed | How to safely change |
|-------------|--------------|-----------------|----------------------|
| `package-lock.json` | Locks exact versions of installations. | **HIGH**: The app might crash or behave differently for everyone. | Never edit manually. Run `npm install` to update it. |
| `node_modules/` | Contains thousands of downloaded code packages. | **HIGH**: Your app will stop working instantly. | Never edit manually. Delete usage with `npm uninstall <package>`. |
| `dist/` | The final built website for production. | **LOW**: Your changes will just be overwritten next build. | Do not edit. This is auto-generated. |
| `.git/` | Stores version history. | **EXTREME**: You could lose all project history. | Never touch this hidden folder. |
| `.github/` | Controls **Automated Deployment**. | **HIGH**: You could break the website update process. | Only Tech Heads should modify the workflows here. |

---

## 🛠️ 2. How to Setup the Project (Step-by-Step for Beginners)

Follow these steps exactly. If you get stuck, ask a senior!

### Step 1: Install Required Tools
1.  **Operating System**: Works on **Windows**, **Mac**, or **Linux**. No special setup needed!
2.  **Install VS Code**: This is the editor we use. [Download here](https://code.visualstudio.com/).
3.  **Install Node.js**: This runs our Javascript code. Download the "LTS" version. [Download here](https://nodejs.org/).
4.  **Install Git**: This tracks our code changes. [Download here](https://git-scm.com/downloads). *During installation on Windows, choose "Git Bash" if asked.*

### Step 2: Configure Git (First Time Only)
Open your terminal (or command prompt) and type these commands (replace with your info):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Clone the Repository
"Cloning" means downloading the project to your computer.
1.  Open VS Code.
2.  Open the Terminal (`Ctrl + ~` or `Cmd + ~`).
3.  Navigate to where you want the folder (e.g., Desktop):
    ```bash
    cd Desktop
    ```
4.  Run the clone command (get the URL from the GitHub "Code" button):
    ```bash
    git clone https://github.com/your-org/lc-website.git
    ```
5.  Go into the folder:
    ```bash
    cd lc-website
    ```

### Step 4: Install Dependencies
This downloads all the external code libraries we use (like React, Tailwind).
```bash
npm install
```
*Wait for it to finish. You might see a new `node_modules` folder appear.*

### Step 5: Run the Project Locally
This starts a "local server" so you can see the website on your computer.
```bash
npm run dev
```
You will see a link like `http://localhost:5173`. **Ctrl+Click** (or Cmd+Click) it to open the site in your browser.

---

## 💻 3. Tech Stack & Learning Roadmap

Here is the stack our website is built upen. You need to get familiar with it first. 

### The Stack
*   **React**: A library for building user interfaces.
*   **TypeScript**: JavaScript with "types" (prevents bugs).
*   **Tailwind CSS**: A utility-first CSS framework for styling.
*   **Vite**: The build tool (makes our site run fast).

### 🗺️ Learning Roadmap (For Absolute Beginners)

**Phase 1: The Basics**
*   **HTML/CSS**: Structure and Style.
    *   [HTML Crash Course](https://www.youtube.com/watch?v=qz0aGYrrlhU)
    *   [CSS Crash Course](https://www.youtube.com/watch?v=yfoY53QXEnI)
*   **JavaScript**: The logic.
    *   [JavaScript for Beginners](https://www.youtube.com/watch?v=hdI2bqOjy3c)

*   **NOTE**: Just these crash courses are enough. No need to watch those 8 hour long CSS Tutorials! Watch these videos, code along and move on!

**Phase 2: The Core Tech**
*   **React**: Building components.
    *   [React Course for Beginners](https://www.youtube.com/watch?v=bMknfKXIFA8)
    *   *Mini Project*: Build a simple "To-Do List" app.
*   **Tailwind CSS**: Styling the modern way.
    *   [Tailwind CSS Crash Course](https://www.youtube.com/watch?v=UBOj6rqRAME)
    *   *Mini Project*: Recreate a simple landing page (like Google's homepage).

*   **NOTE**: For building the mini-projects, use the Tech Stack mentioned! This is a must!

**Phase 3: Level Up**
*   **TypeScript**: Safer JavaScript.
    *   [TypeScript for Beginners](https://www.youtube.com/watch?v=d56mG7DezGs)

*   **NOTE**: This is enough. Now you are good enough to add your first feature.

---

## 📂 4. Codebase Structure

Understanding where files live is 90% of the work.

```
/
├── public/              # Static files (images, logos)
│   ├── images/          # Team photos, backgrounds
│   └── logo16.png       # Website favicon
├── src/                 # source code - YOU WORK HERE 99% OF THE TIME
│   ├── components/      # Reusable UI parts
│   │   ├── layout/      # Header, Footer
│   │   └── sections/    # Big page sections (Hero, About, Team)
│   ├── data/            # Data files (easy to edit!)
│   │   ├── siteConfig.ts  # Links, contact info, text
│   │   └── teamMembers.ts # ✨ ADD NEW MEMBERS HERE ✨
│   ├── types/           # TS definitions (types)
│   ├── App.tsx          # Main Page assembly
│   ├── main.tsx         # Entry point (connects React to HTML)
│   └── index.css        # Global styles & Tailwind config
├── index.html           # Main HTML file
└── package.json         # Project settings
```

### Where do I make changes?
*   **Adding a Team Member?** → Go to `src/data/teamMembers.ts`. Just copy an existing block and change the details.
*   **Changing Contact Info?** → Go to `src/data/siteConfig.ts`.
*   **Editing the Navbar?** → `src/components/layout/Header.tsx`.
*   **Changing Styles?** → Most styles are inside the components themselves using Tailwind classes (e.g., `className="text-red-500"`).

---

## 📝 5. Commit & Contribution Rules

**Rules to live by:**
1.  **NEVER push directly to `master`**. The `master` branch is production. If you break it, the site breaks.
2.  **Always create a new branch** for your work.
3.  **Test locally** before saving.

### Workflow: How to contribute correctly

**1. Get the latest code**
Before starting, make sure you have the latest code from everyone else.
```bash
git checkout main
git pull origin main
```

**2. Create a new branch**
Name it descriptively (e.g., `add-new-member`, `fix-navbar-bug`).
```bash
git checkout -b add-naivedyam-bio
```

**3. Make your changes**
Edit the files in VS Code. Save them.

**4. Commit your changes**
"Staging" and "Committing" saves a snapshot of your work.
```bash
git add .
git commit -m "Added Naivedyam's bio and photo"
```
*Note: Write a clear message. "Fixed stuff" is a bad message.*

**5. Push to GitHub**
Send your branch to the cloud.
```bash
git push origin add-naivedyam-bio
```

**6. Make a Pull Request (PR)**
*   Go to the GitHub repository page.
*   You will see a "Compare & pull request" button. Click it.
*   Write a description of what you did.
*   Ask a senior to review it.
*   Once approved, merge it!

---
*Maintained by The Literary Circle*
