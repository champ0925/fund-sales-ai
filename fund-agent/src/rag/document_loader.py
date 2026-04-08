"""文档加载器 - 支持 txt 文件"""

import os
from typing import List
from langchain_core.documents import Document


def load_txt_file(file_path: str, encoding: str = "utf-8") -> str:
    """加载单个 txt 文件

    Args:
        file_path: 文件路径
        encoding: 编码

    Returns:
        文件内容
    """
    with open(file_path, 'r', encoding=encoding, errors='ignore') as f:
        return f.read()


def load_knowledge_directory(
    knowledge_path: str,
    encoding: str = "utf-8"
) -> List[Document]:
    """加载 knowledge 目录下的所有 txt 文件

    Args:
        knowledge_path: 知识库目录路径
        encoding: 编码

    Returns:
        文档列表
    """
    documents = []

    if not os.path.isdir(knowledge_path):
        print(f"⚠️ 知识库目录不存在: {knowledge_path}")
        return documents

    # 遍历目录下所有 txt 文件
    for file_name in os.listdir(knowledge_path):
        if file_name.endswith('.txt'):
            file_path = os.path.join(knowledge_path, file_name)
            try:
                content = load_txt_file(file_path, encoding)
                doc = Document(
                    page_content=content,
                    metadata={
                        "source": file_name,
                        "file_path": file_path
                    }
                )
                documents.append(doc)
                print(f"✅ 加载知识库文件: {file_name}")
            except Exception as e:
                print(f"❌ 加载文件失败 {file_name}: {e}")

    return documents


def get_knowledge_path(rag_base_path: str = None) -> str:
    """获取知识库路径

    Args:
        rag_base_path: RAG 模块的基础路径，默认当前文件所在目录

    Returns:
        知识库目录路径
    """
    if rag_base_path is None:
        # 首先从环境变量获取
        env_path = os.getenv("RAG_KNOWLEDGE_PATH")
        if env_path:
            return env_path
        
        # 默认指向 fund-agent/src/rag/knowledge
        current_dir = os.path.dirname(os.path.abspath(__file__))
        rag_base_path = os.path.join(current_dir, "knowledge")  # fund-agent/src/rag/knowledge

    return rag_base_path