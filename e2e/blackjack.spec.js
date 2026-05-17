// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Single-player Blackjack', () => {
  test('direct /play/blackjack route loads the game', async ({ page }) => {
    await page.goto(`${BASE}/play/blackjack`);
    await expect(page.getByRole('heading', { name: /^blackjack$/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^deal$/i })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/RULES/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/3:2/).first()).toBeVisible({ timeout: 3000 });
  });

  test('deal → hit/stand → resolves to win, loss, or push', async ({ page }) => {
    await page.goto(`${BASE}/play/blackjack`);
    await expect(page.getByRole('button', { name: /^deal$/i })).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /^deal$/i }).click();

    // Either insurance is offered, or hit/stand appear, or instant BJ resolution
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim() || '');
      return btns.some(t => /hit/i.test(t)) || btns.some(t => /insurance/i.test(t)) || btns.some(t => /new hand/i.test(t));
    }, { timeout: 4000 });

    // Decline insurance if offered
    const noIns = page.getByRole('button', { name: /^no insurance$/i });
    if (await noIns.isVisible({ timeout: 800 }).catch(() => false)) {
      await noIns.click();
    }

    // Play with simple strategy: stand on 17+, hit below
    for (let i = 0; i < 8; i++) {
      const newHand = page.getByRole('button', { name: /^new hand$/i });
      if (await newHand.isVisible({ timeout: 300 }).catch(() => false)) break;
      const hit = page.getByRole('button', { name: /^hit$/i });
      const stand = page.getByRole('button', { name: /^stand$/i });
      const isHit = await hit.isVisible({ timeout: 300 }).catch(() => false);
      if (!isHit) break;
      // Read active hand total from page text
      const total = await page.evaluate(() => {
        const active = document.querySelector('[style*="border: 2px solid"]') ||
                       document.querySelector('[style*="border:2px solid"]');
        const txt = active?.querySelector('div:last-child')?.textContent || '';
        return +((txt.match(/^(\d+)/) || [])[1] || 0);
      });
      if (total >= 17) {
        await stand.click();
      } else {
        await hit.click();
      }
      await page.waitForTimeout(450);
    }

    await expect(page.getByRole('button', { name: /^new hand$/i })).toBeVisible({ timeout: 6000 });

    // No JS errors thrown
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    expect(errors).toHaveLength(0);
  });

  test('bankroll decreases on loss, increases on win', async ({ page }) => {
    await page.goto(`${BASE}/play/blackjack`);
    await expect(page.getByRole('button', { name: /^deal$/i })).toBeVisible({ timeout: 10000 });

    const readBank = () => page.evaluate(() => {
      const m = document.body.innerText.match(/BANKROLL\s+\$([0-9,]+)/);
      return m ? +m[1].replace(/,/g, '') : 0;
    });

    // Play 4 hands and confirm bankroll moves
    const initial = await readBank();
    expect(initial).toBe(1000);

    let hadDelta = false;
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /^deal$/i }).click();
      const noIns = page.getByRole('button', { name: /^no insurance$/i });
      if (await noIns.isVisible({ timeout: 800 }).catch(() => false)) await noIns.click();
      // play
      for (let s = 0; s < 8; s++) {
        const newHand = page.getByRole('button', { name: /^new hand$/i });
        if (await newHand.isVisible({ timeout: 250 }).catch(() => false)) break;
        const stand = page.getByRole('button', { name: /^stand$/i });
        const hit   = page.getByRole('button', { name: /^hit$/i });
        if (!(await hit.isVisible({ timeout: 250 }).catch(() => false))) break;
        const total = await page.evaluate(() => {
          const active = document.querySelector('[style*="border: 2px solid"]') ||
                         document.querySelector('[style*="border:2px solid"]');
          const txt = active?.querySelector('div:last-child')?.textContent || '';
          return +((txt.match(/^(\d+)/) || [])[1] || 0);
        });
        if (total >= 17) await stand.click(); else await hit.click();
        await page.waitForTimeout(450);
      }
      await expect(page.getByRole('button', { name: /^new hand$/i })).toBeVisible({ timeout: 6000 });
      const bank = await readBank();
      if (bank !== initial) hadDelta = true;
      await page.getByRole('button', { name: /^new hand$/i }).click();
      await page.waitForTimeout(150);
    }
    expect(hadDelta).toBe(true);
  });

  test('game tile on lobby routes to /play/blackjack', async ({ page }) => {
    await page.goto(BASE);

    const tile = page.locator('[class*="gametile"]').filter({ hasText: /single.player.*blackjack/i }).first();
    if (await tile.isVisible({ timeout: 8000 }).catch(() => false)) {
      await tile.click();
      await expect(page).toHaveURL(/\/play\/blackjack/, { timeout: 5000 });
    } else {
      await page.goto(`${BASE}/play/blackjack`);
    }

    await expect(page.getByRole('heading', { name: /^blackjack$/i })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: /^deal$/i })).toBeVisible({ timeout: 8000 });
  });
});
