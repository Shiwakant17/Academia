from database import course_content, course_embeddings, search_logs
from embedding_service import generate_embedding
from datetime import datetime
import numpy as np


def add_course(course_id, course_name, description):
    """
    Save course content and embedding
    """

    # Save course details
    course_content.insert_one({
        "course_id": course_id,
        "course_name": course_name,
        "description": description
    })

    # Generate embedding
    vector = generate_embedding(
        course_name + " " + description
    )

    # Save embedding
    course_embeddings.insert_one({
        "course_id": course_id,
        "embedding": vector
    })

    return "Course added successfully"


def cosine_similarity(vector1, vector2):
    """
    Calculate similarity between two vectors
    """

    vector1 = np.array(vector1)
    vector2 = np.array(vector2)

    return np.dot(vector1, vector2) / (
        np.linalg.norm(vector1)
        * np.linalg.norm(vector2)
    )


def semantic_search(query, top_k=5):
    """
    Search courses based on meaning
    """

    # Save search log
    search_logs.insert_one({
        "query": query,
        "timestamp": datetime.now()
    })

    query_vector = generate_embedding(query)

    results = []

    for course in course_embeddings.find():

        score = cosine_similarity(
            query_vector,
            course["embedding"]
        )

        course_data = course_content.find_one({
            "course_id": course["course_id"]
        })

        results.append({
            "course_id": course["course_id"],
            "course_name": course_data["course_name"],
            "description": course_data["description"],
            "score": float(score)
        })

    # Sort by similarity
    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results[:top_k]


# Testing this file directly
if __name__ == "__main__":

    print(
        add_course(
            1,
            "Artificial Intelligence",
            "Machine learning, neural networks and search algorithms"
        )
    )

    print(
        add_course(
            2,
            "Python Programming",
            "Basic programming concepts, variables, loops and functions"
        )
    )

    print("\nSearch Results:\n")

    result = semantic_search(
        "Beginner programming subjects"
    )

    for course in result:
        print(course)