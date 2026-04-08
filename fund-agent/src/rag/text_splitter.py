"""文本分块器 - 将文档分割成适合检索的片段"""

from typing import List, Optional
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    MarkdownTextSplitter,
    PythonCodeTextSplitter,
    HTMLHeaderTextSplitter,
)
from langchain_core.documents import Document


class TextSplitter:
    """文本分块器"""

    @staticmethod
    def create_recursive_splitter(
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        separators: Optional[List[str]] = None
    ) -> RecursiveCharacterTextSplitter:
        """创建递归字符分块器（通用）"""
        if separators is None:
            separators = ["\n\n", "\n", "。", ".", " ", ""]

        return RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=separators,
            length_function=len,
        )

    @staticmethod
    def create_markdown_splitter(
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ) -> MarkdownTextSplitter:
        """创建 Markdown 专用分块器"""
        return MarkdownTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

    @staticmethod
    def create_code_splitter(
        language: str = "python",
        chunk_size: int = 500,
        chunk_overlap: int = 100
    ) -> PythonCodeTextSplitter:
        """创建代码专用分块器"""
        return PythonCodeTextSplitter(
            language=language,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

    @staticmethod
    def split_documents(
        documents: List[Document],
        splitter
    ) -> List[Document]:
        """使用指定分块器分割文档

        Args:
            documents: 文档列表
            splitter: 分块器实例

        Returns:
            分割后的文档列表
        """
        return splitter.split_documents(documents)


def get_default_splitter() -> RecursiveCharacterTextSplitter:
    """获取默认分块器（中文优化）"""
    import os
    chunk_size = int(os.getenv("RAG_CHUNK_SIZE", "500"))
    chunk_overlap = int(os.getenv("RAG_CHUNK_OVERLAP", "50"))
    
    # 从环境变量获取分隔符，如果不存在则使用默认分隔符
    separators_env = os.getenv("RAG_SEPARATORS")
    if separators_env:
        # 用|分割字符串，处理转义字符
        separators = []
        for sep in separators_env.split('|'):
            # 处理转义字符
            sep = sep.replace('\\n', '\n').replace('\\t', '\t')
            if sep:  # 忽略空字符串
                separators.append(sep)
        # 确保最后一个为空字符串（字符级别分割）
        if '' not in separators:
            separators.append('')
    else:
        # 默认分隔符
        separators = [
            "\n\n",  # 段落分隔
            "\n",    # 换行
            "。",    # 句号
            ".",     # 英文句号
            "；",    # 分号
            ";",
            "，",    # 逗号
            ",",
            " ",     # 空格
            ""       # 字符
        ]
    
    return TextSplitter.create_recursive_splitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=separators
    )


def split_text_with_metadata(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    source: str = ""
) -> List[Document]:
    """带元数据的文本分割

    Args:
        text: 要分割的文本
        chunk_size: 块大小
        chunk_overlap: 块重叠大小
        source: 来源标识

    Returns:
        文档列表
    """
    splitter = get_default_splitter()
    docs = splitter.split_text(text)

    return [
        Document(
            page_content=doc,
            metadata={"source": source, "chunk_index": i}
        )
        for i, doc in enumerate(docs)
    ]