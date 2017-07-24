/**
 * 小于ie9 兼容提示处理
 */
(function (global, doc) {

    /**
     * 绑定事件
     * @param {any} obj 对象
     * @param {any} sEv 事件名称
     * @param {any} fn 回调函数
     */
    function addEvent(obj, sEv, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(sEv, fn, false);
        } else {
            obj.attachEvent('on' + sEv, fn);
        }
    }
    var agent = global.navigator.userAgent.toLowerCase();
    var isIE = /msie/.test(agent);
    var ieArr = agent.match(/msie ([\d.]+)/);
    var ieVer = ieArr && ieArr.length > 1 ? parseInt(ieArr[1]) : doc.documentMode;
    if (isIE && ieVer < 9) {
        global.ltIE8 = true;
        addEvent(global, 'load', function () {
            var alertConStr = '<div style="position: absolute;top: 50%;left: 50%;width: 398px;height: 440px;margin: -239px 0 0 -230px;padding: 10px 40px;text-align: center;background-color: #fff;border-radius: 2px;">\
                                    <div style="position: relative;padding: 15px 0 20px;border-bottom: 1px solid #F3F3F3;">\
                                        <span style="font-size: 20px;color: #000;">请升级您的浏览器</span>\
                                    </div>\
                                    <div class="con">\
                                        <div style="margin: 30px 0 20px 0;"><img src="//static.soufunimg.com/common_m/pc_public/images/bg_esfie8.png" alt="ie8头部图片"></div>\
                                        <p style="font-size: 14px;color: #999;line-height: 24px;">尊敬的用户，您现在使用的Internet Explore 浏览器版本过低，建议您升级您的浏览器或使用其他浏览器（如：Google Chrome 或 Mozilla Firefox）,以便您能继续访问房天下网站。</p>\
                                        <dl style="width: 294px;height: 132px;margin: 0 auto;margin-top: 25px">\
                                            <dd style="float: left;">\
                                                <div style="width: 113px;height: 38px;border: 1px solid #CCCCCC;border-radius: 2px;margin-bottom: 15px;padding: 5px 0 0 25px;cursor: pointer;text-align:left;">\
                                                    <a href="http://sw.bos.baidu.com/sw-search-sp/software/611fd6cbd2fb1/ChromeStandalone_59.0.3071.86_Setup.exe"><img src="//static.soufunimg.com/common_m/pc_public/images/chrome_bgesf.jpg" alt="chrome浏览器"></a>\
                                                </div>\
                                                <div style="width: 113px;height: 38px;border: 1px solid #CCCCCC;border-radius: 2px;margin-bottom: 15px;padding: 5px 0 0 25px;cursor: pointer;text-align:left;">\
                                                    <a href="http://sw.bos.baidu.com/sw-search-sp/software/a46efe5ad2b1f/Firefox_53.0.3.6347_setup.exe"><img src="//static.soufunimg.com/common_m/pc_public/images/fiefox_bgesf.jpg" alt="fiefox浏览器"></a>\
                                                </div>\
                                            </dd>\
                                            <dt style="float: right;text-align: center;">\
                                                <div style="width: 89px;height: 86px;border: 1px solid #CCCCCC;border-radius: 2px;text-align: center;padding: 8px;"><img src="//static.soufunimg.com/common_m/pc_public/images/ewm_bgesf.png" alt="房天下app"></div>\
                                                <p style="margin-top: 10px;">请下载APP继续浏览</p>\
                                            </dt>\
                                        </dl>\
                                    </div>\
                                </div>';

            // 外层盒子
            var alertBox = doc.createElement('div');
            alertBox.style.cssText += ';position: fixed;z-index: 10001;top: 0;left: 0;width: 100%;height: 100%;background: url(//static.soufunimg.com/common_m/pc_public/images/bh1.png);';

            alertBox.innerHTML = alertConStr;
            doc.body.appendChild(alertBox);
        });
    }
})(typeof window !== 'undefined' ? window : this, document);