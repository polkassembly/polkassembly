// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import Image from 'next/image';
import GrillChatIcon from '~assets/grillchat.png';
import styled from 'styled-components';
import { useNetworkContext } from '~src/context';
import { network as globalNework } from '~src/global/networkConstants';
import { useEffect, useRef, useState } from 'react';
import grill from '@subsocial/grill-widget';

const Container = styled.div`
.ChatFloatingModal {
  margin-right:8px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.ChatFloatingModal .ChatFloatingButton {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.ChatFloatingModal .ChatFloatingButton img {
  display: block;
  width: 100%;
  height: 100%;
}

.ChatFloatingModal .ChatFloatingIframe {
  /* 100px from the height of the button + offset to the bottom + gap */
  height: min(570px, calc(90vh - 100px));
  /* 60px from the offset left & right of the iframe (30px each) */
  width: min(400px, calc(100vw - 60px));
  border-radius: var(--border_radius_large);
  overflow: hidden;
  box-shadow: 0 12px 50px -12px rgba(0, 0, 0, 0.5);
  transition-property: opacity, height, width;
  transition-duration: 0.3s, 0s, 0s;
  transition-delay: 0s, 0s, 0s;
  opacity: 1;
  
}

.ChatFloatingIframe{
	margin-right:30px;
	margin-bottom:-40px;
}

.ChatFloatingModal .ChatFloatingIframe.ChatFloatingIframeHidden {
  pointer-events: none;
  transition-delay: 0s, 0.3s, 0.3s !important;
  width: 30px;
  height: 30px;
  opacity: 0;
  
}

.ChatFloatingModal .ChatFloatingIframe iframe {
  border-radius: var(--border_radius_large);
  width: 100%;
  height: 100%;
  border: none;
}
`;

export default function ChatFloatingModal() {
	const [isOpen, setIsOpen] = useState(false);
	const toggleChat = () => {
		setIsOpen((prev:boolean) => !prev);
	};

	const grillData: { [index: string]: string[] } = {
		[globalNework.CERE]: ['5145', '5139'],
		[globalNework.KILT]: ['2035', '5144'],
		[globalNework.KUSAMA]: ['2027', '5138'],
		[globalNework.MOONBEAM]: ['2065', '5142'],
		[globalNework.POLKADOT]: ['3638', '754']
	};

	const { network } = useNetworkContext();
	const hasOpened = useRef(false);
	useEffect(() => {
		if (!isOpen) return;
		if (!hasOpened.current) {
			let filterArray: string[] = [];
			if (grillData?.[network]) {
				filterArray = grillData?.[network];
			}
			grill.init(
				{
					hub: { id: 'polkassembly' },
					onWidgetCreated: (iframe:any) => {
						const channelsQuery = new URLSearchParams();
						const filterChannels = filterArray;
						channelsQuery.set('channels', filterChannels.join(','));
						iframe.src += `&${channelsQuery.toString()}`;
						return iframe;
					}
				}
			);
		}
		hasOpened.current = true;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [grillData, network]);

	return grillData?.[network] ? (
		<Container>
			<div className={'ChatFloatingModal'}>
				{(isOpen || hasOpened.current) && (
					<div
						id='grill'
						className={`ChatFloatingIframe ${!isOpen ? 'ChatFloatingIframeHidden' : ''}`
						}
					/>
				)}
				<Button className={'ChatFloatingButton'} onClick={toggleChat}>
					<Image src={GrillChatIcon} alt='GrillChat' className='w-[35px] h-[35px]' />
				</Button>
			</div>
		</Container>
	) : null;
}
