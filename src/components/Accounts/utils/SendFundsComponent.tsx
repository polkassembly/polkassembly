import React from 'react';
import Image from 'next/image';
import { Button } from 'antd';
import { poppins } from 'pages/_app';

const SendFundsComponent = () => {
	return (
		<div>
			<Button
				// disabled={}
				// loading={loading}
				htmlType='submit'
				className={`my-0 flex h-8 items-center rounded-md border-none bg-[#E5007A] pl-[10px] text-white hover:bg-pink_secondary `}
			>
				<div>
					<Image
						className='-mt-[2.5px] h-5 w-5 rounded-full object-contain'
						src={'/assets/icons/accounts/funds-icon.svg'}
						alt='Logo'
						width={20}
						height={20}
					/>
					<span className={`${poppins.className} ${poppins.variable} ml-[4px] text-sm font-medium`}>Send Funds</span>
				</div>
			</Button>
		</div>
	);
};

export default SendFundsComponent;
