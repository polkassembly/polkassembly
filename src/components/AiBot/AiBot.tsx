// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, FloatButton, List } from 'antd';
import ChatFloatingModal from '../ChatBot/ChatFloatingModal';
import { FC, useEffect, useState, useContext } from 'react';
import AIbotIcon from '~assets/icons/ai-bot-icon.svg';
import CautionIcon from '~assets/icons/caution-icon.svg';
import CreateDiscussionIcon from '~assets/icons/create-icon.svg';
import CloseIcon from '~assets/icons/close-cross-icon.svg';
import CloseWhite from '~assets/icons/close-cross-thinner.svg';
import FabButton from '~assets/icons/fab-icon.svg';
import styled from 'styled-components';
import GrillChatIcon from '~assets/icons/grill-chat-icon.svg';
import { useRouter } from 'next/router';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import ReferendaLoginPrompts from '~src/ui-components/RefendaLoginPrompts';
import { useNetworkContext } from '~src/context';
import { network as globalNework } from '~src/global/networkConstants';

interface IAiChatbotProps {
	floatButtonOpen: boolean;
	setFloatButtonOpen: React.Dispatch<React.SetStateAction<boolean>>
	isAIChatBotOpen: boolean;
	setIsAIChatBotOpen: React.Dispatch<React.SetStateAction<boolean>>;
	className?: string | undefined;
}

const AiBot: FC<IAiChatbotProps> = (props) => {

	const { floatButtonOpen, setFloatButtonOpen, isAIChatBotOpen, setIsAIChatBotOpen, className } = props;
	const [grillChat, setGrillChat] = useState(false);
	const router = useRouter();
	const { id } = useContext(UserDetailsContext);
	const [openModal, setModalOpen] = useState<boolean>(false);
	const { network } = useNetworkContext();
	const [animationState, setAnimationState] = useState('');

	useEffect(() => {
		if (!isAIChatBotOpen) return;

		const docsBotElement = ((window as any).DocsBotAI.el.shadowRoot?.lastChild) as HTMLElement;
		docsBotElement.style.position = 'fixed';
		docsBotElement.style.right = '1em';
		docsBotElement.style.bottom = '80px';
	}, [isAIChatBotOpen, floatButtonOpen]);

	useEffect(() => {
		// check for the presence of a dom element inside a setInterval until it is found
		const interval = setInterval(() => {
			const docsBotElement = ((window as any)?.DocsBotAI?.el?.shadowRoot?.lastChild) as HTMLElement;
			if (!docsBotElement) return;

			clearInterval(interval);
			docsBotElement.style.display = 'none';
		}, 600);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const handleRouteChange = () => {
			if ((window as any).DocsBotAI.isChatbotOpen) {
				(window as any).DocsBotAI.close();
			}
		};

		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const handleAddDiscussion = () => {
		if (id) {
			router.push('/post/create');
		} else {
			setModalOpen(true);
		}

	};

	const data = network === globalNework.CERE || network === globalNework.KILT || network === globalNework.KUSAMA || network === globalNework.MOONBEAM || network === globalNework.POLKADOT ?
		[
			{
				component: <div className='ml-[-37px] flex justify-center align-middle hover:bg-[#e5007a12] transition duration-300 delay-150 min-w-[290px] rounded-[8px] cursor-pointer'
					onClick={() => { handleAddDiscussion(); }}
				>
					<CreateDiscussionIcon className='cursor-pointer ml-[-58px] mt-[5px]' />
					<p className='text-[#485F7D] ml-4 mt-[10px] mb-[12px] font-medium text-[14px] leading-5 tracking-[1.25%] '>Create Discussion Post</p>
				</div>
			},
			{
				component: <div className='ml-[-37px] flex justify-center align-middle hover:bg-[#e5007a12] transition duration-300 delay-150 min-w-[290px] rounded-[8px] cursor-pointer'
					onClick={() => {
						if (!grillChat)
							(window as any).DocsBotAI.toggle();
						setIsAIChatBotOpen(!isAIChatBotOpen);
					}}
				>
					<AIbotIcon className='cursor-pointer ml-[-169px] mt-[5px]' />
					<p className='text-[#485F7D] ml-4 mt-[10px] mb-[12px]  font-medium text-[14px] leading-5 tracking-[1.25%]'>AI Bot</p>
				</div>
			},
			{
				component: <div className='ml-[-37px] flex justify-center align-middle hover:bg-[#e5007a12] transition duration-300 delay-150 min-w-[290px] rounded-[8px] cursor-pointer'
					onClick={() => {
						if (!isAIChatBotOpen) setGrillChat(!grillChat);
					}}
				>
					<GrillChatIcon className='cursor-pointer ml-[-149px] mt-[5px]' />
					<p className='text-[#485F7D] ml-4 mt-[10px] mb-[12px]  font-medium text-[14px] leading-5 tracking-[1.25%]'>Grill Chat</p>
				</div>
			},
			{
				component: <a href='https://polkassembly.hellonext.co/'
					target='_blank'
					rel='noreferrer'
					className='text-[#485F7D] hover:text-[#485F7D] ml-[-37px]'>
					<div className='flex justify-center align-middle hover:bg-[#e5007a12] transition duration-300 delay-150 min-w-[290px]  rounded-[8px] cursor-pointer'>
						<CautionIcon className='cursor-pointer ml-[-109px] mt-[5px]' />
						<p className='ml-4 mt-[10px] mb-[12px] font-medium text-[14px] leading-5 tracking-[1.25%]'>Report An Issue</p>
					</div>
				</a>
			}
		]
		:
		[
			{
				component: <div className='ml-[-37px] flex justify-center align-middle hover:bg-[#e5007a12] transition duration-300 delay-150 min-w-[290px] rounded-[8px] cursor-pointer'
					onClick={() => { handleAddDiscussion(); }}
				>
					<CreateDiscussionIcon className='cursor-pointer ml-[-58px] mt-[5px]' />
					<p className='text-[#485F7D] ml-4 mt-[10px] mb-[12px] font-medium text-[14px] leading-5 tracking-[1.25%] '>Create Discussion Post</p>
				</div>
			},
			{
				component: <div className='ml-[-37px] flex justify-center align-middle hover:bg-[#e5007a12] transition duration-300 delay-150 min-w-[290px] rounded-[8px] cursor-pointer'
					onClick={() => {
						if (!grillChat)
							(window as any).DocsBotAI.toggle();
						setIsAIChatBotOpen(!isAIChatBotOpen);
					}}
				>
					<AIbotIcon className='cursor-pointer ml-[-169px] mt-[5px]' />
					<p className='text-[#485F7D] ml-4 mt-[10px] mb-[12px]  font-medium text-[14px] leading-5 tracking-[1.25%]'>AI Bot</p>
				</div>
			},
			{
				component: <a href='https://polkassembly.hellonext.co/'
					target='_blank'
					rel='noreferrer'
					className='text-[#485F7D] hover:text-[#485F7D] ml-[-37px]'>
					<div className='flex justify-center align-middle hover:bg-[#e5007a12] transition duration-300 delay-150 min-w-[290px]  rounded-[8px] cursor-pointer'>
						<CautionIcon className='cursor-pointer ml-[-109px] mt-[5px]' />
						<p className='ml-4 mt-[10px] mb-[12px] font-medium text-[14px] leading-5 tracking-[1.25%]'>Report An Issue</p>
					</div>
				</a>
			}
		];

	return (
		<>
			<div className={`wave-effect ${animationState}`} ></div>

			<FloatButton.Group
				trigger='click'
				type='primary'
				style={{ bottom: 35, right: 40 }}
				icon={
					<Button
						type='text'
						style={{ borderRadius: '50%', height: '56px', marginLeft: '-8px', width: '56px' }}
						onClick={() => {
							setTimeout(() => setFloatButtonOpen(!floatButtonOpen), 500);
							setAnimationState('hidden');
						}}
					>
						<FabButton className='mt-1' />
					</Button>
				}
				closeIcon={
					<Button
						type='text'
						style={{ borderRadius: '50%', height: '56px', marginLeft: '-8px', width: '56px' }}
						onClick={() => { setTimeout(() => setFloatButtonOpen(!floatButtonOpen), 500); if ((window as any).DocsBotAI.isChatbotOpen) { (window as any).DocsBotAI.close(); setIsAIChatBotOpen(false); } setGrillChat(false); }}><CloseWhite className='mt-1' />
					</Button>
				}
				open={floatButtonOpen}
				className={`${className}`}
			>
			</FloatButton.Group>

			{
				<List
					style={{ bottom: '85px', position: 'fixed', right: '20px', zIndex: '999' }}
					header={
						<div className='flex justify-between font-semibold text-[20px] text-[#485F7D] h-[38px]'>
							<p className='mt-2 h-[25px]'>
							Menu
							</p>
							<CloseIcon className='mt-4 cursor-pointer' onClick={() =>
							{ setFloatButtonOpen(false); setGrillChat(false);
							}} />
						</div>}
					bordered
					dataSource={data}
					className={`${className}
					${floatButtonOpen ? 'opacity-100 translate-y-0 transition-all duration-500 delay-200 w-[311px] max-h-[384px] bg-white max-[350px]:right-[5px] rounded-3xl shadow-[0_30px_40px_-20px_rgba(178,59,123,0.5)]' : 'opacity-0 -translate-y-2 transition-all duration-500 w-[311px] max-h-[384px] bg-white max-[350px]:right-[5px] rounded-3xl shadow-[0_30px_40px_-20px_rgba(178,59,123,0.5)]'}
					${floatButtonOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}

					renderItem={(item) => (
						<List.Item >
							{item.component}
						</List.Item>
					)}
				/>

			}
			{
				grillChat && <ChatFloatingModal />
			}
			<ReferendaLoginPrompts modalOpen={openModal} setModalOpen={setModalOpen} image='/assets/referenda-discussion.png' title='Join Polkassembly to Start a New Discussion.' subtitle='Discuss, contribute and get regular updates from Polkassembly.' />
		</>
	);
};

{/* */ }

export default styled(AiBot)`


.ant-float-btn-body{
	width:56px !important;
	height:56px !important;
	background: radial-gradient(circle,#E5007A,#BA0566,#9A0856);
}
.ant-float-btn-primary {
    background: rgba(76, 175, 80, 0.001)
}
.ant-float-btn .ant-float-btn-body .ant-float-btn-content .ant-float-btn-icon {
width:55px !important;
}
.ant-list-item{
	height:65px;
	width:100%;
	border-bottom: 2px dotted #D2D8E0;
}
.ant-spin-container{
	padding: 0px 23px;
}
`;