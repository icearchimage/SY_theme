// ========================================
// 模块：列表折叠内容预览查看
// ========================================

const debounce = (fn, delay) => {
    let timer = null;
    return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

let listPreviewHandler = null;
let foldObserver = null;

const collapsedListPreviewEvent = () => {
    const foldedItems = [
        ...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [data-node-id].li[fold='1']"),
        ...document.querySelectorAll("[data-oid] [data-node-id].li[fold='1']"),
        ...document.querySelectorAll("#searchPreview [data-node-id].li[fold='1']")
    ];

    const previewTargets = foldedItems.reduce((arr, item) => {
        const el = item.children[1];
        if (el && ["p", "h1", "h2", "h3", "h4", "h5", "h6"].includes(el.className)) {
            const contentElement = el.children[0];
            if (contentElement) {
                arr.push(contentElement);
            }
        }
        return arr;
    }, []);

    cleanupListPreview();
    previewTargets.forEach(registerPreviewEvents);

    foldedItems.forEach(item => {
        const contentElement = item.children[1];
        if (contentElement) {
            const targetElement = contentElement.children[0];
            if (targetElement) {
                const foldedChildren = item.querySelectorAll(':scope > .list > .li');
                const childCount = foldedChildren.length;

                const parentElement = item.querySelector('[data-type="NodeParagraph"], [data-type="NodeHeading"]');
                if (parentElement) {
                    const contentEditableDiv = parentElement.querySelector('div[contenteditable]');
                    if (contentEditableDiv) {
                        contentEditableDiv.setAttribute('data-child-count', childCount);
                    }
                }
            }
        }
    });
};

const cleanupListPreview = () => {
    [
        ...document.querySelectorAll(".layout-tab-container>.fn__flex-1.protyle:not(.fn__none) [ListPreview]"),
        ...document.querySelectorAll("[data-oid] [ListPreview]"),
        ...document.querySelectorAll("#searchPreview [ListPreview]")
    ].forEach(element => {
        const parent = element.parentElement;
        if (!parent || parent.getAttribute("fold") == null || parent.getAttribute("fold") == "0") {
            element.removeAttribute("ListPreview");
            if (element.children[0]) {
                element.children[0].removeEventListener("mouseenter", handleMouseEnter);
            }
            if (parent?.parentElement) {
                parent.parentElement.removeEventListener("mouseleave", handleMouseLeave);
            }
            Array.from(parent?.parentElement?.children || []).forEach(child => {
                if (child.getAttribute?.("triggerBlock") != null) {
                    child.remove();
                }
            });
        }
    });
};

const registerPreviewEvents = (element) => {
    const parent = element.parentElement, grandParent = parent?.parentElement;
    if (!parent || !grandParent) return;

    if (parent.getAttribute("ListPreview") != null) {
        element.removeEventListener("mouseenter", handleMouseEnter);
        grandParent.removeEventListener("mouseleave", handleMouseLeave);
    }

    parent.setAttribute("ListPreview", true);
    element.addEventListener("mouseenter", handleMouseEnter);
    grandParent.addEventListener("mouseleave", handleMouseLeave);
};

const handleMouseEnter = (e) => {
    const obj = e.target, parent = obj.parentElement, grandParent = parent?.parentElement;
    if (!grandParent) return;
    if ([...grandParent.children].some(child => child.getAttribute?.("triggerBlock") != null)) return;

    const tempDiv = document.createElement("div");
    obj.appendChild(tempDiv);
    tempDiv.style.cssText = "display:inline-block;width:0px;height:16px;";
    const X = tempDiv.offsetLeft, Y = tempDiv.offsetTop;
    tempDiv.remove();

    createTriggerBlock(grandParent, obj, X + 2, Y + 2);
};

function handleMouseLeave(e) {
    e.target.querySelectorAll('[triggerBlock]').forEach(el => el.remove());
}

const createTriggerBlock = (container, refObj, left, top) => {
    const previewID = container.getAttribute("data-node-id");
    if (!previewID) return;

    const foldedChildren = container.querySelectorAll(':scope > .list > .li');
    const childCount = foldedChildren.length;

    const triggerBlock = document.createElement("div");
    if (!triggerBlock) return;

    triggerBlock.setAttribute("triggerBlock", "true");
    triggerBlock.className = "triggerBlock protyle-custom";
    triggerBlock.style.cssText = `position:absolute;width:20px;height:15px;display:flex;z-index:999;cursor:pointer;WebkitUserModify:read-only;background:transparent;top:${top}px;left:${left}px;`;
    triggerBlock.innerHTML = `<span data-type='a' class='list-A' data-href='siyuan://blocks/${previewID}' style='font-size:15px;line-height:15px;color:transparent;text-shadow:none;border:none;'>####</span>`;

    const targetElement = container.querySelector('[data-type="NodeParagraph"], [data-type="NodeHeading"]');
    if (targetElement) {
        const contentEditableDiv = targetElement.querySelector('div[contenteditable]');
        if (contentEditableDiv) {
            contentEditableDiv.setAttribute('data-child-count', childCount);
        }
        targetElement.appendChild(triggerBlock);
    } else {
        container.appendChild(triggerBlock);
    }
};

const disableListPreview = () => {
    if (listPreviewHandler) {
        document.body.removeEventListener("mouseover", listPreviewHandler);
        listPreviewHandler = null;
    }

    if (foldObserver) {
        foldObserver.disconnect();
        foldObserver = null;
    }

    cleanupListPreview();
    document.querySelectorAll('[triggerBlock]').forEach(el => el.remove());
};

export const initListPreview = () => {
    disableListPreview();

    listPreviewHandler = debounce(collapsedListPreviewEvent, 100);
    document.body.addEventListener("mouseover", listPreviewHandler);

    foldObserver = new MutationObserver(debounce(collapsedListPreviewEvent, 100));
    foldObserver.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['fold']
    });

    setTimeout(collapsedListPreviewEvent, 500);
};

window.disableListPreview = disableListPreview;
