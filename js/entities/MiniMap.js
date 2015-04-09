game.MiniMap = me.Entity.extend({
	init: function(x,y,settings){
		this._super(me.Entity, "init", [x,y,{
			image: "miniMap",
			width:703,
			height:116,
			spritewidth:"703",
			spriteheight:"116",
			getShape: function(){
				return (new me.Rect ()).toPolygon();
			}
		}]);
		this.floating = true;
	}
});