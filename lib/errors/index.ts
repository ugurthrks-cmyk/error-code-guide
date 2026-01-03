import type { ErrorProvider, ErrorCode } from './types';
import { httpErrors } from './http';
import { awsErrors } from './aws';
import { azureErrors } from './azure';
import { gcpErrors } from './gcp';

export const errorCodes: Record<ErrorProvider, Record<string, ErrorCode>> = {
  http: httpErrors,
  aws: awsErrors,
  azure: azureErrors,
  gcp: gcpErrors,
};

export function getErrorCode(
  provider: ErrorProvider,
  code: string
): ErrorCode | null {
  return errorCodes[provider]?.[code] || null;
}

export function getAllErrorCodes(): ErrorCode[] {
  return Object.values(errorCodes).flatMap(providerCodes =>
    Object.values(providerCodes)
  );
}

export function getErrorCodesByProvider(provider: ErrorProvider): ErrorCode[] {
  return Object.values(errorCodes[provider] || {});
}

export type { ErrorProvider, ErrorCode };
export { httpErrors, awsErrors, azureErrors, gcpErrors };

