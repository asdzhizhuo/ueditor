/**
 * Created with JetBrains PhpStorm.
 * User: xuheng
 * Date: 13-6-21
 * Time: 上午10:45
 * To change this template use File | Settings | File Templates.
 */

UE.plugins['revision'] = function () {
    var me = this,
        revision = me.options.pasteplain;

    me.commands['revision'] = {
        queryCommandState : function () {
            return revision ? 1 : 0;
        } ,
        execCommand : function () {
            revision = !revision | 0;
        }
    };


    //需要判断highlight的command列表
    me.needCodeQuery = {
        underline : 1 ,
        strikethrough : 1
    };

    var orgQuery = me.queryCommandState;
    me.queryCommandState = function (cmd) {
        var me = this;
        if (me.needCodeQuery[cmd.toLowerCase ()] && me.queryCommandState ('revision')) {
            return -1;
        }
        return orgQuery.apply (this , arguments)
    };

    function getDomNode (node , start , ltr , startFromChild , fn , guard) {
        var tmpNode = startFromChild && node[start],
            parent;
        !tmpNode && (tmpNode = node[ltr]);
        while (!tmpNode && (parent = (parent || node).parentNode)) {
            if (parent.tagName == 'BODY' || guard && !guard (parent)) {
                return null;
            }
            tmpNode = parent[ltr];
        }
        if (tmpNode && fn && !fn (tmpNode)) {
            return  getDomNode (tmpNode , start , ltr , false , fn);
        }

        var rng=me.selection.getRange();
        if(rng.startOffset==1){

        }else if(rng.startOffset==tmpNode.length){

        }
        return tmpNode;
    }

    //获取兄弟上下节点
    function getNearNode (node) {
        var filter = function (ltr) {
            return getDomNode (node , 'firstChild' , ltr , false , function (ele) {
                return  ele && domUtils.hasClass (ele , "line-through");
            })
        }, tmp;

        if (tmp = filter ("previousSibling")) {
            return {
                node : tmp ,
                ltr : "previousSibling"
            };
        } else {
            return {
                node : filter ("nextSibling") ,
                ltr : "nextSibling"
            };
        }
    }

    me.addListener ('keydown' , function (type , evt) {
        var keyCode = evt.keyCode || evt.which;

        if (revision && keyCode == 8) {
            var rng = me.selection.getRange ();
            if (rng.collapsed) {
                if (rng.startOffset == 0)  return;

                var node = rng.startContainer;

                while (node && node.nodeType != 3) {
                    node = node.lastChild;
                }

                if (node && node.nodeType == 3) {
                    var obj = getNearNode (node),
                        newNode = obj.node,
                        char = (node.innerText || node.textContent || node.value).substring (rng.startOffset - 1 , rng.startOffset);

                    if (!newNode) {
                        newNode = domUtils.createElement (me.document , "span" , {
                            class : 'line-through' ,
                            style : 'text-decoration: line-through;'
                        });

                        rng.insertNode (newNode);
                    }

                    if (obj.ltr) {
                        newNode.innerHTML = char + newNode.innerHTML;
                    }

                }

            } else {
                rng.applyInlineStyle ("span" , {'style' : 'text-decoration: line-through;'})
                    .select ();
                evt.preventDefault ();
            }
        }
    });


};

