# Chat Completions API 详解

------

## 📥 请求参数（Request）

### 必填参数

| 参数    | 类型   | 说明                                                 |
| ------- | ------ | ---------------------------------------------------- |
| `model` | string | 模型 ID，如 `gpt-4o`、`gpt-4o-mini`、`gpt-3.5-turbo` |

### 消息参数

| 参数       | 类型  | 说明                                           |
| ---------- | ----- | ---------------------------------------------- |
| `messages` | array | 对话消息数组，每个元素包含 `role` 和 `content` |



```python
messages = [
    {"role": "system",     "content": "你是一个助手"},
    {"role": "user",       "content": "你好"},
    {"role": "assistant",  "content": "你好，有什么可以帮你？"},
    {"role": "user",       "content": "解释一下什么是LLM"}
]
```

**role 可选值**：

| role        | 用途                                    |
| ----------- | --------------------------------------- |
| `system`    | 系统指令，定义助手行为                  |
| `user`      | 用户消息                                |
| `assistant` | 助手回复（可传入历史对话）              |
| `developer` | 开发者指令（替代 system，部分模型支持） |

**content 类型**：

```python
# 文本
{"role": "user", "content": "你好"}

# 多模态（图片+文本）
{
    "role": "user",
    "content": [
        {"type": "text", "text": "这张图里有什么？"},
        {"type": "image_url", "image_url": {"url": "https://example.com/image.png"}}
    ]
}
```

------

### 可选参数

| 参数                    | 类型          | 默认值 | 说明                                          |
| ----------------------- | ------------- | ------ | --------------------------------------------- |
| `frequency_penalty`     | float         | 0      | 频率惩罚，-2.0 ~ 2.0，控制重复                |
| `logit_bias`            | map           | null   | 调整 token 出现概率                           |
| `logprobs`              | boolean       | false  | 是否返回 token 对数概率                       |
| `top_logprobs`          | integer       | null   | 每个位置返回的候选数量（0-20）                |
| `max_tokens`            | integer       | 自动   | 最大生成 token 数                             |
| `max_completion_tokens` | integer       | null   | 精确控制输出 token 数（与 max_tokens 二选一） |
| `n`                     | integer       | 1      | 生成多个候选项                                |
| `presence_penalty`      | float         | 0      | 在场惩罚，-2.0 ~ 2.0                          |
| `response_format`       | object        | null   | 结构化输出约束                                |
| `seed`                  | integer       | null   | 随机种子（设置后尽量可复现）                  |
| `service_tier`          | string        | auto   | 服务层级（`auto` 或 `default`）               |
| `stop`                  | string/array  | null   | 停止词，达到后停止生成                        |
| `stream`                | boolean       | false  | **是否流式返回**                              |
| `stream_options`        | object        | null   | 流式输出选项                                  |
| `temperature`           | float         | 1.0    | 随机性，0.0 ~ 2.0                             |
| `top_p`                 | float         | 1.0    | 核采样，控制多样性                            |
| `tools`                 | array         | null   | 工具定义（如函数调用）                        |
| `tool_choice`           | string/object | auto   | 强制使用某个工具                              |
| `parallel_tool_calls`   | boolean       | true   | 是否并行调用工具                              |
| `user`                  | string        | null   | 用户标识                                      |

------

## 📤 响应参数（Response）

### 完整响应结构



```json
{
  "id": "chatcmpl-xxx",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "logprobs": null,
      "message": {
        "role": "assistant",
        "content": "LLM 是大语言模型...",
        "refusal": null,
        "audio": null,
        "tool_calls": [
          {
            "id": "call_xxx",
            "type": "function",
            "function": {
              "name": "get_weather",
              "arguments": "{\"city\":\"北京\"}"
            }
          }
        ]
      }
    }
  ],
  "created": 1712345678,
  "model": "gpt-4o-2024-08-06",
  "service_tier": "auto",
  "system_fingerprint": "fp_xxx",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 120,
    "total_tokens": 170,
    "prompt_tokens_details": {
      "cached_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0
    }
  }
}
```

### 响应字段详解

| 字段                       | 类型   | 说明                                                         |
| -------------------------- | ------ | ------------------------------------------------------------ |
| `id`                       | string | 本次请求的唯一 ID                                            |
| `choices`                  | array  | 生成结果数组                                                 |
| `choices[0].message`       | object | 助手消息                                                     |
| `choices[0].finish_reason` | string | 结束原因：`stop`、`length`、`content_filter`、`tool_calls`、`function_call` |
| `model`                    | string | 实际调用的模型                                               |
| `usage`                    | object | Token 使用量统计                                             |

------

## 🔄 流式响应（Streaming）



```python
from openai import OpenAI

client = OpenAI()
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "写一首诗"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

### 流式返回的 chunk 结构

```json
// 第一块
{"id":"chatcmpl-xxx","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}],"created":123,"model":"gpt-4o","service_tier":"auto","system_fingerprint":"fp_xxx","usage":null}

// 中间块
{"id":"chatcmpl-xxx","choices":[{"index":0,"delta":{"content":"春"},"finish_reason":null}],"created":123,"model":"gpt-4o","service_tier":"auto","system_fingerprint":"fp_xxx","usage":null}

// 最后一块
{"id":"chatcmpl-xxx","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"created":123,"model":"gpt-4o","service_tier":"auto","system_fingerprint":"fp_xxx","usage":{"prompt_tokens":10,"completion_tokens":20,"total_tokens":30}}
```

------

## 💡 常见使用示例

### 基础调用

```python
from openai import OpenAI
client = OpenAI(api_key="sk-xxx")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个诗人"},
        {"role": "user", "content": "以'春天'为主题写一首诗"}
    ],
    temperature=0.7,
    max_tokens=200
)

print(response.choices[0].message.content)
```

### 结构化输出（JSON Mode）

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "提取用户信息：名字、年龄、城市"}
    ],
    response_format={"type": "json_object"},
    # 或严格模式：
    # response_format={
    #     "type": "json_schema",
    #     "json_schema": {"name": "user", "schema": {...}}
    # }
)

import json
data = json.loads(response.choices[0].message.content)
```

### 工具调用（Function Calling）

```python
# 1. 定义工具
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取城市天气",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名"}
                },
                "required": ["city"]
            }
        }
    }
]

# 2. 调用
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools
)

# 3. 解析工具调用
tool_call = response.choices[0].message.tool_calls[0]
func_name = tool_call.function.name
func_args = json.loads(tool_call.function.arguments)
```

### 多模态（图片输入）

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "这张图片里有什么？"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.png",
                        "detail": "high"  # low / high / auto
                    }
                }
            ]
        }
    ]
)
```

------

## ⚠️ 注意事项

1. **`max_tokens` vs `max_completion_tokens`**：后者更精确，推荐在新代码中使用
2. **`temperature` 和 `top_p`**：不要同时设置很高，通常只调一个
3. **`seed`**：设为固定值可提高可复现性，但不能 100% 保证
4. **Token 限制**：注意 `max_tokens` 不要超过模型的上下文窗口减去输入长度