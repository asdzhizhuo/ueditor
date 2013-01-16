/**
 * Created with JetBrains PhpStorm.
 * User: xuheng
 * Date: 13-1-16
 * Time: 下午5:56
 * To change this template use File | Settings | File Templates.
 */
var layoutWrap = $G('layout-wrap'),
    textEditor = $G('textarea'),
    bk;

textEditor.focus();
textEditor.onmouseup = function () {
    document.selection && (bk = document.selection.createRange().getBookmark());
};
textEditor.onkeyup = function () {
    updateFormula.call(this, this.value);
};
layoutWrap.onclick = function (e) {
    var e = e || window.event,
        target = e.target || e.srcElement,
        signal,
        posStart,
        posEnd;
    if (target.tagName.toLowerCase() === 'td' && (signal = target.getAttribute('data'))) {
        if (!((posStart = textEditor.selectionStart) != undefined && (posEnd = textEditor.selectionEnd) != undefined)) {
            var range = textEditor.createTextRange();
            range.moveToBookmark(bk);
            range.select();
            var pos = getPos();
            posStart = pos[0];
            posEnd = pos[1];
        }
        textEditor.value = textEditor.value.slice(0, posStart) + signal + textEditor.value.slice(posEnd);
        updateFormula(textEditor.value);
    }
};

function updateFormula(text) {
    var tmr = arguments.callee.tmr;

    tmr && window.clearTimeout(tmr);
    arguments.callee.tmr = setTimeout(function () {
        MathJax.Hub.queue.Push(["Text", MathJax.Hub.getAllJax("result-area")[0], "\\displaystyle{" + text + "}"]);
    }, 1000);

}
function getPos() {
    var start, end, doc = document;
    var range = doc.selection.createRange();
    var range_all = doc.body.createTextRange();
    var textBox = $G('textarea');

    range_all.moveToElementText(textBox);
    for (start = 0; range_all.compareEndPoints("StartToStart", range) < 0; start++)
        range_all.moveStart('character', 1);
    for (var i = 0; i <= start; i++) {
        if (textBox.value.charAt(i) == '\n')
            start++;
    }
    range_all = doc.body.createTextRange();
    range_all.moveToElementText(textBox);

    for (end = 0; range_all.compareEndPoints('StartToEnd', range) < 0; end++)
        range_all.moveStart('character', 1);

    for (var i = 0; i <= end; i++) {
        if (textBox.value.charAt(i) == '\n')
            end++;
    }
    return [start, end];
}

var state = editor.queryCommandState("insertformula");
if (state) {
    var ele = domUtils.findParent(editor.selection.getRange().startContainer, function (node) {
        return node.className === 'math-container';
    });
    textEditor.value = decodeURIComponent(ele.getAttribute('data'));
    updateFormula(textEditor.value)
}

dialog.onok = function () {
    var textValue = textEditor.value.replace(/(^\s*)|(\s*$)/g, '');
    if (textValue.length > 0) {
        var mathjaxDom = $G('result-area').lastChild;
        do {
            mathjaxDom = mathjaxDom.previousSibling;
        }
        while (mathjaxDom && mathjaxDom.className != 'MathJax_Display');

        if (state == 0) {
            editor.execCommand('insertFormula', '<span id="math-container-id" class="math-container" data="' + encodeURIComponent(textValue) + '">$$' + textValue + '$$</span>');
            var ele = editor.selection.getRange().startContainer,
                ele = domUtils.findParent(ele, function (node) {
                    return node.nodeType === 1;
                });
            (editor.document.defaultView || editor.document.parentWindow).MathJax.Hub.Typeset(ele);

        }
        else {
            ele = editor.selection.getRange().startContainer,
                ele = domUtils.findParent(ele, function (node) {
                    return node.className === 'math-container';
                });
            (editor.document.defaultView || editor.document.parentWindow).MathJax.Hub.getJaxFor(ele.lastChild).Text(textValue);
        }
    }
};