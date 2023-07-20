// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Row } from 'antd';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import Loader from 'src/ui-components/Loader';
import styled from 'styled-components';

import DiscussionsBoard from './DiscussionsBoard';
import PostSidebar from './PostSidebar';
import ReferendaBoard from './ReferendaBoard';
import TipsBoard from './TipsBoard';

enum SidebarReducerAction {
  CLOSE,
  OPEN_DISCUSSION,
  OPEN_TIP,
  OPEN_REFERENDA,
}

const initSidebarState = {
	enabled: false,
	postID: '',
	postType: ''
};

function reducer(state: any, action: any) {
	switch (action.type) {
	case SidebarReducerAction.OPEN_DISCUSSION:
		return {
			...state,
			enabled: true,
			postID: action.postID,
			postType: 'discussion'
		};

	case SidebarReducerAction.OPEN_TIP:
		return {
			...state,
			enabled: true,
			postID: action.postID,
			postType: 'tip'
		};

	case SidebarReducerAction.OPEN_REFERENDA:
		return {
			...state,
			enabled: true,
			postID: action.postID,
			postType: 'referenda'
		};

	default:
		return initSidebarState;
	}
}

const CouncilBoardContainer = ({ className }: { className?: string }) => {
	const [members, setMembers] = useState<string[]>([]);
	const [sidebarState, dispatch] = useReducer(reducer, initSidebarState);

	const { defaultAddress } = useContext(UserDetailsContext);
	const { api, apiReady } = useContext(ApiContext);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		api.query.council.members().then((memberAccounts) => {
			setMembers(memberAccounts.map((member) => member.toString()));
		});
	}, [api, apiReady]);

	const openSidebar = (postID: number, type: SidebarReducerAction) => {
		dispatch({ postID, type });
	};

	const closeSidebar = () => {
		dispatch({ type: SidebarReducerAction.CLOSE });
	};

	if (!defaultAddress)
		return (
			<div className={className}>
				<h5>Please login to access the council board.</h5>
			</div>
		);

	return members && members.length > 0 ? (
		members.includes(defaultAddress) ||
    defaultAddress === 'GUUbJp6jMocrQMXMGxac5fqvWbjqsv97JL8DHp8m1Wxszmp' ? (
				<div className={className}>
					<div className="dashboard-heading mb-4">Council Board</div>

					<Row className="md:hidden">
						<Col span={24}>
							<h3>Feature available in desktop site only.</h3>
						</Col>
					</Row>
					<Row gutter={8}>
						<Col span={8}>
							<DiscussionsBoard
								className="board-card"
								openSidebar={(postID: number) =>
									openSidebar(postID, SidebarReducerAction.OPEN_DISCUSSION)
								}
							/>
						</Col>
						<Col span={8}>
							<ReferendaBoard
								className="board-card"
								openSidebar={(postID: number) =>
									openSidebar(postID, SidebarReducerAction.OPEN_REFERENDA)
								}
							/>
						</Col>
						<Col span={8}>
							<TipsBoard
								className="board-card"
								openSidebar={(postID: number) =>
									openSidebar(postID, SidebarReducerAction.OPEN_TIP)
								}
							/>
						</Col>
					</Row>

					{/* Create Event Sidebar */}
					{sidebarState.enabled && (
						<PostSidebar
							closeSidebar={closeSidebar}
							sidebarState={sidebarState}
							open={sidebarState.enabled}
						/>
					)}
				</div>
			) : (
				<div className={className}>
					<h5>Feature only available for council members.</h5>
				</div>
			)
	) : (
		<div className={className}>
			<Loader />
		</div>
	);
};

export default styled(CouncilBoardContainer)`
  h1 {
    @media only screen and (max-width: 576px) {
      margin: 3rem 1rem 1rem 1rem;
    }

    @media only screen and (max-width: 768px) and (min-width: 576px) {
      margin-left: 1rem;
    }

    @media only screen and (max-width: 991px) and (min-width: 768px) {
      margin-left: 1rem;
    }
  }

  .board-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 22px;
    gap: 24px;
    background: #dddddd;
    border-radius: 16px;

    & > h3 {
      width: 100%;
      text-align: start;
      color: #5a5a5a;
      font-weight: 500;
      display: flex;
      justify-content: space-between;
    }

    .post-card-div {
      cursor: pointer;
      width: 100%;
    }
  }
`;
