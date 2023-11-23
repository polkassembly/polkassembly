// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal } from 'antd';
import React, { FC } from 'react';
import { CloseIcon } from './CustomIcons';
import { poppins } from 'pages/_app';
import { useTheme } from 'next-themes';
import TagsIcon from '~assets/icons/tags-icon.svg';
import TagsWhiteIcon from '~assets/icons/tags-white-icon.svg';
import { useRouter } from 'next/router';
import { onTagClickFilter } from '~src/util/onTagClickFilter';

interface ITagsModalProps {
	className?: string;
	tags?: any;
	track_name?: any;
	proposalType?: any;
	openTagsModal?: boolean;
	setOpenTagsModal?: (pre: boolean) => void;
}
const TagsModal: FC<ITagsModalProps> = (props) => {
	const { tags, track_name, proposalType, openTagsModal, setOpenTagsModal } = props;
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const handleTagClick = (pathname: string, filterBy: string) => {
		if (pathname)
			router.replace({
				pathname: `/${pathname}`,
				query: {
					filterBy: encodeURIComponent(JSON.stringify([filterBy]))
				}
			});
	};
	return (
		<div>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				open={openTagsModal}
				onCancel={(e) => {
					e.stopPropagation();
					e.preventDefault();
					setOpenTagsModal?.(false);
				}}
				footer={false}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				className={`${poppins.variable} ${poppins.className} ant-modal-content>.ant-modal-header]:bg-section-dark-overlay h-[120px] max-w-full shrink-0 max-sm:w-[100%]`}
				title={
					<>
						<label className='text-lg font-medium tracking-wide text-bodyBlue dark:text-blue-dark-high'>
							{theme === 'dark' ? <TagsWhiteIcon className='mr-2' /> : <TagsIcon className='mr-2' />}
							Tags
						</label>
						<Divider
							type='horizontal'
							className='border-l-1 mt-4 border-[#90A0B7] dark:border-icon-dark-inactive'
						/>
					</>
				}
			>
				<div className='mt-3 flex flex-wrap gap-2'>
					{tags && tags.length > 0 && (
						<>
							{tags?.map((tag: any, index: number) => (
								<div
									key={index}
									className='traking-2 cursor-pointer rounded-full border-[1px] border-solid border-navBlue px-[16px] py-[4px] text-xs text-navBlue hover:border-pink_primary hover:text-pink_primary'
									onClick={() => handleTagClick(onTagClickFilter(proposalType, track_name || ''), tag)}
								>
									{tag}
								</div>
							))}
						</>
					)}
				</div>
			</Modal>
		</div>
	);
};

export default TagsModal;
