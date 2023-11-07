// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { AccountId32 } from '@polkadot/types/interfaces';
import React, { useContext, useEffect, useState } from 'react';
import { ErrorState } from 'src/ui-components/UIStates';
import { LoadingState } from 'src/ui-components/UIStates';

import AllianceAnnouncementsListing from './AllianceAnnouncementListing';
import { ApiContext } from '~src/context/ApiContext';

const AllianceUnscrupulous = ({ className }: { className?: string }) => {
	const { api, apiReady } = useContext(ApiContext);
	const [error, setErr] = useState<Error | null>(null);
	const [accounts, setAccounts] = useState<string[]>([]);
	const [websites, setWebsites] = useState<string[]>([]);
	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		api.query.alliance
			.unscrupulousAccounts()
			.then((acc) => {
				setAccounts(acc.toHuman() as string[]);
			})
			.catch((error) => setErr(error));
		api.query.alliance
			.unscrupulousWebsites()
			.then((web) => {
				setWebsites(web.toHuman() as string[]);
			})
			.catch((error) => setErr(error));
	}, [api, apiReady]);

	if (error) {
		return <ErrorState errorMessage={error.message} />;
	}

	if (accounts || websites) {
		return (
			<>
				<div className={`${className} rounded-md bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8`}>
					<div className='flex items-center justify-between'>
						<h1 className='dashboard-heading'>Accounts</h1>
					</div>

					<AllianceAnnouncementsListing
						className='mt-6'
						data={accounts}
					/>
				</div>

				<div className={`${className} rounded-md bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8`}>
					<div className='flex items-center justify-between'>
						<h1 className='dashboard-heading'>Websites</h1>
					</div>

					<AllianceAnnouncementsListing
						className='mt-6'
						data={websites}
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

export default AllianceUnscrupulous;
