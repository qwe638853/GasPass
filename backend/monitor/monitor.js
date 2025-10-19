import 'dotenv/config';
import { ethers } from 'ethers';

// Minimal ABI from ERC3525 to enumerate tokenIds
const GAS_PASS_ABI = [
  'function totalSupply() view returns (uint256)',
  'function tokenByIndex(uint256) view returns (uint256)'
];

function getProvider() {
  const rpcUrl = process.env.AVAIL_RPC_URL || process.env.MONITOR_RPC_URL || 'http://127.0.0.1:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
}

export async function getMaxTokenId(contractAddress) {
  const provider = getProvider();
  const address = contractAddress || process.env.GASPASS_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  if (!address) throw new Error('GASPASS_ADDRESS 未設定');

  const contract = new ethers.Contract(address, GAS_PASS_ABI, provider);
  const code = await provider.getCode(address);
  if (!code || code === '0x') {
    throw new Error(`地址無合約碼: ${address}`);
  }

  const supply = await contract.totalSupply();
  const supplyBn = ethers.BigNumber.isBigNumber(supply) ? supply : ethers.BigNumber.from(supply);
  if (supplyBn.isZero()) return ethers.BigNumber.from(0);

  let maxId = ethers.BigNumber.from(0);
  const total = supplyBn.toNumber();
  for (let i = 0; i < total; i++) {
    const id = await contract.tokenByIndex(i);
    const idBn = ethers.BigNumber.isBigNumber(id) ? id : ethers.BigNumber.from(id);
    if (idBn.gt(maxId)) maxId = idBn;
  }
  return maxId;
}

export async function monitor() {
  const maxId = await getMaxTokenId();
  // eslint-disable-next-line no-console
  console.log('Max tokenId:', maxId.toString());
}