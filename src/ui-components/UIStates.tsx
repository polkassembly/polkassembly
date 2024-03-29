// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { FrownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Empty, Result } from 'antd';
import { useTheme } from 'next-themes';
import React, { FC } from 'react';
import cleanError from 'src/util/cleanError';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import EmptyStateDarkMode from '~assets/EmptyStateDark.svg';
import EmptyStateLightMode from '~assets/EmptyStateLight.svg';

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
			icon={<FrownOutlined className='text-pink_primary dark:text-blue-dark-high' />}
			title={<span className='dark:text-blue-dark-high'>{cleanError(errorMessage)}</span>}
			className='flex flex-col items-center gap-1'
			extra={
				isRefreshBtnVisible ? (
					<div className='flex justify-center'>
						<CustomButton
							onClick={() => window.location.reload()}
							variant='primary'
							text='Refresh'
							className='transition-colors duration-300'
						/>
					</div>
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
	text?: string;
}
export const PostEmptyState: FC<IPostEmptyStateProps> = ({ className, description, postCategory, image, imageStyle, text }) => {
	const { resolvedTheme: theme } = useTheme();
	//console.log('image=>'+image);
	text ? text : 'No Data.';
	return (
		<Empty
			className={className}
			image={image ? image : theme === 'dark' ? <EmptyStateDarkMode style={{ transform: 'scale(0.8)' }} /> : <EmptyStateLightMode style={{ transform: 'scale(0.8)' }} />}
			imageStyle={imageStyle ? imageStyle : { height: 300 }}
			description={
				postCategory ? (
					<span className='text-md text-navBlue dark:text-white'>We couldn&apos;t find any {postCategory.replaceAll('_', ' ')}.</span>
				) : description ? (
					<span className='text-md text-navBlue dark:text-white'>{description}</span>
				) : (
					<span className='text-md text-navBlue dark:text-white'>{text}</span>
				)
			}
		/>
	);
};
