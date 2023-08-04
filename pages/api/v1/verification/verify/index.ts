// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import type { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { MessageType } from '~src/auth/types';
import firebaseAdmin from '~src/services/firebaseInit';
import puppeteer from 'puppeteer';

export interface IVerifyResponse {
	status: boolean;
}

const firestore = firebaseAdmin.firestore();

const handler: NextApiHandler<IVerifyResponse | MessageType> = async (req, res) => {
	const { token, type } = req.query;
	if (!token) {
		return res.status(400).json({ message: 'Please provide a token to verify' });
	}

	const tokenVerification = await firestore.collection('email_verification_tokens').where('token', '==', token).limit(1).get();
	const data = tokenVerification.docs[0].data();

	if (tokenVerification.docs.length === 0 || !tokenVerification.docs[0].exists) {
		return res.status(400).json({ message: 'Token verification failed.' });
	}

	if (data.verified) {
		return res.status(400).json({ message: 'Token already verified.' });
	}

	if (type == 'email') {
		const tokenVerificationRef = tokenVerification.docs[0].ref;

		await tokenVerificationRef.update({
			verified: true
		});

	} else if (type == 'twitter') {
		const browser = await puppeteer.launch({ headless: false, executablePath: '/snap/bin/chromium', timeout: 600000 });
		const page = await browser.newPage();
		const url = `https://twitter.com/${data.twitter}`;

		page.on('request', request => {
			console.log(`Request made: ${request.url()}`);
		});

		await page.goto(url, { waitUntil: 'domcontentloaded' });

		await page.waitForNetworkIdle({ timeout: 100000 });

		await page.type('input[autocomplete=username]', 'hum_y_s', { delay: 100 });

		await page.evaluate(() =>
			document.querySelectorAll('div[role="button"]')[2].click()
		);
		await page.waitForNetworkIdle({ idleTime: 1500 });

		const extractedText = await page.$eval('*', (el) => el.innerText);

		if (extractedText.includes('Enter your phone number or username')) {
			await page.waitForSelector('[autocomplete=on]');
			await page.type('input[autocomplete=on]', data.twitter, { delay: 50 });
			await page.evaluate(() =>
				document.querySelectorAll('div[role="button"]')[1].click()
			);
			await page.waitForNetworkIdle({ idleTime: 1500 });
		}
		console.log('tweets2');

		await page.waitForSelector('[autocomplete="current-password"]');
		await page.type('[autocomplete="current-password"]', 'tedmosby0398', { delay: 50 });

		await page.evaluate(() =>
			document.querySelectorAll('div[role="button"]')[2].click()
		);

		await page.waitForNetworkIdle({ idleTime: 2000 });

		const tweets = await page.evaluate(() => {
			const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
			const tweetsData: any[] = [];

			tweetElements.forEach((tweetElement) => {
				const tweetTextElement = tweetElement.querySelector('div[lang] > span');
				const tweetText = tweetTextElement && tweetTextElement.innerText.trim();
				if (tweetText) {
					tweetsData.push(tweetText);
				}
			});

			return tweetsData;
		});

		await browser.close();

		console.log('tweets', tweets);

		const verifiedTweet = tweets.filter(tweet => tweet.includes(data.token));

		if (verifiedTweet.length > 0) {
			const tokenVerificationRef = tokenVerification.docs[0].ref;

			await tokenVerificationRef.update({
				verified: true
			});

			return res.json({ status: true });
		} else {
			return res.json({ status: false });
		}

	}

	return res.status(200);

};

export default withErrorHandling(handler);