// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { AccountId32 } from '@polkadot/types/interfaces';
import React, { useContext, useEffect, useState } from 'react';
import { AllianceApiContext } from 'src/context/AllianceApiContext';
import { ErrorState } from 'src/ui-components/UIStates';
import { LoadingState } from 'src/ui-components/UIStates';

import AllianceAnnouncementsListing from './AllianceAnnouncementListing';
import { announcements as mockAnnouncement } from '~src/global/collectiveMockData';

const AllianceAnnouncements = ({ className } : { className?:string }) => {
	const { api, apiReady } = useContext(AllianceApiContext);
	const [error, setErr] = useState<Error | null>(null);
	const [announcements, setAnnouncements] = useState<any[]>([]);
	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}
		api.query.alliance.announcements().then((cids) => {
			setAnnouncements(cids.toHuman() as string[]);
			const res = cids.map((cid) => {
				return cid.toJSON();
			});
			console.log(res);
			setAnnouncements(res);
		}).catch(error => setErr(error));

	}, [api, apiReady]);

	if (error) {
		return <ErrorState errorMessage={error.message} />;
	}

	if(announcements){
		return (
			<>
				<div className={`${className} shadow-md bg-white p-3 md:p-8 rounded-md`}>
					<div className='flex items-center justify-between'>
						<h1 className='dashboard-heading'>Announcements</h1>
					</div>

					<AllianceAnnouncementsListing className='mt-6' data={mockAnnouncement} />
				</div>
			</>
		);
	}

	return (
		<div className={className}><LoadingState /></div>
	);

};

export default AllianceAnnouncements;