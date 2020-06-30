# Shiba World

An asset repository for the different species of VRChat.

React front-end using Material UI component library. Google Firebase backend (database, storage and functions). Algolia search index (pushed to via Google function).

This is a [Twelve-Factor App](https://12factor.net/):

1. codebase - one (GitHub) with many deploys (using Netlify)
2. dependencies - explicitly declared in NPM package.json
3. config - stored in .env files in the environment
4. backing services - Google Firebase and Algolia are considered part of the app
5. build, release, run - Netlify builds, releases then runs
6. processes - not applied
7. port binding - not applied
8. concurrency - Netlify serves up infinite number of sites and Google Firebase functions are spun up on demand
9. disposability - Google Firebase functions are spun up and tore down as needed
10. dev/prod parity - only one environment - prod
11. logs - streamed via Google Firebase and Netlify
12. admin processes - Google Firebase functions per admin process

## Starting up - front-end

Tested in Ubuntu 20 (WSL) only. Docker coming soon.

    cd reactapp
    npm i
    cp .env.example .env
    npm start

## Back-end

### Functions

Functions are just tiny Node.js functions that are called when specific Firestore events are triggered (eg. document is updated).

**Note:** To talk to external services (eg. Algolia) you must have a Blaze paid account.

    cd firebase/functions
    npm i
    firebase login
    cp .algoliaconfig.json.example .algoliaconfig.json
    npm run deploy

### Backup

Backups can be manually done.

First generate credentials:

1. Go to Firebase Console
2. Go to project
3. Go to Project Settings / Service Accounts
4. Click Generate New Private Key
5. Paste credentials.json into root of firebase/backup

Then run:

    cd firebase/backup
    npm i
    npm run backup

To backup just db:

    npm run backup:db

Or auth (users):

    npm run backup:users
