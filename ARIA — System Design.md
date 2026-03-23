# **ARIA — System Design**

## **Full Classification of Users, Agents, Flows & Data**

---

## **1\. User Types**

There are **5 user types** in the ARIA system. Each has a different relationship with ARIA and a different level of access.

---

### **👤 1.1 Guest**

The person staying at the resort. ARIA's primary subject.

| Attribute | Detail |
| ----- | ----- |
| How they interact | Phone call, WhatsApp message |
| What they can do | Make requests, report complaints, book experiences, ask questions |
| What they never see | The dashboard, internal alerts, staff routing |
| Language | Amharic or English — ARIA adapts to them |
| ARIA treats them as | A profile with history, preferences, and a churn risk score |

---

### **👤 1.2 Front Desk Staff**

The human face of the resort. Works alongside ARIA.

| Attribute | Detail |
| ----- | ----- |
| How they interact | Live dashboard on a tablet or desktop |
| What they see | Every ARIA action in real time, guest profiles, active alerts |
| What they can do | Override ARIA decisions, manually resolve an issue, flag a guest as VIP |
| When ARIA talks to them | When a situation needs a human face or physical presence |

---

### **👤 1.3 Department Staff**

Kitchen, Housekeeping, Maintenance, Spa, F\&B.

| Attribute | Detail |
| ----- | ----- |
| How they interact | WhatsApp alerts \+ a simple mobile view |
| What they see | Only alerts relevant to their department |
| What they can do | Mark a task as done, flag a delay, request re-assignment |
| When ARIA talks to them | When a guest order is delayed, a room needs attention, a maintenance issue is reported |

---

### **👤 1.4 Manager / General Manager**

Oversees operations. ARIA's escalation target.

| Attribute | Detail |
| ----- | ----- |
| How they interact | Full dashboard access \+ WhatsApp/SMS escalations |
| What they see | Everything — all agents, all actions, all revenue impact |
| What they can do | Set pricing rules, approve or reject ARIA's autonomous actions, configure thresholds |
| When ARIA talks to them | High-priority incidents, pricing decisions above a set threshold, unresolved guest complaints |

---

### **👤 1.5 System Admin**

The technical owner of ARIA. Could be the hotel's IT lead or the team that built it.

| Attribute | Detail |
| ----- | ----- |
| How they interact | Admin panel |
| What they see | Full system config, API health, agent logs, error reports |
| What they can do | Add/remove tools, tune agent prompts, configure integrations, manage user access |
| When ARIA talks to them | System failures, API errors, unusual agent behavior |

---

## **2\. Sub-Agents**

ARIA is not one agent. She is **6 specialized sub-agents** all coordinated by a central orchestrator. Each sub-agent has a single focused job.

                       ┌─────────────────────┐  
                        │   ARIA ORCHESTRATOR  │  
                        │   (Master Brain)     │  
                        │   GPT-4o \+ Memory    │  
                        └──────────┬──────────┘  
                                   │  
          ┌──────────┬─────────────┼─────────────┬──────────┐  
          ↓          ↓             ↓             ↓          ↓          ↓  
      SENTINEL    HERMES        NEXUS         PULSE      VERA       ECHO  
    (Monitor)   (Voice)     (Operations)  (Revenue)  (Guest     (Reputation)  
                                                     Intel)

---

### **🤖 2.1 ORCHESTRATOR — ARIA Core**

The master brain. She receives all signals, decides which sub-agent handles it, and coordinates multi-agent responses when a single event needs multiple simultaneous actions.

| Attribute | Detail |
| ----- | ----- |
| Model | GPT-4o with tool-calling |
| Memory | Full guest history \+ incident log in MySQL |
| Job | Route signals → delegate to sub-agents → broadcast results to dashboard |
| Trigger | Everything. Every signal passes through her first. |
| Key decision | When to act autonomously vs when to escalate to a human |

---

### **🤖 2.2 SENTINEL — Monitoring Agent**

The eyes of the system. She watches every data source and fires events into the orchestrator when something needs attention.

| Attribute | Detail |
| ----- | ----- |
| Job | Continuous polling and event detection |
| What she watches | Room service timers, housekeeping schedules, staff pings, occupancy levels, flight APIs, weather API, local events calendar |
| Output | Structured event objects sent to the Orchestrator |
| Runs every | 60 seconds for slow signals / real-time for webhooks |
| Example trigger | Room 204 room service timer exceeds 35 minutes → fires `room_service_delayed` event |

---

### **🤖 2.3 HERMES — Voice Agent**

The face and voice of ARIA. She handles every inbound guest phone call in real time.

| Attribute | Detail |
| ----- | ----- |
| Job | Answer calls, understand intent, take action, resolve or escalate |
| Technology | Twilio SIP \+ OpenAI Realtime API (WebSocket audio stream) |
| Languages | Amharic \+ English, switches mid-conversation |
| Actions she can take | Book experiences, escalate complaints to NEXUS, send WhatsApp follow-ups, apply discounts |
| Escalation rule | If HERMES cannot resolve in 2 exchanges → transfers to a live staff member |
| Example flow | Guest calls complaining about a cold shower → HERMES apologizes, dispatches maintenance via NEXUS, offers a spa credit, ends the call warmly |

---

### **🤖 2.4 NEXUS — Operations Agent**

The internal fixer. She handles everything behind the scenes that keeps the resort running.

| Attribute | Detail |
| ----- | ----- |
| Job | Route operational issues to the right department and track resolution |
| What she manages | Room service, housekeeping, maintenance, staff re-assignment |
| Tools she uses | `ping_kitchen()`, `alert_manager()`, `reassign_staff()`, `log_incident()` |
| Escalation rule | If a task is not marked resolved within a set SLA → escalates to Manager |
| Example flow | Guest reports broken AC → NEXUS logs it, pings maintenance, messages guest with ETA, follows up in 20 mins if unresolved |

---

### **🤖 2.5 PULSE — Revenue Agent**

The money brain. She watches occupancy, pricing, and guest spending to maximize revenue autonomously.

| Attribute | Detail |
| ----- | ----- |
| Job | Dynamic pricing, upsell timing, promo generation |
| What she monitors | Occupancy levels, booking pace, competitor prices, local events, guest spending patterns |
| Tools she uses | `adjust_pricing()`, `send_promo()`, `trigger_upsell()`, `flag_vip()` |
| Approval rule | Price changes above 25% require Manager approval before firing |
| Example flow | Occupancy hits 85% on Friday → PULSE raises prices 12%, logs the revenue delta, reports it to dashboard |
| Upsell logic | Guest checked in 2hrs ago \+ haven't visited F\&B → fire personalized dinner offer |

---

### **🤖 2.6 VERA — Guest Intelligence Agent**

The profiler. She builds and maintains a live intelligence profile for every guest.

| Attribute | Detail |
| ----- | ----- |
| Job | Build guest profiles, predict churn, personalize every interaction |
| What she tracks | Booking history, spending patterns, complaints, service usage, communication responses |
| Output | Churn risk score (0-100), VIP flag, preference tags, next-best-action recommendation |
| Tools she uses | `update_guest_profile()`, `flag_churn_risk()`, `flag_vip()`, `recommend_action()` |
| Feeds into | All other sub-agents use VERA's profile data before taking action |
| Example | Guest hasn't responded to 2 messages, hasn't used any services on Day 2 → VERA flags churn risk 74% → Orchestrator triggers NEXUS to send a personal manager note |

---

### **🤖 2.7 ECHO — Reputation Agent**

The public face manager. She watches what guests say about Kuriftu online and responds before damage spreads.

| Attribute | Detail |
| ----- | ----- |
| Job | Monitor reviews and social media, draft responses, flag patterns |
| What she monitors | TripAdvisor, Google Reviews, Booking.com, Twitter/X, Instagram mentions |
| Tools she uses | `draft_reply()`, `send_whatsapp()`, `log_incident()`, `flag_pattern()` |
| Runs every | 30 minutes scrape cycle |
| Example flow | 3-star Google review posted → ECHO drafts a management response, sends private WhatsApp to the guest with a recovery offer, flags "food \- Friday evening" as a repeating pattern to the GM |

---

## **3\. System Events**

These are the event types that flow through ARIA. Every action starts as an event.

| Event Type | Source | Handled By |
| ----- | ----- | ----- |
| `room_service_delayed` | SENTINEL timer | NEXUS \+ VERA |
| `guest_call_inbound` | Twilio webhook | HERMES |
| `guest_whatsapp_inbound` | Twilio webhook | Orchestrator |
| `review_posted` | ECHO scraper | ECHO |
| `social_mention_detected` | ECHO scraper | ECHO |
| `occupancy_threshold_crossed` | SENTINEL | PULSE |
| `competitor_price_change` | SENTINEL | PULSE |
| `guest_churn_risk_high` | VERA | Orchestrator |
| `maintenance_request_filed` | Staff input | NEXUS |
| `housekeeping_missed` | SENTINEL timer | NEXUS |
| `guest_birthday_today` | SENTINEL | Orchestrator |
| `flight_delay_detected` | SENTINEL \+ flight API | Orchestrator |
| `staff_escalation_request` | Staff dashboard | Orchestrator → Manager |

---

## **4\. Data Models**

### **Guest Profile**

guest\_id  
name  
phone (WhatsApp)  
language\_preference  
booking\_history\[\]  
spending\_history\[\]  
complaint\_history\[\]  
service\_usage\[\]  
churn\_risk\_score        // 0-100, updated by VERA  
vip\_flag                // boolean  
preference\_tags\[\]       // \['spa', 'early\_checkout', 'vegetarian'\]  
last\_interaction\_at

### **Incident Log**

incident\_id  
guest\_id  
type                    // complaint | delay | maintenance | churn\_risk  
trigger\_source          // sentinel | hermes | echo | staff  
severity                // low | medium | high | critical  
actions\_taken\[\]  
resolved\_at  
resolved\_by             // aria | staff | manager  
resolution\_time\_seconds

### **Agent Action**

action\_id  
agent\_name              // nexus | pulse | echo | hermes | vera  
tool\_called             // send\_whatsapp | ping\_kitchen | adjust\_pricing...  
payload{}  
status                  // fired | delivered | failed  
fired\_at  
guest\_id (nullable)  
revenue\_impact (nullable)

---

## **5\. Dashboard Views by User Type**

| View | Guest | Front Desk | Department | Manager | Admin |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Live action feed | ✗ | ✓ | ✗ | ✓ | ✓ |
| Guest profiles | ✗ | ✓ | ✗ | ✓ | ✓ |
| Department alerts | ✗ | ✗ | ✓ | ✓ | ✓ |
| Revenue dashboard | ✗ | ✗ | ✗ | ✓ | ✓ |
| Reputation monitor | ✗ | ✗ | ✗ | ✓ | ✓ |
| Agent config | ✗ | ✗ | ✗ | ✗ | ✓ |
| Incident history | ✗ | ✓ | ✓ | ✓ | ✓ |
| Churn risk board | ✗ | ✗ | ✗ | ✓ | ✓ |

---

## **6\. Summary Count**

| Category | Count |
| ----- | ----- |
| User types | 5 |
| Sub-agents | 6 \+ 1 Orchestrator |
| Tools (callable actions) | 14 |
| Event types | 13 |
| Data models | 3 core |
| Real-time integrations | 7 (Twilio Voice, Twilio WhatsApp, OpenAI Realtime, Weather API, Flight API, Review scrapers, Laravel Reverb) |

---

*ARIA System Design v1.0 — Hospitality Hackathon 2026*

