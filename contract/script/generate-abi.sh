#!/bin/bash

# GasPass ABI 生成腳本
# 自動生成多種格式的 ABI 文件

set -e

echo "🔨 生成 GasPass 合約 ABI"
echo "========================"

# 檢查是否在正確的目錄
if [ ! -f "src/GasPass.sol" ]; then
    echo "❌ 錯誤: 請在 contract 目錄下運行此腳本"
    exit 1
fi

# 編譯合約
echo "📦 編譯合約..."
forge build

# 檢查 ABI 文件是否存在
if [ ! -f "out/GasPass.sol/GasPass.json" ]; then
    echo "❌ 錯誤: 找不到 GasPass.json 文件"
    exit 1
fi

echo "✅ 合約編譯完成"

# 生成 ABI 文件
echo "📄 生成 ABI 文件..."

# 1. 純 ABI JSON
python3 -c "
import json
with open('out/GasPass.sol/GasPass.json', 'r') as f:
    data = json.load(f)
with open('GasPass.abi.json', 'w') as f:
    json.dump(data['abi'], f, indent=2)
print('✅ GasPass.abi.json')
"

# 2. 完整合約信息
python3 -c "
import json
with open('out/GasPass.sol/GasPass.json', 'r') as f:
    data = json.load(f)

abi_info = {
    'contractName': 'GasPass',
    'abi': data['abi'],
    'bytecode': data['bytecode']['object'],
    'deployedBytecode': data['deployedBytecode']['object'],
    'metadata': data['metadata']
}

with open('GasPass.full.json', 'w') as f:
    json.dump(abi_info, f, indent=2)
print('✅ GasPass.full.json')
"

# 3. TypeScript 版本
python3 -c "
import json
with open('GasPass.abi.json', 'r') as f:
    abi = json.load(f)

ts_content = '''// GasPass Contract ABI
// Generated from Solidity contract
// Contract: GasPass
// Version: 1.0

export const GasPassABI = ''' + json.dumps(abi, indent=2) + ''' as const;

export type GasPassContract = typeof GasPassABI;
'''

with open('GasPass.abi.ts', 'w') as f:
    f.write(ts_content)
print('✅ GasPass.abi.ts')
"

# 4. JavaScript 版本
python3 -c "
import json
with open('GasPass.abi.json', 'r') as f:
    abi = json.load(f)

js_content = '''// GasPass Contract ABI
// Generated from Solidity contract
// Contract: GasPass
// Version: 1.0

const GasPassABI = ''' + json.dumps(abi, indent=2) + ''';

module.exports = GasPassABI;
'''

with open('GasPass.abi.js', 'w') as f:
    f.write(js_content)
print('✅ GasPass.abi.js')
"

# 5. 創建 ABI 目錄
mkdir -p abi
cp GasPass.abi.json abi/
cp GasPass.full.json abi/
cp GasPass.abi.ts abi/
cp GasPass.abi.js abi/

echo ""
echo "📁 生成的文件:"
echo "- GasPass.abi.json     (純 ABI)"
echo "- GasPass.full.json    (完整合約信息)"
echo "- GasPass.abi.ts       (TypeScript 版本)"
echo "- GasPass.abi.js       (JavaScript 版本)"
echo "- abi/                 (ABI 目錄)"

echo ""
echo "📊 ABI 統計:"
python3 -c "
import json
with open('GasPass.abi.json', 'r') as f:
    abi = json.load(f)

functions = [item for item in abi if item['type'] == 'function']
events = [item for item in abi if item['type'] == 'event']
errors = [item for item in abi if item['type'] == 'error']

print(f'- 函數: {len(functions)} 個')
print(f'- 事件: {len(events)} 個')
print(f'- 錯誤: {len(errors)} 個')
print(f'- 總計: {len(abi)} 個項目')
"

echo ""
echo "✅ ABI 生成完成！"
echo "========================"

echo ""
echo "💡 使用建議:"
echo "- 前端開發: 使用 GasPass.abi.ts"
echo "- Node.js 開發: 使用 GasPass.abi.js"
echo "- 合約驗證: 使用 GasPass.full.json"
echo "- 簡單集成: 使用 GasPass.abi.json"
