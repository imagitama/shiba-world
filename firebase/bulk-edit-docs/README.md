# Bulk Edit Docs

Bulk edit/update Firebase documents.

## Usage

**Do a backup first!**

Generate a new key from Firebase -> Service Accounts and place in root dir as "key.json"

    npm i
    npm start -- --collectionName=assets --fieldName=title --newValue="Hello world!" --fieldType=string
