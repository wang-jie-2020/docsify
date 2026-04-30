**检索增强生成（RAG, Retrieval-Augmented Generation）**

**RAG整合了从庞大知识库中检索到的相关信息，并以此为基础，指导大型语言模型生成更为精准的答案**



RAG 是一个完整的系统，其工作流程可以简单地分为数据处理、检索、增强和生成四个阶段：

![image-20260224104821777](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20260224104821777.png)

加载本地文档 -> 读取文本 -> 文本分割 -> 文本向量化 -> question 向量化 -> 在文本向量中匹配出与问句向量最相似的 top k 个 -> 匹配出的文本作为上下文和问题一起添加到 Prompt 中 -> 提交给 LLM 生成回答。

![img](https://raw.gitcode.com/qq_36179938/images/raw/main/AI%E5%AD%A6%E4%B9%A0%E8%B5%84%E6%96%99%E6%8E%A8%E8%8D%90.png)




