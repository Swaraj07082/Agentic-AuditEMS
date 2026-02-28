SERVERS = {
    "ocr": {
        "transport": "stdio",
        "command": "/snap/bin/uv",
        "args": [
            "run",
            "--project",
            "/home/swaraj/projects/AuditEMS/OCRserver",
            "python3",
            "/home/swaraj/projects/AuditEMS/OCRserver/main.py"
        ]
    }
}
