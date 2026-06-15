/* ----------------------------- 顶栏悬浮 from Savor ---------------------------- */

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

export const initTopbar = () => {
  const isMobile = !!window.siyuan.mobile; //在平板上好像有问题
  if (isMobile) addTopbarTreeButton();
};
