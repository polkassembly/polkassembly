// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { LoadingOutlined } from '@ant-design/icons';
import { Modal, Spin } from 'antd';
import React, { FC, useEffect, useState } from 'react';

interface IPostSummaryProps {
    className?: string;
    content?: string;
}

const PostSummary: FC<IPostSummaryProps> = (props) => {
	const { className, content } = props;
	const [open, setOpen] = useState(false);
	const [summary, setSummary] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		(async () => {
			if (content) {
				setLoading(true);
				try {
					const res = await fetch('https://api.openai.com/v1/completions', {
						body: JSON.stringify({
							frequency_penalty: 0.0,
							max_tokens: 256,
							model: 'text-davinci-003',
							presence_penalty: 0.0,
							prompt: `${content}\n\nTl;dr`,
							temperature: 1,
							top_p: 1.0
						}),
						headers: {
							'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
							'Content-Type': 'application/json'
						},
						method: 'POST'
					});
					const data = await res.json();
					if (data && data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
						setSummary(data.choices[0]?.text);
					}
					setLoading(false);
				} catch (error) {
					setLoading(false);
					console.log(error);
				}
			}
		})();
	}, [content]);

	return (
		<section className={className}>
			<button
				onClick={() => setOpen(true)}
				className='border-none outline-none flex items-center justify-center cursor-pointer text-pink_primary bg-transparent font-medium underline underline-offset-2'
			>
                Summarize
			</button>
			<Modal
				open={open}
				onCancel={() => setOpen(false)}
				title='Post Summary'
				footer={false}
			>
				<Spin
					spinning={loading}
					indicator={<LoadingOutlined />}
				>
					<p className='min-h-[100px]'>
						{summary}
					</p>
				</Spin>
			</Modal>
		</section>
	);
};

export default PostSummary;