// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useRef } from 'react';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProfileDetails } from '~src/auth/types';
import styled from 'styled-components';
import SearchProfile from './SearchProfile';
import { useTheme } from 'next-themes';
import { Pagination } from '~src/ui-components/Pagination';

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
	theme?: string;
}

const ResultPeople = ({ className, peopleData, peoplePage, setPeoplePage }: Props) => {
	const { resolvedTheme: theme } = useTheme();

	const eventRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const scrollToTop = setTimeout(() => {
			if (eventRef.current) {
				eventRef.current.scrollTo({ behavior: 'smooth', left: 0, top: 0 });
			}
		}, 1000);

		return () => {
			clearTimeout(scrollToTop);
		};
	}, [peoplePage, peopleData]);

	return peopleData.length > 0 ? (
		<>
			<div
				className={`${className} ${peopleData.length > 1 ? 'h-[400px] overflow-y-auto' : ''} -mx-6 mt-3`}
				ref={eventRef}
			>
				{peopleData.map((user, index) => (
					<a
						rel='noreferrer'
						href={`/user/${user?.username}`}
						target='_blank'
						key={index}
					>
						<SearchProfile
							address={user?.defaultAddress || ''}
							username={user?.username}
							isSearch={true}
							className={`shadow-[0px 22px 40px -4px rgba(235, 235, 235, 0.8)] cursor-pointer rounded-none border-[1px] border-b-[0px] border-solid border-[#f3f4f5] px-9 py-8 hover:border-b-[1px] hover:border-pink_primary max-sm:p-5 md:min-h-[180px] ${
								index % 2 === 1 && 'bg-[#fafafb]'
							} ${index === peopleData.length - 1 && 'border-b-[1px]'}`}
						/>
					</a>
				))}
			</div>
			<div className={`${className} mb-1 flex items-center justify-center px-4 pt-4`}>
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
					theme={theme}
				/>
			</div>
		</>
	) : null;
};
export default styled(ResultPeople)`
	.ant-pagination-item-active {
		background-color: transparent !important;
	}
`;
