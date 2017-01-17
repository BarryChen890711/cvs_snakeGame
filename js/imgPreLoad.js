/*
* Module: Image Preload
* Author: Chen WenQi / Barry
* Create: 2016/10/26
* Example : $('body').imgPreLoader(function(per){},function(){});
* Params:
*   callback1: Callback when an image is loaded.
*   callback2: Callback when all images is loaded.
*/

(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        factory(jQuery);
    }
}(function ($) {
    var imgPreOptions = [],
        onComplete = '',
        onChange = '',
        imgList = [],
        errorList = [],
        currentNum = 0;

    var getImages = function(element){
        if($(element).find('*:not(script)').length > 0){
            $(element).find('*:not(script)').each(function(){
                var url = "";
                if($(this).css('background-image') && $(this).css('background-image').indexOf('none') == -1) {
                    url = $(this).css('background-image');

                    if(url.indexOf('url') != -1) {
                        var temp = url.match(/url\((.*?)\)/);
                        url = temp[1].replace(/\"/g, '');
                    }
                } else if ($(this).get(0).nodeName.toLowerCase() == 'img' && typeof($(this).attr('src')) != 'undefined') {
                    url = $(this).attr('src');
                }

                if (url.length > 0) {
                    imgList.push(url);
                }
            });
        }else if($(element).get(0).nodeName.toLowerCase() == 'img' && typeof($(element).attr('src')) != 'undefined'){
            imgList.push($(element).attr('src'));
        }
        
    }

    var preLoading = function(){
        for (var i = 0; i < imgList.length; i++) {
            loadImg(imgList[i]);
        }
    }

    var loadImg = function(url){
        var img = new Image();
        $(img)
        .load(function(){
            completeLoading();
        })
        .error(function(){
            errorList.push($(this).attr('src'));
            completeLoading();
        })
        .attr('src',url);
    }

    var completeLoading = function(){
        currentNum++;
        var per = Math.round((currentNum / imgList.length) * 100);        
        if(onChange) onChange(per);
        if(currentNum >= imgList.length) {
           loadCompleted(); 
        }
    }

    var loadCompleted = function(){
        if(onComplete) onComplete();
    }

    $.fn.imgPreLoader = function(callback1, callback2){
        if(typeof callback1 == "function") onChange = callback1;
        if(typeof callback2 == "function") onComplete = callback2;
        getImages(this);
        preLoading();
        return this;
    }
}));