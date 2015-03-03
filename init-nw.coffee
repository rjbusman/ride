# NW.js-specific initialisation
@D ?= {}

segmentsIntersect = (a, b, c, d) -> a < d && c < b

rectanglesIntersect = (r0, r1) -> (
  segmentsIntersect(r0.x, r0.x + r0.width,  r1.x, r1.x + r1.width) &&
  segmentsIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height)
)

segmentFitWithin = (a, b, A, B) ->
  if b - a > B - A then [A, B] else if a < A then [A, A + b - a] else if b > B then [B - b + a, B] else [a, b]

rectangleFitWithin = (r, R) ->
  [x, x1] = segmentFitWithin r.x, r.x + r.width,  R.x, R.x + R.width
  [y, y1] = segmentFitWithin r.y, r.y + r.height, R.y, R.y + R.height
  {x, y, width: x1 - x, height: y1 - y}

restoreWindow = (w, r) -> # w: NWJS window, r: rectangle
  for scr in require('nw.gui').Screen.screens
    if rectanglesIntersect scr.work_area, r
      r = rectangleFitWithin r, scr.work_area
      w.moveTo r.x, r.y; w.resizeTo r.width, r.height
      break
  return

if process? then do ->
  gui = require 'nw.gui'; crypto = require 'crypto'; fs = require 'fs'; nomnom = require 'nomnom'
  path = require 'path'; {spawn} = require 'child_process'; {Proxy} = require './proxy'
  D.nwjs = true; D.process = process; gui.Screen.Init(); nww = gui.Window.get()
  if opener
    opener.D.floatingWindows.push nww
  else
    D.floatingWindows = []
    nww.on 'focus', -> D.floatingWindows.forEach((x) -> x.setAlwaysOnTop true ); return
    nww.on 'blur',  -> D.floatingWindows.forEach((x) -> x.setAlwaysOnTop false); return
    # restore window state:
    if localStorage.winInfo then try restoreWindow nww, JSON.parse localStorage.winInfo
  nww.show()
  nww.on 'close', ->
    process.nextTick -> nww.close true; return
    if opener
      (fw = opener.D.floatingWindows).splice fw.indexOf(nww), 1
    else # save window state:
      localStorage.winInfo = JSON.stringify x: nww.x, y: nww.y, width: nww.width, height: nww.height
    window.onbeforeunload?(); window.onbeforeunload = null; return
  nww.zoomLevel = +localStorage.zoom || 0
  $ ->
    contextMenu = null
    $(document)
      .on 'keydown', '*', 'ctrl+= ctrl+shift+=', D.zoomIn    = -> localStorage.zoom = ++nww.zoomLevel;   false
      .on 'keydown', '*', 'ctrl+-',              D.zoomOut   = -> localStorage.zoom = --nww.zoomLevel;   false
      .on 'keydown', '*', 'ctrl+0',              D.resetZoom = -> localStorage.zoom = nww.zoomLevel = 0; false
      .on 'keydown', '*', 'f12', -> nww.showDevTools(); false
      .on 'contextmenu', (e) ->
        if !contextMenu
          contextMenu = new gui.Menu
          ['Cut', 'Copy', 'Paste'].forEach (x) ->
            contextMenu.append new gui.MenuItem label: x, click: (-> document.execCommand x; return); return
        contextMenu.popup e.clientX, e.clientY
        false
    return

  # external editors (available only under nwjs)
  tmpDir = process.env.TMPDIR || process.env.TMP || process.env.TEMP || '/tmp'
  if editorExe = process.env.DYALOG_IDE_EDITOR || process.env.EDITOR
    D.openInExternalEditor = (text, line, callback) ->
      tmpFile = path.join tmpDir, "#{crypto.randomBytes(8).toString 'hex'}.dyalog"
      callback0 = callback
      callback = (args...) -> fs.unlink tmpFile, -> callback0 args... # make sure to delete file before calling callback
      fs.writeFile tmpFile, text, {mode: 0o600}, (err) ->
        if err then callback err; return
        child = spawn editorExe, [tmpFile], cwd: tmpDir, env: $.extend {}, process.env,
          DYALOG_IDE_FILE: tmpFile
          DYALOG_IDE_LINE_NUMBER: 1 + line
        child.on 'error', callback
        child.on 'exit', (c, s) ->
          if c || s then callback('Editor exited with ' + if c then 'code ' + c else 'signal ' + s); return
          fs.readFile tmpFile, 'utf8', callback; return
        return
      return

  D.createSocket = ->
    class LocalSocket
      emit: (a...) -> @other.onevent data: a
      onevent: ({data}) -> (for f in @[data[0]] or [] then f data[1..]...); return
      on: (e, f) -> (@[e] ?= []).push f; @
    socket = new LocalSocket; socket1 = new LocalSocket; socket.other = socket1; socket1.other = socket
    setTimeout (-> Proxy() socket1), 1
    socket

  D.rideConnect = -> spawn process.execPath; return
  D.rideNewSession = -> spawn process.execPath, ['-s']; return
  D.quit = -> gui.Window.get().close(); return
  D.clipboardCopy = (s) -> gui.Clipboard.get().set s; return
  D.opts = nomnom.options(
    connect: abbr: 'c', flag: true, metavar: 'HOST[:PORT]'
    listen:  abbr: 'l', flag: true
    spawn:   abbr: 's', flag: true
  ).parse gui.App.argv

  # Mac menu
  if process.platform == 'darwin'
    groups = {} # group name -> array of MenuItem-s
    nwwMenu = new gui.Menu type: 'menubar'
    nwwMenu.createMacBuiltin 'Dyalog'
    nwwMenu.items[0].submenu.removeAt 0
    nww.menu = nwwMenu
    getItemByLabel = (menu, label) -> (for x in menu.items when x.label == label then return x); return

    render = (x) ->
      if !x then return
      if x == '-' then return new gui.MenuItem type: 'separator'
      h = # arguments to MenuItem's constructor
        label: x[''].replace /_/g, ''
        type: if x.group || x.checked? then 'checkbox' else 'normal'
      if x.key && x.action && !x.dontBindKey then $(document).on 'keydown', '*', x.key, -> x.action(); false
      if x.group
        h.checked = !!x.checked
        h.click = ->
          groups[x.group].forEach (sibling) -> sibling.checked = sibling == mi; return
          x.action?(); return
      else if x.checked?
        h.checked = !!x.checked; h.click = -> x.action? mi.checked; return
      else
        h.click = -> x.action?(); return
      if x.items then h.submenu = new gui.Menu; for y in x.items then h.submenu.append render y
      mi = new gui.MenuItem h
      if x.group then (groups[x.group] ?= []).push mi
      mi

    D.installMenu = (m) ->
      # try to merge new menu with existing menu:
      for x, ix in m
        ourMenu = render x
        theirMenu = if ix then getItemByLabel nww.menu, ourMenu.label else nww.menu.items[0]
        nww.menu.append ourMenu
        if theirMenu
          i = 0
          while ourMenu.submenu.items.length
            y = ourMenu.submenu.items[0]; ourMenu.submenu.remove y; theirMenu.submenu.insert y, i++
          theirMenu.submenu.insert new gui.MenuItem(type: 'separator'), i
          nww.menu.remove ourMenu
      return

  return
