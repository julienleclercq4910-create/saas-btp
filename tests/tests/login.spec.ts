import { test, expect } from '@playwright/test';

test('la page login s affiche', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Connexion')).toBeVisible();
});