var layoutWrap = $G('layout-wrap'),
    textEditor = $G('textarea'),
    bk;

window.onload = function () {
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
    if (editor.queryCommandState("insertformula")) {
        var ele = domUtils.findParent(editor.selection.getRange().startContainer, function (node) {
            return node.className === 'math-container';
        });
        textEditor.value = decodeURIComponent(ele.getAttribute('data'));
        updateFormula(textEditor.value)
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

function getStyle() {
    var list = document.head.children, str = "";
    for (var i = 0, node; node = list[i++];) {
        if (/style/ig.test(node.tagName)) {
            str += node[browser.ie ? "innerText" : "textContent"];
        }
    }
    return str;
}

dialog.onok = function () {
    var textValue = textEditor.value.replace(/(^\s*)|(\s*$)/g, '');
    if (textValue.length > 0) {
        var mathjaxDom = $G('result-area').lastChild;
        if (!mathjaxDom) {
            alert("公式还没渲染好!");
            return;
        }
        do {
            mathjaxDom = mathjaxDom.previousSibling;
        }
        while (mathjaxDom && mathjaxDom.className != 'MathJax_Display');
        mathjaxDom.firstChild.setAttribute("data", encodeURIComponent(textValue));
        editor.execCommand('insertformula', mathjaxDom.innerHTML, getStyle());
    }
};