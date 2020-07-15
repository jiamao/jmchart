import jmRect from 'jmgraph/src/shapes/jmRect.js';
import jmArc from 'jmgraph/src/shapes/jmArc.js';
import jmHArc from 'jmgraph/src/shapes/jmHArc.js';
import jmSeries from './series.js';

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
export default class jmPieSeries extends jmSeries {
	constructor(options) {
		super(options);

		this.xAxis.visible = false;
		this.yAxis.visible = false;
	}

	init() {
	
		//总和
		this.totalValue = 0;
		//计算最大值和最小值
		if(this.data) {		
			for(var i in this.data) {
				var s = this.data[i];							
				var vy = s[this.field];	
				if(vy) {
					this.totalValue += Math.abs(vy);
				}	
			}		
		}

		const center = { 
			x: this.graph.chartArea.width / 2, 
			y: this.graph.chartArea.height / 2
		};

		//是否启用动画效果
		const ani = typeof this.enableAnimate === 'undefined'?this.graph.enableAnimate:this.enableAnimate;
		
		var startAni = 0;
		var cm = Math.PI * 2;
		
		const radius = Math.min(center.x - this.style.margin.left - 
			this.style.margin.right * this.graph.devicePixelRatio,
			center.y - this.style.margin.top * this.graph.devicePixelRatio - this.style.margin.bottom * this.graph.devicePixelRatio);
		// const arc = this.graph.createShape(jmArc, {
		// 	center: center,
		// 	radius: radius,
		// 	anticlockwise: true
		// });

		const points = this.createPoints(center, radius);

		
		if(false) {
			// var endAni = points[0].per * cm;
			// function animate(points,start,endAni,cm,arc,index,series) {
			// 	var p = points[index];
			// 	var end = arc.endAngle || start;
			// 	end += 0.3;
				
			// 	//完成一个，接替到下一个
			// 	if(end > endAni) {
			// 		end = endAni;				
			// 	}

			// 	//刷新角度
			// 	arc.startAngle = start;
			// 	arc.endAngle = end;
			// 	//初始化扇形
			// 	p.shape.points = arc.initPoints();
			// 	p.shape.points.push(center);
			// 	//终止当前动画
			// 	if(end == endAni) {
			// 		index ++;
			// 		if(index < points.length) {					
			// 			var nextpoint = points[index];
			// 			if(nextpoint) {
			// 				endAni = end + nextpoint.per * cm;
			// 				//继续下一个动画
			// 				nextpoint.shape.animate(animate,50,points,end,endAni,cm,arc,index,series);
			// 			}
			// 			else {
			// 				console.log('point null');
			// 			}
			// 		}
			// 		//绑定提示框
			// 		//series.bindTooltip(p.shape,p);
			// 		return false;
			// 	}
			// }
			// this.graph.animate(animate,50, points,startAni,endAni,cm,arc,0,this);
		}
		else {
			const len = points.length;
			for(let i=0; i<len; i++) {
				const p = points[i];		
				const start = startAni;
				startAni += p.per * cm;

				p.shape.startAngle = start;
				p.shape.endAngle = startAni;

				// p.shape.points = arc.initPoints();
				// p.shape.points.push(center);			
				//绑定提示框
				//this.bindTooltip(p.shape, p);
			}
		}
	}

	/**
	 * 生成序列图描点
	 *
	 * @method createPoints
	 */
	createPoints(center, radius) {		
		if(!this.data) return [];

		const points = [];
		let index = 0;
		
		for(var i=0;i< this.data.length;i++) {
			const s = this.data[i];
			
			const yv = s[this.field];

			//如果Y值不存在。则此点无效，不画图
			if(yv == null || typeof yv == 'undefined') {
				continue;
			}
			else {
				const p = {				
					data: s,
					yValue: yv,
					yLabel: yv,
					style: this.graph.utils.clone(this.style)
				};
				//p.style.color = this.graph.getColor(index);
				p.style.fill = this.graph.getColor(index);

				if(center && radius) {
					//计算占比
					p.per = Math.abs(p.yValue / this.totalValue);
					
					p.shape = this.graph.createShape(this.style.isHollow? jmHArc : jmArc, {
						style: p.style,
						anticlockwise: true,
						isFan: true, // 表示画扇形
						center,
						radius,
						maxRadius: radius,
						minRadius: radius * 0.8
					});

					p.shape.getLocation = function() {			
						const local = this.location = {
							left: 0,
							top: 0,
							width: 0,
							height: 0,
							center: this.center,
							radius: this.radius
						};

						local.left = this.center.x - this.radius;
						local.top = this.center.y - this.radius;
						local.width = local.height = this.radius * 2;
						
						return local;
					}
					p.shape.getBounds = function() {
						return this.getLocation();
					}

					this.shapes.add(p.shape);
					this.graph.chartArea.children.add(p.shape);
				}
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
jmPieSeries.prototype.createLegend = function() {

	const points = this.createPoints();
	if(!points || !points.length) return;
	
	for(let k in points) {
		const p = points[k];
		if(!p) continue;

		//生成图例前的图标
		const style = this.graph.utils.clone(p.style);
		style.fill = style.fill;	
		//delete style.stroke;
		const shape = this.graph.createShape(jmRect,{
			style: style,
			position : {x: 0, y: 0}
		});
		//shape.targetShape = p.shape;
		//此处重写图例事件
		this.graph.legend.append(this, shape, {
			name: this.legendLabel, 
			hover: function() {	
				//var sp = this.children.get(0);
				//应用图的动态样式
				Object.assign(this.targetShape.style, this.targetShape.style.hover);	
				Object.assign(this.style, this.style.hover);
			},
			leave: function() {	
				//var sp = this.children.get(0);
				//应用图的普通样式
				Object.assign(this.targetShape.style, this.targetShape.style.normal);			
				Object.assign(this.style, this.style.normal);
			}, 
			data: this.data[k]
		});
	}	
}

