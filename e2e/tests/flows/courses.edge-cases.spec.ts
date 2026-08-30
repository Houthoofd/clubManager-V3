import { test, expect } from '@playwright/test';

test.describe('Course Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=\"email-input\"]', 'member@example.com');
    await page.fill('[data-testid=\"password-input\"]', 'password123');
    await page.click('[data-testid=\"login-button\"]');
    await page.waitForURL('/dashboard');
    await page.click('[data-testid=\"nav-courses\"]');
    await page.waitForURL('/courses');
  });

  test('Member enrolling in a course', async ({ page }) => {
    await page.click('[data-testid=\"course-card-available\"]');
    await page.click('[data-testid=\"enroll-button\"]');
    await page.click('[data-testid=\"confirm-enrollment-button\"]');
    await expect(page.locator('[data-testid=\"success-toast\"]')).toContainText('Successfully enrolled in the course');
    await page.click('[data-testid=\"nav-my-courses\"]');
    await expect(page.locator('[data-testid=\"enrolled-course-item\"]')).toBeVisible();
  });

  test('Waitlist logic: member is put on a waitlist if course is full', async ({ page }) => {
    await page.click('[data-testid=\"course-card-full\"]');
    await page.click('[data-testid=\"join-waitlist-button\"]');
    await page.click('[data-testid=\"confirm-waitlist-button\"]');
    await expect(page.locator('[data-testid=\"success-toast\"]')).toContainText('Successfully joined the waitlist');
    await page.click('[data-testid=\"nav-my-courses\"]');
    await expect(page.locator('[data-testid=\"waitlisted-course-item\"]')).toBeVisible();
  });
});

test.describe('Course Edge Cases - Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=\"email-input\"]', 'admin@example.com');
    await page.fill('[data-testid=\"password-input\"]', 'admin123');
    await page.click('[data-testid=\"login-button\"]');
    await page.waitForURL('/admin');
  });

  test('Admin canceling a course session and verifying members are notified', async ({ page }) => {
    await page.click('[data-testid=\"nav-admin-courses\"]');
    await page.click('[data-testid=\"manage-course-session\"]');
    await page.click('[data-testid=\"cancel-session-button\"]');
    await page.fill('[data-testid=\"cancellation-reason-input\"]', 'Instructor unavailable');
    await page.click('[data-testid=\"confirm-cancel-button\"]');
    await expect(page.locator('[data-testid=\"session-status-badge\"]')).toContainText('Cancelled');
    await expect(page.locator('[data-testid=\"success-toast\"]')).toContainText('Session cancelled and members notified');
  });
});
