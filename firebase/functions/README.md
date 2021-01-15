# Functions

## Config

When deploying and running locally you need to configure the functions.

1. Copy each `.example` file and remove the `.example` suffix.
2. Populate each file. If you do not use something (eg. Discord) leave the fields blank.
3. Run `npm run load-config` to load it into Firebase.

When running functions locally you must have a `credentials.json` file in the root. This is a service account key you can get from the Firebase console.

## Emulating locally

You can test functions locally by using the Firebase emulator. Note it depends on Java (Ubuntu: `sudo apt install default-jre`).

1. `npm run load-local-config`
2. `npm run serve`

Then run the web app using `npm run start:emulator` which connects to the local webserver

## Deploying

Ensure you have configured as above.

1. Run `npm run deploy`
