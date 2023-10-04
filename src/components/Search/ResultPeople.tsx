// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Pagination as AntdPagination } from 'antd';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import DelegationProfile from '~src/ui-components/DelegationProfile';
import { ProfileDetails } from '~src/auth/types';
import { useTheme } from 'next-themes';
import styled from 'styled-components';

interface IUser {
	username: string;
	profile: ProfileDetails;
	created_at: Date;
	objectID: string | number;
	addresses?: string[];
	defaultAddress?: string;
}

interface Props {
	className?: string;
	peopleData: IUser[];
	setOpenModal: (pre: boolean) => void;
	setPeoplePage: (pre: any) => void;
	peoplePage: { page: number; totalPeople: number };
	searchInput: string;
}

<<<<<<< HEAD
const Pagination = styled(AntdPagination)`
	a{
		color: ${props => props.theme === 'dark' ? '#fff' : '#212121'} !important;
	}
	.ant-pagination-item-active {
		background-color: ${props => props.theme === 'dark' ? 'black' : 'white'} !important;
	}
	.anticon-right {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
	.anticon-left {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
`;

const ResultPeople = ({ className, peopleData, peoplePage, setPeoplePage }: Props) => {
	const { resolvedTheme:theme } = useTheme();
	return peopleData.length> 0 ? <>
		<div className={`${className} ${peopleData.length > 1 && 'overflow-y-scroll h-[400px]'} mt-3 -mx-6`}>
			{peopleData.map((user, index) => <a rel="noreferrer" href={`/user/${user?.username}`} target='_blank' key={index}>
				<DelegationProfile address={user?.defaultAddress || ''} username={user?.username} isSearch = {true}
					className={`py-8 px-9 max-sm:p-5 border-[#f3f4f5] border-solid border-[1px] shadow-[0px 22px 40px -4px rgba(235, 235, 235, 0.8)] rounded-none border-b-[0px] hover:border-pink_primary hover:border-b-[1px] cursor-pointer min-h-[180px] ${index % 2 === 1 && 'bg-[#fafafb]'} ${index === peopleData.length-1 && 'border-b-[1px]'}`}/>
			</a>)}
		</div>
		<div className='flex justify-center items-center pt-4 px-4'>
			<Pagination
				theme={theme}
				defaultCurrent={1}
				current={peoplePage?.page}
				pageSize={LISTING_LIMIT}
				total={peoplePage?.totalPeople}
				showSizeChanger={false}
				hideOnSinglePage={true}
				onChange={(page: number) => setPeoplePage((prev: any) => { return { ...prev, page };})}
				responsive={true}
			/>
		</div></> : null;
=======
const ResultPeople = ({ className, peopleData, peoplePage, setPeoplePage }: Props) => {
	return peopleData.length > 0 ? (
		<>
			<div className={`${className} ${peopleData.length > 1 && 'h-[400px] overflow-y-scroll'} -mx-6 mt-3`}>
				{peopleData.map((user, index) => (
					<a
						rel='noreferrer'
						href={`/user/${user?.username}`}
						target='_blank'
						key={index}
					>
						<DelegationProfile
							address={user?.defaultAddress || ''}
							username={user?.username}
							isSearch={true}
							className={`shadow-[0px 22px 40px -4px rgba(235, 235, 235, 0.8)] min-h-[180px] cursor-pointer rounded-none border-[1px] border-b-[0px] border-solid border-[#f3f4f5] px-9 py-8 hover:border-b-[1px] hover:border-pink_primary max-sm:p-5 ${
								index % 2 === 1 && 'bg-[#fafafb]'
							} ${index === peopleData.length - 1 && 'border-b-[1px]'}`}
						/>
					</a>
				))}
			</div>
			<div className='flex items-center justify-center px-4 pt-4'>
				<Pagination
					defaultCurrent={1}
					current={peoplePage?.page}
					pageSize={LISTING_LIMIT}
					total={peoplePage?.totalPeople}
					showSizeChanger={false}
					hideOnSinglePage={true}
					onChange={(page: number) =>
						setPeoplePage((prev: any) => {
							return { ...prev, page };
						})
					}
					responsive={true}
				/>
			</div>
		</>
	) : null;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
};
export default ResultPeople;
