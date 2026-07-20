import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatComposer } from "@/components/inbox/ChatComposer";

describe("ChatComposer", () => {
  it("shows the not-Twelvee toast when clicking the compose area", async () => {
    const user = userEvent.setup();
    render(<ChatComposer />);

    await user.click(
      screen.getByRole("button", { name: /write a message/i }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "you ain't Twelvee brotha, can't answer that",
    );
  });

  it("shows the not-Twelvee toast when clicking Send", async () => {
    const user = userEvent.setup();
    const { container } = render(<ChatComposer />);

    await user.click(
      within(container).getByRole("button", { name: "Send" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "you ain't Twelvee brotha, can't answer that",
    );
  });

  it("dismisses the toast when clicking the close button", async () => {
    const user = userEvent.setup();
    const { container } = render(<ChatComposer />);

    await user.click(
      within(container).getByRole("button", { name: "Send" }),
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
