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
                    var str = node.innerText || node.textContent || node.value;
                    var newNode = domUtils.createElement (me.document , "span" , {
                        style : 'text-decoration: line-through;'
                    });
                    newNode.innerHTML += str.substring (rng.startOffset - 1 , rng.startOffset);
                    setTimeout(function(){
                        me.execCommand("inserthtml",newNode.outerHTML);
                    });
                }
            } else {
                rng.applyInlineStyle ("span" , {'style' : 'text-decoration: line-through;'})
                    .select ();
                evt.preventDefault ();
            }
        }
    });


};

