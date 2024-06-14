# Polkassembly - https://polkassembly.io <img width="750" alt="web3 foundation_grants_badge_black" src="https://user-images.githubusercontent.com/874046/119712025-cb8ae900-be7d-11eb-9ca7-cac14991bb5e.png">

The place to discuss and vote on Kusama and Polkadot governance.

Polkassembly is a platform for anyone to discover and participate in Polkadot and Kusama governance. You can browse proposals made on chain, discuss with the community and vote directly from the website using a browser extension. Proposal authors are the only one able to edit the proposal post and description. You don't have to, but adding an email may help to recover your account, also you can get notifications for discussions of interest or when a new proposal appears on-chain.


---

This repo hosts 
- next.js app: the next js fullstack app.



## Getting Started

### Install Node.js

Install [Node.js](https://nodejs.org). Optionally using [NVM](https://github.com/nvm-sh/nvm)
```bash
nvm install
nvm use
```

Install Yarn.
```bash
npm install -g yarn
```

### Install OS-specific dependencies

#### macOS

```bash
brew install pkg-config pango jq redis
```

### Install dependencies

Install dependencies.
```bash
npm install
# or
yarn
```

### Setup default Environment Variables

Set environment variables:
```bash
cp .env.example .env
```

### Setup Polkassembly Account for use on a Rococo Testnet

Instead of changing the value of `JWT_PUBLIC_KEY` in the .env file.
For development we will use the Rococo Testnet.

#### Setup Wallet for use in Polkassembly and on Rococo Testnet

* [Create a Polkadot account](https://support.polkadot.network/support/solutions/articles/65000098878-how-to-create-a-dot-account)

##### Setup Polkadot.js Extension

* Go to https://polkadot.js.org/extension/ and install the Polkadot.js Extension
* Configure the extension settings to be available in browser "private" mode
* Create a new account and securely and privately backup the mnemonic seed phrase and encrypted wallet JSON file or import an existing account from an encrypted wallet JSON file or mnemonic seed phrase
* Go to Polkadot.js Settings > Manage Website Access, search for localhost:3000, and toggle the switch to be "enabled"

#### Authorization for use on Rococo Testnet

* Obtain production credentials by logging in using a production email and password at the production website https://polkadot.polkassembly.io/opengov, and ensure that those credentials are already "linked" to the Polkadot account that you setup earlier and imported into your Polkadot.js Extension. 
* Go into local storage under host https://polkadot.polkassembly.io and copy the key/value pairs for the following keys:
  * "Authorization"
  * "persist:polkassembly"
* Run the local server and go to http://localhost:3000
* Go to local storage under host http://localhost:3000 and add the same keys and associated values mentioned above, and then refresh the page.
* Check that it works by going to http://localhost:3000/big-spender?trackStatus=all&page=1, and click "Create Proposal" and a modal should appear without error, then click the Polkadot.js icon and select the account that is linked to your production email and password. It should show a green icon "Linked", and once selected it should show your balance of ROC testnet tokens.

#### Tokens for use on Rococo Testnet

* Obtain ROC testnet tokens from the faucet at https://faucet.polkadot.io/ for the Substrate-based account.

### Change to Rococo Testnet

* Change to "rococo" (or "paseo" in future) for environment variable `NEXT_PUBLIC_DEFAULT_NETWORK="rococo"` in .env file.

### Setup Redis

* Go to https://redis.io/docs/install/install-redis and follow relevant instructions to install Redis and run it (e.g. start Redis server with `redis-server` in new terminal tab and stop it with CTRL-C).

### Setup Firebase

* Setup [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) by going to https://console.firebase.google.com
* Create a project with a name (e.g. <YOUR_PROJECT_NAME>) and registering your app.
* Follow these steps to [initialize the SDK in a non-Google environment](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments) by going to "Project Settings" > "Service Accounts" > "Firebase Admin SDK" and clicking "Generate new private key" and downloading the JSON file and storing it privately and securely.
* Convert the JSON file contents into a single line and output it to another file named credential-one-liner.json:
```bash
jq -c . <YOUR_PROJECT_NAME>-firebase-adminsdk-xxx-xxx.json > credential-one-liner.json
```
* Copy and paste the credential-one-liner.json contents as the value of `GOOGLE_APPLICATION_CREDENTIALS` environment variable in the .env file.
* Enable Google Cloud Firestore API by going to https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=<YOUR_PROJECT_NAME> and clicking "Enable" button.
* Create Firebase Database by going to https://console.firebase.google.com/u/0/project/<YOUR_PROJECT_NAME>/firestore, choosing your region then clicking "Next", and choosing "test mode" and clicking "Create". Otherwise you will get error `Error in storeApiKeyUsage : Error: 5 NOT_FOUND:`.
* Create an "Index" for "posts" collection queries in Firebase Cloud Firestore by going to https://console.firebase.google.com/v1/r/project/<YOUR_PROJECT_NAME>/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9wb2xrYXNzZW1ibHktZGV2L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9wb3N0cy9pbmRleGVzL18QARoNCglpc0RlbGV0ZWQQARoOCgpjcmVhdGVkX2F0EAIaDAoIX19uYW1lX18QAg and click "Save" and wait for the status to change from "Building..." to "Enabled". This will add Fields:`isDeleted`, `created_at`, `__name__`, with respective Order `Ascending` `Descending`, `Descending`. Otherwise you will get a UI error.

Note: Beware of your usage and billing at https://console.firebase.google.com/u/0/project/<YOUR_PROJECT_NAME>/usage. If necessary, [delete unnecessary Cloud Firestore data from your collection](https://firebase.google.com/docs/firestore/using-console#delete_data).

### Setup Algolia Search

* Sign up to https://www.algolia.com
* Rename default "My First Application" at https://dashboard.algolia.com/account/applications to your custom project name <YOUR_PROJECT_NAME>.
* Obtain API Key for your application from https://dashboard.algolia.com/account/api-keys/all
* Choose application name <YOUR_PROJECT_NAME>.
* Copy "Application ID" and paste as the value `NEXT_PUBLIC_ALGOLIA_APP_ID` environment variable in .env file.
* Copy "Search-Only API Key" and paste as the value of `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` environment variable in .env file.

* Create multiple Indices for the application by going to https://dashboard.algolia.com/apps/<YOUR_APPLICATION_ID>/indices and clicking "Create Index" multiple times to create each of the following indices:
  * "polkassembly_users"
  * "polkassembly_addresses"
  * "polkassembly_posts"

### Setup TinyMCE

* Sign up to https://www.tiny.cloud
* Obtain API Key from https://www.tiny.cloud/my-account/integrate/#react
* Paste API Key as value of `NEXT_PUBLIC_TINY_MCE_API_KEY` environment variable in .env file.

### Setup Giphy

* Sign up to Giphy Developers at https://developers.giphy.com/
* Create App at https://developers.giphy.com/dashboard/
* Obtain API Key
* Paste API Key as value of `NEXT_PUBLIC_GIPHY_API_KEY` environment variable in .env file.

### Run Server

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
