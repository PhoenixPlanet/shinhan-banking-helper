import pandas as pd
import os
from rapidfuzz import fuzz, process

def load_fin_dictionary(fin_terms_path):
    """금융 용어 사전 로드"""
    if not os.path.exists(fin_terms_path):
        return [], {}
    
    fin_terms_df = pd.read_csv(fin_terms_path)
    fin_terms = fin_terms_df['용어'].fillna('').tolist()
    fin_dict = dict(zip(fin_terms_df['용어'], fin_terms_df['설명']))
    
    return fin_terms, fin_dict

def get_fin_term_definition(fin_terms, fin_dict, query):
    """금융 용어 정의 유사도 기반 검색"""
    matches = process.extract(query, fin_terms, limit=3, scorer=fuzz.token_set_ratio, score_cutoff=60)
    
    result = []
    if matches and len(matches) > 0:
        for term, score, _ in matches:
            result.append({
                'term': term,
                'definition': fin_dict[term],
                'score': score
            })
    
    return result