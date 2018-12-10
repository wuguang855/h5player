var Sticker = function(config){
	var sticker = this;

	/*******************************************************
	* **显示类型
	*
	*	1.无显示 	（适合 热区、按钮、文字、图片、自动跳转）
	*	2.点击引导 	（小手）
	*	3.滑动手势	（滑动控件）
	*
	********************************************************/
	this.displayType = 1;

	/*******************************************************
	* **起始点坐标
	*
	*	除滑动控件外为左上角坐标
	*
	********************************************************/
	this.startPoint = [0,0];

	/*******************************************************
	* **结束点坐标
	*
	*	除滑动控件外为右下角坐标
	*
	********************************************************/
	this.endPoint = [0,0];

	/*******************************************************
	* **除滑动控件外为左下角坐标
	*
	********************************************************/
	this.leftBelowPoint = [0,0];

	/*******************************************************
	* **除滑动控件外为右上角坐标
	*
	********************************************************/
	this.rightAbovePoint = [0,0];

	/*******************************************************
	* **链接类型
	*
	*	1.场景
	*	2.外链
	*	3.下载控件
	*	4.复制淘口令
	*
	********************************************************/
	this.linkType = 1;

	/*******************************************************
	* **链接数据
	*
	*	1.场景  ==》场景id
	*	2.外链	==》外链url
	*	3.下载控件	==》下载地址list
	*
	********************************************************/
	this.linkdata;

	/*******************************************************
	* **场景切出效果
	*
	*
	********************************************************/
	this.transitionEffect; //切出效果
	this.transitionTime;   //切换事件


	this.scenes = config.scenes;
	this.index = config.index;
	this.backScene = config.backScene;

	this.startPoint = config.adTransform.actOn(config.scTransform.actOn(config.data.startPoint));
	this.endPoint = config.adTransform.actOn(config.scTransform.actOn(config.data.endPoint));
	this.leftBelowPoint = config.adTransform.actOn(config.scTransform.actOn(config.data.leftBelowPoint));
	this.rightAbovePoint = config.adTransform.actOn(config.scTransform.actOn(config.data.rightAbovePoint));
	this.displayType  = config.data.displayType;
	this.linkType = config.data.linkType;
	this.linkdata= config.data.linkdata;
	this.transitionEffect= config.data.transitionEffect;
	this.transitionTime= config.data.transitionTime;
	this.stickerdom = config.dom;

	this.init();




	//this.displayType  = config .





	 // var wonxControlLayer = document.createElement("div");
	 // wonxControlLayer.style.cssText='position:fixed;width:3px;z-index:999;height:3px;top:'+this.startPoint[1]+'px;left:'+this.startPoint[0]+'px;background:rgba(0,255,0,1);';
	 // window.document.body.appendChild(wonxControlLayer);
	 // var wonxControlLayer2 = document.createElement("div");
	 // wonxControlLayer2.style.cssText='position:fixed;width:3px;z-index:999;height:3px;top:'+this.endPoint[1]+'px;left:'+this.endPoint[0]+'px;background:rgba(0,255,0,1);';
	 // window.document.body.appendChild(wonxControlLayer2);
	 // var wonxControlLayer3 = document.createElement("div");
	 // wonxControlLayer3.style.cssText='position:fixed;width:3px;z-index:999;height:3px;top:'+this.leftBelowPoint[1]+'px;left:'+this.leftBelowPoint[0]+'px;background:rgba(0,255,0,1);';
	 // window.document.body.appendChild(wonxControlLayer3);
	 // var wonxControlLayer4 = document.createElement("div");
	 // wonxControlLayer4.style.cssText='position:fixed;width:3px;z-index:999;height:3px;top:'+this.rightAbovePoint[1]+'px;left:'+this.rightAbovePoint[0]+'px;background:rgba(0,255,0,1);';
	 // window.document.body.appendChild(wonxControlLayer4);
	 this.clearControls = function(){
	 	// wonxControlLayer.style.cssText="display:none;";
	 	// wonxControlLayer2.style.cssText="display:none;";
	 	// wonxControlLayer3.style.cssText="display:none;";
	 	// wonxControlLayer4.style.cssText="display:none;";
	 }


	//var
	//config.dom.appendChild(videoDom);




}
function pointIsInBlock(point,start,end,leftBelow,rightAbove){
	//判断某个点是否在以start和end两点为顶点的区域内，如果end为空判断某个点是否在start点的+-80px以内；
	if(end){//区域
		// return point[0] >= Math.min(start[0],end[0]) && point[0] <= Math.max(start[0],end[0]) &&
		// 		point[1] >= Math.min(start[1],end[1]) && point[1] <= Math.max(start[1],end[1]) ;
		var vs = [start,rightAbove,end,leftBelow]
		var x = point[0], y = point[1];

	    var inside = false;
	    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
	        var xi = vs[i][0], yi = vs[i][1];
	        var xj = vs[j][0], yj = vs[j][1];

	        var intersect = ((yi > y) != (yj > y))
	            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	        if (intersect) inside = !inside;
	    }

	    return inside;

	}else{//点
		return point[0] >= start[0] -80 && point[0] <= start[0] +80 &&
				point[1] >= start[1] -80  && point[1] <= start[1] +80 ;

	}
}
function getLength(startPosition,endPosition){
	// js获取两点直接的距离
	deltaX = endPosition[0] - startPosition[0];
    deltaY = endPosition[1] - startPosition[1];
    moveLength = Math.sqrt(Math.pow(Math.abs(deltaX), 2) + Math.pow(Math.abs(deltaY), 2));
    return moveLength;
}






Sticker.prototype.init = function(){
	var self = this;

	var e_touchstart = 'ontouchstart' in window ?'touchstart':'mousedown';
	var e_touchmove = 'ontouchstart' in window ?'touchmove':'mousemove';
	var e_touchend = 'ontouchstart' in window ?'touchend':'mouseup';

	var touchstart 	=	function(){};
	var touchmove	=	function(){};
	var touchend	=	function(){};
	var trunLink 	= 	function(){};

	var startPoint 	= 	this.startPoint;
	var endPoint 	= 	this.endPoint;
	var leftBelowPoint 	= 	this.leftBelowPoint;
	var rightAbovePoint 	= 	this.rightAbovePoint;

	function getIndex(id){
		index=-1;
		self.scenes.forEach(function(item,i,n){
			if (item.id==id){index=i;}
		});
		return index
	}

	//跳转样式
	switch(this.linkType){
		case 1:
			var scenesid = this.linkdata;
			trunLink = function(){
				self.backScene();
				self.clearControls();
				self.scenes[0].parent.controlLayer.innerHTML = "";
				self.scenes[0].parent.clearClipboard();
			    self.scenes[0].parent.controlLayer.style.display = "none";
				if (self.scenes[0].parent.isIpQQ){
					var imgCanvas =self.scenes[0].parent.imgCanvas;
					var height= imgCanvas.height;
					var width = imgCanvas.width;
					var ctx = imgCanvas.getContext('2d');
					ctx.fillStyle = "rgba(255,165,0,0.5)";
					ctx.clearRect(0,0,width,height);

					self.scenes[getIndex(self.linkdata)].play();
					if (self.scenes[getIndex(self.linkdata)].data.transVideoFileName && self.scenes[getIndex(self.linkdata)].videoDom){
						self.scenes[getIndex(self.linkdata)].videoDom.play();
					}
				}else{
					self.scenes.forEach(function(item,i,n){
						if(item.id==scenesid){
	                        item.animate = function (callback) {
								var imgwidth = item.data.imageFileNameWidth;
								var imgheight = item.data.imageFileNameHeight;
								var imgCanvas = item.parent.imgCanvas;
								imgCanvas.height=imgheight;
								imgCanvas.width=imgwidth;
								callback();
	                        };

							item.play();
						}
					});
				}
			};

			touchstart= function(event){
				// 显示加载中的gif
				event.preventDefault();
				var point = event.touches ? event.touches[0] : event;
				var thisPoint = [point.clientX,point.clientY];
				self.touchPoint = thisPoint;
				if(self.displayType!=3&&pointIsInBlock(thisPoint,startPoint,endPoint,leftBelowPoint,rightAbovePoint)){
					trunLink();
				}
			};
			touchend= function(event){
				event.preventDefault();
				var point = event.changedTouches ? event.changedTouches[0] : event;
				var thisPoint = [point.clientX,point.clientY];
				if(self.displayType==3&&self.touchPoint&&pointIsInBlock(self.touchPoint,startPoint,"",leftBelowPoint,rightAbovePoint)&&pointIsInBlock(thisPoint,startPoint,endPoint,leftBelowPoint,rightAbovePoint)&&getLength(self.touchPoint,thisPoint)*3>getLength(startPoint,endPoint)){
					trunLink();
				}
			};

		break;
		case 2:
			var url = this.linkdata;
			trunLink = function(){
				self.clearControls();
				// self.scenes[0].parent.controlLayer.innerHTML = "";
			 //    self.scenes[0].parent.controlLayer.style.display = "none";
				// self.scenes[0].parent.imgCanvas.style.display="none";
				if(url){
					window.location.href = url;
				}
			};

				touchstart= function(event){
					event.preventDefault();
					var point = event.touches ? event.touches[0] : event;
					var thisPoint = [point.clientX,point.clientY];
					self.touchPoint = thisPoint;
					if(self.displayType!=3&&pointIsInBlock(thisPoint,startPoint,endPoint,leftBelowPoint,rightAbovePoint)){
						trunLink();
					}
				};

				touchend= function(event){
					event.preventDefault();
					var point = event.changedTouches ? event.changedTouches[0] : event;
					var thisPoint = [point.clientX,point.clientY];
					if(self.displayType==3&&self.touchPoint&&pointIsInBlock(self.touchPoint,startPoint,"",leftBelowPoint,rightAbovePoint)&&pointIsInBlock(thisPoint,startPoint,endPoint,leftBelowPoint,rightAbovePoint)&&getLength(self.touchPoint,thisPoint)*3>getLength(startPoint,endPoint)){
						trunLink();
					}
				};

		break;
		case 3:
			trunLink = function(){
				self.clearControls();
				// self.scenes[0].parent.controlLayer.innerHTML = "";
			 //    self.scenes[0].parent.controlLayer.style.display = "none";
				var url;
				if(self.scenes[0].parent.isWeiChat){
					url = self.linkdata.yingyongbaoDownloadLink;
				}else if(self.scenes[0].parent.inSafari){
					url = self.linkdata.appstoreDownloadLink;
				}{

					url = self.linkdata.webDownloadLink;

				}

				if(url){
					window.location.href = url;
				}



			};
			touchstart= function(event){
				event.preventDefault();
				var point = event.touches ? event.touches[0] : event;
				var thisPoint = [point.clientX,point.clientY];
				self.touchPoint = thisPoint;
				if(self.displayType!=3&&pointIsInBlock(thisPoint,startPoint,endPoint,leftBelowPoint,rightAbovePoint)){


					trunLink();
				}
			};

			touchend= function(event){
				event.preventDefault();
				var point = event.changedTouches ? event.changedTouches[0] : event;
				var thisPoint = [point.clientX,point.clientY];
				if(self.displayType==3&&self.touchPoint&&pointIsInBlock(self.touchPoint,startPoint,"",leftBelowPoint,rightAbovePoint)&&pointIsInBlock(thisPoint,startPoint,endPoint,leftBelowPoint,rightAbovePoint)&&getLength(self.touchPoint,thisPoint)*3>getLength(startPoint,endPoint)){
					trunLink();
				}
			};
		break;
		case 4:
			var copybutton=document.createElement("div");
			var copycssText='border: none;background: 0;position:fixed;width:'+Math.abs(this.startPoint[0]-this.endPoint[0])+'px;z-index:999;height:'+Math.abs(this.startPoint[1]-this.endPoint[1])+'px;top:'+Math.min(this.startPoint[1],this.endPoint[1])+';left:'+Math.min(this.startPoint[0],this.endPoint[0])+'px;';
			copybutton.innerHTML='<button id="inhidden'+self.index+'" style="'+copycssText+'" data-clipboard-text="'+self.linkdata.taoToken+'"></button>';
			if(self.linkdata.webLink&&!self.scenes[0].parent.isWeiChat){
				copystart=function(){window.location.href = self.linkdata.webLink;}
				copybutton.addEventListener(e_touchstart,copystart,false);
			}else{
				var clipboard = new Clipboard('#inhidden'+self.index);
			     clipboard.on('success', function(e) {
			         alert("已复制宝贝的淘口令，快打开淘宝APP带它回家吧～");
			     });
			     clipboard.on('error', function(e) {
			        prompt("长按复制淘口令", self.linkdata.taoToken);
			     });
			     self.scenes[0].parent.clipboardList.push(clipboard);
		 	}
	        self.scenes[0].parent.clipboardControler.appendChild(copybutton);
		break;

	}

	//var
	//显示样式
	switch(this.displayType){
		case 1:




		break;
		case 2:

			try{
				var icoHand1 = require('./img/icoHand1.png');
				var icoHand2 = require('./img/icoHand2.png');
			}catch(e){
				var icoHand1 = './package/img/icoHand1.png';
				var icoHand2 = './package/img/icoHand2.png';
			}
			var scale = this.scenes[0].parent.scale;

			if(this.scenes[0].parent.rotation){
				var top = this.startPoint[1] + (Math.abs(this.endPoint[1]-this.startPoint[1])-51)/2;
				var left = this.startPoint[0] - (Math.abs(this.endPoint[0]-this.startPoint[0])-51)/2;
				left = left - 51;
			}else{
				var left = this.startPoint[0] + (Math.abs(this.endPoint[0]-this.startPoint[0])-51)/2;
				var top = this.startPoint[1] + (Math.abs(this.endPoint[1]-this.startPoint[1])-51)/2;
			}

			var dom_hand1 = document.createElement("img");
			dom_hand1.src = icoHand1;

			dom_hand1.style.height = 51+"px";
			dom_hand1.style.position = "absolute";
			dom_hand1.style.top = top+"px";
			dom_hand1.style.left = left+"px";
			document.getElementById("wonxEventListenerDev").appendChild(dom_hand1);

			var dom_hand2 = document.createElement("img");
			dom_hand2.src = icoHand2;

			dom_hand2.style.height = 51+"px";
			dom_hand2.style.position = "absolute";
			dom_hand2.style.top = top+"px";
			dom_hand2.style.left = left+"px";
			dom_hand2.style.display = "none";

			document.getElementById("wonxEventListenerDev").appendChild(dom_hand2);
			setInterval(function(){
				if(dom_hand2.style.display=="none"){
					dom_hand2.style.display="block";
					dom_hand1.style.display="none";
				}else{
					dom_hand1.style.display="block";
					dom_hand2.style.display="none";
				}
			}, 400);



			if(this.scenes[0].parent.rotation){
				//位置
				dom_hand1.style.transform="rotate(90deg)";
				dom_hand2.style.transform="rotate(90deg)";


			}


		break;

		case 3:



	var icoHand = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIMAAABpCAYAAAAZQpCCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjRDOTJEODc2MEJEMTFFN0E5NDNCQTkzNUQ5QkY4MkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjRDOTJEODg2MEJEMTFFN0E5NDNCQTkzNUQ5QkY4MkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNEM5MkQ4NTYwQkQxMUU3QTk0M0JBOTM1RDlCRjgyQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNEM5MkQ4NjYwQkQxMUU3QTk0M0JBOTM1RDlCRjgyQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkahY6kAABc8SURBVHja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";

			//this.leftBelowPoint = [0,0];
			//this.rightAbovePoint = [0,0];
			var left = this.startPoint[0];//(this.startPoint[0]+this.endPoint[0])/2
			var top = this.startPoint[1];//(this.startPoint[1]+this.endPoint[1])/2

			var scale = this.scenes[0].parent.scale;

			var dom_hand = document.createElement("img");
			dom_hand.src = icoHand;

			dom_hand.style.height = scale*105 +"px";
			dom_hand.style.position = "absolute";
			dom_hand.style.top = top+"px";
			dom_hand.style.left = left+"px";
			this.stickerdom.appendChild(dom_hand);
			if(this.scenes[0].parent.rotation){
				//位置
				dom_hand.style.transform="rotate(90deg)";
			}
			var self =this;

			!function(){

				var _left = self.endPoint[0];
				var _top = self.endPoint[1];

				var left_=left;
				var top_=top;

				var det_left = (_left - left)/40;
				var det_top = (_top - top)/40;

				function handTransition(){
					left_ +=det_left;
					top_ +=det_top;

					if((((det_left>0)?(left_>=_left):(left_<=_left))&&det_left !=0) || (det_top!=0&&((det_top>0)?(top_>=_top):(top_<=_top))) ){
						left_=left;
						top_=top;
					}

					dom_hand.style.top = top_+"px";
					dom_hand.style.left = left_+"px";
				}


				setInterval(function(){handTransition();},40);

			}();
			//handTransition();




		break;


	}
	document.getElementById("wonxEventListenerDev").addEventListener(e_touchstart,touchstart,false);
	document.getElementById("wonxEventListenerDev").addEventListener(e_touchmove,touchmove,false);
	document.getElementById("wonxEventListenerDev").addEventListener(e_touchend,touchend,false);



};

export default Sticker;
