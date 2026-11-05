# Feedback: Avoid Fixation on Mutexes & Locking

- **Rule**: Do not over-index on or constantly mention mutexes, turn locks, Banana locks, or contention in conversations, status reports, or discussion seeds.
- **Rationale**: Locking is a low-level implementation detail that is already solved and working. Repeatedly talking about mutexes crowds out broader, higher-value software engineering topics like memory retention, tool latency, async reliability, workflow patterns, and self-improvement.
- **Guidance**:
  - Keep low-level lock mechanics silent and automated in background code.
  - When suggesting discussion topics or status updates, focus on user-facing features, system reliability, prompt engineering, memory management, and practical problem-solving.
