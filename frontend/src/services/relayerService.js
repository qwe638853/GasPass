/**
 * GasPass Relayer 服務
 * 負責與後端 Relayer 通信，代送用戶交易
 */

import { GAS_PASS_CONFIG } from '@/config/gasPassConfig.js';

const RELAYER_BASE_URL = GAS_PASS_CONFIG.relayerUrl;

class RelayerService {
  constructor() {
    this.baseURL = RELAYER_BASE_URL;
  }

  /**
   * 檢查 Relayer 健康狀態
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Relayer 健康檢查失敗:', error);
      throw new Error('無法連接到 Relayer 服務');
    }
  }

  /**
   * 獲取 Relayer 地址
   */
  async getRelayerAddress() {
    try {
      const response = await fetch(`${this.baseURL}/relayer`);
      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error('獲取 Relayer 地址失敗:', error);
      throw new Error('無法獲取 Relayer 地址');
    }
  }

  /**
   * 代送 mintWithSig 交易
   */
  async relayMint(typedData, signature) {
    try {
      const response = await fetch(`${this.baseURL}/api/relayer/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          typedData,
          signature
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '交易失敗');
      }

      return result;
    } catch (error) {
      console.error('代送 mint 交易失敗:', error);
      throw error;
    }
  }

  /**
   * 代送 mintBatchWithSig 交易
   */
  async relayMintBatch(typedData, signature) {
    try {
      const response = await fetch(`${this.baseURL}/api/relayer/mint-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          typedData,
          signature
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '交易失敗');
      }

      return result;
    } catch (error) {
      console.error('代送 mintBatch 交易失敗:', error);
      throw error;
    }
  }

  /**
   * 代送 depositWithSig 交易
   */
  async relayDeposit(typedData, signature) {
    try {
      const response = await fetch(`${this.baseURL}/api/relayer/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          typedData,
          signature
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '交易失敗');
      }

      return result;
    } catch (error) {
      console.error('代送 deposit 交易失敗:', error);
      throw error;
    }
  }

  /**
   * 代送 setRefuelPolicyWithSig 交易
   */
  async relaySetRefuelPolicy(typedData, signature) {
    try {
      const response = await fetch(`${this.baseURL}/api/relayer/set-refuel-policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          typedData,
          signature
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '交易失敗');
      }

      return result;
    } catch (error) {
      console.error('代送 setRefuelPolicy 交易失敗:', error);
      throw error;
    }
  }

  /**
   * 代送 cancelRefuelPolicyWithSig 交易
   */
  async relayCancelRefuelPolicy(typedData, signature) {
    try {
      const response = await fetch(`${this.baseURL}/api/relayer/cancel-refuel-policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          typedData,
          signature
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '交易失敗');
      }

      return result;
    } catch (error) {
      console.error('代送 cancelRefuelPolicy 交易失敗:', error);
      throw error;
    }
  }

  /**
   * 代送 setAgentToWalletWithSig 交易
   */
  async relaySetAgent(typedData, signature) {
    try {
      const response = await fetch(`${this.baseURL}/api/relayer/set-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          typedData,
          signature
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '交易失敗');
      }

      return result;
    } catch (error) {
      console.error('代送 setAgent 交易失敗:', error);
      throw error;
    }
  }
}

export default new RelayerService();
