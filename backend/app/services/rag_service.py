# app/services/rag_service.py

import chromadb
import os

# ← chemin absolu depuis la racine du projet
BASE_DIR           = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KNOWLEDGE_BASE_DIR = os.path.join(BASE_DIR, "knowledge_base")
CHROMA_DB_DIR      = os.path.join(BASE_DIR, "chroma_db")

def init_rag():
    print(f"Knowledge base : {KNOWLEDGE_BASE_DIR}")
    print(f"Chroma DB      : {CHROMA_DB_DIR}")

    client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

    collection = client.get_or_create_collection(
        name="nouvelair_rules",
    )

    if collection.count() == 0:
        print("Indexation des documents...")
        _index_documents(collection)
        print(f"RAG pret : {collection.count()} chunks indexes")
    else:
        print(f"RAG pret : {collection.count()} chunks deja indexes")

    return collection


def _index_documents(collection):
    documents = []
    metadatas = []
    ids       = []
    chunk_id  = 0

    files = {
        "eu261.txt"    : "EU261",
        "montreal.txt" : "MONTREAL",
    }

    for filename, source in files.items():
        filepath = os.path.join(KNOWLEDGE_BASE_DIR, filename)
        print(f"Lecture fichier : {filepath}")

        if not os.path.exists(filepath):
            print(f"Fichier manquant : {filepath}")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        chunks = [c.strip() for c in content.split("===") if c.strip()]
        print(f"  → {len(chunks)} chunks trouves")

        for chunk in chunks:
            if len(chunk) > 50:
                documents.append(chunk)
                metadatas.append({"source": source, "filename": filename})
                ids.append(f"chunk_{chunk_id}")
                chunk_id += 1

    # ← vérifier avant d'ajouter
    if not documents:
        print("Aucun document trouve ! Verifie les fichiers knowledge_base")
        return

    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    print(f"{chunk_id} chunks indexes !")


def search_rules(query: str, n_results: int = 3) -> str:
    collection = init_rag()

    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )

    rules = []
    for i, doc in enumerate(results["documents"][0]):
        source = results["metadatas"][0][i]["source"]
        rules.append(f"[{source}]\n{doc}")

    return "\n\n".join(rules)