# %%
from langgraph.graph import StateGraph , START , END
from typing import TypedDict
import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser , PydanticOutputParser
from pydantic import BaseModel, Field
import mcpServers
from langchain_mcp_adapters.client import MultiServerMCPClient



class ChatState(TypedDict):
    standard : str
    document : bytes
    necessary_sections : list[str]
    audit_plan : list[str]
    ocr_result : str


class required_sections(BaseModel):
    req_sections : list[str] = Field(description = "list of the required sections in the document.")

class audit_plan_structure(BaseModel):
    audit_plan : list[str] = Field(description="This is the audit plan list")

def get_rules(state : ChatState) -> ChatState:
    llm = ChatGroq(
        api_key="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",
        model="openai/gpt-oss-120b",
    )

    parser = PydanticOutputParser(pydantic_object = required_sections)

    prompt = PromptTemplate(
        template = "Give me a complete list of required sections in a document for compliance with {standard} under Indian Financial Laws. /n {format_instruction}",
        input_variables = ['standard'],
        partial_variables = {'format_instruction': parser.get_format_instructions()},
    )

    chain = prompt | llm | parser
    result = chain.invoke({'standard' : state["standard"]})

    print(result)

    return {'necessary_sections' : result.req_sections}


def audit_plan_generator(state : ChatState) -> ChatState:
    llm = ChatGroq(
        api_key="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",
        model="openai/gpt-oss-120b",
    )

    parser = PydanticOutputParser(pydantic_object=audit_plan_structure)

    prompt = PromptTemplate(
        template="Provide me an audit plan for compliance with this standard - {standard} , for these sections - {sections} present in the document /n" \
        "{format_instructions}",
        input_variables=['standard' , 'sections'],
        partial_variables= {'format_instructions' : parser.get_format_instructions()}
    )

    chain = prompt | llm | parser

    result = chain.invoke({'standard' : state['standard'] , 'sections' : state["necessary_sections"]})
    # print(result)
    return {'audit_plan' : result.audit_plan}

def create_ocr_node(client):
    async def ocr_node(state : ChatState) -> ChatState:

        file_bytes = state['document']

        # MultiServerMCPClient doesn't have call_tool. Use get_tools instead.
        tools = await client.get_tools()
        print(f"Available tools: {[t.name for t in tools]}")
        
        ocr_tool = next((t for t in tools if t.name == "ocr" or t.name.endswith("ocr")), None)
        
        if not ocr_tool:
            return {'ocr_result': "Error: OCR tool not found."}
            
        # The 'ocr' tool in FastMCP expects a 'file' argument of type bytes.
        result = await ocr_tool.ainvoke({"file": file_bytes})

        return {'ocr_result' : result}
    
    return ocr_node


graph = StateGraph(ChatState)
client = MultiServerMCPClient(mcpServers.SERVERS) 

graph.add_node('get_rules' , get_rules)
graph.add_node('audit_plan_generator' , audit_plan_generator)

ocr_node = create_ocr_node(client=client)
graph.add_node('ocr_node' , ocr_node)
graph.add_edge(START, "get_rules")
graph.add_edge("get_rules", "audit_plan_generator")
graph.add_edge("audit_plan_generator", "ocr_node")
graph.add_edge("ocr_node" , END)

workflow = graph.compile()

# print(workflow)


# initial_state = {
#     "standard" : "Schedule 3"
# }


# final_result = workflow.ainvoke(initial_state)
