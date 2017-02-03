Readerplus Portal
==============

Web Interface for Reader+. Will only have provisioning portal at this time.

## Steps to run the portal

- Start the GLS API following the steps found here: ``https://github.com/PearsonTech/gloss.api/blob/master/README.md``
- Clone the Portal repo
- Make sure Bower and Gulp are installed
````
npm install gulp -g
npm install bower -g
````
- In a terminal window, cd into web portal and run ```npm install```
- Run the portal ```npm start```

We will be containerizing this soon so you won't have to configure all this to run the app.

## E2E Testing

- Make sure Bower and Gulp are installed
````
npm install nightwatch -g
````

Make sure GLS is runnig locally

In the terminal

    $ gulp test


To run individual suite (example)

    NODE_ENV=test nodemon
    nightwatch -c test/e2e/config/nightwatch.json -t test/e2e/school.user.list.js


## Build

Run ```gulp build```
This will create a dist folder with all the assests