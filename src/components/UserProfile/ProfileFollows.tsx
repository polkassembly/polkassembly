// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import classNames from 'classnames';
import React from 'react';

const ProfileFollows = ({ className }: { className: string }) => {
	return (
		<div
			className={classNames(
				className,
				'mt-6 flex min-h-[280px] flex-col gap-5 rounded-[14px] border-[1px] border-solid border-section-light-container bg-white px-6 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
			)}
		>
			<div className={'flex items-center justify-between gap-4 max-md:px-0 '}>
				<div className='flex items-center gap-2 text-xl font-medium max-md:justify-start'>
					<ProfileFollows className='text-2xl text-lightBlue dark:text-[#9e9e9e]' />
					<div className='flex items-center gap-1 text-bodyBlue dark:text-white'>Mentions</div>
					{/* <span className='text-sm font-normal'>({count})</span> */}
				</div>
			</div>
            <div>
                {/* image */}
                <div>

                <div>
                    <span className='text-sm font-semibold text-blue-light-high dark:text-blue-dark-high'>Hanoi</span>
                    <span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>followed you</span>
                </div>
                <div>
                    {/* icon */}
                    <span className='text-xs text-blue-light-medium dark:text-blue-dark-medium'>14 oct 2024</span>
                </div>
                </div>
            </div>
		</div>
	);
};

export default ProfileFollows;
