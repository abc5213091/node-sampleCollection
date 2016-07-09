/**
 * 数据采集
 * 写入本地文件备份
 * 创建web服务器
 * 将文件读取到网页中进行展示
 */
//引入需要的包
var http = require('http');
//var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

//定义常量
var dolphin = 'http://cn.dolphin.com/blog';
const filePath = '/NodeJsTest/test_7/sampleCollection/localFiles/opts.txt';

//数据请求
function dataRequest(dataUrl) {
    //发送请求
    request({
        url : dataUrl,
        method : 'GET'
    },function(err, red, body) {
        //请求到body
        if(err){
            console.log(dataUrl);
            console.error('[ERROR]Collection' + err);        
            return;
        }

        if(dataUrl && dataUrl === dolphin){
            dataPraseDolphin(body);
        }
    })
}

/**
 * 解析html
 */
function dataPraseDolphin(body) {
    
    var $ = cheerio.load(body);

    var atricles = $('#content').children('.status-publish');

    for(var i = 0;i < atricles.length;i++){
        var article = atricles[i];

        var $a = $(article).find('.post-title .entry-title a');
        var $p = $(article).find('.post-content p');

        var $aVal = $($a).text();
        var $pVal = $($p).text();

        var localData;

        if($p){
            localData = '--------------'+ (i+1) +' Chapter------------------' + '\n'
                      + '标题：' + $aVal + '\n'
                      + '简介：' + $pVal + '\n'
                      + '时间：' + new  Date + '\n'
                      + '---------------------------------------------------' + '\n';
            console.log(localData);
            writeToLocal(localData,i);
        }


    }
}

/**
 * [writeToLocal description]
 * 将解析的数据 写入本地文件进行备份
 */
function writeToLocal(dataPage,fj){
    console.log('-------------准备写入文件------------------------')
    //同步写入文件，一般使用异步好
    fs.appendFileSync(filePath, dataPage);
}

/**
 * 创建web服务器
 * @return {[type]} [description]
 */
function createServer(){
    http.createServer(function(req,resp){

        console.log('服务启动！')
        wirteToPage(resp);
        
    }).listen(7000);
}

/**
 * 将抓取的数据写入页面
 */
function wirteToPage(resp){
    fs.readFile(filePath,function(err,data){
        if(err){
            console.log(err);
            resp.writeHead(404,{
                'Content-Type':'text/html'
            })
        }else{
            resp.writeHead(200,{
                //响应头添加编码格式解决乱码问题
                'Content-Type': 'text/plain;charset=utf-8'
            });
            //resp.write('<head><meta charset="utf-8"/></head>');      
            resp.write(data.toString());
        }
        resp.end();
    })
}

//开始发送请求 并 采集数据
dataRequest(dolphin);
createServer();