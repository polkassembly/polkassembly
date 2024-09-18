import { MenuProps } from 'antd';
import { useTheme } from 'next-themes';
import { poppins } from 'pages/_app';
import React, { useState } from 'react';
import ThreeDotsIcon from '~assets/icons/three-dots.svg';
import { Dropdown } from '~src/ui-components/Dropdown';

const AddressActionDropdown = () => {
	const { resolvedTheme: theme } = useTheme();
	const [isDropdownActive, setIsDropdownActive] = useState(false);

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: (
				<div className='mt-1 flex items-center space-x-2'>
					<span className={`${poppins.className} ${poppins.variable} text-sm text-blue-light-medium dark:text-blue-dark-medium`}>Link Address</span>
				</div>
			)
		},
		{
			key: '2',
			label: (
				<div className='mt-1 flex items-center space-x-2'>
					<span className={`${poppins.className} ${poppins.variable} text-sm text-blue-light-medium dark:text-blue-dark-medium`}>Add Proxy</span>
				</div>
			)
		}
	];

	return (
		<div className='-mt-1'>
			<Dropdown
				theme={theme}
				overlayStyle={{ marginTop: '20px' }}
				className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-solid border-section-light-container ${
					theme === 'dark' ? 'border-none bg-section-dark-overlay' : isDropdownActive ? 'bg-section-light-container' : 'bg-white'
				}`}
				overlayClassName='z-[1056'
				placement='bottomRight'
				menu={{ items }}
				onOpenChange={() => setIsDropdownActive(!isDropdownActive)}
			>
				<span className='ml-1 mt-1'>
					<ThreeDotsIcon />
				</span>
			</Dropdown>
		</div>
	);
};

export default AddressActionDropdown;
