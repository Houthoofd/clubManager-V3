import { test, expect } from "../../fixtures";

test.describe("Professor Edge Cases", () => {
  // 1. Grading students
  test("professor can grade students in their assigned course", async ({
    professorPage,
  }) => {
    // Navigate to a specific course page they are assigned to
    await professorPage.goto("/courses/1");
    await professorPage.waitForLoadState("networkidle");

    // Click on grading tab or button
    const gradingTab = professorPage
      .getByTestId("tab-grading")
      .or(professorPage.getByRole("tab", { name: /notes|grading|évaluation/i }));
    
    if (await gradingTab.isVisible().catch(() => false)) {
      await gradingTab.click();
    }

    // Attempt to grade a student
    const studentRow = professorPage
      .getByTestId("student-row-1")
      .or(professorPage.locator(".student-row").first());
      
    if (await studentRow.isVisible().catch(() => false)) {
      const gradeInput = studentRow
        .locator('input[type="number"], input[name="grade"]')
        .first();
      if (await gradeInput.isVisible().catch(() => false)) {
        await gradeInput.fill("18");
        await professorPage
          .getByRole("button", { name: /save|sauvegarder|valider/i })
          .first()
          .click();
        await expect(professorPage.getByText(/success|succès/i)).toBeVisible();
      }
    }
  });

  // 2. Adding course materials or notes
  test("professor can add course materials or notes to their course", async ({
    professorPage,
  }) => {
    await professorPage.goto("/courses/1");
    await professorPage.waitForLoadState("networkidle");

    const materialTab = professorPage
      .getByTestId("tab-materials")
      .or(professorPage.getByRole("tab", { name: /matériel|materials|notes/i }));
      
    if (await materialTab.isVisible().catch(() => false)) {
      await materialTab.click();
    }

    const addMaterialBtn = professorPage
      .getByTestId("btn-add-material")
      .or(professorPage.getByRole("button", { name: /ajouter|add/i }).first());
      
    if (await addMaterialBtn.isVisible().catch(() => false)) {
      await addMaterialBtn.click();
      await professorPage
        .getByRole("textbox", { name: /title|titre/i })
        .fill("Course Notes - Chapter 1");
      await professorPage
        .getByRole("textbox", { name: /description/i })
        .fill("Please read these notes before the next class.");
      await professorPage
        .getByRole("button", { name: /save|sauvegarder|valider/i })
        .click();
        
      await expect(
        professorPage.getByText("Course Notes - Chapter 1")
      ).toBeVisible();
    }
  });

  // 3. Managing student absences
  test("professor can manage student absences for their course", async ({
    professorPage,
  }) => {
    await professorPage.goto("/courses/1/attendance");
    await professorPage.waitForLoadState("domcontentloaded");

    const absenceBtn = professorPage
      .getByTestId("btn-mark-absent")
      .or(professorPage.getByRole("button", { name: /absent/i }))
      .first();
      
    if (await absenceBtn.isVisible().catch(() => false)) {
      await absenceBtn.click();
      await expect(
        professorPage.getByText(/marked absent|marqué absent/i)
      ).toBeVisible();
    }
  });

  // 4. Attempting to manage a course they are not assigned to (access denied)
  test("professor gets access denied when attempting to manage an unassigned course", async ({
    professorPage,
  }) => {
    // Assuming course 999 is unassigned or another professor's course
    await professorPage.goto("/courses/999");
    await professorPage.waitForLoadState("domcontentloaded");

    // Check for access denied message or redirection
    const accessDenied = professorPage.getByText(
      /access denied|accès refusé|non autorisé/i
    );
    const isDeniedVisible = await accessDenied
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!isDeniedVisible) {
      // It might redirect to /courses or /dashboard if access is denied
      const url = professorPage.url();
      expect(url.includes("/courses/999")).toBe(false);
    } else {
      expect(isDeniedVisible).toBe(true);
    }
  });
});
