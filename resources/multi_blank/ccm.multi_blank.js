ccm.component({name:"multi_blank",config:{component:[ccm.component,"http://akless.github.io/ccm-developer/resources/blank/ccm.blank.js"],times:5},Instance:function(){this.render=function(e){for(var n=ccm.helper.element(this).html(""),t=1;t<=this.times;t++){var c=this.index+"-"+t;n.append('<div id="'+c+'"></div>'),this.component.render(jQuery("#"+c))}e&&e()}}});