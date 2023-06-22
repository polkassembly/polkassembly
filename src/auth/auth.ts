// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import * as argon2 from 'argon2';
import { randomBytes, timingSafeEqual } from 'crypto';
import { dayjs } from 'dayjs-init';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

import { networkDocRef, postsByTypeRef } from '~src/api-utils/firestore_refs';
import getPublicKey from '~src/auth/utils/getPublicKey';
import getUserIdFromJWT from '~src/auth/utils/getUserIdFromJWT';
import messages from '~src/auth/utils/messages';
import verifySignature from '~src/auth/utils/verifySignature';
import { ProposalType } from '~src/global/proposalType';
import firebaseAdmin from '~src/services/firebaseInit';
import apiErrorWithStatusCode from '~src/util/apiErrorWithStatusCode';

import { Network, Role, Wallet } from '../types';
import {
	sendResetPasswordEmail,
	sendUndoEmailChangeEmail,
	sendVerificationEmail
} from './email';
import { redisDel, redisGet, redisSetex } from './redis';
import { Address, AuthObjectType, CalendarEvent, HashedPassword, IAuthResponse, IUserPreference, JWTPayloadType, NotificationSettings, ProfileDetails, UndoEmailChangeToken, User } from './types';
import getAddressesFromUserId from './utils/getAddressesFromUserId';
import getDefaultUserAddressFromId from './utils/getDefaultUserAddressFromId';
import getMultisigAddress from './utils/getMultisigAddress';
import getUserFromUserId from './utils/getUserFromUserId';
import nameBlacklist from './utils/nameBlacklist';
import { verifyMetamaskSignature } from './utils/verifyMetamaskSignature';
import verifyUserPassword from './utils/verifyUserPassword';

process.env.JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY && process.env.JWT_PRIVATE_KEY.replace(/\\n/gm, '\n');
process.env.JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY && process.env.JWT_PUBLIC_KEY.replace(/\\n/gm, '\n');

const privateKey = process.env.NODE_ENV === 'test' ? process.env.JWT_PRIVATE_KEY_TEST : process.env.JWT_PRIVATE_KEY?.replace(/\\n/gm, '\n');
const jwtPublicKey = process.env.NODE_ENV === 'test' ? process.env.JWT_PUBLIC_KEY_TEST : process.env.JWT_PUBLIC_KEY?.replace(/\\n/gm, '\n');
const passphrase = process.env.NODE_ENV === 'test' ? process.env.JWT_KEY_PASSPHRASE_TEST : process.env.JWT_KEY_PASSPHRASE;

export const ONE_DAY = 24 * 60 * 60; // (expressed in seconds)
export const FIVE_MIN = 5 * 60; // (expressed in seconds)
export const ADDRESS_LOGIN_TTL = 5 * 60; // 5 min (expressed in seconds)
export const CREATE_POST_TTL = 60 * 60; // 1 hour (expressed in seconds)
export const NOTIFICATION_DEFAULTS : NotificationSettings = {
	new_proposal: false,
	own_proposal: true,
	post_created: true,
	post_participated: true
};

const PROFILE_DETAILS_DEFAULTS: ProfileDetails = {
	badges: [],
	bio: '',
	image: '',
	title: ''
};

const getProxiesEndpoint = (network: Network, address: string): string => {
	return `https://europe-west3-individual-node-watcher.cloudfunctions.net/proxies?network=${network}&address=${address}`;
};

export const getPwdResetTokenKey = (userId: number): string => `PRT-${userId}`;
export const getAddressLoginKey = (address: string): string => `ALN-${address}`;
export const getAddressSignupKey = (address: string): string => `ASU-${address}`;
export const getSetCredentialsKey = (address: string): string => `SCR-${address}`;
export const getEmailVerificationTokenKey = (token: string): string => `EVT-${token}`;
export const getMultisigAddressKey = (address: string): string => `MLA-${address}`;
export const getCreatePostKey = (address: string): string => `CPT-${address}`;
export const getEditPostKey = (address: string): string => `EPT-${address}`;
export const get2FAKey = (userId: number): string => `TFA-${userId}`;

class AuthService {
	public async GetUser (token: string): Promise<User | null> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);

		return getUserFromUserId(userId);
	}

	private async getLatestUserCount (): Promise<number> {
		try {
			const userCount = await firebaseAdmin.firestore().collection('users').orderBy('id', 'desc').limit(1).get();
			if (userCount.empty) return 0;

			return Number(userCount.docs[0].data().id);
		} catch (error) {
			console.log('apiErrorWithStatusCode in getLatestUserCount ', error);
			throw apiErrorWithStatusCode(messages.ERROR_CREATING_USER, 500);
		}
	}

	private async createUser (email: string, newPassword: string, username: string, web3signup: boolean, network: string): Promise<User> {
		const { password, salt } = await this.getSaltAndHashedPassword(newPassword);

		const newUserId = (await this.getLatestUserCount()) + 1;

		const userId = String(newUserId);

		const newUser: User = {
			email,
			email_verified: false,
			id: newUserId,
			password: password,
			profile: PROFILE_DETAILS_DEFAULTS,
			salt: salt,
			username: username,
			web3_signup: web3signup
		};
		const newUserRef = firebaseAdmin.firestore().collection('users').doc(userId);
		await newUserRef.set(newUser).catch(err => {
			console.log('error in createUser', err);
			throw apiErrorWithStatusCode(messages.ERROR_CREATING_USER, 500);
		});

		const newUserPreference: IUserPreference = {
			notification_preferences: NOTIFICATION_DEFAULTS,
			post_subscriptions: {},
			user_id: newUserId
		};
		const newUserPreferenceRef = networkDocRef(network).collection('user_preferences').doc(userId);
		await newUserPreferenceRef.set(newUserPreference).catch(err => {
			console.log('error in creating user preference', err);
			throw apiErrorWithStatusCode(messages.ERROR_CREATING_USER_PREFERENCE, 500);
		});

		return newUser;
	}

	private async createAddress (network: Network, address: string, defaultAddress: boolean, user_id: number, is_erc20?: boolean, wallet?:Wallet, isMultisig?:boolean): Promise<Address> {

		if(address.startsWith('0x')) {
			address = address.toLowerCase();
		}

		const newAddress: Address = {
			address,
			default: defaultAddress,
			isMultisig: isMultisig || false,
			is_erc20: is_erc20 || false,
			network,
			public_key: getPublicKey(address),
			sign_message: '',
			user_id,
			verified: true,
			wallet: wallet || ''
		};

		await firebaseAdmin.firestore().collection('addresses').doc(address).set(newAddress);

		return newAddress;
	}

	private async createAndSendEmailVerificationToken (user: User, network:string): Promise<void> {
		if (user.email) {
			const verifyToken = uuidv4();
			await redisSetex(getEmailVerificationTokenKey(verifyToken), ONE_DAY, user.email);

			// send verification email in background
			sendVerificationEmail(user, verifyToken, network);
		}
	}

	private async sendEmailVerificationToken (user: User, network:string): Promise<any> {
		if (user.email) {
			const verifyToken = uuidv4();
			await redisSetex(getEmailVerificationTokenKey(verifyToken), ONE_DAY, user.email);

			// send verification email in background
			sendVerificationEmail(user, verifyToken, network);
		}
	}

	private async getSaltAndHashedPassword (plainPassword: string): Promise<HashedPassword> {
		const salt = randomBytes(32);
		const hashedPassword = await argon2.hash(plainPassword, { salt });

		return {
			password: hashedPassword,
			salt: salt.toString('hex')
		};
	}

	public async Login (username: string, password: string): Promise<IAuthResponse> {
		const isEmail = username.split('@')[1];

		if(!isEmail){
			for (let i = 0; i < nameBlacklist.length; i++) {
				if (username.toLowerCase().includes(nameBlacklist[i])) throw apiErrorWithStatusCode(messages.USERNAME_BANNED, 401);
			}}

		let userQuery: firebaseAdmin.firestore.QuerySnapshot<firebaseAdmin.firestore.DocumentData>;
		const collection = firebaseAdmin.firestore().collection('users');

		if(isEmail) {
			userQuery = await collection.where('email', '==', username).limit(1).get();
			if (userQuery.size === 0) throw apiErrorWithStatusCode(messages.NO_USER_FOUND_WITH_EMAIL, 404);
		} else {
			userQuery = await collection.where('username', '==', username).limit(1).get();
			if (userQuery.size === 0) throw apiErrorWithStatusCode(messages.NO_USER_FOUND_WITH_USERNAME, 404);
		}

		const user = userQuery.docs[0].data() as User;

		const isCorrectPassword = await verifyUserPassword(user.password, password);
		if (!isCorrectPassword) throw apiErrorWithStatusCode(messages.INCORRECT_PASSWORD, 401);

		const isTFAEnabled = user.two_factor_auth?.enabled || false;

		if (isTFAEnabled) {
			const tfa_token = uuidv4();
			await redisSetex(get2FAKey(Number(user.id)), FIVE_MIN, tfa_token);

			return {
				isTFAEnabled,
				tfa_token,
				user_id: user.id
			};
		}

		return {
			isTFAEnabled,
			token: await this.getSignedToken(user)
		};
	}

	public async DeleteAccount (token: string, password: string): Promise<void> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);
		const user = await getUserFromUserId(userId);

		const isCorrectPassword = await verifyUserPassword(user.password, password);
		if (!isCorrectPassword) throw apiErrorWithStatusCode(messages.INCORRECT_PASSWORD, 401);

		const firestore = firebaseAdmin.firestore();

		const userAddresses = await firestore.collection('addresses').where('user_id', '==', user.id).get();
		const batch = firestore.batch();
		userAddresses.forEach(doc => {
			batch.delete(doc.ref);
		});
		await batch.commit();

		const username = `deleted-${uuidv4()}`;
		const newPassword = uuidv4();
		const hashedPassword = await this.getSaltAndHashedPassword(newPassword);

		await firestore.collection('users').doc(String(user.id)).update({
			email: '',
			email_verified: false,
			password: hashedPassword.password,
			salt: hashedPassword.salt,
			username
		});
	}

	public async SetDefaultAddress (token: string, address: string): Promise<string> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);
		const user = await getUserFromUserId(userId);

		const addresses = await getAddressesFromUserId(user.id);

		const newAddresses  = addresses.map((addressObj) => {
			if (addressObj.address === address) {
				addressObj.default = true;
			} else {
				addressObj.default = false;
			}
			return addressObj as { [x: string]: any; };
		});

		const batch = firebaseAdmin.firestore().batch();

		newAddresses.forEach((addressObj) => {
			const addressRef = firebaseAdmin.firestore().collection('addresses').doc(addressObj.address);
			batch.update(addressRef, addressObj);
		});

		await batch.commit();

		return this.getSignedToken(user);
	}

	public async AddressLoginStart (address: string): Promise<string> {

		const signMessage = address.startsWith('0x') ? `Login in polkassembly ${uuidv4()}` : `<Bytes>${uuidv4()}</Bytes>`;

		await redisSetex(getAddressLoginKey(address), ADDRESS_LOGIN_TTL, signMessage);

		return signMessage;
	}

	public async AddressLogin (address: string, signature: string, wallet: Wallet, multisigAddress?:string): Promise<IAuthResponse> {
		const signMessage = await redisGet(getAddressLoginKey(address));
		if (!signMessage) throw apiErrorWithStatusCode(messages.ADDRESS_LOGIN_SIGN_MESSAGE_EXPIRED, 401);

		const isValidSr = address.startsWith('0x') && wallet === Wallet.METAMASK ? verifyMetamaskSignature(signMessage, address, signature) : verifySignature(signMessage, address, signature);

		if (!isValidSr) throw apiErrorWithStatusCode(messages.ADDRESS_LOGIN_INVALID_SIGNATURE, 401);

		const firestore = firebaseAdmin.firestore();

		if(address.startsWith('0x')) {
			address = address.toLowerCase();
		}

		address = !multisigAddress ? address : multisigAddress;

		const addressDoc = await firestore.collection('addresses').doc(address).get();
		if (!addressDoc.exists) throw apiErrorWithStatusCode('Please sign up prior to logging in with a web3 address', 404);

		const addressObj = addressDoc.data() as Address;

		const user = await getUserFromUserId(addressObj.user_id);
		if (!user) throw apiErrorWithStatusCode(messages.ADDRESS_LOGIN_NOT_FOUND, 404);

		await redisDel(getAddressLoginKey(address));

		const isTFAEnabled = user.two_factor_auth?.enabled || false;

		if (isTFAEnabled) {
			const tfa_token = uuidv4();
			await redisSetex(get2FAKey(Number(user.id)), FIVE_MIN, tfa_token);

			return {
				isTFAEnabled,
				tfa_token,
				user_id: user.id
			};
		}

		return {
			isTFAEnabled,
			token: await this.getSignedToken(user)
		};
	}

	public async AddressSignupStart (address: string, multisigAddress?:string): Promise<string> {
		const addressDoc = await firebaseAdmin.firestore().collection('addresses').doc(!multisigAddress ? address : multisigAddress).get();
		if (addressDoc.exists) throw apiErrorWithStatusCode(messages.ADDRESS_SIGNUP_ALREADY_EXISTS, 401);

		const signMessage =  address.startsWith('0x') ? `Login in polkassembly ${uuidv4()}` :`<Bytes>${uuidv4()}</Bytes>`;

		await redisSetex(getAddressSignupKey(address), ADDRESS_LOGIN_TTL, signMessage);

		return signMessage;
	}

	public async LinkProxyAddress (token: string, network: Network, proxied: string, proxy: string, message: string, signature: string): Promise<string> {
		if (!message) throw apiErrorWithStatusCode('Sign message not provided', 400);

		const isValidSr = verifySignature(message, proxy, signature);
		if (!isValidSr) throw apiErrorWithStatusCode('Proxy address linking failed. Invalid signature', 400);

		const userId = getUserIdFromJWT(token, jwtPublicKey);

		const networkEndpoint = getProxiesEndpoint(network, proxied);

		const getProxies = await fetch(networkEndpoint, {
			headers: {
				'content-type': 'application/json'
			},
			method: 'GET'
		});

		const { proxies } = await getProxies.json() as any;

		if (!proxies || proxies.length === 0) throw apiErrorWithStatusCode(`Address ${proxy} has no proxy accounts.`, 400);
		if (proxies.includes(proxy) === false) apiErrorWithStatusCode(`Address ${proxy} is not a proxy of ${proxied}`, 403);

		const firestore = firebaseAdmin.firestore();

		const alreadyExists = (await firestore.collection('addresses').doc(proxied).get()).exists;
		if (alreadyExists) apiErrorWithStatusCode('There is already an account associated with this proxied address', 403);

		// If this linked address is the first address to be linked. Then set it as default.
		// querying other verified addresses of user to check the same.
		const userAddresses = await getAddressesFromUserId(userId, true);
		const setAsDefault = userAddresses.length === 0;
		await this.createAddress(network, proxied, setAsDefault, userId);

		const user = await getUserFromUserId(userId);
		return this.getSignedToken(user);
	}

	public async AddressSignupConfirm (network: Network, address: string, signature: string, wallet: Wallet, multisigAddress?:string): Promise<AuthObjectType> {
		const signMessage = await redisGet(getAddressSignupKey(address));
		if (!signMessage) throw apiErrorWithStatusCode(messages.ADDRESS_SIGNUP_SIGN_MESSAGE_EXPIRED, 403);

		const isValidSr = address.startsWith('0x') && wallet === Wallet.METAMASK ? verifyMetamaskSignature(signMessage, address, signature) : verifySignature(signMessage, address, signature);

		if (!isValidSr) throw apiErrorWithStatusCode(messages.ADDRESS_SIGNUP_INVALID_SIGNATURE, 400);

		address = !multisigAddress ? address : multisigAddress;
		const addressDoc = await firebaseAdmin.firestore().collection('addresses').doc(address).get();
		if (addressDoc.exists) throw apiErrorWithStatusCode(messages.ADDRESS_SIGNUP_ALREADY_EXISTS, 400);

		const username = uuidv4().split('-').join('').substring(0, 25);
		const password = uuidv4();

		const user = await this.createUser('', password, username, true, network);

		await this.createAddress(network, address, true, user.id, address.startsWith('0x'), wallet, !multisigAddress ? false :  true);
		await redisDel(getAddressSignupKey(address));

		return {
			token: await this.getSignedToken(user),
			user_id: user.id
		};
	}

	public async SignUp (email: string, password: string, username: string, network: string): Promise<AuthObjectType> {
		const firestore = firebaseAdmin.firestore();
		const userQuerySnapshot = await firestore.collection('users').where('username', '==', username.toLowerCase()).limit(1).get();
		if (!userQuerySnapshot.empty) throw apiErrorWithStatusCode(messages.USERNAME_ALREADY_EXISTS, 400);

		for (let i = 0; i < nameBlacklist.length; i++) {
			if (username.toLowerCase().includes(nameBlacklist[i])) throw apiErrorWithStatusCode(messages.USERNAME_BANNED, 400);
		}

		if (email) {
			const userQuerySnapshot = await firestore.collection('users').where('email', '==', email).limit(1).get();
			if (!userQuerySnapshot.empty) throw apiErrorWithStatusCode(messages.USER_EMAIL_ALREADY_EXISTS, 400);
		}

		const user = await this.createUser(email, password, username, false, network);

		await this.createAndSendEmailVerificationToken(user, network);

		return {
			token: await this.getSignedToken(user)
		};
	}

	public async ChangePassword (token: string, oldPassword: string, newPassword: string): Promise<void> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);
		const user = await getUserFromUserId(userId) as User;
		const isCorrectPassword = await verifyUserPassword(user.password, oldPassword);
		if (!isCorrectPassword) throw apiErrorWithStatusCode(messages.INCORRECT_PASSWORD, 400);
		if (validator.equals(oldPassword, newPassword)) {
			throw apiErrorWithStatusCode(messages.OLD_AND_NEW_PASSWORD_MUST_DIFFER, 400);
		}

		const { password, salt } = await this.getSaltAndHashedPassword(newPassword);

		await firebaseAdmin.firestore().collection('users').doc(String(userId)).update({
			password,
			salt
		});
	}

	public async AddressUnlink (token: string, address: string): Promise<string> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);
		const user = await getUserFromUserId(userId);

		if(address.startsWith('0x')) {
			address = address.toLowerCase();
		}

		const firestore = firebaseAdmin.firestore();

		const addressDoc = await firestore.collection('addresses').where('address', '==', address).where('user_id', '==', Number(userId)).limit(1).get();
		if (addressDoc.empty) throw apiErrorWithStatusCode(messages.ADDRESS_NOT_FOUND, 400);

		const addressObj = addressDoc.docs[0].data() as Address;
		if (addressObj.default) throw apiErrorWithStatusCode(messages.ADDRESS_UNLINK_NOT_ALLOWED, 403);

		await firestore.collection('addresses').doc(address).delete();

		return this.getSignedToken(user);
	}

	public async AddressLinkConfirm (token: string, address: string, signature: string, wallet: Wallet): Promise<string> {
		const user = await this.GetUser(token);
		if(!user) throw apiErrorWithStatusCode(messages.USER_NOT_FOUND, 404);

		if(address.startsWith('0x')) {
			address = address.toLowerCase();
		}

		const firestore = firebaseAdmin.firestore();

		const addressToLinkDoc = await firestore.collection('addresses').doc(address).get();
		if (!addressToLinkDoc.exists) throw apiErrorWithStatusCode(messages.ADDRESS_NOT_FOUND, 404);

		const addressToLink = addressToLinkDoc.data() as Address;

		const isValidSr = address.startsWith('0x') && wallet === Wallet.METAMASK ? verifyMetamaskSignature(addressToLink.sign_message, addressToLink.address, signature) : verifySignature(addressToLink.sign_message, addressToLink.address, signature);
		if (!isValidSr) throw apiErrorWithStatusCode(messages.ADDRESS_LINKING_FAILED, 400);

		// If this linked address is the first address to be linked. Then set it as default.
		let setAsDefault = false;
		try{
			const userAddresses = await getAddressesFromUserId(user.id, true);
			setAsDefault = userAddresses.length === 0;
		} catch {
			setAsDefault = true;
		}

		const newAddress: Address = {
			...addressToLink,
			default: setAsDefault,
			is_erc20: address.startsWith('0x'),
			public_key: getPublicKey(address),
			verified: true,
			wallet: wallet
		};

		await firestore.collection('addresses').doc(address).set(newAddress);

		return this.getSignedToken(user);
	}

	public async MultisigAddressSignupStart (address: string): Promise<string> {
		const addressDoc = await firebaseAdmin.firestore().collection('addresses').doc(address).get();
		if (addressDoc.exists) throw apiErrorWithStatusCode(messages.MULTISIG_ADDRESS_ALREADY_EXISTS, 400);

		const signMessage = `<Bytes>${uuidv4()}</Bytes>`;

		await redisSetex(getMultisigAddressKey(address), ADDRESS_LOGIN_TTL, signMessage);

		return signMessage;
	}

	public async MultiSigAddressLinkConfirm (
		token: string,
		network: Network,
		address: string,
		addresses: string,
		ss58Prefix: number,
		threshold: number,
		signatory: string,
		signature: string
	): Promise<string> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);

		const signMessage = await redisGet(getMultisigAddressKey(address));
		if (!signMessage) throw apiErrorWithStatusCode(messages.MULTISIG_SIGN_MESSAGE_EXPIRED, 403);

		const signatories = addresses.split(',').map(address => address.trim()).filter(x => !!x);

		const multisigAddress = getMultisigAddress(signatories, ss58Prefix, threshold);
		if (address !== multisigAddress) throw apiErrorWithStatusCode(messages.MULTISIG_NOT_MATCHING, 400);

		if (!signatories.includes(signatory)) throw apiErrorWithStatusCode(messages.MULTISIG_NOT_ALLOWED, 400);

		const isValidSr = verifySignature(signMessage, signatory, signature);
		if (!isValidSr) throw apiErrorWithStatusCode(messages.ADDRESS_LINKING_FAILED, 403);

		// If this linked address is the first address to be linked. Then set it as default.
		// querying other verified addresses of user to check the same.
		const userAddresses = await getAddressesFromUserId(userId, true);
		const setAsDefault = userAddresses.length === 0;

		await this.createAddress(network, address, setAsDefault, userId);
		await redisDel(getMultisigAddressKey(address));

		const user = await getUserFromUserId(userId);
		return this.getSignedToken(user);
	}

	public async VerifyEmail (token: string): Promise<string> {
		const email = await redisGet(getEmailVerificationTokenKey(token));
		if (!email)  throw apiErrorWithStatusCode(messages.EMAIL_VERIFICATION_TOKEN_NOT_FOUND, 400);

		const firestore = firebaseAdmin.firestore();

		const userQuerySnapshot = await firestore.collection('users').where('email', '==', email).limit(1).get();
		if (userQuerySnapshot.empty) throw apiErrorWithStatusCode(messages.EMAIL_VERIFICATION_USER_NOT_FOUND, 400);

		const userDoc = userQuerySnapshot.docs[0];
		const userDocData = userDoc.data();
		await userDoc.ref.update({
			email_verified: true,
			notification_preferences:{ ...userDocData.notification_preferences,
				channelPreferences:{
					...userDocData.notification_preferences?.channelPreferences,
					email:{
						email: email,
						enabled: true,
						verified: true
					}
				}
			}
		});
		await redisDel(getEmailVerificationTokenKey(token));

		const user = await getUserFromUserId(Number(userDoc.id));

		return this.getSignedToken(user);
	}

	public async ChangeNotificationPreference (token: string, { post_participated, post_created, new_proposal, own_proposal }: NotificationSettings, network: string): Promise<NotificationSettings> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);

		const userPreferenceRef = networkDocRef(network).collection('user_preferences').doc(String(userId));
		const userPreferenceSnapshot = await userPreferenceRef.get();

		const getUpdatedNotificationSettings: (notification_preferences: NotificationSettings) => NotificationSettings = (notification_preferences) => {
			return {
				new_proposal: new_proposal === undefined ? notification_preferences.new_proposal : new_proposal,
				own_proposal: own_proposal === undefined ? notification_preferences.own_proposal : own_proposal,
				post_created: post_created === undefined ? notification_preferences.post_created : post_created,
				post_participated: post_participated === undefined ? notification_preferences.post_participated : post_participated
			};
		};

		let update: NotificationSettings = getUpdatedNotificationSettings(NOTIFICATION_DEFAULTS);
		if (userPreferenceSnapshot.exists) {
			const { notification_preferences } = userPreferenceSnapshot.data() as IUserPreference;
			update = getUpdatedNotificationSettings(notification_preferences);
			await userPreferenceRef.update({
				notification_preferences: update
			}).catch(err => {
				console.log('error in updating user preference', err);
				throw apiErrorWithStatusCode(messages.ERROR_UPDATING_USER_PREFERENCE, 500);
			});
		} else {
			await userPreferenceRef.set({
				notification_preferences: update,
				post_subscriptions: {},
				user_id: userId
			}).catch(err => {
				console.log('error in creating user preference', err);
				throw apiErrorWithStatusCode(messages.ERROR_CREATING_USER_PREFERENCE, 500);
			});
		}
		return update;
	}

	public async GetNotificationPreference (token: string, network: string): Promise<NotificationSettings> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);

		const userPreferenceRef = networkDocRef(network).collection('user_preferences').doc(String(userId));
		const userPreferenceSnapshot = await userPreferenceRef.get();

		let notification_preferences = NOTIFICATION_DEFAULTS;
		if (!userPreferenceSnapshot.exists) {
			await userPreferenceRef.set({
				notification_preferences: notification_preferences,
				post_subscriptions: {},
				user_id: userId
			}).catch(err => {
				console.log('error in creating user preference', err);
				throw apiErrorWithStatusCode(messages.ERROR_CREATING_USER_PREFERENCE, 500);
			});
		} else {
			notification_preferences = (userPreferenceSnapshot.data() as IUserPreference).notification_preferences;
		}
		return notification_preferences;
	}

	public async resendVerifyEmailToken (token: string, network: string): Promise<void> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);
		const user = await getUserFromUserId(userId);
		if (!user.email) throw apiErrorWithStatusCode(messages.EMAIL_NOT_FOUND, 404);

		await this.createAndSendEmailVerificationToken(user, network);
	}

	public async SetCredentialsStart (address: string): Promise<string> {
		const addressDoc = await firebaseAdmin.firestore().collection('addresses').doc(address).get();
		if (!addressDoc.exists) throw apiErrorWithStatusCode(messages.ADDRESS_NOT_FOUND, 404);

		const signMessage = `<Bytes>${uuidv4()}</Bytes>`;

		await redisSetex(getSetCredentialsKey(address), ADDRESS_LOGIN_TTL, signMessage);

		return signMessage;
	}

	public async SetCredentialsConfirm (address: string, email: string, newPassword: string, signature: string, username: string, network: string): Promise<string> {
		const signMessage = await redisGet(getSetCredentialsKey(address));
		if (!signMessage) throw apiErrorWithStatusCode(messages.SET_CREDENTIALS_SIGN_MESSAGE_EXPIRED, 400);

		const isValidSr = verifySignature(signMessage, address, signature);
		if (!isValidSr) throw apiErrorWithStatusCode(messages.SET_CREDENTIALS_INVALID_SIGNATURE, 403);

		const firestore = firebaseAdmin.firestore();

		const addressDoc = await firestore.collection('addresses').doc(address).get();
		if (!addressDoc.exists) throw apiErrorWithStatusCode(messages.ADDRESS_NOT_FOUND, 400);

		const usernameQuerySnapshot = await firestore.collection('users').where('username', '==', username.toLowerCase()).get();
		if(!usernameQuerySnapshot.empty) throw apiErrorWithStatusCode(messages.USERNAME_ALREADY_EXISTS, 400);

		const userEmailQuerySnapshot = await firestore.collection('users').where('email', '==', email.toLowerCase()).get();
		if(!userEmailQuerySnapshot.empty) throw apiErrorWithStatusCode(messages.USER_EMAIL_ALREADY_EXISTS, 400);

		const addressObj = addressDoc.data() as Address;
		const userId = addressObj.user_id;

		let user = await getUserFromUserId(userId);
		const { password, salt } = await this.getSaltAndHashedPassword(newPassword);

		await firestore.collection('users').doc(String(userId)).update({
			email,
			password,
			salt,
			username: username.toLowerCase(),
			web3signup: false
		});

		user = await getUserFromUserId(userId);

		await this.createAndSendEmailVerificationToken(user, network);

		await redisDel(getSetCredentialsKey(address));

		return this.getSignedToken(user);
	}

	public async ChangeUsername (token: string, username: string, password: string): Promise<string> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);
		const firestore = firebaseAdmin.firestore();

		const alreadyExists = (await firestore.collection('users').where('username', '==', username.toLowerCase()).get()).size > 0;
		if (alreadyExists) throw apiErrorWithStatusCode(messages.USERNAME_ALREADY_EXISTS, 400);

		let user = await getUserFromUserId(userId);

		const isCorrectPassword = await verifyUserPassword(user.password, password);
		if (!isCorrectPassword) throw apiErrorWithStatusCode(messages.INCORRECT_PASSWORD, 403);

		await firestore.collection('users').doc(String(userId)).update({ username: username.toLowerCase() });
		user = await getUserFromUserId(userId);

		return this.getSignedToken(user);
	}

	public async ChangeEmail (token: string, email: string, password: string, network: string): Promise<string> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);
		const firestore = firebaseAdmin.firestore();

		if (email !== '') {
			const alreadyExists = !(await firestore.collection('users').where('email', '==', email).limit(1).get()).empty;
			if (alreadyExists) throw apiErrorWithStatusCode(messages.USER_EMAIL_ALREADY_EXISTS, 400);
		}

		let user = await getUserFromUserId(userId);

		const isCorrectPassword = await verifyUserPassword(user.password, password);
		if (!isCorrectPassword) throw apiErrorWithStatusCode(messages.INCORRECT_PASSWORD, 403);

		const existingUndoTokenDoc = await firestore.collection('undo_email_change_tokens').where('user_id', '==', userId).limit(1).get();

		if (existingUndoTokenDoc.size > 0 && existingUndoTokenDoc.docs[0].data().valid) {
			const now = dayjs();
			const last = dayjs(existingUndoTokenDoc.docs[0].data().created_at);
			const hours = dayjs.duration(now.diff(last)).asHours();

			if (hours < 48) {
				throw apiErrorWithStatusCode(messages.EMAIL_CHANGE_NOT_ALLOWED_YET, 403);
			}
		}

		const newUndoEmailChangeToken: UndoEmailChangeToken = {
			created_at: new Date(),
			email: user.email,
			token: uuidv4(),
			user_id: user.id,
			valid: true
		};

		await firestore.collection('undo_email_change_tokens').add(newUndoEmailChangeToken);

		await firestore.collection('users').doc(String(user.id)).update({
			email,
			email_verified: false
		});

		user = await getUserFromUserId(userId);

		await this.createAndSendEmailVerificationToken(user, network);

		// send undo token in background
		sendUndoEmailChangeEmail(user, newUndoEmailChangeToken, network);

		return this.getSignedToken(user);
	}

	public async RequestResetPassword (email: string, network: string): Promise<string> {
		const userQuerySnapshot = await firebaseAdmin.firestore().collection('users').where('email', '==', email).limit(1).get();
		if (userQuerySnapshot.size === 0) return messages.EMAIL_NOT_FOUND;

		const user = userQuerySnapshot.docs[0].data() as User;
		let resetToken = await redisGet(getPwdResetTokenKey(user.id));
		if (!resetToken) {
			resetToken =  uuidv4();
		}
		await redisSetex(getPwdResetTokenKey(user.id), FIVE_MIN, resetToken);

		sendResetPasswordEmail(user, resetToken, network);
		return '';
	}

	public async ResetPassword (token: string, userId: number, newPassword: string): Promise<void> {
		const key = getPwdResetTokenKey(userId);
		const storedToken = await redisGet(key);
		if (!storedToken) throw apiErrorWithStatusCode(messages.PASSWORD_RESET_TOKEN_NOT_FOUND, 403);

		const isValid = timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
		if (!isValid) throw apiErrorWithStatusCode(messages.PASSWORD_RESET_TOKEN_INVALID, 403);

		const { password, salt } = await this.getSaltAndHashedPassword(newPassword);

		await firebaseAdmin.firestore().collection('users').doc(String(userId)).update({
			password,
			salt
		});

		await redisDel(key);
	}

	public async UndoEmailChange (token: string): Promise<{email: string; updatedToken: string}> {
		const firestore = firebaseAdmin.firestore();

		const undoTokenQuery = firestore
			.collection('undo_email_change_tokens')
			.where('token', '==', token)
			.limit(1);

		const undoTokenSnapshot = await undoTokenQuery.get();

		if (undoTokenSnapshot.empty) throw apiErrorWithStatusCode(messages.EMAIL_UNDO_TOKEN_NOT_FOUND, 400);

		const undoToken = undoTokenSnapshot.docs[0].data() as UndoEmailChangeToken;
		if (!undoToken.valid) throw apiErrorWithStatusCode(messages.INVALID_EMAIL_UNDO_TOKEN, 403);

		await firestore
			.collection('users')
			.doc(String(undoToken.user_id))
			.update({
				email: undoToken.email,
				email_verified: false
			});

		await undoTokenSnapshot.docs[0].ref.update({ valid: false });

		const user = await getUserFromUserId(undoToken.user_id);

		return { email: user.email, updatedToken: await this.getSignedToken(user) };
	}

	public async getSignedToken ({ email, email_verified, id, username, web3_signup, two_factor_auth }: User): Promise<string> {
		if (!privateKey) {
			const key = process.env.NODE_ENV === 'test' ? process.env.JWT_PRIVATE_KEY_TEST : process.env.JWT_PRIVATE_KEY?.replace(/\\n/gm, '\n');
			throw apiErrorWithStatusCode(`${key} not set. Aborting.`, 403);
		}

		if (!passphrase) {
			const key = process.env.NODE_ENV === 'test' ? process.env.JWT_KEY_PASSPHRASE_TEST : process.env.JWT_KEY_PASSPHRASE;
			throw apiErrorWithStatusCode(`${key} not set. Aborting.`, 403);
		}

		let default_address = null;
		let addresses: string[] = [];

		try {
			const user_addresses = await getAddressesFromUserId(id);
			addresses = user_addresses.map((a) => a.address);
			default_address = user_addresses.find((a) => a.default);
		} catch {
			console.log('Error getting addresses for user', id);
		}

		const allowedRoles: Role[] = [Role.USER];
		let currentRole: Role = Role.USER;

		// if our user is the proposal bot, give additional role.
		if (id === Number(process.env.PROPOSAL_BOT_USER_ID)) {
			allowedRoles.push(Role.PROPOSAL_BOT);
			currentRole = Role.PROPOSAL_BOT;
		}

		if (id === Number(process.env.EVENT_BOT_USER_ID)) {
			allowedRoles.push(Role.EVENT_BOT);
			currentRole = Role.EVENT_BOT;
		}

		let tokenContent: JWTPayloadType = {
			addresses: addresses || [],
			default_address: default_address?.address || '',
			email,
			email_verified: email_verified || false,
			iat: Math.floor(Date.now() / 1000),
			id,
			roles: {
				allowedRoles,
				currentRole
			},
			sub: `${id}`,
			username,
			web3signup: web3_signup || false
		};

		if(two_factor_auth?.enabled && two_factor_auth?.verified) {
			tokenContent = {
				...tokenContent,
				is2FAEnabled: true
			};
		}

		return jwt.sign(
			tokenContent,
			{ key: privateKey, passphrase },
			{ algorithm: 'RS256', expiresIn: '30d' }
		);
	}

	public async CreatePostStart (address: string): Promise<string> {
		const signMessage = uuidv4();

		await redisSetex(getCreatePostKey(address), CREATE_POST_TTL, signMessage);

		return signMessage;
	}

	public async CreatePostConfirm (
		network: Network,
		address: string,
		title: string,
		content: string,
		signature: string,
		proposalType: ProposalType
	): Promise<void> {
		const challenge = await redisGet(getCreatePostKey(address));

		if (!challenge) {
			throw apiErrorWithStatusCode(messages.POST_CREATE_SIGN_MESSAGE_EXPIRED, 400);
		}

		const signContent = `<Bytes>network:${network}::address:${address}::title:${title}::content:${content}::challenge:${challenge}</Bytes>`;

		const isValidSr = verifySignature(signContent, address, signature);
		if (!isValidSr) throw apiErrorWithStatusCode(messages.POST_CREATE_INVALID_SIGNATURE, 403);

		const firestore = firebaseAdmin.firestore();

		const addressDoc = await firestore.collection('addresses').doc(address).get();
		const addressObj = addressDoc.data() as Address;

		let user: User;

		if (!addressDoc.exists) {
			// Create new user
			const randomUsername = uuidv4().split('-').join('').substring(0, 25);
			const password = uuidv4();

			user = await this.createUser('', password, randomUsername, true, network);

			await this.createAddress(network, address, true, user.id);
		} else {
			user = await getUserFromUserId(addressObj.user_id);
		}

		await redisDel(getCreatePostKey(address));

		if (!user) return;

		const userDefaultAddress = await getDefaultUserAddressFromId(user.id);

		const offChainPostCollectionRef = postsByTypeRef(network, proposalType);

		const postsCount = (await offChainPostCollectionRef.count().get()).data().count || 0;

		await offChainPostCollectionRef.doc(`${postsCount + 1}`).set({
			content,
			created_at: new Date(),
			id: postsCount + 1,
			proposer_address: userDefaultAddress?.address || address,
			title,
			topic: {
				id: 1,
				name: proposalType === ProposalType.DISCUSSIONS? 'Democracy': 'Grant'
			},
			user_id: user.id,
			username: user.username
		});
	}

	public async EditPostStart (address: string): Promise<string> {
		const signMessage = uuidv4();

		await redisSetex(getEditPostKey(address), CREATE_POST_TTL, signMessage);

		return signMessage;
	}

	public async EditPostConfirm (
		network: Network,
		address: string,
		title: string,
		content: string,
		signature: string,
		proposalType: string,
		proposalId: string
	): Promise<void> {
		const challenge = await redisGet(getEditPostKey(address));
		if (!challenge) throw apiErrorWithStatusCode(messages.POST_EDIT_SIGN_MESSAGE_EXPIRED, 403);

		const signContent = `<Bytes>network:${network}::address:${address}::title:${title}::content:${content}::challenge:${challenge}</Bytes>`;

		const isValidSr = verifySignature(signContent, address, signature);
		if (!isValidSr) throw apiErrorWithStatusCode(messages.POST_EDIT_INVALID_SIGNATURE, 400);

		const firestore = firebaseAdmin.firestore();

		const addressDoc = await firestore.collection('addresses').doc(address).get();
		const addressObj = addressDoc.data() as Address;

		let user: User;

		if (!addressDoc.exists) {
			// Create new user
			const randomUsername = uuidv4().split('-').join('').substring(0, 25);
			const password = uuidv4();

			user = await this.createUser('', password, randomUsername, true, network);

			await this.createAddress(network, address, true, user.id);
		} else {
			user = await getUserFromUserId(addressObj.user_id);
		}

		await redisDel(getCreatePostKey(address));

		if (!user) return;

		await firestore
			.collection('networks')
			.doc(network)
			.collection('post_types')
			.doc(proposalType)
			.collection('posts')
			.doc(proposalId).set({
				content,
				last_edited_at: new Date(),
				title,
				topic: {
					id: 1,
					name: 'Democracy'
				},
				user_id: user.id
			}, { merge: true });

	}

	public async ProposalTrackerCreate (
		onchain_proposal_id: number,
		status: string,
		deadline: string,
		token: string,
		network: string,
		start_time: string
	): Promise<void> {

		if (!token || !status || !deadline || !onchain_proposal_id || !network || !start_time) throw apiErrorWithStatusCode(messages.INVALID_PROPOSAL_TRACKER_PARAMS, 400);

		const user = await this.GetUser(token);
		if(!user) throw apiErrorWithStatusCode(messages.USER_NOT_FOUND, 404);
		const user_id = user.id;

		const firestore = firebaseAdmin.firestore();
		const newEventDocRef = firestore.collection('networks').doc(network).collection('events').doc();

		const event: CalendarEvent = {
			content: '',
			end_time: dayjs(deadline).toDate(),
			event_type: 'onchain_treasury_proposal',
			id: newEventDocRef.id,
			module: '',
			post_id: onchain_proposal_id,
			start_time: dayjs(start_time).toDate(),
			status: status,
			title: 'Deadline for onchain proposal #' + onchain_proposal_id,
			url: `https://${network.toLowerCase()}/treasury/${onchain_proposal_id}`,
			user_id: user_id
		};

		await newEventDocRef.set(event);
	}

	public async ProposalTrackerUpdate (
		id: string,
		status: string,
		token: string
	): Promise<void> {
		if (!token || !status || !id) throw apiErrorWithStatusCode(messages.INVALID_PROPOSAL_TRACKER_PARAMS, 400);

		const user = await this.GetUser(token);
		if(!user) throw apiErrorWithStatusCode(messages.USER_NOT_FOUND, 404);
		const user_id = user.id;

		const firestore = firebaseAdmin.firestore();

		const proposalEventDoc = await firestore.collection('proposal_trackers').doc(id).get();
		if(!proposalEventDoc.exists) throw apiErrorWithStatusCode(messages.ERROR_IN_PROPOSAL_TRACKER, 400);

		const proposalEventData = proposalEventDoc.data() as CalendarEvent;
		if (proposalEventData.user_id !== user_id) throw apiErrorWithStatusCode(messages.ERROR_IN_PROPOSAL_TRACKER, 400);

		proposalEventDoc.ref.update({
			status: status
		});
	}
	public async SendVerifyEmail (token: string, email: string, network: string): Promise<any> {
		const userId = getUserIdFromJWT(token, jwtPublicKey);
		const firestore = firebaseAdmin.firestore();

		if (email !== '') {
			const alreadyExists = !(await firestore.collection('users').where('id', '!=', userId).where('email', '==', email).limit(1).get()).empty;
			if (alreadyExists) throw apiErrorWithStatusCode(messages.USER_EMAIL_ALREADY_EXISTS, 400);
		}

		let user = await getUserFromUserId(userId);

		const existingUndoTokenDoc = await firestore.collection('undo_email_change_tokens').where('user_id', '==', userId).limit(1).get();

		if (existingUndoTokenDoc.size > 0 && existingUndoTokenDoc.docs[0].data().valid) {
			const now = dayjs();
			const last = dayjs(existingUndoTokenDoc.docs[0].data().created_at);
			const hours = dayjs.duration(now.diff(last)).asHours();

			if (hours < 48) {
				throw apiErrorWithStatusCode(messages.EMAIL_CHANGE_NOT_ALLOWED_YET, 403);
			}
		}

		const oldMail = user.email;
		const shouldSendUndoEmailChangeEmail = !oldMail ? false : oldMail !== email ? true : false;

		await firestore.collection('users').doc(String(user.id)).update({
			email,
			email_verified: false
		});

		user = await getUserFromUserId(userId);

		await this.sendEmailVerificationToken(user, network);
		// send undo token in background
		if(shouldSendUndoEmailChangeEmail){
			const newUndoEmailChangeToken: UndoEmailChangeToken = {
				created_at: new Date(),
				email: oldMail,
				token: uuidv4(),
				user_id: user.id,
				valid: true
			};
			await firestore.collection('undo_email_change_tokens').add(newUndoEmailChangeToken);
			sendUndoEmailChangeEmail(user, newUndoEmailChangeToken, network);
		}

		return this.getSignedToken(user);
	}
}

const authServiceInstance = new AuthService();

export default authServiceInstance;