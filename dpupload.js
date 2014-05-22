/**
 * Created with Emacs 24.3.1
 * Code    : dpUploader JS
 * Version : 1.0
 * 
 * Mail    : jinglei.chen@dianping.com
 * 
 * Date    : 2014-05-13
 * Time    : 18:28
 */

/* ******************* */
/* Constructor & Init  */
/* ******************* */

/*
  @upload_url
  @flash_url
  @fn
  @post_params optional
  @cnf    optional
 */
function dpUploader (upload_url,flash_url,fn,post_params,cnf){
    if(!upload_url || !flash_url){
	console.error("上传路径，flash控件地址为空或上传按钮未找到");
	return;
    }
    this._uploadUrl = upload_url;
    this._flashUrl = flash_url;
    this._postParams = post_params;
    this._cnf = cnf;
    this._onUploaded = fn;
}

dpUploader.SWFSettings = function(upload_url,flash_url,post_params,cnf,dp){
    this.upload_url = upload_url;
    this.flash_url = flash_url;
    this.file_post_name = "Filedata";
    this.post_params = post_params;
    this.use_query_string = true;
    this.requeue_on_error = false;
    this.http_success = [201, 202];
    this.assume_success_timeout = 0;
    this.file_types = "*.jpg;*.gif;*.jpeg;*.png";
    this.file_types_description = "Web Image Files";
    this.file_size_limit = "102400000";
    this.file_upload_limit = 10;
    this.file_queue_limit = 2;
    
    this.debug = false;
    
    this.prevent_swf_caching = false;
    this.preserve_relative_urls = false;
    
    //button_placeholder_id : buttons,//specify when templates ready
    //	button_image_url : "http://www.swfupload.org/button_sprite.png",
    this.button_width = 50;
    this.button_height = 45;
    this.button_text = "浏览...";
    //      button_text_style : ".redText { color: #FF0000; }",
    this.button_text_left_padding = 3;
    this.button_text_top_padding = 15;
    this.button_action = SWFUpload.BUTTON_ACTION.SELECT_FILES;
    this.button_disabled = false;
    this.button_cursor = SWFUpload.CURSOR.HAND;
    this.button_window_mode = SWFUpload.WINDOW_MODE.TRANSPARENT;
    
    this.swfupload_loaded_handler = dp.onCtrLoaded;
    this.file_dialog_start_handler = dp.onDialogStart;
    this.file_queued_handler = dp.onQueued;
    this.file_queue_error_handler = dp.onQueueError;
    this.file_dialog_complete_handler = dp.onDialogComplete;
    this.upload_start_handler = dp.onUploadStart;
    this.upload_progress_handler = dp.onProgress;
    this.upload_error_handler = dp.onUploadError;
    this.upload_success_handler = dp.onUploadSuccess;
    this.upload_complete_handler = dp.onUploadComplete;
    this.debug_handler = dp.debug;
    
    this.custom_settings ={};//set when creating new instance
}

dpUploader.prototype.templates = {
    "upButton":"<input type='button' value='浏览'></input>",
    "progressbar":"<div class='dpuploader-progressbar-container'><div class='dpuploader-progressbar-text top-left'></div><div class='dpuploader-progressbar-text dpuploader-progressbar-speed top-right'></div><div class='dpuploader-progressbar-control' style='width: 100px; height: 4px;'><div class='item-bar yellow' style='opacity: 0.2;position: relative; width: 0%;'></div></div><div class='dpuploader-progressbar-text dpuploader-progressbar-status bottom-left'></div><div class='dpuploader-progressbar-text dpuploader-progressbar-percentage bottom-right'></div></div>",
    "fileList":"<a id='dpuploader-fileLink' class='dpuploader-fileLink'></a>"
};

dpUploader.prototype.init = function(){
    this.dpUploaderCtrls = {"containers":[],"count":0,"buttons":[],"progressbars":[],"progressbarContainers":[]};//dom nodes
    this.progressbars = [];//array of progressbar instances
    this.swfs = [];//array of swf upload instances
    var dpUploaderNodes = document.getElementsByClassName("dpuploader-container");
    if(dpUploaderNodes.length == 0){
	console.warn("no uploader-container exists in page");
	return;
    }else{
	this.dpUploaderCtrls.containers = dpUploaderNodes;
	this.dpUploaderCtrls.count = dpUploaderNodes.length;
    }
    this.btns = [];
    this.pbIds = [];//array of progressbars' dom id
    for(var i=0;i<dpUploaderNodes.length;i++){
	this.btns.push("dpuploader-upbtn-"+i);
	this.pbIds.push("dpuploader-progressbar-control-"+i);
    }
}

// Private: fire before creating an instance of swf in a page.
dpUploader.prototype.onPreCreate = function(){
    this.init();//prepare swf settings
    this.render();//add dom nodes to page
}

dpUploader.prototype.create = function(){
    this.onPreCreate();//prepare swf settings and dom that is need create swf.
    
    for(var i = 0; i<this.dpUploaderCtrls.count;i++){
	var settings = new dpUploader.SWFSettings(this._uploadUrl,this._flashUrl,this._postParams,this._cnf,this);
	settings.button_placeholder_id = this.btns[i];
	settings.custom_settings = {"seq" : i,"dpuploader":this};
	this.swfs.push(new SWFUpload(settings));//create an instance of SWF
	
	this.progressbars.push(new ProgressBar(this.pbIds[i],{'width':'100%', 'height':'3px'}));
	settings = null;
    }
    
    this.onCreated();
}


// Private: fire after creating an instance of swf in a page.
dpUploader.prototype.onCreated = function(){
    for(var i=0;i<this.dpUploaderCtrls.count;i++){
	this.dpUploaderCtrls.progressbars[i].style.display = "none";
    }
}

// Private: create dom element and add to page.
dpUploader.prototype.render = function(){
    for(var i = 0;i < this.dpUploaderCtrls.count;i++){
	var node = this.dpUploaderCtrls.containers[i];
	node.innerHTML = this.templates.upButton + this.templates.progressbar;
	
	var selectBtn = node.getElementsByTagName("input")[0];
	selectBtn.setAttribute("id",this.btns[i]);
	
	var pb = node.getElementsByClassName("dpuploader-progressbar-control")[0];
	pb.setAttribute("id",this.pbIds[i]);

	var pbCnt = node.getElementsByClassName("dpuploader-progressbar-container")[0];
	
	this.dpUploaderCtrls.buttons.push(selectBtn);
	this.dpUploaderCtrls.progressbars.push(pb);
	this.dpUploaderCtrls.progressbarContainers.push(pbCnt);
    }
}

dpUploader.prototype.onCtrLoaded = function(){
    
}

dpUploader.prototype.onDialogStart = function(){
    
}

dpUploader.prototype.onQueued = function(){
    
}

dpUploader.prototype.onQueueError = function(){
    
}

dpUploader.prototype.onDialogComplete = function(selected,queued,total){
    if(selected == 0)
	return;
    
    var pb = this.customSettings.dpuploader._getPbObj(this.customSettings.seq);
    if(pb){
	pb.setPercent(0);
    }
    this.startUpload();
}

dpUploader.prototype.onUploadStart = function(file){
    var pbCntDom =  this.customSettings.dpuploader._getPbCntDom(this.customSettings.seq);
    var pbDom = this.customSettings.dpuploader._getPbDom(this.customSettings.seq);

    if(!pbDom || !pbCntDom)
	return;
    pbDom.style.display = "";

    var stat = pbCntDom.getElementsByClassName("dpuploader-progressbar-status")[0];
    if(stat){
	stat.innerHTML = "上传中...";
    }
}

dpUploader.prototype._getPbCntDom = function(idx){
    if(idx < 0 && idx >= this.dpUploaderCtrls.count)
	return;

    return this.dpUploaderCtrls.progressbarContainers[idx];
}

dpUploader.prototype._getPbObj = function(idx){
    if(idx < 0 && idx >= this.dpUploaderCtrls.count)
	return;
    return this.progressbars[idx];
}

dpUploader.prototype._getPbDom = function(idx){
    if(idx < 0 && idx >= this.dpUploaderCtrls.count)
	 return;

     return this.dpUploaderCtrls.progressbars[idx];
}

dpUploader.prototype.onUploadError = function(file,errorCode,msg){
    var pbCntDom = this.customSettings.dpuploader._getPbCntDom(this.customSettings.seq);
    var stat = pbCntDom && pbCntDom.getElementsByClassName("dpuploader-progressbar-status")[0];
    if(stat){
	stat.innerHTML = "失败!";
    }
}

dpUploader.prototype.onProgress = function(file,sent,total){
    console.log("progress event called : %s",file.percentUploaded);
    var pbCntDom =  this.customSettings.dpuploader._getPbCntDom(this.customSettings.seq);
    var ptg = pbCntDom && pbCntDom.getElementsByClassName("dpuploader-progressbar-percentage")[0];
    if(ptg){
	ptg.innerHTML = SWFUpload.speed.formatPercent(file.percentUploaded);
    }

    var speed = pbCntDom && pbCntDom.getElementsByClassName("dpuploader-progressbar-speed")[0];
    if(speed){
	speed.innerHTML = SWFUpload.speed.formatBPS(file.currentSpeed);
    }
    
    var pbObj = this.customSettings.dpuploader._getPbObj(this.customSettings.seq);
    if(pbObj){
	pbObj.setPercent(file.percentUploaded);
    }
}

dpUploader.prototype.onUploadComplete = function(){
    
}

dpUploader.prototype.onUploadSuccess = function(file,data,response){
    console.log("success event fired : %s",file.percentUploaded);
    var pbCntDom =  this.customSettings.dpuploader._getPbCntDom(this.customSettings.seq);
    var stat = pbCntDom && pbCntDom.getElementsByClassName("dpuploader-progressbar-status")[0];
    var speed = pbCntDom && pbCntDom.getElementsByClassName("dpuploader-progressbar-speed")[0];
    if(stat){
	stat.innerHTML = "完成";
    }
    if(speed){
	speed.innerHTML = SWFUpload.speed.formatBytes(file.sizeUploaded);
    }
    
    var fn = this.customSettings.dpuploader._onUploaded;
    if(fn && typeof fn == "function"){
	fn.call(this.customSettings.dpuploader,data,this.customSettings.seq);
    }
}

dpUploader.prototype.debug = function(){
    
}
