// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const MUTATION_CHANGE_USERNAME = `
	mutation changeUsername($username: String!, $password: String!){
		changeUsername(username: $username, password: $password){
			message
			token
		}
	}
`;

export const MUTATION_CHANGE_EMAIL = `
	mutation changeEmail($email: String!, $password: String!){
		changeEmail(email: $email, password: $password) {
			message
			token
		}
	}
`;

export const MUTATION_CHANGE_PASSWORD = `
	mutation changePassword($oldPassword: String!, $newPassword: String!){
		changePassword(oldPassword: $oldPassword, newPassword: $newPassword){
			message
		}
	}
`;

export const ADDRESS_LINK_START = `
	mutation addressLinkStart($network: String!, $address: String!){
		addressLinkStart(network: $network, address: $address) {
			sign_message
			message
			address_id
		}
	}
`;

export const ADDRESS_LINK_CONFIRM = `
	mutation addressLinkConfirm($address_id: Int!, $signature: String!) {
		addressLinkConfirm(address_id: $address_id, signature: $signature) {
			message
			token
		}
	}
`;

export const ADDRESS_UNLINK = `
	mutation addressUnlink($address: String!) {
		addressUnlink(address: $address) {
			message
			token
		}
	}
`;

export const RESEND_VERIFY_EMAIL_TOKEN = `
	mutation resendVerifyEmailToken {
		resendVerifyEmailToken {
			message
		}
	}
`;

export const SET_DEFAULT_ADDRESS = `
	mutation setDefaultAddress($address: String!) {
		setDefaultAddress(address: $address) {
			message
			token
		}
	}
`;

export const SET_CREDENTIALS_START = `
	mutation setCredentialsStart($address: String!){
		setCredentialsStart(address: $address) {
			message
			signMessage
		}
	}
`;

export const SET_CREDENTIALS_CONFIRM = `
	mutation setCredentialsConfirm($address: String!, $email: String, $signature: String!, $username: String!, $password: String!) {
		setCredentialsConfirm(address: $address, email: $email, signature: $signature, username: $username, password: $password) {
			message
			token
		}
	}
`;

export const MUTATION_DELETE_ACCOUNT = `
	mutation deleteAccount($password: String!){
		deleteAccount(password: $password){
			message
		}
	}
`;

export const MULTISIG_LINK_START = `
	mutation multisigLinkStart($address: String!){
		multisigLinkStart(address: $address) {
			message
			signMessage
		}
	}
`;

export const MULTISIG_LINK_CONFIRM = `
	mutation multisigLinkConfirm($network: String!, $address: String!, $addresses: String!, $ss58Prefix: Int!, $threshold: Int!, $signatory: String!, $signature: String!) {
		multisigLinkConfirm(network: $network, address: $address, addresses: $addresses, ss58Prefix: $ss58Prefix, threshold: $threshold, signatory: $signatory, signature: $signature) {
			message
			token
		}
	}
`;