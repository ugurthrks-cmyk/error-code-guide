import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Error Code Reference',
  description: 'Learn about Error Code Reference - a comprehensive free resource dedicated to helping developers solve cloud and HTTP errors quickly. Our mission is to be the most complete error code reference available.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="prose prose-invert prose-lg max-w-none">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">About Us</h1>
        <p className="text-gray-400 text-sm mb-8">Learn more about Error Code Reference and our mission</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <p className="text-lg text-gray-200 mb-6">
              Welcome to <strong className="text-white">Error Code Reference</strong>, a project dedicated to helping developers solve cloud and HTTP errors quickly and efficiently. We understand the frustration that comes with encountering cryptic error codes, and our mission is to make troubleshooting as straightforward as possible.
            </p>
            <p className="mb-6">
              In today's fast-paced development environment, time spent debugging errors is time taken away from building great products. That's why we've created this comprehensive resource to help you understand, diagnose, and resolve errors across multiple platforms and services.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Our Mission</h2>
            <p className="mb-4">
              Error Code Reference aims to be the <strong className="text-white">most comprehensive free resource</strong> for developers working with HTTP status codes and cloud provider error codes. We believe that access to clear, actionable error documentation should be available to everyone, regardless of their experience level or budget.
            </p>
            <p className="mb-6">
              Our goal is to provide detailed explanations, step-by-step troubleshooting guides, and practical code examples that help you resolve issues quickly. Whether you're dealing with AWS, Azure, GCP, or standard HTTP errors, we want to be your first stop for reliable, easy-to-understand information.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">What We Offer</h2>
            <p className="mb-4">Error Code Reference provides:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong className="text-white">Comprehensive Error Documentation:</strong> Detailed explanations of error codes from major cloud providers (AWS, Azure, GCP) and HTTP status codes</li>
              <li><strong className="text-white">Step-by-Step Solutions:</strong> Clear troubleshooting guides that walk you through resolving common issues</li>
              <li><strong className="text-white">Code Examples:</strong> Practical, ready-to-use code snippets in multiple languages to help you implement fixes quickly</li>
              <li><strong className="text-white">Common Causes:</strong> Insight into the most frequent reasons errors occur, helping you understand the root cause</li>
              <li><strong className="text-white">Related Error Codes:</strong> Connections between related errors to help you understand the bigger picture</li>
              <li><strong className="text-white">Free Access:</strong> All our content is completely free and accessible to developers worldwide</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Why We Built This</h2>
            <p className="mb-4">
              As developers ourselves, we've experienced the pain of searching through multiple documentation sites, Stack Overflow threads, and forum posts just to understand what an error code means and how to fix it. We've seen how scattered information can slow down development and increase frustration.
            </p>
            <p className="mb-6">
              Error Code Reference was born from the need for a centralized, reliable resource that brings together error information from different sources in one easy-to-navigate platform. We've done the research so you don't have to, compiling the most important information about each error code in a format that's easy to understand and act upon.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Our Commitment</h2>
            <p className="mb-4">
              We are committed to maintaining and continuously improving Error Code Reference. This includes:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Regularly updating error documentation as services evolve</li>
              <li>Adding new error codes and providers as they become relevant</li>
              <li>Improving explanations based on community feedback</li>
              <li>Ensuring code examples remain current and functional</li>
              <li>Keeping the platform free and accessible to all developers</li>
            </ul>
            <p className="mb-6">
              We believe in the power of open knowledge and the developer community. By providing this resource for free, we hope to contribute to a more efficient and collaborative development ecosystem.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Coverage</h2>
            <p className="mb-4">
              Currently, Error Code Reference covers error codes from:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong className="text-white">HTTP Status Codes:</strong> Standard HTTP response codes (1xx, 2xx, 3xx, 4xx, 5xx) with detailed explanations</li>
              <li><strong className="text-white">Amazon Web Services (AWS):</strong> Comprehensive coverage of AWS service errors, exceptions, and status codes</li>
              <li><strong className="text-white">Microsoft Azure:</strong> Azure service error codes and troubleshooting information</li>
              <li><strong className="text-white">Google Cloud Platform (GCP):</strong> GCP error codes and resolution guides</li>
            </ul>
            <p className="mb-6">
              We're constantly expanding our coverage to include more providers and error types. If you'd like to see a specific provider or error code added, please <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">contact us</a>.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">How to Use This Site</h2>
            <p className="mb-4">
              Error Code Reference is designed to be intuitive and easy to navigate:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong className="text-white">Browse by Provider:</strong> Navigate to specific providers (HTTP, AWS, Azure, GCP) to see all available error codes</li>
              <li><strong className="text-white">Search Functionality:</strong> Use the search bar to quickly find specific error codes or keywords</li>
              <li><strong className="text-white">Detailed Error Pages:</strong> Each error code has its own dedicated page with comprehensive information</li>
              <li><strong className="text-white">Code Examples:</strong> Copy and adapt code examples directly from our pages</li>
            </ul>
            <p className="mb-6">
              Whether you're a beginner just starting out or an experienced developer looking for a quick reference, Error Code Reference is here to help you solve problems faster.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Get Involved</h2>
            <p className="mb-4">
              Error Code Reference is a community-driven project. We welcome feedback, suggestions, and contributions from developers around the world. If you:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Find an error in our documentation</li>
              <li>Have suggestions for improvements</li>
              <li>Want to report a missing error code</li>
              <li>Have feedback on code examples or explanations</li>
            </ul>
            <p className="mb-6">
              Please don't hesitate to <a href="/contact" className="text-blue-400 hover:text-blue-300 underline">reach out to us</a>. Your input helps us make Error Code Reference better for everyone.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mt-8 mb-4">Thank You</h2>
            <p className="mb-6">
              Thank you for using Error Code Reference. We hope this resource saves you time and helps you build better software. If you find our content helpful, please consider sharing it with other developers who might benefit from it.
            </p>
            <p className="mb-6">
              Happy coding, and may your errors be few and easily resolved!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

