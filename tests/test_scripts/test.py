import os
import json
import difflib
import pandas as pd
from datetime import datetime
from typing import Dict, List
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from csv_query_app.query import query_csv

class TestRunner:
    def __init__(self):
        self.test_cases = []
        self.results = []
        self.similarity_threshold = 0.9
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    def load_test_cases(self) -> None:
        """加载测试用例"""
        try:
            with open(f"{self.base_path}/test_cases/test_data.json", "r", encoding="utf-8") as f:
                self.test_cases = json.load(f)
        except Exception as e:
            raise Exception(f"加载测试用例失败: {e}")

    def run_single_test(self, test_case: Dict) -> Dict:
        """运行单个测试用例"""
        result = {
            "test_id": test_case["test_id"],
            "input_query": test_case["input_query"],
            "expected_output": test_case["expected_output"],
            "test_type": test_case.get("test_type", "normal"),
            "status": "失败",
            "similarity_score": 0.0,
            "actual_output": "",
            "remark": ""
        }

        try:
            # 调用CSV查询接口
            actual_output = query_csv(test_case["input_query"])
            result["actual_output"] = actual_output

            # 计算相似度
            similarity = difflib.SequenceMatcher(None, actual_output, test_case["expected_output"]).ratio()
            result["similarity_score"] = similarity

            # 判断测试结果
            if similarity > self.similarity_threshold:
                result["status"] = "通过"

        except Exception as e:
            result["remark"] = f"执行出错: {str(e)}"

        return result

    def run_all_tests(self) -> None:
        """运行所有测试用例"""
        self.results = []
        for test_case in self.test_cases:
            result = self.run_single_test(test_case)
            self.results.append(result)

    def generate_report(self) -> None:
        """生成测试报告"""
        if not self.results:
            return

        # 计算统计信息
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "通过")
        failed = total - passed

        # 生成CSV报告
        df = pd.DataFrame(self.results)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_path = f"{self.base_path}/test_reports/test_results_{timestamp}.csv"
        df.to_csv(csv_path, index=False, encoding="utf-8")

        # 打印统计信息
        print(f"\n测试结果统计:")
        print(f"总用例数: {total}")
        print(f"通过数: {passed}")
        print(f"失败数: {failed}")
        print(f"通过率: {(passed/total)*100:.2f}%")
        print(f"\n详细报告已保存至: {csv_path}")

def main():
    runner = TestRunner()
    try:
        runner.load_test_cases()
        runner.run_all_tests()
        runner.generate_report()
    except Exception as e:
        print(f"测试执行失败: {e}")

if __name__ == "__main__":
    main()