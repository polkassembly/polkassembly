// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

const messages = {
	ABOUT_INVALID_SIGNATURE: 'Profile update failed. Invalid signature',
	ACCOUNT_DELETE_SUCCESSFUL: 'Your account has been deleted',
	ADDRESS_ALREADY_EXISTS: 'This address is already linked with another account. Please choose another address.',
	ADDRESS_DEFAULT_SUCCESS: 'Address has been successfully set as default',
	ADDRESS_LINKING_FAILED: 'Address linking failed. Signature invalid.',
	ADDRESS_LINKING_STARTED: 'Address Linking started. Please sign the message with your account to link address',
	ADDRESS_LINKING_SUCCESSFUL: 'Address is successfully linked to your account.',
	ADDRESS_LOGIN_INVALID_SIGNATURE: 'Login with web3 account failed. Invalid signature.',
	ADDRESS_LOGIN_NOT_FOUND: 'Login with web3 account failed. Address not linked to any account.',
	ADDRESS_LOGIN_SIGN_MESSAGE_EXPIRED: 'Session expired, please login again.',
	ADDRESS_LOGIN_STARTED: 'Please sign and send following message to login.',
	ADDRESS_NOT_FOUND: 'Address not found',
	ADDRESS_SIGNUP_ALREADY_EXISTS: 'There is already an account associated with this address, you cannot sign-up with this address.',
	ADDRESS_SIGNUP_INVALID_SIGNATURE: 'Signup with web3 account failed. Invalid signature.',
	ADDRESS_SIGNUP_SIGN_MESSAGE_EXPIRED: 'Session expired, please signup again.',
	ADDRESS_SIGNUP_STARTED: 'Please sign and send following message to signup.',
	ADDRESS_UNLINKING_SUCCESS: 'Address is successfully removed from your account.',
	ADDRESS_UNLINK_NOT_ALLOWED: 'You cannot unlink default address from your account.',
	ADDRESS_USER_NOT_MATCHING: 'You are not allowed to link this address',
	API_FETCH_ERROR: 'Something went wrong while fetching data. Please try again later.',
	BLACKLISTED_CONTENT_ERROR: 'Your post contains blacklisted or invalid content. Please remove it and try again. If you believe this is an error, please contact support.',
	BLACKLISTED_USER_ERROR: 'User is blacklisted. If you believe this is an error, please contact support.',
	CONTENT_REPORT_SUCCESSFUL: 'Content reported successfully',
	CREATE_POST_STARTED: 'Post creation started. Please sign the message with your account to create post',
	CREDENTIALS_CHANGE_SUCCESSFUL: 'Username and password added successfully',
	EDIT_POST_STARTED: 'Post edit started. Please sign the message with your account to edit post',
	EMAIL_CHANGE_NOT_ALLOWED_YET: 'Email change not allowed. Please wait 48 hours after last email change.',
	EMAIL_CHANGE_REQUEST_SUCCESSFUL: 'Email changed. Verification request sent to your email address.',
	EMAIL_NOT_FOUND: 'There is no email associated with your account.',
	EMAIL_REMOVE_SUCCESSFUL: 'Email removed from your account.',
	EMAIL_UNDO_SUCCESSFUL: 'Your email has been reverted to old email.',
	EMAIL_UNDO_TOKEN_NOT_FOUND: 'Email change undo token not found.',
	EMAIL_VERIFICATION_SUCCESSFUL: 'Thank you for verifying your email.',
	EMAIL_VERIFICATION_TOKEN_NOT_FOUND: 'Email verification token not found.',
	EMAIL_VERIFICATION_USER_NOT_FOUND: 'User not found for this verification token.',
	ERROR_CREATING_USER: 'There was an error creating user.',
	ERROR_CREATING_USER_PREFERENCE: 'There was an error creating user preference.',
	ERROR_IN_ADDING_EVENT: 'Error in adding event',
	ERROR_IN_POST_EDIT: 'Something went wrong while editing post',
	ERROR_IN_PROPOSAL_TRACKER: 'Something went wrong',
	ERROR_UPDATING_POST_SUMMARY: 'Error updating post summary.',
	ERROR_UPDATING_USER_PREFERENCE: 'There was an error updating user preference.',
	EVENT_ADDRESS_NOT_FOUND: 'Address not found.',
	EVENT_ADDRESS_NOT_VERIFIED: 'Address not verified.',
	EVENT_AUTHOR_ID_NOT_FOUND: 'Author id not found',
	EVENT_AUTHOR_NOT_FOUND: 'Author not found',
	EVENT_POST_ID_NOT_FOUND: 'Post id not found in event.',
	EVENT_POST_SUBSCRIPTION_MAIL_SENT: 'Post subscription mail sent.',
	EVENT_PROPOSAL_CREATED_MAIL_SENT: 'Proposal created mail sent.',
	EVENT_PROPOSER_ADDRESS_NOT_FOUND: 'Proposer address not found.',
	EVENT_USER_EMAIL_NOT_FOUND: 'User email not found.',
	EVENT_USER_EMAIL_NOT_VERIFIED: 'User email not verified.',
	EVENT_USER_NOTIFICATION_PREFERENCE_FALSE: 'Notification preference is set to not send email.',
	EVENT_USER_NOT_FOUND: 'User not found.',
	INCORRECT_PASSWORD: 'Your password is incorrect.',
	INTERNAL: 'Something went wrong. Please try again later.',
	INVALID_ADDRESS: 'Invalid address provided.',
	INVALID_DISCUSSION_ID: 'Invalid discussion id',
	INVALID_EMAIL: 'Please enter a valid email.',
	INVALID_EMAIL_UNDO_TOKEN: 'Invalid email change undo token.',
	INVALID_EMAIL_VERIFICATION_TOKEN: 'Invalid email verification token.',
	INVALID_JWT: 'Invalid token. Please login again.',
	INVALID_NETWORK: 'Invalid network in request header.',
	INVALID_PARAMS: 'Missing parameters in request body',
	INVALID_PROPOSAL_TRACKER_PARAMS: 'Invalid proposal tracker params.',
	INVALID_PROPOSAL_TYPE: 'Invalid proposal type',
	INVALID_USER_ID_IN_JWT: 'Invalid user id in token.',
	LOGOUT_SUCCESSFUL: 'Successfully logged out.',
	MULTISIG_ADDRESS_ALREADY_EXISTS: 'This multisig address already linked with another account.',
	MULTISIG_NOT_ALLOWED: 'Given address is not one of the multisig signatories',
	MULTISIG_NOT_MATCHING: 'Multisig address not valid',
	MULTISIG_SIGN_MESSAGE_EXPIRED: 'Session expired, please start again',
	NEW_PROPOSAL_CREATED_MAIL_SENT: 'New Proposal created mail sent.',
	NOTIFICATION_PREFERENCE_CHANGE_SUCCESSFUL: 'Notification preference changed successfully.',
	NO_USER_FOUND_WITH_ADDRESS: 'No user found with this address',
	NO_USER_FOUND_WITH_EMAIL: 'No user found with this email',
	NO_USER_FOUND_WITH_USERNAME: 'No user found with this username',
	NO_USER_FOUND_WITH_USER_ID: 'No user found with this userId',
	OLD_AND_NEW_PASSWORD_MUST_DIFFER: 'Your new password must be different from your old one.',
	PASSWORD_CHANGE_SUCCESSFUL: 'Password successfully changed.',
	PASSWORD_LENGTH_ERROR: 'Your password must be at least 6 characters long.',
	PASSWORD_RESET_SUCCESSFUL: 'Password successfully reset.',
	PASSWORD_RESET_TOKEN_INVALID: 'Password reset token has expired. Please request again.',
	PASSWORD_RESET_TOKEN_NOT_FOUND: 'Password reset token not found.',
	POST_CREATE_INVALID_SIGNATURE: 'Post creation failed. Invalid signature.',
	POST_CREATE_SIGN_MESSAGE_EXPIRED: 'Session expired, please create post again.',
	POST_EDIT_INVALID_SIGNATURE: 'Post edit failed. Invalid signature.',
	POST_EDIT_SIGN_MESSAGE_EXPIRED: 'Session expired, please edit post again.',
	POST_SUMMARY_UPDATED: 'Post summary updated.',
	PROFILE_CHANGED_SUCCESS: 'Profile changed successfully',
	REPORT_COMMENTS_LENGTH_EXCEEDED: 'Report comments can be max 300 character long.',
	REPORT_REASON_REQUIRED: 'Please provide a reason for reporting content',
	REPORT_TYPE_INVALID: 'Report type can only be post or comment',
	RESEND_VERIFY_EMAIL_TOKEN_REQUEST_SUCCESSFUL: 'A new verification mail has been sent to your email.',
	RESET_PASSWORD_RETURN_MESSAGE: 'The reset password link was sent to this email, if it exists in our database.',
	SET_CREDENTIALS_INVALID_SIGNATURE: 'Failed to set up a username and password. Invalid signature.',
	SET_CREDENTIALS_SIGN_MESSAGE_EXPIRED: 'Session expired, please try again.',
	SUBSCRIPTION_ALREADY_EXISTS: 'You are already subscribed to this post.',
	SUBSCRIPTION_DOES_NOT_EXIST: "Subscription doesn't exit.",
	SUBSCRIPTION_EMAIL_UNVERIFIED: 'Please verify your email to receive subscription emails.',
	SUBSCRIPTION_REMOVE_SUCCESSFUL: 'You have been unsubscribed successfuly.',
	SUBSCRIPTION_SUCCESSFUL: 'You successfully subscribed to new comments.',
	SUCCESS: 'Success.',
	TREASURY_PROPOSAL_CREATION_ERROR: 'Treasury proposals creation failed.',
	TREASURY_PROPOSAL_CREATION_SUCCESS: 'Treasury proposals successfully created, it will appear on polkassembly as soon as it is synced on chain.',
	TWO_FACTOR_AUTH_INVALID_AUTH_CODE: 'Invalid two factor authentication code.',
	TWO_FACTOR_AUTH_INVALID_TOKEN: 'Invalid two factor authentication token.',
	TWO_FACTOR_AUTH_NOT_INIT: 'Two factor authentication not initialised.',
	TWO_FACTOR_AUTH_TOKEN_EXPIRED: 'Two factor authentication token expired. Please login again.',
	UNAUTHORISED: 'Unauthorised.',
	USERNAME_ALREADY_EXISTS: 'Username already exists. Please choose a different username.',
	USERNAME_BANNED: 'Username is banned. Please use a different username.',
	USERNAME_CHANGE_SUCCESSFUL: 'Username successfully changed.',
	USERNAME_INVALID_ERROR: 'Username must be between 3 to 30 characters long, letters and numbers are allowed.',
	USER_EMAIL_ALREADY_EXISTS: 'A user with this email already exists.',
	USER_NOT_FOUND: 'User not found.',
	DISABLE_COMMENTS: 'Comments have been disabled for this post.',
	UNVERIFIED_DISABLE_COMMENTS: 'Comments have been disabled for non verified users.',
	NO_ACTIVE_PROPOSAL_FOUND: 'No active proposal found.',
	VOTE_NOT_FOUND: 'Vote not found.',
	METHOD_NOT_ALLOWED: 'Method not allowed.',
	ERROR_IN_UPDATING_BADGES: 'Error in updating badges.',
	ERROR_IN_EVALUATING_BADGES: 'Error in evaluating badges.',
	PROGRESS_REPORT_UPDATED_SUCCESSFULLY: 'Progress report updated successfully.',
	CURATOR_BIO_EDITED_SUCCESSFULLY: 'Curator bio edited successfully.',
	PARENT_BOUNTY_IS_NOT_ACTIVE: 'Parent Bounty is not active.',
	CHILD_BOUNTY_SUBMISSION_DONE: 'Child bounty submission successfully added',
	CHILD_BOUNTY_SUBMISSION_ALREADY_EXISTS: 'Child bounty submission already exists',
	CHILD_BOUNTY_SUBMISSION_NOT_EXISTS: 'Child bounty submission does not exists.',
	CHILD_BOUNTY_SUBMISSION_EDITED_SUCCESSFULLY: 'Child bounty submission edited successfully',
	CHILD_BOUNTY_SUBMISSION_DELETED_SUCCESSFULLY: 'Child bounty submission deleted successfully',
	EXPERT_REQ_ALREADY_EXIST: 'Expert Req Already Exists.'
};

export default messages;
