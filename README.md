# sideos-login
Getting rid of passwords and learn how to do a Passwordless Login with the sideos Wallet. It is using the new SSI Technology to store credentials on a phone for login to a web service. SSI stands for Self-Sovereign-Identity and is all about decentralized data in a web3 world. The example is using [sideos](https://sideos.io) for a simple start with SSI. 

The idea behind is to have a credential with some data, e.g. a name or an email address which is signed by the issuer. Because the credential is signed by the issuer and you probably trust the issuer, you can just check the signature of the credential to let someone login. Plus: you can trust all the information provided by the credential because the issuer signed it. As a result, you get passwordless login, one-click onboarding, or no need to store persistantly any data at all (because you get it again with the next login).

# Installation
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
The variables ACCESS_TOKEN, SSI_SERVER, LOGIN_TEMPLATE_ID, and DID_ISSUER are set based on information from the sideos account. 

The CALLBACK_URL variable is the url of the service and is shown once you start the server, e.g. `Server started at http://pi3p:9000`.

## Get an sideos Account
Go to [sideos onboarding](https://juno.sideos.io/plan-onboarding/1) and: 
1. download the sideos app
2. create an account at the console by following the instructions

## Create Login Credentials
Create verifiable credentials which are stored on the users phone and can be verified securely:
1. In Proofs, add a new proof. Give it a Name, create a new Type, e.g. `email`, and a Context, which is in the case of a simple string `DataFeedItem`.
2. In Credentials, create a new template. Create a new Credential type, e.g. `User` and give it a Name. Chose the proof which is the one we just created. 
3. Note down the ID of the template we just created. This number goes into the `.env` file mentioned above as LOGIN_TEMPLATE_ID variable. 
4. In Settings, go to Company Settings and set the Token which goes into the `.env` file mentioned above as ACCESS_TOKEN variable. The value for the DID_ISSUER comes from the Company DID. 

Put the variables up in the `.env` file and: That's it. 

## Get the Verifiable Credentials
The credentials can be created by an API call and send in different ways to the user. The easiest way is just to click the button `Test credentials` in the details of a template. It creates a credential which you can store on the phone and for the login later. 
