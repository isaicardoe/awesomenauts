game.PlayerEntity = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, {
            image: "player",
            width: 64,
            height: 64,
            spritewidth: "64",
            spriteheight: "64",
            getShape: function(){
                return(new me.Rect(0, 0, 64, 64)).toPolygon();
            }
        }]);
       this.type = "PlayerEntity";
       this.health = game.data.playerHealth;
       this.body.setVelocity(game.data.playerMoveSpeed, 20);
       //keeps track of which direction your character is going
       this.facing = "right";
       this.now = new Date().getTime();
       this.lastHit = this.now;
       this.dead = false;
       this.lastAttack = new Date().getTime();  //Haven't used this
       me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
       
       this.renderable.addAnimation("idle", [78]);
       this.renderable.addAnimation("walk", [117, 118, 119, 120, 121, 122, 123, 124, 125], 80);
       this.renderable.addAnimation("attack", [65, 66, 67, 68, 69, 70, 71, 72], 80);
       
       this.renderable.setCurrentAnimation("idle");
    },
    
    update: function(delta){
        this.now = new Date().getTime();
        
        if (this.health <= 0){
            this.dead = true;
            this.pos.x = 10;
            this.pos.y = 0;
            this.health = game.data.playerHealth;
        }
        
        if(me.input.isKeyPressed("right")){
            //adds the position of my x by the velocity defined above in
            //setVelocity and multiplying it by me.timer.tick
            //me.timer.tick makes movement look smooth
            this.body.vel.x += this.body.accel.x * me.timer.tick;
            this.facing = "right";
            this.flipX(true);
        }else if(me.input.isKeyPressed("left")){
            this.facing = "left";
            this.body.vel.x -=this.body.accel.x * me.timer.tick;
            this.flipX(false);
        }else{
            this.body.vel.x = 0;
        }
        //i made the character go left when the left key is pressed
        if(me.input.isKeyPressed("jump") && !this.body.jumping && !this.body.falling){
            this.body.jumping = true;
            this.body.vel.y -= this.body.accel.y * me.timer.tick;
        }
        //i am making the character jump when i press the space button
        if(me.input.isKeyPressed("attack")){
            if(!this.renderable.isCurrentAnimation("attack")){
                console.log(this.renderable.isCurrentAnimation("attack"));
                //sets the current animation to attack and once that is over
                //goes back to the idle animation
                this.renderable.setCurrentAnimation("attack", "idle");
                //makes it so the next time we start this sequence we begin
                //from the first animation, not from wherever we left off when we
                //switched to another animation
                this.renderable.setAnimationFrame();
            }
        }
        
        else if(this.body.vel.x !== 0 && !this.renderable.isCurrentAnimation("attack")) {
             if(!this.renderable.isCurrentAnimation("walk")){
                 this.renderable.setCurrentAnimation("walk");
        }
        }else if(!this.renderable.isCurrentAnimation("attack")){
           this.renderable.setCurrentAnimation("idle");
        }
        
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        this.body.update(delta);
        
        
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    loseHealth: function(damage){
      this.health = this.health - damage;
      console.log(this.health);
    },
    
    collideHandler: function(response){
        if(response.b.type==='EnemyBaseEntity'){
            var ydif = this.pos.y - response.b.pos.y;
            var xdif = this.pos.x - response.b.pos.x;
            
            if(ydif<-40 && xdif< 70 && xdif>-35){
                this.body.falling = false;
                this.body.vel.y = -1;
            }
            else if(xdif>-35 && this.facing==='right' && (xdif<0)){
                this.body.vel.x = 0;
                this.pos.x = this.pos.x -1;
            }else if(xdif<70 && this.facing==='left' && (xdif>0)){
                this.body.vel.x = 0;
                this.pos.x = this.pos.x +1;
            }
            
            if(this.renderable.isCurrentAnimation("attack") && this.now-this.lastHit >= game.data.playerAttackTimer){
                console.log("tower Hit");
                this.lastHit = this.now;
                response.b.loseHealth();
            }
        }else if(response.b.type==='EnemyCreep'){
            var xdif = this.pos.x - response.b.pos.x;
            var ydif = this.pos.y - response.b.pos.y;
            
            if (xdif>0){
                this.pos.x = this.pos.x + 1;
                if(this.facing==="left"){
                    this.body.vel.x = 0;
                }
            }else{
                this.pos.x = this.pos.x - 1;
                if(this.facing==="right"){
                    this.body.vel.x = 0;
                }
            }           
            if(this.renderable.isCurrentAnimation("attack") && this.now-this.lastHit >= game.data.playerAttackTimer
                    && (Math.abs(ydif) <=40) && 
                    (((xdif>0) && this.facing==="left") || ((xdif<0) && this.facing==="right"))
                    ){
                this.lastHit = this.now;
                response.b.loseHealth(game.data.playerAttack);
            }
        }
    }
});

game.PlayerBaseEntity = me.Entity.extend({
    init : function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, {
            image: "tower",
            width: 100,
            height: 100,
            spritewidth: "100",
            spriteheight: "100",
            getShape: function(){
                return (new me.Rect(0, 0, 100, 70)).toPolygon();
            }
        }]);
        this.broken = false;
        this.health = game.data.playerBaseHealth;
        this.alwaysUpdate = true;
        this.body.onCollision = this.onCollision.bind(this);
        this.type = "PlayerBase";
        
        this.renderable.addAnimation("idle", [0]);
        this.renderable.addAnimation("broken", [1]);
        this.renderable.setCurrentAnimation("idle");
    },
    
    update:function(delta){
        if(this.health<=0){
            this.broken = true;
            this.renderable.setCurrentAnimation("broken");
        }
        this.body.update(delta);
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    loseHealth: function(damage){
        this.health = this.health - damage;
    },
    
    onCollision: function(){
        
    }
    
});

game.EnemyBaseEntity = me.Entity.extend({
    init : function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, {
            image: "tower",
            width: 100,
            height: 100,
            spritewidth: "100",
            spriteheight: "100",
            getShape: function(){
                return (new me.Rect(0, 0, 100, 70)).toPolygon();
            }
        }]);
        this.broken = false;
        this.health = game.data.enemyBaseHealth;
        this.alwaysUpdate = true;
        this.body.onCollision = this.onCollision.bind(this);
        console.log("init");
        this.type = "EnemyBaseEntity"; 
        
        this.renderable.addAnimation("idle", [0]);
        this.renderable.addAnimation("broken", [1]);
        this.renderable.setCurrentAnimation("idle");
    },
    
    update:function(delta){
        if(this.health<=0){
            this.broken = true;
            this.renderable.setCurrentAnimation("broken");
        }
        this.body.update(delta);
        
        this._super(me.Entity, "update", [delta]);
        return true;
    },
    
    onCollision: function(){
        
    },
    
    loseHealth: function(){
        this.health--;
    }
    
});

game.EnemyCreep = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, {
            image: "creep1",
            width: 32,
            height: 64,
            spritewidth: "32",
            spriteheight: "64",
            getShape: function(){
                return (new me.Rect(0, 0, 32, 64)).toPolygon();
            }
        }]);
        this.health = game.data.enemyCreepHealth;
        this.alwaysUpdate = true;
        //this.attacking lets us know if the enemy is currently attacking
        this.attacking = false;
        //keeps track of when our creep last creep attcked anything
        this.lastAttacking = new Date().getTime();
        //keep track of the last time our creep hit anything
        this.lastHit = new Date().getTime();
        this.now = new Date().getTime();
        this.body.setVelocity(3, 20);
        
        this.type = "EnemyCreep";
        
        this.renderable.addAnimation("walk", [3, 4, 5], 80);
        this.renderable.setCurrentAnimation("walk");
    
    },
    
    loseHealth: function(damage){
        this.health = this.health - damage;  
    },
    
    update: function(delta){
        console.log(this.health);
        if(this.health <= 0){
            me.game.world.removeChild(this);
        }
        
        this.now = new Date().getTime();
        
        this.body.vel.x -= this.body.accel.x * me.timer.tick;
        
        me.collision.check(this, true, this.collideHandler.bind(this), true);
        
        
        this.body.update(delta);
        
        
        
        this._super(me.Entity, "update", [delta]);  
        return true;
    },
    
    collideHandler: function(response){
        if(response.b.type==='PlayerBase'){
            this.attacking=true;
            //this.lastAttcking=this.now;
            this.body.vel.x = 0;
            //keeps moving the creep to the right to maintain its position
            this.pos.x = this.pos.x + 1;
            //checks that it has been at least 1sec since creep hit a base
            if((this.now-this.lastHit >= 1000)){
                //updates the lasthit timer
                this.lastHit = this.now;
                //makes the player base call its loseHealth function and passes
                //damage of 1
                response.b.loseHealth(game.data.enemyCreepAttack);
            }
        }else if (response.b.type==='PlayerEntity'){
            var xdif = this.pos.x - response.b.pos.x;
            
            this.attacking=true;
            //this.lastAttcking=this.now;
            
            
            if(xdif>0){
                 //keeps moving the creep to the right to maintain its position
                 this.pos.x = this.pos.x + 1;
                 this.body.vel.x = 0;
            }
            //checks that it has been at least 1sec since creep hit a something
            if((this.now-this.lastHit >= 1000) && xdif>0){
                //updates the lasthit timer
                this.lastHit = this.now;
                //makes the player base call its loseHealth function and passes
                //damage of 1
                response.b.loseHealth(game.data.enemyCreepAttack);
            }
        }
    }  
    
});

game.GameManager = Object.extend({
    init: function(x, y, settings){
        this.now = new Date().getTime();
        this.lastCreep = new Date().getTime();
        
        this.alwaysUpdate = true;
    },
    
    update: function(){
        this.now = new Date().getTime();
        
        if(Math.round(this.now/1000)%10 ===0 && (this.now - this.lastCreep >= 1000)){
            this.lastCreep = this.now;
            var creepe = me.pool.pull("EnemyCreep", 1000, 0, {});
            me.game.world.addChild(creepe, 5);
        }
        
        return true;
    }
});

