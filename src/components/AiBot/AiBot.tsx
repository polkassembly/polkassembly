// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button, FloatButton, List } from 'antd';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import CautionIcon from '~assets/icons/caution-icon.svg';
import CreateDiscussionIcon from '~assets/icons/create-icon.svg';
import CreateDiscussionIconDark from '~assets/icons/create-icon-dark.svg';
import CloseIcon from '~assets/icons/close-cross-icon.svg';
import CloseWhite from '~assets/icons/close-cross-thinner.svg';
import FabButton from '~assets/icons/fab-icon.svg';
import dynamic from 'next/dynamic';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { network as AllNetworks } from '~src/global/networkConstants';
import { trackEvent } from 'analytics';
import ProposalActionButtons from '~src/ui-components/ProposalActionButtons';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { useTranslation } from 'next-i18next';

const OpenGovTreasuryProposal = dynamic(() => import('../OpenGovTreasuryProposal'), {
	loading: () => (
		<SkeletonButton
			className='w-[100%]'
			active
		/>
	),
	ssr: false
});

const Gov1TreasuryProposal = dynamic(() => import('../Gov1TreasuryProposal'), {
	loading: () => (
		<SkeletonButton
			className='w-[100%]'
			active
		/>
	),
	ssr: false
});

export const treasuryProposalCreationAllowedNetwork = [AllNetworks.KUSAMA, AllNetworks.POLKADOT, AllNetworks.ROCOCO];

interface IAiChatbotProps {
	floatButtonOpen: boolean;
	setFloatButtonOpen: React.Dispatch<React.SetStateAction<boolean>>;
	isAIChatBotOpen: boolean;
	setIsAIChatBotOpen: React.Dispatch<React.SetStateAction<boolean>>;
	className?: string | undefined;
}

const AiBot: FC<IAiChatbotProps> = (props) => {
	const { floatButtonOpen, setFloatButtonOpen, className } = props;
	const router = useRouter();
	const { id, username } = useUserDetailsSelector();
	const [openDiscussionLoginPrompt, setOpenDiscussionLoginPrompt] = useState<boolean>(false);
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');

	useEffect(() => {
		const handleRouteChange = () => {
			if ((window as any).DocsBotAI?.isChatbotOpen) {
				(window as any).DocsBotAI?.close();
			}
			setFloatButtonOpen(false);
		};

		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const data = [
		{
			component: <ProposalActionButtons isUsedInFAB={true} />
		},
		{
			component: (
				<div
					className='ml-[-37px] flex min-w-[290px] cursor-pointer justify-center rounded-[8px] align-middle text-xl text-lightBlue transition delay-150 duration-300 hover:bg-[#e5007a12] hover:text-bodyBlue dark:text-blue-dark-medium'
					onClick={() => (id ? router.push('/post/create') : setOpenDiscussionLoginPrompt(true))}
				>
					<div className='ml-[-50px] mt-[5px] cursor-pointer'>{theme == 'dark' ? <CreateDiscussionIconDark /> : <CreateDiscussionIcon />}</div>
					<p className='mb-3 ml-[18px] mt-2.5 text-sm font-medium leading-5 tracking-[1.25%] '>{t('create_discussion_post')}</p>
				</div>
			)
		},
		{
			component: (
				<a
					href='https://polkassembly.hellonext.co/'
					target='_blank'
					rel='noreferrer'
					className='ml-[-34px] text-lightBlue hover:text-bodyBlue dark:text-blue-dark-medium'
				>
					<div className='flex min-w-[290px] cursor-pointer justify-center rounded-[8px] align-middle transition delay-150  duration-300 hover:bg-[#e5007a12]'>
						<CautionIcon className='ml-[-108px] mt-[5px] cursor-pointer' />
						<p className='mb-3 ml-[18px] mt-2.5 text-sm font-medium leading-5 tracking-[1.25%]'>{t('report_an_issue')}</p>
					</div>
				</a>
			)
		}
	];

	if (treasuryProposalCreationAllowedNetwork.includes(network)) {
		data.splice(0, 0, {
			component: <OpenGovTreasuryProposal theme={theme} />
		});
	}

	if (!isOpenGovSupported(network) && ![AllNetworks.POLYMESH, AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES].includes(network)) {
		data.splice(0, 0, {
			component: <Gov1TreasuryProposal />
		});
	}

	return (
		<>
			{!router?.pathname?.includes('batch-voting') && (
				<FloatButton.Group
					trigger='click'
					type='primary'
					style={{ bottom: 35, right: 40 }}
					icon={
						<Button
							type='text'
							style={{ borderRadius: '50%', height: '56px', marginLeft: '-8px', width: '56px' }}
							onClick={() => {
								setTimeout(() => setFloatButtonOpen(!floatButtonOpen), 200);
								trackEvent('fab_floating_button_clicked', 'clicked_fab_floating_button', {
									userId: id || '',
									userName: username || ''
								});
							}}
						>
							<FabButton className='mt-1' />
						</Button>
					}
					closeIcon={
						<Button
							type='text'
							style={{ borderRadius: '50%', height: '56px', marginLeft: '-8px', width: '56px' }}
							onClick={() => {
								setTimeout(() => setFloatButtonOpen(!floatButtonOpen), 200);
							}}
						>
							<CloseWhite className='mt-1' />
						</Button>
					}
					open={floatButtonOpen}
					className={`${className}`}
				>
					<></>
				</FloatButton.Group>
			)}

			{
				<List
					style={{ bottom: '85px', position: 'fixed', right: '20px', zIndex: '999' }}
					header={
						<div className='flex h-[38px] justify-between text-xl font-semibold text-lightBlue dark:text-white'>
							<p className='mt-2 h-[25px]'>{t('menu')}</p>
							<CloseIcon
								className='mt-4 cursor-pointer'
								onClick={() => {
									setFloatButtonOpen(false);
								}}
							/>
						</div>
					}
					bordered
					dataSource={data}
					className={`${className}
					${
						floatButtonOpen
							? 'max-h-[384px] w-[311px] translate-y-0 rounded-3xl bg-white opacity-100 shadow-[0_15px_35px_-20px_rgba(178,59,123,1)] transition-all delay-200 duration-500 dark:bg-section-dark-overlay max-[350px]:right-[5px]'
							: 'max-h-[384px] w-[311px] -translate-y-2 rounded-3xl bg-white opacity-0 shadow-[0_30px_40px_-20px_rgba(178,59,123,0.5)] transition-all duration-500 dark:bg-section-dark-overlay max-[350px]:right-[5px]'
					}
					${floatButtonOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
					renderItem={(item) => <List.Item>{item.component}</List.Item>}
				/>
			}
			<ReferendaLoginPrompts
				modalOpen={openDiscussionLoginPrompt}
				setModalOpen={setOpenDiscussionLoginPrompt}
				image='/assets/Gifs/login-discussion.gif'
				title={t('join_polkassembly')}
				subtitle={t('discussion_contribute_get_updates')}
			/>
		</>
	);
};

export default styled(AiBot)`
	.ant-float-btn-body {
		width: 56px !important;
		height: 56px !important;
		background: radial-gradient(circle, #e5007a, #ba0566, #9a0856);
		box-shadow:
			0 0 10px 0 rgba(229, 0, 122, 0.3),
			0 0 20px 5px rgba(229, 0, 122, 0.2);
	}
	.ant-float-btn-primary {
		background: rgba(76, 175, 80, 0.001);
	}
	.ant-float-btn .ant-float-btn-body .ant-float-btn-content .ant-float-btn-icon {
		width: 55px !important;
	}
	.ant-list-item {
		height: 65px;
		width: 100%;
		border-bottom: 2px dotted #d2d8e0;
	}
	.ant-spin-container {
		padding: 0px 23px;
		padding-bottom: 12px;
	}
`;
