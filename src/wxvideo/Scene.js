import JSMpeg from './player/jsmpeg';

//console.log(JSMpeg);

import TransformMatirx from './TransformMatirx';

var Scene = function(sceneData,wonxAd){
	this._constr(sceneData,wonxAd);
};
Scene.prototype._constr = function(sceneData,wonxAd){
	//基础属性
	this.data;
	this.data = sceneData;

	this.id;
	this.id = sceneData.id;

	this.parent = wonxAd;

	//场景状态//1当前活动场景;0非当前活动场景
	this.status;
	this.status =0;

	//场景准备状态 //0不可播放；1可以播放; 2转码中；
	this.readyStatus;
	this.readyStatus =0;


	//场景是否播放
	this.playStatus;
	this.playStatus =0;

	//判断是不是自动跳转过来的，如果是，就要添加点击播放按钮
	this.autoJump = false;

	//用于存中间数据的变量
	//通用数据
	this.sceneDom;
	this.initSceneDom();

	this.imgDom;
	this.LoadImgDom;
	this.LoadImgDomToCanvas;
	this.isShow;
	this.imgLoaded;

	this.transformMatirx;//场景(原始图片)对于展示窗口（渲染画布）的旋转矩阵
	this.initTransformMatirx();

	//ios解决方案需要的中间变量
	this.videoDom;

	// 画布初始化
	this.initVideoCanvas();

	//andriod解决方案的中间变量
	this.sampleCount=0;
	this.currentSample = 0;
	this.currentPicture = 0;
	this.currentTime =0;
	this.drawPicture;
	this.buffWorker;
	//对外开放的控制器方法

	//记载场景	==  预加载场景但并不一定把当前场景设为活动场景
	this.load;

	//开始播放 ==  设置当前场景为活动场景
	this.loadFistScene;
	this.play;

	this.videomute = function(){
		var value = this;
		value.beginpaly = function(){};
		value.audioplayerControler = window.setInterval(function(){
				value.audioPlayer.currentTime = 0;
				try {
                    value.beginpaly();
                    } catch (e) {}
		}, 10);
	}

	//展示场景	== 	展示场景的图片和控件
	this.show;

	//展示控件层
	this.LoadStickers;

	//是否是第一个场景
	this.isFirstScenes;
	this.isVideoGreater = false;
	this.initPlayer;
	this.initWaterMark();
}

Scene.prototype.initWaterMark = function(){

	var sscale  = Math.min(this.parent.domWidth/this.data.imageFileNameWidth, this.parent.domHeight/this.data.imageFileNameHeight);
	var sceneLeft	=	(document.body.clientWidth -  this.data.imageFileNameWidth*sscale)/2;

	var self = this;

	var oneEditorHasTouched = false;

	if(self.parent.data.type=="model"){
	/*	pushHistory();  
        window.addEventListener("popstate", function(e) {  
              if(oneEditorHasTouched)  
                {  
                   var c= confirm("您确认返回吗？");
                   if(c){
                   		//wx.closeWindow();


                   		window.location.href="./postierList.html";

                   }
                }else{
                		window.location.href="./postierList.html";
                }  
                pushHistory();           
        }, false);  
		function pushHistory() {  
	        var state = {  
	            title: "title",  
	            url: "#"  
	        };  
	        window.history.pushState(state, "title", "#");  
	    }*/
	}
	this.data.editors.forEach(function(value, index, array) {
		var editor = document.createElement("div");
		editor.id = "editor"+index;//text-overflow:ellipsis;-o-text-overflow:ellipsis;white-space:nowrap;
		/*editor.style.cssText='overflow-x:hidden;width:100%;text-align:center;position:fixed;top:'+value.top*self.parent.scale+';z-index:999;'+'color:'+value.color+';left:'+(sceneLeft+value.left*self.parent.scale)+';width:'+value.width*self.parent.scale+2+'px;height:'+value.height*self.parent.scale+2000+'px;line-height:'+value.height*self.parent.scale+20000000+'px;font-size:'+value.fontsize*self.parent.scale+"px";*/
		editor.className = "editor";//overflow-x:auto;
		editor.dataset.fontSize = value.fontsize*self.parent.scale;
		editor.style.cssText='overflow:auto;width:100%;text-align:center;position:fixed;top:'+value.top*self.parent.scale+'px;z-index:999;'+'color:'+value.color+';left:'+(sceneLeft+value.left*self.parent.scale)+'px;width:'+(value.width*self.parent.scale+3)+'px;height:'+(value.height*self.parent.scale + 3) + 'px;line-height:'+(value.height*self.parent.scale+3)+'px;font-size:'+value.fontsize*self.parent.scale+'px;';

		console.log(value.height*self.parent.scale + 2000);


		editor.innerHTML = value.text;
		document.body.appendChild(editor);
		if(self.parent.data.type=="model"){

			

			var e_touchstart = 'ontouchstart' in window ?'touchstart':'mousedown';
			var textstyle = 'font-size:'+18+'px;line-height:'+32+'px;width:100%;border: 1px solid #B3B3B3;border-radius: 4px;';
			editor.addEventListener(e_touchstart,function(e){
				var oldFontSize = e.target.dataset.fontSize + "px";
				e.target.style.fontSize = oldFontSize;
				oneEditorHasTouched = true;
				self.player.pause();
				if(self.audioPlayer)self.audioPlayer.pause();
				document.getElementById("editorTips").innerHTML='<div style="background: #1b1b1b;opacity: 0.5;z-index: 999;position: fixed;left: 0px;right: 0px;top: 0px;bottom: 0px;"></div><div style="width: 280px;top: 50%; left: 50%; -webkit-transform: translateX(-50%) translateY(-50%);position: fixed;background: white;z-index: 1000;padding: 20px;text-align: center;"><div style="width: 100%;text-align: left;"><input id="itext" maxlength="30" style="'+textstyle+'" type="text" value="'+value.text+'" /></div><button type="button" id="lClose" style="margin-top:10px;border:none;font-size: 18px; height:36px;width:74px;background: #FF8B3E;border-radius: 36px;">预览</button></div>';
				document.getElementById("lClose").addEventListener(e_touchstart,function(){
					self.player.play();
					if(self.audioPlayer&&document.getElementById("voicebtn").style.display == "block"){self.audioPlayer.play();self.audioPlayer.currentTime=self.player.currentTime;}
					var data = document.getElementById("itext").value;
					value.text = data;
					document.getElementById("editor"+index).innerHTML = data;
					console.log($("#editor"+index).html());
					adjustEditor();
					document.getElementById("editorTips").innerHTML='';
				},false);
			},false);





		}
	});

	adjustEditor();
	function adjustEditor(){
		$(".editor").map(function(){
			var self = this;
			function adj(){
				if(self.offsetHeight<self.scrollHeight){
					self.style.fontSize = parseFloat(self.style.fontSize) - 1 + "px";
					adj();
				}
			}
			adj();
		});
	}
	if(self.parent.data.type=="model"){
			var get = function(name){
				return (function() {
					var paramStr = window.location.search.substr(1);
					var paramArr = new  Array({});
					var _paramArr = paramStr.split("&");
					for(var i in _paramArr){
						var n  =  _paramArr[i].split("=")[0];
						if(n){
							paramArr[n]=_paramArr[i].split("=")[1];
						}
					}
					return paramArr;
				})()[name];
			};


			var openid = get('openid');
			var mid = get('mid');
			if(!openid){
				window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx82738d80feb9f918&redirect_uri=http://api.touchfa.com/weidong/gettoken&response_type=code&scope=snsapi_base&state=sharemodel"+mid+"&connect_redirect=1#wechat_redirect";
			}
		


		var e_touchstart = 'ontouchstart' in window ?'touchstart':'mousedown';
	
		document.getElementById("modelbottom").addEventListener(e_touchstart,function(){
			var get = function(name){
				return (function() {
					var paramStr = window.location.search.substr(1);
					var paramArr = new  Array({});
					var _paramArr = paramStr.split("&");
					for(var i in _paramArr){
						var n  =  _paramArr[i].split("=")[0];
						if(n){
							paramArr[n]=_paramArr[i].split("=")[1];
						}
					}
					return paramArr;
				})()[name];
			};


			var openid = get('openid');

			console.log("openid",openid);

			if(openid){
				var allnull = true;
				for (var i = 0; i < self.data.editors.length; i++) {
					var editorstr = document.getElementById("editor"+i).innerHTML.replace(/\s+/g,"");
					if(editorstr.length>0){allnull=false;break;}
				}
				if(allnull)alert("模版文字不能为空");
				else{
					var allold = false;
					for (var i = 0; i < self.data.editors.length; i++) {
						var editorstr = document.getElementById("editor"+i).innerHTML.replace(/\s+/g,"");
						if(editorstr=="点击修改文案"){allnull=true;break;}
					}
					if(allnull)alert("请修改全部文案后，再生成海报");
					else{
						document.getElementById("modelbottom").innerHTML = "请稍候";
						var addposterurl = "http://api.touchfa.com/poster/add?modelid="+self.parent.data.model_id+"&author="+self.parent.data.author;
						var addposterxmlhttp;
						if (window.XMLHttpRequest){
							addposterxmlhttp=new XMLHttpRequest();
						}else{
							addposterxmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
						}
						addposterxmlhttp.onreadystatechange= function(){
							if (addposterxmlhttp.readyState==4 && addposterxmlhttp.status==200){
								var  data = JSON.parse(addposterxmlhttp.responseText);
								var posterid = data.data.poster.work_id;
								//console.log("aaa",'http://www.touchfa.com/acposter/wonxVideo.html?wid=5a333e3f31fc82f0d7b14713&type=setshare&openid='+self.parent.data.author);
								window.location.href = "./wonxVideo.html?pid="+posterid+"&type=setshare&openid="+self.parent.data.author;
							}
						};
						addposterxmlhttp.open('post',addposterurl,true);
						addposterxmlhttp.send('{"editors": '+JSON.stringify(self.data.editors)+'}');
					}
				}
			}else{
				window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx82738d80feb9f918&redirect_uri=http://api.touchfa.com/weidong/gettoken&response_type=code&scope=snsapi_base&state=sharemake&connect_redirect=1#wechat_redirect";
			}
		},false);
	}else if(self.parent.data.type=="play"){
		var makebtndiv = document.createElement("div");
		makebtndiv.id = "makebtndiv";

		var data_left = this.parent.data.mfmakebtn_left;
		var data_top = this.parent.data.mfmakebtn_top;
		var dh = document.body.clientHeight;
		var dw = document.body.clientWidth;
		var wh = this.parent.data.height;
		var ww = this.parent.data.width;
		var scale  = Math.min(dh/wh, dw/ww);
		var sl	=	(dw -  ww*scale)/2;
		var top =  data_top?((data_top*scale) + "px") : (dh-65+"px");
		var left = data_left?((data_left*scale + +sl-65*2*scale) + "px") : (dw/4-84+sl+"px");
		console.log("left",left);
		console.log("top",top);


		makebtndiv.style.cssText='position:fixed;width:'+130*scale*2+'px;left:'+left+';height:'+32*scale*2+'px;top:'+top+';z-index: 1000;';
		makebtndiv.innerHTML = '<div id="makebtn" style="text-align: center;border: 1px solid #FFFFFF;border-radius: 22px;width:'+130*scale*2+'px;height:'+32*scale*2+'px;font-size: 14px;color: #FFFFFF;letter-spacing: 0;line-height: '+32*scale*2+'px;">免费制作</div>';
		document.body.appendChild(makebtndiv);
		var showcode = document.createElement("div");
		showcode.id = "showcode";
		showcode.setAttribute('class','showcode');
		try{
			var QRCodepng = require('./img/QRCode.png');
		}catch(e){
			var QRCodepng = './package/img/QRCode.png';
		}
		showcode.innerHTML = '<div class="showtips"><img class="showcodeimg" src="'+QRCodepng+'"/><div class="showwords">请扫码，进入公众号制作</div><button class="closebutton">返回</button>></div><div class="showcodeback"></div>';
		document.body.appendChild(showcode);
		var e_touchstart = 'ontouchstart' in window ?'touchstart':'mousedown';
		makebtndiv.addEventListener(e_touchstart,function(){
			//document.getElementsByClassName("showcode")[0].style.display = "block";
			window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx82738d80feb9f918&redirect_uri=http://api.touchfa.com/weidong/gettoken&response_type=code&scope=snsapi_base&state=sharemake&connect_redirect=1#wechat_redirect";



		},false);
	     document.getElementsByClassName("closebutton")[0].addEventListener(e_touchstart,function(){
	     	document.getElementsByClassName("showcode")[0].style.display = "none";
	     },false);
	}else if(self.parent.data.type=="setshare"){
		console.log("setsharesetsharesetshare===");





	}

};



Scene.prototype.initSceneDom = function(){
	//创建sceneDom
	var scene = document.createElement("div");
	scene.id = "scene"+this.id;
	scene.style.cssText='position:absolute;top:0;left:0;z-index:1;right:0;bottom:0;';
	this.parent.scenesDom.appendChild(scene);
	this.sceneDom = scene;
};

Scene.prototype.initTransformMatirx = function(){
	var sscale  = Math.max(this.parent.workWidth/this.data.imageFileNameWidth, this.parent.workHeight/this.data.imageFileNameHeight);
	var sceneLeft	=	(this.parent.workWidth-  this.data.imageFileNameWidth*sscale)/2;
	var sceneTop	= 	(this.parent.workHeight - this.data.imageFileNameHeight*sscale)/2;
	this.transformMatirx = new TransformMatirx({
										rotation:false,//是否转90°
										scale : sscale,
										position:[sceneLeft,sceneTop],//画布原点坐标偏离值
										origin:[this.parent.workWidth,this.parent.workHeight]//作品尺寸
									});

};
Scene.prototype.initVideoCanvas= function(){
	if(!this.parent.isIpQQ){
		//创建一个画布用于渲染video
		var canvasheight= this.parent.canvasRelativePos.height;
		var canvasWidth= this.parent.canvasRelativePos.width;
		var canvasLeft = this.parent.canvasRelativePos.left;
		var canvasTop = this.parent.canvasRelativePos.top;
		var wonxVideoCanvas = document.createElement("canvas");
		wonxVideoCanvas.width = canvasWidth;
		wonxVideoCanvas.height = canvasheight;
		wonxVideoCanvas.style.cssText='position:absolute;width:'+canvasWidth+'px;height:'+canvasheight+'px;top:'+canvasTop+'px;left:'+canvasLeft+'px;z-index:100;background:rgba(0,0,0,1);display:none;';//
		this.parent.stage.appendChild(wonxVideoCanvas);
		this.videoCanvas =wonxVideoCanvas;
	}

};

Scene.prototype.initVideoDom = function(){
	if(this.parent.isIpQQ){
		//写入视频
		var video = document.createElement("video");
		video.id = "video"+ this.id;
		video.setAttribute("x-webkit-airplay",true);
		video.setAttribute("preload","preload");
		video.setAttribute("webkit-playsinline",true);
		video.setAttribute("playsinline",true);
		video.setAttribute("src",this.data.videoFileName);
		// video.setAttribute("poster",this.data.videoCoverFileName);
		video.style.cssText='position:absolute;';
		this.parent.stage.appendChild(video);
		this.videoDom = video;
	}
};

Scene.prototype.initPlayer = function(){
	var self = this;
	var  transcodingVideoFileName = this.data.transVideoHdTsFileName;

	if(self.parent.rotation){
		var s =	Math.max(self.data.transVideoHdFileWidth/self.parent.canvasRelativePos.height,
			self.data.transVideoHdFileHeight/self.parent.canvasRelativePos.width);
	}else{
		var s = Math.max(self.data.transVideoHdFileWidth/self.parent.canvasRelativePos.width,
		self.data.transVideoHdFileHeight/self.parent.canvasRelativePos.height);
	}
    this.hascontrol = true;
    this.videoCanvas.width = self.parent.canvasRelativePos.height;
	this.videoCanvas.height = self.parent.canvasRelativePos.width;
	this.player = new JSMpeg.Player(transcodingVideoFileName, {
					loop: !self.data.autoDelayLink,
                    ch: self.parent.canvasRelativePos.height,
                    cw: self.parent.canvasRelativePos.width,
                    s: s,
                    framesNum: parseInt(self.data.transVideoFrames),
                    backFun: self,
                    rotation:self.parent.rotation,
                    autoplay: false, canvas: self.videoCanvas});
	this.player.volume = 0;
	self.parent.processForward();
}


Scene.prototype.load =  function(){
	// 场景预加载
	this.initVideoDom();this.readyStatus = 1;
	var self =this;
	if(this.data.imageFileName&&!this.data.videoFileName){self.LoadImgDom();}else{self.parent.processForward();}
	if(!this.parent.isIpQQ){
		if(!this.data.videoFileName){//没有视频
			self.parent.processForward();
			if(self.canPlay){self.play();}
		}else{
			this.initPlayer();
			if(self.canPlay){self.play();}
		}

	}else{
		if(self.isFirstScenes){
			function backImgFunc(){
		        self.animate(function () {
			        self.parent.loadAll();
			        self.play();
			    });
	    	}
			self.loadFistScene(backImgFunc, backImgFunc);
		}else if(this.data.videoFileName){
			// 预加载在qq里面很卡，暂时弃用
			// self.videoDom.play();
			// self.videoDom.volume = 0;
			// self.preloadVideo = setInterval(function(){
			// 	if(self.videoDom.currentTime>0){
			// 		self.videoDom.pause();
			// 		window.clearInterval(self.preloadVideo);
					self.parent.processForward();
					self.parent.processForward();
			// 	}
			// },10);
			if(self.canPlay){self.play();}
		}else{if(self.canPlay){self.play();}}
	}

};
Scene.prototype.loadFistScene = function(backFunc, elseFunc){
	elseFunc();
}
Scene.prototype.play  =  function(){
	//修改场景状态
	var self = this;
    this.status = 1;
    if(self.readyStatus == 0){
    	this.canPlay = true;
    	this.load();return;
    }


	if(this.parent.isIpQQ){
		// 为了处理场景之间切换的时候的显示问题，这里x5和ios使用了把上一场景最后一帧绘制到videocanvas里去，点击后立即清除imgcanvas，这样保证了场景切换期间绝对不会有黑色或其他场景最后一帧出现
		// 普通浏览器使用webgl直接绘制图片不方便，就把imgcanvas和gif一直显示到webgl开始绘制，不过这样处理还是会闪一下，有待解决
		self.parent.imgCanvas.style.display="none";
	}

	if (self.playStatus == 1){
		return;
	}else if(!self.data.videoFileName){//没有视频的时候也是先显示封面
		self.playStatus=1;
		function backImgFunc(){
	        self.animate(function () {
	        	if(self.isFirstScenes){
	        		var firstCover = document.getElementById("FirstIosPlayerControlLayer");
					if(firstCover){
						window.document.body.removeChild(firstCover);
					}
	        	}
				self.parent.controlLayer.innerHTML = "";
				self.parent.clearClipboard();
			    self.parent.controlLayer.style.display = "none";
	            self.show();
	        });
    	}
    	if(self.isFirstScenes&&!self.parent.isIpQQ){
    		self.loadFistScene(backImgFunc, backImgFunc);
    	}else{
    		backImgFunc();
    	}
	}else if(self.readyStatus == 1){
		/*以下是播放代码*/
		self.playStatus=1;
		self.LoadImgDom();
		if(self.parent.isIpQQ){
			self.animate(function () {
				var video = self.videoDom;
				var timer;
				var catonTimer;
				var beginPlayLoading;
				self.playVideo=function() {
					video.currentTime = 0;
					video.volume = 1;
					var nowTime = 0;
					var hascontrol = true;
					var lastTime = 0;
					beginPlayLoading = window.setTimeout(function(){
						if(video.currentTime==0){
							self.parent.loadingDom.style.display="block";
						}
					}, 3000);
					catonTimer = window.setInterval(function(){
						if(video.currentTime==lastTime&&video.currentTime>0&&!hascontrol){
							self.parent.loadingDom.style.display="block";
						}else{
							lastTime = video.currentTime;
						}
					}, 5000);
					timer = window.setInterval(function(){
						if(video.currentTime>nowTime&&video.currentTime>0){
							if(self.parent.loadingDom.style.display!="none"){
								self.parent.loadingDom.style.display="none";
							}
							nowTime=video.currentTime;
							var ch = self.parent.canvasRelativePos.height*3;
							var cw = self.parent.canvasRelativePos.width*3;

							self.parent.videoCanvas.width = cw;//self.data.transVideoHdFileWidth;
							self.parent.videoCanvas.height =ch;// self.data.transVideoHdFileHeight;
							var ctx0 = self.parent.videoCanvas.getContext('2d');
							var h= height = self.data.transVideoHdFileHeight;
							var w= width = self.data.transVideoHdFileWidth;
							if(self.parent.rotation){
								ctx0.rotate(90*Math.PI/180);
								var s =	Math.max(w/ch,h/cw);
								ctx0.drawImage(video,0,0,w,h,(ch-w/s)/2,-(cw-h/s)/2-h/s,w/s,h/s);
								ctx0.rotate(-90*Math.PI/180);
							}else{
								var s =	Math.max(w/cw,h/ch);
								ctx0.drawImage(video,0,0,width,height,(cw-w/s)/2,(ch-h/s)/2,w/s,h/s);
							}
							if(hascontrol){
								if (self.isFirstScenes||self.autoJump){
									var firstCover = document.getElementById("FirstIosPlayerControlLayer");
									if(firstCover){
										window.document.body.removeChild(firstCover);
									}
									self.isFirstScenes=false;
									self.autoJump=false;
								}
								self.parent.controlLayer.innerHTML = "";
								self.parent.clearClipboard();
						    	self.parent.controlLayer.style.display = "none";
						    	hascontrol = false;
							}
						}
					},1000/50);
				}
				self.videoEnd=function(){
						window.clearInterval(catonTimer);
						window.clearInterval(timer);
						window.clearTimeout(beginPlayLoading);
						self.show();
				}
				video.addEventListener('play', self.playVideo, false);
				video.addEventListener('pause',function() {
						window.clearInterval(timer);
					},false);
				video.addEventListener('ended',self.videoEnd,false);
				// 这里需要一个浮层显示在第一个场景之前，点击开始播放作品
				function funcForMpeg(){
					video.play();
				}
				if(!self.isFirstScenes){
            		self.loadFistScene(funcForMpeg, funcForMpeg);
            	}else{
            		funcForMpeg();
            	}
			});
		}else{
			function funcForMpeg(){
				if(self.parent.inSafari){
					var e_touchstart = 'ontouchstart' in window ?'touchstart':'mousedown';
					//var voiceplace = "bottom:24;";
					//if(self.parent.data.type=="setshare")
					var voiceplace = "top:24;";
					var voicebtn = document.createElement("div");
					voicebtn.innerHTML='<div id="voicebtn" style="width: 30px;display:none;'+voiceplace+'position: fixed;z-index: 999;right: 5px;"><?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve"><metadata> Svg Vector Icons : http://www.sfont.cn </metadata><g><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"><path d="M4631.2,5015.7c-634.2-57.5-1212.8-212.7-1755.1-475.2c-546.1-264.4-894.8-513.5-1339.3-959.9c-446.4-446.4-676.4-766.4-948.4-1322.1c-231.8-469.4-367.9-914-454.1-1465.8c-46-308.5-46-1032.7,1.9-1341.2c90.1-586.3,239.5-1057.6,488.6-1548.1c254.8-496.3,494.3-822,912-1239.7c438.8-440.7,764.5-674.4,1302.9-938.9c343-168.6,567.1-252.9,915.9-344.9c1452.4-383.2,2981.4-76.6,4209.5,839.2c233.8,176.3,756.8,699.3,933.1,933.1C9909.8-1493,10170.4,202.7,9610.9,1779.6c-168.6,475.2-484.8,1032.7-812.4,1437c-187.8,231.8-609.3,640-837.3,810.5C7286.8,4532.9,6530,4849,5685,4979.3C5491.5,5008.1,4817,5033,4631.2,5015.7z M5437.8,4624.9c555.7-55.6,1046.2-197.3,1559.7-450.3c906.3-446.4,1601.8-1142,2050.1-2050.1C9381,1451.9,9534.3,746.8,9511.3-11.9c-21.1-687.8-161-1253.1-461.8-1868.1c-448.3-912-1161.1-1626.7-2071.2-2069.3c-440.7-214.6-822-335.3-1312.5-413.9c-337.2-55.6-971.4-59.4-1293.3-9.6c-965.7,149.4-1799.1,553.7-2498.5,1209c-588.2,553.7-1063.4,1370-1264.6,2167C48,1237.3,1241.7,3536.6,3383.8,4349C4029.5,4594.2,4755.7,4691.9,5437.8,4624.9z"/><path d="M4751.9,1683.8l-829.6-584.4h-546.1h-546.1l3.8-1172.6l5.7-1174.5l548-5.7l549.9-3.8l820.1-586.3l822-584.4l5.7,1168.8c1.9,641.9,1.9,1699.5,0,2349.1l-5.7,1180.3L4751.9,1683.8z M5202.1-883.7l-5.7-791.3L4612-1259.3l-584.4,415.8l-5.7,766.4l-3.8,766.4l588.2,411.9l590.1,413.9l5.7-802.8C5204.1,269.7,5204.1-446.9,5202.1-883.7z M3615.7-69.4V-855h-191.6h-191.6v785.6v785.6h191.6h191.6V-69.4z"/><path d="M6685.2,1699.1c-32.6-61.3-118.8-279.7-118.8-300.8c0-11.5,38.3-36.4,84.3-55.6c132.2-53.7,362.1-214.6,490.5-339.1c157.1-155.2,287.4-362.1,354.5-557.6c46-137.9,53.7-189.7,53.7-371.7c0-174.4-7.7-235.7-49.8-364c-128.4-390.9-436.9-718.5-862.2-915.9c-70.9-32.6-126.5-69-122.6-80.5c95.8-274,120.7-335.3,138-335.3c40.2,0,343,155.2,477.1,245.2c183.9,122.6,423.4,364.1,544.2,549.9c362.1,553.7,364,1228.2,5.7,1778.1c-176.3,268.2-444.5,511.6-751.1,680.2C6742.6,1733.6,6708.2,1743.2,6685.2,1699.1z"/><path d="M6489.7,808.1c-69-139.9-80.5-176.3-57.5-183.9c63.2-23,228-203.1,270.2-297c36.4-80.5,46-132.2,46-272.1c0-160.9-3.8-180.1-67.1-295.1c-59.4-111.1-218.4-270.2-270.2-270.2c-9.6,0-17.3-11.5-17.3-23c0-44.1,141.8-341.1,162.9-341.1c32.6,0,166.7,93.9,266.3,189.7c415.8,394.7,438.8,1048.1,49.8,1456.2c-84.3,86.2-252.9,212.7-287.4,212.7C6579.8,984.4,6535.7,905.9,6489.7,808.1z"/></g></g></svg></div>';
					document.body.appendChild(voicebtn);
					document.getElementById("voicebtn").addEventListener(e_touchstart,function(){
						document.getElementById("voicebtn").style.display = "none";
						document.getElementById("novoicebtn").style.display = "block";
						if(self.audioPlayer){self.audioPlayer.pause();}
						else{self.player.volume = 0;}
					},false);

					var novoicebtn = document.createElement("div");
					var dh = document.body.clientHeight;
					var dw = document.body.clientWidth;
					var wh = self.parent.data.height;
					var ww = self.parent.data.width;
					var scale  = Math.min(dh/wh, dw/ww);
					var sl	=	(dw -  ww*scale)/2 +5;



					novoicebtn.innerHTML='<div id="novoicebtn" style="width: 30px;display:block;'+voiceplace+'position: fixed;z-index: 999;right: '+sl+'px;"><?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve"><metadata> Svg Vector Icons : http://www.sfont.cn </metadata><g><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"><path d="M4631.2,5015.7c-634.2-57.5-1212.8-212.7-1755.1-475.2c-546.1-264.4-894.8-513.5-1339.3-959.9c-446.4-446.4-676.4-766.4-948.4-1322.1c-231.8-469.4-367.9-914-454.1-1465.8c-46-308.5-46-1032.7,1.9-1341.2c90.1-586.3,239.5-1057.6,488.6-1548.1c254.8-496.3,494.3-822,912-1239.7c438.8-440.7,764.5-674.4,1302.9-938.9c343-168.6,567.1-252.9,915.9-344.9c1452.4-383.2,2981.4-76.6,4209.5,839.2c233.8,176.3,756.8,699.3,933.1,933.1C9909.8-1493,10170.4,202.7,9610.9,1779.6c-168.6,475.2-484.8,1032.7-812.4,1437c-187.8,231.8-609.3,640-837.3,810.5C7286.8,4532.9,6530,4849,5685,4979.3C5491.5,5008.1,4817,5033,4631.2,5015.7z M5437.8,4624.9c555.7-55.6,1046.2-197.3,1559.7-450.3c906.3-446.4,1601.8-1142,2050.1-2050.1C9381,1451.9,9534.3,746.8,9511.3-11.9c-21.1-689.8-161-1255-463.7-1868.1c-582.5-1182.2-1640.1-2044.4-2921.9-2377.8c-645.7-168.6-1393-183.9-2073.2-44.1c-503.9,103.5-1126.6,364-1557.7,653.4C1471.6-2964.5,781.9-1924.1,551.9-720.9C140,1423.2,1341.3,3574.9,3383.8,4349C4029.5,4594.2,4755.7,4691.9,5437.8,4624.9z"/><path d="M5138.9,1681.8L4315,1099.4h-540.3h-542.2V-79v-1178.4h548h549.9l818.2-584.4c450.3-321.9,823.9-584.4,831.6-584.4c5.7,0,11.5,1055.8,11.5,2347.1c0,1291.4-5.7,2347.1-13.4,2345.2C5968.6,2266.2,5593,2003.7,5138.9,1681.8z M5589.2-79c0-869.9-5.7-1580.7-11.5-1580.7c-5.8,0-274,185.9-594,415.8l-582.5,413.8v758.8l1.9,758.8l578.6,406.2c318.1,222.3,584.4,406.2,594,406.2C5583.4,1501.7,5589.2,790.9,5589.2-79z M4018-69.4V-855h-201.2h-201.2v785.6v785.6h201.2H4018V-69.4z"/><path d="M6570.2,614.6l-138-139.9L6712,198.8L6991.7-79l-281.7-274l-281.7-275.9l130.3-132.2c72.8-72.8,139.9-132.2,151.4-132.2c11.5,0,139.9,120.7,287.4,268.2l268.2,268.2l272.1-272.1l274-274l138,139.9l139.9,137.9l-274,274L7543.5-79l277.8,277.8l277.8,277.8l-143.7,143.7l-143.7,143.7L7534,486.2l-277.8-277.8l-274,274l-272.1,272.1L6570.2,614.6z"/></g></g></svg><div>';
					document.body.appendChild(novoicebtn);
					document.getElementById("novoicebtn").addEventListener(e_touchstart,function(){
						document.getElementById("novoicebtn").style.display = "none";
						document.getElementById("voicebtn").style.display = "block";
						if(self.audioPlayer){self.audioPlayer.play();self.audioPlayer.currentTime=self.player.currentTime;}
						else{self.player.volume = 1;}
					},false);
				}
				if(self.isFirstScenes){
					self.parent.scenes.forEach(function(value, index, array) {
						if(!value.audioPlayer&&self.parent.inSafari&&!self.parent.isIpQQ&&value.data.transVideoMp3FileName){
							var audio= new Audio(value.data.transVideoMp3FileName);
							// audio.play();
							value.audioPlayer = audio;
						}
					});
				}
				if(self.parent.loadingDom.style.display!="none"){
					self.parent.loadingDom.style.display="none";
				}
				self.hascontrol = true;
				self.playerlastTime  = 0;
	            if(self.audioPlayer){
	            	window.clearInterval(self.audioplayerControler);
					self.player.currentTime = 0;
					self.player.volume = 1;
		            self.player.play();
	            	self.audioPlayer.currentTime = self.player.currentTime;
	            	self.audioPlayer.loop = !self.data.autoDelayLink;
	            	self.audioPlayer.muted = false;
		            self.videoCanvas.style.display="block";
		            self.audioHasPlayed = true;
	            }else{
					self.player.currentTime = 0;
					self.player.volume = 1;
		            self.player.play();
		            self.videoCanvas.style.display="block";
	        	}
	        }
            self.loadFistScene(funcForMpeg, funcForMpeg);

		}

	}
};

Scene.prototype.LoadStickers = function(){
    //展示完最后一帧后显示控件层
    // self.parent.controlLayer.style.display = "block";
    self = this;
	self.readyStatus = 0;
    self.parent.imgCanvas.style.display="block";

    var wonxEventListenerDev = document.createElement("div");
	wonxEventListenerDev.id = "wonxEventListenerDev";
	wonxEventListenerDev.style.cssText='width: 100%; height: 100%; top: 0px; left: 0px; background: rgba(0, 0, 0, 0); color: rgb(255, 255, 255);';
	self.parent.controlLayer.appendChild(wonxEventListenerDev);
	if(self.isFirstScenes&&!self.data.videoFileName){
		self.backScene = function(){
			self.parent.scenes.forEach(function(value, index, array) {
				if(!value.audioPlayer&&self.parent.inSafari&&!self.parent.isIpQQ&&value.data.transVideoMp3FileName){
					var audio= new Audio(value.data.transVideoMp3FileName);
					audio.muted = true;
		        	audio.volume = 0;
					audio.play();
					value.audioPlayer = audio;
				}
			});
		}
	}else{self.backScene = function(){}}
    //展示完最后一帧后显示控件层
    self.parent.controlLayer.style.display = "block";
	//  在wonxAd的controlLayer上插入 ，插入stickers
	var stickers =this.data.stickers;
	stickers.forEach(function(value, index, array) {
		var config = {
			data:value,
			dom:self.parent.controlLayer,
			adTransform:self.parent.transformMatirx,
			scTransform:self.transformMatirx,
			scenes:self.parent.scenes,
			backScene: self.backScene,
			index: index.toString()+self.data.id
		}

		var sticker = new Sticker(config);
	});
};


Scene.prototype.LoadImgDom = function(){
	if (!this.imgDom){
		var wonxSceneCanvas = document.createElement("canvas");
		wonxSceneCanvas.id = "sceneCanvas"+ this.id;
		wonxSceneCanvas.style.cssText='position:absolute;z-index:1;';
		this.sceneDom.appendChild(wonxSceneCanvas);
		var imageFileName = this.data.imageFileName;
		var image = new Image();
		image.src = imageFileName;
		self = this;
		image.onload = function(){
			wonxSceneCanvas.width = image.width;
			wonxSceneCanvas.height = image.height;
			wonxSceneCanvas.getContext('2d').drawImage(image,0,0,image.width,image.height);
			this.imgLoaded=true;
			if(this.isShow){
				this.LoadImgDomToCanvas();
				this.isShow=false;
			}
			this.parent.processForward();
		}.bind(this);
		this.imgDom = wonxSceneCanvas;
	}
};
Scene.prototype.LoadImgDomToCanvas = function(){
	self = this;
	if(this.data.stickers.length>0){

		var width 	=	this.parent.canvasRelativePos.width *2;
		var height 	=	this.parent.canvasRelativePos.height *2;
		var ctx 	=	this.parent.imgCanvas.getContext("2d");

		self.parent.imgCanvas.width = width;
		self.parent.imgCanvas.height =height;

		var ch = height;
		var cw = width;
		var h,w;
		//if(this.parent.rotation){var h = cw;var w = ch;}else{var h = ch;var w = cw;}
		if(this.imgDom.width){
			h=  this.imgDom.height;
			w= 	this.imgDom.width;
		}else{
			h= height ;
			w= width ;
		}



	 	if(this.parent.rotation){//需要旋转
			ctx.rotate(90*Math.PI/180);

			//ctx.drawImage(this.imgDom,0,0,this.imgDom.width,this.imgDom.height,0,-this.imgDom.width,this.imgDom.height,this.imgDom.width);
			//1.渲染高度 w/s. 2.渲染宽度 h／s
			var s =	Math.max(w/ch,h/cw);
			ctx.drawImage(this.imgDom,0,0,this.imgDom.width,this.imgDom.height,(ch-w/s)/2,-(cw-h/s)/2-h/s,w/s,h/s);

			ctx.rotate(-90*Math.PI/180);
		}else{
			//ctx.drawImage(this.imgDom,0,0,this.imgDom.width,this.imgDom.height);

			var s =	Math.max(w/cw,h/ch);
			ctx.drawImage(this.imgDom,0,0,this.imgDom.width,this.imgDom.height,(cw-w/s)/2,(ch-h/s)/2,w/s,h/s);
		}
		if(this.parent.isIpQQ){
			var ctx0 	=	self.parent.videoCanvas.getContext('2d');
			if(self.parent.rotation){//需要旋转
				ctx0.rotate(90*Math.PI/180);
				ctx0.drawImage(this.imgDom,0,0,this.imgDom.width,this.imgDom.height,0,-self.parent.videoCanvas.width,self.parent.videoCanvas.height,self.parent.videoCanvas.width);
				ctx0.rotate(-90*Math.PI/180);
			}else{
				ctx0.drawImage(this.imgDom,0,0,self.parent.videoCanvas.width,self.parent.videoCanvas.height);


			}
		}
	}else{
		var width 	=	this.parent.canvasRelativePos.width*3;
		var height 	=	this.parent.canvasRelativePos.height*3;
		var ctx 	=	this.parent.imgCanvas.getContext("2d");
		self.parent.imgCanvas.width = width;
		self.parent.imgCanvas.height = height;
		var ch = height;
		var cw = width;
		if(this.parent.rotation){var h = cw;var w = ch;}else{var h = ch;var w = cw;}
		if(this.imgDom.width){
			var h= height = this.imgDom.height;
			var w= width = this.imgDom.width;
		}
		if(this.parent.rotation){//需要旋转
			ctx.rotate(90*Math.PI/180);
			var s =	Math.max(w/ch,h/cw);
			ctx.drawImage(this.imgDom,0,0,this.imgDom.width,this.imgDom.height,(ch-w/s)/2,-(cw-h/s)/2-h/s,w/s,h/s);
			ctx.rotate(-90*Math.PI/180);
		}else{
			var s =	Math.max(w/cw,h/ch);
			ctx.drawImage(this.imgDom,0,0,this.imgDom.width,this.imgDom.height,(cw-w/s)/2,(ch-h/s)/2,w/s,h/s);
		}
		if(this.parent.isIpQQ){
			var ctx0 	=	self.parent.videoCanvas.getContext('2d');
			var ch = self.parent.videoCanvas.height;
			var cw = self.parent.videoCanvas.width;

 			if(self.parent.rotation){//需要旋转
				ctx0.rotate(90*Math.PI/180);
				var s =	Math.max(w/ch,h/cw);
				ctx0.drawImage(this.imgDom,0,0,this.imgDom.width,this.imgDom.height,(ch-w/s)/2,-(cw-h/s)/2-h/s,w/s,h/s);
				ctx0.rotate(-90*Math.PI/180);
			}else{
				var s =	Math.max(w/cw,h/ch);
				ctx0.drawImage(this.imgDom,0,0,this.imgDom.width,this.imgDom.height,(cw-w/s)/2,(ch-h/s)/2,w/s,h/s);
			}
		}
	}

}
Scene.prototype.show = function(){


};

//转场动画
Scene.prototype.animate = function(callback){callback();};


export default Scene;


