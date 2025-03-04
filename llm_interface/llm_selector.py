from typing import Dict, Optional
from .openai_api import query_openai
from .gt4_api import query_gt4

class LLMSelector:
    """LLM接口选择器"""
    
    def __init__(self):
        self.providers = {
            "openai": query_openai,
            "gt4": query_gt4
        }
        self.default_provider = "gt4"

    def query(self, prompt: str, provider: Optional[str] = None, **kwargs) -> str:
        """
        统一的查询接口
        
        Args:
            prompt: 查询文本
            provider: LLM提供商，可选值：openai, gt4
            **kwargs: 其他参数
        
        Returns:
            str: LLM的响应文本
        """
        # 使用指定的提供商，如果未指定则使用默认值
        provider = provider or self.default_provider
        
        if provider not in self.providers:
            raise ValueError(f"不支持的LLM提供商: {provider}")
            
        try:
            query_func = self.providers[provider]
            return query_func(prompt, **kwargs)
        except Exception as e:
            raise Exception(f"LLM查询失败 ({provider}): {str(e)}")

# 创建全局LLM选择器实例
llm = LLMSelector()

def test_provider(provider: str, test_prompt: str = "你好，请做个自我介绍") -> tuple[bool, str, float]:
    """测试指定的LLM提供商接口"""
    import time
    start_time = time.time()
    try:
        response = llm.query(test_prompt, provider=provider)
        elapsed = time.time() - start_time
        return True, response[:100], elapsed
    except Exception as e:
        elapsed = time.time() - start_time
        return False, str(e), elapsed

def main():
    """自检程序入口"""
    print("\n=== LLM接口自检程序 ===")
    print("{:<10} {:<10} {:<10} {:<50}".format("提供商", "状态", "耗时(秒)", "响应/错误信息"))
    print("-" * 80)
    
    # 测试所有提供商
    for provider in llm.providers.keys():
        success, message, elapsed = test_provider(provider)
        status = "✓" if success else "✗"
        print("{:<10} {:<10} {:<10.2f} {:<50}".format(
            provider, status, elapsed, message
        ))
    print("-" * 80)

if __name__ == "__main__":
    main()