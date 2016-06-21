/**********************************************
 * Game 2048 v0.1
 * 刘柏众
 * http://www.lbzhong.com
 * 2016-06-18
 **********************************************/

function Game() {
    /** 窗口宽度 */
    this.screenWidth = 0;
    /** 窗口高度 */
    this.screenHeight = 0;
    /** 矩形面板的边长 */
    this.panelSize = 410;
    /** 面板的x起始坐标 */
    this.panelX = 0;
    /** 面板的y起始坐标*/
    this.panelY = 0;
    /** 数组是否实际改变 */
    this.cxt = null;
    /** 游戏是否结束 */
    this.over = false;
    /** 得分 */
    this.score = 0;
    /** 单元格数值布局 */
    this.cells = [ // <value, effect>, effect出现效果: 0 无, 1 合并, 2 新建
        {v: 0, e: 0},
        {v: 0, e: 0},
        {v: 0, e: 0},
        {v: 0, e: 0},

        {v: 0, e: 0},
        {v: 0, e: 0},
        {v: 0, e: 0},
        {v: 0, e: 0},

        {v: 0, e: 0},
        {v: 0, e: 0},
        {v: 0, e: 0},
        {v: 0, e: 0},

        {v: 0, e: 0},
        {v: 0, e: 0},
        {v: 0, e: 0},
        {v: 0, e: 0}
    ];
    /** 记录上一次操作的所有单元格布局，用于判断是否有变化 */
    this.lastCells = new Array(16);
    /** 不同数值对应方格的颜色 */
    this.colors = [
        "#facd89", //2
        "#f6b37f", //4
        "#f29b76", //8
        "#eb6100", //16

        "#b3d465", //32
        "#80c269", //64
        "#22ac38", //128
        "#009944", //256

        "#7ecef4", //512
        "#00b7ee", //1024
        "#00a0e9", //2048
        "#0068b7", //4096

        "#f29c9f", //8192
        "#eb6877", //16384
        "#c490bf", //32768
        "#8957a1"  //65536
    ];
}


/**
 * 初始化canvas画布
 */
Game.prototype.init = function() {
    var self = this;
    var container = document.getElementById("container");
    var canvas = document.createElement("canvas");
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight - 3;
    this.panelX = (this.screenWidth - this.panelSize) / 2;
    this.panelY = (this.screenHeight - this.panelSize) / 2;
    this.cxt = canvas.getContext("2d");

    canvas.setAttribute("width", this.screenWidth);
    canvas.setAttribute("height", this.screenHeight);

    container.innerHTML = "";
    container.appendChild(canvas);

    document.onkeydown =  function() {
        if(!self.over) {
            var code = event.keyCode;
            if(code == 37 || code == 38 || code == 39 || code == 40) {
                self.saveCells();
                switch(code) {
                    case 38: // up
                        self.moveUp();
                        break;
                    case 40: // down
                        self.moveDown();
                        break;
                    case 37: // left
                        self.moveLeft();
                        break;
                    case 39: // right
                        self.moveRight();
                        break;
                }
                if(self.isChanged()) { //若有移动
                    setTimeout(function() {
                        self.addRandomValue();
                        self.createPanel();
                    }, 100);
                    self.createPanel();
                }
                setTimeout(function() {
                    if(self.isOver()) {
                        self.over = true;
                        self.drawOver();
                    }
                }, 100);
            }
        }
    };
};

/**
 * 绘制圆角矩形
 * @param x
 * @param y
 * @param w
 * @param h
 * @param r
 * @param color "#ffffff"
 */
Game.prototype.roundRect = function(x, y, w, h, r, color) {
    this.cxt.fillStyle = color;
    this.cxt.beginPath();
    if(w > 0) {
        this.cxt.moveTo(x + r, y);
    } else {
        this.cxt.moveTo(x - r, y);
    }
    this.cxt.arcTo(x + w, y, x + w, y + h, r);
    this.cxt.arcTo(x + w, y + h, x, y + h, r);
    this.cxt.arcTo(x, y + h, x + r, y, r);
    if(w > 0) {
        this.cxt.arcTo(x, y, x + r, y, r);
    } else {
        this.cxt.arcTo(x, y, x - r, y, r);
    }
    this.cxt.closePath();
    this.cxt.fill();
};

/**
 * 绘制背景面板
 */
Game.prototype.drawPanel = function() {
    this.roundRect(this.panelX, this.panelY, this.panelSize, this.panelSize, 5, "#f2f2f2");
};

/**
 * 添加方格
 * @param i
 * @param value
 */
Game.prototype.addCell = function(i, value, e) {
    i = i - 1;
    var self = this;
    var ix = i % 4;
    var iy = parseInt(i / 4);
    var w = 90;
    var x = this.panelX + 10 + (w + 10) * ix;
    var y = this.panelY + 10 + (w + 10) * iy;
    if(value > 0) { //有值的方格
        if(e == 1) {
            var mx = x - 5;
            var my = y - 5;
            var mw = w + 10;
            this.drawCell(mx, my, mw, value);
            setTimeout(function () {
                self.clearCell(mx, my, mw);
                self.drawCell(x, y, w, value);
            }, 150);
        } else if(e == 2) {
            mx = x + 20;
            my = y + 20;
            mw = w - 40;
            this.drawCell(mx, my, mw, value);
            setTimeout(function () {
                self.drawCell(mx + 20, my + 20, mw - 40, value);
            }, 20);
            setTimeout(function () {
                self.drawCell(x, y, w, value);
            }, 40);
        } else {
            this.drawCell(x, y, w, value);
        }
    } else { //灰色的背景小方格
        this.roundRect(x, y, w, w, 5, "#dddddd");
    }
};

/**
 * 绘制单元格
 * @param x
 * @param y
 * @param w
 * @param value
 */
Game.prototype.drawCell = function(x, y, w, value) {
    var valueSize = Math.log(value)/Math.log(2);
    //方格
    this.roundRect(x, y, w, w, 5, this.colors[valueSize - 1]);
    //文字
    var fontSize = 24 + (16 - valueSize) * 2;
    this.cxt.font = fontSize + "px Microsoft YaHei";
    this.cxt.textAlign = "center";
    this.cxt.textBaseline = "middle";
    this.cxt.fillStyle = "#ffffff";
    var textX = x + w/2;
    var textY = y + w/2;
    this.cxt.fillText(value, textX, textY);
};

/**
 * 清除部分区域的颜色
 * @param x
 * @param y
 * @param w
 */
Game.prototype.clearCell = function(x, y, w) {
    this.cxt.fillStyle = "#f2f2f2";
    this.cxt.fillRect(x, y, w, w);
};

/**
 * 向上移动
 */
Game.prototype.moveUp = function() {
    var tmp = this.rotateClockwise(this.cells);
    this.merge(tmp);
    this.cells = this.rotateAntiClockwise(tmp);
};

/**
 * 向下移动
 */
Game.prototype.moveDown = function() {
    var tmp = this.rotateAntiClockwise(this.cells);
    this.merge(tmp);
    this.cells = this.rotateClockwise(tmp);
};

/**
 * 向左移动
 */
Game.prototype.moveLeft = function() {
    var tmp = this.rotateClockwise(this.cells);
    tmp = this.rotateClockwise(tmp);
    this.merge(tmp);
    tmp = this.rotateAntiClockwise(tmp);
    this.cells = this.rotateAntiClockwise(tmp);

};

/**
 * 向右移动
 */
Game.prototype.moveRight = function() {
    this.cells = this.merge(this.cells);
};

/**
 * 顺时针旋转二维数组
 * @param cells
 * @returns {number[]}
 */
Game.prototype.rotateClockwise = function(cells) {
    var tmp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            var index = i * 4 + j;
            var target = j * 4 + (3 - i);
            tmp[target] = cells[index];
        }
    }
    return tmp;
};

/**
 * 逆时针旋转二维数组
 * @param cells
 * @returns {number[]}
 */
Game.prototype.rotateAntiClockwise = function(cells) {
    var tmp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            var index = i * 4 + j;
            var target = (3 - j) * 4 + i;
            tmp[target] = cells[index];
        }
    }
    return tmp
};

/**
 * 添加在空白的位置随机添加2或4
 * @returns {boolean} 是否结束
 */
Game.prototype.addRandomValue = function() {
    var emptyPosition = [];
    for(var i = 0; i < 16; i++) {
        if(this.cells[i].v == 0) { //空值
            emptyPosition.push(i);
        }
    }
    if(emptyPosition.length > 0) {
        var r1 = Math.random();
        var r2 = Math.random();
        var newValue = 2;
        var newPosition;

        if(r1 > 0.5) {
            newValue = 4;
        }
        newPosition = Math.floor(r2 * emptyPosition.length);
        this.cells[emptyPosition[newPosition]].v = newValue;
        this.cells[emptyPosition[newPosition]].e = 2;
    }
};

/**
 * 游戏是否结束
 * @returns {boolean}
 */
Game.prototype.isOver = function() {
    for(var i = 0; i < 4; i++) { // 行
        for (var j = 0; j < 4; j++) { // 列
            var index = i * 4 + j;
            var value = this.cells[index].v;
            if(value == 0 //存在空位
                || (i > 0 && this.cells[(i - 1) * 4 + j].v == value) //可向上合并
                || (i < 3 && this.cells[(i + 1) * 4 + j].v == value) //可向下合并
                || (j > 0 && this.cells[i * 4 + j - 1].v == value) //可向左合并
                || (j < 3 && this.cells[i * 4 + j + 1].v == value)) {  //可向右合并
                return false;
            }
        }
    }
    return true;
};


/**
 * 向右合并数值
 * @param cells
 * @returns Array[16]
 */
Game.prototype.merge = function(cells) {
    for(var i = 0; i < 4; i++) { // 行
        for(var j = 3; j >= 1; j--) { // 列
            var index = i * 4 + j;
            var c1 = cells[index];
            var c2 = cells[index - 1];
            if(c1.v > 0 && c2.v == 0) {
                cells[index] = {v:0, e:0};
                cells[index - 1] = c1;
            } else if(c1.v > 0 && c1.v == c2.v) {
                cells[index] = {v:0, e:0};
                cells[index - 1] = {v:2*c1.v, e:1};
                this.score += 2*c1.v;
                j--;
            }
        }
        for(j = 2; j >= 0; j--) {
            for(var k = j; k <= 2; k++) {
                index = i * 4 + k;
                c1 = cells[index];
                c2 = cells[index + 1];
                if(c1.v > 0 && c2.v == 0) {
                    cells[index] = {v:0, e:0};
                    cells[index + 1] = c1;
                }
            }
        }
    }
    return cells;
};

/**
 * 保证操作结果
 */
Game.prototype.saveCells = function() {
    for(var i = 0; i < 16; i++) {
        this.lastCells[i] = this.cells[i];
    }
};

/**
 * 判断操作是有改变布局
 * @returns {boolean}
 */
Game.prototype.isChanged = function() {
    for(var i = 0; i < 16; i++) {
        if(this.lastCells[i].v != this.cells[i].v) {
            return true;
        }
    }
    return false;
};

/**
 * 转出二维数组
 * for debug
 */
Game.prototype.printCells = function(cells) {
    if(cells == null || cells == undefined) {
        cells = this.cells;
    }
    for(var i = 0; i < 4; i++) { // 行
        var row = "";
        for(var j = 0; j < 4; j++) { // 列
            var cell = cells[i * 4 + j];
            row += "(" + cell.v + "," + cell.e + "),";
        }
        console.log(row);
    }
};

/**
 * 打印得分
 */
Game.prototype.drawScore = function() {
    this.cxt.font = "20px Microsoft YaHei";
    this.cxt.textAlign = "left";
    this.cxt.textBaseline = "middle";
    this.cxt.fillStyle = "#444444";
    this.cxt.fillText("Score: " + this.score, this.panelX, this.panelY - 20);
};

/**
 * 打印游戏结束
 */
Game.prototype.drawOver = function() {
    this.cxt.font = "20px Microsoft YaHei";
    this.cxt.textAlign = "center";
    this.cxt.textBaseline = "middle";
    this.cxt.fillStyle = "#ff6600";
    this.cxt.fillText("Game over!", this.panelX + this.panelSize/2, this.panelY - 20);
};

/**
 * 重新绘制面板和方格布局
 */
Game.prototype.createPanel = function(cells) {
    if(cells == null || cells == undefined) {
        cells = this.cells;
    }
    this.cxt.clearRect(0, 0, this.screenWidth, this.screenHeight);
    this.drawScore();
    this.drawPanel();
    for(var i = 1; i <= 16; i++) {
        this.addCell(i, 0, 0);
        var cell = cells[i - 1];
        if(cell.v > 0) {
            this.addCell(i, cell.v, cell.e);
            cells[i - 1].e = 0; // 重置特效
        }
    }
};

/**
 * 开始游戏
 */
Game.prototype.start = function() {
    this.init();
    this.addRandomValue();
    this.createPanel();
};

/**
 * 入口函数
 */
window.onload = function() {
    new Game().start();
};




