'use strict'
var fs=require('fs'),net=require('net'),os=require('os'),path=require('path'),cp=require('child_process')
var log;(function(){
  // record no more than N log messages per T milliseconds; at any moment, there have been n messages since time t
  var stdoutOK=1,N=500,T=1000,n=0,t=0,t0=+new Date
  log=exports.log=function(s){
    var t1=+new Date;if(t1-t>T){t=t1;n=1} // if last message was too long ago, start counting afresh
    var m= ++n<N ? (t1-t0)+' '+s+'\n' : n===N ? '... logging temporarily suppressed\n' : 0; if(!m)return
    if(stdoutOK)try{process.stdout&&process.stdout.write&&process.stdout.write(m)}catch(_){stdoutOK=0}
    var l=log.listeners.slice(0);for(var i=0;i<l.length;i++)l[i](m) // call listeners; prevent concurrent modification
  }
  log.listeners=[]
  var f=process.env.RIDE_LOG
  if(f){ // if $RIDE_LOG is present, also log to a file (in addition to stdout)
    var h=process.env.HOME||process.env.USERPROFILE;if(h)f=path.resolve(h,f)
    fd=fs.openSync(f,'a');log.listeners.push(function(s){var b=Buffer(m);fs.writeSync(fd,b,0,b.length)})
  }
  if(typeof window!=='undefined'){ // are we running under NW.js as opposed to just NodeJS?
    var i=0,a=Array(1000)          // if so, store latest log messages in RAM
    log.get=function(){return a.slice(i).concat(a.slice(0,i))}
    log.listeners.push(function(s){a[i++]=s;i%=a.length})
  }
  log(new Date().toISOString())
}())
var clt,   // client, TCP connection to interpreter
    skt,   // websocket or other connection-like object for communicating with the browser
    child, // a ChildProcess instance, the result from spawn()
    srv    // server, used to listen for connections from interpreters
function trunc(s){return s.length>1000?s.slice(0,997)+'...':s}
function ls(x){return fs.readdirSync(x)}
function sil(f){return function(x){try{f(x)}catch(_){}}} // exception silencer
function shEsc(x){return"'"+x.replace(/'/g,"'\\''")+"'"} // shell escape
function parseVer(s){return s.split('.').map(function(x){return+x})}
function toInterpreter(s){
  if(clt){log('send '+trunc(s));var b=Buffer('xxxxRIDE'+s);b.writeInt32BE(b.length,0);clt.write(b)}
}
function cmd(c,h){toInterpreter(JSON.stringify([c,h||{}]))} // c:command name, h:arguments as a JS object
function toBrowser(x,y){log('to browser:'+trunc(JSON.stringify([x,y])));skt&&skt.emit(x,y)}
function initInterpreterConn(){
  var q=Buffer(0)
  clt.on('data',function(x){
    q=Buffer.concat([q,x]);var n
    while(q.length>=4&&(n=q.readInt32BE(0))<=q.length){
      var m=''+q.slice(8,n);q=q.slice(n);log('recv '+trunc(m))
      if(m[0]==='['){var u=JSON.parse(m);skt&&skt.emit(u[0],u[1])}
    }
  })
  clt.on('error',function(e){toBrowser('*error',{msg:''+e});clt=null})
  clt.on('end',function(){log('interpreter diconnected');toBrowser('*disconnected');clt=null})
  toInterpreter('SupportedProtocols=1');toInterpreter('UsingProtocol=1')
  cmd('Identify',{identity:1});cmd('Connect',{remoteId:2});cmd('GetWindowLayout')
}
var handlers={
  '*connect':function(x){
    var m=net,o={host:x.host,port:x.port}
    if(x.ssl){
      m=require('tls');o.rejectUnauthorized=false
      if(x.cert)try{o.key=fs.readFileSync(x.cert)}catch(e){toBrowser('*error',{msg:e.message});return}
    }
    clt=m.connect(o,function(){
      if(x.ssl&&x.subj){
        var s=clt.getPeerCertificate().subject.CN
        if(s!==x.subj){
          toBrowser('*error',{msg:
            'Wrong server certificate name.  Expected:'+JSON.stringify(x.subj)+', actual:'+JSON.stringify(s)})
          return
        }
      }
      toBrowser('*connected',x);initInterpreterConn()
    })
  },
  '*launch':function(x){
    var exe=(x||{}).exe||process.env.RIDE_INTERPRETER_EXE||'dyalog'
    srv=net.createServer(function(c){
      log('spawned interpreter connected');var a=srv.address();srv&&srv.close();srv=null;clt=c
      toBrowser('*connected',{host:a.address,port:a.port});initInterpreterConn()
      if(typeof window!=='undefined')window.D.lastSpawnedExe=exe
    })
    srv.on('error',function(err){log('listen failed: '+err);srv=clt=null;toBrowser('*error',{msg:''+err})})
    srv.listen(0,'127.0.0.1',function(){
      var a=srv.address(),hp=a.address+':'+a.port
      log('listening for connections from spawned interpreter on '+hp)
      log('spawning interpreter '+JSON.stringify(exe))
      var args=['+s','-q'],stdio=['pipe','ignore','ignore']
      if(/^win/i.test(process.platform)){args=[];stdio[0]='ignore'}
      try{
        var h=x.env||{},H=process.env;for(var k in H)h[k]=H[k];h.RIDE_INIT='CONNECT:'+hp;h.RIDE_SPAWNED='1'
        child=cp.spawn(exe,args,{stdio:stdio,env:h})
      }catch(e){
        toBrowser('*error',{code:0,msg:''+e});return
      }
      toBrowser('*spawned',{exe:exe,pid:child.pid})
      child.on('error',function(err){
        srv&&srv.close();srv=clt=child=null
        toBrowser('*error',{code:err.code,msg:err.code==='ENOENT'?"Cannot find the interpreter's executable":''+err})
      })
      child.on('exit',function(code,sig){
        srv&&srv.close();srv=clt=null;toBrowser('*spawnedExited',{code:code,sig:sig});child=null
      })
    })
  },
  '*ssh':function(x){
    var c=new(require('ssh2').Client)
    c.on('ready',function(){
      c.exec('/bin/sh',function(err,sm){if(err)throw err
        sm.on('close',function(code,sig){toBrowser('*sshExited',{code:code,sig:sig});c.end()})
        c.forwardIn('',0,function(err,remotePort){if(err)throw err
          var s='';for(var k in x.env)s+=k+'='+shEsc(x.env[k])+' '
          sm.write(s+'RIDE_INIT=CONNECT:127.0.0.1:'+remotePort+' '+shEsc(x.exe||'dyalog')+' +s -q >/dev/null\n')
        })
      })
    })
    .on('tcp connection',function(info,accept){
      clt=accept();toBrowser('*connected',{host:'',port:0});initInterpreterConn()
    })
    .on('error',function(x){toBrowser('*error',{msg:x.message||''+x})})
    .connect({host:x.host,port:x.port,username:x.user,password:x.pass})
  },
  '*listen':function(x){
    srv=net.createServer(function(c){
      var t,rhost=c&&(t=c.request)&&(t=t.connection)&&t.remoteAddress
      log('interpreter connected from '+rhost);srv&&srv.close();srv=null;clt=c
      toBrowser('*connected',{host:rhost,port:x.port});initInterpreterConn()
    })
    srv.on('error',function(err){srv=null;toBrowser('*error',{msg:''+err})})
    srv.listen(x.port,x.host||'',function(){log('listening on port '+x.port);x.callback&&x.callback()})
  },
  '*listenCancel':function(){srv&&srv.close()},
  '*getProxyInfo':function(){
    // List available interpreter executables, possible paths are:
    //   C:\Program Files\Dyalog\Dyalog APL $VERSION\dyalog.exe
    //   C:\Program Files\Dyalog\Dyalog APL $VERSION unicode\dyalog.exe
    //   C:\Program Files\Dyalog\Dyalog APL-64 $VERSION\dyalog.exe
    //   C:\Program Files\Dyalog\Dyalog APL-64 $VERSION unicode\dyalog.exe
    //   C:\Program Files (x86)\Dyalog\Dyalog APL $VERSION\dyalog.exe
    //   C:\Program Files (x86)\Dyalog\Dyalog APL $VERSION unicode\dyalog.exe
    //   /opt/mdyalog/$VERSION/[64|32]/[classic|unicode]/mapl
    //   /Applications/Dyalog-$VERSION/Contents/Resources/Dyalog/mapl
    var r={interpreters:[],platform:process.platform} // proxy info (the result)
    if(/^win/.test(r.platform)){
      try{
        cp.exec('reg query "HKEY_CURRENT_USER\\Software\\Dyalog" /s /v localdyalogdir',{timeout:2000},function(err,s){
          var b,v,u,m // b:bits,v:version,u:edition,m:match object
          err||s.split('\r\n').forEach(function(l){if(l){ // l:current line
            if(m=/^HK.*\\Dyalog APL\/W(-64)? (\d+\.\d+)( Unicode)?$/i.exec(l)){
              b=m[1]?64:32;v=m[2];u=m[3]?'unicode':'classic'
            }else if(v&&(m=/^ *localdyalogdir +REG_SZ +(\S.*)$/i.exec(l))){
              r.interpreters.push({exe:m[1]+'dyalog.exe',version:parseVer(v),bits:b,edition:u})
            }else if(!/^\s*$/.test(l)){
              b=v=u=null
            }
          }})
          toBrowser('*proxyInfo',r)
        })
      }catch(ex){
        console.error(ex);toBrowser('*proxyInfo',r)
      }
    }else if(r.platform==='darwin'){
      try{
        var a='/Applications'
        ls(a).forEach(function(x){
          var m=/^Dyalog-(\d+\.\d+)\.app$/.exec(x), exe=a+'/'+x+'/Contents/Resources/Dyalog/mapl'
          m&&fs.existsSync(exe)&&r.interpreters.push({exe:exe,version:parseVer(m[1]),bits:64,edition:'unicode'})
        })
      }catch(_){}
      toBrowser('*proxyInfo',r)
    }else{
      try{
        var a='/opt/mdyalog'
        ls(a).forEach(sil(function(v){if(/^\d+\.\d+/.test(v))
          ls(a+'/'+v).forEach(sil(function(b){if(b==='32'||b==='64')
            ls(a+'/'+v+'/'+b).forEach(sil(function(u){if(u==='unicode'||u==='classic'){
              var exe=a+'/'+v+'/'+b+'/'+u+'/mapl'
              fs.existsSync(exe)&&r.interpreters.push({exe:exe,version:parseVer(v),bits:+b,edition:u})
            }}))
          }))
        }))
      }catch(_){}
      toBrowser('*proxyInfo',r)
    }
  },

  // todo: remove fake tree events after the real ones are implemented in the interpreter
  TreeList:function(x){
    setTimeout(function(){
      var n=2*(x.nodeId||1)
      toBrowser('ReplyTreeList',{nodeId:x.nodeId,children:[{id:n,name:'a'+n,type:1},{id:n+1,name:'a'+(n+1),type:1}]})
    },Math.random()*2000)
  }
}
this.Proxy=function(){
  return function(x){
    log('browser connected')
    ;(skt=x).onevent=function(x){
      x.data[0][0]==='*'&&log('from browser:'+trunc(JSON.stringify(x.data)))
      var f=handlers[x.data[0]];f?f(x.data[1]):cmd(x.data[0],x.data[1]||{})
    }
    child&&toBrowser('*spawned',{pid:child.pid})
  }
}
