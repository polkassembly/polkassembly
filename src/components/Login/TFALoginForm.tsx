// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Form, Input } from 'antd';
import React from 'react';
import AuthForm from '~src/ui-components/AuthForm';
import FilteredError from '~src/ui-components/FilteredError';

interface Props {
  className?: string;
  error?: string;
  loading?: boolean;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

const TFALoginForm = ({
  className,
  error,
  loading,
  onSubmit,
  onBack,
}: Props) => {
  return (
    <AuthForm
      onSubmit={onSubmit}
      className={`${className} flex flex-col gap-y-3`}
    >
      <div className="flex flex-col gap-y-1">
        <h1 className="text-sidebarBlue">Two Factor Authentication</h1>
        <p className="text-sidebarBlue">
          Please open the two-step verification app or extension and input the
          authentication code for your Polkassembly account.
        </p>

        {error && <FilteredError className="mt-2 mb-6" text={error} />}

        <label className="text-sm text-[#485F7D] " htmlFor="authCode">
          Authentication Code
        </label>
        <Form.Item
          name="authCode"
          validateTrigger={['onSubmit']}
          rules={[
            {
              message: 'Please provide a valid authentication code.',
              validator(rule, value = '', callback) {
                if (
                  callback &&
                  (!value || value.length !== 6 || isNaN(Number(value)))
                ) {
                  callback(rule?.message?.toString());
                } else {
                  callback();
                }
              },
            },
          ]}
        >
          <Input
            disabled={loading}
            placeholder="######"
            name="authCode"
            id="authCode"
            className="rounded-md py-3 px-4"
          />
        </Form.Item>

        <div className="flex flex-col justify-center items-center gap-y-4">
          <Button
            loading={loading}
            htmlType="submit"
            size="large"
            className="bg-pink_primary w-56 rounded-md outline-none border-none text-white"
          >
            Login
          </Button>

          <Button
            onClick={onBack}
            disabled={loading}
            htmlType="button"
            size="small"
            className="w-56 rounded-md outline-none border-none text-pink_primary"
          >
            Go back
          </Button>
        </div>
      </div>
    </AuthForm>
  );
};

export default TFALoginForm;
