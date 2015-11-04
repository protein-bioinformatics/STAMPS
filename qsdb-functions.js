function protein(data){
    this.id = data['id'];
    this.name = data['name'];
    this.definition = data['definition'];
    this.kegg_link = data['kegg_link'];
    this.accession = data['accession'];
    this.marked = true;
    this.check_len = 15;
    this.line_height = 20;
    
    this.draw = function(ctx, x, y, line_number, num, factor) {
        var check_side = this.check_len * factor;
        y -= Math.floor((line_number - 1) * this.line_height * factor * 0.5) - num * this.line_height * factor;
        
        // write text
        ctx.fillText(this.name, x + check_side * 2, y);
        
        // draw checkbox
        ctx.lineWidth = 1;
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
        this.marked = !this.marked;
    }
    
    this.mark = function(m){
        this.marked = m;
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
    
    this.draw = function(font_size, factor, radius) {
        switch (this.type){
            case "protein":
                this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                this.ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                this.ctx.lineWidth = 1;
               
                
       
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = 'middle';
                this.ctx.font = font_size.toString() + "px Arial";
                this.ctx.fillStyle = "black";
                for (var i = 0; i < this.proteins.length; ++i){
                    this.proteins[i].draw(this.ctx, this.x - this.width / 2, this.y, this.proteins.length, i, factor);
                }
                break;
            case "pathway":
                this.ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = 'middle';
                this.ctx.font = font_size.toString() + "px Arial";
                this.ctx.fillStyle = "black";
                this.ctx.wrapText(this.name, this.x, this.y, this.width, 20 * factor);
                break;
            case "metabolite":
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
        for (var i = 0; i < this.proteins.length; ++i){
            cnt += this.proteins[i].marked;
        }
        var marking = (cnt != this.proteins.length);
        for (var i = 0; i < this.proteins.length; ++i){
            this.proteins[i].mark(marking);
        }
    }
};