from fastapi import FastAPI, File, UploadFile
import uvicorn
import logging
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

    return result

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=4000)