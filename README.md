# Passwordless Login using sideos
This repo is about getting rid of passwords and learn how to do a Passwordless Login with the sideos Wallet. It is using the new SSI Technology to store credentials on a phone for login to a web service. SSI stands for Self-Sovereign-Identity and is all about decentralized data in a web3 world. The example is using [sideos](https://sideos.io) for an easy start with SSI. 

The idea behind is to have a credential with some data, e.g. a name or an email address which is signed by some trustworty issuer. Because the credential is signed and you probably trust the issuer, you can just check the signature of the credential to let someone login. Plus: you can trust all the additional information provided by the credential because the issuer signed it. As a result, you get passwordless login, one-click onboarding, or no need to store persistantly any data at all (because you get it again with the next login). SSI is such a cool concept.

# Installation
The code is [typescript](https://www.typescriptlang.org/) so you need [node.js](https://nodejs.org/en/) installed on the Raspberry Pi. As a package manager we recommend [yarn](https://yarnpkg.com/). Also, we are using [Redis](https://redis.io/) as session store. Because of the decentralized nature of SSI we don't need a database to store user data. The credential used for the login also includes the data we need for our purpose. 

## Install the Code
Getting the repository:
`git clone git@github.com:rheikvaneyck/sideos-login.git`

Change to the new folder and install the npm packages:
```
cd sideos-login
yarn install
touch .env 
```

Edit the `.env` file to add the environment variables (we will set the values later)
```
ACCESS_TOKEN=<API token>
SSI_SERVER='https://juno.sideos.io'
LOGIN_TEMPLATE_ID=<template id>
CALLBACK_URL=<server url>
DID_ISSUER=<did>
```
The values for the variables ACCESS_TOKEN, SSI_SERVER, LOGIN_TEMPLATE_ID, and DID_ISSUER are set based on information from the sideos account as describefd below. 

The CALLBACK_URL variable is poiting to the url of the service and is shown once you've started the server, e.g. as `Server started at http://pi3p:9000`.

## Get an sideos Account
Go to [sideos onboarding](https://juno.sideos.io/plan-onboarding/1) and: 
1. download the sideos app
2. create an account at the console by following the instructions

## Create Login Credentials
For SSI login you need to create verifiable credentials which will be stored on the users phone. sideos is providing a template system which allows admins to create credentials for any possible use case. Templates are based of Credential Data Sets which combine one ore more Proofs. :
1. In _Proofs_, add a new proof. Give it a Name, create a new Type, e.g. 'email', and a Context, which is in the case of a simple string 'DataFeedItem'.
2. In _Credentials_, create a new template. Create a new _Credential type_, e.g. 'User' and give it a Name. Chose the proof which is the one we just created. 
3. Note down the _ID_ of the template we just created. This number goes into the `.env` file mentioned above as LOGIN_TEMPLATE_ID variable. 
4. In _Settings_, go to _Company Settings_ and set the _Token_ which goes into the `.env` file mentioned above as ACCESS_TOKEN variable. The value for the DID_ISSUER comes from the _Company DID_. 

Put the variables up in the `.env` file.

## Get the Verifiable Credentials
The credentials can be created by an API call and send in different ways to the user. The easiest way is just to click the button 'Test credentials' in the details of a template. It creates a credential which you can store on the phone and for the login later. For the SSI credential part: That's it. 

## Install and run Redis
The session data is stored in [Redis](https://redis.io/). For development purposes we don't secure redis and assume it is only running locally, so we don't care about exposing sensitive data to evil part of the world. Have a look at the Redis documentation to secure your configuration. To install Redis on a Raspberry Pi do:
```
sudo apt update
sudo apt get install redis
sudo systemctl start redis
```

# Run it
Start the dev service:
`yarn start:dev`

Open the server url shown in the console in your browser, in our case `http://pi3p:9000`:
```
pi@pi3p:~/sideos-login $ yarn start:dev
yarn run v1.22.19
$ nodemon src/index.ts
[nodemon] 2.0.20
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/**/*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node ./src/index.ts src/index.ts`
Server started at http://pi3p:9000
Redis Client connected...
Redis Client ready
``` 
