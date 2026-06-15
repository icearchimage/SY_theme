/* -------自动展开悬浮窗折叠列表,展开搜索条目折叠列表,聚焦单独列表 from Savor ---------- */

const PREVIEW_CONTAINER_SELECTORS = ".block__popover, #searchPreview";
const FOLD_TAG = "foldTag";

function tryUnfoldListItem(item) {
  if (!item || item.getAttribute("fold") !== "1") return;
  if (item.hasAttribute(FOLD_TAG)) return;
  if (!item.querySelector(":scope > .list")) return;

  item.setAttribute("fold", "0");
  item.setAttribute(FOLD_TAG, "true");
}

function unfoldListsInContainer(container) {
  if (!container) return;
  container.querySelectorAll(".protyle-wysiwyg").forEach((wysiwyg) => {
    wysiwyg.querySelectorAll(":scope > [data-node-id].li[fold='1']").forEach(tryUnfoldListItem);
  });
}

function unfoldPreviewFoldedLists() {
  document.querySelectorAll(PREVIEW_CONTAINER_SELECTORS).forEach(unfoldListsInContainer);

  document.querySelectorAll(
    ".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [data-doc-type='NodeListItem'].protyle-wysiwyg.protyle-wysiwyg--attr>div:nth-child(1)"
  ).forEach((element) => {
    if (
      element?.getAttribute("data-type") === "NodeListItem" &&
      element.getAttribute("fold") === "1"
    ) {
      tryUnfoldListItem(element);
    }
  });
}

/**自动展开预览窗口、搜索预览中的折叠列表 */
/**主要用CSS实现，这里为了兼容弹窗内容异步加载等边缘情况*/
function autoOpenList() {
  const run = () => unfoldPreviewFoldedLists();

  run();

  const observer = new MutationObserver(() => run());
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["fold", "class"],
  });

  setInterval(run, 500);
}

export const initSavorList = () => {
  autoOpenList();
  console.log("加载Savor的列表相关辅助JS成功");
};
