// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { FrownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import { useTheme } from 'next-themes';
import React, { FC } from 'react';
import cleanError from 'src/util/cleanError';
import CustomButton from '~src/basic-components/buttons/CustomButton';

import { OffChainProposalType, ProposalType } from '~src/global/proposalType';
import ImageIcon from './ImageIcon';
import Link from 'next/link';

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
	showMoreDiscussions?: boolean;
}

export const ErrorState: FC<IErrorStateProps> = ({ errorMessage, isRefreshBtnVisible = true, showMoreDiscussions = false }) => {
	return (
		<Result
			icon={<FrownOutlined className='text-pink_primary dark:text-blue-dark-high' />}
			title={<span className='dark:text-blue-dark-high'>{cleanError(errorMessage)}</span>}
			className='flex flex-col items-center gap-1'
			extra={
				<div className='flex flex-col gap-2'>
					{isRefreshBtnVisible ? (
						<div className='flex justify-center'>
							<CustomButton
								onClick={() => window.location.reload()}
								variant='primary'
								text='Refresh'
								className='transition-colors duration-300'
							/>
						</div>
					) : null}
					{showMoreDiscussions ? (
						<div className='flex justify-center'>
							<CustomButton
								variant='primary'
								text='Show More Discussions'
								className='transition-colors duration-300'
							>
								<Link
									href='/discussions'
									className='hover:text-white'
								>
									Explore Discussions
								</Link>
							</CustomButton>
						</div>
					) : null}
				</div>
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
	text = text ? text : '';

	return (
		<div className={`my-[60px] flex flex-col items-center gap-6 ${className}`}>
			{image ? (
				<div style={imageStyle}>{image}</div>
			) : (
				<ImageIcon
					src={theme === 'light' ? '/assets/EmptyStateLight.svg' : '/assets/EmptyStateDark.svg'}
					alt='Empty Icon'
					imgClassName='w-[225px] h-[225px]'
				/>
			)}
			<h3 className='text-blue-light-high dark:text-blue-dark-high'>
				{postCategory ? <>We couldn&apos;t find any {postCategory.replaceAll('_', ' ')}.</> : description ? description : text}
			</h3>
		</div>
	);
};
