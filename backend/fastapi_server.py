from fastapi import FastAPI, File, UploadFile
import uvicorn
import logging

# Configure logging to show INFO messages
logging.basicConfig(level=logging.INFO)
from fastapi.middleware.cors import CORSMiddleware
from server import workflow

app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ocr")
async def get_docs_for_ocr(file: UploadFile = File(...)):
    logging.info(f"this is the file {file}")
    content = await file.read()

    result = await workflow.ainvoke({
        "standard":"Schedule 3",
        "document" : content
    })

    # Remove binary document from result to avoid FastAPI serialization errors
    if "document" in result:
        del result["document"]
    
    logging.info(f"this is the result {result}")

    return result

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=4000)