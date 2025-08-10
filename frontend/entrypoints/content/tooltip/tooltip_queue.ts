import { Queue } from "./queue";
import { TargetNode, TargetFragment } from "./types";
import { classifyBatch } from "../api";
import { processTooltipNode } from "./tooltip_generator";
import { logger } from "../../utils/logger";

class TooltipQueue {
    private static BATCH_SIZE = 100;
    private static PROCESS_INTERVAL = 1000;
    private queue: Queue<TargetNode>;
    private processing: boolean;

    constructor() {
        this.queue = new Queue();
        this.processing = false;
    }

    enqueue(targetNode: TargetNode) {
        this.queue.enqueue(targetNode);
    }

    async process() {
        if (this.processing) return;
        this.processing = true;
        
        await this.processBatch();
    }

    private async processBatch(targetNodes: TargetNode[] = [], retryCount = 0) {
        let count = 0;
        if (targetNodes.length > 0) {
            count = targetNodes.reduce((acc, node) => acc + node.count, 0);
        } else {
            while (!this.queue.isEmpty() && count < TooltipQueue.BATCH_SIZE) {
                const targetNode = this.queue.dequeue();
                if (targetNode) {
                    if (!targetNode.parent.isConnected) {
                        continue;
                    }
                    targetNodes.push(targetNode);
                    count += targetNode.count;
                }
            }
        }

        if (count === 0) {
            targetNodes.forEach(node => processTooltipNode(node));
            setTimeout(() => this.processBatch(), TooltipQueue.PROCESS_INTERVAL);
            return;
        }

        const batch = targetNodes.reduce((acc: TargetFragment[], node) => {
            return [...acc, ...node.fragments.filter(f => f.isTarget)];
        }, [] as TargetFragment[]);

        try {
            logger.info('Processing tooltip queue', { batch: batch.length });
            const terms = batch.map(fragment => fragment.textnode.textContent || '');
            const results = await classifyBatch(terms);
            logger.info('Batch classification request success', { results: results.length });

            if (batch.length !== terms.length) {
                throw new Error('Batch size mismatch');
            }

            batch.forEach((fragment, index) => {
                const result = results[index];
                if (result && !result.error) {
                    fragment.isFinancial = result.is_financial;
                }
            });

            targetNodes.forEach(node => processTooltipNode(node));
            if (this.queue.isEmpty()) {
                setTimeout(() => this.processBatch(), TooltipQueue.PROCESS_INTERVAL);
            } else {
                await this.processBatch();
            }
        } catch (error) {
            logger.error('Batch classification request failed:', error);
            if (retryCount >= 3) {
                logger.error('Batch classification request failed after 3 retries');
                //targetNodes.forEach(node => { this.enqueue(node); });
                setTimeout(() => this.processBatch(), TooltipQueue.PROCESS_INTERVAL);
                return;
            }
            await this.processBatch(targetNodes, retryCount + 1);
        }
    }
}

export const tooltipQueue = new TooltipQueue();