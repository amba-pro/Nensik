# Cursor: download, verify and launch

Paste this prompt into Cursor Agent:

```text
Download and run the existing Nensik game. The implementation is already on GitHub; do not rebuild it from scratch.

Repository: https://github.com/amba-pro/Nensik.git
Branch: main

1. Inspect the current workspace and OS. If it is not this repository, clone it into a new Nensik folder inside a suitable user project directory. Do not touch unrelated projects. If a checkout already exists, inspect its origin, branch and working tree; preserve local edits and use a separate checkout if necessary. Update a clean main with git pull --ff-only.
2. Read README.md and package.json. Use Node.js 20 or newer. There are no third-party dependencies; npm install is unnecessary. If Node is missing, install a supported LTS version using the platform's normal package manager if available.
3. Run npm run check and npm test; fix actual failures if any.
4. Start npm start in a persistent terminal. If 5173 is occupied, do not stop another service: use npm start -- --port 5174 (or the next free port). Open the exact resulting localhost URL in the browser. Do not use file://.
5. Finish the visual acceptance that could not run in the original environment. Inspect desktop and a 390 x 844 mobile viewport. Verify assets/cat-run.png and assets/cat-duck.png load, the cat is visible with its original brown tabby coat and stocky proportions, and no adjacent atlas frame leaks into the animation. Verify three lanes, left/right movement, jumping over barriers, ducking under signs, trains and side collisions, coin collection, pause/resume, loss/retry, persistent best distance, swipe and touch buttons. Check console errors and page overflow. Fix only demonstrated defects, retaining the visual direction and cat identity.
6. Leave the server running and the game open. Report the local folder, branch and commit, test results, and exact URL. Tell me clearly if browser verification could not be completed. Do not publish or change network exposure.

Act directly; I need a running game, not another implementation plan.
```
