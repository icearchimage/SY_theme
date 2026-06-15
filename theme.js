// JS功能模块化入口文件

(() => {
    const startMyThemeInit = () => {
        import('./js/main.js').then(module => {
            module.initAll();
        }).catch(error => {
            // 模块加载失败: error
            console.error('模块加载失败:', error);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startMyThemeInit, { once: true });
    } else {
        startMyThemeInit();
    }
})();
