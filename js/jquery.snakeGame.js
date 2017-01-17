/*!
 jQuery snakeGame plugin
 @name jquery.snakeGame.js
 @author 陈文琦 (Barry)
 @version 1.0.2
 @update 12/02/2016
 */
 
;(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        factory(jQuery);
    }
}(function ($) {
    function getEventPosition(ev){
        var x, y;
        if (ev.layerX || ev.layerX == 0) {
            x = ev.layerX;
            y = ev.layerY;
        } else if (ev.offsetX || ev.offsetX == 0) { // Opera
            x = ev.offsetX;
            y = ev.offsetY;
        }
        return {x: x, y: y};
    }
    var snakeGame,defaultOptions,__bind;
    defaultOptions = {
        begin  : 'http://img1.tiancitycdn.com/project5/csol2/event/2016/1205event/images/game/begin.jpg',
        head_0 : 'http://img1.tiancitycdn.com/project5/csol2/event/2016/1205event/images/game/head_0.png',
        head_1 : 'http://img1.tiancitycdn.com/project5/csol2/event/2016/1205event/images/game/head_1.png',
        head_2 : 'http://img1.tiancitycdn.com/project5/csol2/event/2016/1205event/images/game/head_2.png',
        head_3 : 'http://img1.tiancitycdn.com/project5/csol2/event/2016/1205event/images/game/head_3.png',
        box_0  : 'http://img1.tiancitycdn.com/project5/csol2/event/2016/1205event/images/game/box_0.png',
        box_1  : 'http://img1.tiancitycdn.com/project5/csol2/event/2016/1205event/images/game/box_1.png',
        body_0 : 'http://img1.tiancitycdn.com/project5/csol2/event/2016/1205event/images/game/body_0.png',
        body_1 : 'http://img1.tiancitycdn.com/project5/csol2/event/2016/1205event/images/game/body_1.png',
        beginBtn : {x : 205, y : 340, width : 255, height : 70},
        unit : 30, // 游戏元素直径
        X : 15, // 蛇头X轴坐标位置
        Y : 15, // 蛇头Y轴坐标位置
        snakeLong : 0, // 蛇长
        fps : 10, // 速度
        fpsRate : 0.5, // 速度增长率
        maxBeanCount : 6,
        beans : [], // 生成的豆子
        snakes : [], // 蛇身坐标点
        dir : 1, // 0,1,2,3 上右下左
        score : 0, // 游戏总成绩
        scoreUnit : 10, // 吃一个加几分
        scoreRate : 5, // 游戏分数增长值
        onGameover : "",
        beforeStart : ""
    };

    __bind = function(fn, me) {
        return function() {
          return fn.apply(me, arguments);
        };
    };

    // Init snakeGame 
    snakeGame = function(handler){
        this.handler = handler;

        this.init = __bind(this.init,this);
        this.reset = __bind(this.reset,this);
        this.drawBegin = __bind(this.drawBegin,this);
        this.start = __bind(this.start,this);        
        this.moveSnake = __bind(this.moveSnake,this);
        this.updateSnake = __bind(this.updateSnake,this);
        this.drawSnake = __bind(this.drawSnake,this);
        this.bindEvt = __bind(this.bindEvt,this);
        this.creatBean = __bind(this.creatBean,this);
        this.isTouch = __bind(this.isTouch,this);
        this.isDead = __bind(this.isDead,this);
    };

    snakeGame.prototype = {
        init : function(options){            
            this.ctx = this.handler[0].getContext("2d");
            this.width = this.handler.width();
            this.height = this.handler.height();
            $.extend(true, this, defaultOptions, options);
            
            /* 预加载游戏所需图素 */
            var self = this;
            var imgload = $('<div>')
                .append($("<img>").attr("src",this.begin))
                .append($("<img>").attr("src",this.head_0))
                .append($("<img>").attr("src",this.head_1))
                .append($("<img>").attr("src",this.head_2))
                .append($("<img>").attr("src",this.head_3))
                .append($("<img>").attr("src",this.box_0))
                .append($("<img>").attr("src",this.box_1))
                .append($("<img>").attr("src",this.body_0))
                .append($("<img>").attr("src",this.body_1));
            imgload.imgPreLoader(function(per){},function(){
                self.reset();
            });
        },
        reset : function(){
            // 初始化游戏参数
            this.X = 15;
            this.Y = 15;
            this.score = 0;
            this.scoreUnit = 10;
            this.scoreRate = 5;
            this.fps = 10;
            this.fpsRate = 0.5;
            this.beans = [];
            this.snakes = [];
            this.snakeLong = 0;
            this.dir = 1;

            // 绘制启动画面
            this.drawBegin();

            var self = this;
            this.handler.click(function(e){
                var p = getEventPosition(e);
                self.drawBegin(p);
            });
        },
        drawBegin : function(p){
            // 清空画面
            var ctx = this.ctx, btn = this.beginBtn;
            ctx.clearRect(0, 0, this.width, this.height);
            // 绘制启动画面
            var _img = $("<img>").attr("src",this.begin);
            this.ctx.drawImage(_img[0], 0, 0);
            // 绘制启动按钮
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0,0,0,0)';
            ctx.rect(btn.x, btn.y, btn.width, btn.height);
            ctx.stroke();

            // 点击开始按钮，启动游戏
            if(p && ctx.isPointInPath(p.x, p.y)){
                if (this.beforeStart !== undefined && typeof this.beforeStart === 'function') {
                    var canStart = this.beforeStart();
                    if(canStart){
                        this.handler.unbind('click');
                        this.start();
                    }
                }else{
                    this.handler.unbind('click');
                    this.start();
                }                
            }
        },
        start : function(){
            this.ctx.clearRect(0, 0, this.width, this.height);
            // 初始化6个豆子
            var _max = this.maxBeanCount,i;
            for(i = 0; i < _max; i++){
                this.creatBean(i);
            }
            
            this.updateSnake(-1,this.X,this.Y,99); 
            this.drawSnake();

            setTimeout(this.moveSnake, 1000 / this.fps);
            this.bindEvt();
        },
        moveSnake : function(){
            var _ctx = this.ctx, _snakes = this.snakes, _sl = this.snakeLong,
            _unit = this.unit, _radius = _unit / 2, _dir = this.dir, snakeColor = "";

            //根据移动方向移动蛇头
            switch(_dir){
                case 0 : this.Y = this.Y -  _unit;break;
                case 1 : this.X = this.X +  _unit;break;
                case 2 : this.Y = this.Y +  _unit;break;
                case 3 : this.X = this.X -  _unit;break;
            }

            // 判断蛇头是否超出舞台或者撞击蛇身
            if( this.isDead() ) {
                return;
            }

            // 判断是否吃到豆子
            if( (snakeColor = this.isTouch()) != -1 ) { 
                this.updateSnake (1,this.X,this.Y,snakeColor); 
            }else {
                this.updateSnake (0,this.X,this.Y); 
            }

            // 画新蛇
            this.drawSnake(this.X,this.Y,snakeColor);

            setTimeout(this.moveSnake, 1000 / this.fps);
        },
        updateSnake : function(i,x,y,color){
            if(i == 1 || i == -1){
                this.snakes.push({ x : x, y : y , color : color });
            }
            var x1 = x2 = y1 = y2 = 0 ,tempColor = "", total = this.snakes.length-1, ctx = this.ctx, u = this.unit, r = u / 2;
            $.each(this.snakes,function(idx,snakeObj){
                if(idx==0){
                    x2 = x1 = snakeObj.x;
                    y2 = y1 = snakeObj.y;
                    snakeObj.x = x;
                    snakeObj.y = y;
                }else{
                    x2 = snakeObj.x;
                    y2 = snakeObj.y;
                    snakeObj.x = x1;
                    snakeObj.y = y1;
                    if(idx != total) {
                        x1 = x2;
                        y1 = y2;
                    }
                }                
            });
            if(i != -1) {
                this.ctx.clearRect(x2 - r, y2 - r,  u,  u);
            }
        },
        drawSnake : function(){
            var _ctx = this.ctx, _snakes = this.snakes, _radius = this.unit / 2 , _dir = this.dir, i, self = this;

            $.each(_snakes,function(i,sObj){
                if(sObj.color == 99) {
                    var _url = "";
                    if(_dir==0){_url = self.head_0;}
                    else if(_dir==1){_url = self.head_1;}
                    else if(_dir==2){_url = self.head_2;}
                    else{_url = self.head_3;}
                    var _img = $("<img>").attr("src",_url);
                    _ctx.drawImage(_img[0], sObj.x -_radius, sObj.y-_radius);
                }else if(sObj.color == 0) {
                    var _img = $("<img>").attr("src",self.body_0);
                    self.ctx.drawImage(_img[0], sObj.x - _radius, sObj.y - _radius);
                }else{
                    var _img = $("<img>").attr("src",self.body_1);
                    self.ctx.drawImage(_img[0], sObj.x - _radius, sObj.y - _radius);
                }                
            });       
        },
        bindEvt : function(){
            // 根据键盘方向键改变蛇行进方向 
            var self = this;
            document.onkeydown = function(e) { 
                e.preventDefault();
                var _dir = self.dir, _snakes = self.snakes, _x = self.X, _y = self.Y, code = e.keyCode - 37, _unit = self.unit;
                switch(code){ 
                    case 0 : self.dir=(_snakes.length==1)?3:(_snakes[1].x!=(_x-_unit))?3:_dir;break; // 左
                    case 1 : self.dir=(_snakes.length==1)?0:(_snakes[1].y!=(_y-_unit))?0:_dir;break; // 上
                    case 2 : self.dir=(_snakes.length==1)?1:(_snakes[1].x!=(_x+_unit))?1:_dir;break; // 右
                    case 3 : self.dir=(_snakes.length==1)?2:(_snakes[1].y!=(_y+_unit))?2:_dir;break; // 下
                }
            }
        },
        creatBean : function(i){
            // 随机生成食物
            var _ctx = this.ctx,
                _unit = this.unit,
                _radius = _unit / 2,
                _max_unit_x = this.width / _unit,
                _max_unit_y = this.height / _unit,
                _beans = this.beans,
                _same = 0,
                _fx = _fy = 0,
                _img = ""; 
            do{
                _same = 0;
                _fx = Math.floor(Math.random() * _max_unit_x) * _unit + (_unit / 2);
                _fy = Math.floor(Math.random() * _max_unit_y) * _unit + (_unit / 2);
                for(var j = 0;j < _beans.length; j++){
                    if(_fx == _beans[j].x && _fy == _beans[j].y) _same++;
                }
            } while(_same != 0);

            if(i < 2) { _img = this.box_1; }
            else{ _img = this.box_0; }
            
            var _img = $("<img>").attr("src",_img);
            _ctx.drawImage(_img[0], _fx - _radius, _fy - _radius);
            _beans[i] = { x : _fx, y : _fy, img : _img };
        },
        isTouch : function(){
            // 判断是否吃到食物
            var _beans = this.beans, _x = this.X, _y = this.Y, self = this, _beanColor = -1;
            $.each(_beans,function(i,_bean){
                var _bx = parseInt(_bean.x),
                    _by = parseInt(_bean.y);

                if(_x == _bx && _y == _by){
                    self.creatBean(i);
                    self.snakeLong++;
                    self.score += self.scoreUnit;

                    if(i < 2) {
                        self.fps += self.fpsRate * 2;
                        self.scoreUnit += self.scoreRate;
                        _beanColor = 1; // 红
                    }else{
                        self.fps += self.fpsRate;
                        _beanColor = 0; // 绿
                    }
                    return false;
                }
            });

            return _beanColor;
        },
        isDead : function(){
            var _x = this.X, _y = this.Y, _w = this.width, _h = this.height ,_snakes = this.snakes, touch = 0, self = this;
            // 撞墙
            if(_x < 0 || _x > _w || _y < 0 || _y > _h){ 
                if (this.onGameover !== undefined && typeof this.onGameover === 'function') {
                    setTimeout(function(){self.onGameover(self.score,0);self.reset();},200);
                    document.onkeydown = function(e) { };
                }
                return true;
            }

            // 撞自己
            $.each(_snakes,function(i,_snake){
                var _sx = parseInt(_snake.x),
                    _sy = parseInt(_snake.y);
                if(_x == _sx && _y == _sy) touch++;
            });

            if(touch > 0) {
                if (this.onGameover !== undefined && typeof this.onGameover === 'function') {
                    setTimeout(function(){self.onGameover(self.score,1);self.reset();},200);
                    document.onkeydown = function(e) { };
                }
            }
            return (touch == 0) ? false : true;
        }
    };

    $.fn.snakeGame = function(options) {
        // Create a snakeGame instance if not available
        this.snakeGameInstance = new snakeGame(this);
        // Apply init
        this.snakeGameInstance.init(options || {});
        return this;
    };
}));