from langgraph.graph import StateGraph , START , END
from typing import TypedDict
import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser


class ChatState(TypedDict):
    standard : str
    document : str
    # required_docs : list[str]


def get_rules(state : ChatState) -> ChatState:
    llm = ChatGroq(
        api_key=os.environ["AUDITEMS_KEY"],
        model="deepseek-r1-distill-llama-70b",
    )

    parser = JsonOutputParser()

    prompt = PromptTemplate(
        template = "Give me the required documents for this particular {standard} according to Indian Financial Laws /n {format_instruction}",
        input_variables = ['standard'],
        partial_variables = {'format_instruction': parser.get_format_instructions()},
    )

    chain = prompt | llm | parser
    result = chain.invoke({'standard' : state["standard"]})
    print(result)
    return state


graph = StateGraph(ChatState)

graph.add_node('get_rules' , get_rules)

graph.add_edge(START, "get_rules")
graph.add_edge("get_rules", END)

workflow = graph.compile()

print(workflow)






