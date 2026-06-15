from fastapi import FastAPI
from pydantic import BaseModel
from search_service import add_course, semantic_search


app = FastAPI(
    title="Academic Semantic Search API",
    version="1.0"
)


class CourseRequest(BaseModel):
    course_id: int
    course_name: str
    description: str


class SearchRequest(BaseModel):
    query: str


@app.get("/")
def home():
    return {
        "message": "Semantic Search Service Running Successfully"
    }


@app.post("/add-course")
def add_new_course(course: CourseRequest):

    result = add_course(
        course.course_id,
        course.course_name,
        course.description
    )

    return {
        "message": result
    }


@app.post("/search")
def search_course(search: SearchRequest):

    results = semantic_search(
        search.query
    )

    return {
        "query": search.query,
        "results": results
    }