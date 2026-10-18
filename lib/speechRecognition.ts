// Real-Time Live Speech Recognition (Captions) Engine
// Uses native Web Speech API with automatic restart and dataChannel/socket broadcast

export type CaptionEvent = {
    id: string;
    speakerName: string;
    text: string;
    isFinal: boolean;
    timestamp: number;
};

export class LiveCaptionsEngine {
    private recognition: any = null;
    private isRunning = false;
    private speakerName = "You";
    private onCaptionCallback: ((caption: CaptionEvent) => void) | null = null;

    constructor() {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = "en-US";

                this.recognition.onresult = (event: any) => {
                    let interimTranscript = "";
                    let finalTranscript = "";

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    const activeText = finalTranscript || interimTranscript;
                    if (activeText && this.onCaptionCallback) {
                        this.onCaptionCallback({
                            id: `${Date.now()}-${Math.random()}`,
                            speakerName: this.speakerName,
                            text: activeText.trim(),
                            isFinal: Boolean(finalTranscript),
                            timestamp: Date.now(),
                        });
                    }
                };

                this.recognition.onerror = (err: any) => {
                    console.warn("Live captions warning:", err?.error || err);
                };

                this.recognition.onend = () => {
                    if (this.isRunning) {
                        try {
                            this.recognition.start();
                        } catch {}
                    }
                };
            }
        }
    }

    start(speakerName: string, onCaption: (caption: CaptionEvent) => void): boolean {
        if (!this.recognition) return false;
        this.speakerName = speakerName || "You";
        this.onCaptionCallback = onCaption;
        this.isRunning = true;

        try {
            this.recognition.start();
            return true;
        } catch {
            return false;
        }
    }

    stop() {
        this.isRunning = false;
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch {}
        }
    }

    isSupported(): boolean {
        return Boolean(this.recognition);
    }
}

export const captionsEngine = new LiveCaptionsEngine();
