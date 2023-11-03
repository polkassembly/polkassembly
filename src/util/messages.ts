// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const messages = {
	API_FETCH_ERROR: 'Something went wrong while fetching data. Please try again later.',
	INVALID_REQUEST_BODY: 'invalid request body',
	NETWORK_VALIDATION_ERROR: 'Invalid network in request header',
	NO_ACTIVE_PROPOSALS: 'No active proposals found',
	SUBSQUID_FETCH_ERROR: 'Something went wrong while fetching onchain data. Please try again later.',
	VALIDATION_CONTENT_ERROR: 'Did you forget to add content?',
	VALIDATION_EMAIL_ERROR: 'Please provide a valid email!',
	VALIDATION_PASSWORD_ERROR: 'Please specify a password with at least 6 characters!',
	VALIDATION_TITLE_ERROR: 'Did you forget to add a title?',
	VALIDATION_USERNAME_MAXLENGTH_ERROR: 'Username cannot be larger than 30 characters.',
	VALIDATION_USERNAME_MINLENGTH_ERROR: 'Username should be at least 3 characters long.',
	VALIDATION_USERNAME_PATTERN_ERROR: "Invalid character found, you can use letters, numbers and the following characters '.' '_' '-'",
	VALIDATION_USERNAME_REQUIRED_ERROR: 'Username is mandatory.',
	WALLET_NOT_FOUND: 'Wallet not found'
};

export default messages;
