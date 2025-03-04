import os
import json
import requests
from dotenv import load_dotenv

def query_gt4(prompt: str) -> str:
    # 加载环境变量
    load_dotenv()
    
    # API配置
    url = "https://api.gt4.pro/v1/chat/completions"
    headers = {
        'Authorization': f'Bearer {os.getenv("GT4_API_KEY")}',
        'Content-Type': 'application/json'
    }
    
    # 准备请求数据
    payload = json.dumps({
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    })
    
    try:
        # 发送请求
        response = requests.post(url, headers=headers, data=payload)
        response.raise_for_status()  # 检查HTTP错误
        
        # 解析响应
        response_json = response.json()
        return response_json["choices"][0]["message"]["content"]

    except requests.exceptions.RequestException as e:
        raise Exception(f"GT4 API请求失败: {e}")
    except (KeyError, json.JSONDecodeError) as e:
        raise Exception(f"GT4 API响应解析失败: {e}")