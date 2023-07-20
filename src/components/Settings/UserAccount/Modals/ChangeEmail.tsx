// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { Button, Divider, Form, Input, Modal } from 'antd';
import ChangeEmailIcon from '~assets/icons/change-email.svg';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import messages from '~src/util/messages';

const ChangeEmail = ({
  open,
  onConfirm,
  onCancel,
  email,
}: {
  open: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
  email: string;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const handleClick = async () => {
    try {
      const values = await form.validateFields();
      const { newEmail } = values;
      setLoading(true);
      const { data, error } = await nextApiClientFetch<any>(
        'api/v1/auth/actions/sendVerificationEmail',
        {
          email: newEmail,
        },
      );
      if (error) {
        queueNotification({
          header: 'Failed!',
          message: error,
          status: NotificationStatus.ERROR,
        });
      }
      if (data) {
        queueNotification({
          header: 'Success!',
          message: 'Verification Email Sent.',
          status: NotificationStatus.SUCCESS,
        });
        form.resetFields();
        onCancel();
      }
      setLoading(false);
    } catch (error) {
      console.log('Validation error:', error);
      setLoading(false);
      queueNotification({
        header: 'Failed!',
        message: error,
        status: NotificationStatus.ERROR,
      });
    }
  };
  return (
    <Modal
      title={
        <div className="mr-[-24px] ml-[-24px] text-[#243A57]">
          <h3 className="ml-[24px] mb-0 flex items-center gap-2 text-base md:text-md">
            <ChangeEmailIcon /> Change your email
          </h3>
          <Divider />
        </div>
      }
      open={open}
      closable
      className="min-w-[350px] md:min-w-[600px]"
      onCancel={onCancel}
      onOk={onConfirm}
      footer={null}
    >
      <div className="flex gap-[10px] flex-wrap items-center">
        <Form
          onFinish={handleClick}
          form={form}
          className="flex flex-col gap-6 w-full"
        >
          {Boolean(email) && (
            <Form.Item name="old-email" className="m-0 w-full min-w-[250px]">
              <label htmlFor="old-email">Old Email</label>
              <Input
                className="p-2 text-sm leading-[21px]"
                value={email}
                disabled
              />
            </Form.Item>
          )}
          <div>
            <label htmlFor="new-email">New Email</label>
            <Form.Item
              name={'newEmail'}
              className="m-0 w-full min-w-[250px]"
              rules={[
                {
                  message: messages.VALIDATION_EMAIL_ERROR,
                  required: true,
                  type: 'email',
                },
              ]}
            >
              <Input
                disabled={loading}
                className="p-2 text-sm leading-[21px]"
                placeholder="Enter your email"
              />
            </Form.Item>
          </div>
          <div>
            <div className="mr-[-24px] ml-[-24px]">
              <Divider className="my-4 mt-0" />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                key="1"
                onClick={onCancel}
                className="h-10 rounded-[6px] bg-[#FFFFFF] border border-solid border-pink_primary px-[36px] py-[4px] text-pink_primary font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize"
              >
                Cancel
              </Button>
              <Button
                loading={loading}
                htmlType="submit"
                className="h-10 rounded-[6px] bg-[#E5007A] border border-solid border-pink_primary px-[36px] py-[4px] text-white font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize"
              >
                Save
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ChangeEmail;
