//引入css
import utils from './utils';
require('./css/setshare.css');
var debug = utils.get("debug"); //debug模式
if(debug){
	require('./lib/vconsole.js');	
}
require('./lib/flexible.js');
var $ = require('jquery');
import api from './api/setshare';

var openid = utils.get('openid');
var wid = utils.get('wid');
$("#wonxAd_demo").html("");
var postdata = {
	pid:wid
}
api.getShareInfo(postdata).then(function (res) {
	var poster = res.data.data.poster;
	var data = {
		title:poster.share_title|| poster.name,
		cover:poster.share_image || poster.cover,
		summary:poster.share_summary || "",
		wid:poster.work_id
	}
	var setShare = require('./tpl/setShare.tpl');
	$(setShare(data)).appendTo("#wonxAd_demo");
	$('<div id="container_upimg"></div>').appendTo("#wonxAd_demo");
	upimg();
});


$("#wonxAd_demo").on("click",".lookBut",function(){
	var postdata = {
			author:openid,
			pid:wid,
			share_title:$(".inputStyle").val()||$(".inputStyle").attr("data-val"),
			share_summary:$(".textareaStyle").val()||$(".textareaStyle").attr("data-val"),
			share_image_qn:$(".imgDiv").attr("data-imgurl")|| ""
		};
	api.setShare(postdata).then(function(res){
		var data = res.data;
		if(data.status =="0"){
			window.location.href="./wonxVideo.html?openid="+openid+"&pid="+wid+"&type=play"+ ( debug?"&debug=1":"" );
		}else{
			console.log(data.errmsg);
		}
	})


});

var uploader;


$("#wonxAd_demo").on("click",".butDiv",function(){

});

function upimg(){
	var QN =  new QiniuJsSDK();
	var filename = "img/"+utils.uuid()+".jpg";
	var postdata = {
		weiid:openid,
		key:filename
	};
	api.uploadToken(postdata).then(function(res){
		var data = res.data;
		if(data.status==0){
			var token = data.data.token;
			  var option = {
			    disable_statistics_report: false,
			    runtimes: 'html5,flash,html4',      // 上传模式，依次退化
			    browse_button: "butDiv",         // 上传选择的点选按钮，必需
			    uptoken : token,
			    get_new_uptoken: false,             // 设置上传文件的时候是否每次都重新获取新的uptoken
			    //uptoken_url:'http://api.touchfa.com/weiwork/upload_token',
			    domain: 'www.touchfa.com',     // bucket域名，下载资源时用到，必需
			   	// container: "container_upimg",             // 上传区域DOM ID，默认是browser_button的父元素
			    max_file_size: '1000mb',             // 最大文件体积限制
			    flash_swf_url: '/applet/js/Moxie.swf',  //引入flash，相对路径
			    max_retries: 3,                     // 上传失败最大重试次数
			    chunk_size: '4mb',                  // 分块上传时，每块的体积
			    auto_start: true,                   // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
			    filters : {
			      },
			    multi_selection: false,
			    init: {
			        'FilesAdded': function(up, files) {
			          if(up.files.length>1){
				          	up.files.splice(0, 1);
				            plupload.each(files, function(file) {
				            });
			        	}
			        },
			        'BeforeUpload': function(up, file) {
			               // 每个文件上传前，处理相关的事情
			               $(".imgDiv").html('<div class="pross"></div>');
			        },
			        'UploadProgress': function(up, file) {
			               console.log("chunk_size",file.percent);
			               $(".pross").css("height",file.percent+"%");
			        },
			        'FileUploaded': function(up, file, info) {
			               // uploadinfo.style.display="none";
		              	var domain = up.getOption('domain');
		               	var res = JSON.parse(info.response);
		               	var sourceLink = domain +"/"+ res.key;
		              	$(".imgDiv").attr("data-imgurl",res.key)
		              	$(".imgDiv").html('<img src="http://'+sourceLink+'"/>');
			        },
			        'Error': function(up, err, errTip) {
			               //上传出错时，处理相关的事情
			            console.log(err);
			            console.log(errTip);
			        },
			        'UploadComplete': function() {
			            //队列文件处理完毕后，处理相关的事情

			        },
			        'Key': function(up, file) {
			            // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
			            // 该配置必须要在unique_names: false，save_key: false时才生效
			            var filename = "img/"+utils.uuid()+".jpg";
			            var key = filename;
			            return key
			        }
			    }
			};console.log(option);console.log($("#container_upimg").html()
);
			uploader = QN.uploader(option);
		}else{
			console.log(data.errmsg);
		}
	});
}