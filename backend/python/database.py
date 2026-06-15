from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get MongoDB details
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Create connection
client = MongoClient(MONGO_URI)

# Select database
db = client[DATABASE_NAME]

# Collections
course_content = db["course_content"]
course_embeddings = db["course_embeddings"]
search_logs = db["search_logs"]

print("MongoDB Atlas Connected Successfully")