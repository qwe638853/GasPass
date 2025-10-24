#!/bin/bash

# Arbitrum 主網部署腳本
# 部署 GasPass 合約到 Arbitrum 主網

set -e

echo "🚀 部署 GasPass 合約到 Arbitrum 主網"
echo "=================================="

# 檢查 .env 文件是否存在
if [ -f ".env" ]; then
    echo "📄 讀取 .env 文件..."
    export $(grep -v '^#' .env | xargs)
    echo "✅ .env 文件已載入"
else
    echo "⚠️  警告: 未找到 .env 文件，將使用環境變量"
fi

# 檢查環境變量
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ 錯誤: 請設置 PRIVATE_KEY 環境變量或在 .env 文件中定義"
    echo "例如: export PRIVATE_KEY=0x你的私鑰"
    echo "或在 .env 文件中添加: PRIVATE_KEY=0x你的私鑰"
    exit 1
fi

if [ -z "$ARBISCAN_API_KEY" ]; then
    echo "⚠️  警告: 未設置 ARBISCAN_API_KEY，將跳過合約驗證"
    echo "建議設置: export ARBISCAN_API_KEY=你的API密鑰"
    echo "或在 .env 文件中添加: ARBISCAN_API_KEY=你的API密鑰"
fi

# 檢查 RPC URL
if [ -z "$ARBITRUM_RPC_URL" ]; then
    echo "⚠️  警告: 未設置 ARBITRUM_RPC_URL，使用預設 RPC"
    export ARBITRUM_RPC_URL="https://arb1.arbitrum.io/rpc"
fi

echo "📋 部署配置:"
echo "- 網絡: Arbitrum Mainnet"
echo "- RPC URL: $ARBITRUM_RPC_URL"
echo "- 私鑰: ${PRIVATE_KEY:0:10}..."
echo "- Arbiscan API: ${ARBISCAN_API_KEY:+已設置}${ARBISCAN_API_KEY:-未設置}"

# 確認部署
echo ""
read -p "確認要部署到 Arbitrum 主網嗎？(y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ 部署已取消"
    exit 1
fi

echo ""
echo "🔨 開始部署..."

# 部署合約
forge script ./DeployArbitrumMainnet.s.sol:DeployArbitrumMainnet \
    --rpc-url $ARBITRUM_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $ARBISCAN_API_KEY \
    --verifier-url https://api.arbiscan.io/api \
    --verifier etherscan \
    --slow \
    --verbosity 2

echo ""
echo "✅ 部署完成！"
echo "=================================="

echo ""
echo "📝 部署後檢查清單:"
echo "1. ✅ 檢查合約是否成功部署"
echo "2. ⏳ 等待合約驗證完成"
echo "3. ⏳ 設置正確的 relayer 地址"
echo "4. ⏳ 設置正確的 bungee inbox 地址"
echo "5. ⏳ 測試合約基本功能"
echo "6. ⏳ 測試 mintWithSig 功能"
echo "7. ⏳ 測試 autoRefuel 功能"

echo ""
echo "🔗 有用的鏈接:"
echo "- Arbiscan: https://arbiscan.io/"
echo "- Arbitrum Bridge: https://bridge.arbitrum.io/"
echo "- Gas Tracker: https://arbiscan.io/gastracker"

echo ""
echo "⚠️  重要提醒:"
echo "- 請妥善保存合約地址"
echo "- 確保私鑰安全"
echo "- 部署後請立即設置正確的 relayer 和 bungee inbox 地址"
echo "- 建議先在測試網測試所有功能"
