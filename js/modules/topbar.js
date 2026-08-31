/* ----------------------------- 顶栏悬浮 from Savor ---------------------------- */

import {
  isTabletDevice,
  shouldDisableTopbarFloat,
  shouldUseMobileThemeLayout,
} from "./device.js";

const TOOLBAR_SHOW_CLASS = "my-theme--toolbar-show";

function initDeviceBodyClass() {
  if (shouldUseMobileThemeLayout()) {
    document.body.classList.add("body--mobile");
    return;
  }

  document.body.classList.toggle("body--tablet", isTabletDevice());
}

/** 类似 VS Code / Cursor：单击 Alt 显示顶栏，再按 Alt / Esc / 点击外部隐藏 */
function initFloatingToolbarAltToggle() {
  if (shouldDisableTopbarFloat()) return;

  let altPressedAlone = false;

  const isShown = () => document.body.classList.contains(TOOLBAR_SHOW_CLASS);
  const hideToolbar = () => document.body.classList.remove(TOOLBAR_SHOW_CLASS);
  const toggleToolbar = () => document.body.classList.toggle(TOOLBAR_SHOW_CLASS);

  const shouldIgnoreAltToggle = () => {
    const el = document.activeElement;
    if (!el || !(el instanceof Element)) return false;
    const tag = el.tagName;
    // 仅跳过表单控件；思源正文是 contenteditable，仍需响应 Alt
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  };

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && isShown()) {
        hideToolbar();
        return;
      }

      if (e.key === "Alt") {
        // 仅单独按 Alt 时标记；配合其它键（Alt+1 等）则取消
        altPressedAlone = !e.repeat && !e.ctrlKey && !e.metaKey && !e.shiftKey;
        // 阻止 Windows/Electron 把焦点挪到系统菜单栏
        if (altPressedAlone) e.preventDefault();
        return;
      }

      if (e.altKey) altPressedAlone = false;
    },
    true
  );

  window.addEventListener(
    "keyup",
    (e) => {
      if (e.key !== "Alt") return;

      const shouldToggle = altPressedAlone;
      altPressedAlone = false;
      if (!shouldToggle || shouldIgnoreAltToggle()) return;

      e.preventDefault();
      toggleToolbar();
    },
    true
  );

  // Alt+Tab 等切走窗口后，丢掉「单独 Alt」状态，避免回来时误触发
  window.addEventListener("blur", () => {
    altPressedAlone = false;
  });

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!isShown()) return;
      const toolbar = document.getElementById("toolbar");
      if (toolbar && toolbar.contains(e.target)) return;
      hideToolbar();
    },
    true
  );
}

export const initTopbar = () => {
  initDeviceBodyClass();
  initFloatingToolbarAltToggle();
};
