import { httpErrors } from './errors/http';
import { awsErrors } from './errors/aws';
import { azureErrors } from './errors/azure';
import { gcpErrors } from './errors/gcp';

export const errorCodes: any = {
  http: httpErrors,
  aws: awsErrors,
  azure: azureErrors,
  gcp: gcpErrors
};

export const getErrorCode = (provider: string, code: string) => errorCodes[provider]?.[code] || null;

export const getAllErrorCodes = () => Object.values(errorCodes).flatMap((p: any) => Object.values(p));

export const getErrorCodesByProvider = (provider: string) => Object.values(errorCodes[provider] || {});