import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Error Code Reference',
  description: 'Privacy Policy for Error Code Reference. Learn how we collect, use, and protect your personal information, including details about cookies, log files, and third-party services.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="prose prose-invert prose-lg max-w-none">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <p className="text-lg text-gray-200 mb-6">
              At Error Code Reference, we are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information. This Privacy Policy explains our practices regarding data collection, usage, and disclosure when you visit and use our website.
            </p>
            <p className="mb-6">
              By accessing and using Error Code Reference, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4">
              We collect several types of information from and about users of our website, including:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong className="text-white">Personal Information:</strong> Information that can be used to identify you, such as your name, email address, or other contact information, if you voluntarily provide it through contact forms or newsletter subscriptions.</li>
              <li><strong className="text-white">Usage Data:</strong> Information about how you access and use our website, including your IP address, browser type, device information, pages visited, time spent on pages, and referring website addresses.</li>
              <li><strong className="text-white">Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar tracking technologies to track activity on our website and store certain information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect for various purposes, including:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>To provide, maintain, and improve our website and services</li>
              <li>To analyze usage patterns and understand how visitors interact with our content</li>
              <li>To personalize your experience and deliver content relevant to your interests</li>
              <li>To communicate with you about updates, changes, or important information regarding our services</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations and enforce our terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Log Files</h2>
            <p className="mb-4">
              Like many websites, Error Code Reference follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Internet Protocol (IP) addresses</li>
              <li>Browser type and version</li>
              <li>Internet Service Provider (ISP) information</li>
              <li>Date and time stamps</li>
              <li>Referring and exit pages</li>
              <li>Number of clicks</li>
              <li>Pages visited and time spent on each page</li>
            </ul>
            <p className="mb-4">
              This information is used to analyze trends, administer the site, track users' movement around the website, and gather demographic information. IP addresses and other such information are not linked to any information that is personally identifiable. The purpose of this information is to improve our website's functionality, understand user preferences, and optimize the user experience.
            </p>
            <p className="mb-6">
              We retain log file data for a reasonable period as necessary for security, fraud prevention, and website optimization purposes. Log files may be stored on secure servers and are protected by industry-standard security measures.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Cookies and Web Beacons</h2>
            <p className="mb-4">
              Error Code Reference uses cookies to store information about visitors' preferences, to record user-specific information on which pages the site visitor accesses or visits, and to personalize or customize our web page content based upon visitors' browser type or other information that the visitor sends via their browser.
            </p>
            <p className="mb-4">
              <strong className="text-white">What are Cookies?</strong> Cookies are small text files that are placed on your computer or mobile device when you visit a website. Cookies are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            <p className="mb-4">
              <strong className="text-white">Types of Cookies We Use:</strong>
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong className="text-white">Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.</li>
              <li><strong className="text-white">Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
              <li><strong className="text-white">Preference Cookies:</strong> These cookies allow our website to remember information that changes the way the website behaves or looks, such as your preferred language or region.</li>
              <li><strong className="text-white">Marketing Cookies:</strong> These cookies are used to track visitors across websites to display relevant advertisements.</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Web Beacons:</strong> We may also use web beacons (also known as pixel tags or clear GIFs) in conjunction with cookies to compile aggregate statistics about website usage and response rates. Web beacons are tiny graphics with a unique identifier, similar in function to cookies, and are used to track online movements of web users.
            </p>
            <p className="mb-6">
              You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, you can find it at the browsers' respective websites. However, please note that disabling cookies may affect the functionality of our website and your ability to access certain features.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Google DoubleClick DART Cookie</h2>
            <p className="mb-4">
              Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">https://policies.google.com/technologies/ads</a>.
            </p>
            <p className="mb-4">
              <strong className="text-white">What is DART?</strong> DART (Dynamic Advertising Reporting and Targeting) is Google's advertising cookie system. It enables Google and its partners to serve ads to users based on their visits to our site and other sites on the Internet.
            </p>
            <p className="mb-4">
              <strong className="text-white">How DART Works:</strong> When you visit our website, Google may set a DART cookie on your browser. This cookie helps Google understand your browsing behavior and interests, allowing them to show you more relevant advertisements. The information collected by DART cookies is used to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Deliver personalized advertisements based on your browsing history</li>
              <li>Measure the effectiveness of advertising campaigns</li>
              <li>Prevent the same ad from being shown to you repeatedly</li>
              <li>Provide advertisers with aggregated, non-personally identifiable information about user interactions with ads</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Your Options:</strong> You can opt out of the use of the DART cookie by visiting Google's Advertising and Privacy page. Additionally, you can opt out of some third-party vendors' uses of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">www.aboutads.info/choices/</a>.
            </p>
            <p className="mb-6">
              Please note that opting out of DART cookies does not mean you will not see advertisements. You will continue to see ads, but they may be less relevant to your interests.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Privacy Policies of Third Parties</h2>
            <p className="mb-4">
              Error Code Reference's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
            </p>
            <p className="mb-4">
              <strong className="text-white">Third-Party Services We Use:</strong>
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong className="text-white">Google Analytics:</strong> We use Google Analytics to understand how visitors use our website. You can opt-out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on. For more information, visit <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google Analytics Opt-out</a>.</li>
              <li><strong className="text-white">Google AdSense:</strong> We may use Google AdSense to display advertisements. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our site and other sites on the Internet. Learn more at <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Google's Privacy & Terms</a>.</li>
              <li><strong className="text-white">Content Delivery Networks (CDNs):</strong> We may use third-party CDN services to deliver content efficiently. These services may collect certain information about your device and network connection.</li>
              <li><strong className="text-white">Hosting Services:</strong> Our website is hosted by third-party hosting providers who may collect server logs and other technical information.</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Links to Other Websites:</strong> Our website may contain links to external websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
            </p>
            <p className="mb-6">
              We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. Your interactions with these third-party services are governed by their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p className="mb-6">
              Our security measures include encryption, secure server configurations, regular security audits, and access controls. We limit access to personal information to employees, contractors, and agents who need to know that information to process it on our behalf and who are subject to strict contractual confidentiality obligations.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Data Retention</h2>
            <p className="mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your personal information, we will securely delete or anonymize it.
            </p>
            <p className="mb-6">
              Log files and analytics data may be retained for longer periods for security, fraud prevention, and website optimization purposes, but this data is typically aggregated and anonymized.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Your Rights and Choices</h2>
            <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong className="text-white">Right to Access:</strong> You have the right to request access to the personal information we hold about you.</li>
              <li><strong className="text-white">Right to Rectification:</strong> You can request correction of inaccurate or incomplete personal information.</li>
              <li><strong className="text-white">Right to Erasure:</strong> You may request deletion of your personal information under certain circumstances.</li>
              <li><strong className="text-white">Right to Object:</strong> You can object to processing of your personal information for certain purposes.</li>
              <li><strong className="text-white">Right to Data Portability:</strong> You may request a copy of your personal information in a structured, machine-readable format.</li>
              <li><strong className="text-white">Cookie Preferences:</strong> You can manage your cookie preferences through your browser settings or our cookie consent banner.</li>
            </ul>
            <p className="mb-6">
              To exercise these rights, please contact us using the information provided at the end of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Children's Privacy</h2>
            <p className="mb-6">
              Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal information from children under 13 without verification of parental consent, we will take steps to remove that information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Consent</h2>
            <p className="mb-4">
              By using our website, you hereby consent to our Privacy Policy and agree to its terms. Your consent is given when you:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Access or browse our website</li>
              <li>Interact with our content, features, or services</li>
              <li>Accept cookies through our cookie consent banner</li>
              <li>Provide personal information through contact forms or other means</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Withdrawing Consent:</strong> You have the right to withdraw your consent at any time. You can withdraw consent by:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Adjusting your browser settings to disable cookies</li>
              <li>Using opt-out mechanisms provided by third-party services</li>
              <li>Contacting us to request deletion of your personal information</li>
              <li>Discontinuing use of our website</li>
            </ul>
            <p className="mb-4">
              <strong className="text-white">Cookie Consent:</strong> When you first visit our website, you may see a cookie consent banner. By clicking "Accept" or continuing to use our website, you consent to our use of cookies as described in this Privacy Policy. You can manage your cookie preferences at any time through your browser settings.
            </p>
            <p className="mb-6">
              Please note that withdrawing consent may affect your ability to use certain features of our website. Some cookies are essential for the website to function properly, and disabling them may limit your access to certain services.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
            <p className="mb-6">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page. Your continued use of our website after any changes to this Privacy Policy constitutes acceptance of those changes.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">International Data Transfers</h2>
            <p className="mb-6">
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ from those in your jurisdiction. If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including personal information, to the United States and process it there. By using our website, you consent to the transfer of your information to the United States.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
              <p className="mb-2"><strong className="text-white">Error Code Reference</strong></p>
              <p className="text-gray-400">Email: privacy@errorcodereference.com</p>
              <p className="text-gray-400 mt-2">Website: <a href="/" className="text-blue-400 hover:text-blue-300 underline">errorcodereference.com</a></p>
            </div>
            <p className="mb-6">
              We will respond to your inquiry within a reasonable timeframe and in accordance with applicable data protection laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

