export type ErrorProvider = 'http' | 'aws' | 'azure' | 'gcp';

export interface ErrorCode {
  code: string;
  name: string;
  description: string;
  metaDescription?: string;
  causes: string[];
  solutions: string[];
  codeExamples: {
    language: string;
    code: string;
    title: string;
  }[];
  relatedCodes?: string[];
  provider: ErrorProvider;
}