from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_cors import CORS
import os
from dotenv import load_dotenv
from fin_bert import load_model, classify_term, classify_terms_batch
from fin_dictionary import load_fin_dictionary, get_fin_term_definition
from llm import LLMClassifier, LLMDefine, LLMMenuFinder

load_dotenv()

app = Flask(__name__)
CORS(app)

tokenizer, model = load_model(os.getenv('MODEL_PATH', "PhoenixPlanet/fin_bert"))

# 금융 용어 사전 로드
fin_terms_path = os.getenv('FIN_TERMS_PATH', "fin_terms.csv")
fin_terms, fin_dict = load_fin_dictionary(fin_terms_path)

# langchain llm
llm_classifier = LLMClassifier(
    api_key=os.getenv('GEMINI_KEY'),
    model_name=os.getenv('LLM_MODEL', 'gemini-2.5-flash')
)

llm_definer = LLMDefine(
    api_key=os.getenv('GEMINI_KEY'),
    model_name=os.getenv('LLM_MODEL', 'gemini-2.5-flash')
)

# 메뉴 찾기 LLM
llm_menu_finder = LLMMenuFinder(
    api_key=os.getenv('GEMINI_KEY'),
    model_name=os.getenv('LLM_MODEL', 'gemini-2.5-flash')
)


@app.route('/')
def index():
    """
    메인 웹페이지
    """
    return render_template('index.html')


@app.route('/classify', methods=['POST'])
def classify_term_api():
    """
    단어를 입력받아 금융 용어인지 아닌지 분류하는 API
    """
    try:
        data = request.get_json()
        
        if not data or 'term' not in data:
            return jsonify({'error': 'term 필드가 필요합니다'}), 400
        
        term = data['term']
        result = classify_term(term, model, tokenizer, threshold=float(os.getenv('THRESHOLD', 0.42)))
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/classify_batch', methods=['POST']) 
def classify_terms_batch_api():
    """
    여러 단어를 한번에 입력받아 금융 용어인지 아닌지 분류하는 API (배치 처리)
    """
    try:
        data = request.get_json()
        
        if not data or 'terms' not in data:
            return jsonify({'error': 'terms 필드가 필요합니다'}), 400
        
        terms = data['terms']
        if not isinstance(terms, list):
            return jsonify({'error': 'terms는 리스트 형태여야 합니다'}), 400
        
        if len(terms) == 0:
            return jsonify({'results': []})
        
        results = classify_terms_batch(terms, model, tokenizer, threshold=float(os.getenv('THRESHOLD', 0.42)))
        return jsonify({'results': results})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/classify_llm', methods=['POST'])
def classify_term_llm_api():
    """
    LLM을 사용하여 단어를 입력받아 금융 용어인지 아닌지 분류하는 API
    """
    try:
        data = request.get_json()
        
        if not data or 'term' not in data:
            return jsonify({'error': 'term 필드가 필요합니다'}), 400
        
        term = data['term']
        result = llm_classifier.classify_term(term)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/classify_llm_batch', methods=['POST']) 
def classify_terms_llm_batch_api():
    """
    LLM을 사용하여 여러 단어를 한번에 입력받아 금융 용어인지 아닌지 분류하는 API (배치 처리)
    """
    try:
        data = request.get_json()
        
        if not data or 'terms' not in data:
            return jsonify({'error': 'terms 필드가 필요합니다'}), 400
        
        terms = data['terms']
        if not isinstance(terms, list):
            return jsonify({'error': 'terms는 리스트 형태여야 합니다'}), 400
        
        if len(terms) == 0:
            return jsonify({'results': []})
        
        results = llm_classifier.classify_terms_batch(terms)
        if (results is None):
            raise Exception('LLM 분류 중 오류가 발생했습니다.')
            
        return jsonify({'results': results})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/fin_term_definition', methods=['GET'])
def get_fin_term_definition_api():
    """
    금융 용어 사전에서 용어를 검색하는 API
    """
    query = request.args.get('term')
    if not query:
        return jsonify({'error': 'term 파라미터가 필요합니다'}), 400
    
    result = get_fin_term_definition(fin_terms, fin_dict, query)
    if result and len(result) > 0:
        return jsonify({'results': result})
    
    return jsonify({'error': '해당 용어를 찾을 수 없습니다'}), 404


@app.route('/define_term_text', methods=['POST'])
def define_term_from_text_api():
    """
    LLM을 사용해 대상 용어를 분석하는 API
    """
    try:
        data = request.get_json()
        
        if not data or 'term' not in data:
            return jsonify({'error': 'term 필드가 필요합니다'}), 400
        
        term = data['term']
        result = llm_definer.define_term_from_text(term)
        
        if result:
            return jsonify(result)
        else:
            return jsonify({'error': '용어 정의를 가져오는데 실패했습니다'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/define_term_image', methods=['POST'])
def define_term_from_image_api():
    """
    LLM을 사용해 이미지 내의 텍스트를 분석하는 API
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'image 필드가 필요합니다 (base64 인코딩된 이미지)'}), 400
        
        image_data = data['image']
        result = llm_definer.define_term_from_image(image_data)
        
        if result:
            return jsonify(result)
        else:
            return jsonify({'error': '이미지에서 용어를 인식하거나 정의를 가져오는데 실패했습니다'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/recommend_menu', methods=['POST'])
def find_menu_api():
    """
    사용자 요청에 따라 적절한 은행 메뉴를 찾는 API
    """
    try:
        data = request.get_json()
        
        if not data or 'request' not in data:
            return jsonify({'error': 'request 필드가 필요합니다'}), 400
        
        user_request = data['request']
        result = llm_menu_finder.find_menu(user_request)
        
        if result:
            return jsonify({
                'success': True,
                'result': result
            })
        else:
            return jsonify({
                'success': False,
                'message': '적절한 메뉴를 찾을 수 없습니다.'
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """
    서버 상태 확인 API
    """
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    ssl_cert = os.getenv('SSL_CERT', 'cert.pem')
    ssl_key = os.getenv('SSL_KEY', 'key.pem')
    use_ssl = os.getenv('USE_SSL', 'true').lower() == 'true'
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5001))
    
    if use_ssl and os.path.exists(ssl_cert) and os.path.exists(ssl_key):
        # HTTPS로 실행 (SSL 인증서 사용)
        app.run(debug=True, host=host, port=port, ssl_context=(ssl_cert, ssl_key))
    else:
        # HTTP로 실행
        app.run(debug=True, host=host, port=port)