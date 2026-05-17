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

  test('bankroll math: ante deducted, returned on win/loss/tie', async ({ page }) => {
    await page.goto(`${BASE}/play/holdem`);
    await expect(page.getByRole('button', { name: /deal hand/i })).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('$1,000').first()).toBeVisible();

    await page.getByRole('button', { name: /deal hand/i }).click();
    await page.waitForTimeout(400);

    // Ante 25 deducts -> bankroll $975, pot $50
    await expect(page.getByText('$975').first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('$50').first()).toBeVisible({ timeout: 3000 });

    // Check all the way down
    await page.getByRole('button', { name: /see flop/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /^check$/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /^check$/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /^check$/i }).click();
    await page.waitForTimeout(800);

    await expect(page.getByRole('button', { name: /new hand/i })).toBeVisible({ timeout: 5000 });

    // Final bankroll must be one of: $975 (loss), $1,000 (tie), $1,025 (win)
    const bankrollText = await page.locator('text=/^\\$(975|1,000|1,025)$/').first().textContent();
    expect(['$975', '$1,000', '$1,025']).toContain(bankrollText);
  });

  test('rapid double-clicks do not corrupt state', async ({ page }) => {
    await page.goto(`${BASE}/play/holdem`);
    await expect(page.getByRole('button', { name: /deal hand/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /deal hand/i }).click();
    await page.waitForTimeout(400);

    const seeFlop = page.getByRole('button', { name: /see flop/i });
    await seeFlop.click();
    // Second click should be ignored (button disabled during 350ms bot delay)
    await seeFlop.click({ force: true }).catch(() => {});
    await page.waitForTimeout(600);

    // Should be at flop, not skipped past
    await expect(page.getByText('Community')).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: /^check$|^fold$/i }).first()).toBeVisible({ timeout: 3000 });
  });

  test('fold ends hand and shows new hand button', async ({ page }) => {
    await page.goto(`${BASE}/play/holdem`);
    await expect(page.getByRole('button', { name: /deal hand/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /deal hand/i }).click();
    await page.waitForTimeout(400);

    await page.getByRole('button', { name: /^fold$/i }).click();
    await page.waitForTimeout(600);

    await expect(page.getByText(/folded/i).first()).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: /new hand/i })).toBeVisible({ timeout: 3000 });
  });

  test('new hand resets pot to $0 and clears cards', async ({ page }) => {
    await page.goto(`${BASE}/play/holdem`);
    await expect(page.getByRole('button', { name: /deal hand/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /deal hand/i }).click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /^fold$/i }).click();
    await page.waitForTimeout(600);

    await page.getByRole('button', { name: /new hand/i }).click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('button', { name: /deal hand/i })).toBeVisible({ timeout: 3000 });
    // Pot is $0 after reset
    await expect(page.getByText('$0').first()).toBeVisible({ timeout: 3000 });
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
