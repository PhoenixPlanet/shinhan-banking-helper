from typing import Dict, Any, Optional
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field, SecretStr

load_dotenv()

class DefineResult(BaseModel):
    term: str = Field(description="용어/문장")
    definition: str = Field(description="대상의 정의/설명")
    category: str = Field(description="대상의 카테고리 (예: 은행업무, 금융상품, 계좌관리 등)")

class LLMDefine:
    def __init__(self, api_key: str | None, model_name: str = "gemini-2.5-flash"):
        if not api_key:
            raise ValueError("api_key is required")
        
        self.api_key = api_key
        self.model_name = model_name
        
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            api_key=SecretStr(api_key),
            temperature=0.3
        ).with_structured_output(DefineResult)
        
        self.system_prompt = """당신은 금융 용어 해설 전문가입니다.
특히 은행 웹사이트에서 자주 볼 수 있는 용어들을 친근하고 명확하게 설명하는 것이 목표입니다.

응답은 다음 JSON 형식으로 해주세요:
{
    "term": "대상 용어/문장",
    "definition": "대상의 정의/설명 (일반 사용자가 이해하기 쉽게)",
    "category": "대상의 카테고리 (예: 은행업무, 금융상품, 계좌관리 등)",
}

설명할 때 주의사항:
1. 전문적인 용어는 최대한 쉽게 풀어서 설명
2. 실제 사용 예시나 상황을 포함
3. 은행 고객의 관점에서 이해하기 쉽게 작성
4. 너무 길지 않게 핵심만 간결하게 설명
"""

        self.define_prompt = [
            SystemMessage(content=self.system_prompt),
        ]

    def define_term_from_image(self, base64_image: str) -> Optional[Dict[Any, Any]]:
        """용어 분석 요청 (이미지 입력)"""
        try:
            if base64_image.startswith('data:image'):
                base64_image = base64_image.split(',')[1]
            
            image_prompt = HumanMessage(
                content=[
                    {"type" : "text", "text" : "다음 이미지에서 인식된 텍스트의 의미를 설명해주세요. 이미지에 텍스트가 문장으로 나타나있다면 문장을 대상으로 설명하고, 만약 텍스트가 여러 개 인식된다면 사용자가 가장 어려워하거나 궁금해할 것 같은 용어/문장을 대상으로 분석하세요. 이미지에 텍스트가 보이지 않거나 인식이 어려운 경우 term 필드를 '인식 불가'로 설정해주세요."},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            )

            messages = self.define_prompt + [image_prompt]
            response = self.llm.invoke(messages)
            
            if isinstance(response, BaseModel):
                response = response.model_dump()
        
            if not self._validate_response(response) or response['term'] == '인식 불가':
                return None
            
            return response
            
        except Exception as e:
            print(f"이미지 처리 중 오류 발생: {e}")
            return None
    
    def define_term_from_text(self, term: str) -> Optional[Dict[Any, Any]]:
        """용어 분석 요청"""
        try:
            text_prompt = HumanMessage(
                content=[
                    {"type" : "text", "text" : "다음 용어의 의미를 설명해주세요: {term}".format(term=term)}
                ]
            )
            
            messages = self.define_prompt + [text_prompt]
            response = self.llm.invoke(messages)
            
            if isinstance(response, BaseModel):
                response = response.model_dump()
            
            if not self._validate_response(response) or response['term'] != term:
                return None
            
            return response
            
        except Exception as e:
            print(f"텍스트 처리 중 오류 발생: {e}")
            return None
    
    def _validate_response(self, response: Dict[Any, Any]) -> bool:
        """응답 유효성 검증"""
        required_fields = ['term', 'definition', 'category']
        
        for field in required_fields:
            if field not in response or not response[field]:
                return False
        
        return True
