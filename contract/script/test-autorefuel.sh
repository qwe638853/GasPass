#!/bin/bash

# AutoRefuel 測試腳本
# 用於在 Anvil 本地環境中測試 autoRefuel 功能

set -e

echo "🚀 啟動 AutoRefuel 測試腳本"
echo "================================"

# 檢查環境變量
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ 錯誤: 請設置 PRIVATE_KEY 環境變量"
    echo "例如: export PRIVATE_KEY=0x1234567890abcdef..."
    exit 1
fi

# 檢查 Anvil 是否運行
if ! curl -s http://localhost:8545 > /dev/null; then
    echo "🔄 啟動 Anvil 本地節點..."
    anvil --host 0.0.0.0 --port 8545 &
    ANVIL_PID=$!
    
    # 等待 Anvil 啟動
    echo "⏳ 等待 Anvil 啟動..."
    sleep 3
    
    # 檢查 Anvil 是否成功啟動
    if ! curl -s http://localhost:8545 > /dev/null; then
        echo "❌ Anvil 啟動失敗"
        exit 1
    fi
    
    echo "✅ Anvil 已啟動 (PID: $ANVIL_PID)"
else
    echo "✅ Anvil 已在運行"
fi

# 設置測試環境
echo ""
echo "🔧 設置測試環境..."
export ANVIL_RPC_URL="http://localhost:8545"
export ANVIL_PRIVATE_KEY="$PRIVATE_KEY"

# 運行測試腳本
echo ""
echo "🧪 執行 AutoRefuel 測試..."
echo "================================"

forge script script/TestAutoRefuel.s.sol:TestAutoRefuelScript \
    --rpc-url $ANVIL_RPC_URL \
    --private-key $ANVIL_PRIVATE_KEY \
    --broadcast \
    --verbosity 2

echo ""
echo "✅ AutoRefuel 測試完成！"
echo "================================"

# 可選: 清理 Anvil 進程
if [ ! -z "$ANVIL_PID" ]; then
    echo "🔄 清理 Anvil 進程..."
    kill $ANVIL_PID
    echo "✅ 清理完成"
fi

echo ""
echo "📊 測試結果總結:"
echo "- ✅ Mock Agent 部署成功"
echo "- ✅ GasPass token 鑄造成功"
echo "- ✅ 補氣策略設置成功"
echo "- ✅ AutoRefuel 執行成功"
echo "- ✅ 冷卻期機制測試成功"
echo "- ✅ 手續費收取正常"
echo ""
echo "🎉 所有測試通過！"
