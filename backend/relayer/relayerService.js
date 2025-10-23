import { ethers } from 'ethers';
import { GAS_PASS_CONFIG, GAS_PASS_ABI } from '../config/gasPassConfig.js';

/**
 * Relayer 服務模組
 * 處理所有 GasPass 合約的 Relayer 功能
 */
export class RelayerService {
  constructor(wallet) {
    this.wallet = wallet;
    this.contract = new ethers.Contract(GAS_PASS_CONFIG.contractAddress, GAS_PASS_ABI, wallet);
  }

  /**
   * 代送 mintWithSig 交易
   */
  async relayMint(typedData, signature) {
    try {
      console.log(`📤 代送 mintWithSig 交易...`);
      console.log(`👤 用戶: ${typedData.to}`);
      console.log(`💰 金額: ${ethers.formatUnits(typedData.value, 6)} USDC`);
      
      const tx = await this.contract.mintWithSig(typedData, signature);
      console.log(`📝 交易哈希: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ 交易確認: ${receipt.transactionHash}`);
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ mintWithSig 失敗:', error.message);
      throw error;
    }
  }

  /**
   * 代送 mintBatchWithSig 交易
   */
  async relayMintBatch(typedData, signature) {
    try {
      console.log(`📤 代送 mintBatchWithSig 交易...`);
      console.log(`👤 用戶: ${typedData.to}`);
      console.log(`📦 數量: ${typedData.amount}`);
      console.log(`💰 單價: ${ethers.formatUnits(typedData.singleValue, 6)} USDC`);
      
      const tx = await this.contract.mintBatchWithSig(typedData, signature);
      console.log(`📝 交易哈希: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ 交易確認: ${receipt.transactionHash}`);
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ mintBatchWithSig 失敗:', error.message);
      throw error;
    }
  }

  /**
   * 代送 depositWithSig 交易
   */
  async relayDeposit(typedData, signature) {
    try {
      console.log(`📤 代送 depositWithSig 交易...`);
      console.log(`🎫 Token ID: ${typedData.tokenId}`);
      console.log(`💰 金額: ${ethers.formatUnits(typedData.amount, 6)} USDC`);
      
      const tx = await this.contract.depositWithSig(typedData, signature);
      console.log(`📝 交易哈希: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ 交易確認: ${receipt.transactionHash}`);
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ depositWithSig 失敗:', error.message);
      throw error;
    }
  }

  /**
   * 代送 setRefuelPolicyWithSig 交易
   */
  async relaySetRefuelPolicy(typedData, signature) {
    try {
      console.log(`📤 代送 setRefuelPolicyWithSig 交易...`);
      console.log(`🎫 Token ID: ${typedData.tokenId}`);
      console.log(`⛓️ 目標鏈: ${typedData.targetChainId}`);
      console.log(`💰 Gas 金額: ${ethers.formatUnits(typedData.gasAmount, 6)} USDC`);
      console.log(`⚠️ 觸發閾值: ${ethers.formatEther(typedData.threshold)} ETH`);
      
      const tx = await this.contract.setRefuelPolicyWithSig(typedData, signature);
      console.log(`📝 交易哈希: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ 交易確認: ${receipt.transactionHash}`);
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ setRefuelPolicyWithSig 失敗:', error.message);
      throw error;
    }
  }

  /**
   * 代送 cancelRefuelPolicyWithSig 交易
   */
  async relayCancelRefuelPolicy(typedData, signature) {
    try {
      console.log(`📤 代送 cancelRefuelPolicyWithSig 交易...`);
      console.log(`🎫 Token ID: ${typedData.tokenId}`);
      console.log(`⛓️ 目標鏈: ${typedData.targetChainId}`);
      
      const tx = await this.contract.cancelRefuelPolicyWithSig(typedData, signature);
      console.log(`📝 交易哈希: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ 交易確認: ${receipt.transactionHash}`);
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ cancelRefuelPolicyWithSig 失敗:', error.message);
      throw error;
    }
  }

  /**
   * 代送 setAgentToWalletWithSig 交易
   */
  async relaySetAgent(typedData, signature) {
    try {
      console.log(`📤 代送 setAgentToWalletWithSig 交易...`);
      console.log(`🤖 Agent: ${typedData.agent}`);
      console.log(`👤 Wallet: ${typedData.wallet}`);
      
      const tx = await this.contract.setAgentToWalletWithSig(typedData, signature);
      console.log(`📝 交易哈希: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ 交易確認: ${receipt.transactionHash}`);
      
      return {
        success: true,
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ setAgentToWalletWithSig 失敗:', error.message);
      throw error;
    }
  }

  /**
   * 獲取 Relayer 資訊
   */
  getRelayerInfo() {
    return {
      address: this.wallet.address,
      network: GAS_PASS_CONFIG.network.name,
      chainId: GAS_PASS_CONFIG.network.chainId
    };
  }
}
