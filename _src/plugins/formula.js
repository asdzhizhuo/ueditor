///import core
///import commands/inserthtml.js
///commands 插入公式
///commandsName  insertFormula
///commandsTitle  插入公式
///commandsDialog  dialogs\formula\formula.html

UE.plugins['insertformula'] = function () {
    var me = this;
    me.commands['insertformula'] = {
        execCommand:function (cmdName, html, css) {
            if (html.length > 0) {
                me.execCommand('inserthtml', html);
            }
            if (css.length > 0) {
                utils.cssRule('formula', css, me.document);
            }
        },
        queryCommandState:function () {
            return queryState.call(this);
        }
    };
    function queryState() {
        try {
            var range = this.selection.getRange(), start, end;
            range.adjustmentBoundary();
            start = domUtils.findParent(range.startContainer, function (node) {
                return node.nodeType == 1 && node.tagName.toLowerCase() == 'span' && domUtils.hasClass(node, 'MathJax')
            }, true);
            end = domUtils.findParent(range.endContainer, function (node) {
                return node.nodeType == 1 && node.tagName.toLowerCase() == 'span' && domUtils.hasClass(node, 'MathJax')
            }, true);
            return start && end && start == end ? 1 : 0;
        }
        catch (e) {
            return 0;
        }
    }

    //不需要判断highlight的command列表
    me.notNeedHighlightQuery = {
        help:1,
        undo:1,
        redo:1,
        source:1,
        print:1,
        searchreplace:1,
        fullscreen:1,
        autotypeset:1,
        pasteplain:1,
        preview:1,
        insertparagraph:1,
        elementpath:1
    };
    //将queyCommamndState重置
    var orgQuery = me.queryCommandState;
    me.queryCommandState = function (cmd) {
        if (!me.notNeedHighlightQuery[cmd.toLowerCase()] && queryState.call(this) == 1) {
            return -1;
        }
        return orgQuery.apply(this, arguments)
    };

    me.addListener('beforeselectionchange afterselectionchange', function (type) {
        me.formula = /^b/.test(type) ? me.queryCommandState('insertformula') : 0;
    });
    function getEleByClsName(cxt, clsName) {
        if (!cxt.getElementsByClassName) {
            var clsArr = [];
            var reg = new RegExp("\\b" + clsName + "\\b");
            var eleArr = cxt.getElementsByTagName("*");
            for (var i = 0, eleobj; eleobj = eleArr[i++];) {
                if (reg.test(eleobj.className))
                    clsArr.push(eleobj);
            }
            return clsArr;
        }
        else {
            return cxt.getElementsByClassName(clsName);
        }
    }

    me.addListener("beforegetcontent beforegetscene", function () {
        me._MathJaxList = [];
        var list = getEleByClsName(this.document, 'MathJax');
        utils.each(list, function (di) {
            me._MathJaxList.push(di.cloneNode(true));
        });

        if (list.length) {
            var str = "";
            utils.each(list, function (di) {
                var span = di.cloneNode(false);
                str = decodeURIComponent(di.getAttribute('data'));
                span.appendChild(me.document.createTextNode(str));
                di.parentNode.replaceChild(span, di);
            });
        }
    });


    me.addListener("aftergetcontent aftersetcontent aftergetscene", function () {
        var list = getEleByClsName(me.document, 'MathJax');
        if (list.length) {
            var i = 0;
            utils.each(list, function (di) {
                di.parentNode.replaceChild(me._MathJaxList[i++], di);
            });
        }
    });


//    //避免table插件对于代码高亮的影响
//    me.addListener('excludetable excludeNodeinautotype', function (cmd, target) {
//        if (target && domUtils.findParent(target, function (node) {
//            return node.tagName == '' && domUtils.hasClass(node, 'syntaxhighlighter');
//        }, true)) {
//            return true;
//        }
//    });

    me.addListener('getAllHtml', function (type, headHtml){
        var src= me.options.formulaJsUrl || me.options.UEDITOR_HOME_URL + 'third-party/MathJax/MathJax.js?config=TeX-AMS_HTML';
        var coreHtml = '<script  type="text/javascript">'+
                'window.onload = function () {'+
                '  setTimeout(function () {'+
                ' var script = document.createElement("script");'+
                'script.type = "text/javascript";'+
                'script.src  = "'+src+'";'+
                'document.getElementsByTagName("head")[0].appendChild(script);'+
                'document.head.removeChild(document.getElementById("formula"));'+
                '},2000)'+
                '}'+
            '</script>';

        var list = getEleByClsName(me.document, 'MathJax');
        if (list.length) {
            utils.each(list, function (di) {
                domUtils.removeAttributes(di,["class","data","id"]);
            });
        }
        coreHtml && headHtml.push(coreHtml);
    });
};