/*
 创建Gulp配置文件
 */
// 引入 gulp
const gulp = require('gulp');

// 引入功能组件
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const del = require('del');
// 错误处理
const plumber = require('gulp-plumber');

// 开发辅助
// 美化日志
const chalk = require('chalk');

// 参数
const yargs = require('yargs').argv;
// gulp的ftp插件
const ftp = require('vinyl-ftp');
const pipe = require('gulp-pipe');
const path = require('path');

// 正式
let ftpConfig = {};

// 判断传入的参数
let version = '2.3.2';
if (yargs.o && typeof yargs.o !== 'boolean') {
    version = yargs.o;
}
// 测试站
let t = false,
    z = false;
let basePath = '';
if (yargs.t && typeof yargs.t === 'boolean') {
    t = true;
    basePath = 'common_m/pc_public/fangjs/build/';
    ftpConfig = {
        host: '218.30.110.109',
        user: 'js_test',
        pass: 'fie93k32'
    };
} else if (yargs.z && typeof yargs.z === 'boolean') {
    z = true;
    basePath = 'pc_public/fangjs/build/';
    ftpConfig = {
        host: '218.30.110.109',
        user: 'common_m_tankunpeng',
        pass: 'e3Df5332'
    };
}
// console.log(ftpConfig);
var conn = ftp.create(ftpConfig);
// const conn = ftp.create(ftpConfig);

// 设置相关路径
let paths = {
    build: 'build',
    js: ['./**/*.js', '!./gulpfile.js', '!node_modules/**/*', '!fang/**/*', '!build/**/*'],
    fangjs: [`fang/${version}/fang.js`, `fang/${version}/combo.js`, `fang/${version}/config.js`, `fang/${version}/polyfill.js`]
};

// 兼容2.3.1集成jquery 2.3.2以后不再集成jquery
if (version === '2.3.1') {
    paths.fangjs.splice(3, 0, 'jquery/jquery-3.js');
}

/**
 * 获取读取文件列表文件
 * @param {any} pt
 * @param {any} err
 * @param {any} files
 */
function getFiles(pt,arr) {
    var floag = false;
    var regArr = ['node_modules\/', 'gulpfile\.js','build\/'];
    arr && (regArr = regArr.concat(arr));
    var ig = new RegExp(regArr.join('|'));
    return function (err, files) {
        var len = files.length;
        if (err) return console.log(err);
        if (len) {
            if (!floag) {
                console.log(chalk.cyan('读取文件列表:'));
                floag = true;
            }
            // console.log(files);
            for (var i = 0, fileLen = files.length; i < fileLen; i++) {
                var file = files[i];
                if (!ig.test(file)) {
                    console.log(chalk.cyan(file));
                }
            }

            return files;
        }
        console.log(chalk.yellow('未找到任何文件,请检查目录或文件名是否正确\n路径:' + pt));
        process.exit();
    };
}

// 清空build
gulp.task('clean', function () {
    return del(path.join(paths.build, './**/*')).then(function (paths) {
        if (paths.length) {
            console.log(chalk.yellow('删除文件和文件夹:\n'), chalk.yellow(paths.join('\n')));
        }
    });
});

// rjs处理
gulp.task('rjs', function () {
    console.log(chalk.yellow('[进行中] fangjs合并上传ftp'));
    var src = paths.fangjs;
    var arr = [gulp.src(src, getFiles(src)), plumber(), concat(`fang${version}.js`), uglify({
        mangle: true,
        output: {
            ascii_only: true
        }
    }), gulp.dest(`${paths.build}/`)];
    if (t) {
        arr.splice(3, 1, conn.newer(basePath), conn.dest(basePath));
    } else if (z) {
        arr.splice(4, 0, conn.newer(basePath), conn.dest(basePath));
    }
    return pipe(arr).on('end', function () {
        console.log(chalk.green('[已完成] fangjs合并上传ftp'));
    });
});
// js处理
gulp.task('js', function () {
    console.log(chalk.yellow('[进行中] 其他js处理上传ftp'));
    var src = paths.js;
    var arr = [gulp.src(src, getFiles(src,['fang\/'])), plumber(), uglify({
        mangle: true,
        output: {
            ascii_only: true
        }
    }), gulp.dest(`${paths.build}/`)];
    if (t) {
        arr.splice(2, 1, conn.newer(basePath), conn.dest(basePath));
    } else if (z) {
        arr.splice(3, 0, conn.newer(basePath), conn.dest(basePath));
    }
    return pipe(arr).on('end', function () {
        console.log(chalk.green('[已完成] 其他js处理上传ftp'));
    });
});

gulp.task('default', ['clean'], function () {
    gulp.start('rjs', 'js');
});