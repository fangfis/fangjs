/**
 * seajs/2.3.0/load.js seajs相关配置。
 * @author yueyanlei
 */
;(function (win) {
    'use strict';
    var vars = win._vars || (win._vars = {});
    var seajs = win.seajs;
    // seajs配置修复 tools中用
    if (typeof win._mconfig === 'function') {
        win._mconfig.apply(seajs.data);
    }
	// 加载js 入口主文件
    seajs.use([vars.entrance], function () {
        // 加载百度自动推送代码
        var baidupush = 'http://push.zhanzhang.baidu.com/push.js';
        if (vars.protocol === 'https:') {
            baidupush = 'https://zz.bdstatic.com/linksubmit/push.js';
        }
        seajs.use(baidupush);

    });
})(window);
