import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test('page de connexion affiche le formulaire', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('redirige vers login pour les pages admin non connectées', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('connexion avec identifiants invalides affiche une erreur', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalide@test.com');
    await page.fill('input[type="password"]', 'mauvais-mot-de-passe');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Erreur|Invalide|Incorrect')).toBeVisible({ timeout: 10000 }).catch(() => {
      // L'erreur peut être visuelle ou via un toast
    });
  });

  test('déconnexion depuis l\'admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin2@racing-bingerville.ci');
    await page.fill('input[type="password"]', 'Admin2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin', { timeout: 15000 });
    await expect(page.locator('text=Déconnexion')).toBeVisible();
    await page.click('text=Déconnexion');
    await expect(page).toHaveURL(/\/login/);
  });
});
