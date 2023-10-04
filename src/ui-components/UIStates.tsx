// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { FrownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Empty, Result } from 'antd';
import React, { FC } from 'react';
import cleanError from 'src/util/cleanError';

import { OffChainProposalType, ProposalType } from '~src/global/proposalType';

export const LoadingState = () => {
	return (
		<Result
			icon={<LoadingOutlined className='text-pink_primary' />}
			title={<div className='dark:text-white'>Loading...</div>}
		/>
	);
};

interface IErrorStateProps {
	errorMessage: string;
	isRefreshBtnVisible?: boolean;
}

export const ErrorState: FC<IErrorStateProps> = ({ errorMessage, isRefreshBtnVisible = true }) => {
	return (
		<Result
			icon={<FrownOutlined className='text-pink_primary ' />}
			title={cleanError(errorMessage)}
			extra={
				isRefreshBtnVisible ? (
					<Button
						className='rounded-md bg-pink_primary text-white transition-colors duration-300 hover:bg-pink_secondary'
						onClick={() => window.location.reload()}
					>
						Refresh
					</Button>
				) : null
			}
		/>
	);
};
interface IPostEmptyStateProps {
	className?: string;
	postCategory?: ProposalType | OffChainProposalType;
	description?: string | JSX.Element;
	image?: JSX.Element;
	imageStyle?: any;
}
export const PostEmptyState: FC<IPostEmptyStateProps> = ({ className, description, postCategory, image, imageStyle }) => {
	//console.log('image=>'+image);
	return (
		<Empty
			className={className}
			image={image}
			imageStyle={imageStyle}
			description={
<<<<<<< HEAD
				postCategory?
					<span className='text-md text-navBlue'>
					We couldn&apos;t find any {postCategory.replaceAll('_', ' ')}.
					</span> : description ? <span className='text-md text-navBlue'>{description}</span> : <span className='text-md text-navBlue dark:text-blue-dark-high'>No data.</span>
=======
				postCategory ? (
					<span className='text-md text-navBlue'>We couldn&apos;t find any {postCategory.replaceAll('_', ' ')}.</span>
				) : description ? (
					<span className='text-md text-navBlue'>{description}</span>
				) : (
					<span className='text-md text-navBlue'>No data.</span>
				)
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
			}
		/>
	);
};
