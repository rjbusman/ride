require './menu'
about = require './about'
prefs = require './prefs'
Editor = require './editor'
Session = require './session'
keymap = require './keymap'
require '../lbar/lbar'
require '../jquery.layout'

module.exports = ->
  $('body').html $ide = $ """
    <div class="ide">
      <div class="lbar ui-layout-north" style="display:none">
        <a class="lbar-prefs" title="Preferences" href="#"></a>
        #{D.lbarHTML}
      </div>
      <div class="lbar-tip" style="display:none"><div class="lbar-tip-desc"></div><pre class="lbar-tip-text"></pre></div>
      <div class="lbar-tip-triangle" style="display:none"></div>
      <div class="ui-layout-center"></div>
      <div class="ui-layout-east" ><ul></ul></div>
      <div class="ui-layout-south"><ul></ul></div>
    </div>
  """

  isDead = 0
  pending = [] # lines to execute: AtInputPrompt consumes one item from the queue, HadError empties it

  emit = (x, y) -> D.socket.emit x, y; return

  WI = -> emit 'WeakInterrupt'; return
  SI = -> emit 'StrongInterrupt'; return

  D.wins = wins = # window id -> instance of Editor or Session
    0: D.session = session = Session $('.ui-layout-center'),
      id: 0
      edit: (s, i) -> emit 'Edit', win: 0, pos: i, text: s
      autocomplete: (s, i) -> emit 'Autocomplete', line: s, pos: i, token: 0
      exec: (lines, trace) ->
        if lines && lines.length
          if !trace then pending = lines[1..]
          emit 'Execute', {trace, text: lines[0] + '\n'}
        return
      weakInterrupt: WI

  # Tab management
  tabOpts = activate: (_, ui) -> (widget = wins[+ui.newTab.attr('id').replace /\D+/, '']).updateSize(); widget.focus(); return
  $tabs = $('.ui-layout-east, .ui-layout-south').tabs tabOpts
  refreshTabs = ->
    $tabs.each -> $t = $ @; if !$('li', $t).length then ['east', 'south'].forEach (d) -> (if $t.is '.ui-layout-' + d then layout.close d); return
         .tabs 'refresh'
    return
  ($uls = $tabs.find 'ul').each ->
    $(@).sortable
      cursor: 'move', containment: 'parent', tolerance: 'pointer', axis: 'x', revert: true
      receive: (_, ui) ->
        $(@).closest('.ui-tabs').append $ '#win' + ui.item.attr('id').replace /\D+/, ''
        $tabs.tabs('destroy').tabs tabOpts
        return
      stop: (_, ui) ->
        refreshTabs()
        $('[role=tab]', $tabs).attr 'style', '' # clean up tabs' z-indices after dragging, $().sortable screws them up
        return
    .data('ui-sortable').floating = true # workaround for a jQueryUI bug, see http://bugs.jqueryui.com/ticket/6702#comment:20
    return

  popWindow = (w) ->
    if !opener && !isDead
      {width, height, x, y} = prefs.floatingWindowInfos()[w] || width: 500, height: 400
      spec = "width=#{width},height=#{height},resizable=1"; if x? then spec += ",left=#{x},top=#{y},screenX=#{x},screenY=#{y}"
      if pw = open "?win=#{w}", '_blank', spec
        if x? then pw.moveTo x, y
        $("#wintab#{w},#win#{w}").remove(); $tabs.tabs('destroy').tabs tabOpts; refreshTabs(); session.scrollCursorIntoView()
        # wins[w] will be replaced a bit later by code running in the popup
      else
        $.alert 'Popups are blocked.'
    return

  host = port = wsid = ''
  prefs.windowTitle updateTitle = -> # add updateTitle() as a change listener for preference "windowTitle"
    ri = D.remoteIdentification || {}; v = D.versionInfo
    $('title').text prefs.windowTitle().replace /\{(\w+)\}/g, (g0, g1) ->
      switch g1.toUpperCase()
        when 'WSID'       then wsid || ''
        when 'HOST'       then host || ''
        when 'PORT'       then port || ''
        when 'PID'        then ri.pid || ''
        when 'CHARS'      then (ri.arch || '').split('/')[0] || ''
        when 'BITS'       then (ri.arch || '').split('/')[1] || ''
        when 'VER_A'      then (ri.version || '').split('.')[0] || ''
        when 'VER_B'      then (ri.version || '').split('.')[1] || ''
        when 'VER_C'      then (ri.version || '').split('.')[2] || ''
        when 'VER'        then ri.version || ''
        when 'RIDE_VER_A' then (v.version || '').split('.')[0] || ''
        when 'RIDE_VER_B' then (v.version || '').split('.')[1] || ''
        when 'RIDE_VER_C' then (v.version || '').split('.')[2] || ''
        when 'RIDE_VER'   then v.version || ''
        else g0
    return

  die = -> # don't really, just pretend
    if !isDead then isDead = 1; $ide.addClass 'disconnected'; for _, widget of wins then widget.die()
    return

  D.socket
    .on '*identify', (i) -> D.remoteIdentification = i; updateTitle(); return
    .on '*disconnected', ->
      if !isDead then $.alert 'Interpreter disconnected', 'Error'; die()
      return
    .on 'Disconnect', ({message}) ->
      if !isDead
        die()
        if message == 'Dyalog session has ended'
          window.close(); process?.exit? 0
        else
          $.alert message, 'Interpreter disconnected'
      return
    .on 'SysError', ({text}) -> $.alert text, 'SysError'; die(); return
    .on 'InternalError', ({error, dmx}) -> $.alert "error: #{error}, dmx: #{dmx}", 'Internal Error'; die(); return
    .on 'UpdateDisplayName', (a) -> wsid = a.displayName; updateTitle(); return
    .on 'EchoInput', ({input}) -> session.add input
    .on 'AppendSessionOutput', ({result}) -> session.add result
    .on 'NotAtInputPrompt', -> session.noPrompt()
    .on 'AtInputPrompt', ({why}) ->
      if pending.length then emit 'Execute', trace: 0, text: pending.shift() + '\n' else session.prompt why
      return
    .on 'HadError', -> pending.splice 0, pending.length; return
    .on 'FocusWindow', ({win}) -> $("#wintab#{win} a").click(); wins[win].focus(); return
    .on 'WindowTypeChanged', ({win, tracer}) -> wins[win].setDebugger tracer
    .on 'autocomplete', (token, skip, options) -> wins[token].autocomplete skip, options
    .on 'highlight', (win, line) -> wins[win].highlight line
    .on 'UpdateWindow', (ee) -> # "ee" for EditableEntity
      $("#wintab#{ee.token} a").text ee.name; wins[ee.token].open ee; session.scrollCursorIntoView(); return
    .on 'ReplySaveChanges', ({win, err}) -> wins[win]?.saved err
    .on 'CloseWindow', ({win}) ->
      $("#wintab#{win},#win#{win}").remove(); $tabs.tabs('destroy').tabs tabOpts; refreshTabs()
      wins[win].closePopup?(); delete wins[win]; session.scrollCursorIntoView(); session.focus(); return
    .on 'OpenWindow', (ee) -> # "ee" for EditableEntity
      layout.open dir = if ee.debugger then 'south' else 'east'
      w = ee.token
      $("<li id='wintab#{w}'><a href='#win#{w}'></a></li>").appendTo('.ui-layout-' + dir + ' ul').find('a').text ee.name
      $tabContent = $("<div class='win' id='win#{w}'></div>").appendTo('.ui-layout-' + dir)
      wins[w] = Editor $tabContent,
        id: w, name: ee.name, debugger: ee.debugger, emit: emit
        weakInterrupt: WI
        pop: -> popWindow w
        openInExternalEditor: D.openInExternalEditor
      wins[w].open ee
      $('.ui-layout-' + dir).tabs('refresh').tabs(active: -1)
        .data('ui-tabs').panels.off 'keydown' # prevent jQueryUI tabs from hijacking our keystrokes, <C-Up> in particular
      session.scrollCursorIntoView()
      if prefs.floatNewEditors() then session.focus(); popWindow w
      return

  # language bar
  $('.lbar-prefs').click -> prefs 'keyboard'; return
  $tip = $ '.lbar-tip'; $tipDesc = $ '.lbar-tip-desc'; $tipText = $ '.lbar-tip-text'; $tipTriangle = $ '.lbar-tip-triangle'
  ttid = null # tooltip timeout id
  $ '.lbar'
    .on 'mousedown', -> false
    .on 'mousedown', 'b', (e) -> (for _, widget of wins when widget.hasFocus() then widget.insert $(e.target).text()); false
    .on 'mouseout', 'b', -> clearTimeout ttid; ttid = null; $tip.add($tipTriangle).hide(); return
    .on 'mouseover', 'b', (e) ->
      clearTimeout ttid; $t = $ e.target; p = $t.position(); x = $t.text()
      ttid = setTimeout(
        ->
          ttid = null; key = keymap.reverse[x]
          keyText = if key && x.charCodeAt(0) > 127 then "Keyboard: #{prefs.prefixKey()}#{key}\n\n" else ''
          h = D.lbarTips[x] or [x, '']; $tipDesc.text h[0]; $tipText.text keyText + h[1]
          $tipTriangle.css(left: 3 + p.left + ($t.width() - $tipTriangle.width()) / 2, top: p.top + $t.height() + 2).show()
          x0 = p.left - 21; x1 = x0 + $tip.width(); y0 = p.top + $t.height()
          if x1 > $(document).width() then $tip.css(left: '', right: 0, top: y0).show()
          else $tip.css(left: Math.max(0, x0), right: '', top: y0).show()
          return
        200
      )
      return

  layout = $ide.layout
    defaults: enableCursorHotkey: 0
    north: spacing_closed: 0, spacing_open: 0, resizable: 0, togglerLength_open: 0
    east:  spacing_closed: 0, size: '0%', resizable: 1, togglerLength_open: 0
    south: spacing_closed: 0, size: '0%', resizable: 1, togglerLength_open: 0
    center: onresize: -> (for _, widget of wins then widget.updateSize()); session.scrollCursorIntoView(); return
    fxName: ''
  for d in ['east', 'south'] then layout.close d; layout.sizePane d, '50%'
  if !prefs.showLanguageBar() then layout.hide 'north'
  session.updateSize()

  themes = ['Modern', 'Redmond', 'Cupertino', 'Freedom'] # default is set in init.coffee to prevent FOUC
  themeClasses = themes.map (x) -> 'theme-' + x.toLowerCase()
  allThemeClasses = themeClasses.join ' '

  # zoom
  $('body').addClass "zoom#{prefs.zoom()}"
  prefs.zoom (z) ->
    for _, w of wins
      $b = $ 'body', w.getDocument()
      $b.prop 'class', "zoom#{z} " + $b.prop('class').split(/\s+/).filter((s) -> !/^zoom-?\d+$/.test s).join ' '
      w.refresh()
    return

  # demo mode
  demoLines = []; demoIndex = -1
  loadDemo = ->
    $ '<input id="loadDemoFile" type="file" style="display:none">'
      .appendTo 'body'
      .change ->
        if @value then D.readFile @value, 'utf8', (err, s) ->
          if err then console?.error? err; $.alert 'Cannot load demo file' else demoLines = s.split /\r?\n/; demoIndex = -1
          return
        return
      .trigger 'click'
    return
  nextLineFromDemo = -> (if demoIndex < demoLines.length - 1 then session.loadLine demoLines[++demoIndex]); return
  prevLineFromDemo = -> (if demoIndex > 0                    then session.loadLine demoLines[--demoIndex]); return

  # menu
  D.installMenu [
    (
      if D.nwjs
        {'': '_File', items:
          [
            {'': '_Connect...', action: D.rideConnect}
            {'': 'New _Session', key: 'Ctrl+N', action: D.rideNewSession}
            '-'
            {'': '_Load Demo...', action: loadDemo}
            {'': '_Next Line from Demo',     key: 'Ctrl+Shift+N', action: nextLineFromDemo}
            {'': '_Previous Line from Demo', key: 'Ctrl+Shift+P', action: prevLineFromDemo}
          ]
            .concat(
              if D.process?.platform != 'darwin' then [ # Mac's menu already has an item for Quit
                '-'
                {'': '_Quit', key: 'Ctrl+Q', action: D.quit}
              ] else []
            )
        }
    )
    {'': '_Edit', items: [
      {'': 'Preferences', action: prefs}
      '-'
      {'': 'Weak Interrupt',   action: WI}
      {'': 'Strong Interrupt', action: SI}
    ]}
    {'': '_View', items:
      [
        {'': 'Show Language Bar', checked: prefs.showLanguageBar(), action: (x) ->
          prefs.showLanguageBar x; layout[['hide', 'show'][+x]] 'north'; return}
        {'': 'Float New Editors', checked: prefs.floatNewEditors(), action: (x) ->
          prefs.floatNewEditors x; return}
        {'': 'Line Wrapping in Session', checked: session.getLineWrapping(), action: (x) ->
          session.setLineWrapping x; return}
      ]
        .concat(
          if D.nwjs then [
            '-'
            {'': 'Zoom _In',    key: 'Ctrl+=', dontBindKey: 1, action: D.zoomIn}
            {'': 'Zoom _Out',   key: 'Ctrl+-', dontBindKey: 1, action: D.zoomOut}
            {'': '_Reset Zoom', key: 'Ctrl+0', dontBindKey: 1, action: D.resetZoom}
          ] else []
        )
        .concat [
          '-'
          {'': 'Theme', items: themes.map (x, i) ->
            '': x, group: 'themes', checked: $('body').hasClass(themeClasses[i]), action: ->
              prefs.theme x.toLowerCase(); $('body').removeClass(allThemeClasses).addClass themeClasses[i]; return
          }
        ]
    }
    {'': '_Help', items: [
      {'': '_About', key: 'Shift+F1', dontBindKey: 1, action: about}
    ]}
  ]

  setHostAndPort: (host1, port1) -> host = host1; port = port1; updateTitle(); return
