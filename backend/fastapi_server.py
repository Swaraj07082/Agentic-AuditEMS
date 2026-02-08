from fastapi import FastAPI, File, UploadFile
from fastapi.middleware import cors
import uvicorn

app = FastAPI()


@app.post("/ocr/")
async def get_docs_for_ocr(file: UploadFile = File(...)):
    content = await file.read()

    return {
        "filename": file.filename,
        "size": len(content)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=4000)