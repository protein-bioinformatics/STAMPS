function protein(data){
    this.id = data['id'];
    this.name = data['name'];
    this.definition = data['definition'];
    this.kegg_link = data['kegg_link'];
    this.accession = data['accession'];
    this.marked = false;
    this.num_peptides = data['n_peptides'];
    this.check_len = 15;
    this.line_height = 20;
    
    this.draw = function(ctx, x, y, line_number, num, factor) {
        var check_side = this.check_len * factor;
        y -= Math.floor((line_number - 1) * this.line_height * factor * 0.5) - num * this.line_height * factor;
        ctx.lineWidth = 1;
        
        
        if (!this.num_peptides){
            ctx.fillStyle = disabled_fill_color;
            ctx.fillRect(x + check_side / 2, y - check_side / 2, check_side, check_side);
            ctx.fillStyle = disabled_text_color;
            ctx.fillText(this.name, x + check_side * 2, y);
        }
        else {
            ctx.fillStyle = "white";
            ctx.fillRect(x + check_side / 2, y - check_side / 2, check_side, check_side);
            ctx.fillStyle = text_color;
            ctx.fillText(this.name, x + check_side * 2, y);
        }
        // write text
        // draw checkbox
        ctx.strokeStyle = "black";
        ctx.strokeRect(x + check_side / 2, y - check_side / 2, check_side, check_side);
        
        // draw hooklet
        var x_check = x + check_side / 2;
        var y_check = y - check_side / 2;
        if (this.marked){
            x_check += check_side / 2;
            y_check += check_side / 2;
            var x1 = x_check - check_side * 3 / 8;
            var y1 = y_check;
            var x2 = x_check - check_side / 8;
            var y2 = y_check + check_side * 3 / 8;
            var x3 = x_check + check_side * 3 / 8;
            var y3 = y_check - check_side * 3 / 8;
            ctx.lineWidth = factor * 3;
            ctx.draw_line(x1, y1, x2, y2);
            ctx.draw_line(x2, y2, x3, y3);
        }
    };
    
    this.toggle_marked = function(){
        if (this.num_peptides){
            this.marked = !this.marked;
        }
    }
    
    this.mark = function(m){
        if (this.num_peptides){
            this.marked = m;
        }
    }
    
    this.is_over = function(x, y, x_m, y_m, line_number, num, factor){
        y -= Math.floor((line_number - 1) * this.line_height * factor * 0.5) - num * this.line_height * factor;
        var check_side = this.check_len * factor;
        var l = x + check_side / 2;
        var r = x + check_side * 1.5;
        var t = y - check_side / 2;
        var b = y + check_side / 2;
        if (l <= x_m && x_m <= r && t <= y_m && y_m <= b) return true;
        return false;
    }
}


CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {
    var lines = text.split("\n");
    y -= Math.floor((lines.length - 1) * lineHeight * 0.5);
    for (var i = 0; i < lines.length; i++) {
        var words = lines[i].split(' ');
        var line = '';
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = this.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }

        this.fillText(line, x, y);
        y += lineHeight;
    }
}


CanvasRenderingContext2D.prototype.draw_line = function (x1, y1, x2, y2) {
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.closePath();
    this.stroke();
}


function node(data, c){
    this.x = parseInt(data['x']);
    this.y = parseInt(data['y']);
    this.type = data['type'];
    this.id = data['id'];
    this.name = data['name'];
    this.highlight = false;
    this.pathway_ref = data['pathway_ref'];
    this.proteins = new Array();
    this.width = -1;
    this.height = -1;
    this.c = c;
    this.ctx = c.getContext("2d");
    
    if (this.type == "protein"){
        var name = "";
        this.height = 20 + 20 * data['proteins'].length;
        for (var j = 0; j < data['proteins'].length; ++j){
            this.proteins.push(new protein(data['proteins'][j]));
            if (name.length) name += ", ";
            if (this.width < document.getElementById("refarea").getContext("2d").measureText(this.proteins[j].name).width){
                this.width = document.getElementById("refarea").getContext("2d").measureText(this.proteins[j].name).width;
            }
            name += data['proteins'][j]['name'];
        }
        this.width += 50;
        this.name = name;
    }
    else if (this.type == "pathway"){
        var tokens = data['name'].split("\n");
        this.height = 40 + 20 * tokens.length;
        
        for (var j = 0; j < tokens.length; ++j){
            if (this.width < tokens[j].length) this.width = tokens[j].length;
        }
        this.width *= 12;
    }
    else {
        this.width = metabolite_radius * 2;
        this.height = metabolite_radius * 2;
    }
    
    //this.width = Math.ceil(this.width / 25) * 25;
    //this.height = Math.ceil(this.height / 25) * 25;
    
    this.draw = function(font_size, factor, radius) {
        switch (this.type){
            case "protein":
                this.ctx.fillStyle = protein_fill_color;
                this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                this.ctx.lineWidth = (line_width + 2 * this.highlight) * factor;
                this.ctx.strokeStyle = protein_stroke_color;
                this.ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
       
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = 'middle';
                this.ctx.font = font_size.toString() + "px Arial";
                this.ctx.fillStyle = "black";
                for (var i = 0; i < this.proteins.length; ++i){
                    this.proteins[i].draw(this.ctx, this.x - this.width / 2, this.y, this.proteins.length, i, factor);
                }
                break;
                
            case "pathway":
                this.ctx.fillStyle = pathway_fill_color;
                this.ctx.strokeStyle = pathway_stroke_color;
                this.ctx.lineWidth = (line_width + 2 * this.highlight) * factor;
                this.ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = 'middle';
                this.ctx.font = font_size.toString() + "px Arial";
                this.ctx.fillStyle = "black";
                this.ctx.wrapText(this.name, this.x, this.y, this.width, 20 * factor);
                break;
                
            case "metabolite":
                this.ctx.fillStyle = metabolite_fill_color;
                this.ctx.strokeStyle = metabolite_stroke_color;
                this.ctx.lineWidth = (line_width + 2 * this.highlight) * factor;
                this.ctx.beginPath();
                this.ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
        }
        
    };
    
    this.is_mouse_over = function (mouse_x, mouse_y, radius){
        switch (this.type){
            case "metabolite":
                if (Math.sqrt(Math.pow(this.x - mouse_x, 2) + Math.pow(this.y - mouse_y, 2)) < radius){
                        return true;                    
                }
                break;
                
            default:
                if (this.x - this.width / 2 <= mouse_x && mouse_x <= this.x + this.width / 2){
                    if (this.y - this.height / 2 <= mouse_y && mouse_y <= this.y + this.height / 2){
                        return true;
                    }
                }
        }
        return false;
    };
    
    this.check_protein_marked = function(res, factor){
        for (var i = 0; i < this.proteins.length; ++i){
            if (this.proteins[i].is_over(this.x - this.width / 2, this.y, res.x, res.y, this.proteins.length, i, factor)){
                this.proteins[i].toggle_marked();
                break;
            }
        }
    }
    
    this.dblcheck_protein_marked = function(res, factor){
        var cnt = 0;
        var cnt_avbl = 0;
        for (var i = 0; i < this.proteins.length; ++i){
            cnt += this.proteins[i].marked;
            cnt_avbl += this.proteins[i].num_peptides > 0;
        }
        var marking = (cnt != cnt_avbl);
        for (var i = 0; i < this.proteins.length; ++i){
            this.proteins[i].mark(marking);
        }
    }
};



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
    this.parent = function(i){return Math.floor((i - 1) >> 1);};
    
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
            return (d_x < 0) * 2;
            break;
        case "r":
            return (d_x > 0) * 2;
            break;
        case "t":
            return (d_y < 0) * 2;
            break;
        case "b":
            return (d_y > 0) * 2;
            break;
    }
    return 0;
}


function point(x, y, b){
    this.x = x;
    this.y = y;
    this.b = b;
};

function edge(c, x_s, y_s, a_s, protein_node, x_e, y_e, a_e, metabolite_node, head){
    
    this.c = c;
    this.ctx = this.c.getContext("2d");
    this.head = head;
    this.point_list = [];
    this.start_id = protein_node.id;
    this.end_id = metabolite_node.id;
    
    
    this.expand_node = function(matrix, current_node, open_list, W, H, t_x, t_y, t_a){
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
            var f = new_cost + penelty(current_node.cll.direction, c_x - t_x, c_y - t_y);
            
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
    
    this.routing = function(xa_s, ya_s, a_s, protein_node, xa_e, ya_e, a_e, metabolite_node){
        a_s = a_s.charAt(0);
        a_e = a_e.charAt(0);
        var grid = base_grid;
        var offset_x = {"l": -grid, "r": grid, "t": 0, "b": 0};
        var offset_y = {"l": 0, "r": 0, "t": -grid, "b": grid};
        var w_s = protein_node.width * 0.5;
        var h_s = protein_node.height * 0.5;
        var w_e = metabolite_node * 0.5;
        var h_e = metabolite_node * 0.5;
        
        var x_s = protein_node.x;
        var y_s = protein_node.y;
        var x_e = metabolite_node.x;
        var y_e = metabolite_node.y;
        
        var xd_s = xa_s + offset_x[a_s];
        var yd_s = ya_s + offset_y[a_s];
        var xd_e = xa_e + offset_x[a_e];
        var yd_e = ya_e + offset_y[a_e];
        
        // initialize grid
        var W = 8 + Math.ceil(Math.abs(xd_s +  - xd_e) / grid);
        var H = 8 + Math.ceil(Math.abs(yd_s - yd_e) / grid);
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
            var y = (h - cell_y_s) * grid + yd_s;
            for (var w = 0; w < W; ++w){
                var x = (w - cell_x_s) * grid + xd_s;
                var active = true;
                if (x_s - w_s <= x && x <= x_s + w_s && y_s - h_s <= y && y <= y_s + h_s){
                    active = false;
                }
                if (active && x_e - w_e <= x && x <= x_e + w_e && y_e - h_e <= y && y <= y_e + h_e){
                    active = false;
                }
                matrix[h][w].active = active;
            }
            if (Math.abs(y - yd_e) < Math.abs((cell_y_e - cell_y_s) * grid + yd_s - yd_e)){
                cell_y_e = h;
            }
        }
        for (var w = 1; w < W; ++w){
            var x = (w - cell_x_s) * grid + xd_s;
            if (Math.abs(x - xd_e) < Math.abs((cell_x_e - cell_x_s) * grid + xd_s - xd_e)){
                cell_x_e = w;
            }
        }
        
        
        // add actual source
        var opposite = {"t": "b", "b": "t", "l": "r", "r": "l"};
        var start_x = cell_x_s + (a_s == "r" ? -1 : (a_s == "l" ? 1 : 0));
        var start_y = cell_y_s + (a_s == "b" ? -1 : (a_s == "t" ? 1 : 0));
        matrix[start_y][start_x].post = [cell_x_s, cell_y_s];
        matrix[cell_y_s][cell_x_s].pre = [start_x, start_y];
        matrix[start_y][start_x].in_path = true;
        matrix[start_y][start_x].active = false;
        matrix[start_y][start_x].direction = a_s;
        
        // add actual target
        var end_x = cell_x_e + (a_e == "r" ? -1 : (a_e == "l" ? 1 : 0));
        var end_y = cell_y_e + (a_e == "b" ? -1 : (a_e == "t" ? 1 : 0));
        matrix[cell_y_e][cell_x_e].post = [end_x, end_y];
        matrix[end_y][end_x].pre = [cell_x_e, cell_y_e];
        matrix[end_y][end_x].active = false;
        matrix[end_y][end_x].direction = opposite[a_e];
        
        
        
        if (!matrix[cell_y_s][cell_x_s].active || !matrix[cell_y_e][cell_x_e].active){
            this.point_list = [new point(x_s, y_s, opposite[a_s] + a_s)];
            this.point_list.push(new point(x_e, y_e, opposite[a_e] + a_e));
            return;
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
            this.expand_node(matrix, current_node, open_list, W, H, cell_x_e, cell_y_e);
        }
        
        
        
        // correct the path from end to front
        var curr_x = end_x;
        var curr_y = end_y;
        var post_x = -1;
        var post_y = -1;
        while (((curr_x != -1) || (curr_y != -1))){
            //console.log("t: " + curr_x + " " + curr_y);
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
        
        
        // determining the points / corners of the path
        var curr_x = start_x;
        var curr_y = start_y;
        var x = (curr_x - cell_x_s) * grid + xd_s;
        var y = (curr_y - cell_y_s) * grid + yd_s;
        this.point_list = [new point(x, y, opposite[a_s] + a_s)];
        var in_corner = false;
        var d = a_s;
        var corners = 0;
        var corner_path = [];
        while (((curr_x != -1) || (curr_y != -1))){
            post_x = matrix[curr_y][curr_x].post[0];
            post_y = matrix[curr_y][curr_x].post[1];
            
            if ((curr_x == end_x) && (curr_y == end_y) && !in_corner){
                var x = (curr_x - cell_x_s) * grid + xd_s;
                var y = (curr_y - cell_y_s) * grid + yd_s;
                this.point_list.push(new point(x, y, opposite[d] + d));
                break;
            }
            if (in_corner){
                var x = (curr_x - cell_x_s) * grid + xd_s;
                var y = (curr_y - cell_y_s) * grid + yd_s;
                this.point_list.push(new point(x, y, opposite[d] + d));
                if (corner_path.length > 2 && corner_path[corner_path.length - 2]){
                    switch (matrix[curr_y][curr_x].direction){
                        case "l": case "r":
                            y = (this.point_list[this.point_list.length - 1].y + this.point_list[this.point_list.length - 4].y) / 2;
                            this.point_list[this.point_list.length - 2].y = y;
                            this.point_list[this.point_list.length - 3].y = y;
                            break;
                        case "t": case "b":
                            x = (this.point_list[this.point_list.length - 1].x + this.point_list[this.point_list.length - 4].x) / 2;
                            this.point_list[this.point_list.length - 2].x = x;
                            this.point_list[this.point_list.length - 3].x = x;
                            break;
                    }
                }
                in_corner = false;
                ++corners;
            }
            if (d != matrix[curr_y][curr_x].direction){
                var x = (matrix[curr_y][curr_x].pre[0] - cell_x_s) * grid + xd_s;
                var y = (matrix[curr_y][curr_x].pre[1] - cell_y_s) * grid + yd_s;
                this.point_list.push(new point(x, y, opposite[d] + matrix[curr_y][curr_x].direction));
                d = matrix[curr_y][curr_x].direction;
                in_corner = true;
                corner_path.push(1);
            }
            else {
                corner_path.push(0);
            }
            
            curr_x = post_x;
            curr_y = post_y;
        }
        
        /*for (var i = 0; i < this.point_list.length; ++i){
            console.log(this.point_list[i]);
        }*/
        
        
        // merge equal points
        for (var i = 0; i < this.point_list.length - 1; ++i){
            var p2_x = this.point_list[i].x;
            var p2_y = this.point_list[i].y;
            var p1_x = this.point_list[i + 1].x;
            var p1_y = this.point_list[i + 1].y;
            if (Math.abs(p2_x - p1_x) < 1 && Math.abs(p2_y - p1_y) < 1){
                this.point_list.splice(i, 1);
            }
        }
        
        
        /*for (var i = 0; i < this.point_list.length; ++i){
            console.log(this.point_list[i]);
        }*/
        
                
        
        // correcting the targeting points
        var p_len = this.point_list.length;
        if (corners > 0){
            var shift_x = xa_e - this.point_list[p_len - 1].x;
            var shift_y = ya_e - this.point_list[p_len - 1].y;
            
            var s = false;
            switch (this.point_list[p_len - 2].b){
                case "lr": case "rl": case "tb": case "bt": s = true; break;
                default: break;
            }
            if (s){
                var dd = this.point_list[p_len - 1].b.charAt(0);
                if (dd == "b" || dd == "t"){
                    this.point_list[p_len - 2].x += shift_x;
                    this.point_list[p_len - 3].x += shift_x;
                }
                else {
                    this.point_list[p_len - 2].y += shift_y;
                    this.point_list[p_len - 3].y += shift_y;
                }
            }
        }
        this.point_list[p_len - 1].x = xa_e;
        this.point_list[p_len - 1].y = ya_e;
        
        /*for (var i = 0; i < this.point_list.length; ++i){
            console.log(this.point_list[i]);
        }*/
    }
    
    
    this.routing(x_s, y_s, a_s, protein_node, x_e, y_e, a_e, metabolite_node); 
    
    this.draw = function(factor){
        this.ctx.strokeStyle = edge_color;
        this.ctx.fillStyle = edge_color;
        this.ctx.lineWidth = line_width * factor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.point_list[0].x, this.point_list[0].y);
        var p_len = this.point_list.length;
        for (var i = 0; i < p_len - 1 - head; ++i){
            var control = new point(0, 0, 0);
            switch (this.point_list[i].b){
                case "rt": case "lt": case "rb": case "lb":
                    control.x = this.point_list[i + 1].x;
                    control.y = this.point_list[i].y;
                    this.ctx.quadraticCurveTo(control.x, control.y, this.point_list[i + 1].x, this.point_list[i + 1].y);
                    break;
                    
                case "tr": case "tl": case "br": case "bl":
                    control.x = this.point_list[i].x;
                    control.y = this.point_list[i + 1].y;
                    this.ctx.quadraticCurveTo(control.x, control.y, this.point_list[i + 1].x, this.point_list[i + 1].y);
                    break;
                default:
                    this.ctx.lineTo(this.point_list[i + 1].x, this.point_list[i + 1].y);
                    break;
                    
            }
        }
        this.ctx.stroke();
        if (head){
            var x_head = -1;
            var y_head = -1;
            var p2_x = this.point_list[p_len - 1].x;
            var p2_y = this.point_list[p_len - 1].y;
            var p1_x = this.point_list[p_len - 2].x;
            var p1_y = this.point_list[p_len - 2].y;
            var ct_x = -1;
            var ct_y = -1;
            switch (this.point_list[p_len - 2].b){
                case "rt": case "lt": case "rb": case "lb":
                    ct_x = this.point_list[p_len - 1].x;
                    ct_y = this.point_list[p_len - 2].y;
                    break;
                case "tr": case "tl": case "br": case "bl":
                    ct_x = this.point_list[p_len - 2].x;
                    ct_y = this.point_list[p_len - 1].y;
                    break;
            }
            
            switch (this.point_list[p_len - 2].b){
                case "rl": case "lr": case "bt": case "tb":
                    var b = this.point_list[p_len - 1].b;
                    
                    
                    var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (sq(p2_x - p1_x) + sq(p2_y - p1_y)));
                    x_head = p2_x + l * (p1_x - p2_x);
                    y_head = p2_y + l * (p1_y - p2_y);
                    
                    
                    this.ctx.lineWidth = line_width * factor;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1_x, p1_y);
                    this.ctx.lineTo(x_head, y_head);
                    this.ctx.stroke();
                    
                    break;
                
                default:                    
                    var mm = 0;
                    var upper = 1;
                    var lower = 0;
                    var l1 = -1;
                    var l = -1;
                    {
                        var a_x = p1_x - 2 * ct_x + p2_x;
                        var a_y = p1_y - 2 * ct_y + p2_y;
                        var b_x = 2 * ct_x - 2 * p1_x;
                        var b_y = 2 * ct_y - 2 * p1_y;
                        var A = 4 * (a_x * a_x + a_y * a_y);
                        var B = 4 * (a_x * b_x + a_y * b_y);
                        var C = b_x * b_x + b_y * b_y;

                        var Sabc = 2 * Math.sqrt(A + B + C);
                        var A_2 = Math.sqrt(A);
                        var A_32 = 2 * A * A_2;
                        var C_2 = 2 * Math.sqrt(C);
                        var BA = B / A_2;

                        l1 = (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
                    }
                    while (true && mm < 10){
                        t = (upper + lower) * 0.5;
                        x_head = (1 - t) * (1 - t) * p1_x + 2 * (1 - t) * t * ct_x + t * t * p2_x;
                        y_head = (1 - t) * (1 - t) * p1_y + 2 * (1 - t) * t * ct_y + t * t * p2_y;
                        var a_x = p1_x - 2 * ct_x + x_head;
                        var a_y = p1_y - 2 * ct_y + y_head;
                        var b_x = 2 * ct_x - 2 * p1_x;
                        var b_y = 2 * ct_y - 2 * p1_y;
                        var A = 4 * (a_x * a_x + a_y * a_y);
                        var B = 4 * (a_x * b_x + a_y * b_y);
                        var C = b_x * b_x + b_y * b_y;

                        var Sabc = 2 * Math.sqrt(A + B + C);
                        var A_2 = Math.sqrt(A);
                        var A_32 = 2 * A * A_2;
                        var C_2 = 2 * Math.sqrt(C);
                        var BA = B / A_2;

                        l = (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);
                        if (Math.abs(l1 - l - arrow_length * factor) < 5e-2) break;
                        if (l1 - l < arrow_length * factor) upper = t;
                        else lower = t;
                        ++mm;
                    }
                    
                    
                    t *= 1.05;
                    xc_head = (1 - t) * (1 - t) * p1_x + 2 * (1 - t) * t * ct_x + t * t * p2_x;
                    yc_head = (1 - t) * (1 - t) * p1_y + 2 * (1 - t) * t * ct_y + t * t * p2_y;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1_x, p1_y);
                    this.ctx.bezierCurveTo(ct_x, ct_y, xc_head, yc_head, xc_head, yc_head);
                    this.ctx.stroke();
                    break;
            }
            
            var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (sq(p2_x - x_head) + sq(p2_y - y_head)));
            var x_l = x_head - l * 0.5 * (y_head - p2_y);
            var y_l = y_head + l * 0.5 * (x_head - p2_x);
                    
            var x_r = x_head + l * 0.5 * (y_head - p2_y);
            var y_r = y_head - l * 0.5 * (x_head - p2_x);
            
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(p2_x, p2_y);
            this.ctx.lineTo(x_r, y_r);
            this.ctx.lineTo(x_l, y_l);
            this.ctx.closePath();
            this.ctx.fill();
            
            
        }
    }
};
