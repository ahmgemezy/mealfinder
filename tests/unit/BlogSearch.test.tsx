import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BlogSearch from "../../components/blog/BlogSearch";

const push = vi.fn();
const mockSearchParams = {
  get: (k: string) => (k === "search" ? "pasta" : null),
};

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push }),
}));

describe("BlogSearch", () => {
  it("renders initial query and navigates on submit", async () => {
    render(<BlogSearch locale="en" />);

    const input = screen.getByPlaceholderText(
      "Search blog posts..."
    ) as HTMLInputElement;
    expect(input.value).toBe("pasta");

    // Wait for any mount effects to settle, then change the input
    await waitFor(() => expect(input.value).toBe("pasta"));

    fireEvent.input(input, { target: { value: "sushi" } });
    await waitFor(() => expect(input.value).toBe("sushi"));

    const submitBtn = screen.getByLabelText("Search");
    fireEvent.click(submitBtn);

    expect(push).toHaveBeenCalledWith("/en/blog?search=sushi");
  });
});
