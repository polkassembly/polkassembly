// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useBatchVotesSelector } from '~src/redux/selectors';
import ImageIcon from '~src/ui-components/ImageIcon';

const CartOptionMenu = () => {
	const { total_proposals_added_in_Cart } = useBatchVotesSelector();
	const router = useRouter();

	return (
		<article className='flex h-[56px] w-full items-center justify-center gap-x-6 bg-white p-4 drop-shadow-2xl'>
			<p className='m-0 mr-auto p-0 text-xs'>{total_proposals_added_in_Cart} proposal added</p>
			<div className='ml-auto flex gap-x-1'>
				<CustomButton
					variant='primary'
					text='View cart'
					height={36}
					width={91}
					fontSize='xs'
					onClick={() => {
						router.push('/votes-cart');
					}}
				/>
				<Button className='flex h-[36px] w-[36px] items-center justify-center rounded-lg border border-solid border-pink_primary bg-transparent'>
					<ImageIcon
						src='/assets/icons/bin-icon.svg'
						alt='bin-icon'
					/>
				</Button>
			</div>
		</article>
	);
};

export default CartOptionMenu;
