// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Button, Modal, Slider } from 'antd';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import { CheckOutlined } from '@ant-design/icons';
import { ESentiment } from '~src/types';
import { CloseIcon } from './CustomIcons';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';

interface Props {
	setIsComment: (pre: boolean) => void;
	openModal: boolean;
	setModalOpen: (pre: boolean) => void;
	setIsSentimentPost: (pre: boolean) => void;
	className?: string;
	setSentiment: (pre: number) => void;
	sentiment: number | 0;
}

const CommentSentimentModal = ({ setIsComment, openModal, setModalOpen, setIsSentimentPost, className, sentiment, setSentiment }: Props) => {
	const currentUser = useUserDetailsSelector();

	const handleClick = () => {
		// GAEvent for comment creation
		trackEvent('comment_creation_successful', 'creation_comment', {
			address: currentUser?.loginAddress || '',
			sentimentSet: handleSentimentText(),
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});

		setIsSentimentPost(true);
		setIsComment(true);
		setModalOpen(false);
	};

	const handleSentimentText = () => {
		switch (sentiment) {
			case 1:
				return 'Completely Against';
			case 2:
				return 'Slightly Against';
			case 3:
				return 'Neutral';
			case 4:
				return 'Slightly For';
			case 5:
				return 'Completely For';
			default:
				return 'Neutral';
		}
	};

	return (
		<Modal
			open={openModal}
			wrapClassName={`${className}  sentiment_${sentiment} dark:bg-modalOverlayDark`}
			className={`${poppins.variable} ${poppins.className} padding center-aligned w-[433px] max-w-full shrink-0 justify-center max-sm:w-[100%] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => {
				setModalOpen(false);
				setIsComment(true);
				setIsSentimentPost(false);
			}}
			maskClosable={false}
			centered
			footer={[
				<div
					className='flex items-center justify-center'
					key={1}
				>
					<Button
						onClick={handleClick}
						className='t-xs flex items-center border-green-400 bg-green-400 font-medium text-white'
					>
						Done
						<CheckOutlined />
					</Button>
				</div>
			]}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			zIndex={1002}
		>
			<div className='center-aligned flex flex-col items-center justify-center pl-5 pr-5 text-base font-medium text-[#334D6E]'>
				<h5 className='mt-3 text-center dark:text-blue-dark-high'>
					Thank you for commenting on the post.
					<br />
					Move the slider to add your sentiment towards the discussion.
				</h5>
				<Slider
					style={{ width: '100%' }}
					className={`mt-[32px] w-full text-[12px] sentiment_${sentiment}`}
					trackStyle={{ backgroundColor: '#FF49AA' }}
					onChange={(value: number) => setSentiment(value)}
					step={5}
					marks={{
						1: { label: <span></span> },
						2: { label: <span></span> },
						3: { label: <span></span> },
						4: { label: <span></span> },
						5: { label: <span></span> }
					}}
					min={1}
					max={5}
					defaultValue={3}
				/>
				<h5 className='mb-[16px] text-sm font-medium text-pink_primary'>{handleSentimentText()}</h5>
			</div>
		</Modal>
	);
};
export default styled(CommentSentimentModal).attrs(({ sentiment }: any) => ({
	className: sentiment
}))`
	.padding .ant-modal-content {
		border-radius: 4px !important;
		padding: 40px 50px !important;
		text-align: center;
		justify-content: center;
		// color:#334D6E !important;
	}
	.padding .ant-slider-dot {
		border-color: #fce5f2 !important;
	}
	.padding .ant-slider-dot-active {
		border-color: #ff49aa !important;
	}
	.padding .ant-tooltip-open {
		border-color: #5c74fc !important;
	}

	.padding .ant-slider .ant-slider-rail {
		background-color: #fce5f2;
	}
	.dark & {
		.padding .ant-slider .ant-slider-rail {
			background-color: #3a162b;
		}
	}
	.padding .ant-slider .ant-slider-handle:focus::after {
		box-shadow: none;
	}

	.sentiment_${ESentiment.Against} {
		.ant-slider-handle::after {
			height: 32px;
			margin-top: -10px;
			width: 32px;
			background-image: url('/assets/icons/against.svg') !important;
			box-shadow: none;
			background-color: transparent;
			margin-left: -10px;
		}
		.dark & {
			.ant-slider-handle::after {
				background-image: url('/assets/icons/against-dark.svg') !important;
				background-repeat: no-repeat;
				height: 32px;
				width: 32px;
			}
		}
	}
	.sentiment_${ESentiment.SlightlyAgainst} {
		.ant-slider-handle::after {
			height: 32px;
			margin-top: -10px;
			width: 32px;
			background-image: url('/assets/icons/slightly-against.svg') !important;
			box-shadow: none;
			background-color: transparent;
			margin-left: -10px;
		}
		.dark & {
			.ant-slider-handle::after {
				background-image: url('/assets/icons/slightly-against-dark.svg') !important;
				background-repeat: no-repeat;
				height: 32px;
				width: 32px;
			}
		}
	}

	.sentiment_${ESentiment.Neutral} {
		.ant-slider-handle::after {
			height: 32px;
			margin-top: -10px;
			width: 32px;
			background-image: url('/assets/icons/neutral.svg') !important;
			box-shadow: none;
			background-color: transparent;
			margin-left: -10px;
		}
		.dark & {
			.ant-slider-handle::after {
				background-image: url('/assets/icons/neutral-dark.svg') !important;
				background-repeat: no-repeat;
				height: 32px;
				width: 32px;
			}
		}
	}

	.sentiment_${ESentiment.SlightlyFor} {
		.ant-slider-handle::after {
			height: 32px;
			margin-top: -10px;
			width: 32px;
			background-image: url('/assets/icons/slightly-for.svg') !important;
			box-shadow: none;
			background-color: transparent;
			margin-left: -10px;
		}
		.dark & {
			.ant-slider-handle::after {
				background-image: url('/assets/icons/slightly-for-dark.svg') !important;
				background-repeat: no-repeat;
				height: 32px;
				width: 32px;
			}
		}
	}

	.sentiment_${ESentiment.For} {
		.ant-slider-handle::after {
			height: 33px;
			margin-top: -11px;
			width: 33px;
			background-image: url('/assets/icons/for.svg') !important;
			box-shadow: none;
			background-color: transparent;
			margin-left: -10px;
		}
		.dark & {
			.ant-slider-handle::after {
				background-image: url('/assets/icons/for-dark.svg') !important;
				height: 32px;
				width: 32px;
			}
		}
	}
`;
