// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import MembersListing from '../Listing/Members/MembersListing';
import { useNetworkSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import { useTranslation } from 'react-i18next';

interface Props {
	className?: string;
}

const AdvisoryCommitteMembers = ({ className }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [members, setMembers] = useState<string[]>([]);
	const { t } = useTranslation('common');
	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		api?.query?.advisoryCommittee
			?.members()
			?.then((members) => {
				setMembers(members.toHuman() as string[]);
			})
			?.catch((error) => console.log(error));
	}, [network, api, apiReady]);

	return (
		<div className={`${className} rounded-md bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8`}>
			<div className='flex items-center justify-between'>
				<h1 className='dashboard-heading dark:text-white'>{t('members_heading')}</h1>
			</div>

			<MembersListing
				className='mt-6'
				data={members}
				prime={''}
			/>
		</div>
	);
};

export default AdvisoryCommitteMembers;
