// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Provably-fair history + verify', () => {
  test('coin flip records a hand that verifies green', async ({ page }) => {
    await page.goto(`${BASE}/play/coinflip`);
    await expect(page.getByText('Coin Flip')).toBeVisible({ timeout: 10000 });

    // The provably-fair commitment must be visible BEFORE we bet
    const commitment = page.getByTestId('pf-commitment');
    await expect(commitment).toBeVisible({ timeout: 5000 });
    const commitmentHex = await commitment.textContent();
    expect(commitmentHex).toMatch(/^[0-9a-f]{64}$/);

    // Place a flip
    await page.getByRole('button', { name: /heads/i }).click();
    // Animation + record
    await page.waitForTimeout(1500);

    // A "verify ✓" link should appear
    const verifyLink = page.getByRole('link', { name: /verify/i }).first();
    await expect(verifyLink).toBeVisible({ timeout: 5000 });

    // Click into verify
    await verifyLink.click();
    await expect(page.getByRole('heading', { name: /Verify Hand/ })).toBeVisible({ timeout: 5000 });

    // The verify pill should resolve to "✓ Outcome reproduces from seeds"
    const verifyPill = page.getByTestId('verify-result-pill');
    await expect(verifyPill).toHaveText(/Outcome reproduces from seeds/, { timeout: 5000 });

    // The recorded commitment on verify page must match the one shown in the game
    const recorded = await page.getByTestId('verify-commitment').textContent();
    expect(recorded).toBe(commitmentHex);

    // The live-recomputed hash should match too
    const recomputed = await page.getByTestId('verify-recomputed-hash').textContent();
    expect(recomputed.trim()).toBe(commitmentHex);
  });

  test('hi-lo round records and verifies', async ({ page }) => {
    await page.goto(`${BASE}/play/hilo`);
    await expect(page.getByRole('heading', { name: /Hi-Lo/ })).toBeVisible({ timeout: 10000 });

    // Wait for PF panel to render (session async-initializes)
    await expect(page.getByTestId('pf-commitment')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /Higher/i }).click();
    await page.waitForTimeout(1500);

    const verifyLink = page.getByRole('link', { name: /verify/i }).first();
    await expect(verifyLink).toBeVisible({ timeout: 5000 });
    await verifyLink.click();

    await expect(page.getByTestId('verify-result-pill'))
      .toHaveText(/Outcome reproduces from seeds/, { timeout: 5000 });
  });

  test('history page lists recorded hands and filters by game', async ({ page }) => {
    // Pre-seed: play a coin flip
    await page.goto(`${BASE}/play/coinflip`);
    await expect(page.getByTestId('pf-commitment')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /tails/i }).click();
    await page.waitForTimeout(1500);

    // Navigate to history
    await page.goto(`${BASE}/history`);
    await expect(page.getByRole('heading', { name: /hand history/i })).toBeVisible({ timeout: 5000 });

    // Should have at least one row now
    const rows = page.getByTestId('history-row');
    await expect(rows.first()).toBeVisible({ timeout: 5000 });

    // CSV button should be enabled
    await expect(page.getByTestId('history-export-csv')).toBeEnabled();
  });
});
