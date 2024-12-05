// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface FollowStatusResponseType {
	message: string;
	isFollowing: boolean;
}

export const useFollowStatus = (userIdToCheck: number | null) => {
	const [isFollowing, setIsFollowing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Checking if the user is already following
	const checkFollowStatus = async () => {
		if (!userIdToCheck) return;
		setLoading(true);
		try {
			const { data, error } = await nextApiClientFetch<FollowStatusResponseType>(`/api/v1/auth/actions/checkFollowStatus?userIdToCheck=${userIdToCheck}`);
			if (error) {
				console.log('Error while checking status', error);
				setError(error || 'Something went wrong while fetching follow status.');
			} else if (data?.isFollowing) {
				setIsFollowing(true);
			}
		} catch (err) {
			console.error('Error checking follow status', err);
			setError('Something went wrong while fetching follow status.');
		} finally {
			setLoading(false);
		}
	};

	// For Follow user
	const followUser = async (userId: number) => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await nextApiClientFetch('/api/v1/auth/actions/followUser', {
				userId
			});
			if (data) {
				setIsFollowing(true);
			} else {
				setError(error || 'Something went wrong while following the user.');
			}
		} catch (err) {
			console.error('Error following the user', err);
			setError('Failed to follow the user.');
		} finally {
			setLoading(false);
		}
	};

	// For Unfollow user
	const unfollowUser = async (userId: number) => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await nextApiClientFetch('/api/v1/auth/actions/unfollowUser', {
				userId
			});
			if (data) {
				setIsFollowing(false);
			} else {
				setError(error || 'Something went wrong while unfollowing the user.');
			}
		} catch (err) {
			console.error('Error unfollowing the user', err);
			setError('Failed to unfollow the user.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (userIdToCheck) {
			checkFollowStatus();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userIdToCheck, isFollowing]);

	return { error, followUser, isFollowing, loading, setIsFollowing, unfollowUser, userIdToCheck };
};
