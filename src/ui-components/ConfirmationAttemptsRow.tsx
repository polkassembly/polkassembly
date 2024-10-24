// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Space } from 'antd';
import { ITimelineData } from '~src/context/PostDataContext';
import HelperTooltip from './HelperTooltip';
import { useTranslation } from 'react-i18next';

const ConfirmationAttemptsRow = ({ timeline = [] }: { timeline: ITimelineData[] }) => {
	const { t } = useTranslation('common');

	const confirmationAttempts: number =
		timeline?.filter((timelineObj) => timelineObj.type === 'ReferendumV2')?.[0]?.statuses?.filter((statusObj: any) => statusObj.status === 'ConfirmStarted')?.length || 0;

	return (
		<>
			{confirmationAttempts > 1 && (
				<p className='m-0 mt-5 flex items-center justify-between p-0 leading-[22px]'>
					<>
						<span className='text-bodyblue text-sm font-normal text-bodyBlue dark:text-blue-dark-high'>{t('confirmation_attempts')}</span>

						<Space>
							<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>{confirmationAttempts}</span>
							<HelperTooltip
								placement={'topLeft'}
								text={<span className='text-xs'>{t('number_of_times_proposal_entered_confirmation_period_as_both_support_approval_were_greater_than_threshold')}</span>}
							/>
						</Space>
					</>
				</p>
			)}
		</>
	);
};

export default ConfirmationAttemptsRow;
