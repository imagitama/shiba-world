# Functions

## Config

When deploying and running locally you need to configure the functions.

1. Copy each `.example` file and remove the `.example` suffix.
2. Populate each file. If you do not use something (eg. Discord) leave the fields blank.
3. Run `npm run load-config` to load it into Firebase.

When running functions locally you must have a `credentials.json` file in the root. This is a service account key you can get from the Firebase console.

## IAM

For the `optimizeImage` function to work you must grant a "sign" permission.

1. Go to IAM: https://console.cloud.google.com/iam-admin/iam?project=PROJECT_NAME
2. Go to "App Engine default service account" and edit
3. Add "Service Account Token Creator" and click Save

## Deploying

Ensure you have configured as above.

1. Run `npm run deploy`
