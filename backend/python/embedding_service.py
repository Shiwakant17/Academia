#from sentence_transformers import SentenceTransformer

# Load the embedding model
#model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text):
    """
    Convert text into vector embedding
    """

    embedding = model.encode(text)

    return embedding.tolist()


# Test the file directly
if __name__ == "__main__":

    sample_text = "Introduction to Artificial Intelligence and Machine Learning"

    vector = generate_embedding(sample_text)

    print("Embedding Generated Successfully")
    print("Vector Length:", len(vector))
    print("First 10 Values:", vector[:10])