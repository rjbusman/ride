helpurls = require './helpurls'
prefs = require './prefs'
about = require './about'
{cat,chr,ord,join,delay,qw,esc}=require './util'
prefsUI = require './prefs-ui'
{ACB_VALUE} = require './editor'

window.onhelp = -> false # prevent IE from acting silly on F1

prefs.prefixKey (x, old) -> # change listener
  if x != old then m = CodeMirror.keyMap.dyalogDefault; m["'#{x}'"] = m["'#{old}'"]; delete m["'#{old}'"]
  return

squiggleDescriptions =
  '¨': 'each',               '←': 'assignment',          '⊤': 'encode (123→1 2 3)',  '⌹': 'matrix inv/div'
  '¯': 'negative',           '→': 'branch',              '|': 'abs/modulo',          '⍷': 'find'
  '∨': 'or (GCD)',           '⍺': 'left argument',       '⍝': 'comment',             '⍨': 'commute'
  '∧': 'and (LCM)',          '⌈': 'ceil/max',            '⍀': '\\[⎕io]',             '⍣': 'power operator'
  '×': 'signum/times',       '⌊': 'floor/min',           '⌿': '/[⎕io]',              '⍞': 'char I/O'
  '÷': 'reciprocal/divide',  '∇': 'recur',               '⋄': 'statement sep',       '⍬': 'zilde (⍳0)'
  '?': 'roll/deal',          '∘': 'compose',             '⌶': 'I-beam',              '⍤': 'rank'
  '⍵': 'right argument',     '⎕': 'evaluated input',     '⍒': 'grade down',          '⌸': 'key'
  '∊': 'enlist/membership',  '⍎': 'execute',             '⍋': 'grade up',            '⌷': 'default/index'
  '⍴': 'shape/reshape',      '⍕': 'format',              '⌽': 'reverse/rotate',      '≡': 'depth/match'
  '~': 'not/without',        '⊢': 'right',               '⍉': 'transpose',           '≢': 'tally/not match'
  '↑': 'mix/take',           '⊂': 'enclose/partition',   '⊖': '⌽[⎕io]',              '⊣': 'left'
  '↓': 'split/drop',         '⊃': 'disclose/pick',       '⍟': 'logarithm',           '⍪': 'table / ,[⎕io]'
  '⍳': 'indices/index of',   '∩': 'intersection',        '⍱': 'nor',                 '⍠': 'variant'
  '○': 'pi/trig',            '∪': 'unique/union',        '⍲': 'nand'
  '*': 'exp/power',          '⊥': 'decode (1 2 3→123)',  '!': 'factorial/binomial'

ctid = 0 # backquote completion timeout id

CodeMirror.keyMap.dyalogDefault = fallthrough: 'default', End: 'goLineEndSmart'
CodeMirror.keyMap.dyalogDefault["'#{prefs.prefixKey()}'"] = 'BQC'

$.extend CodeMirror.commands,
  TB: -> switchWindows  1; return
  BT: -> switchWindows -1; return
  SA: CodeMirror.commands.selectAll
  CT: -> document.execCommand 'Cut'  ; return
  CP: -> document.execCommand 'Copy' ; return
  PT: -> document.execCommand 'Paste'; return
  TO: CodeMirror.commands.toggleFold
  PRF: -> prefsUI.showDialog(); return
  ABT: -> about.showDialog();   return
  CNC: -> D.rideConnect();      return
  NEW: -> D.rideNewSession();   return
  QIT: -> D.quit();             return
  LBR: -> prefs.lbar.toggle();  return
  WI: -> D.ide.emit 'WeakInterrupt';   return
  SI: -> D.ide.emit 'StrongInterrupt'; return
  FUL: ->
    d = document; e = d.body
    if d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement
      (d.exitFullscreen    || d.webkitExitFullscreen    || d.mozCancelFullScreen  || d.msExitFullscreen   )?.apply d
    else
      (e.requestFullscreen || e.webkitRequestFullscreen || e.mozRequestFullScreen || e.msRequestFullscreen)?.apply e
    return

  EXP: (cm) ->
    sels = cm.listSelections()
    if sels.length == 1
      {Pos} = CodeMirror; ll = cm.lastLine(); l = cm.getCursor().line
      cmp = (x, y) -> (x[0] - y[0]) || (x[1] - y[1]) # compare two pairs of numbers
      ranges = [ # candidates for selection
        [[l, 0], [l,  cm.getLine(l ).length]] # current line
        [[0, 0], [ll, cm.getLine(ll).length]] # whole document
      ]
      u = cm.getCursor(); t0 = cm.getTokenAt u; t1 = cm.getTokenAt line: u.line, ch: u.ch + 1; t = t0 || t1
      if t0 && t1 && !(t0.start == t1.start && t0.end == t1.end) # we must decide which token looks more important
        [x, y] = [t0, t1].map (ti) -> (ti.type || '').replace /^.*\bapl-(\w*)$/, '$1' # x, y: left and right token type
        I = var:5,glb:5,  quad:4,  str:3,  num:2,  kw:1,  par:-1,sqbr:-1,semi:-1,dfn:-1,  '':-2 # importance
        t = if (I[x] || 0) > (I[y] || 0) then t0 else t1
      t && ranges.push [[l, t.start], [l, t.end]] # current token
      ranges.sort (x, y) -> cmp(y[0], x[0]) || cmp(x[1], y[1]) # inside-out order: desc beginnings, then asc ends
      sel = sels[0]; s = [[sel.anchor.line, sel.anchor.ch], [sel.head.line, sel.head.ch]].sort cmp
      for r in ranges
        d0 = cmp r[0], s[0]
        d1 = cmp r[1], s[1]
        if (d0 <= 0 <= d1) && !(d0 == d1 == 0)
          cm.setSelection Pos(r[0][0], r[0][1]), Pos(r[1][0], r[1][1])
          break
    return

  HLP: (cm) ->
    c = cm.getCursor(); s = cm.getLine(c.line).toLowerCase()
    D.openExternal(
      if      m = /^ *(\)[a-z]+).*$/.exec s then helpurls[m[1]] || helpurls.WELCOME
      else if m = /^ *(\][a-z]+).*$/.exec s then helpurls[m[1]] || helpurls.UCMDS
      else
        x = s[s[...c.ch].replace(/.[áa-z]*$/i, '').length..].replace(/^([⎕:][áa-z]*|.).*$/i, '$1').replace /^:end/, ':'
        helpurls[x] ||
          if      x[0] == '⎕' then helpurls.SYSFNS
          else if x[0] == ':' then helpurls.CTRLSTRUCTS
          else                     helpurls.LANGELEMENTS
    )
    return

  BQC: (cm) ->
    if cm.dyalogBQ
      c = cm.getCursor(); cm.replaceSelection prefs.prefixKey(), 'end'
    else
      # Make it possible to use `( etc -- remember the original value of
      # autoCloseBrackets, set it temporarily to "false", and restore it when the
      # menu is closed:
      cm.setOption 'autoCloseBrackets', false # this is temporary until bqCleanUp()
      cm.on 'change', bqChangeHandler; cm.dyalogBQ = 1
      c0 = cm.getCursor(); cm.replaceSelection prefs.prefixKey(), 'end'
      ctid = delay 500, ->
        c1 = cm.getCursor()
        if c1.line == c0.line && c1.ch == c0.ch + 1
          cm.showHint
            completeOnSingleClick: true
            extraKeys:
              Backspace: (cm, m) -> m.close(); cm.execCommand 'delCharBefore'; return
              Left:      (cm, m) -> m.close(); cm.execCommand 'goCharLeft'; return
              Right:     (cm, m) -> m.pick(); return
            hint: ->
              pk = prefs.prefixKey(); ks = (for x of bq when x != '☠' then x).sort()
              data = from: c0, to: cm.getCursor(), list: ks.map (k) ->
                if k == pk
                  text: '', hint: bqbqHint, render: (e) -> e.innerHTML = "  #{pk}#{pk} <i>completion by name</i>"; return
                else
                  v = bq[k]; text: v, render: (e) -> $(e).text "#{v} #{pk}#{k} #{squiggleDescriptions[v] || ''}  "; return
              data
        else
          bqCleanUp cm
        return
    return

  goLineEndSmart: (cm) -> # CodeMirror provides a goLineStartSmart but not a goLineEndSmart command.
    cm.extendSelectionsBy(
      ->
        c = cm.getCursor(); l = c.line; s = cm.getLine l; n = s.length; m = s.replace(/\ +$/, '').length
        CodeMirror.Pos l, if m <= c.ch < n || !m then n else m
      origin: '+move', bias: -1
    )
    return

  PRN: (cm) ->
    pw = open 'print.html', 'Print'
    pw.onload = ->
      counter = 3
      btn = pw.document.getElementById 'ok'
      btn.value = "OK (#{counter})"
      btn.onclick = ok = ->
        pw.document.getElementById('content').innerHTML = esc cm.getValue()
        setTimeout (-> pw.print(); return), 500
        clearInterval iid; iid = 0; false
      iid = setInterval (-> btn.value = "OK (#{--counter})"; counter || ok(); return), 1000
      return
    return

switchWindows = (d) -> # d: a step of either 1 or -1
  a = []; i = -1; for _, w of D.wins then (if w.hasFocus() then i = a.length); a.push w
  j = if i < 0 then 0 else (i + a.length + d) % a.length
  $("#wintab#{a[j].id} a").click(); a[j].focus(); false

# D.kbds.layouts[lc] contains four strings describing how keys map to characters:
#    0:normal  1:shifted
#    2:APL     3:APL shifted
# Each string can be indexed by scancode: http://www.abreojosensamblador.net/Productos/AOE/html/Pags_en/ApF.html
# "APL" and "APL shifted" are the defaults upon which the user can build customisations.

D.kbds.layouts['DK-Mac'] = [
  ' $1234567890+´   qwertyuiopå¨  asdfghjklæø\'  <zxcvbnm,.-  '
  ' §!"#€%&/()=?`   QWERTYUIOPÅ^  ASDFGHJKLÆØ*  >ZXCVBNM;:_  '
  ' ⋄¨¯<≤=≥>≠∨∧×÷   ?⍵∊⍴~↑↓⍳○*←→  ⍺⌈⌊_∇∆∘\'⎕⍎⍕   ⊢⊂⊃∩∪⊥⊤|⍝⍀⌿  '
  '  ⌶⍫⍒⍋⌽⍉⊖⍟⍱⍲!⌹     ⍷ ⍨  ⍸⍥⍣⍞⍬        ⍤⌸⌷≡≢   ⊣       ⍪⍙⍠  '
]

bq = null # effective ` map as a dictionary, kept in sync with the prefs
do updateBQ = ->
  bq = {}; lc = prefs.kbdLocale() || 'US'; l = D.kbds.layouts[lc]; n = l[0].length
  for i in [0..1] then for j in [0...n] then bq[l[i][j]] ?= l[2 + i][j]
  if s = prefs.prefixMaps()[lc] then for i in [0...s.length] by 2 then x = s[i]; y = s[i + 1]; bq[x] = y
  return
prefs.prefixMaps updateBQ; prefs.kbdLocale updateBQ

# order: used to measure how "complicated" (for some made-up definition of the word) a shortcut is.
# Tooltips in the lbar show the simplest one.
order = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
complexity = (x) -> (1 + order.indexOf x) || (1 + order.length + x.charCodeAt 0)
@getBQKeyFor = getBQKeyFor = (v) ->
  r = ''; (for x, y of bq when y == v && (!r || complexity(r) > complexity(x)) then r = x); r

bqChangeHandler = (cm, o) -> # o: changeObj
  l = o.from.line; c = o.from.ch
  if o.origin == '+input' && o.text.length == 1 && o.text[0].length == 1
    x = o.text[0]; pk = prefs.prefixKey()
    if x == pk
      if c && cm.getLine(l)[c - 1] == pk then bqCleanUp cm; bqbqHint cm
    else
      if bq[x]
        cm.replaceRange bq[x], {line: l, ch: c - 1}, {line: l, ch: c + 1}, 'D'
        if bq[x] == '∇' && /^\s*∇/.test cm.getLine l then cm.indentLine l, 'smart'
      bqCleanUp cm
  else
    bqCleanUp cm
  return

bqCleanUp = (cm) ->
  cm.off 'change', bqChangeHandler; delete cm.dyalogBQ
  clearTimeout ctid; cm.state.completionActive?.close?()
  cm.setOption 'autoCloseBrackets', !!prefs.autoCloseBrackets() && ACB_VALUE
  return

bqbqHint = (cm) ->
  c = cm.getCursor()
  cm.showHint completeOnSingleClick: true, extraKeys: {Right: pick = ((cm, m) -> m.pick()), Space: pick}, hint: ->
    u = cm.getLine(c.line)[c.ch...cm.getCursor().ch]
    a = []; for x in bqbqc when x.name[...u.length] == u then a.push x
    from: {line: c.line, ch: c.ch - 2}, to: cm.getCursor(), list: a
  return

# ``name completions
bqbqc = ((s) -> cat s.split('\n').map (l) ->
  [squiggle, names...] = l.split ' '
  names.map (name) -> name: name, text: squiggle, render: (e) ->
    key = getBQKeyFor squiggle; pk = prefs.prefixKey()
    $(e).text "#{squiggle} #{if key then pk + key else '  '} #{pk}#{pk}#{name}"
) """
  ← leftarrow assign gets
  + plus add conjugate mate
  - minus hyphen subtract negate
  × cross times multiply sgn signum direction
  ÷ divide reciprocal obelus
  * star asterisk power exponential
  ⍟ logarithm naturallogarithm circlestar starcircle splat
  ⌹ domino matrixdivide quaddivide
  ○ pi circular trigonometric
  ! exclamation bang shriek factorial binomial combinations
  ? question roll deal random
  | stile stroke verticalline modulo abs magnitude residue remainder
  ⌈ upstile maximum ceiling
  ⌊ downstile minimum floor
  ⊥ base decode uptack
  ⊤ antibase encode downtack representation
  ⊣ left lev lefttack
  ⊢ right dex righttack
  = equal
  ≠ ne notequal xor logicalxor
  ≤ le lessorequal fore
  < lessthan before
  > greaterthan after
  ≥ ge greaterorequal aft
  ≡ match equalunderbar identical
  ≢ notmatch equalunderbarslash notidentical tally
  ∧ and conjunction lcm logicaland lowestcommonmultiple caret
  ∨ or disjunction gcd vel logicalor greatestcommondivisor hcf highestcommonfactor
  ⍲ nand andtilde logicalnand carettilde
  ⍱ nor ortilde logicalnor
  ↑ uparrow mix take
  ↓ downarrow split drop
  ⊂ enclose leftshoe partition
  ⊃ disclose rightshoe pick
  ⌷ squishquad squad index default materialise
  ⍋ gradeup deltastile upgrade pine
  ⍒ gradedown delstile downgrade spine
  ⍳ iota indices indexof
  ⍷ find epsilonunderbar
  ∪ cup union unique downshoe distinct
  ∩ cap intersection upshoe
  ∊ epsilon in membership enlist flatten type
  ~ tilde not without
  / slash reduce fold insert select compress replicate solidus
  \\ backslash slope scan expand
  ⌿ slashbar reducefirst foldfirst insertfirst
  ⍀ slopebar backslashbar scanfirst expandfirst
  , comma catenate laminate ravel
  ⍪ commabar table catenatefirst
  ⍴ rho shape reshape
  ⌽ reverse rotate circlestile
  ⊖ reversefirst rotatefirst circlebar rowel upset
  ⍉ transpose circlebackslash cant
  ¨ each diaeresis
  ⍨ commute switch selfie tildediaeresis
  ⍣ poweroperator stardiaeresis
  . dot
  ∘ jot compose ring
  ⍤ jotdiaeresis rank paw
  ⍞ quotequad characterinput rawinput
  ⎕ quad input evaluatedinput
  ⍠ colonquad quadcolon variant option
  ⌸ equalsquad quadequals key
  ⍎ execute eval uptackjot hydrant
  ⍕ format downtackjot thorn
  ⋄ diamond statementseparator
  ⍝ comment lamp
  → rightarrow branch abort
  ⍵ omega rightarg
  ⍺ alpha leftarg
  ∇ del recur triangledown downtriangle
  & ampersand spawn et
  ¯ macron negative highminus
  ⍬ zilde empty
  ⌶ ibeam
  ¤ currency isolate
  ∥ parallel
  ∆ delta triangleup uptriangle
  ⍙ deltaunderbar
  ⍥ circlediaeresis hoof
  ⍫ deltilde
  á aacute
""" + [0...26].map((i) -> "\n#{chr i + ord 'Ⓐ'} _#{chr i + ord 'a'}").join '' # underscored alphabet: Ⓐ _a ...

createCommand = (xx) -> CodeMirror.commands[xx] ?= (cm) -> (if (h = cm.dyalogCommands) && h[xx] then h[xx](cm)); return
qw('CBP MA AC tabOrAutocomplete downOrXline indentMoreOrAutocomplete CLM').forEach createCommand
'''
  [     0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F]
  [00] QT ER TB BT EP UC DC RC LC US DS RS LS UL DL RL
  [10] LL HO CT PT IN II DI DP DB RD TG DK OP CP MV FD
  [20] BK ZM SC RP NX PV RT RA ED TC NB NS ST EN IF HK
  [30] FX LN MC MR JP D1 D2 D3 D4 D5 U1 U2 U3 U4 U5 Lc
  [40] Rc LW RW Lw Rw Uc Dc Ll Rl Ul Dl Us Ds DD DH BH
  [50] BP AB HT TH RM CB PR SR -- TL UA AO DO GL CH PU
  [60] PA -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
  [70] -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
  [80] -- -- -- -- -- -- TO MO -- -- -- -- -- S1 S2 OS
'''.replace(/\[.*?\]/g, '').replace(/^\s*|\s*$/g, '').split(/\s+/).forEach (xx, i) ->
  if xx != '--' then createCommand xx; CodeMirror.keyMap.dyalogDefault["'#{chr 0xf800 + i}'"] = xx
  return
