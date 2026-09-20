import CLOAKS from "../data/cloaks.json";

export { CLOAKS };

export const DEFAULT_TITLE = "SlowGuardian";
export const DEFAULT_ICON = "/favicon.png";

export function cloakById(id) {
  return CLOAKS.find((cloak) => cloak.id === id) ?? null;
}

// What the tab should say and show, given the cloak settings.
export function resolveCloak(cloak = {}) {
  if (cloak.preset === "custom") {
    return {
      title: cloak.title || DEFAULT_TITLE,
      icon: cloak.icon || DEFAULT_ICON,
    };
  }
  const preset = cloakById(cloak.preset);
  if (!preset) return { title: DEFAULT_TITLE, icon: DEFAULT_ICON };
  return { title: preset.title, icon: preset.icon };
}

export function applyCloak(cloak, doc = document) {
  const { title, icon } = resolveCloak(cloak);
  doc.title = title;
  const link =
    doc.getElementById("sg-favicon") || doc.querySelector("link[rel~='icon']");
  if (link) link.href = icon;
}

/**
 * v8's about:blank cloak: open a blank window, run SlowGuardian inside it wearing the
 * disguise, then send the original tab to the decoy so nothing on screen points here.
 * Returns an error string when the browser won't allow it.
 */
export function openInAboutBlank({
  cloak,
  decoy,
  target = location.href,
  win = window,
} = {}) {
  if (win.navigator.userAgent.includes("Firefox")) return "firefox";

  const popup = win.open("about:blank", "_blank");
  if (!popup || popup.closed) return "blocked";

  const { title, icon } = resolveCloak(cloak);
  const doc = popup.document;
  doc.title = title;

  const link = doc.createElement("link");
  link.rel = "icon";
  link.href = icon;
  doc.head.appendChild(link);

  const frame = doc.createElement("iframe");
  frame.src = target;
  frame.style.cssText =
    "position:fixed;inset:0;border:0;width:100%;height:100%";
  doc.body.style.margin = "0";
  doc.body.appendChild(frame);

  if (decoy) win.location.replace(decoy);
  return null;
}
