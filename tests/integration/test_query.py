import pytest
import sys
import os
import time
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from csv_query_app.query import query_csv

import pandas as pd
from datetime import datetime
from tqdm import tqdm

def test_query_flow():
    """测试完整查询流程"""
    # 从CSV文件加载测试用例
    test_cases_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test_cases", "test_cases.csv")
    df = pd.read_csv(test_cases_path, encoding="utf-8")
    test_cases = df.to_dict("records")[28:31]  # 只取前3个测试用例
    
    results = []
    total_cases = len(test_cases)
    start_time = time.time()
    
    print("\n开始执行测试...")    
    print(f"共加载 {total_cases} 个测试用例\n")
    
    failed_cases = []
    total_progress = 0
    
    for case in test_cases:
        case_start_time = time.time()
        
        # 打印当前测试用例信息（左对齐）
        print(f"问题：{case['query']}")
        print(f"期望包含：{case['expected_contains']}")
        response = query_csv(case["query"])
        print(f"实际响应：{response}")
        
        # 统一处理中文负号和英文负号
        normalized_response = response.replace("﹣", "-")
        normalized_expected = case["expected_contains"].replace("﹣", "-")
        
        # 计算进度
        total_progress = ((len(results) / total_cases) * 100)
        case_time = time.time() - case_start_time
        status_symbol = "✓" if normalized_expected in normalized_response else "✗"
        
        # 使用tqdm创建进度条
        progress_bar = f"执行进度: {total_progress:3.0f}% {status_symbol} [{len(results)}/{total_cases}] {case_time:.1f}s"
        print(progress_bar)
        print("-" * 80)
        
        # 记录测试结果
        result = {
            "query": case["query"],
            "expected_contains": case["expected_contains"],
            "actual_response": response,
            "status": "通过" if normalized_expected in normalized_response else "失败"
        }
        results.append(result)
        
        # 记录失败用例
        if normalized_expected not in normalized_response:
            failed_cases.append((case["query"], normalized_expected, normalized_response))
        
        # 计算进度
        total_progress = ((len(results) / total_cases) * 100)
        case_time = time.time() - case_start_time
        status_symbol = "✓" if result["status"] == "通过" else "✗"
        
        # 清除之前的进度显示并更新
        print(f"\r执行进度: {total_progress:3.0f}% {status_symbol} [{len(results)}/{total_cases}] {case_time:.1f}s", end="")
    
    # 计算总耗时
    total_time = time.time() - start_time
    
    # 生成测试报告
    df = pd.DataFrame(results)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test_reports", f"test_results_{timestamp}.csv")
    df.to_csv(report_path, index=False, encoding="utf-8")
    
    # 打印总结信息
    passed = sum(1 for r in results if r["status"] == "通过")
    print(f"测试执行完成!")
    print(f"总用例数: {total_cases}")
    print(f"通过数量: {passed}")
    print(f"失败数量: {total_cases - passed}")
    print(f"通过率: {(passed/total_cases)*100:.2f}%")
    print(f"总耗时: {total_time:.2f}秒")
    print(f"\n测试报告已保存至: {report_path}")

@pytest.mark.skip(reason="暂时跳过供应商测试")
def test_provider_selection():
    """测试不同提供商"""
    query = "YFR-150EX的底阀离地高度是多少？"
    
    gt4_response = query_csv(query, provider="gt4")
    openai_response = query_csv(query, provider="openai")
    
    assert "490" in gt4_response
    assert "490" in openai_response