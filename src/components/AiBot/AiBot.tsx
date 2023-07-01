// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FloatButton } from 'antd';
import ChatFloatingModal from '../ChatBot/ChatFloatingModal';
import { ThunderboltTwoTone, CustomerServiceOutlined,CloseOutlined } from '@ant-design/icons';
import { FC } from 'react';

interface IAiChatbotProps {
    floatButtonOpen: boolean;
	setFloatButtonOpen: React.Dispatch<React.SetStateAction<boolean>>
    isAIChatBotOpen:boolean;
    setIsAIChatBotOpen:React.Dispatch<React.SetStateAction<boolean>>;
}

const  AiBot : FC <IAiChatbotProps> = (props) => {

	const  { floatButtonOpen , setFloatButtonOpen , isAIChatBotOpen , setIsAIChatBotOpen } = props;

	return (
		<FloatButton.Group
			trigger="click"
			type="primary"
			style={{ bottom:30, right: 10 }}
			icon={<CustomerServiceOutlined className='float-button' style={{ fontSize:'32px',marginBottom:'2px',marginLeft:'-7px' }}  onClick={() => setFloatButtonOpen(!floatButtonOpen)}/> }
			closeIcon={<CloseOutlined className='float-button' style={{ fontSize:'30px',marginLeft:'-6px' }} onClick={() => {setFloatButtonOpen(!floatButtonOpen);if((window as any).DocsBotAI.isChatbotOpen){ (window as any).DocsBotAI.close(); setIsAIChatBotOpen(false);} }}/>}
			open = { floatButtonOpen }
		>
			<FloatButton icon={<ThunderboltTwoTone />} onClick={() => {
				(window as any).DocsBotAI.toggle();
				setIsAIChatBotOpen(!isAIChatBotOpen);
			}} />
			<ChatFloatingModal disabled={isAIChatBotOpen}/>
		</FloatButton.Group>
	);
};
export default AiBot;