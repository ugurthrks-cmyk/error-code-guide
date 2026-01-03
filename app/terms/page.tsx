import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Error Code Reference',
  description: 'Terms of Service for Error Code Reference. Read our terms and conditions, including license information, user comments policy, hyperlinking guidelines, and disclaimers.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="prose prose-invert prose-lg max-w-none">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <p className="text-lg text-gray-200 mb-6">
              Welcome to Error Code Reference. These Terms of Service ("Terms") govern your access to and use of our website, services, and content. By accessing or using Error Code Reference, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access or use our services.
            </p>
            <p className="mb-6">
              Please read these Terms carefully before using our website. We reserve the right to update, change, or replace any part of these Terms at any time. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Error Code Reference, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p className="mb-6">
              These Terms apply to all visitors, users, and others who access or use our website. Your use of our website is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily access and use Error Code Reference for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Modify or copy the materials, content, or code examples</li>
              <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
              <li>Attempt to reverse engineer, decompile, or disassemble any software or code used on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Use automated systems, bots, or scrapers to access, collect, or harvest data from our website without express written permission</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Intellectual Property Rights:</strong> All content on Error Code Reference, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, is the property of Error Code Reference or its content suppliers and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="mb-4">
              <strong className="text-white">Limited License for Code Examples:</strong> Code examples provided on our website are intended for educational and reference purposes. You may use code examples in your own projects, but you must ensure compliance with any applicable licenses of third-party libraries or frameworks referenced in those examples. We do not claim ownership of code examples that are based on standard practices or publicly available documentation.
            </p>
            <p className="mb-4">
              <strong className="text-white">Trademarks:</strong> All trademarks, service marks, and trade names of Error Code Reference used on the website are trademarks or registered trademarks of Error Code Reference or its licensors. You may not use, copy, reproduce, republish, upload, post, transmit, distribute, or modify our trademarks in any way without our prior written consent.
            </p>
            <p className="mb-6">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by Error Code Reference at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">User Comments, Feedback, and Submissions</h2>
            <p className="mb-4">
              Error Code Reference may allow users to post comments, feedback, suggestions, ideas, or other submissions ("User Content"). By posting User Content on our website, you grant Error Code Reference a non-exclusive, worldwide, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content throughout the world in any media.
            </p>
            <p className="mb-4">
              <strong className="text-white">User Content Guidelines:</strong> You agree that any User Content you post will:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Be accurate and not misleading</li>
              <li>Not violate any third party's copyright, trademark, patent, trade secret, or other proprietary rights</li>
              <li>Not violate any law, statute, ordinance, or regulation</li>
              <li>Not be defamatory, libelous, threatening, or harassing</li>
              <li>Not contain obscene, pornographic, or otherwise objectionable content</li>
              <li>Not contain viruses, malware, or other harmful code</li>
              <li>Not be used for any commercial purpose or to solicit business</li>
              <li>Not impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Moderation and Removal:</strong> We reserve the right, but not the obligation, to monitor, edit, or remove any User Content at any time and for any reason, without prior notice. We do not assume any responsibility or liability for User Content posted by you or any third party.
            </p>
            <p className="mb-4">
              <strong className="text-white">No Confidentiality:</strong> Any User Content you submit will be considered non-confidential and non-proprietary. By submitting User Content, you represent and warrant that you own or have the necessary rights to grant the license described above, and that your User Content does not violate any applicable laws or the rights of any third party.
            </p>
            <p className="mb-6">
              <strong className="text-white">Indemnification:</strong> You agree to indemnify and hold harmless Error Code Reference, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorneys' fees) arising out of or relating to your User Content or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Hyperlinking to Our Content</h2>
            <p className="mb-4">
              The following organizations may link to our website without prior written approval:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Government agencies</li>
              <li>Search engines</li>
              <li>News organizations</li>
              <li>Online directory distributors when they list us in the directory may link to our website in the same manner as they hyperlink to the websites of other listed businesses</li>
              <li>System-wide accredited businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our website</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Approved Linking:</strong> These organizations may link to our home page, to publications, or to other website information so long as the link:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Is not in any way deceptive</li>
              <li>Does not falsely imply sponsorship, endorsement, or approval of the linking party and its products or services</li>
              <li>Fits within the context of the linking party's site</li>
              <li>Does not contain content that could be considered distasteful, offensive, or controversial</li>
              <li>Is presented in a way that does not damage or take advantage of our reputation</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Linking Restrictions:</strong> We may consider and approve other link requests from the following types of organizations:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Commonly-known consumer and/or business information sources</li>
              <li>Dot.com community sites</li>
              <li>Associations or other groups representing charities</li>
              <li>Online directory distributors</li>
              <li>Internet portals</li>
              <li>Accounting, law, and consulting firms</li>
              <li>Educational institutions and trade associations</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Prohibited Linking:</strong> We will not approve link requests from organizations that:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>We find have an unsatisfactory record with us</li>
              <li>Are not generally known to the public</li>
              <li>Would not be in context with the content of our website</li>
              <li>Would reflect unfavorably on us or our accredited businesses</li>
              <li>Are engaged in activities that are inconsistent with our values or mission</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Framing and Inline Linking:</strong> Without prior approval and written permission, you may not create frames around our web pages or use other techniques that alter in any way the visual presentation or appearance of our website. You may not use inline linking (hotlinking) to link directly to images, files, or other resources hosted on our servers.
            </p>
            <p className="mb-6">
              <strong className="text-white">Requesting Permission:</strong> If you wish to link to our website, please contact us with your request. We reserve the right to approve or deny any link request at our sole discretion. Approved links must comply with all applicable laws and regulations.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">iFrames</h2>
            <p className="mb-4">
              Without prior approval and written permission, you may not create frames around our web pages that alter in any way the visual presentation or appearance of our website. This includes, but is not limited to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Embedding our website or any portion of it within an iframe on another website</li>
              <li>Using inline frames to display our content in a manner that could be misleading or deceptive</li>
              <li>Framing our content in a way that removes or obscures our branding, navigation, or other identifying elements</li>
              <li>Creating frames that make it appear as though our content is part of another website</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Why We Restrict iFrames:</strong> We restrict the use of iframes to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Protect our intellectual property and brand identity</li>
              <li>Prevent unauthorized use of our content in misleading contexts</li>
              <li>Ensure proper attribution and user experience</li>
              <li>Maintain security and prevent clickjacking attacks</li>
              <li>Preserve the integrity of our website's design and functionality</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Exceptions:</strong> We may grant written permission for iframe usage in specific cases, such as:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Educational institutions using our content for instructional purposes</li>
              <li>Authorized partners with whom we have established agreements</li>
              <li>Embedding specific widgets or tools that we have designed for external use</li>
            </ul>
            <p className="mb-6">
              <strong className="text-white">Security Measures:</strong> We implement technical measures, including X-Frame-Options headers, to prevent unauthorized framing of our website. Attempts to circumvent these measures may result in legal action.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Content Liability</h2>
            <p className="mb-4">
              We shall not be held responsible for any content that appears on your website. You agree to protect and defend us against all claims that arise on your website. No link(s) should appear on any website that may be interpreted as libelous, obscene, or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.
            </p>
            <p className="mb-6">
              You agree to indemnify, defend, and hold harmless Error Code Reference, its officers, directors, employees, agents, licensors, and suppliers from and against all losses, expenses, damages, and costs, including reasonable attorneys' fees, resulting from any violation of these Terms or any activity related to your account (including negligent or wrongful conduct) by you or any other person accessing the website using your account.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Disclaimer</h2>
            <p className="mb-4">
              The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, Error Code Reference:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Excludes all representations, warranties, conditions, and terms relating to our website and the use of this website (including, without limitation, any warranties implied by law in respect of satisfactory quality, fitness for purpose, and/or the use of reasonable care and skill)</li>
              <li>Excludes all liability for damages arising out of or in connection with your use of this website, including, without limitation, indirect or consequential loss or damage, loss of data, income, profit, or opportunity, loss of or damage to property, and claims of third parties</li>
              <li>Does not warrant that the website will be available at all times or that the information on the website is complete, accurate, or up-to-date</li>
              <li>Does not guarantee that the website will be free from errors, viruses, or other harmful components</li>
              <li>Does not warrant that defects will be corrected or that the website or the server that makes it available are free of viruses or bugs</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Technical Information Disclaimer:</strong> While we strive to provide accurate and up-to-date information about error codes, APIs, and technical documentation, we cannot guarantee the accuracy, completeness, or timeliness of all information. Error codes, API specifications, and service documentation may change without notice. Always refer to the official documentation from service providers for the most current information.
            </p>
            <p className="mb-4">
              <strong className="text-white">Code Examples Disclaimer:</strong> Code examples provided on our website are for educational and reference purposes only. We do not guarantee that code examples will work in all environments or configurations. You are responsible for testing, validating, and adapting any code examples to your specific use case. We are not liable for any damages resulting from the use of code examples from our website.
            </p>
            <p className="mb-4">
              <strong className="text-white">Third-Party Services Disclaimer:</strong> Our website may contain references to third-party services, products, or websites. We do not endorse, warrant, or assume responsibility for the accuracy, reliability, or availability of any third-party services or information. Your use of third-party services is at your own risk and subject to the terms and conditions of those third parties.
            </p>
            <p className="mb-6">
              <strong className="text-white">Limitation of Liability:</strong> In no event shall Error Code Reference, its directors, officers, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of or inability to use the website, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Prohibited Uses</h2>
            <p className="mb-4">You may not use our website:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>In any way that violates any applicable national or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website</li>
              <li>To introduce viruses, trojans, worms, logic bombs, or other material that is malicious or technologically harmful</li>
              <li>To attempt to gain unauthorized access to, interfere with, damage, or disrupt any part of the website, the server on which the website is stored, or any server, computer, or database connected to the website</li>
              <li>To attack the website via a denial-of-service attack or a distributed denial-of-service attack</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Account Security</h2>
            <p className="mb-4">
              If you create an account on our website, you are responsible for maintaining the security of your account and password. Error Code Reference cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
            </p>
            <p className="mb-6">
              You are responsible for all activities that occur under your account, whether or not you authorized such activities. You must immediately notify us of any unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="mb-6">
              Upon termination, your right to use the website will cease immediately. If you wish to terminate your account, you may simply discontinue using the website. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Governing Law</h2>
            <p className="mb-6">
              These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Changes to Terms of Service</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
            <p className="mb-6">
              What constitutes a material change will be determined at our sole discretion. By continuing to access or use our website after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the website.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
              <p className="mb-2"><strong className="text-white">Error Code Reference</strong></p>
              <p className="text-gray-400">Email: legal@errorcodereference.com</p>
              <p className="text-gray-400 mt-2">Website: <a href="/" className="text-blue-400 hover:text-blue-300 underline">errorcodereference.com</a></p>
            </div>
            <p className="mb-6">
              We will respond to your inquiry within a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Entire Agreement</h2>
            <p className="mb-6">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Error Code Reference regarding your use of our website and supersede all prior and contemporaneous written or oral agreements between you and Error Code Reference.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

