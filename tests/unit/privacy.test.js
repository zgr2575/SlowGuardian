import { describe, it, expect, vi } from "vitest";
import { comboFromEvent, describeCombo, matches } from "../../src/lib/panic.js";
import {
  CLOAKS,
  resolveCloak,
  applyCloak,
  openInAboutBlank,
  DEFAULT_TITLE,
} from "../../src/lib/cloak.js";

describe("panic key combos", () => {
  const event = (init) => new KeyboardEvent("keydown", init);

  it("reads a combo off an event", () => {
    expect(comboFromEvent(event({ key: "e", ctrlKey: true }))).toBe(
      "Control+e",
    );
    expect(
      comboFromEvent(event({ key: "Q", altKey: true, shiftKey: true })),
    ).toBe("Alt+Shift+q");
    expect(comboFromEvent(event({ key: "`" }))).toBe("`");
    expect(comboFromEvent(event({ key: "Escape" }))).toBe("Escape");
  });

  it("ignores a bare modifier press", () => {
    expect(comboFromEvent(event({ key: "Control", ctrlKey: true }))).toBeNull();
  });

  it("matches the configured combo only", () => {
    expect(matches(event({ key: "e", ctrlKey: true }), "Control+e")).toBe(true);
    expect(matches(event({ key: "e" }), "Control+e")).toBe(false);
    expect(matches(event({ key: "e", ctrlKey: true }), "")).toBe(false);
  });

  it("describes a combo for the UI", () => {
    expect(describeCombo("Control+e")).toBe("Ctrl + E");
    expect(describeCombo("Alt+Shift+q")).toBe("Alt + Shift + Q");
  });
});

describe("tab cloak", () => {
  it("ships v8's presets, each with an icon", () => {
    expect(CLOAKS.length).toBeGreaterThan(5);
    for (const cloak of CLOAKS) {
      expect(cloak.title.length).toBeGreaterThan(0);
      expect(cloak.icon).toMatch(/^\/cloak\//);
    }
  });

  it("resolves presets, custom values and nothing at all", () => {
    expect(resolveCloak({ preset: "classroom" }).title).toBe("Home");
    expect(
      resolveCloak({ preset: "custom", title: "Mail", icon: "/x.png" }),
    ).toEqual({ title: "Mail", icon: "/x.png" });
    expect(resolveCloak({ preset: "none" }).title).toBe(DEFAULT_TITLE);
    expect(resolveCloak({}).title).toBe(DEFAULT_TITLE);
  });

  it("writes the title and favicon into the document", () => {
    document.body.innerHTML =
      '<link id="sg-favicon" rel="icon" href="/favicon.png" />';
    applyCloak({ preset: "drive" });
    expect(document.title).toBe("My Drive - Google Drive");
    expect(document.getElementById("sg-favicon").getAttribute("href")).toBe(
      "/cloak/drive.png",
    );
  });
});

describe("about:blank cloak", () => {
  it("refuses on Firefox, which blocks scripting a blank popup", () => {
    const win = {
      navigator: { userAgent: "Mozilla/5.0 Firefox/130" },
      open: vi.fn(),
    };
    expect(openInAboutBlank({ win })).toBe("firefox");
    expect(win.open).not.toHaveBeenCalled();
  });

  it("reports blocked popups", () => {
    const win = {
      navigator: { userAgent: "Chrome/131" },
      open: vi.fn(() => null),
    };
    expect(openInAboutBlank({ win })).toBe("blocked");
  });

  it("builds the blank window and sends this tab to the decoy", () => {
    const popup = {
      closed: false,
      document: document.implementation.createHTMLDocument(""),
    };
    const win = {
      navigator: { userAgent: "Chrome/131" },
      open: vi.fn(() => popup),
      location: { replace: vi.fn() },
    };

    const error = openInAboutBlank({
      win,
      cloak: { preset: "classroom" },
      decoy: "https://classroom.google.com/",
      target: "https://sg.example/",
    });

    expect(error).toBeNull();
    expect(popup.document.title).toBe("Home");
    expect(popup.document.querySelector("iframe").src).toBe(
      "https://sg.example/",
    );
    expect(popup.document.querySelector("link[rel=icon]").href).toContain(
      "/cloak/classroom.png",
    );
    expect(win.location.replace).toHaveBeenCalledWith(
      "https://classroom.google.com/",
    );
  });
});
