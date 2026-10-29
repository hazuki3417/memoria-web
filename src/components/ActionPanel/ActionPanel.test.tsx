import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ActionPanel } from "./ActionPanel"

describe("ActionPanel", () => {
  it("preserves the declared action order", () => {
    const markup = renderToStaticMarkup(
      <ActionPanel>
        <ActionPanel.Start><button type="button">Delete</button></ActionPanel.Start>
        <ActionPanel.Center><button type="button">Cancel</button></ActionPanel.Center>
        <ActionPanel.End><button type="button">Save</button></ActionPanel.End>
      </ActionPanel>,
    )

    expect(markup.indexOf("Delete")).toBeLessThan(markup.indexOf("Cancel"))
    expect(markup.indexOf("Cancel")).toBeLessThan(markup.indexOf("Save"))
  })

  it("renders only provided regions and passes through className and style", () => {
    const markup = renderToStaticMarkup(
      <ActionPanel className="consumer-layout" style={{ width: "100%" }}>
        <ActionPanel.End className="consumer-end" style={{ justifyContent: "flex-end" }}>
          <button type="button">Confirm</button>
        </ActionPanel.End>
      </ActionPanel>,
    )

    expect(markup).toContain("consumer-layout")
    expect(markup).toContain("consumer-end")
    expect(markup).toContain("width:100%")
    expect(markup).toContain("justify-content:flex-end")
    expect(markup).toContain("Confirm")
    expect(markup).not.toContain("data-action-slot")
  })
})
