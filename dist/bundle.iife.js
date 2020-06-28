(function (exports) {
  'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /**
   * 自定义集合
   * 
   * @class jmList
   * @for jmUtils
   * @param {array} [arr] 数组，可转为当前list元素
   */
  class jmList extends Array {    
      constructor(...arg) {
          let ps = [];
          if(arg && arg.length && Array.isArray(arg[0])) {
              for(let i=0; i< arg[0].length; i++) ps.push(arg[0][i]);
              super(...ps);
          }
          else {
              super();
          }
          this.option = {}; //选项
          this.type = 'jmList';
      }
      /**
       * 往集合中添加对象
       *
       * @method add
       * @for list
       * @param {any} obj 往集合中添加的对象
       */
      add(obj) {        
          if(obj && Array.isArray(obj)) {
              for(let i=0; i < obj.length; i++) {
                  if(!this.includes(obj[i])) this.push(obj[i]);
              } 
              return obj;           
          }
          if(typeof obj == 'object' && this.includes(obj)) return obj;
          this.push(obj);
          return obj;
      }

      /**
       * 从集合中移除指定对象
       * 
       * @method remove
       * @for list
       * @param {any} obj 将移除的对象
       */
      remove(obj) {
          for(let i = this.length -1; i>=0; i--) {            
              if(this[i] == obj) {
                  this.removeAt(i);
              }
          }
      }

      /**
       * 按索引移除对象
       * 
       * @method removeAt
       * @for list
       * @param {integer} index 移除对象的索引
       */
      removeAt(index) {
          if(this.length > index) {
              let obj = this[index];
              this.splice(index,1);
              if(this.option.removeHandler)  this.option.removeHandler.call(this, obj, index);
          }
      }

      /**
       * 判断是否包含某个对象
       * 
       * @method contain
       * @for list
       * @param {any} obj 判断当前集合中是否包含此对象
       */
      contain(obj) {
          return this.includes(obj);
      }

      /**
       * 从集合中获取某个对象
       * 
       * @method get
       * @for list
       * @param {integer/function} index 如果为整型则表示为获取此索引的对象，如果为function为则通过此委托获取对象
       * @return {any} 集合中的对象
       */
      get(index) {
          if(typeof index == 'function') {
              return this.find(index);
          }
          else {
              return this[index];
          }        
      }

      /**
       * 遍历当前集合 
       *
       * @method each
       * @for list
       * @param {function} cb 遍历当前集合的委托
       * @param {boolean} inverse 是否按逆序遍历
       */
      each(cb, inverse) {
          if(cb && typeof cb == 'function') {
              //如果按倒序循环
              if(inverse) {
                  for(let i = this.length - 1;i>=0; i--) {
                      let r = cb.call(this, i, this[i]);
                      if(r === false) break;
                  }
              }
              else {
                  let len = this.length;
                 for(let i  = 0; i < len;i++) {
                      let r = cb.call(this, i, this[i]);
                      if(r === false) break;
                  } 
              }            
          }        
      }

      /**
       * 获取当前集合对象个数
       *
       * @method count
       * @param {function} [handler] 检查对象是否符合计算的条件
       * @for list
       * @return {integer} 当前集合的个数
       */
      count(handler) {
          if(handler && typeof handler == 'function') {
              let count = 0;
              let len = this.length;
              for(let i  = 0; i<len;i++) {
                  if(handler(this[i])) {
                      count ++;
                  }
              } 
              return count;
          }
          return this.length;
      }

      /**
       * 清空当前集合
       *
       * @method clear
       * @for list
       */
      clear() {
          this.splice(0, this.length);
      }
  }

  /**
   * 画图基础对象
   * 当前库的工具类
   * 
   * @class jmUtils
   * @static
   */
  class jmUtils {
      /**
       * 复制一个对象
       * 
       * @method clone
       * @static
       * @param {object} source 被复制的对象
       * @param {object} target 可选，如果指定就表示复制给这个对象，如果为boolean它就是deep参数
       * @param {boolean} deep 是否深度复制，如果为true,数组内的每个对象都会被复制
       * @return {object} 参数source的拷贝对象
       */
      static clone(source, target, deep = false) {
          if(typeof target === 'boolean') {
              deep = target;
              target = undefined;
          }

          if(source && typeof source === 'object') {
              target = target || {};

              //如果为当前泛型，则直接new
              if(this.isType(source, jmList)) {
                  return new jmList(source);
              }
              else if(Array.isArray(source)) {
                  //如果是深度复，则拷贝每个对象
                  if(deep) {
                      let dest = [];
                      for(let i=0; i<source.length; i++) {
                          dest.push(this.clone(source[i], deep));
                      }
                      return dest;
                  }
                  return source.slice(0);
              }
              target.constructor = source.constructor;
              for(let k in source) {
                  // 如果不是对象和空，则采用target的属性
                  if(typeof target[k] === 'object' || typeof target[k] === 'undefined') {                    
                      target[k] = this.clone(source[k], target[k], deep);
                  }
              }
              return target;
          }
          else if(typeof target != 'undefined') {
              return target;
          }

          return source;
      }

      /**
       * 绑定事件到html对象
       * 
       * @method bindEvent
       * @static
       * @param {element} html元素对象
       * @param {string} name 事件名称
       * @param {function} fun 事件委托
       */
      static bindEvent(target, name, fun, opt) {
          if(name &&  name.indexOf && name.indexOf(' ') != -1) {
              let ns = name.split(' ');
              for(let i=0;i<ns.length;i++) {
                  this.bindEvent(target, ns[i], fun, opt);
              }
              return;
          }
          if(target.attachEvent) {
              return target.attachEvent("on"+name, fun, opt);
          }    
          else if(target.addEventListener) {
              target.addEventListener(name, fun, opt);
              return true;
          }
          else {
              return false;
          }
      }

      /**
       * 从对象中移除事件到
       * 
       * @method removeEvent
       * @static
       * @param {element} html元素对象
       * @param {string} name 事件名称
       * @param {function} fun 事件委托
       */
      static removeEvent(target, name, fun) {
          if(target.removeEventListener) {
              return target.removeEventListener(name, fun, false);
          }    
          else if(target.detachEvent) {
              target.detachEvent('on' + name, fun);
              return true;
          }
          else {
              target['on' + name] = null;
          }
      }

      /**
       * 获取元素的绝对定位
       *
       * @method getElementPosition
       * @static
       * @param {element} el 目标元素对象
       * @return {position} 位置对象(top,left)
       */
      static getElementPosition(el) {    
          let pos = {"top": 0, "left": 0};
          if(!el) return pos;

          if (el.offsetParent) {
              while (el.offsetParent) {
                  pos.top += el.offsetTop;
                  pos.left += el.offsetLeft;
                  el = el.offsetParent;
              }
          }
          else if(el.x) {
              pos.left += el.x;
          }
          else if(el.x){
              pos.top += el.y;
          } 
          return pos;
      }
      /**
       * 获取元素事件触发的位置
       *
       * @method getEventPosition
       * @static
       * @param {eventArg} evt 当前触发事件的参数
       * @param {point} [scale] 当前画布的缩放比例
       * @return {point} 事件触发的位置 
       */
      static getEventPosition (evt, scale) {
          evt = evt || event;
          
          let isTouch = false;
          let touches = evt.changedTouches || evt.targetTouches || evt.touches;
          let target = evt.target || evt.srcElement;
          if(touches) {
              evt = touches[0];//兼容touch事件
              if(!evt.target) evt.target = target;
              isTouch = true;
          }
          let px = evt.pageX || evt.x;
          if(typeof px == 'undefined')  px = evt.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);    
          let py = evt.pageY || evt.y;
          if(typeof py == 'undefined')  py = evt.clientY + (document.documentElement.scrollTop || document.body.scrollTop);

          let ox = evt.offsetX;
          let oy = evt.offsetY;
          if(typeof ox === 'undefined' && typeof oy === 'undefined') {
              let p = this.getElementPosition(target);
              ox= px - p.left;
              oy = py - p.top;
          }
          if(scale) {
              if(scale.x) ox = ox / scale.x;
              if(scale.y) oy = oy / scale.y;
          }

          return {
              pageX: px,
              pageY: py,
              clientX: evt.clientX,
              clientY: evt.clientY,
              //相对于容器偏移量
              offsetX: ox,
              offsetY: oy,
              layerX: evt.layerX,
              layerY: evt.layerY,
              screenX: evt.screenX,
              screenY: evt.screenY,
              x: ox,
              y: oy,
              isTouch: isTouch
          };
      }

      /**
       * 检 查对象是否为指定的类型,不包括继承
       * 
       * @method isType
       * @static
       * @param {object} target 需要判断类型的对象
       * @param {class} type 对象类型
       * @return {boolean} 返回对象是否为指定类型 
       */
      static isType(target, type) {
          if(!target || typeof target !== 'object') return false;
          if(target.constructor === type) return true;
          /*if(target.__baseType) {        
              return jmUtils.isType(target.__baseType.prototype,type);
          }*/

          //return target instanceof type;
          return false;
      }
      /**
       * 判断点是否在多边形内
       * 如果一个点在多边形内部，任意角度做射线肯定会与多边形要么有一个交点，要么有与多边形边界线重叠。
       * 如果一个点在多边形外部，任意角度做射线要么与多边形有一个交点，要么有两个交点，要么没有交点，要么有与多边形边界线重叠。
       * 利用上面的结论，我们只要判断这个点与多边形的交点个数，就可以判断出点与多边形的位置关系了。
       * 
       * @method pointInPolygon
       * @static
       * @param {point} pt 坐标对象
       * @param {array} polygon 多边型角坐标对象数组
       * @param {number} offset 判断可偏移值
       * @return {integer} 0= 不在图形内和线上，1=在边上，2=在图形内部
       */
      static pointInPolygon(pt, polygon, offset) {
          offset = offset || 1;
          offset = offset / 2;
          let i, j, n = polygon.length;
          let inside = false, redo = true;

          if(!polygon || n == 0) return 0;
          if(n == 1) {
              return Math.abs(polygon[0].x - pt.x) <= offset && Math.abs(polygon[0].y - pt.y) <= offset;
          }
          
          //一条直线
          else if(n == 2) {
              //在最左边之外或在最右边之外
              if(Math.min(polygon[0].x,polygon[1].x) - pt.x > offset || 
                  pt.x - Math.max(polygon[0].x,polygon[1].x) > offset ) {
                  return 0;
              }
              //在最顶部之外或在最底部之外
              if(Math.min(polygon[0].y,polygon[1].y) - pt.y > offset || 
                  pt.y - Math.max(polygon[0].y,polygon[1].y) > offset) {
                  return 0;
              }

              //如果线为平行为纵坐标。
              if(polygon[0].x == polygon[1].x){
                  return (Math.abs(polygon[0].x - pt.x) <= offset && (pt.y - polygon[0].y) * (pt.y - polygon[1].y) <= 0)? 1:0;
              }
              //如果线为平行为横坐标。
              if(polygon[0].y == polygon[1].y){
                  return (Math.abs(polygon[0].y - pt.y) <= offset && (pt.x - polygon[0].x) * (pt.x - polygon[1].x) <= 0)? 1:0;
              }

              if(Math.abs(polygon[0].x - pt.x) < offset && Math.abs(polygon[0].y - pt.y) < offset) {
                  return 1;
              }
              if(Math.abs(polygon[1].x - pt.x) < offset && Math.abs(polygon[1].y - pt.y) < offset) {
                  return 1;
              }

              //点到直线的距离小于宽度的一半，表示在线上
              if(pt.y != polygon[0].y && pt.y != polygon[1].y) {

                  let f = (polygon[1].x - polygon[0].x) / (polygon[1].y - polygon[0].y) * (pt.y - polygon[0].y);
                  let ff = (pt.y - polygon[0].y) / Math.sqrt(f * f + (pt.y - polygon[0].y) * (pt.y - polygon[0].y));
                  let l = ff * (pt.x - polygon[0].x - f );
                  
                  return Math.abs(l) <= offset ?1:0;
              }
              return 0;
          }

          for (i = 0;i < n;++i) {
              if (polygon[i].x == pt.x &&    // 是否在顶点上
                  polygon[i].y == pt.y ) {
                  return 1;
              }
          }

          //pt = this.clone(pt);
          while (redo) {
              redo = false;
              inside = false;
              for (i = 0,j = n - 1;i < n;j = i++) {
                  if ( (polygon[i].y < pt.y && pt.y < polygon[j].y) || 
                      (polygon[j].y < pt.y && pt.y < polygon[i].y) ) {
                      if (pt.x <= polygon[i].x || pt.x <= polygon[j].x) {
                          var _x = (pt.y-polygon[i].y)*(polygon[j].x-polygon[i].x)/(polygon[j].y-polygon[i].y)+polygon[i].x;
                          if (pt.x < _x)          // 在线的左侧
                              inside = !inside;
                          else if (pt.x == _x)    // 在线上
                          {
                              return 1;
                          }
                      }
                  }
                  else if ( pt.y == polygon[i].y) {
                      if (pt.x < polygon[i].x) {    // 交点在顶点上                    
                          if(polygon[i].y > polygon[j].y) {
                              --pt.y;
                          }
                          else {
                              ++pt.y;
                          }
                          redo = true;
                          break;
                      }
                  }
                  else if ( polygon[i].y ==  polygon[j].y && // 在水平的边界线上
                      pt.y == polygon[i].y &&
                      ( (polygon[i].x < pt.x && pt.x < polygon[j].x) || 
                      (polygon[j].x < pt.x && pt.x < polygon[i].x) ) ) {
                      inside = true;
                      break;
                  }
              }
          }

          return inside ? 2:0;
      }

      /**
       * @method judge 判断点是否在多边形中
       * @param {point} dot {{x,y}} 需要判断的点
       * @param {array} coordinates {{x,y}[]} 多边形点坐标的数组，为保证图形能够闭合，起点和终点必须相等。
       *        比如三角形需要四个点表示，第一个点和最后一个点必须相同。 
       * @param  {number} 是否为实心 1= 是
       * @returns {boolean} 结果 true=在形状内
       */
      /*static judge(dot,coordinates,noneZeroMode) {
          // 默认启动none zero mode
          noneZeroMode=noneZeroMode||1;
          var x = dot.x,y=dot.y;
          var crossNum = 0;
          // 点在线段的左侧数目
          var leftCount = 0;
          // 点在线段的右侧数目
          var rightCount = 0;
          for(var i=0;i<coordinates.length-1;i++){
              var start = coordinates[i];
              var end = coordinates[i+1];
                  
              // 起点、终点斜率不存在的情况
              if(start.x===end.x) {
                  // 因为射线向右水平，此处说明不相交
                  if(x>start.x) continue;
                  
                  // 从左侧贯穿
                  if((end.y>start.y&&y>=start.y && y<=end.y)){
                      leftCount++;
                      crossNum++;
                  }
                  // 从右侧贯穿
                  if((end.y<start.y&&y>=end.y && y<=start.y)) {
                      rightCount++;
                      crossNum++;
                  }
                  continue;
              }
              // 斜率存在的情况，计算斜率
              var k=(end.y-start.y)/(end.x-start.x);
              // 交点的x坐标
              var x0 = (y-start.y)/k+start.x;
              // 因为射线向右水平，此处说明不相交
              if(x>x0) continue;
                  
              if((end.x>start.x&&x0>=start.x && x0<=end.x)){
                  crossNum++;
                  if(k>=0) leftCount++;
                  else rightCount++;
              }
              if((end.x<start.x&&x0>=end.x && x0<=start.x)) {
                  crossNum++;
                  if(k>=0) rightCount++;
                  else leftCount++;
              }
          }
          
          return noneZeroMode===1?leftCount-rightCount!==0:crossNum%2===1;
      }*/

      /**
       * 检查边界，子对象是否超出父容器边界
       * 当对象偏移offset后是否出界
       * 返回(left:0,right:0,top:0,bottom:0)
       * 如果right>0表示右边出界right偏移量,left<0则表示左边出界left偏移量
       * 如果bottom>0表示下边出界bottom偏移量,top<0则表示上边出界ltop偏移量
       *
       * @method checkOutSide
       * @static
       * @param {bound} parentBounds 父对象的边界
       * @param {bound} targetBounds 对象的边界
       * @param {number} offset 判断是否越界可容偏差
       * @return {bound} 越界标识
       */
      static checkOutSide(parentBounds, targetBounds, offset) {
          let result = {left:0,right:0,top:0,bottom:0};
          if(offset.x < 0 ) {
              result.left = targetBounds.left + offset.x - parentBounds.left;
          }
          else if(offset.x > 0 ) {
              result.right = targetBounds.right + offset.x - parentBounds.right;
          }

          if(offset.y < 0 ) {
              result.top = targetBounds.top + offset.y - parentBounds.top;
          }
          else if(offset.y > 0) {
              result.bottom = targetBounds.bottom + offset.y - parentBounds.bottom;
          }
          return result;
      }

      /**
       * 把一个或多个点绕某个点旋转一定角度
       * 先把坐标原点移到旋转中心点，计算后移回
       * @method rotatePoints
       * @static
       * @param {Array/object} p 一个或多个点
       * @param {*} rp 旋转中心点
       * @param {*} r 旋转角度
       */
      static rotatePoints(p, rp, r) {
          if(!r || !p) return p;
          let cos = Math.cos(r);
          let sin = Math.sin(r);
          if(p.length) {
              for(let i=0;i<p.length;i++) {
                  if(!p[i]) continue;
                  let x1 = p[i].x - rp.x;
                  let y1 = p[i].y - rp.y;
                  p[i].x = x1 * cos - y1 * sin + rp.x;
                  p[i].y = x1 * sin + y1 * cos + rp.y;
              }
          }
          else {
              let x1 = p.x - rp.x;
              let y1 = p.y - rp.y;
              p.x = x1 * cos - y1 * sin + rp.x;
              p.y = x1 * sin + y1 * cos + rp.y;
          }
          return p;
      }

      /**
       * 去除字符串开始字符
       * 
       * @method trimStart
       * @static
       * @param {string} source 需要处理的字符串
       * @param {char} [c] 要去除字符串的前置字符
       * @return {string} 去除前置字符后的字符串
       */
      static trimStart(source, c) {
          c = c || ' ';
          if(source && source.length > 0) {
              let sc = source[0];
              if(sc === c || c.indexOf(sc) >= 0) {
                  source = source.substring(1);
                  return this.trimStart(source,c);
              }        
          }
          return source;
      }

      /**
       * 去除字符串结束的字符c
       *
       * @method trimEnd
       * @static
       * @param {string} source 需要处理的字符串
       * @param {char} [c] 要去除字符串的后置字符
       * @return {string} 去除后置字符后的字符串
       */
      static trimEnd(source, c) {
          c = c || ' ';
          if(source && source.length > 0) {
              let sc = source[source.length - 1];
              if(sc === c || c.indexOf(sc) >= 0) {
                  source = source.substring(0,source.length - 1);
                  return this.trimStart(source,c);
              }        
          }
          return source;
      }

      /**
       * 去除字符串开始与结束的字符
       *
       * @method trim
       * @static
       * @param {string} source 需要处理的字符串
       * @param {char} [c] 要去除字符串的字符
       * @return {string} 去除字符后的字符串
       */
      static trim(source,c) {
          return this.trimEnd(this.trimStart(source,c),c);
      }

      /**
       * 检查是否为百分比参数
       *
       * @method checkPercent
       * @static
       * @param {string} 字符串参数
       * @return {boolean} true=当前字符串为百分比参数,false=不是
       */
      static checkPercent(per) {
          if(typeof per === 'string') {
              per = this.trim(per);
              if(per[per.length - 1] == '%') {
                  return per;
              }
          }
      }

      /**
       * 转换百分数为数值类型
       *
       * @method percentToNumber
       * @static
       * @param {string} per 把百分比转为数值的参数
       * @return {number} 百分比对应的数值
       */
      static percentToNumber(per) {
          if(typeof per === 'string') {
              let tmp = this.checkPercent(per);
              if(tmp) {
                  per = this.trim(tmp,'% ');
                  per = per / 100;
              }
          }
          return per;
      }

      /**
       * 转换16进制为数值
       *
       * @method hexToNumber
       * @static
       * @param {string} h 16进制颜色表达
       * @return {number} 10进制表达
       */
      static hexToNumber(h) {
          if(typeof h !== 'string') return h;

          h = h.toLowerCase();
          let hex = '0123456789abcdef';
          let v = 0;
          let l = h.length;
          for(let i=0;i<l;i++) {
              let iv = hex.indexOf(h[i]);
              if(iv == 0) continue;
              
              for(let j=1;j<l - i;j++) {
                  iv *= 16;
              }
              v += iv;
          }
          return v;
      }

      /**
       * 转换数值为16进制字符串表达
       *
       * @method hex
       * @static
       * @param {number} v 数值
       * @return {string} 16进制表达
       */
      static numberToHex(v) {
          let hex = '0123456789abcdef';
          
          let h = '';
          while(v > 0) {
              let t = v % 16;
              h = hex[t] + h;
              v = Math.floor(v / 16);
          }
          return h;
      }

      /**
       * 16进制颜色转为r g b a 对象 {r, g , b, a}
       * @param {string}} hex 16进度的颜色
       */
      static hexToRGBA(hex) {
          hex = this.trim(hex);        

          //当为7位时，表示需要转为带透明度的rgba
          if(hex[0] == '#') {
              const color = {
                  a: 1
              };
              if(hex.length >= 8) {
                  color.a = hex.substr(1,2);
                  color.g = hex.substr(5,2);
                  color.b = hex.substr(7,2);
                  color.r = hex.substr(3,2);
                  //透明度
                  color.a = (this.hexToNumber(color.a) / 255).toFixed(4);

                  color.r = this.hexToNumber(color.r||0);
                  color.g = this.hexToNumber(color.g||0);
                  color.b = this.hexToNumber(color.b||0);
                  return color; 
              }
              // #cccccc || #ccc
              else if(hex.length === 7 || hex.length === 4) {
                  // #ccc这种情况，把每个位复制一份
                  if(hex.length === 4) {
                      color.g = hex.substr(2, 1);
                      color.g = color.g + color.g;
                      color.b = hex.substr(3, 1);
                      color.b = color.b + color.b;
                      color.r = hex.substr(1, 1);
                      color.r = color.r + color.r;
                  }
                  else {
                      color.g = hex.substr(3, 2);//除#号外的第二位
                      color.b = hex.substr(5, 2);
                      color.r = hex.substr(1, 2);
                  }

                  color.r = this.hexToNumber(color.r||0);
                  color.g = this.hexToNumber(color.g||0);
                  color.b = this.hexToNumber(color.b||0);
                  
                  return color; 
              }
              //如果是5位的话，# 则第2位表示A，后面依次是r,g,b
              else if(hex.length === 5) {
                  color.a = hex.substr(1,1);
                  color.g = hex.substr(3,1);//除#号外的第二位
                  color.b = hex.substr(4,1);
                  color.r = hex.substr(2,1);

                  color.r = this.hexToNumber(color.r||0);
                  color.g = this.hexToNumber(color.g||0);
                  color.b = this.hexToNumber(color.b||0);
                  //透明度
                  color.a = (this.hexToNumber(color.a) / 255).toFixed(4);
                  return color; 
              }
          }  
          return hex;     
      }

      /**
       * 转换颜色格式，如果输入r,g,b则转为hex格式,如果为hex则转为r,g,b格式
       *
       * @method toColor
       * @static
       * @param {string} hex 16进制颜色表达
       * @return {string} 颜色字符串
       */
      static toColor(r, g, b, a) {    
          if(typeof r === 'string' && r) {
              r = this.trim(r); 
              // 正常的颜色表达，不需要转换
              if(r[0] === '#' && (r.length === 4 || r.length === 7)) return r;

              const color = this.hexToRGBA(r);
              if(typeof color === 'string') return color;
              
              r = color.r || r;
              g = color.g || g;
              b = color.b || b;
              a = color.a || a;
          }
          if(typeof r != 'undefined' && typeof g != 'undefined' && typeof b != 'undefined') {
              if(typeof a != 'undefined') {            
                  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
              }
              else {
                  return 'rgb(' + r + ',' + g + ',' + b + ')';
              }
          }
          return r;
      }
  }

  /**
   *  所有jm对象的基础对象
   * 
   * @class jmObject
   * @for jmGraph
   */
  class jmObject {
  	//id;
  	constructor(g) {
  		if(g && g.type == 'jmGraph') {
  			this.graph = g;
  		}
  		//this.id = Symbol("id"); //生成一个唯一id
  	}
  	
  	/**
  	 * 检 查对象是否为指定类型
  	 * 
  	 * @method is
  	 * @param {class} type 判断的类型
  	 * @for jmObject
  	 * @return {boolean} true=表示当前对象为指定的类型type,false=表示不是
  	 */
  	is(type) {
  		if(typeof type == 'string') {
  			return this.type == type;
  		}
  		return this instanceof type;
  	}

  	/**
  	 * 给控件添加动画处理,如果成功执行会导致画布刷新。
  	 *
  	 * @method animate
  	 * @for jmObject
  	 * @param {function} handle 动画委托
  	 * @param {integer} millisec 此委托执行间隔 （毫秒）
  	 */
  	animate(...args) {	
  		if(this.is('jmGraph')) {
  			if(args.length > 1) {			
  				if(!this.animateHandles) this.animateHandles = new jmList();
  				
  				var params = [];
  				if(args.length > 2) {
  					for(var i=2;i<args.length;i++) {
  						params.push(args[i]);
  					}
  				}		
  				this.animateHandles.add({
  					millisec: args[1] || 20, 
  					handle: args[0], 
  					params:params
  				});
  			}
  			if(this.animateHandles) {
  				if(this.animateHandles.count() > 0) {
  					var self = this;
  					//延时处理动画事件
  					this.dispatcher = setTimeout(function(_this) {
  						_this = _this || self;
  						//var needredraw = false;
  						var overduehandles = [];
  						var curTimes = new Date().getTime();
  						_this.animateHandles.each(function(i,ani) {						
  							try {
  								if(ani && ani.handle && (!ani.times || curTimes - ani.times >= ani.millisec)) {
  									var r = ani.handle.apply(_this, ani.params);
  									if(r === false) {
  										overduehandles.push(ani);//表示已完成的动画效果
  									}								
  									ani.times = curTimes;
  									//needredraw = true;								
  								}
  							}
  							catch(e) {
  								if(window.console && window.console.info) {
  									window.console.info(e.toString());
  								}
  								if(ani) overduehandles.push(ani);//异常的事件，不再执行
  							}						
  						});
  						for(var i in overduehandles) {
  							_this.animateHandles.remove(overduehandles[i]);//移除完成的效果
  						}
  						_this.animate();
  					},10,this);//刷新				
  				}
  			}
  		}	
  		else {
  			var graph = this.graph;
  			if(graph) {
  				graph.animate(...args);
  			}
  		}
  	}
  }

  const PROPERTY_KEY = Symbol("properties");

  /**
   * 对象属性管理
   * 
   * @class jmProperty
   * @extends jmObject
   * @require jmObject
   */
  class jmProperty extends jmObject {		
  	
  	constructor() {
  		super();
  		
  		this[PROPERTY_KEY] = {};
  	}

  	/**
  	 * 基础属性读写接口
  	 * @method __pro
  	 * @param {string} name 属性名
  	 * @param {any} value 属性的值
  	 * @returns {any} 属性的值
  	 */
  	__pro(...pars) {
  		if(pars) {
  			let pros = this[PROPERTY_KEY];
  			let name = pars[0];
  			if(pars.length > 1) {
  				let value = pars[1];
  				let args = {oldValue: pros[name], newValue: value};
  				pros[name] = pars[1];
  				if(this.emit) this.emit('propertyChange', name, args);
  				return pars[1];
  			}
  			else if(pars.length == 1) {
  				return pros[name];
  			}
  		}
  	}

  	/**
  	 * 是否需要刷新画板，属性的改变会导致它变为true
  	 * @property needUpdate
  	 * @type {boolean}
  	 */
  	get needUpdate() {
  		return this.__pro('needUpdate');
  	}
  	set needUpdate(v) {
  		this.__pro('needUpdate', v);
  		//子控件属性改变，需要更新整个画板
  		if(v && !this.is('jmGraph') && this.graph) {
  			this.graph.needUpdate = true;
  		}
  	}

  	/**
  	 * 当前所在的画布对象 jmGraph
  	 * @property graph
  	 * @type {jmGraph}
  	 */
  	get graph() {
  		let g = this.__pro('graph');
  		g = g || (this.__pro('graph', this.findParent('jmGraph')));
  		return g;
  	}
  	set graph(v) {
  		return this.__pro('graph', v);
  	}
  }

  /**
   * 画图阴影对象表示法
   *
   * @class jmShadow
   * @param {number} x 横坐标偏移量
   * @param {number} y 纵坐标编移量
   * @param {number} blur 模糊值
   * @param {string} color 阴影的颜色
   */

  class jmShadow {
  	constructor(x, y, blur, color) {
  		if(typeof x == 'string' && !y && !blur && !color) {
  			this.fromString(x);
  		}
  		else {
  			this.x = x;
  			this.y = y;
  			this.blur = blur;
  			this.color = color;
  		}
  	}
  	/**
  	 * 根据字符串格式转为阴影
  	 * @method fromString
  	 * @param {string} s 阴影字符串 x,y,blur,color
  	 */
  	fromString(s) {
  		if(!s) return;
  		let ms = s.match(/\s*([^,]+)\s*,\s*([^,]+)\s*(,[^,]+)?\s*(,[\s\S]+)?\s*/i);
  		if(ms) {
  			this.x = ms[1]||0;
  			this.y = ms[2]||0;
  			if(ms[3]) {
  				ms[3] = jmUtils.trim(ms[3],', ');
  				//如果第三位是颜色格式，则表示为颜色
  				if(ms[3].indexOf('#')===0 || /^rgb/i.test(ms[3])) {
  					this.color = ms[3];
  				}
  				else {
  					this.blur = jmUtils.trim(ms[3],', ');
  				}
  			}
  			if(ms[4]) {
  				this.color = jmUtils.trim(ms[4],', ');
  			}
  		}
  		return this;
  	}

  	/**
  	 * 转为字符串格式 x,y,blur,color
  	 * @method toString
  	 * @returns {string} 阴影字符串
  	 */
  	toString() {
  		let s = this.x + ',' + this.y;
  		if(this.blur) s += ',' + this.blur;
  		if(this.color) s += ',' + this.color;
  		return s;
  	}
  }

  /**
   * 渐变类
   *
   * @class jmGradient
   * @param {object} op 渐变参数,type:[linear= 线性渐变,radial=放射性渐变] 
   */
  class jmGradient {
  	constructor(opt) {
  		this.stops = new jmList();

  		if(opt && typeof opt == 'object') {
  			for(let k in opt) {
  				this[k] = opt[k];
  			}
  		}
  		//解析字符串格式
  		//linear-gradient(direction, color-stop1, color-stop2, ...);
  		//radial-gradient(center, shape size, start-color, ..., last-color);
  		else if(typeof opt == 'string') {
  			this.fromString(opt);
  		}
  	}
  	/**
  	 * 添加渐变色
  	 * 
  	 * @method addStop
  	 * @for jmGradient
  	 * @param {number} offset 放射渐变颜色偏移,可为百分比参数。
  	 * @param {string} color 当前偏移颜色值
  	 */
  	addStop(offset, color) {
  		this.stops.add({
  			offset: Number(offset),
  			color: color
  		});
  	}

  	/**
  	 * 生成为canvas的渐变对象
  	 *
  	 * @method toGradient
  	 * @for jmGradient
  	 * @param {jmControl} control 当前渐变对应的控件
  	 * @return {gradient} canvas渐变对象
  	 */
  	toGradient(control) {
  		let gradient;
  		let context = control.context || control;
  		let bounds = control.absoluteBounds?control.absoluteBounds:control.getAbsoluteBounds();
  		let x1 = this.x1||0;
  		let y1 = this.y1||0;
  		let x2 = this.x2;
  		let y2 = this.y2;

  		let location = control.getLocation();

  		let d = 0;
  		if(location.radius) {
  			d = location.radius * 2;				
  		}
  		if(!d) {
  			d = Math.min(location.width,location.height);				
  		}

  		//let offsetLine = 1;//渐变长度或半径
  		//处理百分比参数
  		if(jmUtils.checkPercent(x1)) {
  			x1 = jmUtils.percentToNumber(x1) * (location.width || d);
  		}
  		if(jmUtils.checkPercent(x2)) {
  			x2 = jmUtils.percentToNumber(x2) * (location.width || d);
  		}
  		if(jmUtils.checkPercent(y1)) {
  			y1 = jmUtils.percentToNumber(y1) * (location.height || d);
  		}
  		if(jmUtils.checkPercent(y2)) {
  			y2 = jmUtils.percentToNumber(y2) * (location.height || d);
  		}	

  		let sx1 = Number(x1) + bounds.left;
  		let sy1 = Number(y1) + bounds.top;
  		let sx2 = Number(x2) + bounds.left;
  		let sy2 = Number(y2) + bounds.top;
  		if(this.type === 'linear') {		
  			gradient = context.createLinearGradient(sx1, sy1, sx2, sy2);	
  			//let x = Math.abs(x2-x1);
  			//let y = Math.abs(y2-y1);
  			//offsetLine = Math.sqrt(x*x + y*y);
  		}
  		else if(this.type === 'radial') {
  			let r1 = this.r1||0;
  			let r2 = this.r2;
  			if(jmUtils.checkPercent(r1)) {
  				r1 = jmUtils.percentToNumber(r1);			
  				r1 = d * r1;
  			}
  			if(jmUtils.checkPercent(r2)) {
  				r2 = jmUtils.percentToNumber(r2);
  				r2 = d * r2;
  			}	
  			//offsetLine = Math.abs(r2 - r1);//二圆半径差
  			//小程序的接口特殊
  			if(context.createCircularGradient) { 
  				gradient = context.createCircularGradient(sx1, sy1, r2);
  			}
  			else {
  				gradient = context.createRadialGradient(sx1, sy1, r1, sx2, sy2, r2);	
  			}	
  		}
  		//颜色渐变
  		this.stops.each(function(i,s) {	
  			let c = jmUtils.toColor(s.color);
  			//s.offset 0.0 ~ 1.0
  			gradient.addColorStop(s.offset, c);		
  		});
  		
  		return gradient;
  	}

  	/**
  	 * 变换为字条串格式
  	 * linear-gradient(x1 y1 x2 y2, color1 step, color2 step, ...);	//radial-gradient(x1 y1 r1 x2 y2 r2, color1 step,color2 step, ...);
  	 * linear-gradient线性渐变，x1 y1表示起点，x2 y2表示结束点,color表颜色，step为当前颜色偏移
  	 * radial-gradient径向渐变,x1 y1 r1分别表示内圆中心和半径，x2 y2 r2为结束圆 中心和半径，颜色例似线性渐变 step为0-1之间
  	 *
  	 * @method fromString
  	 * @for jmGradient
  	 * @return {string} 
  	 */
  	fromString(s) {
  		if(!s) return;
  		let ms = s.match(/(linear|radial)-gradient\s*\(\s*([^,]+)\s*,\s*((.|\s)+)\)/i);
  		if(!ms || ms.length < 3) return;
  		this.type = ms[1].toLowerCase();		
  		
  		const ps = jmUtils.trim(ms[2]).split(/\s+/);
  		//线性渐变
  		if(this.type == 'linear') {
  			if(ps.length <= 2) {
  				this.x2 = ps[0];
  				this.y2 = ps[1]||0;
  			}
  			else {
  				this.x1 = ps[0];
  				this.y1 = ps[1];
  				this.x2 = ps[2];
  				this.y2 = ps[3];
  			}
  		}
  		//径向渐变
  		else {
  			if(ps.length <= 3) {
  				this.x2 = ps[0];
  				this.y2 = ps[1]||0;
  				this.r2 = ps[2]||0;
  			}
  			else {
  				this.x1 = ps[0];
  				this.y1 = ps[1];
  				this.r1 = ps[2];
  				this.x2 = ps[3];
  				this.y2 = ps[3];
  				this.r2 = ps[3];
  			}
  		}
  		//解析颜色偏移
  		//color step
  		const pars = ms[3].match(/((rgb(a)?\s*\([\d,\.\s]+\))|(#[a-zA-Z\d]+))\s+([\d\.]+)/ig);
  		if(pars && pars.length) {
  			for(let i=1;i<pars.length;i++) {
  				const par = jmUtils.trim(pars[i]);
  				const spindex = par.lastIndexOf(' ');
  				if(spindex > -1) {			
  					const offset = Number(par.substr(spindex + 1));		
  					const color = jmUtils.trim(par.substr(0, spindex));
  					if(!isNaN(offset) && color) {
  						this.addStop(offset, color);
  					}
  				}
  			}
  		}
  	}

  	/**
  	 * 转换为渐变的字符串表达
  	 *
  	 * @method toString
  	 * @for jmGradient
  	 * @return {string} linear-gradient(x1 y1 x2 y2, color1 step, color2 step, ...);	//radial-gradient(x1 y1 r1 x2 y2 r2, color1 step,color2 step, ...);
  	 */
  	toString() {
  		let str = this.type + '-gradient(';
  		if(this.type == 'linear') {
  			str += this.x1 + ' ' + this.y1 + ' ' + this.x2 + ' ' + this.y2;
  		}
  		else {
  			str += this.x1 + ' ' + this.y1 + ' ' + this.r1 + ' ' + this.x2 + ' ' + this.y2 + ' ' + this.r2;
  		}
  		//颜色渐变
  		this.stops.each(function(i,s) {	
  			str += ',' + s.color + ' ' + s.offset;
  		});
  		return str + ')';
  	}
  }

  /**
   * 事件模型
   *
   * @class jmEvents
   * @for jmGraph
   */
  class jmEvents {

  	constructor(container, target) {
  		this.container = container;
  		this.target = target || container;
  		this.mouseHandler = new jmMouseEvent(this, container, target);
  		this.keyHandler = new jmKeyEvent(this, container, target);
  	}

  	touchStart(evt) {
  		evt = evt || window.event;
  		this.container.raiseEvent('touchstart',evt);
  		let t = evt.target || evt.srcElement;
  		if(t == this.target) {
  			//if(evt.preventDefault) evt.preventDefault();
  			return false;
  		}
  	};

  	touchMove(evt) {
  		evt = evt || window.event;
  		this.container.raiseEvent('touchmove',evt);
  		let t = evt.target || evt.srcElement;
  		if(t == this.target) {
  			//if(evt.preventDefault) evt.preventDefault();
  			return false;
  		}
  	};

  	touchEnd(evt) {
  		evt = evt || window.event;
  		
  		this.container.raiseEvent('touchend',evt);
  		let t = evt.target || evt.srcElement;
  		if(t == this.target) {
  			//if(evt.preventDefault) evt.preventDefault();
  			return false;
  		}
  	};

  	touchCancel(evt) {
  		evt = evt || window.event;
  		
  		this.container.raiseEvent('touchcancel',evt);
  		let t = evt.target || evt.srcElement;
  		if(t == target) {
  			//if(evt.preventDefault) evt.preventDefault();
  			return false;
  		}
  	};
  }

  /**
   * 鼠标事件处理对象，container 为事件主体，target为响应事件对象
   */
  class jmMouseEvent {
  	constructor(instance, container, target) {
  		this.instance = instance;
  		this.container = container;
  		this.target = target || container;

  		this.init(instance, container, target);
  	}
  	
  	init(instance, container, target) {
  		let canvas = this.target;	
  		let doc = typeof typeof document != 'undefined'?document:null;
  		//禁用鼠标右健系统菜单
  		//canvas.oncontextmenu = function() {
  		//	return false;
  		//};

  		jmUtils.bindEvent(this.target,'mousedown',function(evt) {
  			evt = evt || window.event;
  			let r = container.raiseEvent('mousedown',evt);
  			//if(r === false) {
  				//if(evt.preventDefault) evt.preventDefault();
  				//return false;
  			//}				
  		});
  		
  		doc && jmUtils.bindEvent(doc,'mousemove',function(evt) {	
  			evt = evt || window.event;		
  			let target = evt.target || evt.srcElement;
  			if(target == canvas) {
  				let r = container.raiseEvent('mousemove',evt);
  				//if(r === false) {
  					if(evt.preventDefault) evt.preventDefault();
  					return false;
  				//}		
  			}				
  		});
  		
  		jmUtils.bindEvent(this.target,'mouseover',function(evt) {
  			evt = evt || window.event;
  			container.raiseEvent('mouseover',evt);
  		});
  		jmUtils.bindEvent(this.target,'mouseleave',function(evt) {
  			evt = evt || window.event;
  			container.raiseEvent('mouseleave',evt);
  		});			
  		jmUtils.bindEvent(this.target,'mouseout',function(evt) {
  			evt = evt || window.event;
  			container.raiseEvent('mouseout',evt);
  		});
  		doc && jmUtils.bindEvent(doc,'mouseup',function(evt) {
  			evt = evt || window.event;
  			//let target = evt.target || evt.srcElement;
  			//if(target == canvas) {						
  				let r = container.raiseEvent('mouseup',evt);
  				if(r === false) {
  					if(evt.preventDefault) evt.preventDefault();
  					return false;
  				}					
  			//}
  		});
  		
  		jmUtils.bindEvent(this.target,'dblclick',function(evt) {
  			evt = evt || window.event;
  			container.raiseEvent('dblclick',evt);
  		});
  		jmUtils.bindEvent(this.target,'click',function(evt) {
  			evt = evt || window.event;
  			container.raiseEvent('click',evt);
  		});

  		doc && jmUtils.bindEvent(doc,'resize',function(evt) {
  			evt = evt || window.event;
  			return container.raiseEvent('resize',evt);
  		});

  		// passive: false 为了让浏览器不告警并且preventDefault有效
  		// 另一种处理：touch-action: none; 这样任何触摸事件都不会产生默认行为，但是 touch 事件照样触发。
  		jmUtils.bindEvent(this.target,'touchstart', function(evt) {
  			return instance.touchStart(evt);
  		},{ passive: false });

  		doc && jmUtils.bindEvent(doc,'touchmove', function(evt) {
  			return instance.touchMove(evt);
  		},{ passive: false });

  		doc && jmUtils.bindEvent(doc,'touchend', function(evt) {
  			return instance.touchEnd(evt);
  		},{ passive: false });

  		doc && jmUtils.bindEvent(doc,'touchcancel', function(evt) {
  			return instance.touchCancel(evt);
  		},{ passive: false });
  	}
  }

  /**
   * 健盘事件处理对象，container 为事件主体，target为响应事件对象
   */
  class jmKeyEvent {
  	constructor(instance, container,target) {
  		this.instance = instance;
  		this.container = container;
  		this.target = target || container;

  		this.init(container, target);
  	}

  	/**
  	 * 初始化健盘事件
  	 */
  	init(container, target) {
  		let doc = typeof typeof document != 'undefined'?document:null;
  		/**
  		 * 检查是否触发健盘事件至画布
  		 * 如果触发对象为输入框等对象则不响应事件
  		 *  
  		 */
  		let checkKeyEvent = (evt) => {
  			let target = evt.srcElement || evt.target;
  			if(target && (target.tagName == 'INPUT' 
  				|| target.tagName == 'TEXTAREA'
  				|| target.tagName == 'ANCHOR' 
  				|| target.tagName == 'FORM' 
  				|| target.tagName == 'FILE'
  				|| target.tagName == 'IMG'
  				|| target.tagName == 'HIDDEN'
  				|| target.tagName == 'RADIO'
  				|| target.tagName == 'TEXT'	)) {
  				return false;
  			}
  			return true;
  		};

  		doc && jmUtils.bindEvent(doc,'keypress',function(evt) {
  			evt = evt || window.event;
  			if(!checkKeyEvent(evt)) return;//如果事件为其它输入框，则不响应
  			let r = container.raiseEvent('keypress',evt);
  			if(r === false && evt.preventDefault) 
  				evt.preventDefault();
  			return r;
  		});
  		doc && jmUtils.bindEvent(doc,'keydown',function(evt) {
  			evt = evt || window.event;
  			if(!checkKeyEvent(evt)) return;//如果事件为其它输入框，则不响应
  			let r = container.raiseEvent('keydown',evt);
  			if(r === false && evt.preventDefault) 
  				evt.preventDefault();
  			return r;
  		});
  		doc && jmUtils.bindEvent(doc,'keyup',function(evt) {
  			evt = evt || window.event;
  			if(!checkKeyEvent(evt)) return;//如果事件为其它输入框，则不响应
  			let r = container.raiseEvent('keyup',evt);
  			if(r === false && evt.preventDefault) 
  				evt.preventDefault();
  			return r;
  		});			
  	}
  }

  /**
   * 控件基础对象
   * 控件的基础属性和方法
   *
   * @class jmControl
   * @extends jmProperty
   */	
  class jmControl extends jmProperty {	

  	constructor(params, t) {
  		params = params||{};
  		super();
  		this.__pro('type', t || new.target.name);
  		this.style = params && params.style ? params.style : {};
  		//this.position = params.position || {x:0,y:0};
  		this.width = params.width || 0;
  		this.height = params.height  || 0;

  		if(params.position) {
  			this.position = params.position;
  		}

  		this.graph = params.graph || null;
  		this.zIndex = params.zIndex || 0;
  		this.interactive = typeof params.interactive == 'undefined'? true : params.interactive;

  		//样式名称，也当做白名单使用		
  		this.jmStyleMap = {
  			'fill':'fillStyle',
  			'stroke':'strokeStyle',
  			'shadow.blur':'shadowBlur',
  			'shadow.x':'shadowOffsetX',
  			'shadow.y':'shadowOffsetY',
  			'shadow.color':'shadowColor',
  			'lineWidth' : 'lineWidth',
  			'miterLimit': 'miterLimit',
  			'fillStyle' : 'fillStyle',
  			'strokeStyle' : 'strokeStyle',
  			'font' : 'font',
  			'opacity' : 'globalAlpha',
  			'textAlign' : 'textAlign',
  			'textBaseline' : 'textBaseline',
  			'shadowBlur' : 'shadowBlur',
  			'shadowOffsetX' : 'shadowOffsetX',
  			'shadowOffsetY' : 'shadowOffsetY',
  			'shadowColor' : 'shadowColor',
  			'lineJoin': 'lineJoin',//线交汇处的形状,miter(默认，尖角),bevel(斜角),round（圆角）
  			'lineCap':'lineCap' //线条终端点,butt(默认，平),round(圆),square（方）
  		};

  		this.initializing();	
  		
  		this.on = this.bind;
  		
  		this.options = params;
  	}

  	//# region 定义属性
  	/**
  	 * 当前对象类型名jmRect
  	 *
  	 * @property type
  	 * @type string
  	 */
  	get type() {
  		return this.__pro('type');
  	}

  	/**
  	 * 当前canvas的context
  	 * @property context
  	 * @type {object}
  	 */
  	get context() {
  		let s = this.__pro('context');
  		if(s) return s;
  		else if(this.is('jmGraph') && this.canvas) {
  			return this.context = this.canvas.getContext('2d');
  		}
  		let g = this.graph;
  		if(g) return g.context;
  		return g.canvas.getContext('2d');
  	}
  	set context(v) {
  		return this.__pro('context', v);
  	}

  	/**
  	 * 样式
  	 * @property style
  	 * @type {object}
  	 */
  	get style() {
  		let s = this.__pro('style');
  		if(!s) s = this.__pro('style', {});
  		return s;
  	}
  	set style(v) {
  		this.needUpdate = true;
  		return this.__pro('style', v);
  	}

  	/**
  	 * 当前控件是否可见
  	 * @property visible
  	 * @default true
  	 * @type {boolean}
  	 */
  	get visible() {
  		let s = this.__pro('visible');
  		if(typeof s == 'undefined') s = this.__pro('visible', true);
  		return s;
  	}
  	set visible(v) {
  		this.needUpdate = true;
  		return this.__pro('visible', v);
  	}	

  	/**
  	 * 当前控件是否是交互式的，如果是则会响应鼠标或touch事件。
  	 * 如果false则不会主动响应，但冒泡的事件依然会得到回调
  	 * @property interactive
  	 * @default false
  	 * @type {boolean}
  	 */
  	get interactive() {
  		let s = this.__pro('interactive');
  		return s;
  	}
  	set interactive(v) {
  		return this.__pro('interactive', v);
  	}
  		
  	/**
  	 * 当前控件的子控件集合
  	 * @property children
  	 * @type {list}
  	 */
  	get children() {
  		let s = this.__pro('children');
  		if(!s) s = this.__pro('children', new jmList());
  		return s;
  	}
  	set children(v) {
  		this.needUpdate = true;
  		return this.__pro('children', v);
  	}

  	/**
  	 * 宽度
  	 * @property width
  	 * @type {number}
  	 */
  	get width() {
  		let s = this.__pro('width');
  		if(typeof s == 'undefined') s = this.__pro('width', 0);
  		return s;
  	}
  	set width(v) {
  		this.needUpdate = true;
  		return this.__pro('width', v);
  	}

  	/**
  	 * 高度
  	 * @property height
  	 * @type {number}
  	 */
  	get height() {
  		let s = this.__pro('height');
  		if(typeof s == 'undefined') s = this.__pro('height', 0);
  		return s;
  	}
  	set height(v) {
  		this.needUpdate = true;
  		return this.__pro('height', v);
  	}

  	/**
  	 * 控件层级关系，发生改变时，需要重新调整排序
  	 * @property zIndex
  	 * @type {number}
  	 */
  	get zIndex() {
  		let s = this.__pro('zIndex');
  		if(!s) s = this.__pro('zIndex', 0);
  		return s;
  	}
  	set zIndex(v) {
  		this.needUpdate = true;
  		this.__pro('zIndex', v);
  		this.children.sort();//层级发生改变，需要重新排序
  		this.needUpdate = true;
  		return v;
  	}

  	/**
  	 * 设置鼠标指针
  	 * css鼠标指针标识,例如:pointer,move等
  	 * 
  	 * @property cursor
  	 * @type {string}
  	 */
  	set cursor(cur) {	
  		var graph = this.graph ;
  		if(graph) {		
  			graph.css('cursor',cur);		
  		}
  	}
  	get cursor() {
  		var graph = this.graph ;
  		if(graph) {		
  			return graph.css('cursor');		
  		}
  	}

  	//# end region

  	/**
  	 * 初始化对象，设定样式，初始化子控件对象
  	 * 此方法为所有控件需调用的方法
  	 *
  	 * @method initializing
  	 * @for jmControl
  	 */
  	initializing() {

  		var self = this;
  		//定义子元素集合
  		this.children = this.children || new jmList();
  		var oadd = this.children.add;
  		//当把对象添加到当前控件中时，设定其父节点
  		this.children.add = function(obj) {
  			if(typeof obj === 'object') {
  				if(obj.parent && obj.parent != self && obj.parent.children) {
  					obj.parent.children.remove(obj);//如果有父节点则从其父节点中移除
  				}
  				obj.parent = self;
  				//如果存在先移除
  				if(this.contain(obj)) {
  					this.oremove(obj);
  				}
  				oadd.call(this, obj);
  				obj.emit('add', obj);

  				self.needUpdate = true;
  				if(self.graph) obj.graph = self.graph;
  				this.sort();//先排序
  				//self.emit('addChild', obj);
  				return obj;
  			}
  		};
  		this.children.oremove= this.children.remove;
  		//当把对象从此控件中移除时，把其父节点置为空
  		this.children.remove = function(obj) {
  			if(typeof obj === 'object') {				
  				obj.parent = null;
  				obj.graph = null;
  				obj.remove(true);
  				this.oremove(obj);
  				self.needUpdate = true;
  				//self.emit('removeChild', obj, index);
  			}
  		};
  		/**
  		 * 根据控件zIndex排序，越大的越高
  		 */
  		this.children.sort = function() {
  			const levelItems = {};
  			//提取zindex大于0的元素
  			//为了保证0的层级不改变，只能把大于0的提出来。
  			this.each(function(i, obj) {
  				if(!obj) return;
  				let zindex = obj.zIndex;
  				if(!zindex && obj.style && obj.style.zIndex) {
  					zindex = Number(obj.style.zIndex);
  					if(isNaN(zindex)) zindex=obj.style.zIndex||0;
  				}
  				if(zindex) {
  					let items = levelItems[zindex] || (levelItems[zindex] = []);
  					items.push(obj);					
  				}
  			});
  			
  			for(let index in levelItems) {
  				// 先从数组内去掉， 再加到进后
  				for(let i=0; i< levelItems[index].length; i++) {
  					this.oremove(levelItems[index][i]);
  				}
  				oadd.call(this, levelItems[index]);
  			}

  			self.needUpdate = true;
  		};
  		this.children.clear = function() {
  			this.each(function(i,obj) {
  				this.remove(obj);
  			},true);
  		};
  		this.needUpdate = true;
  	} 

  	/**
  	 * 设定样式到context
  	 * 处理样式映射，转换渐变和阴影对象为标准canvas属性
  	 * 样式一览
  		| 简化名称 | 原生名称 | 说明
  		| :- | :- | :- | 
  		| fill | fillStyle | 用于填充绘画的颜色、渐变或模式
  		| stroke | strokeStyle | 用于笔触的颜色、渐变或模式
  		| shadow | 没有对应的 | 最终会解析成以下几个属性，格式：'0,0,10,#fff'或g.createShadow(0,0,20,'#000');
  		| shadow.blur | shadowBlur | 用于阴影的模糊级别
  		| shadow.x | shadowOffsetX | 阴影距形状的水平距离
  		| shadow.y | shadowOffsetY | 阴影距形状的垂直距离
  		| shadow.color | shadowColor | 阴影颜色，格式：'#000'、'#46BF86'、'rgb(255,255,255)'或'rgba(39,72,188,0.5)'
  		| lineWidth | lineWidth | 当前的线条宽度
  		| miterLimit | miterLimit | 最大斜接长度
  		| font | font | 请使用下面的 fontSize 和 fontFamily
  		| fontSize | font | 字体大小
  		| fontFamily | font | 字体
  		| opacity | globalAlpha | 绘图的当前 alpha 或透明值
  		| textAlign | textAlign | 文本内容的当前对齐方式
  		| textBaseline | textBaseline | 在绘制文本时使用的当前文本基线
  		| lineJoin | lineJoin | 两条线相交时，所创建的拐角类型：miter(默认，尖角),bevel(斜角),round（圆角）
  		| lineCap | lineCap | 线条的结束端点样式：butt(默认，平),round(圆),square（方）
  	 * 
  	 * @method setStyle
  	 * @for jmControl
  	 * @private
  	 * @param {style} style 样式对象，如:{fill:'black',stroke:'red'}
  	 */
  	setStyle(style) {
  		style = style || this.style;
  		if(!style) return;

  		/**
  		 * 样式设定
  		 * 
  		 * @method __setStyle
  		 * @private
  		 * @param {jmControl} control 当前样式对应的控件对象
  		 * @param {style} style 样式
  		 * @param {string} name 样式名称
  		 * @param {string} mpkey 样式名称在映射中的key(例如：shadow.blur为模糊值)
  		 */
  		let __setStyle = (style, name, mpkey) => {
  			//let styleValue = style[mpkey||name]||style;
  			if(style) {				
  				
  				let t = typeof style;	
  				let mpname = this.jmStyleMap[mpkey || name];

  				//如果为渐变对象
  				if((style instanceof jmGradient) || (t == 'string' && style.indexOf('-gradient') > -1)) {
  					//如果是渐变，则需要转换
  					if(t == 'string' && style.indexOf('-gradient') > -1) {
  						style = new jmGradient(style);
  					}
  					__setStyle(style.toGradient(this), mpname||name);	
  				}
  				else if(t == 'function') {					
  					if(mpname) {
  						style = style.call(this, mpname);
  						if(style) {
  							__setStyle(style, mpname);	
  						}
  					}
  				}
  				else if(mpname) {
  					//只有存在白名单中才处理
  					//颜色转换
  					if(t == 'string' && ['fillStyle', 'strokeStyle', 'shadowColor'].indexOf(mpname) > -1) {
  						style = jmUtils.toColor(style);
  					}					
  					this.context[mpname] = style;
  				}	
  				else {
  					switch(name) {
  						//阴影样式
  						case 'shadow' : {
  							if(t == 'string') {
  								__setStyle(new jmShadow(style), name);
  								break;
  							}
  							for(let k in style) {
  								__setStyle(style[k], k, name + '.' + k);
  							}
  							break;
  						}
  						//平移
  						case 'translate' : {
  							this.context.translate(style.x,style.y);
  							break;
  						}
  						//旋转
  						case 'rotation' : {	
  							if(!style.angle) break;							
  							//旋 转先移位偏移量
  							let tranX = 0;
  							let tranY = 0;
  							//旋转，则移位，如果有中心位则按中心旋转，否则按左上角旋转
  							//这里只有style中的旋转才能生效，不然会导至子控件多次旋转
  							if(style.point) {
  								let bounds = this.absoluteBounds?this.absoluteBounds:this.getAbsoluteBounds();
  								style = this.getRotation(style);
  								
  								tranX = style.rotateX + bounds.left;
  								tranY = style.rotateY + bounds.top;	
  							}
  												
  							if(tranX!=0 || tranY != 0) this.context.translate(tranX,tranY);
  							this.context.rotate(style.angle);
  							if(tranX!=0 || tranY != 0) this.context.translate(-tranX,-tranY);
  							break;
  						}
  						case 'transform' : {
  							if(Array.isArray(style)) {
  								this.context.transform.apply(this.context, style);
  							}
  							else if(typeof style == 'object') {
  								this.context.transform(style.scaleX,//水平缩放
  									style.skewX,//水平倾斜
  									style.skewY,//垂直倾斜
  									style.scaleY,//垂直缩放
  									style.offsetX,//水平位移
  									style.offsetY);//垂直位移
  							}								
  							break;
  						}
  						//位移
  						case 'translate' : {
  							this.context.translate(style.x,style.y);			
  							break;
  						}
  						//鼠标指针
  						case 'cursor' : {
  							this.cursor = style;
  							break;
  						}
  					}							
  				}
  			}
  		};	

  		//一些特殊属性要先设置，否则会导致顺序不对出现错误的效果
  		if(this.translate) {
  			__setStyle({translate: this.translate}, 'translate');
  		}
  		if(this.transform) {
  			__setStyle({transform: this.transform}, 'transform');
  		}
  		//设置样式
  		for(let k in style) {
  			let t = typeof style[k];
  			//先处理部分样式，以免每次都需要初始化解析
  			if(t == 'string' && style[k].indexOf('-gradient') > -1) {
  				style[k] = new jmGradient(style[k]);
  			}
  			else if(t == 'string' && k == 'shadow') {
  				style[k] = new jmShadow(style[k]);
  			}
  			__setStyle(style[k], k);
  		}
  	}

  	/**
  	 * 获取当前控件的边界
  	 * 通过分析控件的描点或位置加宽高得到为方形的边界
  	 *
  	 * @method getBounds
  	 * @for jmControl
  	 * @param {boolean} [isReset=false] 是否强制重新计算
  	 * @return {object} 控件的边界描述对象(left,top,right,bottom,width,height)
  	 */
  	getBounds(isReset) {
  		//如果当次计算过，则不重复计算
  		if(this.bounds && !isReset) return this.bounds;

  		let rect = {}; // left top
  		//jmGraph，特殊处理
  		if(this.type == 'jmGraph' && this.canvas) {
  			if(typeof this.canvas.width === 'function') {
  				rect.right = this.canvas.width(); 
  			}
  			else if(this.canvas.width) {
  				rect.right = this.canvas.width; 
  			}
  			else if(this.width) {
  				rect.right = this.width;
  			}
  			
  			if(typeof this.canvas.height === 'function') {
  				rect.bottom = this.canvas.height(); 
  			}
  			else if(this.canvas.height) {
  				rect.bottom = this.canvas.height; 
  			}
  			else if(this.height) {
  				rect.bottom = this.height;
  			}
  		}
  		else if(this.points && this.points.length > 0) {		
  			for(let i in this.points) {
  				let p = this.points[i];
  				if(typeof rect.left === 'undefined' || rect.left > p.x) {
  					rect.left = p.x;
  				}
  				if(typeof rect.top === 'undefined'  || rect.top > p.y) {
  					rect.top = p.y;
  				}

  				if(typeof rect.right === 'undefined'  || rect.right < p.x) {
  					rect.right = p.x;
  				}
  				if(typeof rect.bottom === 'undefined' || rect.bottom < p.y) {
  					rect.bottom = p.y;
  				}
  			}
  		}
  		else if(this.getLocation) {
  			let p = this.getLocation();
  			if(p) {
  				rect.left = p.left;
  				rect.top = p.top;
  				rect.right = p.left + p.width;
  				rect.bottom = p.top + p.height;
  			}		
  		}
  		if(!rect.left) rect.left = 0; 
  		if(!rect.top) rect.top = 0; 
  		if(!rect.right) rect.right = 0; 
  		if(!rect.bottom) rect.bottom = 0; 
  		rect.width = rect.right - rect.left;
  		rect.height = rect.bottom - rect.top;
  		return this.bounds=rect;
  	}

  	/**
  	 * 获取当前控件的位置相关参数
  	 * 解析百分比和margin参数
  	 *
  	 * @method getLocation
  	 * @return {object} 当前控件位置参数，包括中心点坐标，右上角坐标，宽高
  	 */
  	getLocation(clone=true) {
  		//如果已经计算过则直接返回
  		//在开画之前会清空此对象
  		//if(reset !== true && this.location) return this.location;

  		let local = this.location = {left: 0,top: 0,width: 0,height: 0};
  		local.position = typeof this.position == 'function'? this.position(): jmUtils.clone(this.position);	
  		local.center = this.center && typeof this.center === 'function'?this.center(): jmUtils.clone(this.center);//中心
  		local.start = this.start && typeof this.start === 'function'?this.start(): jmUtils.clone(this.start);//起点
  		local.end = this.end && typeof this.end === 'function'?this.end(): jmUtils.clone(this.end);//起点
  		local.radius = this.radius;//半径
  		local.width = this.width;
  		local.height = this.height;

  		let margin = this.style.margin || {};
  		margin.left = margin.left || 0;
  		margin.top = margin.top || 0;
  		margin.right = margin.right || 0;
  		margin.bottom = margin.bottom || 0;
  		
  		//如果没有指定位置，但指定了margin。则位置取margin偏移量
  		if(local.position) {
  			local.left = local.position.x;
  			local.top = local.position.y;
  		}
  		else {
  			local.left = margin.left;
  			local.top = margin.top;
  		}

  		if(!this.parent) return local;//没有父节点则直接返回
  		let parentBounds = this.parent.getBounds();	

  		//处理百分比参数
  		if(jmUtils.checkPercent(local.left)) {
  			local.left = jmUtils.percentToNumber(local.left) * parentBounds.width;
  		}
  		if(jmUtils.checkPercent(local.top)) {
  			local.top = jmUtils.percentToNumber(local.top) * parentBounds.height;
  		}
  		
  		//如果没有指定宽度或高度，则按百分之百计算其父宽度或高度
  		if(jmUtils.checkPercent(local.width)) {
  			local.width = jmUtils.percentToNumber(local.width) * parentBounds.width;
  		}
  		if(jmUtils.checkPercent(local.height)) {
  			local.height = jmUtils.percentToNumber(local.height) * parentBounds.height;
  		}
  		//处理中心点
  		if(local.center) {
  			//处理百分比参数
  			if(jmUtils.checkPercent(local.center.x)) {
  				local.center.x = jmUtils.percentToNumber(local.center.x) * parentBounds.width;
  			}
  			if(jmUtils.checkPercent(local.center.y)) {
  				local.center.y = jmUtils.percentToNumber(local.center.y) * parentBounds.height;
  			}
  		}
  		if(local.radius) {
  			//处理百分比参数
  			if(jmUtils.checkPercent(local.radius)) {
  				local.radius = jmUtils.percentToNumber(local.radius) * Math.min(parentBounds.width, parentBounds.height);
  			}		
  		}
  		return local;
  	}

  	/**
  	 * 获取当前控制的旋转信息
  	 * @returns {object} 旋转中心和角度
  	 */
  	getRotation(rotation) {
  		rotation = rotation || this.style.rotation;
  		if(!rotation) {
  			//如果本身没有，则可以继承父级的
  			rotation = this.parent && this.parent.getRotation?this.parent.getRotation():null;
  			//如果父级有旋转，则把坐标转换为当前控件区域
  			if(rotation) {
  				let bounds = this.getBounds();
  				rotation.rotateX -= bounds.left;
  				rotation.rotateY -= bounds.top;
  			}
  		}
  		else {
  			let bounds = this.getBounds();
  			rotation.rotateX = rotation.point.x;
  			if(jmUtils.checkPercent(rotation.rotateX)) {
  				rotation.rotateX  = jmUtils.percentToNumber(rotation.rotateX) * bounds.width;
  			}

  			rotation.rotateY = rotation.point.y;
  			if(jmUtils.checkPercent(rotation.rotateY)) {
  				rotation.rotateY  = jmUtils.percentToNumber(rotation.rotateY) * bounds.height;
  			}
  		}
  		return rotation;

  	}

  	/**
  	 * 移除当前控件
  	 * 如果是VML元素，则调用其删除元素
  	 *
  	 * @method remove 
  	 */
  	remove() {	
  		if(this.parent) {
  			this.parent.children.remove(this);
  		}
  	}

  	/**
  	 * 对控件进行平移
  	 * 遍历控件所有描点或位置，设置其偏移量。
  	 *
  	 * @method offset
  	 * @param {number} x x轴偏移量
  	 * @param {number} y y轴偏移量
  	 * @param {boolean} [trans] 是否传递,监听者可以通过此属性是否决定是否响应移动事件,默认=true
  	 * @param {object} [evt] 如果是事件触发，则传递move事件参数
  	 */
  	offset(x, y, trans, evt) {
  		trans = trans === false?false:true;	
  		let local = this.getLocation(true);		
  		let offseted = false;
  		
  		if(local.position) {
  			local.left += x;
  			local.top += y;
  			// 由于local是clone出来的对象，为了保留位移，则要修改原属性
  			this.position.x = local.left;
  			this.position.y = local.top;
  			offseted = true;
  		}

  		if(local.center) {		
  			this.center.x = local.center.x + x;
  			this.center.y = local.center.y + y;
  			offseted = true;
  		}

  		if(local.start && typeof local.start == 'object') {	
  			this.start.x = local.start.x + x;
  			this.start.y = local.start.y + y;
  			offseted = true;
  		}

  		if(local.end && typeof local.end == 'object') {		
  			this.end.x = local.end.x + x;
  			this.end.y = local.end.y + y;
  			offseted = true;
  		}


  		if(offseted == false && this.cpoints) {
  			let p = typeof this.cpoints == 'function'?this.cpoints:this.cpoints;
  			if(p) {			
  				let len = p.length;
  				for(let i=0; i < len;i++) {
  					p[i].x += x;
  					p[i].y += y;
  				}		
  				offseted = true;
  			}			
  		}
  		
  		if(offseted == false && this.points) {
  			let len = this.points.length;
  			for(let i=0; i < len;i++) {
  				this.points[i].x += x;
  				this.points[i].y += y;
  			}
  			offseted = true;
  		}
  		
  		//触发控件移动事件	
  		this.emit('move',{
  			offsetX: x,
  			offsetY: y,
  			trans: trans,
  			evt: evt
  		});

  		this.needUpdate = true;
  	}

  	/**
  	 * 把图形旋转一个角度
  	 * @param {number} angle 旋转角度
  	 * @param {object} point 旋转坐标，可以是百分比,例如：{x: '50%',y: '50%'}
  	 */
  	rotate(angle, point) {	
  		/*this.children.each(function(i,c){
  			c.rotate(angle);
  		});*/
  		this.style.rotation = {
  			angle: angle,
  			point: point
  		};

  		this.needUpdate = true;
  	}

  	/**
  	 * 获取控件相对于画布的绝对边界，
  	 * 与getBounds不同的是：getBounds获取的是相对于父容器的边界.
  	 *
  	 * @method getAbsoluteBounds
  	 * @return {object} 边界对象(left,top,right,bottom,width,height)
  	 */
  	getAbsoluteBounds() {
  		//当前控件的边界，
  		let rec = this.getBounds();
  		if(this.parent && this.parent.absoluteBounds) {
  			//父容器的绝对边界
  			let prec = this.parent.absoluteBounds || this.parent.getAbsoluteBounds();
  			
  			return {
  				left : prec.left + rec.left,
  				top : prec.top + rec.top,
  				right : prec.left + rec.right,
  				bottom : prec.top + rec.bottom,
  				width : rec.width,
  				height : rec.height
  			};
  		}
  		return rec;
  	}

  	/**
  	 * 画控件前初始化
  	 * 执行beginPath开始控件的绘制
  	 * 
  	 * @method beginDraw
  	 */
  	beginDraw() {	
  		this.getLocation(true);//重置位置信息
  		this.context.beginPath();			
  	}

  	/**
  	 * 结束控件绘制
  	 *
  	 * @method endDraw
  	 */
  	endDraw() {
  		//如果当前为封闭路径
  		if(this.style.close) {
  			this.context.closePath();
  		}
  		
  		if(this.style['fill']) {
  			this.context.fill();
  		}
  		if(this.style['stroke'] || !this.style['fill']) {
  			this.context.stroke();
  		}

  		this.needUpdate = false;
  	}

  	/**
  	 * 绘制控件
  	 * 在画布上描点
  	 * 
  	 * @method draw
  	 */
  	draw() {	
  		if(this.points && this.points.length > 0) {
  			//获取当前控件的绝对位置
  			let bounds = this.parent && this.parent.absoluteBounds?this.parent.absoluteBounds:this.absoluteBounds;
  			
  			this.context.moveTo(this.points[0].x + bounds.left,this.points[0].y + bounds.top);
  			let len = this.points.length;			
  			for(let i=1; i < len;i++) {
  				let p = this.points[i];
  				//移至当前坐标
  				if(p.m) {
  					this.context.moveTo(p.x + bounds.left,p.y + bounds.top);
  				}
  				else {
  					this.context.lineTo(p.x+ bounds.left,p.y + bounds.top);
  				}			
  			}		
  		}	
  	}

  	/**
  	 * 绘制当前控件
  	 * 协调控件的绘制，先从其子控件开始绘制，再往上冒。
  	 *
  	 * @method paint
  	 */
  	paint(v) {
  		if(v !== false && this.visible !== false) {		
  			if(this.initPoints) this.initPoints();
  			//计算当前边界
  			this.bounds = null;
  			this.absoluteBounds = this.getAbsoluteBounds();
  			let needDraw = true;//是否需要绘制
  			if(!this.is('jmGraph') && this.graph) {
  				if(this.absoluteBounds.left >= this.graph.width) needDraw = false;
  				else if(this.absoluteBounds.top >= this.graph.height) needDraw = false;
  				else if(this.absoluteBounds.right <= 0) needDraw = false;
  				else if(this.absoluteBounds.bottom <= 0) needDraw = false;
  			}
  			
  			this.context.save();

  			this.emit('beginDraw', this);
  			
  			this.setStyle();//设定样式

  			if(needDraw && this.beginDraw) this.beginDraw();
  			if(needDraw && this.draw) this.draw();	
  			if(needDraw && this.endDraw) this.endDraw();

  			if(this.children) {
  				this.children.each(function(i,item) {
  					if(item && item.paint) item.paint();
  				});
  			}

  			this.emit('endDraw',this);	
  			this.context.restore();
  			
  			//兼容小程序
  			if(this.is('jmGraph') && this.context.draw) this.context.draw();
  			this.needUpdate = false;
  		}
  	}

  	/**
  	 * 获取指定事件的集合
  	 * 比如mousedown,mouseup等
  	 *
  	 * @method getEvent
  	 * @param {string} name 事件名称
  	 * @return {list} 事件委托的集合
  	 */
  	getEvent(name) {		
  		return this.__events?this.__events[name]:null;
  	}

  	/**
  	 * 绑定控件的事件
  	 *
  	 * @method bind
  	 * @param {string} name 事件名称
  	 * @param {function} handle 事件委托
  	 */
  	bind(name, handle) {	
  		if(name && name.indexOf(' ') > -1) {
  			name = name.split(' ');
  			for(let n of name) {
  				n && this.bind(n, handle);
  			}
  			return;
  		}	
  		/**
  		 * 添加事件的集合
  		 *
  		 * @method _setEvent
  		 * @private
  		 */
  		function _setEvent(name, events) {
  			if(!this.__events) this.__events = {};
  			return this.__events[name] = events;
  		}
  		let eventCollection = this.getEvent(name) || _setEvent.call(this, name, new jmList());
  		if(!eventCollection.contain(handle)) {
  			eventCollection.add(handle);
  		}
  	}

  	/**
  	 * 移除控件的事件
  	 *
  	 * @method unbind 
  	 * @param {string} name 事件名称
  	 * @param {function} handle 从控件中移除事件的委托
  	 */
  	unbind(name, handle) {	
  		if(name && name.indexOf(' ') > -1) {
  			name = name.split(' ');
  			for(let n of name) {
  				n && this.unbind(n, handle);
  			}
  			return;
  		}	
  		let eventCollection = this.getEvent(name) ;		
  		if(eventCollection) {
  			if(handle) eventCollection.remove(handle);
  			else eventCollection.clear();
  		}
  	}


  	/**
  	 * 执行监听回调
  	 * 
  	 * @method emit
  	 * @for jmControl
  	 * @param {string} name 触发事件的名称
  	 * @param {array} args 事件参数数组
  	 */
  	emit(...args) {			
  		this.runEventHandle(args[0], args.slice(1));
  		return this;
  	}

  	/**
  	 * 独立执行事件委托
  	 *
  	 * @method runEventHandle
  	 * @param {string} 将执行的事件名称
  	 * @param {object} 事件执行的参数，包括触发事件的对象和位置
  	 */
  	runEventHandle(name, args) {
  		let events = this.getEvent(name);		
  		if(events) {
  			var self = this;
  			if(!Array.isArray(args)) args = [args];	
  			events.each(function(i, handle) {
  				//只要有一个事件被阻止，则不再处理同级事件，并设置冒泡被阻断
  				if(false === handle.apply(self, args)) {
  					args.cancel = true;
  				}
  			});		
  		}	
  		return args.cancel;
  	}

  	/**
  	 * 检 查坐标是否落在当前控件区域中..true=在区域内
  	 *
  	 * @method checkPoint
  	 * @param {point} p 位置参数
  	 * @param {number} [pad] 可选参数，表示线条多远内都算在线上
  	 * @return {boolean} 当前位置如果在区域内则为true,否则为false。
  	 */
  	checkPoint(p, pad) {
  		//jmGraph 需要判断dom位置
  		if(this.type == 'jmGraph') {
  			//获取dom位置
  			let position = this.getPosition();
  			// 由于高清屏会有放大坐标，所以这里用pagex就只能用真实的canvas大小
  			const right = position.left + (this.canvas.clientWidth || this.canvas.offsetWidth || this.canvas.width);
  			const bottom = position.top + (this.canvas.clientHeight || this.canvas.offsetHeight || this.canvas.height);
  			if(p.pageX > right || p.pageX < position.left) {
  				return false;
  			}
  			if(p.pageY > bottom || p.pageY < position.top) {
  				return false;
  			}	
  			return true;
  		}
  		
  		let bounds = this.getBounds();	
  		let rotation = this.getRotation();//获取当前旋转参数
  		let ps = this.points;
  		//如果不是路径组成，则采用边界做为顶点
  		if(!ps || !ps.length) {
  			ps = [];
  			ps.push({x: bounds.left, y: bounds.top}); //左上角
  			ps.push({x: bounds.right, y: bounds.top});//右上角
  			ps.push({x: bounds.right, y: bounds.bottom});//右下角
  			ps.push({x: bounds.left, y: bounds.bottom}); //左下
  			ps.push({x: bounds.left, y: bounds.top}); //左上角   //闭合
  		}
  		//如果有指定padding 表示接受区域加宽，命中更易
  		pad = Number(pad || this.style['touchPadding'] || this.style['lineWidth'] || 1);
  		if(ps && ps.length) {
  			
  			//如果有旋转参数，则需要转换坐标再处理
  			if(rotation && rotation.angle != 0) {
  				ps = jmUtils.clone(ps, true);//拷贝一份数据
  				//rotateX ,rotateY 是相对当前控件的位置
  				ps = jmUtils.rotatePoints(ps, {
  					x: rotation.rotateX + bounds.left,
  					y: rotation.rotateY + bounds.top
  				}, rotation.angle);
  			}
  			//如果当前路径不是实心的
  			//就只用判断点是否在边上即可	
  			if(ps.length > 2 && (!this.style['fill'] || this.style['stroke'])) {
  				let i = 0;
  				let count = ps.length;
  				for(let j = i+1; j <= count; j = (++i + 1)) {
  					//如果j超出最后一个
  					//则当为封闭图形时跟第一点连线处理.否则直接返回false
  					if(j == count) {
  						if(this.style.close) {
  							let r = jmUtils.pointInPolygon(p,[ps[i],ps[0]], pad);
  							if(r) return true;
  						}
  					} 
  					else {
  						//判断是否在点i,j连成的线上
  						let s = jmUtils.pointInPolygon(p,[ps[i],ps[j]], pad);
  						if(s) return true;
  					}			
  				}
  				//不是封闭的图形，则直接返回
  				if(!this.style['fill']) return false;
  			}

  			let r = jmUtils.pointInPolygon(p,ps, pad);		
  			return r;
  		}

  		if(p.x > bounds.right || p.x < bounds.left) {
  			return false;
  		}
  		if(p.y > bounds.bottom || p.y < bounds.top) {
  			return false;
  		}
  		
  		return true;
  	}


  	/**
  	 * 触发控件事件，组合参数并按控件层级关系执行事件冒泡。
  	 *
  	 * @method raiseEvent
  	 * @param {string} name 事件名称
  	 * @param {object} args 事件执行参数
  	 * @return {boolean} 如果事件被组止冒泡则返回false,否则返回true
  	 */
  	raiseEvent(name, args) {
  		if(this.visible === false) return ;//如果不显示则不响应事件	
  		if(!args.position) {		
  			let graph = this.graph;

  			let srcElement = args.srcElement || args.target;			
  			
  			let position = jmUtils.getEventPosition(args, graph.scaleSize);//初始化事件位置		

  			// 如果有指定scale高清处理，需要对坐标处理
  			// 因为是对canvas放大N倍，再把style指定为当前大小，所以坐标需要放大N    && srcElement === graph.canvas      
  			if(graph.devicePixelRatio > 0) {
  				position.x = position.offsetX = position.x * devicePixelRatio;
  				position.y = position.offsetY = position.y * devicePixelRatio;
  			}
  		
  			args = {
  				position: position,
  				button: args.button == 0||position.isTouch?1:args.button,
  				keyCode: args.keyCode || args.charCode || args.which,
  				ctrlKey: args.ctrlKey,
  				cancel : false,
  				event: args, // 原生事件
  				srcElement : srcElement
  			};		
  		}
  		args.path = args.path||[]; //事件冒泡路径

  		//先执行子元素事件，如果事件没有被阻断，则向上冒泡
  		//var stoped = false;
  		if(this.children) {
  			this.children.each(function(j, el) {	
  				// 如果同级已有命中，则不再需要处理兄弟节点
  				if(args.target) return false;
  				//未被阻止才执行			
  				if(args.cancel !== true) {
  					//如果被阻止冒泡，
  					//stoped = el.raiseEvent(name,args) === false?true:stoped;
  					el.raiseEvent(name, args);
  				}
  			}, true);//按逆序处理
  		}
  		
  		//获取当前对象的父元素绝对位置
  		//生成当前坐标对应的父级元素的相对位置
  		let abounds = this.parent && this.parent.absoluteBounds?this.parent.absoluteBounds : this.absoluteBounds;
  		if(!abounds) return false;	
  		//args = jmUtils.clone(args);//参数副本
  		args.position.x = args.position.offsetX - abounds.left;
  		args.position.y = args.position.offsetY - abounds.top;

  		// 相对当前控件的坐标点
  		/*if(this.absoluteBounds) {
  			args.curPosition = {
  				x: args.position.offsetX - this.absoluteBounds.left,
  				y: args.position.offsetY - this.absoluteBounds.top
  			};
  		}
  		else {
  			args.curPosition = args.position;
  		}*/

  		// 是否在当前控件内操作
  		const inpos = this.interactive !== false && this.checkPoint(args.position);
  		
  		//事件发生在边界内或健盘事件发生在画布中才触发
  		// 如果有target 表示当前事件已被命中其它节点，则不再需要判断这里
  		if(inpos && !args.target) {
  			//如果没有指定触发对象，则认为当前为第一触发对象
  			if(!args.target) {
  				args.target = this;
  			}
  			
  			this.runEventAndPopEvent(name, args);

  			if(!this.focused && (name === 'mousemove' || name === 'touchmove')) {
  				this.focused = true;//表明当前焦点在此控件中
  				this.raiseEvent(name === 'mousemove'? 'mouseover': 'touchover',args);
  			}	
  		}
  		else {
  			//如果焦点不在，且原焦点在，则触发mouseleave事件
  			if(this.interactive !== false && !inpos &&
  				this.focused && 
  				(name === 'mousemove' || name === 'touchmove')) {

  				this.focused = false;//表明当前焦点离开
  				this.runEventHandle(name === 'mousemove'? 'mouseleave' : 'touchleave', args);//执行事件	
  			}	
  		}
  			
  		return args.cancel == false;//如果被阻止则返回false,否则返回true
  	}

  	/**
  	 * 执行事件，并进行冒泡
  	 * @param {string} name 事件名称 
  	 * @param {object} args 事件参数
  	 */
  	runEventAndPopEvent(name, args) {	

  		if(args.cancel !== true) {
  			// 添加到触发路径
  			args.path.push(this);

  			//如果返回true则阻断冒泡
  			this.runEventHandle(name, args);//执行事件

  			// 向父节点冒泡事件		
  			if(args.cancel !== true && this.parent && this.parent.runEventAndPopEvent) {
  				// 相对位置需要改为父节点的
  				if(args.position) {
  					let bounds = this.parent.getBounds();
  					args.position.x += bounds.left;
  					args.position.y += bounds.top;
  				}
  				this.parent.runEventAndPopEvent(name, args);
  			}		
  		}
  	}

  	/**
  	 * 清空控件指定事件
  	 *
  	 * @method clearEvents
  	 * @param {string} name 需要清除的事件名称
  	 */
  	clearEvents(name) {
  		var eventCollection = this.getEvent(name) ;		
  		if(eventCollection) {
  			eventCollection.clear;
  		}
  	}

  	/**
  	 * 查找其父级类型为type的元素，直到找到指定的对象或到最顶级控件后返回空。
  	 *
  	 * @method findParent 
  	 * @param {object} 类型名称或类型对象
  	 * @return {object} 指定类型的实例
  	 */
  	findParent(type) {
  		//如果为类型名称，则返回名称相同的类型对象
  		if(typeof type === 'string') {
  			if(this.type == type)
  				return this;
  		}
  		else if(this.is(type)) {
  			return this;
  		}
  		if(this.parent) {
  			return this.parent.findParent(type);
  		}
  		return null;
  	}

  	/**
  	 * 设定是否可以移动
  	 * 此方法需指定jmgraph或在控件添加到jmgraph后再调用才能生效。
  	 *
  	 * @method canMove
  	 * @param {boolean} m true=可以移动，false=不可移动或清除移动。
  	 * @param {jmGraph} [graph] 当前画布，如果为空的话必需是已加入画布的控件，否则得指定画布。
  	 */
  	canMove(m, graph) {
  		if(!this.__mvMonitor) {
  			/**
  			 * 控制控件移动对象
  			 * 
  			 * @property __mvMonitor
  			 * @private
  			 */
  			this.__mvMonitor = {};
  			this.__mvMonitor.mouseDown = false;
  			this.__mvMonitor.curposition={x:0,y:0};
  			var self = this;
  			/**
  			 * 控件移动鼠标事件
  			 *
  			 * @method mv
  			 * @private
  			 */
  			this.__mvMonitor.mv = function(evt) {
  				let _this = self;
  				//如果鼠标经过当前可移动控件，则显示可移动指针
  				//if(evt.path && evt.path.indexOf(_this)>-1) {
  				//	_this.cursor('move');	
  				//}

  				if(_this.__mvMonitor.mouseDown) {
  					_this.parent.bounds = null;
  					let parentbounds = _this.parent.getAbsoluteBounds();		
  					let offsetx = evt.position.offsetX - _this.__mvMonitor.curposition.x;
  					let offsety = evt.position.offsetY - _this.__mvMonitor.curposition.y;				
  					//console.log(offsetx + ',' + offsety);
  					//如果锁定边界
  					if(_this.lockSide) {
  						let thisbounds = _this.bounds || _this.getAbsoluteBounds();					
  						//检查边界出界
  						let outside = jmUtils.checkOutSide(parentbounds,thisbounds,{x:offsetx,y:offsety});
  						if(outside.left < 0) {
  							if(_this.lockSide.left) offsetx -= outside.left;
  						}
  						else if(outside.right > 0) {
  							if(_this.lockSide.right) offsetx -= outside.right;
  						}
  						if(outside.top < 0) {
  							if(_this.lockSide.top) offsety -= outside.top;
  						}
  						else if(outside.bottom > 0) {
  							if(_this.lockSide.bottom) offsety -= outside.bottom;
  						}
  					}
  					
  					if(offsetx || offsety) {
  						_this.offset(offsetx, offsety, true, evt);
  						_this.__mvMonitor.curposition.x = evt.position.offsetX;
  						_this.__mvMonitor.curposition.y = evt.position.offsetY;	
  						//console.log(offsetx + '.' + offsety);
  					}
  					return false;
  				}
  			};
  			/**
  			 * 控件移动鼠标松开事件
  			 *
  			 * @method mu
  			 * @private
  			 */
  			this.__mvMonitor.mu = function(evt) {
  				let _this = self;
  				if(_this.__mvMonitor.mouseDown) {
  					_this.__mvMonitor.mouseDown = false;
  					//_this.cursor('default');
  					_this.emit('moveend',{position:_this.__mvMonitor.curposition});	
  					//return false;
  				}			
  			};
  			/**
  			 * 控件移动鼠标离开事件
  			 *
  			 * @method ml
  			 * @private
  			 */
  			this.__mvMonitor.ml = function() {
  				let _this = self;
  				if(_this.__mvMonitor.mouseDown) {
  					_this.__mvMonitor.mouseDown = false;
  					//_this.cursor('default');	
  					_this.emit('moveend',{position:_this.__mvMonitor.curposition});
  					return false;
  				}	
  			};
  			/**
  			 * 控件移动鼠标按下事件
  			 *
  			 * @method md
  			 * @private
  			 */
  			this.__mvMonitor.md = function(evt) {
  				
  				if(this.__mvMonitor.mouseDown) return;
  				if(evt.button == 0 || evt.button == 1) {
  					this.__mvMonitor.mouseDown = true;
  					//this.cursor('move');
  					//var parentbounds = this.parent.absoluteBounds || this.parent.getAbsoluteBounds();	
  					this.__mvMonitor.curposition.x = evt.position.offsetX;//evt.position.x + parentbounds.left;
  					this.__mvMonitor.curposition.y = evt.position.offsetY;//evt.position.y + parentbounds.top;
  					//触发控件移动事件
  					this.emit('movestart',{position:this.__mvMonitor.curposition});
  					
  					evt.cancel = true;
  					return false;
  				}			
  			};
  		}
  		graph = graph || this.graph ;//获取最顶级元素画布
  		
  		if(m !== false) {			
  			graph.bind('mousemove',this.__mvMonitor.mv);
  			graph.bind('mouseup',this.__mvMonitor.mu);
  			graph.bind('mouseleave',this.__mvMonitor.ml);
  			this.bind('mousedown',this.__mvMonitor.md);
  			graph.bind('touchmove',this.__mvMonitor.mv);
  			graph.bind('touchend',this.__mvMonitor.mu);
  			this.bind('touchstart',this.__mvMonitor.md);
  		}
  		else {			
  			graph.unbind('mousemove',this.__mvMonitor.mv);
  			graph.unbind('mouseup',this.__mvMonitor.mu);
  			graph.unbind('mouseleave',this.__mvMonitor.ml);
  			this.unbind('mousedown',this.__mvMonitor.md);
  			graph.unbind('touchmove',this.__mvMonitor.mv);
  			graph.unbind('touchend',this.__mvMonitor.mu);
  			this.unbind('touchstart',this.__mvMonitor.md);	
  		}
  		return this;
  	}
  }

  /**
   * 基础路径,大部分图型的基类
   * 指定一系列点，画出图形
   *
   * @class jmPath
   * @extends jmControl
   * @param {object} params 路径参数 points=所有描点
   */

  class jmPath extends jmControl {	

  	constructor(params, t='jmPath') {
  		super(params, t);		
  		this.points = params && params.points ? params.points : [];	
  		
  	}
  	
  	/**
  	 * 描点集合
  	 * point格式：{x:0,y:0,m:true}
  	 * @property points
  	 * @type {array}
  	 */
  	get points() {
  		let s = this.__pro('points');
  		return s;
  	}
  	set points(v) {
  		this.needUpdate = true;
  		return this.__pro('points', v);
  	}
  }

  /**
   * jmGraph画图类库
   * 对canvas画图api进行二次封装，使其更易调用，省去很多重复的工作。
   *
   * @module jmGraph
   * @class jmGraph
   * @extends jmControl
   * @param {element} canvas 标签canvas
   * @param {object} option 参数：{width:宽,height:高}
   * @param {function} callback 初始化后的回调
   */
  class jmGraph extends jmControl {

  	constructor(canvas, option, callback) {
  		if(typeof option == 'function') {
  			callback = option;
  			option = {};
  		}
  	
  		option = option || {};
  		
  		option.interactive = true;
  		
  		super(option, 'jmGraph');

  		this.option = option || {};

  		/**
  		 * 工具类
  		 * @property utils/util
  		 * @type {jmUtils}
  		 */
  		this.util = this.utils = jmUtils;		

  		//如果是小程序
  		if(typeof wx != 'undefined' && wx.createCanvasContext) {
  			this.context = wx.createCanvasContext(canvas);
  			canvas = wx.createSelectorQuery().select('#' + canvas);
  		}
  		else {
  			if(typeof canvas === 'string' && typeof document != 'undefined') {
  				canvas = document.getElementById(canvas);
  			}
  			else if(canvas.length) {
  				canvas = canvas[0];
  			}
  			if(canvas.tagName != 'CANVAS') {
  				let cn = document.createElement('canvas');
  				canvas.appendChild(cn);
  				cn.width = canvas.offsetWidth||canvas.clientWidth;
  				cn.height = canvas.offsetHeight||canvas.clientHeight;
  				canvas = cn;
  			}	

  			this.context = canvas.getContext('2d');
  		}
  		this.canvas = canvas;
  		this.__init(callback);
  	}

  	/**
  	 * 初始化画布
  	 * @method init
  	 */
  	__init(callback) {
  		/**
  		 * 当前所有图形类型
  		 * @property shapes
  		 * @type {object}
  		 */
  		this.shapes = Object.assign({
  			"path": jmPath,
  		}, this.option.shapes);
  		
  		/**
  		 * 画控件前初始化
  		 * 为了解决一像素线条问题
  		 */
  		this.on('beginDraw', function() {	
  			this.context.translate(0.5, 0.5);
  		});
  		/**
  		 * 结束控件绘制 为了解决一像素线条问题
  		 */
  		this.on('endDraw', function() {	
  			this.context.translate(-0.5, -0.5);		
  		});
  		
  		if(this.option.width > 0) this.width = this.option.width;
  		if(this.option.height > 0) this.height = this.option.height;	

  		this.resize();

  		//绑定事件
  		this.eventHandler = new jmEvents(this, this.canvas.canvas || this.canvas);	

  		//如果指定了自动刷新
  		if(this.option.autoRefresh) {
  			const self = this; 
  			function update() {
  				if(self.needUpdate) self.redraw();
  				requestAnimationFrame(update);
  			}
  			requestAnimationFrame(update);
  		}

  		if(callback) callback(this);		
  	}

  	//  重置canvas大小，并判断高清屏，画图先放大二倍
  	resize(w, h) {

  		const scale = typeof window != 'undefined' && window.devicePixelRatio > 1? window.devicePixelRatio : 1;
  		if (scale > 1) {
  		  this.__normalSize = this.__normalSize || { width: 0, height: 0};
  		  w = w || this.__normalSize.width || this.width, h = h || this.__normalSize.height || this.height;

  		  if(w) this.__normalSize.width = w;
  		  if(h) this.__normalSize.height = h;

  		  this.canvas.style.width = w + "px";
  		  this.canvas.style.height = h + "px";
  		  this.canvas.height = h * scale;
  		  this.canvas.width = w *scale;
  		  this.context.scale(scale, scale);
  		  this.devicePixelRatio = scale;
  		}
  	}

  	/**
  	 * 宽度
  	 * @property width
  	 * @type {number}
  	 */
  	get width() {
  		if(this.canvas) return this.canvas.width;
  		return 0;
  	}
  	set width(v) {
  		this.needUpdate = true;
  		if(this.canvas) {
  			this.canvas.width = v;	
  			this.resize(v);
  		}	
  		return v;
  	}

  	/**
  	 * 高度
  	 * @property height
  	 * @type {number}
  	 */
  	get height() {
  		if(this.canvas) return this.canvas.height;
  		return 0;
  	}
  	set height(v) {
  		this.needUpdate = true;
  		if(this.canvas) {
  			this.canvas.height = v;
  			this.resize(0, v);
  		}
  		return v;
  	}

  	/**
  	 * 创建jmGraph的静态对象
  	 *
  	 * @method create
  	 * @return {jmGraph} jmGraph实例对象
  	 */
  	static create(...args) {
  		return new jmGraph(...args);
  	}

  	/**
  	 * 获取当前画布在浏览器中的绝对定位
  	 *
  	 * @method getPosition
  	 * @return {postion} 返回定位坐标
  	 */
  	getPosition() {
  		let p = jmUtils.getElementPosition(this.canvas.canvas || this.canvas);
  		p.width = this.canvas.width;
  		p.height = this.canvas.height;
  		p.right = p.left + p.width;
  		p.bottom = p.top + p.height;
  		return p;
  	}

  	/**
  	 * 注册图形类型,图形类型必需有统一的构造函数。参数为画布句柄和参数对象。
  	 *
  	 * @method registerShape 
  	 * @param {string} name 控件图形名称
  	 * @param {class} shape 图形控件类型
  	 */
  	registerShape(name, shape) {
  		this.shapes[name] = shape;
  	}

  	/**
  	 * 从已注册的图形类创建图形
  	 * 简单直观创建对象
  	 *
  	 * @method createShape 
  	 * @param {string} name 注册控件的名称
  	 * @param {object} args 实例化控件的参数
  	 * @return {object} 已实例化控件的对象
  	 */
  	createShape(name, args) {
  		let shape;
  		if(typeof name === 'function') {
  			shape = name;
  		}
  		else {
  			shape = this.shapes[name];
  		}
  		if(shape) {
  			if(!args) args = {};
  			args.graph = this;
  			let obj = new shape(args);
  			return obj;
  		}
  	}

  	/**
  	 * 生成阴影对象
  	 *
  	 * @method createShadow
  	 * @param {number} x x偏移量
  	 * @param {number} y y偏移量
  	 * @param {number} blur 模糊值
  	 * @param {string} color 颜色
  	 * @return {jmShadow} 阴影对象
  	 */
  	createShadow(x, y, blur, color) {
  		let sh = new jmShadow(x, y, blur, color);
  		return sh;
  	}

  	/**
  	 * 生成线性渐变对象
  	 *
  	 * @method createLinearGradient
  	 * @param {number} x1 线性渐变起始点X坐标
  	 * @param {number} y1 线性渐变起始点Y坐标
  	 * @param {number} x2 线性渐变结束点X坐标
  	 * @param {number} y2 线性渐变结束点Y坐标
  	 * @return {jmGradient} 线性渐变对象
  	 */
  	createLinearGradient(x1, y1, x2, y2) {
  		let gradient = new jmGradient({
  			type:'linear',
  			x1: x1,
  			y1: y1,
  			x2: x2,
  			y2: y2
  		});
  		return gradient;
  	}

  	/**
  	 * 生成放射渐变对象
  	 *
  	 * @method createRadialGradient
  	 * @param {number} x1 放射渐变小圆中心X坐标
  	 * @param {number} y1 放射渐变小圆中心Y坐标
  	 * @param {number} r1 放射渐变小圆半径
  	 * @param {number} x2 放射渐变大圆中心X坐标
  	 * @param {number} y2 放射渐变大圆中心Y坐标
  	 * @param {number} r2 放射渐变大圆半径
  	 * @return {jmGradient} 放射渐变对象
  	 */
  	createRadialGradient(x1, y1, r1, x2, y2, r2) {	
  		let gradient = new jmGradient({
  			type:'radial',
  			x1: x1,
  			y1: y1,
  			r1: r1,
  			x2: x2,
  			y2: y2,
  			r2: r2
  		});
  		return gradient;
  	}

  	/**
  	 * 重新刷新整个画板
  	 * 以加入动画事件触发延时10毫秒刷新，保存最尽的调用只刷新一次，加强性能的效果。
  	 *
  	 * @method refresh
  	 */
  	refresh() {	
  		//加入动画，触发redraw，会导致多次refresh只redraw一次
  		/*this.animate(function() {
  			return false;
  		},100,'jmgraph_refresh');*/
  		this.redraw();
  	}

  	/**
  	 * 重新刷新整个画板
  	 * 此方法直接重画，与refresh效果类似
  	 *
  	 * @method redraw
  	 * @param {number} [w] 清除画布的宽度
  	 * @param {number} [h] 清除画布的高度
  	 */
  	redraw(w, h) {	
  		this.clear(w||this.width, h||this.height);
  		this.paint();
  	}

  	/**
  	 * 清除画布
  	 * 
  	 * @method clear
  	 * @param {number} [w] 清除画布的宽度
  	 * @param {number} [h] 清除画布的高度
  	 */
  	clear(w, h) {
  		//this.canvas.width = this.canvas.width;
  		if(w && h) {
  			//this.zoomActual();//恢复比例缩放
  			this.canvas.width = w;
  			this.canvas.height = h;
  			//保留原有缩放比例
  			if(this.scaleSize) {
  				if(this.context.scale) this.context.scale(this.scaleSize.x,this.scaleSize.y);
  			}
  		}
  		else {
  			w = this.canvas.width;
  			h = this.canvas.height;
  			if(this.scaleSize) {
  				w = w / this.scaleSize.x;
  				h = h / this.scaleSize.y;
  			}
  		}
  		//如果有指定背景，则等到draw再全屏绘制一次，也同样达到清除画布的功能
  		if(this.style && this.style.fill) {
  			this.points = [
  				{x:0,y:0},
  				{x:w,y:0},
  				{x:w,y:h},
  				{x:0,y:h}
  			];
  		}
  		else if(this.context.clearRect) this.context.clearRect(0,0,w,h);
  	}

  	/**
  	* 设置画布样式，此处只是设置其css样式
  	*
  	* @method css
  	* @param {string} name 样式名
  	* @param {string} value 样式值
  	*/
  	css(name, value) {
  		if(this.canvas) {
  			if(typeof value != 'undefined') this.canvas.style[name] = value;
  			return this.canvas.style[name];
  		}
  	}

  	/**
  	 * 生成路径对象
  	 *
  	 * @method createPath
  	 * @param {array} points 路径中的描点集合
  	 * @param {style} style 当前路径的样式
  	 * @return {jmPath} 路径对象jmPath
  	 */
  	createPath(points, style) {
  		let path = this.createShape('path',{
  			points: points,
  			style: style
  		});
  		return path;
  	}

  	/**
  	 * 生成直线
  	 * 
  	 * @method createLine
  	 * @param {point} start 直线的起点
  	 * @param {point} end 直线的终点
  	 * @param {style} 直线的样式
  	 * @return {jmLine} 直线对象
  	 */
  	createLine(start, end, style) {
  		let line = this.createShape('line', {
  			start: start,
  			end: end,
  			style: style
  		});
  		return line;
  	}

  	/**
  	 * 缩小整个画布按比例0.9
  	 * 
  	 * @method zoomOut
  	 */
  	zoomOut() {
  		this.scale(0.9 ,0.9);
  	}

  	/**
  	 * 放大 每次增大0.1的比例
  	 * 
  	 * @method zoomIn
  	 */
  	zoomIn() {		
  		this.scale(1.1 ,1.1);
  	}

  	/**
  	 * 大小复原
  	 * 
  	 * @method zoomActual
  	 */
  	zoomActual() {
  		if(this.scaleSize) {
  			this.scale(1 / this.scaleSize.x ,1 / this.scaleSize.y);	
  		}
  		else {
  			this.scale(1 ,1);	
  		}	
  	}

  	/**
  	 * 放大缩小画布
  	 * 
  	 * @method scale
  	 * @param {number} dx 缩放X轴比例
  	 * @param {number} dy 缩放Y轴比例
  	 */
  	scale(dx, dy) {
  		if(!this.normalSize) {
  			this.normalSize = {
  				width: this.canvas.width,
  				height: this.canvas.height
  			};		
  		}
  		
  		this.context.scale(dx,dy);
  		if(!this.scaleSize) {
  			this.scaleSize = {x:dx,y:dy};
  		}
  		else {
  			this.scaleSize = {x:dx * this.scaleSize.x, y:dy * this.scaleSize.y};
  		}
  		this.refresh();
  	}

  	/**
  	 * 保存为base64图形数据
  	 * 
  	 * @method toDataURL
  	 * @return {string} 当前画布图的base64字符串
  	 */
  	toDataURL() {
  		let data = this.canvas.toDataURL?this.canvas.toDataURL():'';
  		return data;
  	}

  	/** 
  	 * 自动刷新画版
  	 * @param {function} callback 执行回调
  	 */
  	autoRefresh(callback) {
  		var self = this;
  		function update() {
  			if(self.needUpdate) self.redraw();
  			requestAnimationFrame(update);
  			if(callback) callback();
  		}
  		update();
  		return this;
  	}
  }

  /**
   * 画矩形
   *
   * @class jmRect
   * @extends jmPath
   * @param {object} params 参数 position=矩形左上角顶点坐标,width=宽，height=高,radius=边角弧度
   */ 
  class jmRect extends jmPath {		

  	constructor(params, t='jmRect') {
  		params = params||{};
  		super(params, t);

  		this.style.close = true;
  		this.radius = params.radius || this.style.radius || 0;
  	}
  	/**
  	 * 圆角半径
  	 * @property radius
  	 * @type {number}
  	 */
  	get radius() {
  		return this.__pro('radius');
  	}
  	set radius(v) {
  		this.needUpdate = true;
  		return this.__pro('radius', v);
  	}	

  	/**
  	 * 当前位置左上角
  	 * @property position
  	 * @type {point}
  	 */
  	get position() {
  		return this.__pro('position');
  	}
  	set position(v) {
  		this.needUpdate = true;
  		return this.__pro('position', v);
  	}

  	/**
  	 * 获取当前控件的边界
  	 *
  	 * @method getBounds
  	 * @return {bound} 当前控件边界
  	 */
  	getBounds() {
  		let rect = {};
  		this.initPoints();
  		let p = this.getLocation();
  		rect.left = p.left; 
  		rect.top = p.top; 
  		
  		rect.right = p.left + p.width; 
  		rect.bottom = p.top + p.height; 
  		
  		rect.width = rect.right - rect.left;
  		rect.height = rect.bottom - rect.top;
  		return rect;
  	}
  	
  	/**
  	 * 重写检查坐标是否在区域内
  	 *
  	 * @method checkPoint
  	 * @param {point} p 待检查的坐标
  	 * @return {boolean} 如果在则返回true,否则返回false
  	 */
  	/*checkPoint(p) {	
  		//生成当前坐标对应的父级元素的相对位置
  		let abounds = this.bounds || this.getBounds();

  		if(p.x > abounds.right || p.x < abounds.left) {
  			return false;
  		}
  		if(p.y > abounds.bottom || p.y < abounds.top) {
  			return false;
  		}
  		
  		return true;
  	}*/

  	/**
  	 * 初始化图形点
  	 * 如果有边角弧度则类型圆绝计算其描点
  	 * 
  	 * @method initPoints
  	 * @private
  	 */
  	initPoints() {
  		let location = this.getLocation();	
  		let p1 = {x:location.left,y:location.top};
  		let p2 = {x:location.left + location.width,y:location.top};
  		let p3 = {x:location.left + location.width,y:location.top + location.height};
  		let p4 = {x:location.left,y:location.top + location.height};

  		//如果指定为虚线 , 则初始化一个直线组件，来构建虚线点集合
  		if(this.style.lineType === 'dotted' && !this.dottedLine) {
  			this.dottedLine = this.graph.createShape('line', {style: this.style});
  		}
  		
  		//如果有边界弧度则借助圆弧对象计算描点
  		if(location.radius && location.radius < location.width/2 && location.radius < location.height/2) {
  			let q = Math.PI / 2;
  			let arc = this.graph.createShape('arc',{radius:location.radius,anticlockwise:false});
  			arc.center = {x:location.left + location.radius,y:location.top+location.radius};
  			arc.startAngle = Math.PI;
  			arc.endAngle = Math.PI + q;
  			let ps1 = arc.initPoints();
  			
  			arc = this.graph.createShape('arc',{radius:location.radius,anticlockwise:false});
  			arc.center = {x:p2.x - location.radius,y:p2.y + location.radius};
  			arc.startAngle = Math.PI + q;
  			arc.endAngle = Math.PI * 2;
  			let ps2 = arc.initPoints();
  			
  			arc = this.graph.createShape('arc',{radius:location.radius,anticlockwise:false});
  			arc.center = {x:p3.x - location.radius,y:p3.y - location.radius};
  			arc.startAngle = 0;
  			arc.endAngle = q;
  			let ps3 = arc.initPoints();
  			
  			arc = this.graph.createShape('arc',{radius:location.radius,anticlockwise:false});
  			arc.center = {x:p4.x + location.radius,y:p4.y - location.radius};
  			arc.startAngle = q;
  			arc.endAngle = Math.PI;
  			let ps4 = arc.initPoints();
  			this.points = ps1.concat(ps2,ps3,ps4);
  		}
  		else {
  			this.points = [];
  			this.points.push(p1);
  			//如果是虚线
  			if(this.dottedLine) {
  				this.dottedLine.start = p1;
  				this.dottedLine.end = p2;
  				this.points = this.points.concat(this.dottedLine.initPoints());
  			}
  			this.points.push(p2);
  			//如果是虚线
  			if(this.dottedLine) {
  				this.dottedLine.start = p2;
  				this.dottedLine.end = p3;
  				this.points = this.points.concat(this.dottedLine.initPoints());
  			}
  			this.points.push(p3);
  			//如果是虚线
  			if(this.dottedLine) {
  				this.dottedLine.start = p3;
  				this.dottedLine.end = p4;
  				this.points = this.points.concat(this.dottedLine.initPoints());
  			}
  			this.points.push(p4);
  			//如果是虚线
  			if(this.dottedLine) {
  				this.dottedLine.start = p4;
  				this.dottedLine.end = p1;
  				this.points = this.points.concat(this.dottedLine.initPoints());
  			}
  		}		
  		
  		return this.points;
  	}
  }

  /**
   * 画一条直线
   *
   * @class jmLine
   * @extends jmPath
   * @param {object} params 直线参数:start=起始点,end=结束点,lineType=线类型(solid=实线，dotted=虚线),dashLength=虚线间隔(=4)
   */
  class jmLine extends jmPath {	
  	
  	constructor(params, t='jmLine') {
  		super(params, t);

  		this.start = params.start || {x:0,y:0};
  		this.end = params.end || {x:0,y:0};
  		this.style.lineType = this.style.lineType || 'solid';
  		this.style.dashLength = this.style.dashLength || 4;
  	}	

  	/**
  	 * 控制起始点
  	 * 
  	 * @property start
  	 * @for jmLine
  	 * @type {point}
  	 */
  	get start() {
  		return this.__pro('start');
  	}
  	set start(v) {
  		this.needUpdate = true;
  		return this.__pro('start', v);
  	}

  	/**
  	 * 控制结束点
  	 * 
  	 * @property end
  	 * @for jmLine
  	 * @type {point}
  	 */
  	get end() {
  		return this.__pro('end');
  	}
  	set end(v) {
  		this.needUpdate = true;
  		return this.__pro('end', v);
  	}

  	/**
  	 * 初始化图形点,如呆为虚线则根据跳跃间隔描点
  	 * @method initPoints
  	 * @private
  	 */
  	initPoints() {	
  		let start = this.start;
  		let end = this.end;
  		this.points = [];	
  		this.points.push(start);

  		if(this.style.lineType === 'dotted') {			
  			let dx = end.x - start.x;
  			let dy = end.y - start.y;
  			let lineLen = Math.sqrt(dx * dx + dy * dy);
  			dx = dx / lineLen;
  			dy = dy / lineLen;
  			let dottedstart = false;

  			let dashLen = this.style.dashLength || 5;
  			let dottedsp = dashLen / 2;
  			for(let l=dashLen; l<=lineLen;) {
  				if(dottedstart == false) {
  					this.points.push({x: start.x + dx * l, y: start.y + dy * l});
  					l += dottedsp;
  				}
  				else {				
  					this.points.push({x: start.x + dx * l, y: start.y+ dy * l, m: true});
  					l += dashLen;
  				}
  				dottedstart = !dottedstart;				
  			}
  		}
  		this.points.push(end);
  		return this.points;
  	}
  }

  /**
   * 基础样式
   *
   * @class jmChartStyle
   * @module jmChart
   * @static
   */
  var defaultStyle = {
    layout: 'normal',
    // inside 二边不对齐Y轴，内缩一个刻度 | normal
    margin: {
      left: 40,
      top: 20,
      right: 20,
      bottom: 40
    },
    // 跟随标线
    markLine: {
      x: true,
      // 显示X标线
      y: true,
      // 显示Y标线
      stroke: '#EB792A',
      fill: '#CCC',
      lineWidth: 1,
      radius: 5,
      // 中间小圆圈大小
      zIndex: 20
    },
    legend: {
      stroke: 'transparent',
      lineWidth: 0,
      margin: {
        left: 10,
        top: 10,
        right: 20,
        bottom: 10
      },
      width: 200,
      height: 0,
      item: {
        shape: {
          width: 20,
          height: 15
        },
        label: {
          textAlign: 'left',
          textBaseline: 'middle',
          font: '12px Arial',
          fill: '#000'
        },
        normal: {
          fill: 'transparent',
          cursor: 'default'
        },
        hover: {
          fill: '#ccc',
          cursor: 'pointer'
        }
      }
    },
    chartArea: {
      stroke: 'rgb(229,229,229)',
      zIndex: 5
    },
    axis: {
      stroke: '#05468E',
      lineWidth: 1,
      zIndex: 1,
      // 显示网格
      grid: {
        x: true,
        // 是否显示网格
        y: true,
        stroke: 'rgb(229,229,229)',
        lineType: 'dotted',
        // 虚线，不填为实线
        dashLength: 6,
        //虚线条间隔，默认5
        lineWidth: 1,
        zIndex: 0
      },
      // 如果标签居中 center，则把二头的标签左边的左对齐，右边的右对齐
      align: 'normal',
      xLabel: {
        count: 5,
        length: 5,
        fill: '#000',
        stroke: '#000',
        margin: {
          left: 0,
          top: 10,
          right: 6,
          bottom: 0
        },
        textAlign: 'center',
        textBaseline: 'top',
        font: '12px Arial',
        zIndex: 20,
        // 旋转角度
        rotation: {
          angle: 0,
          point: {
            x: 0,
            y: 0
          }
        }
      },
      yLabel: {
        count: 5,
        length: 1,
        fill: '#000',
        margin: {
          left: 1,
          top: 6,
          right: 8,
          bottom: 0
        },
        textAlign: 'center',
        textBaseline: 'middle',
        font: '12px Arial',
        zIndex: 20,
        // 旋转角度
        rotation: {
          angle: 0,
          point: {
            x: 0,
            y: 0
          }
        }
      }
    },
    // 图形样式集
    chartColors: ['#249FDA', '#EA3B7C', '#8EBC00', '#309B46', '#4B507E', '#D8E404', '#EB792A', '#A00DA0'],

    /*tooltip: {
    	'background-color': 'rgb(255,255,255)',
    	'padding':'4px',
    	'opacity':'0.8',
    	'border':'1px solid #000',
    	'box-shadow': '0 0 3px #000',
    	'border-radius': '6px'
    },*/
    line: {
      normal: {
        lineWidth: 1,
        zIndex: 18,
        cursor: 'default'
      },
      hover: {
        lineWidth: 4,
        //zIndex: 100,
        cursor: 'pointer'
      },
      lineWidth: 1,
      zIndex: 18,
      cursor: 'default',
      radius: 3,
      fill: null,
      showItem: true,
      // 是否展示圆点
      item: {
        fill: '#fff',
        zIndex: 19
      },
      // 默认不填充，需要填满请配置{fill:'',stroke:''}
      area: false
    },
    bar: {
      normal: {
        lineWidth: 1,
        zIndex: 17,
        cursor: 'default',
        opacity: 0.8
      },
      hover: {
        lineWidth: 4,
        //zIndex: 100,
        opacity: 1,
        cursor: 'pointer'
      },
      lineWidth: 1,
      // 柱子宽占比，决定了柱子相对于总宽度
      perWidth: 0.5,
      zIndex: 17,
      cursor: 'default',
      close: true,
      opacity: 0.8,
      shadow: {
        x: 1,
        y: 1,
        blur: 2,
        color: '#000'
      }
    },
    pie: {
      normal: {
        zIndex: 11,
        cursor: 'default',
        opacity: 0.8
      },
      hover: {
        //zIndex: 100,
        opacity: 1,
        cursor: 'pointer'
      },
      margin: {
        left: 10,
        top: 10,
        right: 10,
        bottom: 10
      },
      lineWidth: 1,
      zIndex: 11,
      cursor: 'default',
      close: true,
      opacity: 0.8,
      shadow: {
        x: 1,
        y: 1,
        blur: 2,
        color: '#ccc'
      }
    }
  };

  /**
   * 画箭头,继承自jmPath
   *
   * @class jmArraw
   * @extends jmPath
   * @param {object} 生成箭头所需的参数
   */
  class jmArraw extends jmPath {	

  	constructor(params, t='jmArraw') {
  		super(params, t);
  		this.style.lineJoin = 'miter';
  		this.style.lineCap = 'square';

  		this.angle = params.angle  || 0;
  		this.start = params.start  || {x:0,y:0};
  		this.end = params.end  ||  {x:0,y:0};
  		this.offsetX = params.offsetX || 5;
  		this.offsetY = params.offsetY || 8;
  	}

  	/**
  	 * 控制起始点
  	 *
  	 * @property start
  	 * @for jmArraw
  	 * @type {point}
  	 */
  	get start() {
  		return this.__pro('start');
  	}
  	set start(v) {
  		this.needUpdate = true;
  		return this.__pro('start', v);
  	}

  	/**
  	 * 控制结束点
  	 *
  	 * @property end
  	 * @for jmArraw
  	 * @type {point} 结束点
  	 */
  	get end() {
  		return this.__pro('end');
  	}
  	set end(v) {
  		this.needUpdate = true;
  		return this.__pro('end', v);
  	}

  	/**
  	 * 箭头角度
  	 *
  	 * @property angle
  	 * @for jmArraw
  	 * @type {number} 箭头角度
  	 */
  	get angle() {
  		return this.__pro('angle');
  	}
  	set angle(v) {
  		this.needUpdate = true;
  		return this.__pro('angle', v);
  	}

  	/**
  	 * 箭头X偏移量
  	 *
  	 * @property offsetX
  	 * @for jmArraw
  	 * @type {number}
  	 */
  	get offsetX() {
  		return this.__pro('offsetX');
  	}
  	set offsetX(v) {
  		this.needUpdate = true;
  		return this.__pro('offsetX', v);
  	}

  	/**
  	 * 箭头Y偏移量
  	 *
  	 * @property offsetY
  	 * @for jmArraw
  	 * @type {number}
  	 */
  	get offsetY() {
  		return this.__pro('offsetY');
  	}
  	set offsetY(v) {
  		this.needUpdate = true;
  		return this.__pro('offsetY', v);
  	}

  	/**
  	 * 初始化图形点
  	 * 
  	 * @method initPoint
  	 * @private
  	 * @param {boolean} solid 是否为实心的箭头
  	 * @for jmArraw
  	 */
  	initPoints(solid) {	
  		let rotate = this.angle;
  		let start = this.start;
  		let end = this.end;
  		if(!end) return;
  		//计算箭头指向角度
  		if(!rotate) {
  			rotate = Math.atan2(end.y - start.y,end.x - start.x);
  		}
  		this.points = [];
  		let offx = this.offsetX;
  		let offy = this.offsetY;
  		//箭头相对于线的偏移角度
  		let r = Math.atan2(offx,offy);
  		let r1 = rotate + r;
  		let rsin = Math.sin(r1);
  		let rcos = Math.cos(r1);
  		let sq = Math.sqrt(offx * offx  + offy * offy);
  		let ystep = rsin * sq;
  		let xstep = rcos * sq;
  		
  		let p1 = {
  			x:end.x - xstep,
  			y:end.y - ystep
  		};
  		let r2 = rotate - r;
  		rsin = Math.sin(r2);
  		rcos = Math.cos(r2);
  		ystep = rsin * sq;
  		xstep = rcos * sq;
  		let p2 = {
  			x:end.x - xstep,
  			y:end.y - ystep
  		};

  		let s = jmUtils.clone(end);  
  		s.m = true;  
  		this.points.push(s);
  		this.points.push(p1);
  		//如果实心箭头则封闭路线
  		if(solid || this.style.fill) {    	
  			this.points.push(p2);
  			this.points.push(end);
  		}
  		else {
  			this.points.push(s);
  			this.points.push(p2);
  		}		
  		return this.points;
  	}

  }

  /**
   * 带箭头的直线,继承jmPath
   *
   * @class jmArrawLine
   * @extends jmLine
   * @param {object} params 生成当前直线的参数对象，(style=当前线条样式,start=直线起始点,end=直线终结点)
   */	
  class jmArrawLine extends jmLine {	

  	constructor(params, t) {

  		params.start = params.start || {x:0,y:0};
  		params.end = params.end || {x:0,y:0};

  		super(params, t||'jmArrawLine');
  		this.style.lineJoin = this.style.lineJoin || 'miter';
  		this.arraw = new jmArraw(params);
  	}

  	/**
  	 * 初始化直线和箭头描点
  	 *
  	 * @method initPoints
  	 * @private
  	 */
  	initPoints() {	
  		this.points = super.initPoints();
  		if(this.arrawVisible !== false) {
  			this.points = this.points.concat(this.arraw.initPoints());
  		}
  		return this.points;
  	}
  }

  /**
   * 显示文字控件
   *
   * @class jmLabel
   * @extends jmControl
   * @param {object} params params参数:style=样式，value=显示的文字
   */
  class jmLabel extends jmControl {

  	constructor(params, t) {
  		params = params || {};
  		super(params, t||'jmLabel');

  		this.style.font = this.style.font || "15px Arial";
  		this.style.fontFamily = this.style.fontFamily || 'Arial';
  		this.style.fontSize = this.style.fontSize || 15;

  		// 显示不同的 textAlign 值
  		//文字水平对齐
  		this.style.textAlign = this.style.textAlign || 'left';
  		//文字垂直对齐
  		this.style.textBaseline = this.style.textBaseline || 'middle';
  		this.text = params.text || '';

  		this.center = params.center || null;
  	}

  	/**
  	 * 显示的内容
  	 * @property text
  	 * @type {string}
  	 */
  	get text() {
  		return this.__pro('text');
  	}
  	set text(v) {
  		this.needUpdate = true;
  		return this.__pro('text', v);
  	}

  	/**
  	 * 中心点
  	 * point格式：{x:0,y:0,m:true}
  	 * @property center
  	 * @type {point}
  	 */
  	get center() {
  		return this.__pro('center');
  	}
  	set center(v) {
  		this.needUpdate = true;
  		return this.__pro('center', v);
  	}	

  	/**
  	 * 当前位置左上角
  	 * @property position
  	 * @type {point}
  	 */
  	get position() {
  		return this.__pro('position');
  	}
  	set position(v) {
  		this.needUpdate = true;
  		return this.__pro('position', v);
  	}

  	/**
  	 * 在基础的getLocation上，再加上一个特殊的center处理
  	 * 
  	 * @method getLocation
  	 * @returns {Object}
  	 */
  	getLocation() {
  		let location = super.getLocation();
  		let size = this.testSize();	
  		
  		location.width = location.width || size.width;
  		location.height = location.height || size.height;	

  		//如果没有指定位置，但指定了中心，则用中心来计算坐标
  		if(!location.left && !location.top && location.center) {
  			location.left = location.center.x - location.width / 2;
  			location.top = location.center.y - location.height / 2;
  		}
  		return location;
  	}

  	/**
  	 * 初始化图形点,主要用于限定控件边界。
  	 *
  	 * @method initPoints
  	 * @return {array} 所有边界点数组
  	 * @private
  	 */
  	initPoints() {	
  		this.__size = null;
  		let location = this.getLocation();

  		this.points = [{x: location.left, y: location.top}];
  		this.points.push({x: location.left + location.width, y: location.top});
  		this.points.push({x: location.left + location.width, y: location.top + location.height});
  		this.points.push({x: location.left, y: location.top + location.height});
  		return this.points;
  	}

  	/**
  	 * 测试获取文本所占大小
  	 *
  	 * @method testSize
  	 * @return {object} 含文本大小的对象
  	 */
  	testSize() {
  		if(this.__size) return this.__size;
  		
  		this.context.save();
  		// 修改字体，用来计算
  		this.setStyle({
  			font: this.style.font || (this.style.fontSize + 'px ' + this.style.fontFamily)
  		});
  		//计算宽度
  		this.__size = this.context.measureText?
  							this.context.measureText(this.text):
  							{width:15};
  		this.context.restore();
  		this.__size.height = this.style.fontSize?this.style.fontSize:15;
  		if(!this.width) this.width = this.__size.width;
  		if(!this.height) this.height = this.__size.height;
  		return this.__size;
  	}

  	/**
  	 * 根据位置偏移画字符串
  	 * 
  	 * @method draw
  	 */
  	draw() {	
  		
  		//获取当前控件的绝对位置
  		let bounds = this.parent && this.parent.absoluteBounds?this.parent.absoluteBounds:this.absoluteBounds;		
  		let size = this.testSize();
  		let location = this.location;
  		let x = location.left + bounds.left;
  		let y = location.top + bounds.top;
  		//通过文字对齐方式计算起始X位置
  		switch(this.style.textAlign) {
  			case 'right': {
  				x += location.width;
  				break;
  			}
  			case 'center': {
  				x += location.width / 2;
  				break;
  			}
  		}
  		//通过垂直对齐方式计算起始Y值
  		switch(this.style.textBaseline) {
  			case 'bottom': {
  				y += location.height;
  				break;
  			}
  			case 'hanging':
  			case 'alphabetic':
  			case 'middle' : {
  				y += location.height/2;
  				break;
  			}

  		}

  		let txt = this.text;
  		if(typeof txt !== 'undefined') {
  			if(this.style.fill && this.context.fillText) {
  				if(this.style.maxWidth) {
  					this.context.fillText(txt,x,y,this.style.maxWidth);
  				}
  				else {
  					this.context.fillText(txt,x,y);
  				}
  			}
  			else if(this.context.strokeText) {
  				if(this.style.maxWidth) {
  					this.context.strokeText(txt,x,y,this.style.maxWidth);
  				}
  				else {
  					this.context.strokeText(txt,x,y);
  				}
  			}
  		}
  		//如果有指定边框，则画出边框
  		if(this.style.border) {
  			//如果指定了边框样式
  			if(this.style.border.style) {
  				this.context.save();
  				this.setStyle(this.style.border.style);
  			}
  			this.context.moveTo(this.points[0].x + bounds.left,this.points[0].y + bounds.top);
  			if(this.style.border.top) {
  				this.context.lineTo(this.points[1].x + bounds.left,this.points[1].y + bounds.top);
  			}
  			
  			if(this.style.border.right) {
  				this.context.moveTo(this.points[1].x + bounds.left,this.points[1].y + bounds.top);
  				this.context.lineTo(this.points[2].x + bounds.left,this.points[2].y + bounds.top);
  			}
  			
  			if(this.style.border.bottom) {
  				this.context.moveTo(this.points[2].x + bounds.left,this.points[2].y + bounds.top);
  				this.context.lineTo(this.points[3].x + bounds.left,this.points[3].y + bounds.top);
  			}
  			
  			if(this.style.border.left) {
  				this.context.moveTo(this.points[3].x + bounds.left,this.points[3].y + bounds.top);	
  				this.context.lineTo(this.points[0].x + bounds.left,this.points[0].y + bounds.top);
  			}
  			//如果指定了边框颜色
  			if(this.style.border.style) {
  				this.context.restore();
  			}	
  		}		
  	}
  }

  /**
   * 轴
   *
   * @class jmAxis
   * @module jmChart
   * @param {jmChart} chart 当前图表
   * @param {string} [type] 轴类型(x/y/radar),默认为x
   * @param {string} [dataType] 当前轴的数据类型(number/date/string),默认为 number
   * @param {object} [style] 样式
   */

  class jmAxis extends jmArrawLine {
    constructor(options) {
      super(options); //初始化不显示箭头

      _defineProperty(this, "type", 'x');

      _defineProperty(this, "field", '');

      _defineProperty(this, "labelStart", 0);

      _defineProperty(this, "zeroBase", false);

      _defineProperty(this, "labelCount", 1);

      _defineProperty(this, "scalePoints", []);

      this.arrawVisible = !!options.arrawVisible;
      this.zeroBase = options.zeroBase || false;
      this.labelCount = options.labelCount || 5;
      this.type = options.type || 'x'; // 为横轴x或纵轴y

      if (this.type == 'x') {
        this.dataType = options.dataType || 'string';
      } else {
        this.dataType = options.dataType || 'number';
      }

      this.field = options.field || '';
      this.index = options.index || 0;
      this.init(options);
    } // 初始化一些参数
    // 这个函数可能会重入。


    init(options) {
      options = options || {}; // 深度组件默认样式

      if (options.style) this.graph.utils.clone(options.style, this.style, true);

      if (this.type == 'x') {
        if (typeof options.maxXValue !== 'undefined') this.maxValue = options.maxXValue; // 最大的值，如果指定了，则如果有数值比它大才会修改上限，否则以它为上限

        if (typeof options.minXValue !== 'undefined') this.minValue = options.minXValue; // 最小值，如果指定了，则轴的最小值为它或更小的值
      } else {
        if (typeof options.maxYValue !== 'undefined') this.maxValue = options.maxYValue; // 最大的值，如果指定了，则如果有数值比它大才会修改上限，否则以它为上限

        if (typeof options.minYValue !== 'undefined') this.minValue = options.minYValue; // 最小值，如果指定了，则轴的最小值为它或更小的值
      }
    }
    /**
     * 轴类型(x/y/radar),默认为x
     *
     * @property type
     * @type string
     */


    /**
     * 关联访问的是chart的数据源
     */
    get data() {
      return this.graph.data;
    }

    set data(d) {
      this.graph.data = d;
    }
    /**
     * 计算当前轴的位置
     * 
     * @method reset
     */


    reset() {
      const bounds = this.graph.chartArea.getBounds(); // 获取画图区域

      switch (this.type) {
        case 'x':
          {
            //初始化显示标签个数
            this.labelCount = this.style.xLabel.count || 5;
            this.start.x = bounds.left;
            this.start.y = bounds.bottom;
            this.end.x = bounds.right;
            this.end.y = bounds.bottom;
            break;
          }

        case 'y':
          {
            const index = this.index || 1;
            const xoffset = bounds.left; //初始化显示标签个数

            this.labelCount = this.style.yLabel.count || 5; //多Y轴时，第二个为右边第一轴，其它的依此递推

            if (index == 2) {
              xoffset = bounds.right;
            } else if (index > 2) {
              xoffset = this.graph.yAxises[index - 1].start.x + this.graph.yAxises[index - 1].width + 10;
            }

            this.start.x = xoffset;
            this.start.y = bounds.bottom;
            this.end.x = this.start.x;
            this.end.y = bounds.top; //当Y轴最小值为负数时，则移动X轴的位置到0位置

            const min = this.min();
            const max = this.max(); // zeroBase 时才需要移到0位置，否则依然为沉底

            if (this.dataType == 'number' && min < 0 && this.zeroBase && this.graph.xAxis) {
              const step = this.step();
              let xstepy = 0; //x轴y偏移量

              if (max <= 0) {
                this.graph.xAxis.value = max;
                xstepy = this.end.y;
              } else {
                this.graph.xAxis.value = min;
                xstepy = this.start.y + step * min;
              }

              this.graph.xAxis.start.y = this.graph.xAxis.end.y = xstepy;
            }

            break;
          }
      }

      this.createLabel();
    } // 绘制完成后，生成label标签


    draw() {
      this.points.push(...this.scalePoints); // 把刻度也画出来

      super.draw();
    }
    /**
     * 生成轴标签
     *
     * @method createLabel
     */


    createLabel() {
      //移除原有的标签 
      this.children.each(function (i, c) {
        c.remove();
      }, true);
      this.labels = []; //如果是？X轴则执行X轴标签生成

      if (this.type == 'x') {
        this.createXLabel();
      } else if (this.type == 'y') {
        this.createYLabel();
      }
    }
    /**
     * 生成X轴标签
     *
     * @method createXLabel
     * @private
     */


    createXLabel() {
      //var max = this.max();
      //var min = this.min();
      const step = this.step();
      this.scalePoints = []; // 刻度点集合
      //最多显示标签个数
      //var count = this.style.xLabel.count || this.data.length;	
      //字符串轴。则显示每个标签	

      const format = this.options.format || this.format;
      const top = this.style.xLabel.margin.top || 0;

      for (var i = 0; i < this.data.length; i++) {
        const d = this.data[i];
        const v = d[this.field];
        const w = i * step;
        const label = this.graph.createShape(jmLabel, {
          style: this.style.xLabel
        });
        label.data = d; // 当前点的数据结构值			

        label.text = format.call(this, v, d, i); // 格式化label

        if (!label.text) {
          label.visible = false;
        }

        this.labels.push(label);
        this.children.add(label);
        label.width = label.testSize().width + 2;
        label.height = 15;
        const pos = {
          x: this.labelStart + w,
          y: top
        }; // 指定要显示网格

        if (this.style.grid && this.style.grid.y) {
          // 它的坐标是相对于轴的，所以Y轴会用负的区域高度
          const line = this.graph.createShape(jmLine, {
            start: {
              x: pos.x,
              y: 0
            },
            end: {
              x: pos.x,
              y: -this.graph.chartArea.height
            },
            style: this.style.grid
          });
          this.children.add(line);
        } //在轴上画小标记m表示移至当前点开画


        this.scalePoints.push({
          x: pos.x + this.start.x,
          y: this.start.y,
          m: true
        });
        this.scalePoints.push({
          x: pos.x + this.start.x,
          y: this.start.y + (this.style.length || 5)
        }); //如果进行了旋转，则处理位移

        var rotation = label.style.rotation;

        if (rotation && rotation.angle) {
          //设定旋转原点为label左上角					
          rotation.point = pos; //当旋转后，其原点位移至左上角，所有当前控件必须反向移位其父容器位置

          label.position = {
            x: -this.graph.chartArea.position.x,
            y: -this.graph.chartArea.position.y
          };
        } else {
          // 如果标签居中，则把二头的标签左边的左对齐，右边的右对齐
          if (this.style.align === 'center' && (i === 0 || i === this.data.length - 1 && this.data.length > 1)) {
            if (i === this.data.length - 1) {
              pos.x -= label.width;
            }
          } else {
            pos.x -= label.width / 2; //向左偏移半个label宽度
          }

          label.position = pos;
        }
      }
    }
    /**
     * 生成Y轴标签
     *
     * @method createYLabel
     * @private
     */


    createYLabel() {
      const max = this.max();
      const min = this.min();
      const step = this.step();
      const index = this.index || 1;
      this.scalePoints = []; // 刻度点集合

      let count = this.labelCount;
      const mm = max - min;
      /*if(mm <= 10) {
      	count = mm;
      }*/

      let pervalue = mm / count || 1;
      if (pervalue > 1 || pervalue < -1) pervalue = Math.floor(pervalue);else pervalue = Number(pervalue.toFixed(2));
      const format = this.options.format || this.format;

      for (var p = min; p <= max; p += pervalue) {
        var v = p;
        var h = (v - min) * step;
        var label = this.graph.graph.createShape(jmLabel, {
          style: this.style.yLabel
        });
        label.text = format.call(this, v, label); // 格式化label

        this.labels.push(label);
        this.children.add(label);
        const w = label.testSize().width;
        const offy = this.height - h; // 刻度的偏移量
        //计算标签位置

        if (index <= 1) {
          //轴的宽度
          var axiswidth = this.style.yLabel.margin.right + w + label.style.length;
          this.width = Math.max(axiswidth, this.width);
          var pos = {
            x: -axiswidth,
            y: offy - label.height / 2
          }; //在轴上画小标记m表示移至当前点开画

          this.scalePoints.push({
            x: this.start.x,
            y: offy + this.end.y,
            m: true
          });
          this.scalePoints.push({
            x: this.start.x - label.style.length,
            y: offy + this.end.y
          }); // 指定要显示网格

          if (this.style.grid && this.style.grid.x) {
            // 它的坐标是相对于轴的，所以Y轴会用负的区域高度
            const line = this.graph.createShape(jmLine, {
              start: {
                x: 0,
                y: offy
              },
              end: {
                x: this.graph.chartArea.width,
                y: offy
              },
              style: this.style.grid
            });
            this.children.add(line);
          }
        } else {
          //轴的宽度
          var axiswidth = this.style.yLabel.margin.left + w + label.style.length;
          this.width = Math.max(axiswidth, this.width);
          var pos = {
            x: this.style.yLabel.margin.left + label.style.length,
            y: offy - label.height / 2
          }; //在轴上画小标记m表示移至当前点开画

          this.scalePoints.push({
            x: this.start.x,
            y: offy + this.end.y,
            m: true
          });
          this.scalePoints.push({
            x: this.start.x + label.style.length,
            y: offy + this.end.y
          });
        } //如果进行了旋转，则处理位移


        var rotation = label.style.rotation;

        if (rotation && rotation.angle) {
          label.translate = pos; //先位移再旋转

          label.position = {
            x: -w / 2,
            y: 0
          };
        } else {
          label.position = pos;
        }
      }
    }
    /**
    * 获取当前轴所占宽
    *
    * @method width
    */


    get width() {
      if (this._width) {
        return this._width;
      }

      return Math.abs(this.end.x - this.start.x);
    }

    set width(w) {
      this._width = w;
    }
    /**
    * 获取当前轴所占高
    *
    * @method height
    */


    get height() {
      return Math.abs(this.end.y - this.start.y);
    } // 这里设置高度没意义


    set height(h) {}
    /**
    * 获取或设置当前轴最大值
    *
    * @method max
    * @param {number/date/string} 当前轴的最大值
    * @return 当前轴的最大值
    */


    max(m) {
      if (typeof m !== 'undefined') {
        //如果为0为基线，则最小值不能大于0
        if (this.dataType == 'number' && m < 0 && this.zeroBase) {
          m = 0;
        }

        this._max = this._max != null && typeof this._max != 'undefined' ? Math.max(m, this._max) : m; // 如果有指定默认最大值，则不超过它就采用它

        if (typeof this.maxValue != 'undefined') this._max = Math.max(this.maxValue, this._max);
      } //如果为字符串，则返回分类个数


      if (this.dataType == 'string' && this.data) {
        return this.data.length;
      } //如果是数字类型，则在最大值基础上加一定的值


      if (this.dataType == 'number') {
        let m = this._max; // 如果有指定默认最大值，则不超过它就采用它

        if (typeof this.maxValue != 'undefined' && m <= this.maxValue) {
          return this.maxValue;
        }

        if (m <= 0) {
          if (m >= -10) m = 0;else m = -10;
        } else if (m > 500) {
          m = Math.ceil(m / 100);
          m = m * 100 + 100;
        } else if (m > 100) {
          m = Math.ceil(m / 50);
          m = m * 50 + 50;
        } else if (m > 10) {
          m = Math.ceil(m / 10);
          m = m * 10 + 10;
        } else {
          m = Math.ceil(m);
        }

        return m;
      }

      return this._max;
    }
    /**
    * 获取或设置当前轴最小值
    *
    * @method max
    * @param {number/date/string} 当前轴的最小值
    * @return 当前轴的最小值
    */


    min(m) {
      if (typeof m !== 'undefined') {
        //如果为0为基线，则最小值不能大于0
        if (this.dataType == 'number' && m > 0 && this.zeroBase) {
          m = 0;
        }

        this._min = this._min != null && typeof this._min != 'undefined' ? Math.min(m, this._min) : m; // 如果有指定默认最小值，则不小于它就采用它

        if (typeof this.minValue != 'undefined') this._min = Math.min(this.minValue, this._min);
      } //如果是数字类型，则在最小值基础上减去一定的值


      if (this.dataType == 'number') {
        var m = this._min;

        if (m >= 0) {
          if (m <= 10) m = 0;else {
            m = Math.floor(m / 10) * 10 - 10;
          }
        } else if (m < -500) {
          m = Math.floor(m / 100);
          m = m * 100 - 100;
        } else if (m < -100) {
          m = Math.floor(m / 50);
          m = m * 50 - 50;
        } else if (m < -10) {
          m = Math.floor(m / 10);
          m = m * 10 - 10;
        } else {
          m = Math.floor(m);
        } // 如果有指定默认最小值，则不小于它就采用它


        if (typeof this.minValue != 'undefined') {
          return Math.min(this.minValue, m);
        }

        return m;
      } //如果为字符串则返回0


      return this.dataType == 'string' ? 0 : this._min;
    }
    /**
     * 清除一些属性
     *
     * @method clear
     */


    clear() {
      this._min = null;
      this._max = null;
    }
    /**
     * 计算当前轴的单位偏移量
     *
     * @method step
     * @return {number} 单位偏移量
     */


    step() {
      if (this.type == 'x') {
        var w = this.width; //如果排版为内联，则单位占宽减少一个单位,
        //也就是起始位从一个单位开始

        if (this.graph.style.layout == 'inside') {
          var sp = w / this.max();
          this.labelStart = sp / 2;
          return sp;
        } else {
          this.labelStart = 0;
        }

        return w / (this.max() - 1);
      } else if (this.type == 'y') {
        var h = this.height;

        switch (this.dataType) {
          case 'string':
            {
              return h / this.max();
            }

          case 'date':
          case 'number':
          default:
            {
              var tmp = Math.abs(this.max() - this.min());
              tmp = tmp || 1;
              return h / tmp;
            }
        }
      }
    } // 格式化标签值


    format(v, item) {
      return v + '';
    }

  }

  /**
   * 图例的容器
   *
   * @class jmLegend
   * @module jmChart
   * @param {jmChart} chart 当前图表
   */

  class jmLegend extends jmRect {
    constructor(options) {
      //当前图例位置偏移量
      options.position = options.position || {
        x: 0,
        y: 0
      };
      super(options);

      _defineProperty(this, "legendPosition", 'right');
    }
    /**
     * 图例放置位置
     */


  }
  /**
   * 添加图例
   *
   * @method append
   * @param {jmSeries} series 当前图序列
   * @param {jmControl} shape 当前图例的图形对象
   */

  jmLegend.prototype.append = function (series, shape, options = {}) {
    // 如果不显示图例，就不处理
    if (this.visible === false) return;
    const panel = this.graph.createShape(jmRect, {
      style: this.graph.utils.clone(this.style.item),
      position: {
        x: 0,
        y: 0
      }
    });
    this.children.add(panel);
    panel.children.add(shape);
    shape.width = panel.style.shape.width;
    shape.height = panel.style.shape.height;
    name = options.name || series.legendLabel;
    name = series.options.legendFormat ? series.options.legendFormat.call(series, options) : name;

    if (name) {
      //生成图例名称
      const label = this.graph.createShape(jmLabel, {
        style: panel.style.label,
        text: name || ''
      });
      label.height = shape.height;
      label.position = {
        x: shape.width + 4,
        y: 0
      };
      panel.children.add(label);
      panel.width = shape.width + label.testSize().width;
    } else {
      panel.width = shape.width;
    }

    panel.height = shape.height; //执行进入事件
    //触动图例后加粗显示图

    /*const hover = options.hover || function() {	
    	//应用图的动态样式		
    	//Object.assign(series.style, series.style.hover);
    
    	//Object.assign(this.style, this.style.hover || {});
    
    	//series.graph.refresh();
    };
    panel.bind('mouseover', hover);
    //执行离开
    const leave = options.leave || function() {	
    	//应用图的普通样式		
    	//Object.assign(series.style, series.style.normal);
    
    	//Object.assign(this.style, this.style.normal || {});
    	//jmUtils.apply(this.series.style.normal,this.series.style);
    	//series.graph.refresh();
    };
    panel.bind('mouseleave', leave);*/

    var legendPosition = this.legendPosition || this.style.legendPosition;

    if (legendPosition == 'top' || legendPosition == 'bottom') {
      //顶部和底部图例横排，每次右移位一个单位图例
      panel.position.x = this.width + 15;
      this.width = panel.position.x + panel.width; // 把容器宽指定为所有图例宽和

      this.height = Math.max(panel.height, this.height);
    } else {
      //右边和左边图例竖排
      panel.position.y += this.height + 5;
      this.height = panel.position.y + panel.height;
      this.width = Math.max(panel.width, this.width);
    }

    this.needUpdate = true;
  };
  /**
   * 初始化图例
   *
   * @method init
   */


  jmLegend.prototype.init = function () {
    this.position.x = 0;
    this.position.y = 0;
    this.width = 0;
    this.height = 0;
    this.style.lineWidth = 0;
    this.children.clear();
  };
  /**
   * 重置图例属性,根据图例内容计算期大小并更新画图区域大小
   *
   * @method reset
   */


  jmLegend.prototype.reset = function () {
    if (this.visible !== false) {
      this.position.x = this.graph.chartArea.position.x;
      this.position.y = this.graph.chartArea.position.y;
      var legendPosition = this.legendPosition || this.style.legendPosition;

      switch (legendPosition) {
        case 'left':
          {
            this.graph.chartArea.width = this.graph.chartArea.width - this.width; //画图区域向右偏移

            this.graph.chartArea.position.x = this.position.x + this.width + this.style.margin.right;
            break;
          }

        case 'top':
          {
            this.graph.chartArea.height = this.graph.chartArea.height - this.height;
            this.graph.chartArea.position.y = this.position.y + this.height + this.style.margin.bottom;
            break;
          }

        case 'bottom':
          {
            this.graph.chartArea.height = this.graph.chartArea.height - this.height;
            this.position.y = this.graph.chartArea.position.y + this.graph.chartArea.height + this.style.margin.top;
            break;
          }

        case 'right':
        default:
          {
            this.graph.chartArea.width = this.graph.chartArea.width - this.width;
            this.position.x = this.graph.chartArea.position.x + this.graph.chartArea.width + this.style.margin.left;
            break;
          }
      }
    }
  };

  /**
   * 图形基类
   *
   * @class jmSeries
   * @module jmChart
   * @param {jmChart} chart 当前图表
   * @param {array} mappings 图形字段映射
   * @param {style} style 样式
   */
  //构造线图

  class jmSeries extends jmPath {
    constructor(options) {
      super(options);

      _defineProperty(this, "legendLabel", '');

      _defineProperty(this, "shapes", new jmList());

      _defineProperty(this, "field", '');

      this.options = options;
      this.field = options.field || '';
      this.index = options.index || 1;
      this.legendLabel = options.legendLabel || '';
      this.___animateCounter = 0; // 动画计数

      this.xAxis = this.graph.createXAxis(); // 生成X轴
      // 生成当前Y轴

      this.yAxis = this.yAxis || this.graph.createYAxis({
        index: this.index,
        format: options.yLabelFormat
      }); // 初始化一些参数， 因为这里有多个Y轴的可能，所以每次都需要重调一次init

      this.yAxis.init({
        field: this.field,
        minYValue: options.minYValue,
        maxYValue: options.maxYValue
      });
    }
    /**
     * 关联访问的是chart的数据源
     */


    get data() {
      return this.graph.data;
    }

    set data(d) {
      this.graph.data = d;
    }
    /**
     * 图例名称
     *
     * @property legendLabel
     * @type string
     */


    /**
     * 根据X轴坐标，获取它最近的数据描点
     * 离点最近的一个描点
     * @param {number} x  X轴坐标
     */
    getDataPointByX(x) {
      if (!this.dataPoints) return null; // 获取最近的那个

      let prePoint = undefined;
   // 跟上一个点和下一个点的距离，哪个近用哪个

      for (let i = 0; i < this.dataPoints.length; i++) {
        const p = this.dataPoints[i];
        if (p.x == x) return p; // 上一个点

        if (p.x < x) {
          if (i === this.dataPoints.length - 1) return p;
          prePoint = p;
        } // 下一个点


        if ( p.x > x) {
          // 没有上一个，只能返回这个了
          if (prePoint && x - prePoint.x < p.x - x) return prePoint;else return p;
        }
      }

      return null;
    }

  }
  /**
   * 重置属性
   * 根据数据源计算轴的属性
   *
   * @method reset
   */

  jmSeries.prototype.reset = function () {
    //是否启用动画效果
    this.enableAnimate = typeof this.enableAnimate === 'undefined' ? this.graph.enableAnimate : this.enableAnimate; // 重置所有图形

    var shape;

    while (shape = this.shapes.shift()) {
      shape && shape.remove();
    } //生成图例  这里要放到shape清理后面


    this.createLegend(); // 计算最大最小值
    // 当前需要先更新axis的边界值，轴好画图

    for (var i = 0; i < this.data.length; i++) {
      const v = this.data[i][this.field];
      this.yAxis.max(v);
      this.yAxis.min(v);
      const xv = this.data[i][this.xAxis.field];
      this.xAxis.max(xv);
      this.xAxis.min(xv);
    }

    return this.chartInfo = {
      xAxis: this.xAxis,
      yAxis: this.yAxis
    };
  };
  /**
   * 生成序列图描点
   *
   * @method createPoints
   */


  jmSeries.prototype.createPoints = function (data) {
    data = data || this.data;
    if (!data) return;
    const xstep = this.xAxis.step();
    const ystep = this.yAxis.step();
    this.dataPoints = [];

    for (var i = 0; i < data.length; i++) {
      const s = data[i];
      const xv = s[this.xAxis.field];
      const yv = s[this.field];
      const p = {
        data: s,
        xValue: xv,
        xLabel: xv,
        yValue: yv,
        yLabel: yv
      }; // 这里的点应相对于chartArea

      p.x = xstep * i + this.xAxis.labelStart; //如果Y值不存在。则此点无效，不画图

      if (yv == null || typeof yv == 'undefined') {
        p.m = true;
      } else {
        if (this.yAxis.dataType != 'number') {
          yv = i;
        }

        p.y = this.graph.chartArea.height - (yv - this.yAxis.min()) * ystep;
      }

      this.dataPoints.push(p);
    }

    return this.dataPoints;
  };
  /**
   * 生成图例
   *
   * @method createLegend
   */


  jmSeries.prototype.createLegend = function () {
    //生成图例前的图标
    const style = this.graph.utils.clone(this.style);
    style.fill = style.color; //delete style.stroke;

    const shape = this.graph.createShape(jmRect, {
      style
    });
    this.graph.legend.append(this, shape);
  };

  var utils = {
    /**
     * 对比二个数组数据是否改变
     * @param {Array} source 被对比的数、组
     * @param {Array} target 对比数组
     * @param {Function} compare 比较函数
     */
    arrayIsChange(source, target, compare) {
      if (!source || !target) return true;
      if (source.length !== target.length) return true;

      if (typeof compare === 'function') {
        for (let i = 0; i < source.length; i++) {
          if (!compare(source[i], target[i])) return true;
        }

        return false;
      } else return source == target;
    }

  };

  /**
   * 柱图
   *
   * @class jmBarSeries
   * @module jmChart
   * @param {jmChart} chart 当前图表
   * @param {array} mappings 图形字段映射
   * @param {style} style 样式
   */
  //构造函数

  class jmBarSeries extends jmSeries {
    constructor(options) {
      super(options);
    }
    /**
     * 绘制当前图形
     *
     * @method beginDraw
     * @for jmBarSeries
     */


    init() {
      const data = this.data;

      if (data) {
        //生成描点位
        let points; // 如果有动画，则需要判断是否改变，不然不需要重新动画

        let dataChanged = false;

        if (this.enableAnimate) {
          // 拷贝一份上次的点集合，用于判断数据是否改变
          const lastPoints = this.graph.utils.clone(this.dataPoints, true); // 重新生成描点

          points = this.createPoints(data);
          dataChanged = utils.arrayIsChange(lastPoints, points, (s, t) => {
            return s.x === t.x && s.y === t.y;
          });
        } else {
          points = this.createPoints(data);
        }

        const len = points.length; //设定其填充颜色

        this.style.fill = this.style.color; //计算每个柱子占宽
        //每项柱子占宽除以柱子个数,默认最大宽度为30		

        this.barTotalWidth = this.xAxis.width / len * (this.style.perWidth || 0.4);
        this.barWidth = this.barTotalWidth / this.graph.barSeriesCount;
        const maxBarWidth = this.graph.barMaxWidth || 50;

        if (this.barWidth > maxBarWidth) {
          this.barWidth = maxBarWidth;
          this.barTotalWidth = maxBarWidth * this.graph.barSeriesCount;
        }

        for (let i = 0; i < len; i++) {
          //const label = this.xAxis.labels[i];
          const point = points[i]; //如果当前点无效，则跳致下一点

          if (typeof point.y === 'undefined' || point.y === null) {
            continue;
          }

          const sp = this.shapes.add(this.graph.createPath(null, this.graph.utils.clone(this.style)));
          this.children.add(sp); //绑定提示框
          //this.bindTooltip(sp, point);
          //首先确定p1和p4,因为他们是底脚。会固定

          const p1 = {
            x: point.x - this.barTotalWidth / 2 + this.barWidth * this.barIndex,
            y: this.graph.chartArea.height
          };
          const p4 = {
            x: p1.x + this.barWidth,
            y: p1.y
          };
          const p2 = {
            x: p1.x,
            y: p1.y
          };
          const p3 = {
            x: p4.x,
            y: p1.y
          }; // 如果要动画。则动态改变高度

          if (this.enableAnimate && (dataChanged || this.___animateCounter > 0)) {
            const height = Math.abs(point.y - p1.y);
            const step = height / 100;
            const offHeight = step * this.___animateCounter; // 动态计算当前高度
            // 当次动画完成

            if (offHeight >= height) {
              p2.y = point.y;
              this.___animateCounter = 0;
            } else {
              this.___animateCounter++;
              p2.y = p1.y - offHeight; // 计算高度
              // next tick 再次刷新

              setTimeout(() => {
                this.needUpdate = true; //需要刷新
              });
            }

            p3.y = p2.y;
          } else {
            p2.y = point.y;
            p3.y = point.y;
          }

          sp.points.push(p1);
          sp.points.push(p2);
          sp.points.push(p3);
          sp.points.push(p4);
        }
      }
    }

  }

  /**
   * 圆弧图型 继承自jmPath
   *
   * @class jmArc
   * @extends jmPath
   * @param {object} params center=当前圆弧中心,radius=圆弧半径,start=圆弧起始角度,end=圆弧结束角度,anticlockwise=  false  顺时针，true 逆时针
   */
  class jmArc extends jmPath {

  	constructor(params, t='jmArc') {
  		if(!params) params = {};
  		super(params, t);

  		this.center = params.center || {x:0,y:0};
  		this.radius = params.radius || 0;

  		this.startAngle = params.start || params.startAngle || 0;
  		this.endAngle = params.end || params.endAngle || Math.PI * 2;		

  		this.anticlockwise = params.anticlockwise  || 0;

  		this.isFan = !!params.isFan;
  	}	

  	/**
  	 * 中心点
  	 * point格式：{x:0,y:0,m:true}
  	 * @property center
  	 * @type {point}
  	 */
  	get center() {
  		return this.__pro('center');
  	}
  	set center(v) {
  		this.needUpdate = true;
  		return this.__pro('center', v);
  	}

  	/**
  	 * 半径
  	 * @property radius
  	 * @type {number}
  	 */
  	get radius() {
  		return this.__pro('radius');
  	}
  	set radius(v) {
  		this.needUpdate = true;
  		return this.__pro('radius', v);
  	}

  	/**
  	 * 扇形起始角度
  	 * @property startAngle
  	 * @type {number}
  	 */
  	get startAngle() {
  		return this.__pro('startAngle');
  	}
  	set startAngle(v) {
  		this.needUpdate = true;
  		return this.__pro('startAngle', v);
  	}

  	/**
  	 * 扇形结束角度
  	 * @property endAngle
  	 * @type {number}
  	 */
  	get endAngle() {
  		return this.__pro('endAngle');
  	}
  	set endAngle(v) {
  		this.needUpdate = true;
  		return this.__pro('endAngle', v);
  	}

  	/**
  	 * 可选。规定应该逆时针还是顺时针绘图
  	 * false  顺时针，true 逆时针
  	 * @property anticlockwise
  	 * @type {boolean}
  	 */
  	get anticlockwise() {
  		return this.__pro('anticlockwise');
  	}
  	set anticlockwise(v) {
  		this.needUpdate = true;
  		return this.__pro('anticlockwise', v);
  	}


  	/**
  	 * 初始化图形点
  	 * 
  	 * @method initPoint
  	 * @private
  	 * @for jmArc
  	 */
  	initPoints() {
  		let location = this.getLocation();//获取位置参数
  		let mw = 0;
  		let mh = 0;
  		let cx = location.center.x ;
  		let cy = location.center.y ;
  		//如果设定了半径。则以半径为主	
  		if(location.radius) {
  			mw = mh = location.radius;
  		}
  		else {
  			mw = location.width / 2;
  			mh = location.height / 2;
  		}	
  		
  		let start = this.startAngle;
  		let end = this.endAngle;

  		if((mw == 0 && mh == 0) || start == end) return;

  		let anticlockwise = this.anticlockwise;
  		this.points = [];
  		let step = 1 / Math.max(mw, mh);

  		//如果是逆时针绘制，则角度为负数，并且结束角为2Math.PI-end
  		if(anticlockwise) {
  			let p2 =  Math.PI * 2;
  			start = p2 - start;
  			end = p2 - end;
  		}
  		if(start > end) step = -step;

  		if(this.isFan) this.points.push(location.center);// 如果是扇形，则从中心开始画
  		
  		//椭圆方程x=a*cos(r) ,y=b*sin(r)	
  		for(let r=start;;r += step) {	
  			if(step > 0 && r > end) r = end;
  			else if(step < 0 && r < end) r = end;

  			let p = {
  				x : Math.cos(r) * mw + cx,
  				y : Math.sin(r) * mh + cy
  			};
  			this.points.push(p);

  			if(r == end) break;
  		}
  		return this.points;
  	}
  }

  /**
   * 饼图
   *
   * @class jmPieSeries
   * @module jmChart
   * @param {jmChart} chart 当前图表
   * @param {array} mappings 图形字段映射
   * @param {style} style 样式
   */
  //构造函数

  class jmPieSeries extends jmSeries {
    constructor(options) {
      super(options);
      this.xAxis.visible = false;
      this.yAxis.visible = false;
    }

    init() {
      //总和
      this.totalValue = 0; //计算最大值和最小值

      if (this.data) {
        for (var i in this.data) {
          var s = this.data[i];
          var vy = s[this.field];

          if (vy) {
            this.totalValue += Math.abs(vy);
          }
        }
      }

      const center = {
        x: this.graph.chartArea.width / 2,
        y: this.graph.chartArea.height / 2
      }; //是否启用动画效果

      const ani = typeof this.enableAnimate === 'undefined' ? this.graph.enableAnimate : this.enableAnimate;
      var startAni = 0;
      var cm = Math.PI * 2;
      const radius = Math.min(center.x - this.style.margin.left - this.style.margin.right, center.y - this.style.margin.top - this.style.margin.bottom);
      const arc = this.graph.createShape(jmArc, {
        center: center,
        radius: radius,
        anticlockwise: true
      });
      const points = this.createPoints();

      if (ani) {
        var endAni = points[0].per * cm;

        function animate(points, start, endAni, cm, arc, index, series) {
          var p = points[index];
          var end = arc.endAngle || start;
          end += 0.3; //完成一个，接替到下一个

          if (end > endAni) {
            end = endAni;
          } //刷新角度


          arc.startAngle = start;
          arc.endAngle = end; //初始化扇形

          p.shape.points = arc.initPoints();
          p.shape.points.push(center); //终止当前动画

          if (end == endAni) {
            index++;

            if (index < points.length) {
              var nextpoint = points[index];

              if (nextpoint) {
                endAni = end + nextpoint.per * cm; //继续下一个动画

                nextpoint.shape.animate(animate, 50, points, end, endAni, cm, arc, index, series);
              } else {
                console.log('point null');
              }
            } //绑定提示框
            //series.bindTooltip(p.shape,p);


            return false;
          }
        }

        this.graph.animate(animate, 50, points, startAni, endAni, cm, arc, 0, this);
      } else {
        var len = points.length;

        for (var i = 0; i < len; i++) {
          var p = points[i];
          var start = startAni;
          startAni += p.per * cm;
          arc.startAngle = start;
          arc.endAngle = startAni;
          p.shape.points = arc.initPoints();
          p.shape.points.push(center); //绑定提示框
          //this.bindTooltip(p.shape, p);
        }
      }
    }
    /**
     * 生成序列图描点
     *
     * @method createPoints
     */


    createPoints() {
      if (!this.data) return [];
      const points = [];
      var index = 0;

      for (var i = 0; i < this.data.length; i++) {
        var s = this.data[i];
        var yv = s[this.field]; //如果Y值不存在。则此点无效，不画图

        if (yv == null || typeof yv == 'undefined') {
          continue;
        } else {
          var p = {
            data: s,
            yValue: yv,
            yLabel: yv,
            style: this.graph.utils.clone(this.style)
          };
          p.style.stroke = p.style.color = this.graph.getColor(index);
          p.style.fill = p.style.color; //计算占比

          p.per = Math.abs(p.yValue / this.totalValue);
          p.shape = this.graph.createPath([], p.style);
          this.shapes.add(p.shape);
          this.graph.chartArea.children.add(p.shape);
          points.push(p);
          index++;
        }
      }

      return points;
    }

  }
  /**
   * 生成图例
   *
   * @method createLegend	 
   */

  jmPieSeries.prototype.createLegend = function () {
    const points = this.createPoints();
    if (!points || !points.length) return;

    for (let k in points) {
      const p = this.shapes[k];
      if (!p) continue; //生成图例前的图标

      const style = this.graph.utils.clone(p.style);
      style.fill = style.color; //delete style.stroke;

      const shape = this.graph.createShape(jmRect, {
        style: style,
        position: {
          x: 0,
          y: 0
        }
      }); //shape.targetShape = p.shape;
      //此处重写图例事件

      this.graph.legend.append(this, shape, {
        name: this.legendLabel,
        hover: function () {
          //var sp = this.children.get(0);
          //应用图的动态样式
          Object.assign(this.targetShape.style, this.targetShape.style.hover);
          Object.assign(this.style, this.style.hover);
        },
        leave: function () {
          //var sp = this.children.get(0);
          //应用图的普通样式
          Object.assign(this.targetShape.style, this.targetShape.style.normal);
          Object.assign(this.style, this.style.normal);
        },
        data: this.data[k]
      });
    }
  };

  /**
   * 贝塞尔曲线,继承jmPath
   * N阶，参数points中为控制点
   *
   * @class jmBezier
   * @extends jmPath
   * @param {object} params 参数
   */ 
  class jmBezier extends jmPath {	
  	
  	constructor(params, t='jmBezier') {
  		// 典线默认不封闭
  		if(params.style && typeof params.style.close !== true) {
  			params.style.close = false;
  		}

  		super(params, t);
  		this.cpoints = params.points || [];
  	}	
  	
  	/**
  	 * 控制点
  	 *
  	 * @property cpoints
  	 * @for jmBezier
  	 * @type {array}
  	 */
  	get cpoints() {
  		return this.__pro('cpoints');
  	}
  	set cpoints(v) {
  		this.needUpdate = true;
  		return this.__pro('cpoints', v);
  	}
  	
  	/**
  	 * 初始化图形点
  	 *
  	 * @method initPoints
  	 * @private
  	 */
  	initPoints() {
  		
  		this.points = [];
  		
  		let cps = this.cpoints;
  		for(let t = 0;t <= 1;t += 0.01) {
  			let p = this.getPoint(cps,t);
  			this.points.push(p);
  		}	
  		this.points.push(cps[cps.length - 1]);
  		return this.points;
  	}

  	/**
  	 * 根据控制点和参数t生成贝塞尔曲线轨迹点
  	 *
  	 * @method getPoint
  	 * @param {array} ps 控制点集合
  	 * @param {number} t 参数(0-1)
  	 * @return {array} 所有轨迹点的数组
  	 */
  	getPoint(ps, t) {
  		if(ps.length == 1) return ps[0];
  		if(ps.length == 2) {					
  			let p = {};
  			p.x = (ps[1].x - ps[0].x) * t + ps[0].x;
  			p.y = (ps[1].y - ps[0].y) * t + ps[0].y;
  			return p;	
  		}
  		if(ps.length > 2) {
  			let nps = [];
  			for(let i = 0;i < ps.length - 1;i++) {
  				let p = this.getPoint([ps[i],ps[i+1]],t);
  				if(p) nps.push(p);
  			}
  			return this.getPoint(nps,t);
  		}
  	}

  	/**
  	 * 对控件进行平移
  	 * 遍历控件所有描点或位置，设置其偏移量。
  	 *
  	 * @method offset
  	 * @param {number} x x轴偏移量
  	 * @param {number} y y轴偏移量
  	 * @param {boolean} [trans] 是否传递,监听者可以通过此属性是否决定是否响应移动事件,默认=true
  	 */
  	offset(x, y, trans) {	
  		let p = this.cpoints;
  		if(p) {			
  			let len = p.length;
  			for(let i=0; i < len;i++) {
  				p[i].x += x;
  				p[i].y += y;
  			}		
  			
  			//触发控件移动事件	
  			this.emit('move',{
  				offsetX: x,
  				offsetY: y,
  				trans: trans
  			});
  			this.getLocation(true);	//重置
  		}
  	}
  }

  /**
   * 图形基类
   *
   * @class jmLineSeries
   * @module jmChart
   * @param {jmChart} chart 当前图表
   * @param {array} mappings 图形字段映射
   * @param {style} style 样式
   */
  //构造函数

  class jmLineSeries extends jmSeries {
    constructor(options) {
      options.style = options.style || options.graph.style.line;
      super(options); //this.on('beginDraw', this[PreDrawKey]);
    }
    /**
     * 绘制图形前 初始化线条
     *
     * @method preDraw
     * @for jmLineSeries
     */


    init() {
      //生成描点位
      let points; // 如果有动画，则需要判断是否改变，不然不需要重新动画

      let dataChanged = false;

      if (this.enableAnimate) {
        // 拷贝一份上次的点集合，用于判断数据是否改变
        const lastPoints = this.graph.utils.clone(this.dataPoints, true); // 重新生成描点

        points = this.createPoints();
        dataChanged = utils.arrayIsChange(lastPoints, points, (s, t) => {
          return s.x === t.x && s.y === t.y;
        });
      } else {
        points = this.createPoints();
      } //去除多余的线条
      //当数据源线条数比现有的少时，删除多余的线条


      const len = points.length; //设定其填充颜色
      //if(!this.style.fill) this.style.fill = jmUtils.toColor(this.style.stroke,null,null,20);	

      this.style.stroke = this.style.color; //是否启用动画效果
      //var ani = typeof this.enableAnimate === 'undefined'? this.graph.enableAnimate: this.enableAnimate;

      this.style.item.stroke = this.style.color;
      let shapePoints = []; // 计算出来的曲线点集合			

      for (var i = 0; i < len; i++) {
        const p = points[i]; //如果当前点无效，则跳致下一点

        if (typeof p.y === 'undefined' || p.y === null) {
          //prePoint = null;						
          continue;
        } // 当前线条描点，如果有动画是不一样的


        const linePoint = {
          x: p.x,
          y: this.graph.chartArea.height
        }; // 如果要动画。则动态改变高度

        if (this.enableAnimate && (dataChanged || this.___animateCounter > 0)) {
          const height = Math.abs(p.y - linePoint.y);
          const step = height / 100;
          const offHeight = step * this.___animateCounter; // 动态计算当前高度
          // 当次动画完成

          if (offHeight >= height) {
            linePoint.y = p.y;
            this.___animateCounter = 0;
          } else {
            this.___animateCounter++;
            linePoint.y -= offHeight; // 计算高度
            // next tick 再次刷新

            setTimeout(() => {
              this.needUpdate = true; //需要刷新
            });
          }
        } else {
          linePoint.y = p.y;
        } // 是否显示数值点圆


        if (this.style.showItem) {
          const pointShape = this.graph.createShape(jmArc, {
            style: this.style.item,
            center: linePoint,
            radius: this.style.radius || 3
          });
          pointShape.zIndex = (pointShape.style.zIndex || 1) + 1;
          this.graph.chartArea.children.add(pointShape);
          this.shapes.add(pointShape);
        }

        if (this.style.curve) {
          const startPoint = shapePoints[shapePoints.length - 1];

          if (startPoint && startPoint.y != undefined && startPoint.y != null) {
            //如果需要画曲线，则计算贝塞尔曲线坐标				
            const p1 = {
              x: startPoint.x + (linePoint.x - startPoint.x) / 5,
              y: startPoint.y
            };
            const p2 = {
              x: startPoint.x + (linePoint.x - startPoint.x) / 2,
              y: linePoint.y - (linePoint.y - startPoint.y) / 2
            };
            const p3 = {
              x: linePoint.x - (linePoint.x - startPoint.x) / 5,
              y: linePoint.y
            }; //圆滑线条使用的贝塞尔对象

            this.__bezier = this.__bezier || this.graph.createShape(jmBezier);
            this.__bezier.cpoints = [startPoint, p1, p2, p3, linePoint]; //设置控制点

            const bzpoints = this.__bezier.initPoints();

            shapePoints = shapePoints.concat(bzpoints);
          }
        }

        shapePoints.push(linePoint);
      }

      this.points = shapePoints;
      this.createArea(shapePoints); // 仓建区域效果
    }
    /**
     * 生成图例
     *
     * @method createLegend	 
     */


    createLegend() {
      //生成图例前的图标
      var style = this.graph.utils.clone(this.style);
      style.stroke = style.color;
      var shape = this.graph.createShape('path', {
        style: style
      });

      if (this.curve || this.style.curve) {
        var p1 = {
          x: 0,
          y: this.graph.style.legend.item.shape.height
        };
        var p2 = {
          x: this.graph.style.legend.item.shape.width / 3,
          y: this.graph.style.legend.item.shape.height / 3
        };
        var p3 = {
          x: this.graph.style.legend.item.shape.width / 3 * 2,
          y: this.graph.style.legend.item.shape.height / 3 * 2
        };
        var p4 = {
          x: this.graph.style.legend.item.shape.width,
          y: 0
        };
        this.__bezier = this.__bezier || this.graph.createShape(jmBezier);
        this.__bezier.cpoints = [p1, p2, p3, p4]; //设置控制点		

        shape.points = this.__bezier.initPoints();
      } else {
        shape.points = [{
          x: 0,
          y: this.graph.style.legend.item.shape.height / 2
        }, {
          x: this.graph.style.legend.item.shape.width,
          y: this.graph.style.legend.item.shape.height / 2
        }];
      }

      this.graph.legend.append(this, shape);
    } // 生成布效果


    createArea(points) {
      // 有指定绘制区域效果才展示
      if (!this.style.area || points.length < 2) return;
      const start = points[0];
      const end = points[points.length - 1];
      const style = this.graph.utils.clone(this.style.area, {}, true); // 连框颜色如果没指定，就透明

      style.stroke = style.stroke || 'transparent';

      if (!style.fill) {
        const color = this.graph.utils.hexToRGBA(this.style.stroke);
        style.fill = `linear-gradient(50% 0 50% 100%, 
				rgba(${color.r},${color.g},${color.b}, 0) 1, 
				rgba(${color.r},${color.g},${color.b}, 0) 0.3,
				rgba(${color.r},${color.g},${color.b}, 0.1) 0.1, 
				rgba(${color.r},${color.g},${color.b}, 0.2) 0)`;
      } else if (typeof style.fill === 'function') {
        style.fill = style.fill.call(this, style);
      }

      const area = this.graph.createShape(jmPath, {
        points: this.graph.utils.clone(points, true),
        style,
        width: this.graph.chartArea.width,
        height: this.graph.chartArea.height
      }); // 在点集合前后加上落地到X轴的点就可以组成一个封闭的图形area

      area.points.unshift({
        x: start.x,
        y: this.graph.chartArea.height
      });
      area.points.push({
        x: end.x,
        y: this.graph.chartArea.height
      });
      this.graph.chartArea.children.add(area);
      this.shapes.add(area);
    }

  }

  /**
   * 轴
   *
   * @class jmAxis
   * @module jmChart
   * @param {jmChart} chart 当前图表
   * @param {string} [type] 轴类型(x/y/radar),默认为x
   * @param {string} [dataType] 当前轴的数据类型(number/date/string),默认为 number
   * @param {object} [style] 样式
   */

  class jmMarkLine extends jmLine {
    constructor(options) {
      super(options);
      this.visible = false;
      this.markLineType = options.type || 'x'; // 为横轴x或纵轴y  

      /**
      * 当前图形下的所有子图
      */

      this.shapes = new jmList();
    } // 初始化轴


    init() {
      if (!this.visible) return; // 纵标线，中间标小圆圈

      if (this.markLineType === 'y') {
        // 重置所有图形
        var shape;

        while (shape = this.shapes.shift()) {
          shape && shape.remove();
        }

        const touchPoints = []; // 命中的数据点

        const graph = this.graph;
        let touchChange = false; // 根据线条数生成标点个数

        for (let serie of graph.series) {
          // 得有数据描点的才展示圆
          if (!serie.getDataPointByX) continue;
          const point = serie.getDataPointByX(this.start.x); // 找到最近的数据点

          if (!point) continue;
          const style = graph.utils.clone(this.style, {
            stroke: serie.style.color || serie.style.stroke
          }, true);
          this.markArc = graph.createShape(jmArc, {
            style,
            radius: this.style.radius || 5
          });
          this.markArc.center.y = point.y;
          this.children.add(this.markArc);
          this.shapes.add(this.markArc); // x轴改变，表示变换了位置

          if (!touchChange && (!serie.lastMarkPoint || serie.lastMarkPoint.x != point.x)) touchChange = true;
          this.start.x = this.end.x = point.x;
          touchPoints.push(point);
          serie.lastMarkPoint = point; // 记下最后一次改变的点
        } // 触发touch数据点改变事件


        touchChange && setTimeout(() => {
          graph.emit('touchPointChange', {
            points: touchPoints
          });
        }, 10);
      }
    }
    /**
    * 移动标线
    * @param { object } args 移动事件参数
    */


    move(args) {
      // 事件是挂在graph下的，，但此轴是放在chartArea中的。所以事件判断用graph坐标，但是当前位置要相对于chartArea
      if (this.visible && this.markLineType === 'x') {
        if (args.position.y <= this.graph.chartArea.position.y) {
          this.start.y = this.end.y = 0;
        } else if (args.position.y > this.graph.chartArea.height + this.graph.chartArea.position.y) {
          this.start.y = this.end.y = this.graph.chartArea.height;
        } else {
          this.start.y = this.end.y = args.position.y - this.graph.chartArea.position.y;
        }

        this.start.x = 0;
        this.end.x = this.graph.chartArea.width;
        this.needUpdate = true;
      }

      if (this.visible && this.markLineType === 'y') {
        if (args.position.x < this.graph.chartArea.position.x) {
          this.start.x = this.end.x = 0;
        } else if (args.position.x > this.graph.chartArea.width + this.graph.chartArea.position.x) {
          this.start.x = this.end.x = this.graph.chartArea.width;
        } else {
          this.start.x = this.end.x = args.position.x - this.graph.chartArea.position.x;
        }

        this.start.y = 0;
        this.end.y = this.graph.chartArea.height;
        this.needUpdate = true;
      }
    }
    /**
     * 中止
     */


    cancel() {
      this.visible = false;
      this.needUpdate = true;
    }

  }

  /**
   * jm图表组件
   * option参数:graph=jmgraph
   *
   * @class jmChart
   * @module jmChart
   * @param {element} container 图表容器
   */

  class jmChart extends jmGraph {
    constructor(container, options) {
      options = options || {};
      options.autoRefresh = typeof options.autoRefresh === 'undefined' ? true : options.autoRefresh; // 深度复制默认样式，以免被改

      options.style = jmUtils.clone(defaultStyle, options.style, true);
      super(container, options);

      _defineProperty(this, "data", []);

      _defineProperty(this, "series", new jmList());

      _defineProperty(this, "enableAnimate", false);

      this.data = options.data || []; // x轴绑定的字段名

      this.xField = options.xField || '';
      this.init(options);
    }
    /**
     * 绑定的数据源
     */


    // 初始化图表
    init(options) {
      this.enableAnimate = !!options.enableAnimate;
      /**
       * 绘图区域
       *
       * @property chartArea
       * @type jmControl
       */

      this.chartArea = this.chartArea || this.createShape(jmRect, {
        style: this.style.chartArea,
        position: {
          x: 0,
          y: 0
        }
      });
      this.children.add(this.chartArea);
      /**
       * 图例
       *
       * @property legend
       * @type jmLegend
       */

      this.legend = this.legend || this.createShape(jmLegend, {
        style: this.style.legend
      });
      this.children.add(this.legend); // 不显示图例

      if (options.legendVisible === false) {
        this.legend.visible = false;
      }
      /**
       * 图表提示控件
       *
       * @property tooltip
       * @type jmTooltip
       */
      //this.tooltip = this.graph.createShape('tooltip',{style:this.style.tooltip});
      //this.chartArea.children.add(this.tooltip);


      this.createXAxis(); // 生成X轴
      // 生成标线，可以跟随鼠标或手指滑动

      if (this.style.markLine && this.style.markLine.x) {
        this.xMarkLine = this.createShape(jmMarkLine, {
          type: 'x',
          style: this.style.markLine
        });
        this.chartArea.children.add(this.xMarkLine);
      }

      if (this.style.markLine && this.style.markLine.y) {
        this.yMarkLine = this.createShape(jmMarkLine, {
          type: 'y',
          style: this.style.markLine
        });
        this.chartArea.children.add(this.yMarkLine);
      }

      this.on('mousedown touchstart', function (args) {
        if (this.graph.xMarkLine) {
          this.graph.xMarkLine.visible = true;
          this.graph.xMarkLine.move(args);
        }

        if (this.graph.yMarkLine) {
          this.graph.yMarkLine.visible = true;
          this.graph.yMarkLine.move(args);
        }
      }); // 移动标线

      this.on('mousemove touchmove', function (args) {
        if (this.graph.xMarkLine && this.graph.xMarkLine.visible) {
          this.graph.xMarkLine.move(args);
        }

        if (this.graph.yMarkLine && this.graph.yMarkLine.visible) {
          this.graph.yMarkLine.move(args);
        }
      }); // 取消移动

      this.on('mouseup touchend touchcancel touchleave', function (args) {
        if (this.graph.xMarkLine && this.graph.xMarkLine.visible) {
          this.graph.xMarkLine.cancel(args);
        }

        if (this.graph.yMarkLine && this.graph.yMarkLine.visible) {
          this.graph.yMarkLine.cancel(args);
        }
      });
    } // 重置整个图表


    reset() {
      // 清空当前图形，重新生成
      let serie;

      while (serie = this.series.shift()) {
        // 重置所有图形
        let shape;

        while (shape = serie.shapes.shift()) {
          shape && shape.remove();
        }

        serie.remove();
      } // 轴删除


      if (this.xAxis) {
        this.xAxis.remove();
        delete this.xAxis;
      }

      if (this.yAxises) {
        for (let i in this.yAxises) {
          this.yAxises[i].remove();
        }

        delete this.yAxises;
      }
    }

  }
  /**
   * 获取颜色
   *
   * @method getColor 
   * @param {int} index 颜色索引
   */

  jmChart.prototype.getColor = function (index) {
    //如果颜色超过最大个数，则重新获取	
    if (index >= this.style.chartColors.length) {
      index = Math.floor((index - 1) / this.style.chartColors.length);
    }

    return this.style.chartColors[index];
  };
  /**
   * 绘制当前图表
   * 先绘制轴等基础信息
   *
   * @method beginDraw 
   */


  jmChart.prototype.beginDraw = function () {
    //重置图例
    this.legend && this.legend.init(); //先定位图例等信息，确定画图区域

    this.resetAreaPosition();

    if (this.xAxis) {
      this.xAxis.clear();
    } //计算Y轴位置


    if (this.yAxises) {
      for (let i in this.yAxises) {
        this.yAxises[i].clear();
      }
    } //计算柱形图个数


    this.barSeriesCount = 0; //初始化图序列，并初始化轴值,生成图例项

    this.series.each(function (i, serie) {
      //设定边框颜色和数据项图示颜 色
      serie.style.color = serie.style.color || serie.graph.getColor(i); //如果排版指定非内缩的方式，但出现了柱图，还是会采用内缩一个刻度的方式

      if (serie.graph.style.layout != 'inside') {
        if (serie.graph.utils.isType(serie, jmBarSeries)) {
          serie.graph.style.layout = 'inside';
        }
      } //对柱图计算,并标记为第几个柱图，用为排列


      if (serie.graph.utils.isType(serie, jmBarSeries)) {
        serie.barIndex = serie.graph.barSeriesCount;
        serie.graph.barSeriesCount++;
      }

      serie.reset();
    }); //重置图例

    this.legend && this.legend.reset();

    if (this.xAxis) {
      this.xAxis.reset();
    } //计算Y轴位置


    if (this.yAxises) {
      for (var i in this.yAxises) {
        this.yAxises[i].reset();
      }
    } //最后再来初始化图形，这个必须在轴初始化完后才能执行


    this.series.each(function (i, serie) {
      serie.init && serie.init();
    }); // 重置标线，会处理小圆圈问题

    this.xMarkLine && this.xMarkLine.init();
    this.yMarkLine && this.yMarkLine.init();
  };
  /**
   * 重新定位区域的位置
   *
   * @method resetAreaPosition
   */


  jmChart.prototype.resetAreaPosition = function () {
    this.chartArea.position.x = this.style.margin.left || 0;
    this.chartArea.position.y = this.style.margin.top || 0;
    var w = this.width - this.style.margin.right - this.chartArea.position.x;
    var h = this.height - this.style.margin.bottom - this.chartArea.position.y;
    this.chartArea.width = w;
    this.chartArea.height = h;
  };
  /**
   * 创建轴
   *
   * @method createAxis
   * @for jmChart
   * @param {string} [type] 轴类型(x/y/radar),默认为x
   * @param {string} [dataType] 当前轴的数据类型(number/date/string),默认为 number
   * @param {object} [style] 样式
   * @return {axis} 轴
   */


  jmChart.prototype.createAxis = function (options) {
    // 深度组件默认样式
    options.style = options.style ? this.utils.clone(this.style.axis, options.style, true) : this.style.axis;
    const axis = this.createShape(jmAxis, options);
    this.children.add(axis);
    return axis;
  };
  /**
   * 生成X轴
   *
   * @method createXAxis
   * @param {string} x轴的数据类型(string/number/date)
   * @param {bool} 是否从0开始
   */


  jmChart.prototype.createXAxis = function (options) {
    if (!this.xAxis) {
      options = Object.assign({
        field: this.xField,
        type: 'x',
        minXValue: this.options.minXValue,
        maxXValue: this.options.maxXValue,
        format: this.options.xLabelFormat
      }, options || {});
      this.xAxis = this.createAxis(options);
    }

    return this.xAxis;
  };
  /**
   * 生成Y轴
   *
   * @method createYAxis
   * @param {int} Y轴索引，可以创建多个Y轴
   * @param {string} y轴的数据类型(string/number/date)
   * @param {bool} 是否从0开始
   */


  jmChart.prototype.createYAxis = function (options) {
    options.index = options.index || 1;
    options.type = 'y';

    if (!this.yAxises) {
      this.yAxises = {};
    }

    var yaxis = this.yAxises[options.index] || (this.yAxises[options.index] = this.createAxis(options));
    return yaxis;
  };
  /**
   * 创建图形
   *
   * @method createSeries
   * @for jmChart
   * @param {string} [type] 图类型，（line/bar/pie/radar）
   * @param {object} [options] 生成图表选项 {xField, yField, index}
   * @return {series} 图形
   */


  jmChart.prototype.createSeries = function (type, options = {}) {
    if (!this.serieTypes) {
      this.serieTypes = {
        'line': jmLineSeries,
        'bar': jmBarSeries,
        'pie': jmPieSeries
      };
    } //默认样式为类型对应的样式


    const style = this.style[type] || this.style['line']; // 深度组件默认样式

    options.style = this.utils.clone(style, options.style, true);
    if (typeof type == 'string') type = this.serieTypes[type];
    const serie = this.createShape(type, options);

    if (serie) {
      this.series.add(serie);
      this.chartArea.children.add(serie);
    }

    return serie;
  };

  var vchart = {
    props: {
      chartData: Array,
      chartOptions: Object,
      chartSeries: Array,
      width: {
        type: String,
        default: 200
      },
      height: {
        type: String,
        default: 200
      }
    },
    data: function () {
      return {
        //chartData: this.chartData,
        options: this.chartOptions
      };
    },
    // jmChart实例
    chartInstance: null,

    mounted() {
      this.options = Object.assign({
        enableAnimate: false,
        legendPosition: 'top',
        legendVisible: true,
        // 不显示图例    
        width: this.width,
        height: this.height
      }, this.chartOptions);
      this.initChart();
    },

    // DOM更新
    updated() {
      this.initChart();
    },

    watch: {
      // 数据发生改变，刷新
      chartData: function (newData, oldData) {
        this.initChart();
        this.chartInstance.data = newData;
        this.chartInstance.refresh();
      },
      width: function (newWidth, oldWidth) {
        if (!this.chartInstance) return;
        this.$nextTick(() => {
          this.chartInstance.width = this.$refs.jmChartContainer.clientWidth || this.$refs.jmChartContainer.offsetWidth; //this.chartInstance.refresh();
        });
      },
      height: function (newHeight, oldHeight) {
        if (!this.chartInstance) return;
        this.$nextTick(() => {
          this.chartInstance.height = this.$refs.jmChartContainer.clientHeight || this.$refs.jmChartContainer.offsetHeight; //this.chartInstance.refresh();
        });
      }
    },
    methods: {
      // 初始化图表组件
      initChart() {
        if (this.chartInstance) return;
        this.chartInstance = new jmChart(this.$refs.jmChartContainer, this.options);
        this.refresh(); // 这里有死循环的问题，但上面 chartInstance不为空就返回了，就没有这个问题了
        // touch改变数据点事件

        this.chartInstance.bind('touchPointChange', args => {
          this.$emit('touch-point-change', args);
        }); // touch事件

        this.chartInstance.bind('touchstart mousedown', args => {
          this.$emit('touchstart', args);
          this.$emit('mousedown', args);
        });
        this.chartInstance.bind('touchmove mousemove', args => {
          this.$emit('touchmove', args);
          this.$emit('mousemove', args);
        });
        this.chartInstance.bind('touchend touchcancel mouseup', args => {
          this.$emit('touchend', args);
          this.$emit('mouseup', args);
        });
        this.chartInstance.bind('touchleave', args => {
          this.$emit('touchleave', args);
        });
      },

      // 刷新图表
      refresh() {
        this.$nextTick(() => {
          this.initChart(); // 清空当前图形，重新生成

          this.chartInstance.reset(); // 生成图

          if (this.chartSeries.length) {
            for (let s of this.chartSeries) {
              if (!s.type) {
                console.error('必须指定serie type');
                continue;
              }

              this.chartInstance.createSeries(s.type, s);
            }
          }

          this.chartInstance.data = this.chartData;
          this.chartInstance.refresh();
        });
      }

    },
    template: `<div ref="jmChartContainer" :style="{width: width, height: height}"></div>`
  };

  exports.default = jmChart;
  exports.jmChart = jmChart;
  exports.vChart = vchart;

  return exports;

}({}));
