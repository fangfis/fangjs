/**
 * fangjs/2.3.0/config.js
 * fangjs相关配置。
 * @author yueyanlei
 */
;
(function (global) {
    'use strict';
    var vars = global.pageConfig || (global.pageConfig = {});
    vars.mainSite = vars.mainSite || global.location.origin;
    // 设置当前协议
    vars.protocol = global.location.protocol;
    var href = global.location.href;
    // 域名匹配
    var pattern = /\/\/([^.]+)\.([^.]+\.)*soufunimg\.com/;
    var match = pattern.exec(vars.public);
    // 设置fangjs根目录地址
    // 设置根目录地址
    var hrefArr = href.split('/');
    var hrefArrLen = hrefArr.length;
    var publicUrl = '';
    if (hrefArrLen >= 3) {
        var last = hrefArr[hrefArrLen - 1];
        if (/.+\.\w+/.test(last) || !last) {
            hrefArr.pop();
        }
        publicUrl = hrefArr.join('/');
    }
    vars.public = vars.public || publicUrl;
    var path = 'static/js/';
    vars.base = vars.public + (vars.public.substr(vars.public.length - 1) === '/' ? path : '/' + path);
    // if (/test/.test(vars.public) && /debug_dev/.test(href)) {
    //     vars.base = vars.public + '/dev/js/';
    // }
    var jsdomain = '//' + (match ? match[1] : 'js') + '.soufunimg.com/';

    // 地址栏 debug@ 控制版本号
    if (/debug/.test(href)) {
        var ver = href.split('debug@')[1];
        vars.img_ver = ver || vars.img_ver;
    }

    // 设置fangjs配置对象
    var config = {
        base: vars.base,
        // 别名，利于较长的模块名的简化
        alias: {
            jquery: 'jquery',
            util: 'plugins/util'
        },
        // 映射关系，作用为将获取的js文件增加版本号，下面的正则作用为不对jquery.js做版本号处理，！一般情况下库都是稳定的
        // uri.substr(uri.lastIndexOf('/') + 1) === 'jquery.js' ? uri :
        // loadonlyga.min.js loadforwapandm.min.js
        map: [function (uri) {
            if (uri.indexOf('?') === -1) {
                uri += '?_' + vars.img_ver;
            }
            return uri;
        }],
        // 与别名类似，就是给地址中的js换一个别名，利于之后的模块引用
        paths: {
            count: jsdomain + '.count',
            jsub: '//' + (vars.protocol === 'http:' ? 'js.ub' : 'jsub') + '.fang.com',
            webim: 'http://js.soufunimg.com/upload/webim/im2'
        },
        // 合并后缀
        comboSuffix: '?_' + vars.img_ver,
        vars: vars
    };
    // 只有测试站或正式站, 才进行合并加载，否则不合并。
    if (!match || /debug/.test(global.location.href)) {
        config.comboExcludes = function () {
            return true;
        };
    }

    var fangjs = global.fangjs;
    fangjs.config(config);
    // js错误信息捕捉
    /*global.onerror = function () {
        if (arguments[0] === 'Script error.')return;
        // 将所有的错误数据用|分割为一个字符串
        var err = Array.prototype.join.call(arguments, '|');
        var $ = global.jQuery;
        var get = $ && $.get;
        // 传入后台
        get && get('/xf.d?m=collectjserrordata', {errordata: err});
    };*/
})(typeof window !== "undefined" ? window : this);