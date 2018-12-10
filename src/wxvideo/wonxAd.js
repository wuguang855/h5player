import TransformMatirx from './TransformMatirx';
import Scene from './Scene';



var domPosition	=	function(element) {
	var position   ={
						width:0,
						height:0,
						left:0,
						top:0
					};
	position.left = element.offsetLeft;
	position.top = element.offsetTop;
	var parent = element.offsetParent;
	while (parent !== null) {
		position.left += parent.offsetLeft;
		position.top += parent.offsetTop;
		parent = parent.offsetParent;
	}
	var t = document.documentElement.scrollTop || document.body.scrollTop;
	var l = document.documentElement.scrollLeft || document.body.scrollLeft;
	position.left -= l;
	position.top -= t;
	position.width = element.offsetWidth;
	position.height = element.offsetHeight;
	return position;
};

var WonxAd = function(options){
	var options_ = options || {};
	var self = this;
	this.toptip = 0;
	//广告运行的DOM元素
	this.dom =  options.dom;
	this.dom.width = window.innerWidth;
	this.dom.height = window.innerHeight;
	//元素的尺寸和相对于窗口的位置
	this.domRelativePos;
	//广告的格式化数据
	this.data =  options.data;

	//是否在苹果系统里运行
	this.inSafari = window.navigator.userAgent.toLowerCase().match(/iphone/i)=="iphone" || window.navigator.userAgent.toLowerCase().match(/ipad/i)=="ipad";
	//是否在微信里面
	this.isWeiChat = (function(){
			// window.onresize = function(){
			// 	window.location.href = window.location.href + "&"+Math.random();
			// }
			var ua = window.navigator.userAgent.toLowerCase();
	    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
	        return true;
	    }else{
	        return false;
	    }
	})();
	//是否在QQ里面
	this.isQQClient = (function(){
			var ua = window.navigator.userAgent.toLowerCase();
	    if(ua.match(/qq\//i) == 'qq/'){
	        return true;
	    }else{
	        return false;
	    }
	})();
	this.isIpQQ = this.isQQClient && this.inSafari;
	//作品宽度
	this.workWidth = this.data.width || 720;
	//作品高度
	this.workHeight = this.data.height || 1280;
	/**
	*	以下是展示尺寸和位置信息
	**/
	//展示区域高度
	this.domWidth;
	//展示区域宽度
	this.domHeight;
	this.weiAPP;

	//作品的展示方向,是否旋转90°
	this.rotation;
	this.isVertical;
	this.isPhoneVertical;

	//作品展示时候缩放的比例
	this.scale;
	//画布在元素上的相对位置
	this.canvasRelativePos;
	//画布在相当于窗口的转换矩阵
	
	this.transformMatirx;
	this.initPosition();

	/**
	*	以下是渲染页面所依赖的环境
	**/

	//作品展示区域
	this.stage;
	this.initStage();

	//作品的视频展示画布 ==> 加载于 舞台
	this.videoCanvas;
	this.initVideoCanvas();

	//作品的场景展示画布 ==> 加载于 舞台
	this.imgCanvas;
	this.initImgCanvas();

	//作品的控件存放区域  ==>加载控件，以便统一管理
	this.controlLayer;
	this.initControlLayer();

	//作品的粘贴板控件存放区域
	this.clipboardControler;
	this.initclipboardControler();
	this.clipboardList=[];
	this.clearClipboard;

	//创建一个幕布遮挡不让用户看到的元素
	this.initCurtain();

	//创建一个底层的div标签存放场景需要的元素
	this.scenesDom;
	this.initScenesDom();

	this.loadingDom;
	this.initLoadingDom();

	// 作品预加载进度条
	this.processBar;
	this.processBarInit;
	this.processForward;
	this.loadAll;
	self.isVideoGreater;


	/**
	*	以下是作品场景
	*/

	//作品预加载场景  == >在场景里预加载其需要跳转的场景
	this.scenes = [];
	this.initScenes();

};

WonxAd.prototype.initPosition = function(){
	var position =  domPosition(this.dom);
	this.domRelativePos = position;

	//元素的尺寸
	this.domWidth = position.width;
	this.domHeight= position.height;

	//作品是否是横竖屏
	this.isVertical = this.workWidth / this.workHeight < 1;

	//作品是否是横竖屏
	this.isPhoneVertical = this.domWidth / this.domHeight < 1;

	//是否需要旋转90°
	this.rotation = (this.workWidth / this.workHeight - 1) * (this.domWidth/this.domHeight - 1)< 0 ;

	//缩放比例
	this.scale  = this.rotation?Math.min(this.domHeight/this.workWidth, this.domWidth/this.workHeight):Math.min(this.domHeight/this.workHeight, this.domWidth/this.workWidth);

	//画布的尺寸，和相对于DOM元素的位置
	var canvasHeight = this.domHeight//this.rotation? this.scale*this.workWidth : this.scale*this.workHeight;

	var canvasWidth  = this.domWidth;//this.rotation?this.scale*this.workHeight:this.scale*this.workWidth;

	var canvasLeft	=	(this.domWidth-  canvasWidth)/2;
	var canvasTop	= 	(this.domHeight - canvasHeight)/2;
	this.canvasRelativePos ={
								left	:canvasLeft,
								top		:canvasTop,
								height	:canvasHeight,
								width	:canvasWidth
							};
	this.transformMatirx = 	new TransformMatirx({
								rotation:this.rotation,//是否转90°
								scale:this.scale,//缩放比例
								position:[this.canvasRelativePos.left,this.canvasRelativePos.top],//画布原点坐标偏离值
								// position:[0,0],//画布原点坐标偏离值
								origin:[this.workWidth,this.workHeight]//作品尺寸
							});

};

WonxAd.prototype.initStage = function(){
	//创建一个relative的Dom，作为渲染的舞台
	var wonxStage = document.createElement("div");
	wonxStage.style.cssText='position:relative;width:100%;height:100%;top:0;left:0;background:#000;	overflow:hidden;';
	this.dom.appendChild(wonxStage);
	this.stage = wonxStage ;
};

WonxAd.prototype.initLoadingDom = function(){
	//创建一个relative的Dom，作为渲染的舞台
	var wonxLoading = document.createElement("div");
	wonxLoading.style.cssText='position:relative;width:100%;height:100%;top:0;left:0;z-index:1000;display:none;';
	for(var x=0;x<23;x++){
		try{
			var imgUrl = require('./img/loading/'+ x.toString() +'.png');
		}catch(e){
			var imgUrl = './package/img/loading/'+ x.toString() +'.png';
		}
		var CodeImage = new Image();
		CodeImage.id = "loadimg"+x.toString();
		CodeImage.src = imgUrl;
        CodeImage.style.cssText="display:none;";
		wonxLoading.appendChild(CodeImage);
	}
	var num = 0;
	this.loadingDom = wonxLoading;
	this.dom.appendChild(wonxLoading);
	var adself = this;
	setInterval(function(){
		if(num!=0){document.getElementById("loadimg"+(num-1).toString()).style.cssText="display:none;";}
		if(num==23){num=0;}
		if(adself.rotation){var transformstr = "-webkit-transform:translateX(-50%) translateY(-50%) rotate(90deg)";}
		else{var transformstr = "-webkit-transform:translateX(-50%) translateY(-50%)";}
		document.getElementById("loadimg"+num.toString()).style.cssText="display:block;position:fixed;top:50%;left:50%;width:150px;height:auto;"+transformstr;
		num += 1;
	}, 50);
};


WonxAd.prototype.initVideoCanvas= function(){
	//创建一个画布用于渲染video
	var canvasheight= this.canvasRelativePos.height;
	var canvasWidth= this.canvasRelativePos.width;
	var canvasLeft = this.canvasRelativePos.left;
	var canvasTop = this.canvasRelativePos.top;
	var wonxVideoCanvas = document.createElement("canvas");
	wonxVideoCanvas.width = canvasWidth;
	wonxVideoCanvas.height = canvasheight;
	wonxVideoCanvas.style.cssText='position:absolute;width:'+canvasWidth+'px;height:'+canvasheight+'px;top:'+canvasTop+'px;left:'+canvasLeft+'px;z-index:100;background:rgba(0,0,0,1);';//
	this.stage.appendChild(wonxVideoCanvas);
	this.videoCanvas =wonxVideoCanvas;

};
WonxAd.prototype.initImgCanvas= function(){
	//创建一个画布用于渲染场景图片
	var canvasheight= this.canvasRelativePos.height;
	var canvasWidth= this.canvasRelativePos.width;
	var canvasLeft = this.canvasRelativePos.left;
	var canvasTop = this.canvasRelativePos.top;
	var wonxImgCanvas = document.createElement("canvas");
	wonxImgCanvas.width = canvasWidth;
	wonxImgCanvas.height = canvasheight;
	wonxImgCanvas.style.cssText='position:absolute;width:'+canvasWidth+'px;height:'+canvasheight+'px;top:'+canvasTop+'px;left:'+canvasLeft+'px;z-index:101;background:rgba(0,0,0,0);';//
	this.stage.appendChild(wonxImgCanvas);
	this.imgCanvas =wonxImgCanvas;
};

WonxAd.prototype.initControlLayer = function(){
	//创建一个dom标签，用于放交互控件
	var wonxControlLayer = document.createElement("div");
	wonxControlLayer.style.cssText='position:absolute;width:100%;z-index:999;display:none;height:100%;top:0;left:0;background:rgba(0,0,0,0);';//
	this.stage.appendChild(wonxControlLayer);
	this.controlLayer = wonxControlLayer ;
};
WonxAd.prototype.initclipboardControler = function(){
	//创建一个dom标签，用于放交互控件
	var clipboardControler = document.createElement("div");
	this.stage.appendChild(clipboardControler);
	this.clipboardControler = clipboardControler ;
};
WonxAd.prototype.clearClipboard = function(){
	this.clipboardControler.innerHTML = "";
	this.clipboardList.forEach(function(value, index, array) {
		value.destroy();
	});
	this.clipboardList = [];
};


WonxAd.prototype.initCurtain = function(){
	//创建一个dom标签，用于遮挡不需要看的元素
	var wonxCurtain = document.createElement("div");
	wonxCurtain.style.cssText='position:absolute;width:100%;z-index:99;height:100%;top:0;left:0;background:#000;';//
	this.stage.appendChild(wonxCurtain);
};

WonxAd.prototype.initScenesDom= function(){
	//创建一个dom标签，用于放交互控件
	var initScenesDom= document.createElement("div");
	initScenesDom.style.cssText='position:absolute;width:100%;z-index:98;display:block;height:100%;top:0;left:0;background:rgba(0,0,0,0);';//
	this.stage.appendChild(initScenesDom);
	this.scenesDom=initScenesDom;
};

WonxAd.prototype.initScenes= function(){
	var data = this.data.scenes;
	var sceneData;
	var scenes = this.scenes;
	var self = this;
	data.forEach(function(v,i,a){
		var scene = new Scene(v,self);
		scenes.push(scene);
	});

	//有视频场景个数是否超过指定值，不超过就全部预加载
	self.isVideoGreater = (function(){
		var num = 0;
		self.scenes.forEach(function(value, index, array) {
        	if(value.data.videoFileName){
	        	num += 1;
			}
		});
		return num>8;
	})();
	function GetQueryString(name)
	{
	     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	     var r = window.location.search.substr(1).match(reg);
	     if(r!=null)return  unescape(r[2]); return null;
	}
	scenes[0].isFirstScenes = true;
	// if(GetQueryString("ad")||window.location.href.indexOf("ad")>0){
		scenes[0].isAdvert = true;
	// }
	if(self.isIpQQ){scenes[0].load();}
	else{
		self.processBarInit();
		if(!self.isVideoGreater){
			self.loadAll();
		}else{
			self.scenes.forEach(function(value, index, array) {
					self.processForward();
					self.processForward();
			});
		}
	}
	if(GetQueryString("mytest")){scenes[0].play();}
};

WonxAd.prototype.processBarInit = function(){
	function GetQueryString(name)
	{
	     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	     var r = window.location.search.substr(1).match(reg);
	     if(r!=null)return  unescape(r[2]); return null;
	}
	if(!GetQueryString("mytest")){
		var wonxProgress = document.createElement("div");
		wonxProgress.id = "wonxProgress";
		wonxProgress.className = "allback";

		if(this.rotation){
			var getPoor = this.domRelativePos.height/2 - this.domRelativePos.width/2;
			var transformstr = "position:fixed;width:"+this.domRelativePos.height+"px;height:"+this.domRelativePos.width+"px;top:"+getPoor+"px;left:"+(-getPoor)+"px;z-index:1000;-webkit-transform:rotate(90deg)";
		}
		else{var transformstr = "position:fixed;width:100%;height:100%;top:0;left:0;z-index:1000;";}
		wonxProgress.style.cssText = transformstr;
		wonxProgress.innerHTML ='<div class="progress-bar blue stripes"><span id="widthBar" style="width: 10%"></span></div>';
		document.body.appendChild(wonxProgress);
		this.processBar = wonxProgress ;
		this.processBarCounter = 0;
		this.scenesNum = this.data.scenes.length * 2;
	}
};

WonxAd.prototype.processForward = function(){
	if(this.processBar){
		this.processBarCounter += 1;
		var nowPro = this.processBarCounter/this.scenesNum*100;
		document.getElementById('widthBar').style.width = nowPro.toString()+"%";
		var self = this;
		if(this.processBarCounter == this.scenesNum){
			// 开始播放
			setTimeout(function(){
				//self.processBar.style.cssText="display:none;";
				self.scenes[0].play();
			}, 500);
		}
	}
};

WonxAd.prototype.loadAll = function(){
	function GetQueryString(name)
	{
	     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	     var r = window.location.search.substr(1).match(reg);
	     if(r!=null)return  unescape(r[2]); return null;
	}
	this.weiAPP = GetQueryString("weiapp");
	if(!GetQueryString("mytest")){
		var self = this;
		self.scenes.forEach(function(value, index, array) {
			if(!self.isIpQQ || index != 0){value.load();}
		});
	}
};

WonxAd.prototype.showTips = function(data){
	var wonxControlLayer = document.createElement("div");
	wonxControlLayer.style.cssText='position:fixed;width:200px;z-index:999;height:20px;top:'+this.toptip+'px;left:0px;font-size: 15px;background:red;';
	wonxControlLayer.innerHTML=data;
	window.document.body.appendChild(wonxControlLayer);
	this.toptip += 15;
};



export default WonxAd;




