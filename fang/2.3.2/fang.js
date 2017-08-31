/**
 * fang/2.3.0/fang.js
 * fang.js 2.3.1 | fang.org/LICENSE.md
 */

var fangjs, fang, define;
(function(global, undefined) {
    var req, fang, fangjs;
    // Avoid conflicting when `fang.js` is loaded multiple times

    if (typeof global.define !== 'undefined') {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    if (typeof global.fangjs !== 'undefined') {
        if (isFunction(fangjs)) {
            //Do not overwrite an existing fangjs instance.
            return;
        }
        cfg = global.fangjs;
        global.fangjs = undefined;
    }

    //Allow for a fang config object
    if (typeof global.fang !== 'undefined' && !isFunction(global.fang)) {
        //assume it is a config object.
        cfg = global.fang;
        global.fang = undefined;
    }

    req = fang = {
        // The current version of Sea.js being used
        version: "2.3.1"
    }

    var data = req.settings = {};

    /**
     * util-lang.js - The minimal language enhancement
     */
    var op = Object.prototype;
    var ostring = op.toString;
    var hasOwn = op.hasOwnProperty;

    function isType(type) {
        return function(obj) {
            return ostring.call(obj) === "[object " + type + "]"
        };
    }

    var isObject = isType("Object")
    var isString = isType("String")
    var isArray = Array.isArray || isType("Array")
    var isFunction = isType("Function")

    var _cid = 0

    function cid() {
        return _cid++
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }
    /**
     * Cycles over properties in an object and calls a function for each
     * property value. If the function returns a truthy value, then the
     * iteration is stopped.
     */
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }
    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     */
    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function(value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value === 'object' && value &&
                        !isArray(value) && !isFunction(value) &&
                        !(value instanceof RegExp)) {

                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    /**
     * util-events.js - The minimal events support
     */

    var events = data.events = {}

    // Bind event
    fang.on = function(name, callback) {
        var list = events[name] || (events[name] = [])
        list.push(callback)
        return fang
    }

    // Remove event. If `callback` is undefined, remove all callbacks for the
    // event. If `event` and `callback` are both undefined, remove all callbacks
    // for all events
    fang.off = function(name, callback) {
        // Remove *all* events
        if (!(name || callback)) {
            events = data.events = {}
            return fang
        }

        var list = events[name]
        if (list) {
            if (callback) {
                for (var i = list.length - 1; i >= 0; i--) {
                    if (list[i] === callback) {
                        list.splice(i, 1)
                    }
                }
            } else {
                delete events[name]
            }
        }

        return fang
    }

    // Emit event, firing all bound callbacks. Callbacks receive the same
    // arguments as `emit` does, apart from the event name
    var emit = fang.emit = function(name, data) {
        var list = events[name],
            fn

        if (list) {
            // Copy callback lists to prevent modification
            list = list.slice()

            // Execute event callbacks, use index because it's the faster.
            for (var i = 0, len = list.length; i < len; i++) {
                list[i](data)
            }
        }

        return fang
    }


    /**
     * util-path.js - The utilities for operating path such as id, uri
     */

    var DIRNAME_RE = /[^?#]*\//

    var DOT_RE = /\/\.\//g
    var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//
    var MULTI_SLASH_RE = /([^:/])\/+\//g

    // Extract the directory portion of a path
    // dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
    // ref: http://jsperf.com/regex-vs-split/2
    function dirname(path) {
        return path.match(DIRNAME_RE)[0]
    }

    // Canonicalize a path
    // realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
    function realpath(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/")

        /*
         @author wh1100717
         a//b/c ==> a/b/c
         a///b/////c ==> a/b/c
         DOUBLE_DOT_RE matches a/b/c//../d path correctly only if replace // with / first
         */
        path = path.replace(MULTI_SLASH_RE, "$1/")

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/")
        }

        return path
    }

    // Normalize an id
    // normalize("path/to/a") ==> "path/to/a.js"
    // NOTICE: substring is faster than negative slice and RegExp
    function normalize(path) {
        var last = path.length - 1
        var lastC = path.charAt(last)

        // If the uri ends with `#`, just return it without '#'
        if (lastC === "#") {
            return path.substring(0, last)
        }

        return (path.substring(last - 2) === ".js" ||
            path.indexOf("?") > 0 || path.substring(last - 3) === ".css" ||
            lastC === "/") ? path : path + ".js"
    }


    var PATHS_RE = /^([^/:]+)(\/.+)$/
    var VARS_RE = /{([^{]+)}/g

    function parseAlias(id) {
        var alias = data.alias
        return alias && isString(alias[id]) ? alias[id] : id
    }

    function parsePaths(id) {
        var paths = data.paths
        var m

        if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
            id = paths[m[1]] + m[2]
        }

        return id
    }

    function parseVars(id) {
        var vars = data.vars

        if (vars && id.indexOf("{") > -1) {
            id = id.replace(VARS_RE, function(m, key) {
                return isString(vars[key]) ? vars[key] : m
            })
        }

        return id
    }

    /**
     * [parseMap 处理版本问题]
     * @param  {[type]} uri [网址]
     * @return {[type]}     [映射之后的地址，主要是加版本号]
     */
    function parseMap(uri) {
        var ver = data.ver;
        var map = function(uri) {
            if (uri.indexOf('?') === -1 && uri.indexOf('jquery.js') === -1) {
                uri += '?_' + ver;
            }
            return uri;
        };
        return ver ? map(uri) : uri;

        // var ret = uri

        // if (map) {
        //     for (var i = 0, len = map.length; i < len; i++) {
        //         var rule = map[i]

        //         ret = isFunction(rule) ?
        //             (rule(uri) || uri) :
        //             uri.replace(rule[0], rule[1])

        //         // Only apply the first matched rule
        //         if (ret !== uri) break
        //     }
        // }

        // return ret
    }


    var ABSOLUTE_RE = /^\/\/.|:\//;
    var ROOT_DIR_RE = /^.*?\/\/.*?\//;

    /**
     * 添加基础路径,处理id ,相对地址,将其生成对应文件地址
     * @param id
     * @param refUri
     * @returns {*}
     * @update 20161026 yueyanlei 相对路径都基于base地址,优化了Add default protocol的判断
     */
    function addBase(id, refUri) {
        var ret
        var first = id.charAt(0)

        // Absolute
        if (ABSOLUTE_RE.test(id)) {
            ret = id
        }
        // Relative
        else if (first === ".") {
            ret = realpath(data.base + id); //realpath((refUri ? dirname(refUri) : data.cwd) + id)
        }
        // Root
        else if (first === "/") {
            var m = data.cwd.match(ROOT_DIR_RE)
            ret = m ? m[0] + id.substring(1) : id
        }
        // Top-level
        else {
            ret = data.base + id
        }

        // Add default protocol when uri begins with "//"
        if (ret.charAt(0) === "/" && ret.charAt(1) === "/") {
            ret = location.protocol + ret
        }

        return ret;
    }

    function id2Uri(id, refUri) {
        if (!id) return ""
        if (id === 'jquery') return id;
        id = parseAlias(id)
        id = parsePaths(id)
        id = parseVars(id)
        id = normalize(id)

        var uri = addBase(id, refUri)
        uri = parseMap(uri)

        return uri
    }


    var doc = document
    var cwd = (!location.href || location.href.indexOf('about:') === 0) ? '' : dirname(location.href)
    var scripts = doc.scripts

    // Recommend to add `fangnode` id for the `fang.js` script element
    var loaderScript = doc.getElementById("fangnode") ||
        scripts[scripts.length - 1]

    // When `fang.js` is inline, set loaderDir to current working directory
    var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd)

    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4)
    }


    // For Developers
    fang.resolve = id2Uri


    /**
     * util-request.js - The utilities for requesting script and style files
     * ref: tests/research/load-js-css/test.html
     */

    var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement
    var baseElement = head.getElementsByTagName("base")[0]

    var currentlyAddingScript
    var interactiveScript

    function request(url, callback, charset) {
        var node = doc.createElement("script")

        if (charset) {
            var cs = isFunction(charset) ? charset(url) : charset
            if (cs) {
                node.charset = cs
            }
        }

        addOnload(node, callback, url)

        node.async = true
        node.src = url

        // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
        // the end of the insert execution, so use `currentlyAddingScript` to
        // hold current node, for deriving url in `define` call
        currentlyAddingScript = node

        // ref: #185 & http://dev.jquery.com/ticket/2709
        baseElement ?
            head.insertBefore(node, baseElement) :
            head.appendChild(node)

        currentlyAddingScript = null
    }

    function addOnload(node, callback, url) {
        var supportOnload = "onload" in node

        if (supportOnload) {
            node.onload = onload
            node.onerror = function() {
                emit("error", {
                    uri: url,
                    node: node
                })
                onload()
            }
        } else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    onload()
                }
            }
        }

        function onload() {
            // Ensure only run once and handle memory leak in IE
            node.onload = node.onerror = node.onreadystatechange = null

            // Remove the script to reduce memory leak
            if (!data.debug) {
                head.removeChild(node)
            }

            // Dereference the node
            node = null

            callback()
        }
    }

    function getCurrentScript() {
        if (currentlyAddingScript) {
            return currentlyAddingScript
        }

        // For IE6-9 browsers, the script onload event may not fire right
        // after the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script
        // ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === "interactive") {
            return interactiveScript
        }

        var scripts = head.getElementsByTagName("script")

        for (var i = scripts.length - 1; i >= 0; i--) {
            var script = scripts[i]
            if (script.readyState === "interactive") {
                interactiveScript = script
                return interactiveScript
            }
        }
    }


    // For Developers
    fang.request = request


    /**
     * util-deps.js - The parser for dependencies
     * ref: tests/research/parse-dependencies/test.html
     */

    var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
    var SLASH_RE = /\\\\/g

    function parseDependencies(code) {
        var ret = []

        code.replace(SLASH_RE, "")
            .replace(REQUIRE_RE, function(m, m1, m2) {
                if (m2) {
                    ret.push(m2)
                }
            })

        return ret
    }


    /**
     * module.js - The core of module loader
     */

    var cachedMods = fang.cache = {}
    var anonymousMeta

    var fetchingList = {}
    var fetchedList = {}
    var callbackList = {}

    var STATUS = Module.STATUS = {
        // 1 - The `module.uri` is being fetched
        FETCHING: 1,
        // 2 - The meta data has been saved to cachedMods
        SAVED: 2,
        // 3 - The `module.dependencies` are being loaded
        LOADING: 3,
        // 4 - The module are ready to execute
        LOADED: 4,
        // 5 - The module is being executed
        EXECUTING: 5,
        // 6 - The `module.exports` is available
        EXECUTED: 6
    }


    function Module(uri, deps) {
        this.uri = uri
        this.dependencies = deps || []
        this.exports = null
        this.status = 0

        // Who depends on me
        this._waitings = {}

        // The number of unloaded dependencies
        this._remain = 0
    }

    // Resolve module.dependencies
    Module.prototype.resolve = function() {
        var mod = this
        var ids = mod.dependencies
        var uris = []

        for (var i = 0, len = ids.length; i < len; i++) {
            uris[i] = Module.resolve(ids[i], mod.uri)
        }
        return uris
    }

    // Load module.dependencies and fire onload when all done
    Module.prototype.load = function() {
        var mod = this

        // If the module is being loaded, just wait it onload call
        if (mod.status >= STATUS.LOADING) {
            return
        }

        mod.status = STATUS.LOADING

        // Emit `load` event for plugins such as combo plugin
        var uris = mod.resolve()
        emit("load", uris)

        var len = mod._remain = uris.length
        var m

        // Initialize modules and register waitings
        for (var i = 0; i < len; i++) {
            m = Module.get(uris[i])

            if (m.status < STATUS.LOADED) {
                // Maybe duplicate: When module has dupliate dependency, it should be it's count, not 1
                m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1
            } else {
                mod._remain--
            }
        }

        if (mod._remain === 0) {
            mod.onload()
            return
        }

        // Begin parallel loading
        var requestCache = {}

        for (i = 0; i < len; i++) {
            m = cachedMods[uris[i]]

            if (m.status < STATUS.FETCHING) {
                m.fetch(requestCache)
            } else if (m.status === STATUS.SAVED) {
                m.load()
            }
        }

        // Send all requests at last to avoid cache bug in IE6-9. Issues#808
        for (var requestUri in requestCache) {
            if (requestCache.hasOwnProperty(requestUri)) {
                requestCache[requestUri]()
            }
        }
    }

    // Call this method when module is loaded
    Module.prototype.onload = function() {
        var mod = this
        mod.status = STATUS.LOADED

        if (mod.callback) {
            mod.callback()
        }

        // Notify waiting modules to fire onload
        var waitings = mod._waitings
        var uri, m

        for (uri in waitings) {
            if (waitings.hasOwnProperty(uri)) {
                m = cachedMods[uri]
                m._remain -= waitings[uri]
                if (m._remain === 0) {
                    m.onload()
                }
            }
        }

        // Reduce memory taken
        delete mod._waitings
        delete mod._remain
    }

    // Fetch a module
    Module.prototype.fetch = function(requestCache) {
        var mod = this
        var uri = mod.uri

        mod.status = STATUS.FETCHING

        // Emit `fetch` event for plugins such as combo plugin
        var emitData = {
            uri: uri
        }
        emit("fetch", emitData)
        var requestUri = emitData.requestUri || uri

        // Empty uri or a non-CMD module
        if (!requestUri || fetchedList[requestUri]) {
            mod.load()
            return
        }

        if (fetchingList[requestUri]) {
            callbackList[requestUri].push(mod)
            return
        }

        fetchingList[requestUri] = true
        callbackList[requestUri] = [mod]

        // Emit `request` event for plugins such as text plugin
        emit("request", emitData = {
            uri: uri,
            requestUri: requestUri,
            onRequest: onRequest,
            charset: data.charset
        })

        if (!emitData.requested) {
            requestCache ?
                requestCache[emitData.requestUri] = sendRequest :
                sendRequest()
        }

        function sendRequest() {
            fang.request(emitData.requestUri, emitData.onRequest, emitData.charset)
        }

        function onRequest() {
            delete fetchingList[requestUri]
            fetchedList[requestUri] = true

            // Save meta data of anonymous module
            if (anonymousMeta) {
                Module.save(uri, anonymousMeta)
                anonymousMeta = null
            }

            // Call callbacks
            var m, mods = callbackList[requestUri]
            delete callbackList[requestUri]
            while ((m = mods.shift())) m.load()
        }
    }

    // Execute a module
    Module.prototype.exec = function() {
        var mod = this

        // When module is executed, DO NOT execute it again. When module
        // is being executed, just return `module.exports` too, for avoiding
        // circularly calling
        if (mod.status >= STATUS.EXECUTING) {
            return mod.exports
        }

        mod.status = STATUS.EXECUTING

        // Create require
        var uri = mod.uri

        function require(ids) {
            var exports = [];
            var idlist = isArray(ids) ? ids : [ids];
            if (isArray(ids)) {
                for (var i = 0, len = ids.length; i < len; i++) {
                    exports[i] = Module.get(require.resolve(ids[i])).exec();
                }
            } else {
                exports = Module.get(require.resolve(ids)).exec();
            }
            return exports;
        }

        require.resolve = function(id) {
            return Module.resolve(id, uri)
        }

        require.async = function(ids, callback) {
            Module.use(ids, callback, uri + "_async_" + cid())
            return require
        }

        require.exec = function(id) {
            return Module.get(require.resolve(id)).exec();
        }
        
        // Exec factory
        var factory = mod.factory

        var exports = isFunction(factory) ?
            factory(require, mod.exports = {}, mod) :
            factory

        if (exports === undefined) {
            exports = mod.exports
        }

        // Reduce memory leak
        delete mod.factory

        mod.exports = exports
        mod.status = STATUS.EXECUTED

        // Emit `exec` event
        emit("exec", mod)

        return exports
    }

    // Resolve id to uri
    Module.resolve = function(id, refUri) {
        // Emit `resolve` event for plugins such as text plugin
        var emitData = {
            id: id,
            refUri: refUri
        }
        emit("resolve", emitData)

        return emitData.uri || fang.resolve(emitData.id, refUri)
    }

    // Define a module
    Module.define = function(id, deps, factory) {
        var argsLen = arguments.length

        // define(factory)
        if (argsLen === 1) {
            factory = id
            id = undefined
        } else if (argsLen === 2) {
            factory = deps

            // define(deps, factory)
            if (isArray(id)) {
                deps = id
                id = undefined
            }
            // define(id, factory)
            else {
                deps = undefined
            }
        }

        // Parse dependencies according to the module factory code
        // if (!isArray(deps) && isFunction(factory)) {
        //    deps = parseDependencies(factory.toString())
        // }

        var meta = {
            id: id,
            uri: Module.resolve(id),
            deps: deps,
            factory: factory
        }

        // Try to derive uri in IE6-9 for anonymous modules
        if (!meta.uri && doc.attachEvent) {
            var script = getCurrentScript()

            if (script) {
                meta.uri = script.src
            }

            // NOTE: If the id-deriving methods above is failed, then falls back
            // to use onload event to get the uri
        }

        // Emit `define` event, used in nocache plugin, fang node version etc
        emit("define", meta)

        meta.uri ? Module.save(meta.uri, meta) :
            // Save information for "saving" work in the script onload event
            anonymousMeta = meta
    }

    // Save meta data to cachedMods
    Module.save = function(uri, meta) {
        var mod = Module.get(uri)

        // Do NOT override already saved modules
        if (mod.status < STATUS.SAVED) {
            mod.id = meta.id || uri
            mod.dependencies = meta.deps || []
            mod.factory = meta.factory
            mod.status = STATUS.SAVED

            emit("save", mod)
        }
    }

    // Get an existed module or create a new one
    Module.get = function(uri, deps) {
        return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
    }

    // Use function is equal to load a anonymous module
    Module.use = function(ids, callback, uri) {
        var mod = Module.get(uri, isArray(ids) ? ids : [ids])

        mod.callback = function() {
            var exports = []
            var uris = mod.resolve()

            for (var i = 0, len = uris.length; i < len; i++) {
                exports[i] = cachedMods[uris[i]].exec()
            }

            if (callback) {
                callback.apply(global, exports)
            }

            delete mod.callback
        }

        mod.load()
    }


    // Public API

    fang.use = function(ids, callback) {
        Module.use(ids, callback, data.cwd + "_use_" + cid())
        return fang
    }

    Module.define.cmd = Module.define.amd = {
        jQuery: true
    }
    global.define = Module.define

    // For Developers

    fang.Module = Module
    data.fetchedList = fetchedList
    data.cid = cid

    fang.require = function(id) {
        var mod = Module.get(Module.resolve(id))
        if (mod.status < STATUS.EXECUTING) {
            mod.onload()
            mod.exec()
        }
        return mod.exports
    }


    /**
     * config.js - The configuration for the loader
     */

    // The root path to use for id2uri parsing
    data.base = loaderDir

    // The loader directory
    data.dir = loaderDir

    // The current working directory
    data.cwd = cwd

    // The charset for requesting files
    data.charset = "utf-8"

    // data.alias - An object containing shorthands of module id
    // data.paths - An object containing path shorthands in module id
    // data.vars - The {xxx} variables in module id
    // data.debug - Debug mode. The default value is false

    fang.config = function(configData) {
        eachProp(configData, function(value, key) {
            var curr = configData[key]
            var prev = data[key]

            // Merge object config such as alias, vars
            if (prev && isObject(prev)) {
                for (var k in curr) {
                    prev[k] = curr[k]
                }
            } else {
                // Concat array config such as map
                // if (isArray(prev) && key !== 'map') {
                //     curr = prev.concat(curr)
                // }
                // // Make sure that `data.base` is an absolute path
                // else
                if (key === "base") {
                    // Make sure end with "/"
                    if (curr.slice(-1) !== "/") {
                        curr += "/"
                    }
                    curr = addBase(curr);
                    // 域名匹配
                    var pattern = /\/\/([^.]+)\.([^.]+\.)*soufunimg\.com/;
                    var match = pattern.exec(curr);
                    // 只有测试站或正式站, 才进行合并加载，否则不合并。
                    if (!match || /debug/.test(global.location.href)) {
                        data.comboExcludes = function() {
                            return true;
                        };
                    }else {
                        data.comboExcludes = null;
                    }
                } else if (key === "ver") {
                    // 地址栏 debug@ 控制版本号
                    var href = global.location.href;
                    if (/debug/.test(href)) {
                        var ver = href.split('debug@')[1];
                        curr = ver || curr || '';
                    }
                }

                // Set config
                data[key] = curr
            }
        });
        if (hasProp(data, 'vars')) {
            global.fang.data = data.vars;
        }
        emit("config", configData)
        return fang
    };
    global.fangjs = global.fang = req.use;
    mixin(global.fang, req);
})(typeof window !== "undefined" ? window : this);