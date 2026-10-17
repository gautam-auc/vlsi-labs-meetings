# VLSI Labs Meetings — Final Project Documentation & Technical Report

**Project Title**: VLSI Labs Meetings — Real-Time Video Collaboration & DaaS Platform  
**Specification Grounding**: Full Project Requirements + UI Design Guide (PDF, 14 Pages)  
**Primary Admin**: A. Gautam (`agautamrpr@gmail.com`)  
**Repository**: `vlsilabs-meetings`  
**Date**: October 2026  

---

## 1. Project Abstract & Objectives

VLSI Labs Meetings is an enterprise-grade real-time web video conferencing and collaboration platform designed for internal technical teams, silicon engineering syncs, study groups, and customer technical reviews. 

### Key Objectives Achieved:
1. **Ultra-Low Latency Media Transport**: P2P WebRTC mesh supporting real-time video, audio, and high-definition screen sharing.
2. **Resilient Signaling Architecture**: Dedicated Socket.IO signaling server running on Render with automatic local fallback (`localhost:4000`), featuring dual-layer signaling for WebRTC negotiation, ICE exchanges, and camera/screen state synchronization.
3. **Enterprise Database Integration**: Local and cloud MongoDB persistence via Mongoose connection pooling for user profiles, meeting records, participant attendance, and in-room chat messages.
4. **Admin & DaaS Telemetry Control Center**: Dedicated executive dashboard (`/dashboard/admin`) with real-time operational metrics (call durations, active rooms, bandwidth estimates), user role management, and CSV report export.
5. **Universal Accessible Day/Night Theming**: Global CSS token architecture with inline anti-flash hydration script, system preference auto-detection, and persistent user selection across all 17 routes.

---

## 2. Actual Technology Stack

- **Frontend Core**: Next.js 16.3.6 (App Router) + React 19.2.8 + TypeScript 5.
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens (`--background`, `--surface`, `--text`, `--border`, `--primary`, `--secondary`, `--danger`, `--success`).
- **Database / ORM**: MongoDB + Mongoose 8.x with connection pooling and caching.
- **Authentication**: Bcrypt.js (10-round salted password hashing) + JsonWebToken (JWT 7-day signed session tokens).
- **Real-Time Signaling**: Node.js + Express + Socket.IO 4.8.x.
- **Media Engine**: WebRTC (RTCPeerConnection + RTCDataChannel) with Google STUN (`stun:stun.l.google.com:19302`).
- **Bundler & Compiler**: Turbopack + Next.js App Router (100% clean production build).

---

## 3. High-Level Architecture Diagram

```
+-------------------------------------------------------------------------+
|                        Client Browsers (Chrome / Edge / Firefox)        |
+-------------------------------------------------------------------------+
       |                               |                        |
       | HTTPS (App Router / Next.js)  | WebSocket (Signaling)   | WebRTC P2P
       v                               v                        v
+------------------------+  +----------------------+  +-------------------+
| Next.js 16 Web Server  |  | Socket.IO Signaling  |  | Peer WebRTC Mesh  |
| - Landing / Dashboard  |  | - Offer / Answer     |  | - Video stream    |
| - Auth & Admin APIs    |  | - ICE Relays         |  | - Mic track (AEC) |
| - Meetings / Messages  |  | - Media State Sync   |  | - Screen share    |
+------------------------+  +----------------------+  | - DataChannel chat|
            |                                         +-------------------+
            v
+------------------------+
| MongoDB Atlas / Local  |
| - users                |
| - meetings             |
| - messages             |
+------------------------+
```

---

## 4. Complete Implemented Routes & API Inventory

### Public & Dashboard Pages:
- `/`: Public landing page with Hero, Features, Workflow, Product Preview, and CTA.
- `/login`: Split-screen sign-in with fast demo access for `agautamrpr@gmail.com`.
- `/register`: Workspace registration form with password validation and database write.
- `/dashboard`: Main workspace overview, live meeting cards, quick-join input, and stats.
- `/dashboard/meetings`: Searchable meeting directory with filter tabs (All / Live / Upcoming / Completed).
- `/dashboard/admin`: Executive Admin & DaaS Control Center (metrics, user roles, meeting audit, CSV export).
- `/dashboard/recordings`: Honest status card with clear explanation of cloud storage requirements (zero fake inert buttons).
- `/dashboard/settings`: Profile preferences, email configuration, and dark/light theme switch.
- `/meetings/create`: Instant and scheduled meeting creation with custom `VLSI-XXXXXX` IDs.
- `/meet/[meetingId]`: Full-screen real-time WebRTC conference room.

### Backend API Endpoints:
- `POST /api/auth/register`: Creates hashed user account in MongoDB.
- `POST /api/auth/login`: Authenticates credentials with bcrypt and returns signed JWT.
- `GET /api/meetings`: Lists all workspace meetings (with optional search and status filtering).
- `POST /api/meetings`: Generates and stores new meeting in MongoDB.
- `GET /api/meetings/[meetingId]`: Fetches meeting metadata.
- `DELETE /api/meetings/[meetingId]`: Cancels and deletes meeting from database.
- `POST /api/meetings/[meetingId]/join`: Records participant attendance and marks meeting live.
- `GET /api/meetings/[meetingId]/messages`: Retrieves persistent meeting chat history.
- `POST /api/meetings/[meetingId]/messages`: Saves new chat message to MongoDB.
- `GET /api/admin/stats`: Aggregates DaaS telemetry, total hours, bandwidth, and system directory.
- `PATCH /api/admin/users`: Promotes or demotes user access roles (`admin` / `user`).

---

## 5. MongoDB Database Schemas

### 1. `users` Collection
```typescript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "host", "admin"], default: "user" },
  workspace: { type: String, default: "VLSI Labs Engineering" },
  profilePreferences: {
    theme: { type: String, enum: ["light", "dark"], default: "dark" },
    autoMute: Boolean,
    autoCameraOff: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. `meetings` Collection
```typescript
{
  meetingId: { type: String, required: true, unique: true, uppercase: true, index: true },
  title: { type: String, required: true },
  description: String,
  hostName: String,
  hostEmail: String,
  date: String,
  time: String,
  duration: String,
  mode: { type: String, enum: ["instant", "scheduled"], default: "instant" },
  status: { type: String, enum: ["upcoming", "live", "completed", "cancelled"], default: "upcoming" },
  participants: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### 3. `messages` Collection
```typescript
{
  meetingId: { type: String, required: true, index: true, uppercase: true },
  senderName: { type: String, required: true },
  senderEmail: String,
  text: { type: String, required: true },
  time: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6. WebRTC & Socket.IO Signaling Workflow

1. **Room Join**: Peer navigates to `/meet/[meetingId]`, acquires local camera/microphone with echo cancellation (`echoCancellation: true`, `noiseSuppression: true`, `autoGainControl: true`).
2. **Signaling Connection**: Peer connects to Socket.IO and emits `join-room`.
3. **Mesh Offer/Answer**:
   - The joining peer receives `existing-users` and creates WebRTC `RTCPeerConnection` for each peer.
   - Creates an SDP Offer, sets local description, and emits `offer` through the signaling server.
   - Remote peer receives `offer`, sets remote description, creates SDP Answer, and emits `answer`.
4. **ICE Candidate Exchange**: ICE candidates are queued in `pendingIceCandidatesRef` and flushed once remote descriptions are settled.
5. **Dual-Layer Media State Sync**: Camera toggle and screen sharing state updates are sent simultaneously over ultra-low latency WebRTC `RTCDataChannel` and WebSocket fallback to ensure 100% sync reliability.
6. **Acoustic Feedback Protection**: Each remote video tile contains an in-tile speaker mute button so multi-device testing in the same physical room does not produce acoustic feedback loops.

---

## 7. Day/Night Theme Implementation

- **Central Provider**: `ThemeProvider.tsx` exposes `theme`, `setTheme`, and `toggleTheme`.
- **Anti-Flash Inline Script**: Embedded in the `<head>` of `app/layout.tsx` to read `localStorage.getItem('vlsi-theme')` or system `prefers-color-scheme` before HTML renders, eliminating jarring white/dark screen flashes.
- **CSS Tokens**: Centralized in `app/globals.css`.
- **Protected Video Streams**: Explicit `video { filter: none !important; }` rule ensures camera and screen sharing feeds are never color-inverted in dark mode.

---

## 8. Verification & Build Results

- **TypeScript Compilation**: `npx tsc --noEmit` -> **0 errors**.
- **Next.js Turbopack Build**: `npm run build` -> **0 errors** across all 17 routes and API handlers.
- **Git State**: Clean working tree with rollback commit points tagged.

---

## 9. Interview Questions & Comprehensive Answers

### Q1: How does the application handle WebRTC mesh scaling?
**Answer**: VLSI Labs Meetings uses a full-mesh peer-to-peer WebRTC topology where each participant sends and receives tracks directly to/from other participants. For small-to-medium teams (internal syncs, study groups, technical reviews up to 6–8 participants), P2P mesh provides zero server media transcoding latency, end-to-end encryption, and zero media relay costs. For meetings scaling beyond 10 participants, the architecture is designed to transition to an SFU (Selective Forwarding Unit) like mediasoup or LiveKit.

### Q2: How does the application prevent race conditions during signaling?
**Answer**: Signaling race conditions (e.g. ICE candidates arriving before `setRemoteDescription` completes) are resolved using `pendingIceCandidatesRef`. Candidates arriving in `have-remote-offer` state are stored in an in-memory queue and flushed asynchronously via `flushPendingIceCandidates()` once description settling is complete.

### Q3: Why is there a dual-layer media state sync?
**Answer**: WebRTC DataChannels provide sub-millisecond P2P messaging, but they take a brief moment to open (`readyState === 'open'`). If a user switches their camera or screen share during the handshake, pure data channel messages can be dropped. By emitting `media-state` through both the DataChannel and the Socket.IO signaling relay, state synchronization is guaranteed even over restrictive firewalls and mobile networks.

### Q4: How is database persistence architected for serverless Next.js?
**Answer**: Next.js App Router API handlers can execute in stateless environments where database connections could multiply on every invocation. In `lib/db.ts`, Mongoose is cached on `globalThis.mongooseCache`. Subsequent invocations reuse the cached connection pool rather than opening new connections, preventing database exhaustion.
