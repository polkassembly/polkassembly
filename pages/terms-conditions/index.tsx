// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { useEffect } from 'react';
import styled from 'styled-components';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useNetworkContext } from '~src/context';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	return { props: { network } };
};

const Wrapper = styled.div`
  width:100%;
  padding:32px;
  background:white;
  border-radius:14px;
`;

const TermAndCondition = (props: any) => {
	const { network } = props;
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (

		<div className='flex flex-col gap-8'>

			<Wrapper>

				<h1 className="mb-4 text-black"> Polkassembly End User Agreement</h1>
				<p>
        Premiurly OÜ is a company registered in Estonia under company number
        16162207 with its registered office at Tornimäe tn 7, Kesklinna
        linnaosa, Tallinn,Harju maakond, 10145 (the Company). The Company
        operates Polkassembly (the Forum) on https://${network}
        .polkassembly.io (the Website).
				</p>
			</Wrapper>
			<Wrapper>
				<h1 className=" mb-4 text-black"> 1. Understanding these terms</h1>
				<p>
        1. This end user agreement (the **Terms**) describes how you may
        access and use the Forum and any services made available through the
        Forum via the Website,any mobile applications made available by the
        Company and any other distribution channels made available by the
        Company (the **Services**). By accessing the Forum, these Terms will
        apply to you and you agree to the Terms. You should therefore read the
        terms carefully before using the forum.</p> <p>2. When certain words and
        phrases are used in these Terms, they have specific meanings (these are
        known as **defined terms**). You can identify these defined terms
        because they start with capital letters (even if they are not at the
        start of a sentence). Where a defined term is used, it has the meaning
        given to it in the section of these Terms where it was defined (you can
        find these meanings by looking at the sentence where the defined term is
        included in brackets and speech marks).</p> <p>3. In this document, when we
        refer to we, us or our, we mean the Company; and when we refer to
        you or your we mean the person accessing or using the person
        accessing or using the Forum.</p> <p>4. Please note that:</p> <p>1.your use of the
        Website is governed by our website terms of use (available https://$
				{network}.polkassembly.io/terms-and-conditions), in the case of any
        inconsistency between any provisions of those website terms of use and
        any of the clauses of this end user agreement, the clauses of this end
        user agreement shall prevail;</p><p> 2.the Website uses cookies, the use of
        which are governed by our cookies policy (available https://premiurly.in/policy/);</p> <p>3.we only use your personal information
        in accordance with our privacy notice (available https://${network}
        .polkassembly.io/privacy)</p>.
			</Wrapper>
			<Wrapper>
				<h1 className=" mb-4 text-black"> 2. The Forum</h1><p>1. The Forum is made available free of charge. We do not guarantee that
        the Forum, or any content on it, will always be available or be
        uninterrupted. Access to the Forum is permitted on a temporary basis. We
        may suspend, withdraw, discontinue or change all or any part of the
        Forum without notice. We will not be liable to you if for any reason the
        Forum is unavailable at any time or for any period. We may update the
        Forum and/or change the content on it at any time. 2. You are
        responsible for making all arrangements necessary for you to have access
        to the Forum. You are also responsible for ensuring that all persons who
        access the Forum through your internet connection are aware of these
        Terms and that they comply with them. 3. The Forum and the content on it
        are provided for general information purposes only. They are not
        intended to amount to advice on which you should rely.</p>

			</Wrapper>

			<Wrapper>
				<h1 className=" mb-4 text-black"> 3. Your account and password</h1><p> 1. You will need to register an account with us on the Website in order
        to use the Services and gain access to the Forum (**Account**). You
        can register via our official website (at https://${network}
        .polkassembly.io/signup). In order to register for an Account, you must
        be aged 18 or over. If you register an Account, you will be asked to
        provide certain information (such as your user name) and to create a
        password, as part of our security procedures. You must treat such
        password as confidential and you must not disclose it to any third
        party.</p><p>2. We have the right to disable any Accounts and/or passwords, at
        any time, if in our reasonable opinion you have failed to comply with
        any of the provisions of these Terms.</p><p>3. If you know or suspect that
        anyone other than you knows your Account login details, you must
        immediately notify us at contact@premiurly.in.</p>
				<p>4. You are responsible
        for any unauthorised use of your Account login details.</p><p>5. If you are
        accepting these Terms on behalf of another legal entity, including a
        business or government, you represent that you have full legal authority
        to bind such entity to these Terms.</p>
			</Wrapper>
			<Wrapper>
				<h1 className=" mb-4 text-black"> 4. Acceptable use</h1>
        General<p>1. You agree 1.not to use the Forum in any unlawful manner, for
        any unlawful purpose or in any manner inconsistent with these Terms; 2.
        not to infringe our intellectual property rights or those of any third
        party in relation to your use of the Forum (to the extent that such use
        if not licensed under these Terms); 3. not to transmit any material that
        is defamatory, offensive or otherwise objectionable in relation to your
        use of the Forum; 4.not to use the Forum by automated means or otherwise
        for the purposes of scraping, extracting or otherwise obtaining any
        material from the Forum for use within a third party website or
        application; 5.not to collect or harvest any information or data from
        our systems or attempt to decipher any transmission to or from the
        servers running the Website ;6.not to copy, or otherwise reproduce or
        re-sell any part of the Forum unless expressly permitted to do so in
        these Terms;7.not to access, query or search the Forum with any
        automated system,other than through our published interfaces and
        pursuant to their applicable terms; and 8.not to create multiple
        accounts to evade punishment or avoid restrictions.</p> User Generated
        Content <p>If it is the case that you supply/upload any content to the
        Forum – whether it be pictures, text, sound recordings or whatever the
        content you supply (**User Generated Content**) must comply with the
        following rules:</p> <p>1. it must not be obscene, abusive, offensive or racist
        and it must not promote or propose hatred or physical harm against
        anyone;</p><p>2. it must not harass, bully, insult or intimidate another
        person;</p> <p>3. it must be true and honest so far as you know;</p> <p>4. it must not
        constitute pornography or be sexual or sexually suggestive involving
        minors;</p> <p>5. it must not be defamatory of anyone;</p><p>6. it must not use the
        material or content or infringe the rights or privacy of anyone else;
        for example you should not use images of well-known characters, footage
        or music (unless it is your own);</p> <p>7. it must not contain someone else’s
        personal details or confidential information relating to other people;</p>
				<p>8. it must not promote discrimination, whether based on race, sex,
        religion, nationality, disability, sexual orientation or age</p><p>9. it must
        not promote or condone terrorism, violence or illegal behaviour;</p> <p>10. it
        must not be harmful to minors in any way; </p><p>11. it must not promote any
        illegal activity or otherwise be unlawful;</p> <p>2. it must not impersonate
        any person, or misrepresent your identity or affiliation with any
        person; and </p> <p>13. it must not give the impression that it emanates from or
        is endorsed by Premiurly, if this is not the case</p>.<p>We reserve the right
        to refuse to accept or refuse or cease to use any User Generated Content
        supplied by any person that we think contravenes these Terms or
        otherwise may create liability for us.3.We take no responsibility for,
        and we do not expressly or implicitly endorse, any User Generated
        Content. By submitting your User Generated Content, you represent and
        warrant that you have all rights, power and authority necessary to grant
        the rights to such User Generated Content as set out in these Terms. As
        you alone are responsible for your User Generated Content, you may
        expose yourself to liability if you post or share User Generated Content
        without all necessary rights. 4.We do not oversee, monitor or moderate
        any User Generated Content which is uploaded to the Forum. If you become
        aware of any User Generated Content that breaches clause 4.2 above,
        please use the report button or contact us on contact@premiurly.in,
        providing details of: (i) the date on which it was posted and where it
        can be found on the Forum; (ii) the name and surname of the author or,
        if the author is a legal person, the authors business name; (iii)
        reasons why the content should be deleted; and (vi) copies of any
        communication with the author (if any).</p>  Viruses 1.<p> We do not guarantee
        that the Website will be totally secure or free from bugs or viruses.
        You are responsible for configuring your information technology,
        computer programmes and platform in order to access the Website and we
        recommend that you use your own virus protection software. 2. You must
        not misuse the Website by knowingly introducing viruses, trojans, worms,
        logic bombs or other material which is malicious or technologically
        harmful. You must not attempt to gain unauthorised access to the
        Website, the server on which the Website is stored or any server,
        computer or database connected to the Website. You must not attack the
        Website via a denial-of-service attack or a distributed denial-of
        service attack. By breaching this provision, you would commit criminal
        offences. We will report any such breach to the relevant law enforcement
        authorities and we will cooperate with those authorities by disclosing
        your identity to them. In the event of such a breach, your right to use
        the Website will cease immediately.</p>
			</Wrapper>

			<Wrapper>
				<h1 className=" mb-4 text-black"> 5. Intellectual property</h1>
				<p> 1. We grant to you a non-transferable, non-exclusive, revocable licence
        to use the Forum provided that you comply with these Terms and the
        documents referred to in it. We reserve all other rights.</p>
				<p>2. We are the
        owner or licensee of all intellectual property rights in the Forum and
        its content (other than the User Generated Content), including the
        Premiurly name and mark. Those works are protected by intellectual
        property laws and treaties around the world. All such rights are
        reserved.</p> <p>3. You are not granted any right to use, and may not use, any
        of our intellectual property rights other than as set out in these
        Terms. You must not commercially exploit the Forum (or any part of it or
        its content); however, you may download material from the Forum solely
        for internal, non-commercial, personal use by you.</p>  <p>4. Save as required
        by applicable law, you shall not copy, reproduce, republish, upload,
        re-post, modify, transmit, distribute or otherwise use in any way for
        any non-personal, public or commercial purpose any part of the Forum
        including (without limitation) the text, designs, graphics, photographs,
        images and User Generated Content of other users without our prior
        written consent and (in the case of User Generated Content of a
        different user) the prior written consent of that user.</p> <p>5. You retain
        all ownership rights you have in the User Generated Content, but you
        hereby grant to us a perpetual, transferable, royalty-free license,
        irrevocable, worldwide, sub-licensable license to use, copy, modify,
        adapt, prepare derivative works from, distribute, perform and display
        your User Generated Content and any name, username, voice or likeness
        provided in connection with your User Generated Content in all media
        formats and channels now known or later developed. This license includes
        the right for us to make your User Generated Content available for
        syndication, broadcast, distribution or publication by other companies,
        organisations or individuals who partner with us. You also agree that we
        may remove metadata associated with your User Generated Content, and you
        irrevocable waive any claims and assertions of moral rights or
        attribution with respect to your User Generated Content.</p>
			</Wrapper>
			<Wrapper>
				<h1 className=" mb-4 text-black"> 6. Our liability</h1>
				<p>  1. Nothing in these Terms excludes or limits our liability for: </p>
				<p>1. death
        or personal injury caused by our negligence; </p><p>2. fraud or fraudulent
        misrepresentation; and</p> <p>3. any matter in respect of which it would be
        unlawful for us to exclude or restrict our liability.</p> <p> 2. We assume no
        responsibility for the content of websites, web applications or mobile
        applications linked to from the Forum (including links to any third
        party browser extensions providing voting functionality or notification
        facilities or links to our commercial sponsors and partners). Such links
        should not be interpreted as endorsement by us of those linked websites
        or mobile applications. We will not be liable for any loss or damage
        that may arise from your use of them</p><p>3. We make no representations
        about the reliability, availability, timeliness or accuracy of the
        content included on the Forum.</p> <p>If you are a business</p> <p>If you are acting
        for purposes relating to your trade, business, craft or profession, then
        subject to clause 6.1:you agree to use the Forum for internal purposes
        only and in no event shall we be liable to you for any loss of profits,
        loss of revenue, loss of contracts,failure to realise anticipated
        savings or for any indirect or consequential loss, whether arising from
        negligence, breach of contract or otherwise; and our total liability to
        you for any loss or damage arising out of or in connection with these
        Terms, whether in contract (including under any indemnity), tort
        (including negligence) or otherwise shall be limited to EUR 100.</p> <p>You
        shall indemnify and hold us harmless against any losses, costs,
        liabilities and expenses suffered or incurred by us and/or our
        affiliates as a result of any breach of these Terms.</p> <p> If you are a
        consumer </p> <p>If you are acting for purposes that are wholly or mainly
        outside your trade, business, craft or profession then, save as set out
        in clause 6.1, the following sub-clauses apply. 1.If we fail to comply
        with these Terms, we are responsible for loss or damage you suffer that
        is a foreseeable result of our breach of these Terms or our
        negligence,but we are not responsible for any loss or damage that is not
        foreseeable. Loss or damage is foreseeable if it was an obvious
        consequence of our breach or if it was contemplated by you and us at the
        time that you accessed the Forum 2. Our total liability to you for any
        loss or damage arising out of or in connection with these Terms, whether
        in contract (including under any indemnity), tort (including negligence)
        or otherwise shall be limited to EUR 100 3.Nothing in these Terms
        affects your statutory rights. Advice about your statutory rights is
        available from your local Citizens Advice Bureau or Trading Standards
        Office.4 You agree not to use the Forum,or any content on the Forum, for
        any commercial or business purposes and we have no liability to you for
        any loss of profit, loss of business, business interruption, or loss of
        business opportunity.</p>
			</Wrapper>
			<Wrapper>
				<h1 className=" mb-4 text-black"> 7. Suspension and termination</h1>
				<p>1. Either you or we may terminate these Terms (and your access to Forum)
        at any time for any reason.</p><p>2. If you breach any of the terms of these
        Terms, we may immediately do any or all of the following (withoutlimitation):</p> <p>1. issue a warning to you; </p><p>3.
        temporarily or permanently withdraw your right to use the Forum</p><p>4.suspend or terminate your Account;</p> <p>5. issue legal proceedings against
        you for reimbursement of all costs resulting from the breach (including, but not limited to, reasonable administrative and legal costs);</p> <p>6. take
        further legal action against you; and/or</p> <p>7. disclose such information to law enforcement authorities as we reasonably feel is necessary to do so.</p>
				<p>3. If we withdraw your right to use the Forum, then:</p><p> 1. all rights granted to you under these Terms shall cease;</p><p>2. you must immediately cease all activities authorised by these Terms, including your use of any services provided through the Forum.</p>
			</Wrapper>
			<Wrapper>
				<h1 className=" mb-4 text-black"> 8. Changes to these Terms</h1>
				<p>
        We may make changes to these terms from time to time (if, for example,
        there is a change in the law that means we need to change these
        Terms).We will give you at least thirty days advance notice of such
        changes. If you do not wish to continue using the Forum following the
        changes, you can cancel your agreement to these Terms by cancelling your
        Account. Your continued use of the Forum following the prior
        notification of the amended terms will be understood as your acceptance
        of the new terms.</p>
			</Wrapper>
			<Wrapper>
				<h1 className=" mb-4 text-black"> 9. Other important information</h1>
				<p> 1. Each of the clauses of these Terms operates separately. If any court
        or relevant authority decides that any of them are unlawful or
        unenforceable, the remaining clauses will remain in full force and
        effect.</p>
				<p>2. If we fail to insist that you perform any of your obligations
        under these Terms, or if we do not enforce our rights against you, or if
        we delay in doing so, that will not mean that we have waived our rights
        against you and will not mean that you do not have to comply with those
        obligations.If we do waive a default by you, we will only do so in
        writing, and that will not mean that we will automatically waive any
        later default by you.</p> <p>3. If you wish to have more information on online
        dispute resolution, please follow this link to the website of the
        European Commission: [http://ec.europa.eu/consumers/odr/]. This link is
        provided as required by Regulation (EU) No 524/2013 of the European
        Parliament and of the Council, for information purposes only. We are not
        obliged to participate in online dispute resolution.</p>
			</Wrapper>
			<Wrapper>
				<h1 className=" mb-4 text-black"> 10. Governing law and jurisdiction</h1>
        If you are a business <p>These Terms are governed by Estonian law. This
        means that your access to and use of the Forum, and any dispute or claim
        arising out of or in connection therewith will be governed by Estonian
        law.</p><p>The courts of Estonia will have non-exclusive jurisdiction over
        any disputes between us and you (including non-contractual disputes or
        claims). </p> If you are a consumer <p>1. These Terms are governed by the laws
        of Estonia. This means that your access to and use of the Forum, and any
        dispute or claim arising out or in connection therewith (including
        non-contractual disputes or claims), will be governed by Estonian law.</p>
				<p>You may bring any dispute which may arise under these Terms to – at
        your discretion - either the competent court of Estonia, or to the
        competent court of your country of habitual residence if this country of
        habitual residence is an EU Member State, which courts are – with the
        exclusion of any other court - competent to settle any of such a
        dispute. We shall bring any dispute which may arise under these Terms to
        the competent court of your country of habitual residence if this is in
        an EU Member State, or otherwise the competent court of Estonia.</p><p>As a
        consumer, if you are resident in the European Union and we direct the
        Forum to (and/or pursue our commercial or professional activities in
        relation to the Forum in) the EU Member State in which you are resident,
        you will benefit from any mandatory provisions of the law of the country
        in which you are resident. Nothing in these Terms, including clause
        10.3, affects your rights as a consumer to rely on such mandatory
        provisions of local law.</p>
			</Wrapper>
			<Wrapper>

				<h1 className=" mb-4 text-black"> 11. Contacting us</h1>
				<p> Should you have any reasons for a complaint, we will endeavour to
        resolve the issue and avoid any re-occurrence in the future.You can
        always contact us by using the following details:</p> <p>Address: Tornimäe tn
        7, Kesklinna linnaosa, Tallinn, Harju maakond, 10145</p><p> Email address:
        contact@premiurly.in</p>
			</Wrapper>
			<Wrapper>
				<p>Thank you.</p>

				<p>Terms last updated 27th August 2020</p>
			</Wrapper>

		</div>
	);
};
export default TermAndCondition;
