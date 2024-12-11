// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dynamic from 'next/dynamic';
import { dmSans } from 'pages/_app';
import React, { useState } from 'react';
import Skeleton from '~src/basic-components/Skeleton';
import { useTranslation } from 'next-i18next';

const DelegateInfoModal = dynamic(() => import('./DelegateInfoModal'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const BecomeDelegateSmall = () => {
	const { t } = useTranslation('common');
	const [openModal, setOpenModal] = useState<boolean>(false);

	return (
		<>
			<div className={`${dmSans.className} ${dmSans.variable} mb-4 flex items-center justify-between sm:hidden`}>
				<span className='text-sm font-semibold text-blue-light-high dark:text-blue-dark-high'>{t('delegation_on_polkassembly')}</span>
				<span
					onClick={() => setOpenModal(true)}
					className='text-[10px] font-medium text-pink_primary underline'
				>
					{t('learn_more')}
				</span>
			</div>
			<DelegateInfoModal
				openModal={openModal}
				setOpenModal={setOpenModal}
				className=''
			/>
		</>
	);
};

export default BecomeDelegateSmall;
