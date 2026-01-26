import os
from dotenv import load_dotenv

load_dotenv()

try:
    from langchain_chroma import Chroma
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_classic.chains import create_retrieval_chain
    from langchain_classic.chains.combine_documents import create_stuff_documents_chain
    LANGCHAIN_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ LangChain packages not fully installed: {e}")
    LANGCHAIN_AVAILABLE = False
    # Define placeholders
    Chroma = None
    HuggingFaceEmbeddings = None
    ChatGoogleGenerativeAI = None
    ChatPromptTemplate = None
    create_retrieval_chain = None
    create_stuff_documents_chain = None

# --- CONFIGURATION ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DB_PATH = "chroma_db"

class SolarRAG:
    def __init__(self):
        print("⚙️ Loading RAG Engine...")
        
        if not LANGCHAIN_AVAILABLE:
            print("❌ LangChain packages not available. RAG functionality disabled.")
            self.available = False
            return
        
        self.available = True
        
        try:
            # 1. Setup Embedding
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

            # 3. Setup the LLM
            # Note: 'gemini-1.5-flash' is the current standard model name, but 'gemini-pro' works too.
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-flash-latest", 
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
            print("✅ RAG Engine Loaded Successfully")
        except Exception as e:
            print(f"❌ Failed to initialize RAG Engine: {e}")
            self.available = False

    def get_answer(self, query):
        if not self.available:
            return "⚠️ RAG Engine is not available. Please install langchain packages."
        
        try:
            response = self.rag_chain.invoke({"input": query})
            return response["answer"]
        except Exception as e:
            return f"⚠️ Error: {str(e)}"

if __name__ == "__main__":
    rag = SolarRAG()
    print("🤖 Testing RAG Engine...")
    print(rag.get_answer("What is the tariff rate for 5kW?"))