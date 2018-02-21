{
  // session
  // holds a reference to a Monaco editor instance (.me)
  // and processes some of its commands (e.g. .ED(), .ER(), ...)
  function Se(ide) { // constructor
    const se = this;
    se.ide = ide;
    se.hist = [''];
    se.histIdx = 0;
    se.focusTS = 0;
    se.id = 0;
    se.dirty = {};
    // modified lines: lineNumber→originalContent
    // inserted lines: lineNumber→0 (also used in syn.js)
    se.dom2 = document.createElement('div');
    se.dom2.className = 'ride_win_hide';
    se.dom2.style.display = 'none';
    // se.$e = $(se.dom2);
    // se.dom.oncontextmenu = D.oncmenu;
    const cm = CM(se.dom2, {
      autofocus: true,
      mode: { name: 'apl-session', se },
      matchBrackets: !!D.prf.matchBrackets(),
      readOnly: true,
      keyMap: 'dyalog',
      lineWrapping: !!D.prf.wrap(),
      indentUnit: 4,
      smartIndent: 0,
      autoCloseBrackets: { pairs: '()[]{}', explode: '' },
      scrollbarStyle: 'simple',
      extraKeys: { 'Shift-Tab': 'indentLess', Tab: 'indentOrComplete' },
      cursorBlinkRate: D.prf.blinkCursor() * CM.defaults.cursorBlinkRate,
    });
    se.cm = cm;
    cm.dyalogCmds = se;

    se.dom = document.createElement('div');
    se.dom.className = 'ride_win';
    se.$e = $(se.dom);
    se.dom.oncontextmenu = D.oncmenu;
    const me = monaco.editor.create(se.dom, {
      autoClosingBrackets: !!D.prf.autoCloseBrackets(),
      automaticLayout: true,
      autoIndent: true,
      cursorStyle: D.prf.blockCursor() ? 'block' : 'line',
      cursorBlinking: D.prf.blinkCursor() ? 'blink' : 'solid',
      folding: false,
      fontFamily: 'apl',
      fontSize: se.ide.zoom2fs[D.prf.zoom() + 10],
      glyphMargin: se.breakpoints,
      language: 'apl-session',
      lineNumbers: 'off',
      matchBrackets: !!D.prf.matchBrackets(),
      model: null,
      mouseWheelZoom: false,
      renderIndentGuides: false,
      wordBasedSuggestions: false,
    });
    se.me = me;
    me.dyalogCmds = se;

    let mouseL = 0; let mouseC = 0; let mouseTS = 0;
    me.onMouseDown((e) => {
      const t = e.target;
      const mt = monaco.editor.MouseTargetType;
      const p = t.position;
      if (t.type === mt.CONTENT_TEXT) {
        if (e.event.timestamp - mouseTS < 400 && mouseL === p.lineNumber && mouseC === p.column) {
          se.ED(me); e.event.preventDefault(); e.event.stopPropagation();
        }
        mouseL = p.lineNumber; mouseC = p.column; mouseTS = e.event.timestamp;
      }
    });
    cm.on('scroll', (c) => { const i = c.getScrollInfo(); se.btm = i.clientHeight + i.top; });
    cm.on('focus', () => { se.focusTS = +new Date(); ide.focusedWin = se; });
    cm.on('beforeChange', (_, c) => { // keep track of inserted/deleted/changed lines, use se.dirty for that
      if (c.origin === 'D') return;
      const l0 = c.from.line;
      const l1 = c.to.line;
      const m = (l1 - l0) + 1;
      let n = c.text.length;
      if (m < n) {
        const h = se.dirty;
        se.dirty = {};
        Object.keys(h).forEach((x) => { se.dirty[x + ((n - m) * (x > l1))] = h[x]; });
      } else if (n < m) {
        if (!c.update) { c.cancel(); return; } // the change is probably the result of Undo
        const text = c.text.slice(0);
        for (let j = n; j < m; j++) text.push(''); // pad shrinking changes with empty lines
        c.update(c.from, c.to, text);
        n = m;
      }
      let l = l0;
      while (l <= l1) {
        const base = se.dirty;
        base[l] == null && (base[l] = se.cm.getLine(l));
        l += 1;
      }
      while (l < l0 + n) se.dirty[l++] = 0;
    });
    cm.on('change', (_, c) => {
      if (c.origin === 'D') return;
      Object.keys(se.dirty).forEach((l) => { se.cm.addLineClass(+l, 'background', 'modified'); });
    });
    se.promptType = 0; // see ../docs/protocol.md #SetPromptType
    se.processAutocompleteReply = D.ac(se); // delegate autocompletion processing to ac.js
    D.prf.wrap((x) => { se.cm.setOption('lineWrapping', !!x); se.scrollCursorIntoView(); });
    D.prf.blockCursor((x) => {
      Object.keys(D.wins).forEach((i) => { D.wins[i].blockCursor(!!x); });
    });
    D.prf.blinkCursor((x) => {
      Object.keys(D.wins).forEach((i) => {
        D.wins[i].blinkCursor(x * CM.defaults.cursorBlinkRate);
      });
      this.vt = D.vt(this); // value tips
    });
  }
  Se.prototype = {
    histAdd(lines) {
      this.hist[0] = '';
      [].splice.apply(this.hist, [1, 0].concat(lines));
      this.histIdx = 0;
    },
    histMove(d) { // go back or forward in history
      const i = this.histIdx + d;
      const l = this.me.getPosition().lineNumber - 1;
      if (i < 0) { $.alert('There is no next line', 'Dyalog APL Error'); return; }
      if (i >= this.hist.length) { $.alert('There is no previous line', 'Dyalog APL Error'); return; }
      if (!this.histIdx) this.hist[0] = this.cm.getLine(l);
      if (this.hist[i] == null) return;
      this.cm.replaceRange(
        this.hist[i],
        { line: l, ch: 0 },
        { line: l, ch: this.cm.getLine(l).length },
      );
      this.cm.setCursor({ line: l, ch: this.hist[i].search(/\S|$/) });
      this.histIdx = i;
    },
    add(s) { // append text to session
      const { cm, me } = this;
      // const l = cm.lastLine();
      // const s0 = cm.getLine(l);
      const l = me.model.getLineCount();
      const s0 = me.model.getLineContent(l);
      const p = '      ';
      let sp = s.slice(-1) === '\n' ? s + p : s;
      if (this.dirty[l] != null) {
        const cp = cm.getCursor();
        cm.replaceRange(`${s0}\n${sp}`, { line: l, ch: 0 }, { line: l, ch: s0.length }, 'D');
        cm.setCursor(cp);
      } else {
        sp = cm.getOption('readOnly') && s0 !== p ? (s0 + sp) : sp;
        me.executeEdits('D', [{ range: new monaco.Range(l, 1, l, s0.length + 1), text: sp }]);
        me.setPosition({ lineNumber: me.model.getLineCount(), column: 1 });
        // me.revealRangeAtTop({ startLineNumber:  })
        // cm.replaceRange(sp, { line: l, ch: 0 }, { line: l, ch: s0.length }, 'D');
        // cm.setCursor({ line: cm.lastLine() });
        const i = cm.getScrollInfo();
        this.btm = Math.max(i.clientHeight + i.top, cm.heightAtLine(cm.lastLine(), 'local'));
      }
    },
    prompt(x) {
      const { cm } = this;
      const l = cm.lastLine();
      const t = cm.getLine(l);
      this.promptType = x;
      cm.setOption('readOnly', !x);
      cm.setOption('cursorHeight', +!!x);

      if ((x === 1 && this.dirty[l] == null) || [0, 1, 3, 4].indexOf(x) < 0) {
        cm.replaceRange('      ', { line: l, ch: 0 }, { line: l, ch: t.length }, 'D');
      } else if (t === '      ') {
        cm.replaceRange('', { line: l, ch: 0 }, { line: l, ch: 6 }, 'D');
      } else {
        cm.setCursor(l, t.length);
      }
      x && cm.clearHistory();
    },
    updSize() {
      const i = this.cm.getScrollInfo();
      const { top } = i;
      const ontop = top > this.cm.heightAtLine(this.cm.lastLine(), 'local') - i.clientHeight;
      this.cm.setSize(this.dom.clientWidth, this.dom.clientHeight);
      this.updPW();
      if (ontop) {
        this.btm = top + this.cm.getScrollInfo().clientHeight;
      } else if (i.top === 0) {
        this.btm += this.cm.getScrollInfo().clientHeight - i.clientHeight;
      }
    },
    updPW(force) {
      // force:emit a SetPW message even if the width hasn't changed
      // discussion about CodeMirror's width in chars: https://github.com/codemirror/CodeMirror/issues/3618
      // We can get the scrollbar's width through cm.display.scrollbarFiller.clientWidth, it's 0 if not present.
      // But it's better to reserve a hard-coded width for it regardless of its presence.
      const pw = Math.max(42, Math.floor((this.dom.clientWidth - 20) / this.cm.defaultCharWidth()));
      if ((pw !== this.pw && this.ide.connected) || force) D.send('SetPW', { pw: this.pw = pw });
    },
    scrollCursorIntoView() {
      const { cm } = this;
      cm.scrollTo(0, cm.getScrollInfo().top);
      setTimeout(() => { cm.scrollIntoView(); }, 1);
    },
    saveScrollPos() {
      // workaround for CodeMirror scrolling up to the top under GoldenLayout when editor is closed
      if (this.btm === null) {
        const i = this.cm.getScrollInfo();
        this.btm = i.clientHeight + i.top;
      }
    },
    restoreScrollPos() {
      if (this.btm != null) {
        const i = this.cm.getScrollInfo();
        this.cm.scrollTo(0, this.btm - i.clientHeight);
      }
    },
    stateChanged() {
      const w = this;
      w.updSize();
      w.cm.refresh();
      w.updGutters && w.updGutters();
      w.restoreScrollPos();
    },
    blockCursor(x) { this.cm.getWrapperElement().classList.toggle('cm-fat-cursor', !!x); },
    blinkCursor(x) { this.cm.setOption('cursorBlinkRate', x); },
    hasFocus() { return this.cm.hasFocus(); },
    focus() {
      let q = this.container;
      let p = q && q.parent;
      const l = q && q.layoutManager;
      const m = l && l._maximisedItem;
      if (m && m !== (p && p.parent)) m.toggleMaximise();
      while (p) {
        p.setActiveContentItem && p.setActiveContentItem(q); q = p; p = p.parent;
      } // reveal in golden layout
      window.focused || window.focus(); this.cm.focus();
    },
    insert(ch) { this.cm.getOption('readOnly') || this.cm.replaceSelection(ch); },
    die() { this.cm.setOption('readOnly', true); },
    getDocument() { return this.dom.ownerDocument; },
    refresh() { this.cm.refresh(); },
    loadLine(s) {
      const { cm } = this;
      const l = cm.lastLine();
      cm.replaceRange(s, { line: l, ch: 0 }, { line: l, ch: cm.getLine(l).length });
    },
    exec(trace) {
      let w;
      let es;
      const se = this;
      if (!se.promptType) return;
      const ls = Object.keys(se.dirty).map(l => +l);
      if (ls.length) {
        ls.sort((x, y) => x - y);
        es = ls.map(l => se.cm.getLine(l) || ''); // strings to execute
        ls.reverse().forEach((l) => {
          se.cm.removeLineClass(l, 'background', 'modified');
          se.dirty[l] === 0 ? se.cm.replaceRange('', { line: l, ch: 0 }, { line: l + 1, ch: 0 }, 'D')
            : se.cm.replaceRange(se.dirty[l], { line: l, ch: 0 }, { line: l, ch: (se.cm.getLine(l) || '').length || 0 }, 'D');
        });
      } else {
        es = [se.cm.getLine(se.cm.getCursor().line)];
        if (trace && /^\s*$/.test(es[0]) && (w = se.ide.tracer())) {
          w.focus(); return;
        }
      }
      se.ide.exec(es, trace);
      se.dirty = {};
      se.histAdd(es.filter(x => !/^\s*$/.test(x)));
      se.cm.clearHistory();
    },
    autoCloseBrackets(x) { this.cm.setOption('autoCloseBrackets', x); },
    matchBrackets(x) { this.cm.setOption('matchBrackets', !!x); },
    zoom(z) {
      const w = this;
      const b = w.getDocument().body;
      const top = w.cm.heightAtLine(w.cm.lastLine(), 'local') < w.btm;
      const i = w.cm.getScrollInfo();
      const line = w.cm.lineAtHeight(top ? i.top : w.btm, 'local');
      const diff = w.btm - (line * w.cm.defaultTextHeight());
      const ch = i.clientHeight;
      b.className = `zoom${z} ${b.className.split(/\s+/).filter(s => !/^zoom-?\d+$/.test(s)).join(' ')}`;
      w.refresh();
      w.btm = (w.cm.defaultTextHeight() * line) + (top ? ch + 5 : diff) +
        (w.cm.getScrollInfo().clientHeight - ch);
    },

    ValueTip(x) { this.vt.processReply(x); },
    ED(cm) {
      const c = cm.getCursor();
      const txt = cm.getLine(c.line);
      if (/^\s*$/.test(txt)) {
        const tc = this.ide.tracer();
        if (tc) { tc.focus(); tc.ED(tc.cm); }
      } else {
        // D.send('Edit',{win:0,pos:c.ch,text:txt,unsaved:this.ide.getUnsaved()})
        this.ide.Edit({ win: 0, pos: c.ch, text: txt });
      }
    },
    BK() { this.histMove(1); },
    FD() { this.histMove(-1); },
    QT(cm) {
      const c = cm.getCursor();
      const l = c.line;
      if (this.dirty[l] === 0) {
        if (l === cm.lastLine()) {
          cm.replaceRange('', { line: l, ch: 0 }, { line: l + 1, ch: 0 }, 'D');
        } else {
          cm.replaceRange(
            '',
            { line: l - 1, ch: cm.getLine(l - 1).length },
            { line: l, ch: cm.getLine(l).length },
            'D',
          );
        }
        delete this.dirty[l];
        const h = this.dirty;
        this.dirty = {};
        Object.keys(h).forEach((x) => { this.dirty[x - (x > l)] = h[x]; });
      } else if (this.dirty[l] != null) {
        cm.replaceRange(this.dirty[l], { line: l, ch: 0 }, { line: l, ch: cm.getLine(l).length }, 'D');
        cm.removeLineClass(l, 'background', 'modified');
        cm.setCursor(l, this.dirty[l].search(/\S|$/));
        delete this.dirty[l];
      }
    },
    EP() { this.ide.focusMRUWin(); },
    ER() { this.exec(0); },
    TC() { this.exec(1); },
    LN() { D.prf.lineNums.toggle(); },
    MA() { D.send('RestartThreads', { win: 0 }); },
    indentOrComplete(cm) {
      const u = cm.getCursor();
      const s = cm.getLine(u.line);
      if (cm.somethingSelected() || this.promptType === 4 || /^ *$/.test(s.slice(0, u.ch))) {
        cm.execCommand('indentMore'); return;
      }
      this.autocompleteWithTab = 1;
      D.send('GetAutocomplete', { line: s, pos: u.ch, token: 0 });
    },
  };
  D.Se = Se;
}
