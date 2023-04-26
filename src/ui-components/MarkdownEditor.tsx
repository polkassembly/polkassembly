// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'react-mde/lib/styles/css/react-mde-all.css';

import React from 'react';
import ReactMde, { Suggestion } from 'react-mde';
import styled from 'styled-components';
import Markdown from './Markdown';
import { IMG_BB_API_KEY } from '~src/global/apiKeys';
import { useUserDetailsContext } from '~src/context';

const StyledTextArea = styled.div`

	textarea {
		border-radius: 0rem;
		border: none!important;
		color: #000000 !important;
		padding: 1rem 1.2rem!important;
		line-height: 1.4!important;
	}

	@media only screen and (max-width: 768px) {
		.react-mde {
			.mde-header {
				.mde-header-group {
					margin-left: 0!important;
					padding: 1rem 0.5rem;
					width: 100%;
					display: flex;
					justify-content: space-between;

					&.hidden {
						visibility: hidden;
						display: none;
					  }

					.mde-header-item {
						button {
							margin: 0;
							padding: 0;
							font-size: 0.85rem!important;
						}
					}
				}

				.mde-tabs {
					margin: 0rem 0rem!important;
					width: 100%;

					button {
						margin: 0 auto;
						width: 48%;
						border-bottom-right-radius: 0!important;
						border-bottom-left-radius: 0!important;

						&.selected {
							border-bottom-color: white !important;
							z-index: 1;
						}
					}
				}
			}
		}
	}

	.react-mde  {
		border-color: #EBF0F5;
		font-size: 0.85rem;

		.grip {
			border-top: none;
			color: #399969;

			.icon {
				margin-bottom: 1rem;
			}
		}

		.mde-header {
			background-color: #EAEEF0;
			border-bottom-style: solid;
			border-bottom-width: 1px;
			border-bottom-color: #EBF0F5;

			.mde-tabs {
				margin: 0rem 0.5rem;

				button {
					font-family: Arial, Helvetica, sans-serif, 'Poppins';
					font-size: 13.5px;
					font-weight: 500;
					padding: 0.6rem 0.8rem;
					color: #000000;
					background: #EAEEF0;
					border-radius: 0.3em;
					border-bottom-color: #EBF0F5;
					margin-bottom: -1px;

					&.selected, &:focus {
						background: white;
						color: #2E2F30;
						padding: 0.2rem 0.8rem;
						border-style: solid;
						border-width: 1px;
						border-color: #EBF0F5;
						outline: none;
						border-bottom-color: white;
						border-bottom-right-radius: 0;
						border-bottom-left-radius: 0;
						margin-bottom: -1px;
					}

					&:hover {
						color: #2E2F30;
					}
				}
			}

			.mde-header-group {
				margin-left: auto;

				.mde-header-item {
					button {
						color: #777B80;
						font-size: 1rem;

						&:hover, &:active, &:focus {
							color: #2E2F30;
						}
					}

					.react-mde-dropdown {
						border-style: solid;
						border-width: 1px;
						border-color: #EBF0F5;
						border-radius: 0.5rem;

						.mde-header-item {

							button {
								p {
									color: #777B80;
								}

								p:hover {
									color: #2E2F30;
								}
							}
						}
					}
				}
			}
		}
	}
`;

interface Props {
	className?: string
	height?: number
	name?: string
	onChange:  ((value: string) => void) | undefined
	value: string
}

function MarkdownEditor(props: Props): React.ReactElement {
	const { id, username } = useUserDetailsContext();

	const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>('write');

	const loadSuggestions = async (text: string) => {
		return new Promise<Suggestion[]>((accept) => {
			const savedUsers = global.window.localStorage.getItem('users');
			const users: string[] = savedUsers ? savedUsers.split(',') : [];

			const suggestions: Suggestion[] = users.map(user => ({
				preview: user,
				value: `[@${user}](${global.window.location.origin}/user/${user})`
			})).filter(i => i.preview.toLowerCase().includes(text.toLowerCase()));

			accept(suggestions);
		});
	};

	// Generator function to save images pasted. This generator should 1) Yield the image URL. 2) Return true if the save was successful or false, otherwise
	const handleSaveImage = async function* (data: any) {
		const imgBlob = new Blob([data], { type: 'image/jpeg' });

		const formData = new FormData();
		formData.append('image', imgBlob, `${id}_${username}_${new Date().valueOf()}.jpg`);

		let url = '';

		await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
			body: formData,
			method: 'POST'
		}).then(response => response.json())
			.then(res => {
				url = res?.data?.display_url;
			})
			.catch(error => console.error('Error in uploading image: ', error));

		// yields the URL that should be inserted in the markdown
		yield url;

		// returns true meaning that the save was successful
		return Boolean(url);
	};

	return (
		<StyledTextArea className='container'>
			<ReactMde
				generateMarkdownPreview={markdown => Promise.resolve(<Markdown isPreview={true} md={markdown} />) }
				minEditorHeight={props.height}
				minPreviewHeight={props.height}
				name={props.name}
				onTabChange={setSelectedTab}
				selectedTab={selectedTab}
				loadSuggestions={loadSuggestions}
				toolbarCommands={[['bold', 'header', 'link', 'quote', 'strikethrough', 'code', 'image', 'ordered-list', 'unordered-list']]}
				{...props}
				paste={{
					saveImage: handleSaveImage
				}}
			/>
		</StyledTextArea>
	);
}

export default MarkdownEditor;