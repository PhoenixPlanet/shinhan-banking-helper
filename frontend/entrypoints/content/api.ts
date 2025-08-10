import { logger } from "../utils/logger";

interface DefineResult {
    term: string;
    definition: string;
    category: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://192.168.0.3:5001';

/**
 * 용어 분류 API
 * @param terms 분류 대상 용어 배열
 * @returns 용어 분류 결과
 */
export async function classifyBatch(terms: string[]) {
    try {
        logger.info('API_URL', API_URL);
        const response = await fetch(`${API_URL}/classify_batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ terms }),
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('API 호출 중 에러 발생', { 
                status: response.status,
                statusText: response.statusText,
                errorText: errorText,
                url: response.url
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        const results = data.results;
        return results;

    } catch (error: any) {
        logger.error('분류 API 호출 중 에러 발생', {
            errorType: error.constructor.name,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            terms: terms,
            termsCount: terms.length,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

/**
 * LLM API를 호출해 툴팁 대상 텍스트의 용어 분석
 * @param text 툴팁 대상 단어(텍스트)
 * @returns 툴팁 대상 단어의 분석 결과
 */
export async function defineTermFromText(text: string): Promise<DefineResult> {
    try {
        const response = await fetch(`${API_URL}/define_term_text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                term: text 
            }),
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('API 호출 중 에러 발생', { 
                status: response.status,
                statusText: response.statusText,
                errorText: errorText,
                url: response.url,
                term: text
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return data as DefineResult;

    } catch (error: any) {
        logger.error('텍스트 용어 분석 API 호출 중 에러 발생', {
            errorType: error.constructor.name,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            term: text,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

/**
 * 이미지에서 용어를 인식하고 분석하는 API
 * @param imageBase64 base64로 인코딩된 이미지 데이터
 * @returns 용어 분석 결과
 */
export async function defineTermFromImage(imageBase64: string): Promise<DefineResult> {
    try {
        const response = await fetch(`${API_URL}/define_term_image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                image: imageBase64 
            }),
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('API 호출 중 에러 발생', { 
                status: response.status,
                statusText: response.statusText,
                errorText: errorText,
                url: response.url
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        return data as DefineResult;

    } catch (error: any) {
        logger.error('이미지 용어 분석 API 호출 중 에러 발생', {
            errorType: error.constructor.name,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            imageDataLength: imageBase64.length,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}

/**
 * 자연어 요청을 받아 메뉴 추천 결과 반환
 * @param request 자연어 요청
 * @returns 메뉴 추천 결과
 */
export async function recommendMenu(request: string): Promise<{
    success: boolean;
    category?: string;
    selected_menu?: string;
    candidate_menus?: string[];
    description?: string;
} | null> {
    try {
        const response = await fetch(`${API_URL}/recommend_menu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                request: request 
            }),
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('메뉴 추천 API 호출 중 에러 발생', { 
                status: response.status,
                statusText: response.statusText,
                errorText: errorText,
                url: response.url,
                request: request
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();

        return {
            success: data.success,
            category: data.result?.category,
            selected_menu: data.result?.selected_menu,
            candidate_menus: data.result?.candidate_menus,
            description: data.result?.description
        }

    } catch (error: any) {
        logger.error('메뉴 추천 API 호출 중 에러 발생', {
            errorType: error.constructor.name,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            request: request,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}