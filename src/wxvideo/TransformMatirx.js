//坐标转换系
var TransformMatirx = function (info){
	//是否旋转（仅仅指旋转90deg）
	var rotation = info.rotation;

	//缩放比例
	var scale = info.scale;

	//作品尺寸
	var origin =  info.origin;

	//画布原点坐标偏离值
	var position =  info.position;


	//使用坐标系转换某个坐标
	this.actOn = function(pos){
		var backPos=[0,0];
		if(rotation){
			backPos[0] =	origin[1]*scale - pos[1]*scale	+ position[0];
			backPos[1] =  	pos[0]*scale   + position[1];
		}else{
			backPos[0] = pos[0]*scale + position[0];
			backPos[1] = pos[1]*scale	+ position[1] ;
		}
		return 	backPos;
	}
};

export default TransformMatirx;