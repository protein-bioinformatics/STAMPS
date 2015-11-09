function queue_node(_cell){
    this.cost = 100000;
    this.cll = _cell;
    this.pos = 0;
    this.in_queue = false;
}



function priority_queue(){
    this.field = new Array();
    
    this.is_empty = function(){
        return this.field.length == 0;
    }
    
    this.insert = function(node){
        var i = this.field.length;
        this.field.push(node);
        node.pos = i;
        this.decrease(i);
    };
    
    this.swap = function(i, j){
        this.field[i].pos = j;
        this.field[j].pos = i;
        var tmp = this.field[i];
        this.field[i] = this.field[j];
        this.field[j] = tmp;
    };
    
    this.remove = function(i){
        var lastIdx = this.field.length - 1;
        this.swap(i, lastIdx);
        var removedItem = this.field.pop();
        if ( i != lastIdx ) {
            if ( i == 0 || this.field[i].cost > this.field[this.parent(i)].cost) {
                this.heapify(i);
            }
            else {
                this.decrease(i); // decrease macht nichts, wenn h.key(i) == h.key(parent(i))
            }
        }
        return removedItem;
    };
    
    this.left = function(i){return 2 * i + 1;};
    this.right = function(i){return 2 * i + 2;};
    this.parent = function(i){return Math.floor((i - 1) / 2);};
    
    this.heapify = function(i){
        var min = i;
        if (this.left(i) < this.field.length && this.field[this.left(i)].cost < this.field[min].cost){
            min = this.left(i);
        }
        if (this.right(i) < this.field.length && this.field[this.right(i)].cost < this.field[min].cost){
            min = this.right(i);
        }
        if (min != i) {
            this.swap(i, min);
            this.heapify(min);
        }
    };
    
    this.decrease = function(i){
        while (i > 0 && this.field[i].cost < this.field[this.parent(i)].cost){
            this.swap(i, this.parent(i));
            i = this.parent(i);
        }
    };
    
    this.extract_min = function(){
        return this.remove(0);
    };
};






function cell(x, y){
    this.pos = [x, y];
    this.pre = [-1, -1];
    this.post = [-1, -1];
    this.direction = "-";
    this.cost = 100000;
    this.q_node = new queue_node(this);
    this.active = true;
    this.visited = false;
    this.in_open_list = false;
    this.is_target = false;
    this.in_path = false;
}

function check_direction(c_dir, dir){
    switch (c_dir){
        case "l":
            if (dir[0] == -1 && dir[1] == 0) return 0;
            break;
        case "r":
            if (dir[0] == 1 && dir[1] == 0) return 0;
            break;
        case "t":
            if (dir[0] == 0 && dir[1] == -1) return 0;
            break;
        case "b":
            if (dir[0] == 0 && dir[1] == 1) return 0;
            break;
    }
    return 1;
}


function sq(x){
    return x * x;
}


function penelty(dir, d_x, d_y){
    switch (dir){
        case "l":
            if (d_x < 0) return 1;
            break;
        case "r":
            if (d_x > 0) return 1;
            break;
        case "t":
            if (d_y < 0) return 1;
            break;
        case "b":
            if (d_y > 0) return 1;
            break;
    }
    return 0;
}


function expand_node(matrix, current_node, open_list, W, H, t_x, t_y, t_a){
    var dirs = [[0, -1], [0, 1], [1, 0], [-1, 0]];
    var dir_name = ["t", "b", "r", "l"];
    var dir_op = ["b", "t", "l", "r"];
    for (var i = 0; i < 4; ++i){
        var dir = dirs[i];
        var c_x = current_node.cll.pos[0] + dir[0];
        var c_y = current_node.cll.pos[1] + dir[1];
        if (!(0 <= c_x && c_x < W && 0 <= c_y && c_y < H && matrix[c_y][c_x].active && !matrix[c_y][c_x].visited)){
            continue;
        }
        
        var new_cost = current_node.cll.cost + check_direction(current_node.cll.direction, dir);
        if (c_x == t_x && c_y == t_y && t_a != dir_op[i]) new_cost += 1;
            
        if (new_cost >= matrix[c_y][c_x].cost && matrix[c_y][c_x].q_node.in_queue) continue;
        matrix[c_y][c_x].pre = [current_node.cll.pos[0], current_node.cll.pos[1]];
        matrix[c_y][c_x].cost = new_cost;
        matrix[c_y][c_x].direction = dir_name[i];
        var f = new_cost + 2 * penelty(current_node.cll.direction, c_x - t_x, c_y - t_y);
        
        matrix[c_y][c_x].q_node.cost = f;
        if (!matrix[c_y][c_x].q_node.in_queue){
            open_list.insert(matrix[c_y][c_x].q_node);
            matrix[c_y][c_x].q_node.in_queue = true;
        }
        else {
            open_list.decrease(matrix[c_y][c_x].q_node.pos);
        }
    }
}


function routing(x_s, y_s, a_s, x_e, y_e, a_e){
    var grid_length = 25;
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    var offset_x = {"l": -grid_length, "r": grid_length, "t": 0, "b": 0};
    var offset_y = {"l": 0, "r": 0, "t": -grid_length, "b": grid_length};
    
    var xa_s = x_s + (a_s == "r" ? 30 : (a_s == "l" ? -30 : 0));
    var ya_s = y_s + (a_s == "b" ? 35 : (a_s == "t" ? -35 : 0));
    var xa_e = x_e + (a_e == "r" ? 35 : (a_e == "l" ? -35 : 0));
    var ya_e = y_e + (a_e == "b" ? 45 : (a_e == "t" ? -45 : 0));
    
    var xd_s = xa_s + offset_x[a_s];
    var yd_s = ya_s + offset_y[a_s];
    var xd_e = xa_e + offset_x[a_e];
    var yd_e = ya_e + offset_y[a_e];
    
    // initialize grid
    var W = 8 + Math.ceil(Math.abs(xd_s +  - xd_e) / grid_length);
    var H = 8 + Math.ceil(Math.abs(yd_s - yd_e) / grid_length);
    var open_list = new priority_queue();
    var matrix = new Array();
    for (var h = 0; h < H; ++h){
        matrix.push(new Array());
        for (var w = 0; w < W; ++w){
            matrix[h].push(new cell(w, h));
        }
    }
    
    // set start and end point to grids including outcomes
    var diff_x = xd_e - xd_s;
    var diff_y = yd_e- yd_s;
    var cell_x_s = diff_x > 0 ? 4 : W - 5;
    var cell_y_s = diff_y > 0 ? 4 : H - 5;
    var cell_x_e = 0;
    var cell_y_e = 0;
    for (var h = 0; h < H; ++h){    
        var y = (h - cell_y_s) * grid_length + yd_s;
        for (var w = 0; w < W; ++w){
            var x = (w - cell_x_s) * grid_length + xd_s;
            var active = true;
            if (x_s - 30 <= x && x <= x_s + 30 && y_s - 35 <= y && y <= y_s + 35){
                active = false;
            }
            if (active && x_e - 35 <= x && x <= x_e + 35 && y_e - 45 <= y && y <= y_e + 45){
                active = false;
            }
            matrix[h][w].active = active;
        }
        if (Math.abs(y - yd_e) < Math.abs((cell_y_e - cell_y_s) * grid_length + yd_s - yd_e)){
            cell_y_e = h;
        }
    }
    for (var w = 1; w < W; ++w){
        var x = (w - cell_x_s) * grid_length + xd_s;
        if (Math.abs(x - xd_e) < Math.abs((cell_x_e - cell_x_s) * grid_length + xd_s - xd_e)){
            cell_x_e = w;
        }
    }
    
    
    
    
    // start routing
    matrix[cell_y_s][cell_x_s].q_node.cost = 0;
    matrix[cell_y_s][cell_x_s].q_node.in_queue = true;
    matrix[cell_y_s][cell_x_s].cost = 0;
    matrix[cell_y_e][cell_x_e].is_target = true;
    open_list.insert(matrix[cell_y_s][cell_x_s].q_node);
    matrix[cell_y_s][cell_x_s].direction = a_s;
    while (!open_list.is_empty()){
        current_node = open_list.extract_min();
        if (current_node.cll.is_target) break;
        current_node.in_queue = false;
        current_node.cll.visited = true;
        expand_node(matrix, current_node, open_list, W, H, cell_x_e, cell_y_e);
    }
    
    
    
    
    // add actual source
    var opposite = {"t": "b", "b": "t", "l": "r", "r": "l"};
    var start_x = cell_x_s + (a_s == "r" ? -1 : (a_s == "l" ? 1 : 0));
    var start_y = cell_y_s + (a_s == "b" ? -1 : (a_s == "t" ? 1 : 0));
    matrix[start_y][start_x].post = [cell_x_s, cell_y_s];
    matrix[start_y][start_x].in_path = true;
    matrix[start_y][start_x].direction = a_s;
    
    // add actual target
    var end_x = cell_x_e + (a_e == "r" ? -1 : (a_e == "l" ? 1 : 0));
    var end_y = cell_y_e + (a_e == "b" ? -1 : (a_e == "t" ? 1 : 0));
    matrix[cell_y_e][cell_x_e].post = [end_x, end_y];
    matrix[end_y][end_x].pre = [cell_x_e, cell_y_e];
    matrix[end_y][end_x].direction = opposite[a_e];
    //console.log("target: " + end_x + " " + end_y);
    
    var curr_x = end_x;
    var curr_y = end_y;
    var post_x = -1;
    var post_y = -1;
    while (((curr_x != -1) || (curr_y != -1))){
        console.log("t: " + curr_x + " " + curr_y);
        matrix[curr_y][curr_x].in_path = true;
        if (post_x != -1) matrix[curr_y][curr_x].post = [post_x, post_y];
        if ((post_x - curr_x) == 1) matrix[curr_y][curr_x].direction = "r";
        else if ((post_x - curr_x) == -1) matrix[curr_y][curr_x].direction = "l";
        else if ((post_y - curr_y) == 1) matrix[curr_y][curr_x].direction = "b";
        else if ((post_y - curr_y) == -1) matrix[curr_y][curr_x].direction = "t";
        
        post_x = curr_x;
        post_y = curr_y;
        curr_x = matrix[post_y][post_x].pre[0];
        curr_y = matrix[post_y][post_x].pre[1];
    }
    
    
    
    var curr_x = start_x;
    var curr_y = start_y;
    var mm = 0;
    var point_list = [[start_x, start_y, opposite[a_s] + a_s]];
    var in_curve = false;
    var d = a_s;
    while (((curr_x != -1) || (curr_y != -1)) && mm < 600){
        post_x = matrix[curr_y][curr_x].post[0];
        post_y = matrix[curr_y][curr_x].post[1];
        
        if ((curr_x == end_x) && (curr_y == end_y) && !in_curve){
            point_list.push([curr_x, curr_y, opposite[d] + d]);
            break;
        }
        if (in_curve){
            point_list.push([curr_x, curr_y, opposite[matrix[curr_y][curr_x].direction] + matrix[curr_y][curr_x].direction]);
            in_curve = false;
        }
        if (d != matrix[curr_y][curr_x].direction){
            point_list.push([matrix[curr_y][curr_x].pre[0], matrix[curr_y][curr_x].pre[1], opposite[d] + matrix[post_y][post_x].direction]);
            d = matrix[curr_y][curr_x].direction;
            in_curve = true;
        }
        
        curr_x = post_x;
        curr_y = post_y;
        ++mm;
    }
    
    for (var i = 0; i < point_list.length; ++i){
        console.log(point_list[i]);
    }
    
    
    

    for (var h = 0; h < H; ++h){    
        for (var w = 0; w < W; ++w){
            ctx.beginPath();
            ctx.fillStyle = matrix[h][w].active ? "white" : "black";
            if (matrix[h][w].in_path){
                ctx.fillStyle = "yellow";
            }
            ctx.arc((w - cell_x_s) * grid_length + xd_s, (h - cell_y_s) * grid_length + yd_s, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }
    ctx.strokeRect(x_s - 30, y_s - 35, 60, 70);
    ctx.strokeRect(x_e - 35, y_e - 45, 70, 90);
    
    
    
    
    
    
    /*
    ctx.beginPath();
    ctx.fillStyle = "#ff0000";
    ctx.arc(xd_s, yd_s, 3, 0, 2*Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.fillStyle = "#ff0000";
    ctx.arc(xd_e, yd_e, 3, 0, 2*Math.PI);
    ctx.fill();
    
    */
    
    
    ctx.beginPath();
    ctx.fillStyle = "#0000ff";
    ctx.arc(xa_s, ya_s, 3, 0, 2*Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.fillStyle = "#0000ff";
    ctx.arc(xa_e, ya_e, 3, 0, 2*Math.PI);
    ctx.fill();
    
    /*
    ctx.beginPath();
    ctx.fillStyle = "#00ff00";
    ctx.arc((cell_x_e - cell_x_s) * grid_length + xd_s, (cell_y_e - cell_y_s) * grid_length + yd_s, 3, 0, 2*Math.PI);
    ctx.fill();
    */
    
}

document.addEventListener('DOMContentLoaded', function() {
   routing(200, 120, "l", 750, 250, "l");
   //routing(750, 100, "l", 200, 350, "t");
   //routing(200, 350, "r", 750, 100, "t");
   //routing(750, 350, "r", 200, 100, "t");
}, false);



// delete cells from grid going through nodes

// find shortest path

// translate path to actual environment