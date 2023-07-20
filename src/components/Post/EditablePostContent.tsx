// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';

import PostContentForm from './PostContentForm';

interface Props {
    className?: string;
    toggleEdit: () => void;
}

const EditablePostContent = ({ className, toggleEdit }: Props) => {
    return (
        <div className={className}>
            <PostContentForm toggleEdit={toggleEdit} />
        </div>
    );
};

export default EditablePostContent;
