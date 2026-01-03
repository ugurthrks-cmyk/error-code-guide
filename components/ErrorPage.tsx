import { ErrorCode } from '@/lib/errors';
import CodeBlock from './CodeBlock';
import Link from 'next/link';

interface ErrorPageProps {
  errorCode: ErrorCode;
  provider: string;
  code: string;
}

export default function ErrorPage({ errorCode, provider, code }: ErrorPageProps) {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 text-sm font-mono font-semibold">
            {provider.toUpperCase()}
          </span>
          <h1 className="text-4xl font-bold text-white">
            {code} - {errorCode.name}
          </h1>
        </div>
        <p className="text-xl text-gray-300 leading-relaxed">
          {errorCode.description}
        </p>
      </header>

      {/* Common Causes */}
      {errorCode.causes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">#</span>
            Common Causes
          </h2>
          <ul className="space-y-2">
            {errorCode.causes.map((cause, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-300 pl-4 border-l-2 border-gray-800 hover:border-blue-500/50 transition-colors"
              >
                <span className="text-blue-400 mt-1">→</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Solutions */}
      {errorCode.solutions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">✓</span>
            Solutions
          </h2>
          <ol className="space-y-3">
            {errorCode.solutions.map((solution, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-300 pl-4"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span>{solution}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Code Examples */}
      {errorCode.codeExamples.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">{'</>'}</span>
            Code Examples
          </h2>
          <div className="space-y-6">
            {errorCode.codeExamples.map((example, index) => (
              <div key={index}>
                <CodeBlock
                  code={example.code}
                  language={example.language}
                  title={example.title}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Errors */}
      {errorCode.relatedCodes && errorCode.relatedCodes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">↗</span>
            Related Errors
          </h2>
          <div className="flex flex-wrap gap-2">
            {errorCode.relatedCodes.map((relatedCode) => (
              <Link
                key={relatedCode}
                href={`/errors/${provider}/${relatedCode}`}
                className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-sm font-mono"
              >
                {relatedCode}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Provider Info */}
      <section className="mt-12 p-6 rounded-lg bg-gray-900/50 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-2">
          Provider Information
        </h3>
        <p className="text-gray-400 text-sm">
          This error code is specific to <strong className="text-white">{provider.toUpperCase()}</strong> services.
          For more information, refer to the official {provider.toUpperCase()} documentation.
        </p>
      </section>
    </article>
  );
}


