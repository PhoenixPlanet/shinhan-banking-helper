from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model(model_path):
    """모델 로드"""
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)

    model.to(device) # type: ignore
    model.eval()
    
    return tokenizer, model
    
def classify_term(term, model, tokenizer, threshold=0.42):
    """용어 분류"""
    inputs = tokenizer(
        term,
        return_tensors="pt",
        truncation=True,
        max_length=32,
        padding=True
    )
    
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.softmax(outputs.logits, dim=1)
        confidence = predictions[0][1].item()
        
    is_financial = confidence >= threshold
    
    result = {
        'term': term,
        'is_financial': is_financial,
    }
    
    return result;

def classify_terms_batch(terms, model, tokenizer, threshold=0.42):
    """용어 배치 분류"""
    inputs = tokenizer(
        terms,
        return_tensors="pt",
        truncation=True,
        max_length=32,
        padding=True
    )
    
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.softmax(outputs.logits, dim=1)
        confidences = predictions[:, 1].tolist()  # 금융 클래스의 확률
    
    threshold = float(os.getenv('THRESHOLD', 0.42))
    results = []
    
    for i, term in enumerate(terms):
        try:
            confidence = confidences[i]
            is_financial = confidence >= threshold
            
            result = {
                'term': term,
                'is_financial': is_financial,
            }
            
            results.append(result)
            
        except Exception as e:
            results.append({
                'term': term,
                'error': str(e)
            })
            
    return results