// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import { useRouter } from 'next/router';
import { dmSans } from 'pages/_app';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { CloseIcon } from './CustomIcons';
import { OffChainProposalType } from '~src/global/proposalType';
import Image from 'next/image';

const SpamPostModal = ({ open, setOpen, className, proposalType }: { open: boolean; setOpen: (open: boolean) => void; className?: string; proposalType: string }) => {
	const router = useRouter();

	return (
		<Modal
			title={
				<div className='-mx-6 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
					Spam Alert
				</div>
			}
			open={open}
			onCancel={() => setOpen(false)}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			footer={false}
			className={`${dmSans.variable} ${dmSans.className}  dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			wrapClassName={`${className} bg-modalOverlayDark`}
		>
			<div className='mt-6 flex flex-col items-center justify-center gap-6 text-bodyBlue dark:text-blue-dark-high'>
				<Image
					src={'/assets/Gifs/spam-gif.gif'}
					alt='spam-post-modal'
					width={180}
					height={180}
				/>
				<span className='text-bodyBold text-base font-semibold dark:text-blue-dark-high'>
					This {`${[OffChainProposalType.DISCUSSIONS, OffChainProposalType.GRANTS].includes(proposalType as OffChainProposalType) ? 'Post' : 'Proposal'}`} is flagged as Spam.
				</span>
				<div className='flex items-center justify-center gap-6 pb-4 max-sm:gap-2'>
					<CustomButton
						text='Go Back'
						variant='default'
						onClick={() => router.push('/discussions')}
						height={40}
						width={158}
					/>
					<CustomButton
						text='View Anyways'
						variant='primary'
						onClick={() => {
							setOpen(false);
						}}
						height={40}
						width={158}
					/>
				</div>
			</div>
		</Modal>
	);
};

export default SpamPostModal;
