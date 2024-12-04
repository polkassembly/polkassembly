// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import BeneficiaryCard from './AddressDetailsCard';
import { usePostDataContext } from '~src/context';
import { useTranslation } from 'next-i18next';

interface Props {
	isProfileView?: boolean;
	address?: string;
}

const EvalutionSummary = ({ isProfileView, address }: Props) => {
	const { postData } = usePostDataContext();
	const { t } = useTranslation('common');

	return isProfileView && address ? (
		<div>
			<BeneficiaryCard
				key={address}
				address={typeof address == 'string' ? address : (address as any).interior?.value?.id || ''}
			/>
		</div>
	) : (
		<div className='mt-4 pb-4 text-bodyBlue dark:text-blue-dark-high'>
			<label className='tracking[0.01em] text-lg font-medium'>{t('evaluation_summary')}</label>
			{postData?.beneficiaries?.length === 1 || !postData?.beneficiaries?.length ? (
				<div className='mt-4 flex items-center gap-2.5'>
					{<span className='text-sm tracking-[0.01em]'>{postData?.beneficiaries?.length === 1 ? t('beneficiary_is') : t('proposer_is')}</span>}
					<BeneficiaryCard
						key={postData?.beneficiaries?.length === 1 ? postData?.beneficiaries?.[0]?.address : postData?.proposer}
						address={postData?.beneficiaries?.length === 1 ? postData?.beneficiaries?.[0]?.address : postData?.proposer}
					/>
				</div>
			) : (
				<div className='mt-4 flex flex-col gap-3'>
					<span className='text-sm tracking-[0.01em]'>
						{t('the')} {postData?.beneficiaries.length} {t('beneficiaries_of_this_proposal_are_as_follows')}
					</span>
					{!!postData?.beneficiaries?.length &&
						postData?.beneficiaries?.map((beneficiary) => (
							<BeneficiaryCard
								key={beneficiary.address}
								address={beneficiary.address}
								showAddress
							/>
						))}
				</div>
			)}
		</div>
	);
};
export default EvalutionSummary;
