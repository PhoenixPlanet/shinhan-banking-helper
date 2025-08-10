from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field, SecretStr
import json
import os

load_dotenv()

class CategorySearchResult(BaseModel):
    category: str = Field(description="선택된 카테고리 이름")
    description: str = Field(description="해당 카테고리에 대한 설명")

class MenuSearchResult(BaseModel):
    selected_menu: str = Field(description="선택된 메뉴 이름")
    description: str = Field(description="해당 메뉴에 대한 설명")
    candidate_menus: List[str] = Field(description="해당 메뉴 이외에 가능한 후보 메뉴 목록")

class LLMMenuFinder:
    def __init__(self, api_key: str | None, model_name: str = "gemini-2.5-flash"):
        if not api_key:
            raise ValueError("api_key is required")
        
        self.api_key = api_key
        self.model_name = model_name
        
        self.category_llm = ChatGoogleGenerativeAI(
            model=model_name,
            api_key=SecretStr(api_key),
            temperature=0.3
        ).with_structured_output(CategorySearchResult)
        
        self.menu_llm = ChatGoogleGenerativeAI(
            model=model_name,
            api_key=SecretStr(api_key),
            temperature=0.3
        ).with_structured_output(MenuSearchResult)
        
        # 메뉴 데이터 로드
        self.menu_data = self._load_menu_data()
        self.all_top_menus = self._get_top_level_menus()
        self.all_available_menus = self._get_all_available_menus()
        
        self.system_prompt = """당신은 은행 메뉴 안내 전문가입니다.
사용자가 원하는 은행 서비스를 찾아주는 것이 목표입니다.

주어진 메뉴 목록에서 사용자의 요청에 가장 적합한 메뉴를 선택하고, 해당 메뉴에 대한 설명을 제공해야 합니다.

우선 상위 카테고리부터 선택한 후, 해당 카테고리의 하위 메뉴들 중 적절한 메뉴를 선택하면 됩니다.

{res_format}

메뉴 선택 시 주의사항:
1. 사용자의 요청을 정확히 이해하고 가장 관련성 높은 메뉴 선택
2. 은행 고객의 관점에서 이해하기 쉽게 설명
3. 해당 메뉴의 주요 기능과 용도를 간결하게 설명
4. 실제 사용 시나리오를 포함하여 설명
"""

        self.res_format = """응답은 다음 JSON 형식으로 해주세요.
카테고리 선택 시:
{
    "category": "선택된 카테고리 이름",
    "description": "선택된 카테고리에 대한 설명"
}

메뉴 선택 시:
{
    "selected_menu": "선택된 메뉴 이름",
    "description": "선택된 메뉴에 대한 설명"
}
"""

        self.search_prompt = [
            SystemMessage(content=self.system_prompt.format(res_format=self.res_format)),
        ]

    def find_menu(self, user_request: str) -> Optional[Dict[str, Any]]:
        """메뉴 찾기 요청"""
        try:
            category_text = "\n".join([f"- {category}" for category in self.all_top_menus])
            user_prompt1 = HumanMessage(content=f"사용자 요청: {user_request}\n\n위 요청에 맞게 우선 카테고리를 선택해주세요.\n\n사용 가능한 카테고리 목록:\n{category_text}")
            
            messages = self.search_prompt + [user_prompt1]
            response = self.category_llm.invoke(messages)
            
            if isinstance(response, BaseModel):
                response = response.model_dump()
            
            if not self._validate_category_response(response):
                return None
            
            category = response['category']
            sub_menus = self._get_sub_menus(category)
            print(sub_menus)
            sub_menu_text = "\n".join([f"- {menu}" for menu in sub_menus])
            
            category_response = AIMessage(content=f"카테고리: {category}\n\n해당 카테고리에 대한 설명: {response['description']}")
            user_prompt2 = HumanMessage(content=f"카테고리: {category}\n\n해당 카테고리의 하위 메뉴들 중 적절한 메뉴를 선택해주세요. 만약 사용자가 원할 것으로 추측되는 메뉴의 후보가 여러 개라면 그 중 가장 적합한 메뉴를 selected_menu로 선택하고, 이외의 후보 메뉴는 candidate_menus에 추가해주세요.\n\n사용 가능한 메뉴 목록:\n{sub_menu_text}")
            
            messages = self.search_prompt + [user_prompt1, category_response, user_prompt2]
            response = self.menu_llm.invoke(messages)
            
            if isinstance(response, BaseModel):
                response = response.model_dump()
            
            if not self._validate_menu_response(response):
                return None
            
            return {
                'category': category,
                'selected_menu': response['selected_menu'],
                'candidate_menus': response['candidate_menus'],
                'description': response['description']
            }
            
        except Exception as e:
            print(f"메뉴 검색 중 오류 발생: {e}")
            return None

    def _validate_category_response(self, response: Dict[str, Any]) -> bool:
        """카테고리 응답 유효성 검증"""
        required_fields = ['category', 'description']
        
        for field in required_fields:
            if field not in response or not response[field]:
                return False
        
        if response['category'] not in self.all_top_menus:
            return False
        
        return True
    
    def _validate_menu_response(self, response: Dict[str, Any]) -> bool:
        """메뉴 응답 유효성 검증"""
        required_fields = ['selected_menu', 'description']
        
        for field in required_fields:
            if field not in response or not response[field]:
                return False
        
        if response['selected_menu'] not in self.all_available_menus:
            return False
        
        for menu in response['candidate_menus']:
            if menu not in self.all_available_menus:
                return False
        
        return True
    
    def _load_menu_data(self) -> List[Dict[str, Any]]:
        """menu.json 파일에서 메뉴 데이터 로드"""
        try:
            menu_file_path = os.path.join(os.path.dirname(__file__), 'menu.json')
            with open(menu_file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            return []
        
    def _get_top_level_menus(self) -> List[str]:
        """상위 메뉴 목록 반환"""
        return [menu['text'] for menu in self.menu_data if menu.get('depth') == 0]

    def _get_sub_menus(self, top_menu: str) -> List[str]:
        """특정 상위 메뉴의 하위 메뉴 목록 반환"""
        for menu in self.menu_data:
            if menu['text'] == top_menu and menu.get('children'):
                return [child['text'] for child in menu['children']]
        return []
    
    def _get_all_available_menus(self) -> List[str]:
        """모든 메뉴 목록 반환"""
        all_menus = []
        for top_menu in self.all_top_menus:
            all_menus.extend(self._get_sub_menus(top_menu))
        return all_menus
