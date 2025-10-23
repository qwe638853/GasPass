import dotenv from 'dotenv';
dotenv.config();
export const alchemyGasSponsorApiKey = process.env.ALCHEMY_GAS_SPONSOR_API_KEY || process.env.VINCENT_SPONSOR_API_KEY || '';
export const alchemyGasSponsorPolicyId = process.env.ALCHEMY_GAS_SPONSOR_POLICY_ID || process.env.VINCENT_SPONSOR_POLICY_ID || '';

export function getAlchemySponsorConfig() {
  const apiKey = process.env.ALCHEMY_GAS_SPONSOR_API_KEY || process.env.VINCENT_SPONSOR_API_KEY || '';
  const policyId = process.env.ALCHEMY_GAS_SPONSOR_POLICY_ID || process.env.VINCENT_SPONSOR_POLICY_ID || '';
  return { apiKey, policyId, enabled: !!(apiKey && policyId) };
}


