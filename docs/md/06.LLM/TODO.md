















**向量及向量知识库**

数据读取 -> 数据清洗 -> 文档分割

Langchain 中文本分割器都根据 `chunk_size` (块大小)和 `chunk_overlap` (块与块之间的重叠大小)进行分割。

- chunk_size 指每个块包含的字符或 Token （如单词、句子等）的数量
- chunk_overlap 指两个块之间共享的字符数量，用于保持上下文的连贯性，避免分割丢失上下文信息

Langchain 提供多种文档分割方式，区别在怎么确定块与块之间的边界、块由哪些字符/token组成、以及如何测量块大小

- RecursiveCharacterTextSplitter(): 按字符串分割文本，递归地尝试按不同的分隔符进行分割文本。

- CharacterTextSplitter(): 按字符来分割文本。

- MarkdownHeaderTextSplitter(): 基于指定的标题来分割markdown 文件。

- TokenTextSplitter(): 按token来分割文本。

- SentenceTransformersTokenTextSplitter(): 按token来分割文本

- Language(): 用于 CPP、Python、Ruby、Markdown 等。

- NLTKTextSplitter(): 使用 NLTK（自然语言工具包）按句子分割文本。

- SpacyTextSplitter(): 使用 Spacy按句子的切割文本。

  

在机器学习和自然语言处理（NLP）中，词向量（word embedding）是一种以单词为单位将每个单词转化为实数向量的技术。这些实数向量可以被计算机更好地理解和处理。词向量背后的主要想理念是相似或相关的对象在向量空间中的距离应该很近。词向量实际上是将单词转化为固定的静态的向量，虽然可以在一定程度上捕捉并表达文本中的语义信息，但忽略了单词在不同语境中的意思会受到影响这一现实。因此在RAG应用中使用的向量技术一般为通用文本向量(Universal text embedding)，该技术可以对一定范围内任意长度的文本进行向量化，与词向量不同的是向量化的单位不再是单词而是输入的文本，输出的向量会捕捉更多的语义信息。

在搭建 RAG 系统时，我们往往可以通过使用向量模型来构建向量，我们可以选择：

- 使用各个公司的 Embedding API；
- 在本地使用向量模型将数据构建为向量。