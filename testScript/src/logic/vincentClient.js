import { ethers } from "ethers";
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { bundledVincentAbility } from '@qwe638853/ability-bungee';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';

// 在瀏覽器環境中：
// - 不使用 dotenv；改由使用者輸入 delegatorPkpEthAddress。
// - delegateeSigner 以使用者連接的 EOA 發送簽名（例如 MetaMask）。

export class VincentBridgeClient {
  constructor() {
    this.litClient = null;
    this.abilityClient = null;
    this.signer = null;
    this.provider = null;
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('找不到 window.ethereum，請安裝 MetaMask 或相容錢包');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await this.provider.send('eth_requestAccounts', []);
    this.signer = await this.provider.getSigner();
    const address = await this.signer.getAddress();
    return { address, accounts };
  }

  async ensureInitialized() {
    if (this.litClient && this.abilityClient && this.signer) return;

    if (!this.signer) {
      throw new Error('尚未連接錢包，請先 connectWallet');
    }

    this.litClient = new LitNodeClient({ litNetwork: 'datil', debug: true });
    await this.litClient.connect();

    this.abilityClient = getVincentAbilityClient({
      bundledVincentAbility,
      ethersSigner: this.signer,
    });
  }

  buildBridgeParams({
    operation,
    rpcUrl,
    sourceChain,
    destinationChain,
    sourceToken,
    destinationToken,
    amount,
    slippageBps,
    recipient,
    separateApproval,
    bridgeTxData,
  }) {
    return {
      operation: operation || 'BRIDGE',
      rpcUrl: String(rpcUrl || '').trim(),
      fromChainId: String(sourceChain || '').trim(),
      toChainId: String(destinationChain || '').trim(),
      fromToken: String(sourceToken || '').trim(),
      toToken: String(destinationToken || '').trim(),
      amount: String(amount || '').trim(),
      recipient: String(recipient || '').trim(),
      slippageBps: slippageBps != null && slippageBps !== '' ? Number(slippageBps) : undefined,
      separateApproval,
      bridgeTxData,
    };
  }

  async precheck(params, { delegatorPkpEthAddress }) {
    await this.ensureInitialized();
    return await this.abilityClient.precheck(params, { delegatorPkpEthAddress });
  }

  async getSignedBridgeQuote(params, { delegatorPkpEthAddress }) {
    await this.ensureInitialized();
    if (typeof this.abilityClient.getSignedBridgeQuote === 'function') {
      return await this.abilityClient.getSignedBridgeQuote(params, { delegatorPkpEthAddress });
    }
    return await this.abilityClient.precheck(params, { delegatorPkpEthAddress });
  }

  async execute(params, { delegatorPkpEthAddress }) {
    await this.ensureInitialized();
    return await this.abilityClient.execute(params, {
      delegatorPkpEthAddress,
    });
  }
}


