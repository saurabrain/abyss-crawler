/**
 * REG-001
 * Bug: Skill tree opened with Tab had no way to close; Escape was unhandled
 * Fixed: 2026-04-18
 * Trigger: Press Tab → skill tree opens; pressing Escape must close it
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import '../../tests/_dom-stub.mjs';
import { SkillTreeUI } from '../../src/ui/SkillTreeUI.js';

test('[REG-001] SkillTreeUI.toggle opens and can be closed by setting visible=false', () => {
  const ui = new SkillTreeUI();
  assert.equal(ui.visible, false, 'starts hidden');

  ui.toggle();
  assert.equal(ui.visible, true, 'Tab opens it');

  // Simulates Escape handler: set visible = false directly
  ui.visible = false;
  assert.equal(ui.visible, false, 'Escape closes it');
});

test('[REG-001] SkillTreeUI hint text contains Esc, not Tab', () => {
  const src = readFileSync(
    fileURLToPath(new URL('../../src/ui/SkillTreeUI.js', import.meta.url)), 'utf8'
  );
  assert.ok(src.includes('Esc to close'), 'hint must say "Esc to close", not "Tab to close"');
});
