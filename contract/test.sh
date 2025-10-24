#!/bin/bash

# GasPass 合約測試運行腳本
# 提供多種測試選項和詳細的測試報告

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數：打印帶顏色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 函數：顯示幫助信息
show_help() {
    echo "GasPass 合約測試腳本"
    echo ""
    echo "用法: $0 [選項]"
    echo ""
    echo "選項:"
    echo "  -h, --help              顯示此幫助信息"
    echo "  -a, --all               運行所有測試"
    echo "  -c, --comprehensive     運行全面測試 (GasPassComprehensive.t.sol)"
    echo "  -b, --basic             運行基本測試 (GasPass.t.sol)"
    echo "  -v, --verbose           詳細輸出"
    echo "  -g, --gas              顯示 gas 使用情況"
    echo "  -r, --report            生成測試報告"
    echo "  -f, --fork <url>        在分叉網路上運行測試"
    echo "  -m, --match <pattern>   只運行匹配的測試"
    echo ""
    echo "示例:"
    echo "  $0 -a                    # 運行所有測試"
    echo "  $0 -c -v                 # 運行全面測試並顯示詳細輸出"
    echo "  $0 -m 'test_mint'        # 只運行包含 'test_mint' 的測試"
    echo "  $0 -f https://eth.llamarpc.com  # 在分叉網路上運行測試"
}

# 默認參數
RUN_ALL=false
RUN_COMPREHENSIVE=false
RUN_BASIC=false
VERBOSE=false
SHOW_GAS=false
GENERATE_REPORT=false
FORK_URL=""
MATCH_PATTERN=""

# 解析命令行參數
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -a|--all)
            RUN_ALL=true
            shift
            ;;
        -c|--comprehensive)
            RUN_COMPREHENSIVE=true
            shift
            ;;
        -b|--basic)
            RUN_BASIC=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -g|--gas)
            SHOW_GAS=true
            shift
            ;;
        -r|--report)
            GENERATE_REPORT=true
            shift
            ;;
        -f|--fork)
            FORK_URL="$2"
            shift 2
            ;;
        -m|--match)
            MATCH_PATTERN="$2"
            shift 2
            ;;
        *)
            print_message $RED "未知選項: $1"
            show_help
            exit 1
            ;;
    esac
done

# 如果沒有指定任何選項，默認運行所有測試
if [[ "$RUN_ALL" == false && "$RUN_COMPREHENSIVE" == false && "$RUN_BASIC" == false ]]; then
    RUN_ALL=true
fi

# 檢查是否在正確的目錄
if [[ ! -f "foundry.toml" ]]; then
    print_message $RED "錯誤: 請在合約根目錄運行此腳本"
    exit 1
fi

# 檢查 forge 是否安裝
if ! command -v forge &> /dev/null; then
    print_message $RED "錯誤: 未找到 forge 命令，請先安裝 Foundry"
    exit 1
fi

print_message $BLUE "🚀 開始 GasPass 合約測試..."

# 構建 forge 命令
FORGE_CMD="forge test"

# 添加詳細輸出
if [[ "$VERBOSE" == true ]]; then
    FORGE_CMD="$FORGE_CMD -vvv"
fi

# 添加 gas 報告
if [[ "$SHOW_GAS" == true ]]; then
    FORGE_CMD="$FORGE_CMD --gas-report"
fi

# 添加分叉選項
if [[ -n "$FORK_URL" ]]; then
    FORGE_CMD="$FORGE_CMD --fork-url $FORK_URL"
fi

# 添加匹配模式
if [[ -n "$MATCH_PATTERN" ]]; then
    FORGE_CMD="$FORGE_CMD --match-test '$MATCH_PATTERN'"
fi

# 運行測試
if [[ "$RUN_ALL" == true ]]; then
    print_message $YELLOW "📋 運行所有測試..."
    eval $FORGE_CMD
elif [[ "$RUN_COMPREHENSIVE" == true ]]; then
    print_message $YELLOW "📋 運行全面測試..."
    eval $FORGE_CMD --match-contract GasPassComprehensiveTest
elif [[ "$RUN_BASIC" == true ]]; then
    print_message $YELLOW "📋 運行基本測試..."
    eval $FORGE_CMD --match-contract GasPassTest
fi

# 檢查測試結果
if [[ $? -eq 0 ]]; then
    print_message $GREEN "✅ 所有測試通過！"
    
    # 生成測試報告
    if [[ "$GENERATE_REPORT" == true ]]; then
        print_message $BLUE "📊 生成測試報告..."
        
        # 創建報告目錄
        mkdir -p test-reports
        
        # 生成詳細的測試報告
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        REPORT_FILE="test-reports/gaspass_test_report_$TIMESTAMP.txt"
        
        {
            echo "GasPass 合約測試報告"
            echo "====================="
            echo "生成時間: $(date)"
            echo "測試類型: $([ "$RUN_ALL" == true ] && echo "所有測試" || [ "$RUN_COMPREHENSIVE" == true ] && echo "全面測試" || echo "基本測試")"
            echo ""
            echo "測試結果: 通過"
            echo ""
            echo "測試覆蓋的功能:"
            echo "- 合約部署和初始化"
            echo "- mintWithSig 功能"
            echo "- mintBatchWithSig 功能"
            echo "- depositWithSig 功能"
            echo "- setAgentToWalletWithSig 功能"
            echo "- 補氣策略設置和取消"
            echo "- 自動補氣功能"
            echo "- 管理員功能"
            echo "- 事件發射"
            echo "- 邊界條件和錯誤處理"
            echo ""
            echo "詳細的測試輸出請查看上面的 forge 測試結果"
        } > $REPORT_FILE
        
        print_message $GREEN "📄 測試報告已保存到: $REPORT_FILE"
    fi
else
    print_message $RED "❌ 測試失敗！"
    exit 1
fi

print_message $BLUE "🎉 測試完成！"
