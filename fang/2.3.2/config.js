/**
 * fangjs/2.3.0/config.js
 * fangjs相关配置。
 * @author yueyanlei
 */
;
(function (global) {
    'use strict';
    var vars = global.pageConfig || (global.pageConfig = {});
    // 设置当前协议
    vars.protocol = global.location.protocol;
    var href = global.location.href;


    // 设置fangjs根目录地址
    // 设置根目录地址
    if (!vars.base) {
      
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
        vars.base = publicUrl + (publicUrl.substr(publicUrl.length - 1) === '/' ? '' : '/');
    }


    // 设置fangjs配置对象
    var config = {
        base: vars.base,
        // 别名，利于较长的模块名的简化
        alias: {
            jquery: 'jquery',
            util: 'plugins/util'
        },
        // 与别名类似，就是给地址中的js换一个别名，利于之后的模块引用
        paths: {
            jsub: '//' + (vars.protocol === 'http:' ? 'js.ub' : 'jsub') + '.fang.com',
            webim: '//js.soufunimg.com/upload/webim/im2'
        },
        ver: '',
        vars: vars
    };

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