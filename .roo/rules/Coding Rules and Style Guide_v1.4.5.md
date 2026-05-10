# **Coding Rules and Style Guide (v1.4.5)**

Version: v1.4.5  
Last Updated: 2025-10-18  
\[Content from sections 1 and 2.1 \- 2.9 remains unchanged for brevity.\]

### **2.10. Performance & Hot Paths**

#### **Rule 10: Performance-Idiomatic Python is Mandatory for Hot Paths**

* **Principle:** On a \# hot path, code must be optimized for execution speed using CPython's C-accelerated primitives.  
* **Rule:** Any code annotated with \# hot path or detected as Tier 1 Hot **MUST** utilize C-backed structures, avoid explicit Python loops, and prefer built-ins/std-library functions over manual implementations.  
* **Rationale:** This prevents catastrophic performance regressions where the system spends excessive time in slow Python interpretation layers.

##### **Rule 10.A: Mandatory Hot Path Decision Matrix**

This matrix defines the quantified burden of proof for labeling a code block as a \# hot path. The determination is based on the most severe condition present.

| Condition | Loop Count (N) | I/O Operation Present | Pydantic Instantiation | Classification | Enforcement Action |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **CPU-Bound** | $\\ge 1000$ | No | No | **Tier 1 Hot Path** | Apply Rule 10 (C-backed primitives). |
| **I/O-Bound (Batching)** | $\\ge 10$ | Yes (Unbatched) | No | **Tier 1B Auto-Hot** | **VIOLATION:** Reject (Mandate batching). |
| **I/O-Bound (Low Count)** | $\\le 10$ | Yes (Unbatched) | No | **Tier 1C Auto-Hot** | **VIOLATION:** Reject (Mandate batching). |
| **Anti-Pattern V1** | $\\ge 1$ | No | Yes (in loop) | **Tier 1 Hot \+ Violation** | **VIOLATION:** Reject (Move Pydantic to boundary). |
| **Tier 2/3 (Contextual)** | N/A | N/A | N/A | **Tier 2/3 Likely Hot** | Annotate and initiate formal profiling. |

**Detection Patterns (For Machine/Agent Audit):**

* **I/O Indicators:** requests., httpx., aiohttp., .query(, .execute(, open(, urlopen, fetch, db.  
* **Batching Indicators:** bulk\_, batch\_, executemany, insert\_many, asyncio.gather, ThreadPoolExecutor  
* **Pydantic Instantiation Indicators:** (\*\*, .model\_validate(, .parse\_obj( (in loop context)

#### **Rule 10 Corollary: Hot Path Anti-Patterns (Negative Space Enforcement)**

The following patterns are **critical violations** when detected inside a Tier 1 Hot Path, as they negate all performance gains.

##### **V1: Pydantic Instantiation Tax**

* **Violation:** Instantiating Pydantic models inside the hot loop.  
* **Remedy:** Validate data once at the I/O boundary, then pass C-backed primitives (dict, list) into the hot loop.  
* **Example:**  
  \# ❌ BAD (Violation: Pydantic Instantiation in Hot Path)  
  records \= fetch\_million\_records()  
  for record in records:  \# Hot Path: N \> 1000  
      validated \= RecordModel(\*\*record)  \# 👈 VIOLATION  
      process(validated.data)

  \# ✅ GOOD (Compliant: Validation at Boundary)  
  validated\_primitives \= \[r.model\_dump() for r in records\]  
  for record\_dict in validated\_primitives:  
      process(record\_dict)  \# dict access is C-accelerated

##### **V2: Unbatched I/O Penalty**

* **Violation:** Performing I/O operations (network calls, database queries, file access) inside a loop without using a bulk/batching primitive. This is a Tier 1B Hot Path **regardless of iteration count \> 10**.  
* **Remedy:** Use C-backed/optimized batching primitives (executemany, asyncio.gather, bulk APIs).  
* **Example:**  
  \# ❌ BAD (Violation: Unbatched I/O Penalty)  
  for user\_id in user\_ids\[:50\]:  
      response \= requests.get(f"/api/users/{user\_id}")  \# 👈 Unbatched I/O

  \# ✅ GOOD (Compliant: Using Batching)  
  user\_ids\_batch \= user\_ids\[:50\]  
  responses \= requests.post("/api/users/batch", json={"ids": user\_ids\_batch})  
