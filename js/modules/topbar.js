/* ----------------------------- 顶栏悬浮 from Savor ---------------------------- */

import {
  isOfficialMobileLayout,
  isLikelyMobileBrowser,
  logDeviceDetection,
  shouldUseMobileThemeLayout,
} from "./device.js";

const TOOLBAR_SHOW_CLASS = "my-theme--toolbar-show";

function topbarfixedButton() {
  notionThemeToolplusAddButton(
    "topBar",
    "toolbar__item b3-tooltips b3-tooltips__sw",
    "隐藏顶栏",
    "/appearance/themes/Savor/img/topbar2.svg",
    "/appearance/themes/Savor/img/topbar.svg",
    () => {
      loadStyle("/appearance/themes/Savor/style/topbar/top-fixed.css", "topbar隐藏").setAttribute(
        "topBarcss",
        "topbar隐藏"
      );
    },
    () => {
      document.getElementById("topbar隐藏").remove();
    },
    true
  );
}

/* 顶栏添加文档树按钮 from QYL*/
function addTopbarTreeButton() {
  const treeBtn = document.getElementById("topbarTreeBtn");
  if (!treeBtn) {
    const toolbarVIP = document.getElementById("toolbarVIP");
    const windowControls = document.getElementById("windowControls");
    const newBtn = document.createElement("div");
    newBtn.id = "topbarTreeBtn";
    newBtn.className = "toolbar__item ariaLabel";
    newBtn.style.width = "23.5px";
    newBtn.style.height = "23.5px";
    newBtn.innerHTML = `<svg><use xlink:href="#iconFiles"></use></svg>`;
    newBtn.ariaLabel = "<span style='white-space:pre'>Doc Tree Alt+1 </span>";
    newBtn.style.userSelect = "none";
    const handleToolbarClick = () => {
      const settingsWindow = document.getElementById("QYLsettings-window");
      settingsWindow ? closeSettingsWindow() : createSettingsWindow();
    };
    const parentElement = toolbarVIP?.parentElement || windowControls?.parentElement;
    if (parentElement) {
      parentElement.insertBefore(newBtn, toolbarVIP || windowControls);
      // newBtn.addEventListener("click", handleToolbarClick);
      newBtn.addEventListener("click", () => {
        // 模拟点击文档树按钮
        const docTreeBtn = document.getElementsByClassName("dock__item ariaLabel")[0];
        if (docTreeBtn) {
          docTreeBtn.click();
        } else {
          alert("未找到文档树按钮，请检查选择器");
        }
      });
    }
  }
}

function initMobileBodyClass() {
  if (!shouldUseMobileThemeLayout()) return;

  document.body.classList.add("body--mobile");
  document.body.classList.toggle("body--mobile-browser", isLikelyMobileBrowser());

  if (navigator.platform.toUpperCase().indexOf("MAC") > -1) {
    document.body.classList.add("body--mac");
  }
}

/** 类似 VS Code / Cursor：单击 Alt 显示顶栏，再按 Alt / Esc / 点击外部隐藏 */
function initFloatingToolbarAltToggle() {
  if (shouldUseMobileThemeLayout()) return;

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
  initMobileBodyClass();
  // logDeviceDetection();
  initFloatingToolbarAltToggle();

  if (isOfficialMobileLayout()) {
    addTopbarTreeButton();
  }
};
