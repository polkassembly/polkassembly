// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

const container = (content: string): string => `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style type="text/css">
                body, p, div {
                    font-family: arial,helvetica,sans-serif;
                    font-size: 14px;
                    color: #000000;
                }
                body a {
                    color: #1188E6;
                    text-decoration: none;
                }
                p { margin: 0; padding: 0; }
                .polk-container {
                    margin: 0 auto;
                    max-width: 600px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 10px;
                    text-align: center;
                    color: #313638;
                }
            </style>
        </head>
        <body>
            <div class="polk-container">
                ${content}
            </div>
            <div class="footer">
                Registered Address: Premiurly, Tornimae tn 7, Kesklinna linnaosa, Tallinn, 10145, Estonia<br />
                <a target="_blank" href="https://premiurly.in/policy/privacy-policy/">Privacy Policy</a>
            </div>
        </body>
    </html>
`;

export const verificationEmailTemplate = container(`
    <p>
        Welcome aboard <%= username %>!<br/><br/>

        For security purposes, please confirm your email address here - <a target="_blank" href="<%= verifyUrl %>">verify your account</a><br/><br/>

        See you soon,<br/><br/>

        Polkassembly Team
    </p>
`);

export const resetPasswordEmailTemplate = container(`
    <p>
        Hi!<br/><br/>

        The username association with this email is <%= username %><br /><br />

        If you need to reset your password, go ahead and follow this link:<br /><br />
        <a href="<%= resetUrl %>">Reset Your Password</a><br /><br />

        Just a heads up, to make sure your information is safe and secure, the above link will expire after 24 hours.<br /><br />

        If you didn't request a password change, then just ignore this message.<br /><br />

        Polkassembly Team
    </p>
`);

export const postSubscriptionMailTemplate = container(`
    <p>
        Hi <%= username %>!<br/><br/>

        <br />
        <a href="<%= domain %>/user/<%= authorUsername %>"><%= authorUsername %></a> has commented on a post you subscribed to: <a href="<%= commentUrl %>"><%= commentUrl %></a>.<br /><br />

        comment: <%- content %><br /><br />

        You can deactivate this notification in your notification settings: <a href="<%= domain %>/notification-settings"><%= domain %>/notification-settings</a><br /><br />

        Polkassembly Team
    </p>
`);

export const commentMentionEmailTemplate = container(`
    <p>
        Hi <%= username %>!<br/><br/>

        <br />
        <a href="<%= domain %>/user/<%= authorUsername %>"><%= authorUsername %></a> has mentioned you in comment: <a href="<%= commentUrl %>"><%= commentUrl %></a>.<br /><br />

        comment: <%- content %><br /><br />

        You can deactivate this notification in your notification settings: <a href="<%= domain %>/notification-settings"><%= domain %>/notification-settings</a><br /><br />

        Polkassembly Team
    </p>
`);

export const commentReplyEmailTemplate = container(`
    <p>
        Hi <%= username %>!<br/><br/>

        <br />
        <a href="<%= domain %>/user/<%= authorUsername %>"><%= authorUsername %></a> has replied to your comment: <a href="<%= commentUrl %>"><%= commentUrl %></a>.<br /><br />

        reply: <%- content %><br /><br />

        You can deactivate this notification in your notification settings: <a href="<%= domain %>/notification-settings"><%= domain %>/notification-settings</a><br /><br />

        Polkassembly Team
    </p>
`);

export const undoEmailChangeEmailTemplate = container(`
    <p>
        Hi <%= username %>!<br/><br/>

        Your email on polkassembly.io was changed to <%= userEmail %>.<br />
        If you did the change, then everything is fine, you have nothing to do.<br /><br />

        If you did not change your email and suspect that it is a malicious attempt, click on the following link to change your account email back to: <%= undoEmail %><br /><br />
        <a href="<%= undoUrl %>">Recover Your Email</a><br /><br />

        This link is valid for 48 hours, past this time, you will not be able to use it to recover your email. If you did not have time to click it and are a victim of a malicious email change, please open an issue on https://github.com/paritytech/polkassembly/issues/new<br /><br />

        Polkassembly Team
    </p>
`);

export const ownProposalCreatedEmailTemplate = container(`
    <p>
        Hi <%= username %>!<br/><br/>

        You have submitted a <%= type %> on chain.<br />
        Click on the following link to login to Polkassembly and edit the proposal/motion description and title: <a href="<%= postUrl %>"><%= postUrl %></a>.<br /><br />

        You can deactivate this notification in your notification settings: <a href="<%= domain %>/notification-settings"><%= domain %>/notification-settings</a><br /><br />

        Polkassembly Team
    </p>
`);

export const newProposalCreatedEmailTemplate = container(`
    <p>
        Hi <%= username %>!<br/><br/>

        There is a new <%= type %> on chain.<br />
        Click on the following link to check it out: <a href="<%= postUrl %>"><%= postUrl %></a>.<br /><br />

        You can deactivate this notification in your notification settings: <a href="<%= domain %>/notification-settings"><%= domain %>/notification-settings</a><br /><br />

        Polkassembly Team
    </p>
`);

export const ownGovernanceV2ReferendaCreatedEmailTemplate = container(`
    <p>
        Hi <%= username %>!<br/><br/>

        You have submitted a Governance v2 Referendum on chain.<br />
        Click on the following link to login to Polkassembly and edit the referendaum's description and title: <a href="<%= postUrl %>"><%= postUrl %></a>.<br /><br />

        You can deactivate this notification in your notification settings: <a href="<%= domain %>/notification-settings"><%= domain %>/notification-settings</a><br /><br />

        Polkassembly Team
    </p>
`);

export const newGovernanceV2CreatedEmailTemplate = container(`
    <p>
        Hi <%= username %>!<br/><br/>

        There is a new Governance v2 Referendum created on chain.<br />
        Click on the following link to check it out: <a href="<%= postUrl %>"><%= postUrl %></a>.<br /><br />

        You can deactivate this notification in your notification settings: <a href="<%= domain %>/notification-settings"><%= domain %>/notification-settings</a><br /><br />

        Polkassembly Team
    </p>
`);

export const reportContentEmailTemplate = container(`
    <p>
        Content Reported.<br />
        Reporter: <%= username %><br />
        Network: <%= network %><br />
        Reason:<br />
        <%= reason %> <br />
        Comments:<br />
        <%= comments %> <br />
        Report type: <%= reportType %> <br />
        id: <%= contentId %> <br />
    </p>
`);

export const transferNoticeEmailTemplate = container(`
    Dear Polkassembly User<br /><br />

    Polkassembly is to be acquired by Premiurly OÜ on 20 July 2021 and as of that date the Polkassembly database will be migrated from Parity Technologies to Premiurly OÜ. Premiurly OÜ is an independent organization that received a Web3 Foundation grant to improve and maintain Polkassembly.<br /><br />

    As part of this change your details will be shared with Premiurly OÜ.<br /><br />

    If you would like information on how Premiurly OÜ will process your personal data, you can find this in their Privacy and Personal Data Policy <a href="https://premiurly.in/policy/privacy-policy/">here</a>. If you do not consent to the transfer of your personal data as part of this migration, you have until August 20th, 2021 to delete your Polkassembly account by going to https://polkadot.polkassembly.io/settings#deleteAccount and pressing the "Delete My Account" button, thereby ensuring that your data will not be transferred.<br /><br />

    Why is this change taking place?<br /><br />

    As Parity Technologies is a software engineering company, maintaining a forum is not part of its core business. Additionally, in the interest of decentralization, and given that Parity Technologies developed the initial implementation of Polkadot and Kusama, the community will be better served with an independent entity stewarding this vital resource. Premiurly OÜ received a Web3 Foundation grant specifically for this purpose, including the deployment of Polkassembly to their own infrastructure.<br />
    For details on your data protection rights see the <a href="https://premiurly.in/policy/privacy-policy/">Polkassembly Privacy Notice</a>. Should you have any queries, please contact polkassembly@parity.io.<br /><br />

    Parity Technologies Limited
`);

export const transferNoticeMistakeEmailTemplate = container(`
    Dear Polkassembly Users<br /><br />

    Due to a technical mistake, our previous email didn't contain a correct link to Polkassembly account deletion. The correct link to do so is https://kusama.polkassembly.io/settings#deleteAccount<br /><br />
`);

export const spamCommentReportTemplate = container(`
    <p>
       Spam Reported.<br />

        <br />
        Comment <a href="<%= commentUrl %>"><%= commentUrl %></a>. is reported as spam.<br/>
        Network: <%= network %><br />
        Post ID: <%= postId %><br />
        Post Type: <%= postType %><br />
        Comment ID: <%= commentId %><br /> <br/>
        
        Polkassembly Team
    </p>
`);

export const spamReplyReportTemplate = container(`
    <p>
       Spam Reported.<br />

        <br />
        Reply on Comment <a href="<%= commentUrl %>"><%= commentUrl %></a>. is reported as spam.<br/>
        Network: <%= network %><br />
        Post ID: <%= postId %><br />
        Post Type: <%= postType %><br />
        Comment ID: <%= commentId %><br /> <br/>
        Reply ID: <%= replyId %><br /> <br/>
        
        Polkassembly Team
    </p>
`);

export const spamPostReportTemplate = container(`
    <p>
       Spam Reported.<br />

        <br />
        Post <a href="<%= postUrl %>"><%= postUrl %></a>. is reported as spam.<br/>
        Network: <%= network %><br />
        Post ID: <%= postId %><br />
        Post Type: <%= postType %><br />
        
        Polkassembly Team
    </p>
`);
