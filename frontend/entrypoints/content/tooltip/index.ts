import { TargetNode } from "./types";
import { tooltipQueue } from "./tooltip_queue";
import { createTextNodeWalker } from "./text_node_walker";
import { logger } from "../../utils/logger";

const WORD_REGEX = /\p{L}+(?:[’'\-]\p{L}+)*|\p{N}+(?:[.,]\p{N}+)?/gu;

let start_processing = false;

/**
 * 텍스트 노드 워커를 생성하여 텍스트 노드를 순회하며 분석 배치 큐에 추가
 */
export function startProcessTooltip(root: Node = document.body) {
    logger.info('startProcessTooltip');
    const walker = createTextNodeWalker(root);
    let currentNode: Node | null = null;

    while (currentNode = walker.nextNode()) {
        if (currentNode instanceof Text) {
            enqueueTooltipBatch(currentNode);
        }
    }

    if (!start_processing) {
        start_processing = true;
        tooltipQueue.process();
    }

    setTimeout(() => {
        startProcessTooltip();
    }, 1000);
}

/**
 * 텍스트 노드를 단어 단위로 나눈 후 분석 배치 큐에 추가
 * @param textNode 분석 대상 텍스트 노드
 */
export function enqueueTooltipBatch(textNode: Text) {
    const text = textNode.nodeValue || '';
    if (!text.trim()) return;

    const regex = WORD_REGEX;
    regex.lastIndex = 0;

    const parent = textNode.parentNode!;

    (parent as HTMLElement).setAttribute('data-enqueued', '1');

    const targetNode: TargetNode = {
        parent,
        originalText: textNode,
        fragments: [],
        count: 0,
    };

    // targetNode.fragments.push({
    //     isTarget: true,
    //     textnode: document.createTextNode(text),
    // });
    // targetNode.count++;

    let cursor = 0;

    for (const m of text.matchAll(regex)) {
        const token = m[0];
        const start = m.index!;
        const end = start + token.length;
    
        // 앞부분(해당 토큰 전의 원문) 추가
        if (start > cursor) {
          targetNode.fragments.push({
            isTarget: false,
            textnode: document.createTextNode(text.slice(cursor, start)),
          });
        }
        
        targetNode.fragments.push({
            isTarget: true,
            textnode: document.createTextNode(token),
        });
        targetNode.count++;
    
        cursor = end;
    }

    if (cursor < text.length) {
        targetNode.fragments.push({
            isTarget: false,
            textnode: document.createTextNode(text.slice(cursor)),
        });
    }

    tooltipQueue.enqueue(targetNode);
}