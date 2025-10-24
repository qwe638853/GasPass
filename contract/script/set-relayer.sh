#!/bin/bash

# 設置 GasPass 合約的 Relayer
# 用於部署後設置正確的 relayer 地址

set -e

echo "🔧 設置 GasPass 合約的 Relayer"
echo "=============================="

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
    exit 1
fi

if [ -z "$GASPASS_ADDRESS" ]; then
    echo "❌ 錯誤: 請設置 GASPASS_ADDRESS 環境變量或在 .env 文件中定義"
    echo "例如: export GASPASS_ADDRESS=0x合約地址"
    echo "或在 .env 文件中添加: GASPASS_ADDRESS=0x合約地址"
    exit 1
fi

if [ -z "$NEW_RELAYER_ADDRESS" ]; then
    echo "❌ 錯誤: 請設置 NEW_RELAYER_ADDRESS 環境變量或在 .env 文件中定義"
    echo "例如: export NEW_RELAYER_ADDRESS=0x新的Relayer地址"
    echo "或在 .env 文件中添加: NEW_RELAYER_ADDRESS=0x新的Relayer地址"
    exit 1
fi

echo "📋 設置參數:"
echo "- GasPass 合約: $GASPASS_ADDRESS"
echo "- 新 Relayer: $NEW_RELAYER_ADDRESS"
echo "- 部署者: ${PRIVATE_KEY:0:10}..."

# 確認設置
echo ""
read -p "確認要設置新的 relayer 嗎？(y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ 設置已取消"
    exit 1
fi

echo ""
echo "🔨 開始設置..."

# 執行設置
forge script script/SetRelayerArbitrum.s.sol:SetRelayerArbitrum \
    --rpc-url https://arb1.arbitrum.io/rpc \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --slow \
    --verbosity 2

echo ""
echo "✅ Relayer 設置完成！"
echo "=============================="

echo ""
echo "📝 後續步驟:"
echo "1. ✅ 驗證 relayer 設置是否成功"
echo "2. ⏳ 測試 relayer 功能"
echo "3. ⏳ 設置 bungee inbox 地址"
echo "4. ⏳ 測試 autoRefuel 功能"

echo ""
echo "🔗 查看合約:"
echo "- Arbiscan: https://arbiscan.io/address/$GASPASS_ADDRESS"
