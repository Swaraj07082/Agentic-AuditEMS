from fastmcp import FastMCP

mcp = FastMCP(name = "OCRserver")

@mcp.tool
def add_numbers(a : int , b : int) -> int :
    return a + b


if __name__ == "__main__":
    mcp.run()
