import os
import httpx
from openai import OpenAI
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 设置代理
proxy = "http://127.0.0.1:7897"

# 初始化客户端
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    http_client=httpx.Client(
        proxy=proxy
    )
)

def query_openai(prompt: str) -> str:
    try:
        # 创建聊天完成
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # 返回响应
        return response.choices[0].message.content

    except Exception as e:
        raise Exception(f"OpenAI API调用失败: {e}")