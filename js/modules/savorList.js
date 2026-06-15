/* -------自动展开悬浮窗折叠列表,展开搜索条目折叠列表,聚焦单独列表 from Savor ---------- */

/**自动展开悬浮窗折叠列表 */
function autoOpenList() {
  setInterval(() => {
    //找到所有的悬浮窗
    var Preview = document.querySelectorAll("[data-oid]");

    //如果发现悬浮窗内首行是折叠列表就展开并打上标记
    if (Preview.length != 0) {
      for (let index = 0; index < Preview.length; index++) {
        const element = Preview[index];
        var item = element.children[1].children; // block__content

        for (let index = 0; index < item.length; index++) {
          var obj = item[index].children[1]; // protyle-content
          if (obj == null) continue;
          const element = obj.children[1].children[0]; // NodeListItem
          if (element == null) continue;
          if (element.className != "li") continue; //判断是否是列表
          if (element.getAttribute("foldTag") != null) continue; //判断是否存在标记
          if (element.getAttribute("fold") == 0) continue; //判断是折叠

          element.setAttribute("fold", 0);
          element.setAttribute("foldTag", true);
        }
      }
    }

    var searchPreview = document.querySelector(
      "#searchPreview [data-doc-type='NodeListItem'].protyle-wysiwyg.protyle-wysiwyg--attr>div:nth-child(1)"
    );
    if (
      searchPreview != null &&
      searchPreview.getAttribute("data-type") == "NodeListItem" &&
      searchPreview.getAttribute("fold") == 1
    ) {
      if (searchPreview.getAttribute("foldTag") != null) return; //判断是否存在标记
      searchPreview.setAttribute("fold", 0);
      searchPreview.setAttribute("foldTag", true);
    }

    var contentLIst = document.querySelectorAll(
      ".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [data-doc-type='NodeListItem'].protyle-wysiwyg.protyle-wysiwyg--attr>div:nth-child(1)"
    );
    for (let index = 0; index < contentLIst.length; index++) {
      const element = contentLIst[index];
      if (
        element != null &&
        element.getAttribute("data-type") == "NodeListItem" &&
        element.getAttribute("fold") == 1
      ) {
        if (element.getAttribute("foldTag") != null) return; //判断是否存在标记
        element.setAttribute("fold", 0);
        element.setAttribute("foldTag", true);
      }
    }
  }, 500);
}

export const initSavorList = () => {
  autoOpenList();
  console.log("加载Savor的列表相关辅助JS成功");
};
