import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextWithMentions } from "@/components/shared/TextWithMentions";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("TextWithMentions", () => {
  it("renders plain text without mentions unchanged", () => {
    render(<TextWithMentions text="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("links a single @mention to the profile page", () => {
    render(<TextWithMentions text="Hey @Twelvee what's up" />);

    const link = screen.getByRole("link", { name: "Twelvee" });
    expect(link).toHaveAttribute("href", "/profile/twelvee");
    expect(screen.getByText(/what's up/)).toBeInTheDocument();
  });

  it("links multiple @mentions in the same string", () => {
    render(<TextWithMentions text="@Twelvee and @Stolou are friends" />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/profile/twelvee");
    expect(links[1]).toHaveAttribute("href", "/profile/stolou");
  });
});
