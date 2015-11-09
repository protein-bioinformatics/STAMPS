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


function point(x, y, b){
    this.x = x;
    this.y = y;
    this.b = b;
};

function edge(x_s, y_s, a_s, x_e, y_e, a_e, head){
    
    this.head = head;
    this.point_list = new Array(new point(x_s, y_s, ""), new point(x_e, y_e, ""));
    var current = new point(x_s, y_s, "");
    var direction = a_s.substring(0, 1);
    var insert = 1;
    
    
    
    var diff_x = x_e - current.x;
    var diff_y = y_e - current.y;
    console.log(direction, diff_x, diff_y);
    
    if (direction == "l"){
        if (diff_x < -25){
            this.point_list.splice(insert, 0, new point(x_e - 25, current.y, ""));
            new_x = x_e;
        }
    }
    else {
        
    }
    
    
    this.draw = function(ctx, factor){
        ctx.strokeStyle = "black";//edge_color;
        //this.ctx.fillStyle = edge_color;
        ctx.lineWidth = line_width * factor;
        ctx.beginPath();
        ctx.moveTo(this.point_list[0].x, this.point_list[0].y);
        var odd = false;
        for (var i = 0; i < this.point_list.length - 1; ++i){
            if (odd){
                var control = new point(0, 0, 0);
                switch (this.point_list[i].b){
                    case "rt":
                    case "lt":
                    case "rb":
                    case "lb":
                        control.x = this.point_list[i + 1].x;
                        control.y = this.point_list[i].y;
                        break;
                        
                    case "tr":
                    case "tl":
                    case "br":
                    case "bl":
                        control.x = this.point_list[i].x;
                        control.y = this.point_list[i + 1].y;
                        break;
                }
                ctx.quadraticCurveTo(control.x, control.y, this.point_list[i + 1].x, this.point_list[i + 1].y);
            }
            else {
                ctx.lineTo(this.point_list[i + 1].x, this.point_list[i + 1].y);
            }
            odd = !odd;
        }
        ctx.stroke();
    }
};
