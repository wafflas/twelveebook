import { expect, test } from "@playwright/test";

test("liking a post persists after refresh", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "News Feed" })).toBeVisible();

  const likeButton = page.getByRole("button", { name: "Like" }).first();
  await expect(likeButton).toBeVisible({ timeout: 15_000 });
  await expect(likeButton).toHaveAttribute("aria-pressed", "false");

  const likePostResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/likes/") &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await likeButton.click();

  const postResponse = await likePostResponse;
  const postBody = (await postResponse.json()) as {
    likes: number;
    likedByVisitor: boolean;
  };
  expect(postBody.likedByVisitor).toBe(true);

  await expect(
    page.getByRole("button", { name: "Liked <3" }).first(),
  ).toHaveAttribute("aria-pressed", "true");

  await page.reload();

  await expect(
    page.getByRole("button", { name: "Liked <3" }).first(),
  ).toHaveAttribute("aria-pressed", "true", { timeout: 15_000 });
});
