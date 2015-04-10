game.MiniMap = me.Entity.extend({
	init: function(x,y,settings){
		this._super(me.Entity, "init", [x,y,{
			image: "miniMap",
			width:983,
			height:168,
			spritewidth:"983",
			spriteheight:"168",
			getShape: function(){
				return (new me.Rect (0, 0, 983, 168)).toPolygon();
			}
		}]);
		this.floating = true;
	}
});