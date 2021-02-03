# Firebase

Our database and backend for the site.

## Getting started

You need to the Firebase CLI. Tested only in Ubuntu for Windows:

1. Install: https://firebase.google.com/docs/cli
2. Login: `firebase login`
3. Setup: `firebase init`

## Firestore

We use Firestore as our database.

### Indexes

The views in the web app depend on indexes in Firestore. They exist in the file `firestore.indexes.json`.

### Rules

Accessing Firestore is protected by security rules. They exist in the file `firestore.rules`.

### Emulating

You can emulate it locally - see `functions/README.md`.

## Functions

We use Functions to perform side-effects on our database, user actions (eg. on sign-up a user is created in the database) and we call them directly (eg. `optimizeImage`). You can emulate them locally - see `functions/README.md`.
