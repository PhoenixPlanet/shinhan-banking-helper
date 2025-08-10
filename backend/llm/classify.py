from typing import List, Dict, Any
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field, SecretStr

load_dotenv()

class ClassifyResult(BaseModel):
    term: str = Field(description="분류할 용어")
    is_financial: bool = Field(description="금융 용어 여부")

    
class ClassifyBatchResult(BaseModel):
    results: List[ClassifyResult] = Field(description="분류 결과 리스트")


class LLMClassifier:
    def __init__(self, api_key: str | None, model_name: str = "gemini-2.5-flash"):
        if not api_key:
            raise ValueError("api_key is required")
        
        self.api_key = api_key
        self.model_name = model_name
        
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            api_key=SecretStr(api_key),
            temperature=0.1
        ).with_structured_output(ClassifyResult)
        
        self.batch_llm = ChatGoogleGenerativeAI(
            model=model_name,
            api_key=SecretStr(api_key),
            temperature=0.1
        ).with_structured_output(ClassifyBatchResult)
        
        # 시스템 프롬프트 정의
        self.system_prompt = """당신은 금융 용어 분류 전문가입니다. 
주어진 단어나 구문이 금융/경제 관련 용어인지 아닌지를 판단해야 합니다.
여기서 말하는 금융 용어란, 사용자가 은행 웹페이지를 사용하면서 어려움을 느껴 해설을 봐야겠다고 판단되는 용어를 의미합니다.

각 용어에 대해 다음 JSON 형식으로 응답하세요:
{res_format}
"""

        self.res_format_one = """
{
    "term": "대상 단어/구문",
    "is_financial": true/false,
}
"""

        self.res_format_batch = """
[
    {
        "term": "대상 단어/구문",
        "is_financial": true/false,
    },
    {
        "term": "대상 단어/구문",
        "is_financial": true/false,
    },
    ...
]
"""

        # 단일 용어 분류 프롬프트트
        self.classify_prompt = ChatPromptTemplate([
            ("system", self.system_prompt),
            ("human", "다음 단어/구문이 금융 용어인지 분류해주세요: {target_term}")
        ])
        
        # 여러 용어 배치 분류 프롬프트
        self.batch_prompt = ChatPromptTemplate([
            ("system", self.system_prompt),
            ("human", "다음 단어/구문들이 금융 용어인지 분류해주세요: {target_terms}")
        ])

    def classify_term(self, term: str) -> Dict[Any, Any] | None:
        """단일 용어 분류"""
        try:
            messages = self.classify_prompt.invoke({"target_term": term, "res_format": self.res_format_one})
            response = self.llm.invoke(messages)
            
            if (isinstance(response, BaseModel)):
                response = response.model_dump()
            
            if (not self._validate_response(response) or response['term'] != term):
                return None
            
            return response
            
        except Exception as e:
            print("error: ", e)
            return None
        
    def classify_terms_batch(self, terms: List[str]) -> List[Dict[Any, Any]] | None:
        """여러 용어 배치 분류"""
        if not terms:
            return None
        
        try:
            if len(terms) == 1:
                result = self.classify_term(terms[0])
                return [result] if result is not None else None
            
            terms_text = ", ".join(terms)
            messages = self.batch_prompt.invoke({"target_terms": terms_text, "res_format": self.res_format_batch})
        
            response = self.batch_llm.invoke(messages)
            if (isinstance(response, BaseModel)):
                response = response.model_dump()
                if ('results' in response):
                    response = response['results']
                else:
                    return None
            
            result_dict = {}
            for res in response:
                if (self._validate_response(res)):
                    result_dict[res['term']] = res['is_financial']
                
            results = []
            for term in terms:
                if (term in result_dict):
                    results.append({
                        'term': term,
                        'is_financial': result_dict[term]
                    })
                else:
                    results.append({
                        'term': term,
                        'is_financial': False
                    })
                    
            return results
        
        except Exception as e:
            return None
        
    def _validate_response(self, response: Dict[Any, Any]) -> bool:
        """응답 유효성 검증"""
        if ('term' not in response or 'is_financial' not in response):
            return False
        
        if (type(response['is_financial']) != bool):
            return False
        
        return True
