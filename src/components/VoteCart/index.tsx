// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React from 'react';

const VoteCart: React.FC = () => {
	return (
		<section>
			<article className='h-[100vh] p-2'>
				<div className='mb-[48px] h-[686px] w-full overflow-y-auto bg-white p-2 shadow-md'>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto illum laborum sunt eveniet numquam excepturi voluptatibus, aliquam eius, molestias aperiam dolores
						perferendis eligendi. Ut libero doloremque recusandae aliquid assumenda similique. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui neque dolorum nihil
						expedita. Dolorum recusandae incidunt, quos soluta aut ipsa excepturi tenetur voluptas architecto nesciunt a veniam corrupti quibusdam? Officia.
					</p>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto illum laborum sunt eveniet numquam excepturi voluptatibus, aliquam eius, molestias aperiam dolores
						perferendis eligendi. Ut libero doloremque recusandae aliquid assumenda similique. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui neque dolorum nihil
						expedita. Dolorum recusandae incidunt, quos soluta aut ipsa excepturi tenetur voluptas architecto nesciunt a veniam corrupti quibusdam? Officia.
					</p>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto illum laborum sunt eveniet numquam excepturi voluptatibus, aliquam eius, molestias aperiam dolores
						perferendis eligendi. Ut libero doloremque recusandae aliquid assumenda similique. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui neque dolorum nihil
						expedita. Dolorum recusandae incidunt, quos soluta aut ipsa excepturi tenetur voluptas architecto nesciunt a veniam corrupti quibusdam? Officia.
					</p>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto illum laborum sunt eveniet numquam excepturi voluptatibus, aliquam eius, molestias aperiam dolores
						perferendis eligendi. Ut libero doloremque recusandae aliquid assumenda similique. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui neque dolorum nihil
						expedita. Dolorum recusandae incidunt, quos soluta aut ipsa excepturi tenetur voluptas architecto nesciunt a veniam corrupti quibusdam? Officia.
					</p>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto illum laborum sunt eveniet numquam excepturi voluptatibus, aliquam eius, molestias aperiam dolores
						perferendis eligendi. Ut libero doloremque recusandae aliquid assumenda similique. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui neque dolorum nihil
						expedita. Dolorum recusandae incidunt, quos soluta aut ipsa excepturi tenetur voluptas architecto nesciunt a veniam corrupti quibusdam? Officia.
					</p>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto illum laborum sunt eveniet numquam excepturi voluptatibus, aliquam eius, molestias aperiam dolores
						perferendis eligendi. Ut libero doloremque recusandae aliquid assumenda similique. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui neque dolorum nihil
						expedita. Dolorum recusandae incidunt, quos soluta aut ipsa excepturi tenetur voluptas architecto nesciunt a veniam corrupti quibusdam? Officia.
					</p>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto illum laborum sunt eveniet numquam excepturi voluptatibus, aliquam eius, molestias aperiam dolores
						perferendis eligendi. Ut libero doloremque recusandae aliquid assumenda similique. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui neque dolorum nihil
						expedita. Dolorum recusandae incidunt, quos soluta aut ipsa excepturi tenetur voluptas architecto nesciunt a veniam corrupti quibusdam? Officia.
					</p>
				</div>
			</article>
			<article
				className='sticky bottom-0 h-[137px] w-full bg-white p-5 shadow-lg'
				style={{ borderRadius: '8px 8px 0 0' }}
			>
				<div className='flex flex-col gap-y-2'>
					<div className='flex h-[40px] items-center justify-between rounded-sm bg-[#F6F7F9] p-2'>
						<p className='m-0 p-0 text-sm text-lightBlue'>Gas Fees</p>
						<p className='m-0 p-0 text-base font-semibold text-bodyBlue'>27.4 DOT</p>
					</div>
					<Button className='flex h-[40px] items-center justify-center rounded-lg border-none bg-pink_primary text-base text-white'>Confirm Batch Voting</Button>
				</div>
			</article>
		</section>
	);
};

export default VoteCart;
