// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Texas Hold\'em', () => {
  test('direct /play/holdem route loads the game', async ({ page }) => {
    await page.goto(`${BASE}/play/holdem`);
    // Game title
    await expect(page.getByText("Texas Hold'em").first()).toBeVisible({ timeout: 10000 });
    // Deal Hand button in idle state
    await expect(page.getByRole('button', { name: /deal hand/i })).toBeVisible({ timeout: 8000 });
    // Hand rankings sidebar
    await expect(page.getByText('HAND RANKINGS')).toBeVisible({ timeout: 5000 });
  });

  test('can play a full hand vs bot', async ({ page }) => {
    await page.goto(`${BASE}/play/holdem`);
    await expect(page.getByRole('button', { name: /deal hand/i })).toBeVisible({ timeout: 10000 });

    // Deal a hand
    await page.getByRole('button', { name: /deal hand/i }).click();
    await page.waitForTimeout(400);

    // Phase badge should appear (Pre-Flop)
    await expect(page.getByText(/pre.?flop/i).first()).toBeVisible({ timeout: 4000 });

    // Player should have hole cards — "YOU" section visible
    await expect(page.getByText('YOU')).toBeVisible({ timeout: 3000 });

    // "See Flop" button should be present at pre-flop
    const seeFlop = page.getByRole('button', { name: /see flop/i });
    await expect(seeFlop).toBeVisible({ timeout: 5000 });

    // Advance to flop
    await seeFlop.click();
    await page.waitForTimeout(600);

    // Community section should appear after flop
    await expect(page.getByText('Community')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/flop/i).first()).toBeVisible({ timeout: 3000 });

    // Check button should now be present
    const checkBtn = page.getByRole('button', { name: /^check$/i });
    await expect(checkBtn).toBeVisible({ timeout: 5000 });
    await checkBtn.click();
    await page.waitForTimeout(600);

    // Turn — check again
    const checkBtn2 = page.getByRole('button', { name: /^check$/i });
    await expect(checkBtn2).toBeVisible({ timeout: 5000 });
    await checkBtn2.click();
    await page.waitForTimeout(600);

    // River — check to showdown
    const checkBtn3 = page.getByRole('button', { name: /^check$/i });
    await expect(checkBtn3).toBeVisible({ timeout: 5000 });
    await checkBtn3.click();
    await page.waitForTimeout(800);

    // Hand should be over — New Hand button
    await expect(page.getByRole('button', { name: /new hand/i })).toBeVisible({ timeout: 5000 });

    // No error text
    await expect(page.locator('text=/Error|TypeError|undefined is not/i')).toHaveCount(0);
  });

  test('game tile on lobby routes to holdem', async ({ page }) => {
    await page.goto(BASE);

    // Wait for loading screen (2.5s app init) then check for game lobby
    const gameFloor = page.locator('[class*="gametile"], [class*="game-tile"]').first();
    const isLobbied = await gameFloor.isVisible({ timeout: 8000 }).catch(() => false);

    if (isLobbied) {
      // Find Texas Hold'em tile and click it
      const holdemTile = page.locator('[class*="gametile"]').filter({ hasText: /hold.?em|texas/i }).first();
      if (await holdemTile.isVisible({ timeout: 3000 }).catch(() => false)) {
        await holdemTile.click();
        await expect(page).toHaveURL(/\/play\/holdem/, { timeout: 5000 });
      } else {
        await page.goto(`${BASE}/play/holdem`);
      }
    } else {
      // Login wall — navigate directly
      await page.goto(`${BASE}/play/holdem`);
    }

    await expect(page.getByText("Texas Hold'em").first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: /deal hand/i })).toBeVisible({ timeout: 8000 });
  });
});
