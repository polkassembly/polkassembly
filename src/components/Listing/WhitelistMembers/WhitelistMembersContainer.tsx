// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
// TODO: Remove lodash dependency;
import _ from 'lodash';
import { EMembersType } from 'pages/members';
import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { ErrorState, PostEmptyState } from 'src/ui-components/UIStates';

import WhitelistMembersListing from './WhitelistMembersListing';
import FilterByTags from '~src/ui-components/FilterByTags';
import FilteredTags from '~src/ui-components/filteredTags';
import { useNetworkSelector } from '~src/redux/selectors';
import LoadingState from '~src/basic-components/Loading/LoadingState';

export type WhitelistMember = { accountId: string; rank?: number };

const WhitelistMembersContainer = ({ className, membersType }: { className?: string; membersType: EMembersType }) => {
	const { network } = useNetworkSelector();

	const { api, apiReady } = useContext(ApiContext);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [error, setError] = useState<any>();
	const [members, setMembers] = useState<WhitelistMember[]>([]);
	const [noMembers, setNoMembers] = useState<boolean>(false);

	const getWhitelistMembers = async () => {
		if (!api || !apiReady) {
			return;
		}

		// using any because it returns some Codec types

		if (['moonbeam', 'moonbase', 'moonriver'].includes(network)) {
			if (!api.query.openTechCommitteeCollective) {
				setNoMembers(true);
				return;
			}
			api.query.openTechCommitteeCollective.members((member: any) => {
				let members: WhitelistMember[] = [];

				if (!member.length) {
					setNoMembers(true);
					return;
				}

				member.forEach((m: any) => {
					members.push({
						accountId: m.toString()
					});
				});

				members = _.orderBy(members, ['rank'], ['asc']);

				setMembers(members);
			});
		} else if (network === 'picasso') {
			if (!api.query.technicalCommittee) {
				setNoMembers(true);
				return;
			}
			api.query.technicalCommittee
				.members()
				.then((members) => {
					let membersArr: WhitelistMember[] = [];

					if (!members.length) {
						setNoMembers(true);
						return;
					}

					members.forEach((m: any) => {
						membersArr.push({
							accountId: m.toString()
						});
					});

					membersArr = _.orderBy(membersArr, ['rank'], ['asc']);

					setMembers(membersArr);
				})
				.catch((err) => {
					setError(err);
				});
		} else {
			if (!api.query.fellowshipCollective) {
				setNoMembers(true);
				return;
			}
			api.query.fellowshipCollective.members
				.entries()
				.then((entries: any) => {
					let members: WhitelistMember[] = [];

					for (let i = 0; i < entries.length; i++) {
						// key split into args part to extract
						const [
							{
								args: [accountId]
							},
							optInfo
						] = entries[i];
						if (optInfo.isSome) {
							members.push({
								accountId: accountId.toString(),
								rank: Number(optInfo.unwrapOr(null)?.rank.toString())
							});
						}
					}

					members = _.orderBy(members, ['rank'], ['asc']);

					setMembers(members);
				})
				.catch((err) => {
					setError(err);
				});
		}
	};

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		getWhitelistMembers();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	if (error) {
		return <ErrorState errorMessage={error.message || 'Error in fetching Whitelist members.'} />;
	}

	if (noMembers) {
		return (
			<div className={`${className} rounded-md bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8`}>
				<PostEmptyState />
			</div>
		);
	}

	if (members.length) {
		return (
			<>
				<div className={`${className} rounded-md bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8`}>
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='dashboard-heading dark:text-white'>{members.length} Members</h1>
							<FilteredTags />
						</div>
						<FilterByTags className='mr-[2px]' />
					</div>

					<WhitelistMembersListing
						membersType={membersType}
						className='mt-6'
						data={members}
					/>
				</div>
			</>
		);
	}

	return (
		<div className={className}>
			<LoadingState />
		</div>
	);
};

export default WhitelistMembersContainer;
