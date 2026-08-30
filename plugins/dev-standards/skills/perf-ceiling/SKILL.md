---
name: dev-standards-perf-ceiling
description: "Performance is measured against the theoretical maximum, not the previous version. 以理論極限度性能，非以前版。 Use when: make this faster, optimize, slow, latency, throughput, hot path, profiling, benchmark, perf budget, claiming a speedup. Skip: prototype, cold path with no stated budget."
---

# Performance Ceiling

A speedup over yesterday's code proves nothing — yesterday's code may have been running at 2% of what the hardware can do. The only honest measure is **achieved / theoretical maximum**. Estimate the ceiling first, then drive the code toward it.

The discipline is Casey Muratori's: before you optimize, work out what the machine
*could* do with this problem, and treat the distance from that number as the defect.
His refterm work is the canonical demonstration — a terminal renderer measured against
what the GPU and memory bus allow, not against the incumbent it replaced, which is how
a "fast enough" baseline turned out to be thousands of times off the ceiling. Two of his
rules carry the most weight here: **non-pessimization** (most gaps are not missing
cleverness, they are work the program should never have been doing) and the refusal to
accept a relative speedup as evidence of anything.

## Phase 1 — Name the binding resource

Every workload is limited by exactly one resource at a time. Pick it before writing any code.

| Binding resource | Ceiling formula | Where the constant comes from |
|---|---|---|
| Memory bandwidth | bytes that must move / peak GB/s | a measured stream benchmark on the target box, not the spec sheet |
| Compute | ops needed / (cores x ops-per-cycle x clock) | measured single-core throughput of the actual kernel |
| Storage | bytes / sequential throughput, or ops / IOPS | `fio` or a measured sequential read on the target volume |
| Network / RPC | round trips x RTT, plus bytes / link bandwidth | measured RTT to the real endpoint |
| Database | rows that must be examined vs rows returned | query plan; a seek-per-row plan has a different ceiling than a scan |
| Algorithmic | minimum passes over the data, or the information-theoretic bound (n log n comparisons, one pass, one hash) | the problem, not the implementation |
| Interactive UI | the frame budget (16.7 ms at 60 Hz) minus the browser's own work | the platform |

If two resources are close, price both and say which one you assumed.

## Phase 2 — Write the ceiling down

Number, unit, input size, hardware. `2 GB input / 1.8 GB per s measured sequential read = 1.1 s floor on beagle-ab2 NVMe.` An unwritten ceiling gets quietly revised downward every time the code disappoints.

## Phase 3 — Measure, then report the ratio

Real input sizes, target hardware. Report:

```
workload:          <what it does, input size>
hardware:          <machine; mark it if not the target>
binding resource:  <one>
ceiling:           <number unit>   (<derivation>)
achieved:          <number unit>
ratio:             <n>% of ceiling
```

"2x faster" with no ceiling line is not a result. No performance claim ships without a measurement; anything unmeasured is labeled an estimate.

## Phase 4 — Close the gap by removing work first

In order. Do not skip down the list.

1. **Delete the work.** Does this byte need to move, this row need to be read, this round trip need to happen? The largest wins are always work that should not exist.
2. **Amortize it.** Batch round trips, hoist invariants out of loops, cache what is recomputed.
3. **Change the algorithm or the data layout.** Fewer passes, better locality, contiguous over pointer-chasing.
4. **Parallelize** — only once the serial work count is minimal, or you buy hardware to run waste faster.
5. **Micro-optimize.** Last. Below roughly 30% of ceiling it is almost never the answer.

A profiler tells you where the time goes; only the ceiling tells you whether that time should exist at all. Ceiling first, profiler second.

## Phase 5 — Stop rule

| State | Action |
|---|---|
| Bandwidth- or compute-bound, >=50% of ceiling | Done. Report the ratio and stop. |
| I/O- or latency-bound, >=80% of ceiling | Done. |
| Below the band | Defect. Keep going, back to Phase 4 step 1. |
| Above the band and still too slow | The **model** is wrong, not the code. Stop tuning. You priced the wrong resource, or the requirement needs work that this design must not do at all. Rebuild the ceiling. |

A better algorithm **moves the ceiling**. Re-derive it and re-measure the ratio — never carry the old ceiling forward, or a genuine algorithmic win shows up as a fake efficiency win.

## Worked example

> Scan 2 GB of newline-delimited JSON for three fields.
>
> - Binding resource: storage. Measured sequential read 1.8 GB/s -> **ceiling 1.1 s**.
> - First measurement: 46 s = **2.4% of ceiling**. Micro-optimizing here would have been theatre.
> - Removed work (Phase 4.1): full parse of every record when three fields were needed -> field scan. 3.9 s = 28%.
> - Removed work again: per-line allocation -> reused buffer. 1.6 s = **70% of ceiling**, storage-bound, over the band. Stop.
>
> Reported as 70% of ceiling, not as "29x faster" — the second number flatters the starting point.

## When this does not apply

Cold path, no stated budget, nobody complaining: skip it, [[ponytail]] governs. Prototype or spike: skip it. But the moment someone says "make this faster", or a perf budget exists, or a speedup is being claimed, the ceiling is mandatory.

## Anti-patterns

- A speedup ratio with no ceiling to compare against.
- Profiler before ceiling — optimizes the shape of the waste.
- Benchmarks on the dev laptop for code that runs on the server, unlabeled.
- Toy input sizes: the binding resource changes when the working set leaves cache.
- Tuning past the band instead of admitting the model is wrong.

## Related

Casey Muratori, *Performance-Aware Programming* / the refterm case study, for the
ceiling-first method and the non-pessimization argument.

[[diagnose]] for a perf **regression** — that is a bisect against a known-good baseline, then this skill for the absolute number. [[ponytail]] `ponytail:` comments name a shortcut's ceiling and upgrade path. [[verification-before-completion]] — the measurement is the evidence.
