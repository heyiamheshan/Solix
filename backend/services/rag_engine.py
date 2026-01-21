import os
from langchain_chroma import Chroma
# --- CHANGE THIS LINE ---
from langchain_community.embeddings import HuggingFaceEmbeddings # <--- Use Community version (More stable)
# ------------------------
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# --- CONFIGURATION ---
GOOGLE_API_KEY = "AIzaSyD01ZLcgyf9fs_eCcN5YAb2TfyA3eUWB-Q"  # <--- PASTE YOUR KEY HERE (Still needed for the Chat Answer)
DB_PATH = "chroma_db"

class SolarRAG:
    def __init__(self):
        print("⚙️ Loading RAG Engine...")
        
        # 1. Setup Embedding (Using Local HuggingFace to match database)
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        # 2. Load the Vector Database
        if os.path.exists(DB_PATH):
            self.vector_db = Chroma(
                persist_directory=DB_PATH, 
                embedding_function=self.embeddings
            )
            self.retriever = self.vector_db.as_retriever(search_kwargs={"k": 5})
        else:
            raise Exception("❌ Database not found! Run build_memory.py first.")

        # 3. Setup the LLM (Gemini is still used to WRITE the answer)
       # 3. Setup the LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",  # <--- TRY THIS EXACT NAME
            google_api_key=GOOGLE_API_KEY,
            temperature=0.3
        )
        # 4. Create the Prompt
        system_prompt = (
            "You are SOLIX, a specialized expert on Sri Lankan Solar Energy. "
            "Use the retrieved context below to answer the user's question. "
            "If the answer is not in the context, say 'I do not have that information'. "
            "Always quote prices in LKR."
            "\n\n"
            "{context}"
        )

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])

        # 5. Build Chain
        self.question_answer_chain = create_stuff_documents_chain(self.llm, self.prompt)
        self.rag_chain = create_retrieval_chain(self.retriever, self.question_answer_chain)

    def get_answer(self, query):
        try:
            response = self.rag_chain.invoke({"input": query})
            return response["answer"]
        except Exception as e:
            return f"⚠️ Error: {str(e)}"

if __name__ == "__main__":
    rag = SolarRAG()
    print("🤖 Testing RAG Engine...")
    print(rag.get_answer("What is the tariff rate for 5kW?"))