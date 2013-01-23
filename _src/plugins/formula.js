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
        me._MathJaxEleList = [];
        var list = getEleByClsName(this.document, 'MathJax');
        utils.each(list, function (di) {
            me._MathJaxEleList.push(di.cloneNode(true));
        });

        if (list.length) {
            utils.each(list, function (di) {
                var str = [];
                var span = di.cloneNode(false);
                str.push(decodeURIComponent(di.getAttribute('data')));
                span.appendChild(me.document.createTextNode(str.join('\n')));

                di.parentNode.replaceChild(span, di);
            });
        }
    });


    me.addListener("aftergetcontent aftersetcontent aftergetscene", function () {
        var list = getEleByClsName(me.document, 'MathJax');
        if (list.length) {
            var i = 0;
            utils.each(list, function (di) {
                di.parentNode.replaceChild(me._MathJaxEleList[i++], di);
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
//
//    me.addListener('getAllHtml', function (type, headHtml) {
//        var coreHtml = '';
//        for (var i = 0, ci, divs = domUtils.getElementsByTagName(me.document, 'table'); ci = divs[i++];) {
//            if (domUtils.hasClass(ci, 'syntaxhighlighter')) {
//                coreHtml = '<script type="text/javascript">window.onload = function(){SyntaxHighlighter.highlight();' +
//                    'setTimeout(function(){ ' +
//                    "   var tables = document.getElementsByTagName('table');" +
//                    "   for(var t= 0,ti;ti=tables[t++];){" +
//                    "       if(/SyntaxHighlighter/i.test(ti.className)){" +
//                    "           var tds = ti.getElementsByTagName('td');" +
//                    "           for(var i=0,li,ri;li=tds[0].childNodes[i];i++){" +
//                    "               ri = tds[1].firstChild.childNodes[i];" +
//                    "               if(ri){" +
//                    "                  ri.style.height = li.style.height = ri.offsetHeight + 'px';" +
//                    "               }" +
//                    "           }" +
//                    "       }" +
//                    "   }" +
//                    '},100)' +
//                    '}</script>'
//                break;
//            }
//        }
//        if (!coreHtml) {
//            var tmpNode;
//            if (tmpNode = me.document.getElementById('syntaxhighlighter_css')) {
//                domUtils.remove(tmpNode)
//            }
//            if (tmpNode = me.document.getElementById('syntaxhighlighter_js')) {
//                domUtils.remove(tmpNode)
//
//            }
//        }
//        coreHtml && headHtml.push(coreHtml)
//    });
};