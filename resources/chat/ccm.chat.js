ccm.component({name:"chat",config:{html:[ccm.store,{local:"http://akless.github.io/ccm-developer/resources/chat/templates.json"}],key:"test",store:[ccm.store,{url:"ws://ccm2.inf.h-brs.de/index.js",store:"chat"}],style:[ccm.load,"http://akless.github.io/ccm-developer/resources/chat/style.css"],user:[ccm.instance,"https://kaul.inf.h-brs.de/ccm/components/user2.js"]},Instance:function(){var e=this;this.init=function(t){e.store.onChange=function(){e.render()},t()},this.render=function(t){var s=ccm.helper.element(e);e.store.get(e.key,function(c){function n(c){s.html(ccm.helper.html(e.html.get("main")));for(var n=ccm.helper.find(e,".messages"),r=0;r<c.messages.length;r++){var m=c.messages[r];n.append(ccm.helper.html(e.html.get("message"),{name:ccm.helper.val(m.user),text:ccm.helper.val(m.text)}))}n.append(ccm.helper.html(e.html.get("input"),{onsubmit:function(){var t=ccm.helper.val(ccm.helper.find(e,"input").val()).trim();if(""!==t)return e.user.login(function(){c.messages.push({user:e.user.data().key,text:t}),e.store.set(c,function(){e.render()})}),!1}})),t&&t()}null===c?e.store.set({key:e.key,messages:[]},n):n(c)})}}});