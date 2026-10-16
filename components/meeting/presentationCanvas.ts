/**
 * Creates an animated presentation / whiteboard canvas stream for devices
 * where native system getDisplayMedia is unavailable (mobile browsers)
 * or restricted by iframe permissions policies.
 */
export function createPresentationStream(participantName: string): {
    stream: MediaStream;
    stop: () => void;
} {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");

    let animFrame: number;
    let slideIndex = 0;
    const slides = [
        {
            tag: "PRODUCT OVERVIEW",
            title: "VLSI Labs Architecture & Scalability",
            subtitle: "Internal Collaboration & Low-Latency Signaling Infrastructure",
            bullets: [
                "Real-time WebRTC multi-peer mesh audio/video pipeline",
                "Sub-100ms signaling with fallback browser channels",
                "Workspace meetings, decision capture, and action item tracking",
            ],
        },
        {
            tag: "ROADMAP 2026",
            title: "Q4 High-Yield Milestone Review",
            subtitle: "Edge AI Acceleration & Next-Gen Synthesis Models",
            bullets: [
                "Automated synthesis pipeline verification",
                "Cross-platform Web & Mobile collaboration clients",
                "Enterprise access management & guest isolation",
            ],
        },
        {
            tag: "TEAM METRICS",
            title: "Sprint Execution & Deliverables",
            subtitle: "99.98% Uptime with Zero-Configuration Meetings",
            bullets: [
                "Instant meeting link generation with 1-click entry",
                "Responsive mobile & desktop interface layouts",
                "Hardware-accelerated media rendering & adaptive bitrates",
            ],
        },
    ];

    // Change slide every 6 seconds
    const slideTimer = setInterval(() => {
        slideIndex = (slideIndex + 1) % slides.length;
    }, 6000);

    let frameCount = 0;

    function draw() {
        if (!ctx) return;
        frameCount++;

        // Background
        const grad = ctx.createLinearGradient(0, 0, 1280, 720);
        grad.addColorStop(0, "#090d16");
        grad.addColorStop(0.5, "#0f172a");
        grad.addColorStop(1, "#1e1b4b");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1280, 720);

        // Grid lines
        ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
        ctx.lineWidth = 1;
        for (let x = 0; x < 1280; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 720);
            ctx.stroke();
        }
        for (let y = 0; y < 720; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1280, y);
            ctx.stroke();
        }

        // Top bar
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(0, 0, 1280, 70);
        ctx.strokeStyle = "rgba(99, 102, 241, 0.25)";
        ctx.strokeRect(0, 0, 1280, 70);

        // Logo
        ctx.fillStyle = "#6366f1";
        ctx.beginPath();
        ctx.roundRect(40, 15, 40, 40, 10);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px system-ui, sans-serif";
        ctx.fillText("V", 52, 43);

        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("VLSI Labs Meetings", 95, 36);

        ctx.font = "12px system-ui, sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Shared Screen · Presenting: " + participantName, 95, 52);

        // Live badge
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        ctx.beginPath();
        ctx.roundRect(1140, 20, 100, 30, 15);
        ctx.fill();
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(1155, 35, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "bold 12px system-ui, sans-serif";
        ctx.fillText("PRESENTING", 1165, 39);

        // Slide card
        ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
        ctx.beginPath();
        ctx.roundRect(60, 110, 1160, 550, 24);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.strokeRect(60, 110, 1160, 550);

        const currentSlide = slides[slideIndex];

        // Tag
        ctx.fillStyle = "#818cf8";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.fillText(currentSlide.tag + " · SLIDE " + (slideIndex + 1) + " OF " + slides.length, 100, 165);

        // Slide Title
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 34px system-ui, sans-serif";
        ctx.fillText(currentSlide.title, 100, 220);

        // Subtitle
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "18px system-ui, sans-serif";
        ctx.fillText(currentSlide.subtitle, 100, 260);

        // Divider
        ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 290);
        ctx.lineTo(1180, 290);
        ctx.stroke();

        // Bullets
        currentSlide.bullets.forEach((bullet, idx) => {
            const y = 350 + idx * 60;
            // bullet icon
            ctx.fillStyle = "#6366f1";
            ctx.beginPath();
            ctx.arc(115, y - 6, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.font = "500 20px system-ui, sans-serif";
            ctx.fillText(bullet, 140, y);
        });

        // Bottom status in card
        ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
        ctx.beginPath();
        ctx.roundRect(100, 570, 1080, 50, 12);
        ctx.fill();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "13px system-ui, sans-serif";
        ctx.fillText("Interactive Presentation Stream · Automatically syncing across participants", 120, 600);

        // Animated pulse bar
        const pulseWidth = 100 + Math.sin(frameCount * 0.05) * 40;
        ctx.fillStyle = "#6366f1";
        ctx.fillRect(1000, 592, pulseWidth, 6);

        animFrame = requestAnimationFrame(draw);
    }

    draw();

    const stream = canvas.captureStream(30);

    return {
        stream,
        stop: () => {
            cancelAnimationFrame(animFrame);
            clearInterval(slideTimer);
            stream.getTracks().forEach((t) => t.stop());
        },
    };
}
