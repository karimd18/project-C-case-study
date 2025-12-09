# Logic Explanation & Architectural Decision Record

## System Overview

The **Project C: Consulting Copilot** is designed as a hybrid application to meet the needs of top-tier consultants. It prioritizes data privacy, offline capability, and executive-style output.

## Hybrid Architecture (The "Switch")

The backend (`SlideService.java`) implements a hybrid strategy to satisfy both the Core Requirement (n8n workflow) and the Localized Version (Bonus).

- **Default Mode (Local Heuristic):** A Java-based regex and keyword engine runs directly on the server. This has zero dependency on external APIs, ensuring it runs locally immediately (perfect for demos or high-security environments).
- **External Mode (n8n Integration):** The architecture includes an explicit logical branch (`useExternalWorkflow` flag) to delegate processing to an n8n webhook. This allows for future expansion into LLM-based processing without refactoring the API contract.

## The Local Heuristic Engine

To mimic "AI-like" behavior without an actual LLM, we implemented a rule-based engine:

1.  **Header Generation:** We extract the first sentence as the "Lead Line" (Consulting principle: Answer first).
2.  **Topic Classification:** We scan for keywords to assign a slide type:
    - _Cost/Budget_ -> **Cost Analysis**
    - _Growth/Revenue_ -> **Revenue Growth**
    - _Process/Steps_ -> **Process Optimization**
3.  **Visual Recommendation Algorithm:**
    - Detects temporal keywords ("process", "phase") to suggest **Chevron Flows**.
    - Detects quantitative deltas ("increase", "decrease") to suggest **Bar** or **Waterfall Charts**.
    - Detects structural keywords ("root cause", "driver") to suggest **Tree Diagrams**.

## Data Persistence

Every interaction is stored in an H2 database (`GenerationHistory` entity). This satisfies the requirement for a "History Panel" in the sidebar, allowing consultants to revisit previous thoughts.
