/* ----------------------------- 顶栏悬浮 from Savor ---------------------------- */

import {
  getDeviceDetectionReport,
  isOfficialMobileLayout,
  isLikelyMobileBrowser,
  shouldUseMobileThemeLayout,
} from "./device.js";

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

function logTopbarDeviceDetection() {
  const report = getDeviceDetectionReport();

  if (report.topbarFloatEnabled) {
    console.log("[my_theme 顶栏] 已启用顶栏悬浮效果", report);
  } else {
    console.warn("[my_theme 顶栏] 已关闭顶栏悬浮效果", {
      原因: report.topbarFloatDisabledReasons,
      检测详情: report,
    });
  }
}

export const initTopbar = () => {
  initMobileBodyClass();
  // logTopbarDeviceDetection();

  if (isOfficialMobileLayout()) {
    addTopbarTreeButton();
  }
};
