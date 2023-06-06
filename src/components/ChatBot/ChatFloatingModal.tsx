// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'antd';
import grill from '@subsocial/grill-widget';
import Image from 'next/image';
import GrillChatIcon from '~assets/grillchat.png';
import styled from 'styled-components';

const Container = styled.div`
.ChatFloatingModal {
  position: fixed;
  bottom: 30px;
  right: 30px;
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

.ChatFloatingModal .ChatFloatingIframe.ChatFloatingIframeHidden {
  pointer-events: none;
  transition-delay: 0s, 0.3s, 0.3s !important;
  height: 0;
  width: 0;
  opacity: 0;
}

.ChatFloatingModal .ChatFloatingIframe iframe {
  border-radius: var(--border_radius_large);
  width: 100%;
  height: 100%;
  border: none;
}
`;

export default function ChatFloatingModal () {
	const [ isOpen, setIsOpen ] = useState(false);
	const toggleChat = () => {
		setIsOpen((prev) => !prev);
	};
	const hasOpened = useRef(false);
	useEffect(() => {
		if (!isOpen) return;

		if (!hasOpened.current) {
			grill.init({ hub: { id: 'polka' }, theme: 'light' });
		}
		hasOpened.current = true;
	}, [ isOpen ]);

	return (
		<Container>
			<div className={'ChatFloatingModal'}>
				{(isOpen || hasOpened.current) && (
					<div
						id='grill'
						className={`ChatFloatingIframe ${!isOpen ? 'ChatFloatingIframeHidden':''}`
						}
					/>
				)}
				<Button className={'ChatFloatingButton'} onClick={toggleChat}>
					<Image src={GrillChatIcon} alt='GrillChat' className='w-[50px] h-[50px]'/>
				</Button>
			</div>
		</Container>
	);
}
