"""检索器 - 从向量存储中检索相关文档"""

import os
from typing import List, Dict, Any
from langchain_core.documents import Document


class RetrieverManager:
    """检索器管理器"""

    @staticmethod
    def create_basic_retriever(
        vector_store,
        k: int = 4,
        search_type: str = "similarity"
    ):
        """创建基础检索器"""
        return vector_store.as_retriever(
            search_type=search_type,
            search_kwargs={"k": k},
        )

    @staticmethod
    def create_mmr_retriever(
        vector_store,
        k: int = 4,
        fetch_k: int = 20,
        lambda_mult: float = 0.5
    ):
        """创建 MMR 检索器"""
        return vector_store.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": k,
                "fetch_k": fetch_k,
                "lambda_mult": lambda_mult,
            },
        )


def get_retriever(
    vector_store=None,
    k: int = None,
    retriever_type: str = "basic",
    knowledge_path: str = None,
    persist_directory: str = None
):
    """获取检索器"""
    if k is None:
        k = int(os.getenv("RAG_RETRIEVER_K", "4"))
    
    if persist_directory is None:
        persist_directory = os.getenv("RAG_PERSIST_DIR", "./data/vectorstore")
    
    if vector_store is None:
        if knowledge_path and os.path.exists(knowledge_path):
            from src.rag.vector_store import get_vector_store
            vector_store = get_vector_store(
                knowledge_path=knowledge_path,
                persist_directory=persist_directory,
            )
        else:
            raise ValueError("需要提供 vector_store 或 knowledge_path")

    if retriever_type == "mmr":
        return RetrieverManager.create_mmr_retriever(vector_store, k=k)
    else:
        return RetrieverManager.create_basic_retriever(vector_store, k=k)


def retrieve_documents(
    question: str,
    vector_store=None,
    knowledge_path: str = None,
    persist_directory: str = "./data/vectorstore",
    k: int = 4,
    retriever_type: str = "basic"
) -> List[Document]:
    """检索相关文档"""
    retriever = get_retriever(
        vector_store=vector_store,
        knowledge_path=knowledge_path,
        persist_directory=persist_directory,
        k=k,
        retriever_type=retriever_type,
    )

    return retriever.invoke(question)


def retrieve_with_score(
    question: str,
    vector_store,
    k: int = 4
) -> List[Dict[str, Any]]:
    """带相似度分数的检索"""
    docs_with_scores = vector_store.similarity_search_with_score(question, k=k)

    return [
        {
            "document": doc,
            "score": score,
            "content": doc.page_content,
            "metadata": doc.metadata,
        }
        for doc, score in docs_with_scores
    ]


def format_retrieved_context(documents: List[Document]) -> str:
    """格式化检索到的文档为上下文"""
    context_parts = []
    for i, doc in enumerate(documents, 1):
        source = doc.metadata.get("source", "未知来源")
        content = doc.page_content
        context_parts.append(f"【文档 {i}】来源: {source}\n{content}")

    return "\n\n".join(context_parts)