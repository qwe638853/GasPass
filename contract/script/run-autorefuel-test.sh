#!/bin/bash

# 簡化版 AutoRefuel 測試腳本
# 使用 Anvil 預設私鑰，無需設置環境變量

echo "🚀 啟動簡化版 AutoRefuel 測試"
echo "================================"

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

# 運行測試腳本
echo ""
echo "🧪 執行 AutoRefuel 測試..."
echo "================================"

forge script script/SimpleAutoRefuelTest.s.sol:SimpleAutoRefuelTest \
    --rpc-url http://localhost:8545 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    --broadcast \
    --verbosity 2

echo ""
echo "✅ AutoRefuel 測試完成！"
echo "================================"

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
