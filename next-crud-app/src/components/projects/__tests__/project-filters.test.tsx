import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectFilters } from "../project-filters";

jest.mock("next/navigation");
const mockPush = jest.fn();
const mockGet = jest.fn();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });
  (useSearchParams as jest.Mock).mockReturnValue({
    get: mockGet,
  });

  mockGet.mockReturnValue(null);
  mockPush.mockClear();
});

describe("ProjectFilters", () => {
  it("should render all filter inputs", () => {
    render(<ProjectFilters />);

    // Search input works with getByLabelText
    expect(screen.getByLabelText("Search")).toBeInTheDocument();

    // For select components, use different queries
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("All statuses")).toBeInTheDocument();

    expect(screen.getByText("Priority")).toBeInTheDocument();
    expect(screen.getByText("All priorities")).toBeInTheDocument();

    expect(screen.getByText("Sort By")).toBeInTheDocument();
    expect(screen.getByText("Order")).toBeInTheDocument();
  });

  it("should apply filters when Apply Filters button is clicked", async () => {
    const user = userEvent.setup();
    render(<ProjectFilters />);

    const searchInput = screen.getByLabelText("Search");
    await user.type(searchInput, "test project");

    const applyButton = screen.getByText("Apply Filters");
    await user.click(applyButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/projects?search=test+project&sortBy=createdAt&order=desc"
      );
    });
  });

  it("should clear all filters when Clear Filters button is clicked", async () => {
    const user = userEvent.setup();

    mockGet.mockImplementation((key: string) => {
      switch (key) {
        case "search":
          return "existing search";
        case "status":
          return "planning";
        default:
          return null;
      }
    });

    render(<ProjectFilters />);

    const clearButton = screen.getByText("Clear Filters");
    await user.click(clearButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/projects");
    });
  });

  it("should handle Enter key press in search input", async () => {
    const user = userEvent.setup();
    render(<ProjectFilters />);

    const searchInput = screen.getByLabelText("Search");
    await user.type(searchInput, "test");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/projects?search=test&sortBy=createdAt&order=desc"
      );
    });
  });

  it("should populate search input from URL params", () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "search") return "existing search";
      return null;
    });

    render(<ProjectFilters />);

    expect(screen.getByDisplayValue("existing search")).toBeInTheDocument();
  });
});
