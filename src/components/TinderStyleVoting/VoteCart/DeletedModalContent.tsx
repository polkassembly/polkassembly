// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
interface IDeletedModalContent {
	title: string;
	id: number;
}
const DeletedModalContent: FC<IDeletedModalContent> = (props) => {
	const { title, id } = props;
	return (
		<section className='flex flex-col gap-y-1'>
			<p className='m-0 mt-2 p-0 text-sm font-normal text-bodyBlue dark:text-lightGreyTextColor'>Your batch voting is pending. Are you sure you want to remove proposal,</p>
			<p className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>
				#{id} {title}
				<span className='font-normal dark:text-lightGreyTextColor'> from cart ?</span>
			</p>
		</section>
	);
};

export default DeletedModalContent;
