import { logger } from "./utils/logger";
import { sendMessage, onMessage } from "@/entrypoints/messaging";

export default defineBackground(() => {
    onMessage('Capture', ({ data, sender }) => {
        logger.info(`Background message received: ${data}, sender: ${sender.tab?.id}`);
        const captureData = data as { id: string; rect: { x: number; y: number; width: number; height: number } };
        browser.tabs.captureVisibleTab({ format: 'jpeg' }, (dataUrl) => {
            sendMessage('CaptureDone', {
                id: captureData.id,
                dataUrl: dataUrl,
                rect: captureData.rect
            }, sender.tab?.id);
        });
    });
});
