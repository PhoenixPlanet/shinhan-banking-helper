import { defineExtensionMessaging } from '@webext-core/messaging';

interface CaptureRect {
    id: string;
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface CaptureDone {
    id: string;
    dataUrl: string;
    rect: CaptureRect['rect'];
}

interface ProtocolMap {
  Capture(data: CaptureRect): void;
  CaptureDone(data: CaptureDone): void;
  ToggleToolbar(): void;
  StartMenuFinder(): void;
  StartCapture(): void;
  GetToolbarStatus(): { isVisible: boolean };
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();

export default defineUnlistedScript({
  main() { },
});
