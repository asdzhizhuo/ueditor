///import core
///import commands/inserthtml.js
///commands 插入公式
///commandsName  insertFormula
///commandsTitle  插入公式
///commandsDialog  dialogs\formula\formula.html

UE.plugins['insertformula'] = function() {
	var me = this;
	this.commands['insertformula'] = {
		execCommand: function (cmdName, texStr){
			texStr.length>0 && (this.execCommand('inserthtml', texStr));
		},
		queryCommandState: function (){
			var range = this.selection.getRange(),start,end;
			range.adjustmentBoundary();
			start = domUtils.findParent(range.startContainer,function(node){
				return node.nodeType == 1 && node.tagName == 'DIV' && domUtils.hasClass(node,'MathJax_Display')
			},true);
			end = domUtils.findParent(range.endContainer,function(node){
				return node.nodeType == 1 && node.tagName == 'DIV' && domUtils.hasClass(node,'MathJax_Display')
			},true);
			return start && end && start == end  ? 1 : 0;
		}
	};
	me.addListener("ready",function(){
		if(!window.MathJax){
			var script = me.document.createElement("script");
			script.type = "text/javascript";
			script.src  = "../third-party/MathJax/MathJax.js?config=TeX-AMS_HTML";

			var config = 'MathJax.Hub.Startup.onload();';

			if (window.opera) {script.innerHTML = config}
				   else {script.text = config}

			me.document.getElementsByTagName("head")[0].appendChild(script);
        }
	});

};