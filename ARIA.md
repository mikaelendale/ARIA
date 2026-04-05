# **ARIA**

## **Autonomous Resort Intelligence Agent**

---

*"ARIA doesn't assist hotel staff. She runs the hotel — and calls you when she needs you."*

---

## **What is ARIA?**

ARIA is an always-on AI agent built for Kuriftu Resort. She monitors everything happening inside and around the resort 24/7, detects problems before they escalate, makes decisions autonomously, and fires real actions across multiple systems simultaneously — with zero human trigger.

She is not a chatbot. She is not a dashboard. She is not a helpdesk tool.

She is the operating brain of the hotel.

---

## **The Problem She Solves**

Hotels bleed money and reputation every day through three unavoidable cracks:

1. **Slow response** — A guest complains. A manager notices 30 minutes later. Damage is done.  
2. **Missed revenue** — Occupancy is high but pricing is flat. Upsells never happen at the right moment.  
3. **Invisible patterns** — Nobody connects that food complaints always spike Friday evenings, or that guests who haven't visited the restaurant by Day 2 almost never do.

ARIA closes all three cracks. Simultaneously. Autonomously.

---

## **How She Works**

ARIA operates in three layers:

### **1\. ARIA EARS — She monitors everything**

She watches every signal flowing in and out of the resort in real time:

| External Signals | Internal Signals | Guest Signals |
| ----- | ----- | ----- |
| Weather API | Room service timers | Active bookings |
| Local events calendar | Housekeeping status | Guest profiles |
| Competitor pricing | Staff availability | Check-in times |
| TripAdvisor / Google | Kitchen queue | Spending history |
| Twitter / Instagram | Occupancy levels | Complaint history |
| Booking.com reviews | Maintenance logs | WhatsApp threads |
| Flight arrival data | Inventory levels | Stay duration |

### **2\. ARIA BRAIN — She reasons autonomously**

Using GPT-4o with tool-calling and memory, ARIA:

* Understands what is happening  
* Decides what the correct response is  
* Determines which actions to take  
* Executes them — without waiting for a human

### **3\. ARIA VOICE — She speaks to guests**

A real phone number guests can call. ARIA answers in **Amharic or English**, switches mid-conversation naturally, handles requests, resolves complaints, books experiences, and only escalates when she genuinely cannot resolve something herself.

---

## **What She Actually Does**

### **🔴 Reactive — When something goes wrong**

| Trigger | ARIA's Autonomous Response |
| ----- | ----- |
| Room service 35+ mins undelivered | Pings kitchen \+ alerts manager \+ WhatsApps guest apology \+ applies 15% discount automatically |
| Guest tweets a complaint | Detects it, drafts public reply, sends private WhatsApp recovery offer, logs the incident |
| Guest calls angry | Voice concierge de-escalates live, resolves the issue, fires compensation to their room |
| Housekeeping misses a checkout room | Re-assigns to nearest available staff, delays checkout notification by 30 mins |
| Negative review posted online | Drafts management response, flags patterns to GM, triggers follow-up for similar active guests |
| Maintenance request ignored 2hrs | Escalates to department head, re-assigns, messages guest with an ETA |

### **🟡 Proactive — Before anyone notices a problem**

| Signal ARIA Reads | Action She Takes |
| ----- | ----- |
| Guest on Day 2 hasn't visited the restaurant | Sends personalized dinner recommendation with a reservation link at 5PM |
| Guest birthday in booking data | Auto-orders room decoration, sends a surprise message 2hrs before arrival |
| Weather API shows rain tomorrow | Sends all current guests indoor activity suggestions tonight |
| Guest checked in but radio silence for 6hrs | Fires a warm check-in message with upsell woven in naturally |
| Flight data shows delayed arrivals | Auto-sends delay message to affected guests, holds their dinner reservation |
| Guest checkout tomorrow, no return booking | Sends personalized extension offer with loyalty discount |

### **🟢 Revenue — She makes money autonomously**

| Signal | Action |
| ----- | ----- |
| Occupancy hits 85% on an upcoming weekend | Autonomously raises room prices 12% across all channels |
| Next week showing 40% occupancy | Drafts flash promo, sends to previous guest list via WhatsApp |
| Competitor drops price below Kuriftu | Flags to GM with recommendation, fires a value-add offer instead of matching price |
| Conference detected in Addis next month | Blocks group rate rooms, drafts outreach to the conference organiser |
| Guest spending pattern signals VIP | Upgrades their profile, assigns dedicated staff, queues personalised touch points |

---

## **Her Tool Belt**

These are the real system actions ARIA executes:

| Tool | What it does |
| ----- | ----- |
| `send_whatsapp()` | Sends personalized messages to guests via WhatsApp |
| `ping_kitchen()` | Alerts kitchen staff about delayed or missed orders |
| `alert_manager()` | Escalates critical issues to the right human immediately |
| `apply_discount()` | Issues recovery offers and logs them to the billing system |
| `book_experience()` | Reserves spa, dining, tours, and activities for guests |
| `adjust_pricing()` | Updates room rates across channels based on live occupancy signals |
| `draft_reply()` | Writes public responses to reviews and social media mentions |
| `log_incident()` | Records every action to a full, searchable audit trail |
| `send_promo()` | Fires flash promotions to segmented guest lists |
| `escalate_to_human()` | Hands off to a real staff member when a situation requires it |

---

## **The Live Command Dashboard**

Every action ARIA takes is broadcast in real time to a single command screen. Staff and managers see the full picture as it happens:

\[14:32:07\]  🔴  Room 204 — service 38min delayed  
            → Kitchen pinged ✓  
            → Manager alerted ✓  
            → Guest WhatsApp sent ✓  
            → 15% discount applied ✓  
            → Resolved in 47 seconds

\[14:33:21\]  🟡  Guest Meles — Day 2, no restaurant visit  
            → Dinner recommendation fired ✓  
            → Reservation link included ✓

\[14:35:02\]  🟢  Weekend occupancy hit 87%  
            → Prices raised 12% ✓  
            → Revenue delta: \+ETB 14,400 tonight ✓

Every action. Every dollar. Every second. Live.

---

## **ARIA's Personality**

* **Languages:** Amharic and English — switches naturally mid-conversation  
* **Tone:** Warm, professional, and confident — never robotic  
* **Speed:** Every trigger resolved in under 90 seconds  
* **Transparency:** Every decision is visible and auditable on the dashboard  
* **Escalation:** She knows her limits — humans are looped in only when it matters

---

## **Tech Stack**

| Layer | Technology |
| ----- | ----- |
| Backend | Laravel \+ Redis Queues |
| Agent Brain | GPT-4o with Tool Calling |
| Real-time Dashboard | Laravel Reverb \+ React via Inertia.js |
| Voice Concierge | Twilio SIP \+ OpenAI Realtime API |
| Guest Messaging | Twilio WhatsApp Business API |
| Database | MySQL \+ Redis (memory layer) |

---

## **The Numbers**

Hotels leak revenue from three sources daily:

* **23%** of potential revenue lost to flat pricing, no-shows, and missed upsells  
* **40 minutes** average response time to a guest complaint without an intelligent system  
* **67%** of unhappy guests never complain — they just leave and write a review

ARIA closes every one of those gaps. Autonomously. In real time.

---

## **One Line**

*ARIA doesn't wait to be asked. She already handled it.*

---

## **Hermes — named voice agent (implementation)**

* **Hermes** is the dedicated voice-facing agent in the codebase (`HermesAgent`): Twilio voice webhooks and OpenAI Realtime for live audio, with **bilingual Amharic and English** instructions aligned to Kuriftu Resort.
* Voice uses the **same tool orchestration path** as text ARIA (shared orchestrator and agent tools — not a separate, disconnected brain).
* Production shape: Twilio Media Streams to a Realtime-capable worker; PHP handles webhooks and session wiring (see `HermesAgent`).

---

## **Public guest voice kiosk (UI)**

* **Route:** `/guest/voice` — public Inertia page (no authenticated app chrome), intended as a **demo / lobby screen** for the voice layer.
* **Layout:** split view — **3D voice orb** (Idle / Listening / Talking preview states) beside a **tabbed panel** with mock guest surfaces: **Messages** (Hermes-style outbound WhatsApp preview), **Live** (property activity feed), **Today** (time, weather, hours, Wi‑Fi, events at a glance).
* **Guided tour:** first-visit onboarding explains Hermes, the orb, and the tabs (storage key `aria-guest-kiosk-tour-seen`).
* **Data:** mock content for demo; footer clarifies demo vs production wiring (orchestrator + Realtime worker).

---

## **Staff app & ops surfaces (feature routes)**

* **Authenticated Inertia app:** Overview (**dashboard**), **Revenue**, **Guests** (list + detail), **Issues / incidents** (list + detail).
* **Dashboard ARIA chat:** staff can converse with an **Aria chat agent** backed by ops context and tools (`POST api/ops/aria/chat`).
* **Live ops APIs:** JSON endpoints under `api/ops` for dashboard stats, guests, incidents, and related detail payloads used by the realtime UI.
* **Scenario triggers:** `POST api/trigger/scenario` to fire demo/automation scenarios from the app.
* **Kitchen board:** `/kitchen` with board middleware — order display and mark-delivered flow for room service.
* **Sidebar shortcuts:** **Guest portal** links to `/guest/voice`; **Kitchen** deep-links to the board (with token query pattern as implemented).
* **Integrations (webhooks):** `POST /webhook/twilio/voice` and `POST /webhook/twilio/whatsapp` for Twilio voice and WhatsApp.

---

## **Agent & tool implementation (codebase)**

* **Orchestrator pattern:** central orchestration plus named agents (e.g. **Hermes** for voice, **Aria**-style chat agent for dashboard, and other domain agents in `app/Ai/Agents`).
* **Tool registry:** concrete tools mirror the narrative tool belt — WhatsApp, kitchen ping, manager alert, discounts, experiences, pricing, promos, draft replies, escalation, incident logging, and **read-only ops tools** (dashboard summary, queue health, guest/incident lists and detail, agent status, recent actions).
* **Observability:** agent actions can be recorded for audit and UI surfaces that consume “recent actions” style data.

