import { Divider } from 'antd';
import React from 'react';

const SubmissionReactionButton = ({ isUsedinModal }: { isUsedinModal?: boolean }) => {
	return (
		<div>
			{isUsedinModal && <Divider className='border-l-1 my-4 border-[#D2D8E0B2] dark:border-separatorDark md:inline-block' />}
			<div className={`${isUsedinModal ? 'flex items-center justify-end gap-2' : ''}`}>
				<button
					className={`${
						isUsedinModal ? 'w-[156px]' : 'w-full'
					} cursor-pointer rounded-[4px] border border-solid border-[#E5007A] bg-transparent px-4 py-2 text-sm font-medium text-[#E5007A]`}
				>
					Reject
				</button>
				<button
					className={`${
						isUsedinModal ? 'w-[156px]' : 'w-full'
					} cursor-pointer rounded-[4px] border border-solid border-[#E5007A] bg-[#E5007A] px-4 py-2 text-sm font-medium text-white`}
				>
					Approve
				</button>
			</div>
		</div>
	);
};

export default SubmissionReactionButton;
