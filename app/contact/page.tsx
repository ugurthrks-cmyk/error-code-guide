import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Error Code Reference',
  description: 'Get in touch with Error Code Reference. Have questions, found a bug, or want to suggest improvements? Contact us and we\'ll get back to you as soon as possible.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="prose prose-invert prose-lg max-w-none">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center">Contact Us</h1>
        <p className="text-gray-400 text-sm mb-12 text-center">We'd love to hear from you</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="text-center">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 md:p-12 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Have questions or found a bug?
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                We're here to help! Whether you have a question about an error code, found an issue with our documentation, or want to suggest an improvement, we'd love to hear from you.
              </p>
              <p className="text-gray-400 mb-8">
                Send us an email and we'll get back to you as soon as possible.
              </p>
              <div className="flex justify-center">
                <a
                  href="mailto:info@errorreference.com?subject=Contact from Error Code Reference"
                  className="inline-flex items-center px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  info@errorreference.com
                </a>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">What can we help you with?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Report a Bug</h3>
                <p className="text-gray-400">
                  Found an error in our documentation or a broken link? Let us know and we'll fix it as soon as possible.
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Suggest an Error Code</h3>
                <p className="text-gray-400">
                  Know of an error code that's missing from our database? We're always looking to expand our coverage.
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Ask a Question</h3>
                <p className="text-gray-400">
                  Have a question about a specific error code or need clarification on our documentation? We're here to help.
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-3">Provide Feedback</h3>
                <p className="text-gray-400">
                  Your feedback helps us improve. Share your thoughts on how we can make Error Code Reference better.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 text-center">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Response Time</h2>
              <p className="text-gray-300 mb-2">
                We typically respond to all inquiries within <strong className="text-white">24-48 hours</strong>.
              </p>
              <p className="text-gray-400 text-sm">
                For urgent matters, please include "URGENT" in your email subject line.
              </p>
            </div>
          </section>

          <section className="mt-12 text-center">
            <p className="text-gray-400">
              Thank you for using Error Code Reference. We appreciate your support and feedback!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

