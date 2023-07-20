// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { CHANNEL } from '.';
import DisabledConfirmation from './Modals/Confirmation';
import { Switch } from 'antd';
import ResetIcon from '~assets/icons/reset.svg';
import ResetConfirmation from './Modals/ResetConfirmation';

type Props = {
	title: string;
	description: string;
	Icon: any;
	onClick: (channelName: CHANNEL) => void;
	channel: CHANNEL;
	enabled: boolean;
	isBotSetup: boolean;
	handleEnableDisabled: (channelName: CHANNEL, enabled?: boolean) => void;
	handleReset: (channelName: CHANNEL) => void;
};

export default function BotSetupCard({
	title,
	description,
	Icon,
	onClick,
	channel,
	enabled,
	isBotSetup,
	handleEnableDisabled,
	handleReset,
}: Props) {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [showResetModal, setShowResetModal] = useState<boolean>(false);
	const handleClick = () => {
		setShowModal(true);
	};
	const handleResetClick = () => {
		setShowResetModal(true);
	};

	return (
		<div className="flex items-start text-[#243A57] gap-2 w-full justify-between">
			<div className="flex items-start text-[#243A57] gap-2">
				<div className={'relative mt-[2px] [&>svg]:mt-0'}>{Icon}</div>
				<div>
					<h3 className="flex text-base font-medium m-0 gap-2 text-[#243A57]">
						{title} Notifications{' '}
						{!description && (
							<div>
								<span className="text-[10px] px-[4px] py-[2px] bg-[#407BFF] border-[#5A46FF] border-2 text-[#FFFFFF] rounded-tr-lg rounded-bl-lg">
									Coming Soon
								</span>
							</div>
						)}
						{!!isBotSetup && (
							<span className="flex gap-1 items-center">
								<Switch
									checked={!!enabled}
									size="small"
									onChange={(checked) =>
										!checked
											? handleClick()
											: handleEnableDisabled(
													channel,
													true,
											  )
									}
								/>
								<label>
									<span
										className={`text-[14px] font-medium ${
											enabled
												? 'text-pink_primary'
												: 'text-[#485F7D]'
										}`}
									>
										{enabled ? 'Enabled' : 'Disabled'}
									</span>
								</label>
							</span>
						)}
					</h3>
					{description && !isBotSetup && (
						<p className="font-normal m-0 text-[12px] leading-[18px] font-normal">
							<span
								className="text-pink_primary font-medium cursor-pointer text-[14px] leading-[21px]"
								onClick={() => onClick(channel)}
							>
								<PlusCircleOutlined /> ADD THE POLKASSEMBLY BOT
							</span>{' '}
							to {description}
						</p>
					)}
					<DisabledConfirmation
						open={showModal}
						onConfirm={() => {
							setShowModal(false);
							handleEnableDisabled(channel);
						}}
						onCancel={() => setShowModal(false)}
						channel={channel}
					/>
					<ResetConfirmation
						open={showResetModal}
						onConfirm={() => {
							setShowResetModal(false);
							handleReset(channel);
						}}
						onCancel={() => setShowResetModal(false)}
						channel={channel}
					/>
				</div>
			</div>
			{isBotSetup && (
				<span
					className="text-[16px] font-medium text-pink_primary cursor-pointer flex items-center gap-1 underline"
					onClick={handleResetClick}
				>
					<ResetIcon /> Reset
				</span>
			)}
		</div>
	);
}
