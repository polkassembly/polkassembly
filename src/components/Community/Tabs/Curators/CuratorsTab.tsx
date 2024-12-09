// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { User } from '~src/auth/types';
import { Pagination } from '~src/ui-components/Pagination';
import Image from 'next/image';
import { Spin } from 'antd';
import CuratorsCard from './CuratorsCard';
import CardSkeleton from '../../CardSkeleton';
import { useTheme } from 'next-themes';

interface ICuratorsTab {
	totalUsers?: number;
	userData?: any;
	loading?: boolean;
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}
const CuratorsTab: FC<ICuratorsTab> = (props) => {
	const { totalUsers, userData, loading, currentPage, setCurrentPage } = props;
	const { resolvedTheme: theme } = useTheme();
	return (
		<Spin spinning={loading}>
			{loading && (
				<div className='grid grid-cols-2 items-end gap-6 opacity-100 max-lg:grid-cols-1 sm:mt-6'>
					<CardSkeleton />
					<CardSkeleton />
					<CardSkeleton />
					<CardSkeleton />
				</div>
			)}
			<div className='min-h-[250px]'>
				{!userData?.length && !loading ? (
					<div className='mt-4 flex flex-col items-center justify-center gap-4'>
						<Image
							src='/assets/Gifs/search.gif'
							alt='empty-state'
							width={350}
							height={350}
						/>
						<p>No User Found</p>
					</div>
				) : (
					<>
						<div className='mt-3 grid grid-cols-2 items-end gap-6 max-lg:grid-cols-1 sm:mt-6'>
							{userData?.map((user: User, index: number) => (
								<CuratorsCard
									user={user}
									key={index}
								/>
							))}
						</div>
						<div className='mt-6 flex justify-end'>
							<Pagination
								size='large'
								theme={theme}
								current={currentPage}
								onChange={(page: number) => setCurrentPage(page)}
								total={totalUsers}
								pageSize={10}
								showSizeChanger={false}
								hideOnSinglePage={true}
							/>
						</div>
					</>
				)}
			</div>
		</Spin>
	);
};

export default CuratorsTab;
