# Setup

How to set up the Shiba World app for any environment.

## 1. Clone

Clone the repo from GitHub into any directory. I recommend doing this in Ubuntu (try WSL on Windows - that's what I use).

## 2. Firebase

1. Log in to Google Firebase and go to the console.
2. Create a new project. Name it whatever. Leave defaults as is.
3. Create a new web app. Name it whatever. Leave defaults as is.
4. In "Your Apps" select the web app and then under Firebase SDK Snippet select Config.
5. In the `reactapp` directory of your code copy `.env.example` to `.env` then for each item in the config paste it into each environment variable. App ID is on the same web page.
6. In `reactapp` run `npm i` to install deps.
7. In `reactapp` run `npm start` to run the website locally.

## 3. Enable Firestore

1. Go to Database in the Firebase console.
2. Click "Create" or whatever button there is. Select "test mode" which should give you full permissions for a month.
3. When running the website locally when you try to visit some pages the console might error saying indexes are missing. Manually create them as needed (to be scripted).

## 4. Enable Functions

1. Go to Functions in the Firebase console.
2. Click "Enable" or whatever button there is. Done for now.

## 5. Enable Authentication

1. Go to Authentication in the Firebase console.
2. Go to "Sign-in Method" and enable email/password (Google/Twitter might work if you want to try it). Now you can sign up in your site.

## 6. Deploy functions

1. Install the [Firebase CLI](https://firebase.google.com/docs/cli) tool. Verify it works by running `firebase` in your shell.
2. Log in to Firebase by running `firebase login`.
3. Navigate to `firebase/functions` in your shell and run `firebase use [your project name]`.
4. Copy all of the `.example` files and remove the suffix. Populate the configs with API keys etc.

NOTE: In development you probably don't want to hook up Algolia, Discord and Twitter so leave the configs empty and in your functions JS you will need to remove all of that functionality. I recommend you refactor all funcs to return resolved Promises.

5. Run `npm i` to install deps.
6. Run `npm run deploy` to deploy all of the functions to Firebase.
7. Verify it works by creating an asset on the site with tags and the tags on the homepage should be populated after 10 seconds or so.

## 7. Done!

You should now have a working version of the site running locally.

## Notes

- if you do not have Firestore set up, the SDK will still let you perform actions on the site but it won't actually do anything (refresh and it all resets)
- Sentry is not configured per environment (but it is disabled in development)
- untested on macOS/Windows - only tested in Ubuntu (Windows WSL)
- NEVER commit your config files/API keys to source control!
