#!/usr/bin/env node
/**
 * Stop hook - Mark active dartai loop as interrupted.
 *
 * If a loop is running when the session ends, this marks the loop state
 * so the next session can detect and offer to resume.
 */

const fs = require('fs');
const path = require('path');

const LOOP_FILE = path.join(process.cwd(), '.dartai', 'loop-state.json');

try {
  if (!fs.existsSync(LOOP_FILE)) {
    console.log(JSON.stringify({ skipped: true, reason: 'no active loop' }));
    process.exit(0);
  }

  const loop = JSON.parse(fs.readFileSync(LOOP_FILE, 'utf-8'));

  // Only mark as interrupted if the loop was actually running
  if (loop.status === 'running' || loop.status === 'in_progress') {
    loop.status = 'interrupted';
    loop.interrupted_at = new Date().toISOString();
    fs.writeFileSync(LOOP_FILE, JSON.stringify(loop, null, 2));
    console.log(JSON.stringify({ marked: true, loop_id: loop.loop_task_id || loop.loop_id }));
  } else {
    console.log(JSON.stringify({ skipped: true, reason: `loop status: ${loop.status}` }));
  }
} catch (e) {
  console.log(JSON.stringify({ error: e.message }));
}
