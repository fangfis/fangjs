/**
 * 非懒加载图片错误使用备用地址处理
 */
;(function (win, doc) {
    var addEvent = function (obj, sEv, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(sEv, fn, false);
        } else {
            obj.attachEvent('on' + sEv, fn);
        }
    };
    addEvent(doc, 'DOMContentLoaded', function () {
        var imgs = doc.getElementsByTagName('img');
        for (var i = 0, len = imgs.length; i < len; i++) {
            (function (i) {
                var theImg = imgs[i];
                theImg.src = theImg.getAttribute('src');
                theImg.onerror = function (e) {
                    var src = this.getAttribute('data-src2');
                    if (src) {
                        this.src = src;
                        this.onerror = null;
                    }
                };
            })(i);
        }
    });
})(window, document);