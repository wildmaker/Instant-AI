import os
import pandas as pd
from typing import List, Dict
from dotenv import load_dotenv
from llm_interface.llm_selector import llm

class CSVQueryEngine:
    def __init__(self):
        load_dotenv()
        self.base_path = "/Users/wildmaker/Documents/Projects/Instant-AI/tests/test_data/cleaned_data/远怀产品价格表（内贸）"
        self.csv_data = self._load_csv_files()

    def _load_csv_files(self) -> Dict[str, pd.DataFrame]:
        """加载CSV文件"""
        csv_files = {
            "结晶釜价格表": "YFR玻璃结晶釜整机-表格 1.csv"
        }
        
        dataframes = {}
        for name, filename in csv_files.items():
            file_path = os.path.join(self.base_path, filename)
            dataframes[name] = pd.read_csv(file_path, encoding='utf-8')
        return dataframes

    def _construct_prompt(self, query: str) -> str:
        """构造完整的Prompt"""
        system_prompt = """你是一个智能查询助手，能够根据用户提供的自然语言查询，从表中提取准确信息。
以下是 CSV 数据：

{结晶釜价格表}

请根据以上数据回答用户的问题。回答要简洁准确，只回答最终的数值或者值。"""

        # 生成数据预览
        df = self.csv_data["结晶釜价格表"]
        # 确保显示所有列
        pd.set_option('display.max_columns', None)
        preview = df.to_string()
        
        # 填充系统Prompt并添加用户问题标记
        formatted_system_prompt = system_prompt.format(结晶釜价格表=preview)
        return formatted_system_prompt + "\n这是用户的问题：\n" + query

def query_csv(query_text: str, provider: str = "gt4") -> str:
    """对CSV数据进行自然语言查询"""
    engine = CSVQueryEngine()
    prompt = engine._construct_prompt(query_text)
    return llm.query(prompt, provider=provider)