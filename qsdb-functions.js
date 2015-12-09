function visual_element() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.name = "";
    this.mouse_click = function(mouse, key){return -1;};
    this.mouse_dbl_click = function(mouse, key){return -1;};
    this.mouse_down = function(mouse, key){return -1;};
    this.mouse_down_move = function(mouse, key){return false;};
    this.mouse_up = function(mouse){return false;};
    this.is_mouse_over = function(mouse){return false;};
    this.draw = function(){};
    this.highlight = false;
    this.tipp = false;
}


function search_pattern(text, len_p, accept, masks, id1, id2){
    var results = [];
    text = text.replace(String.fromCharCode(13) + String.fromCharCode(10), " ");
    text = text.replace(String.fromCharCode(10), " ");
    text = text.replace(String.fromCharCode(13), " ");
    for (var i = 0, states = 0; i < text.length; ++i){ // search name
        states = ((states << 1) | 1) & masks[text.charCodeAt(i)];
        if (accept & states) results.push([text, i - len_p + 1, id1, id2]);
    }
    return results;
}

function Spectrum(data){
    this.id = data['id'];
    this.mass = data['mass']
    this.charge = data['charge'];
}

function Peptide(data){
    this.peptide_seq = data['peptide_seq'];
    this.spectra = [];
    for (var i = 0; i < data['spectra'].length; ++i){
        this.spectra.push(new Spectrum(data['spectra'][i]));
    }
    
    this.search = function(len_p, accept, masks, node_id, prot_id){
        var results = search_pattern(this.peptide_seq, len_p, accept, masks, node_id, prot_id);
        
        return results;
    }
}

function Protein(data){
    this.id = data['id'];
    this.name = data['name'];
    this.definition = data['definition'];
    this.kegg_link = data['kegg_link'];
    this.accession = data['accession'];
    this.ec_number = data['ec_number'];
    this.mass = data['mass'];
    this.peptides = [];
    this.marked = false;
    this.containing_spectra = 0;
    
    for (var i = 0; i < data['peptides'].length; ++i){
        this.peptides.push(new Peptide(data['peptides'][i]));
        this.containing_spectra += this.peptides[i].spectra.length;
    }
    
    //this.marked = (this.peptides.length > 0) && (this.containing_spectra > 0);
    
    this.search = function(len_p, accept, masks, node_id){
        var results = [];
        var r = search_pattern(this.name, len_p, accept, masks, node_id, this.id);
        if (r.length) results = results.concat(r);
        r = search_pattern(this.accession, len_p, accept, masks, node_id, this.id);
        if (r.length) results = results.concat(r);
        r = search_pattern(this.definition, len_p, accept, masks, node_id, this.id);
        if (r.length) results = results.concat(r);
        r = search_pattern(this.ec_number, len_p, accept, masks, node_id, this.id);
        if (r.length) results = results.concat(r);
        
        for (var i = 0; i < this.peptides.length; ++i){
            var r = this.peptides[i].search(len_p, accept, masks, node_id, this.id);
            if (r.length) results = results.concat(r);
        }
        return results;
    }
    
    
    this.check_mouse_over_protein_name = function(ctx, x, y, line_number, num, mouse){
        var check_side = check_len * factor;
        y -= Math.floor((line_number - 1) * line_height * factor * 0.5) - num * line_height * factor;
        var x_l = x + check_side * 2;
        var x_r = x_l + ctx.measureText(this.name).width;
        var y_l = y - line_height * factor * 0.5;
        var y_r = y + line_height * factor * 0.5;
        if (x_l <= mouse.x && mouse.x <= x_r && y_l <= mouse.y && mouse.y <= y_r) return true;
        return false;
    }
    
    
    this.get_position = function(x, y, line_number, num){
        var check_side = check_len * factor;
        y -= Math.floor((line_number - 1) * line_height * factor * 0.5) - num * line_height * factor;
        x += check_side * 2;
        return [x, y];
    }
    
    
    this.draw = function(ctx, x, y, line_number, num) {
        var check_side = check_len * factor;
        var check_side_h = check_side * 0.5;
        y -= Math.floor((line_number - 1) * line_height * factor * 0.5) - num * line_height * factor;
        ctx.lineWidth = 1;
        
        var def = this.name;
        //if (def.length > 13) def = def.substring(0, 10) + "...";
        if (!this.peptides.length || !this.containing_spectra){
            ctx.fillStyle = disabled_fill_color;
            ctx.fillRect(x + check_side_h, y - check_side_h, check_side, check_side);
            ctx.fillStyle = disabled_text_color;
            ctx.fillText(def, x + check_side * 2, y);
        }
        else {
            ctx.fillStyle = "white";
            ctx.fillRect(x + check_side_h, y - check_side_h, check_side, check_side);
            ctx.fillStyle = text_color;
            ctx.fillText(def, x + check_side * 2, y);
        }
        // write text
        // draw checkbox
        ctx.strokeStyle = "black";
        ctx.strokeRect(x + check_side_h, y - check_side_h, check_side, check_side);
        
        // draw hooklet
        var x_check = x + check_side_h;
        var y_check = y - check_side_h;
        if (this.marked){
            x_check += check_side_h;
            y_check += check_side_h;
            var x1 = x_check - check_side * 0.375;
            var y1 = y_check;
            var x2 = x_check - check_side * 0.125;
            var y2 = y_check + check_side * 0.375;
            var x3 = x_check + check_side * 0.375;
            var y3 = y_check - check_side * 0.375;
            ctx.lineWidth = factor * 3;
            ctx.draw_line(x1, y1, x2, y2);
            ctx.draw_line(x2, y2, x3, y3);
        }
    };
    
    this.toggle_marked = function(){
        if (this.peptides.length && this.containing_spectra){
            this.marked = !this.marked;
        }
    }
    
    this.mark = function(m){
        if (this.peptides.length && this.containing_spectra){
            this.marked = m;
        }
    }
    
    this.mouse_over_name = function(x, y, x_m, y_m, line_number, num){
        
    }
    
    this.mouse_over_checkbox = function(x, y, x_m, y_m, line_number, num){
        y -= Math.floor((line_number - 1) * line_height * factor * 0.5) - num * line_height * factor;
        var check_side = check_len * factor;
        var check_side_h = check_side * 0.5;
        var l = x + check_side_h;
        var r = x + check_side * 1.5;
        var t = y - check_side_h;
        var b = y + check_side_h;
        if (l <= x_m && x_m <= r && t <= y_m && y_m <= b) return true;
        return false;
    }
}






CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {
    var lines = text.split("\n");
    y -= (lines.length - 1) * lineHeight * 0.5;
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



preview.prototype = new visual_element();
preview.prototype.constructor = preview;

function preview(ctx){
    this.preview_image = 0;
    this.preview_image_original = 0;
    this.ctx = ctx;
    this.on_active = false;
    this.on_move = false;
    this.active_boundaries = [0, 0, 0, 0];
    this.scale_x = 1;
    this.scale_y = 1;
    
    this.snapshot = function(){
        var x_min = 1e100, x_max = -1e100;
        var y_min = 1e100, y_max = -1e100;
        for (var i = 0; i < data.length; ++i){
            x_min = Math.min(x_min, data[i].x - data[i].width * 0.5);
            x_max = Math.max(x_max, data[i].x + data[i].width * 0.5);
            y_min = Math.min(y_min, data[i].y - data[i].height * 0.5);
            y_max = Math.max(y_max, data[i].y + data[i].height * 0.5);
        }
        x_min -= 25;
        x_max += 25;
        y_min -= 25;
        y_max += 25;
        boundaries[0] = x_min;
        boundaries[1] = y_min;
        boundaries[2] = x_max - x_min;
        boundaries[3] = y_max - y_min;
        
        var image_data = this.ctx.getImageData(x_min, y_min, (x_max - x_min), (y_max - y_min));
        if ((x_max - x_min) / window.innerWidth >= (y_max - y_min) / window.innerHeight) {
            var sf = window.innerWidth / (x_max - x_min) * 0.2;
        }
        else {
            var sf = window.innerHeight / (y_max - y_min) * 0.2;
        }
        this.width = Math.ceil((x_max - x_min) * sf);
        this.height = Math.ceil((y_max - y_min) * sf);
        this.x = 0;
        this.y = window.innerHeight - this.height;
        this.preview_image = this.ctx.createImageData(this.width, this.height);
        this.preview_image_original = this.ctx.createImageData(this.width, this.height);
        var wf = image_data.width / this.width;
        var hf = image_data.height / this.height;
       
        var h = 0;
        var w = 0;
        for (var i = 0; i < this.preview_image.data.length; i += 4){
            var ii = (Math.floor(h * hf) * image_data.width + Math.floor(w * wf)) * 4;
            this.preview_image.data[i] = image_data.data[ii];
            this.preview_image.data[i + 1] = image_data.data[ii + 1];
            this.preview_image.data[i + 2] = image_data.data[ii + 2];
            this.preview_image.data[i + 3] = image_data.data[ii + 3];
            ++w;
            if (w >= this.preview_image.width){
                w = 0;
                h += 1;
            }
        }
    }
    
    this.is_mouse_over = function(mouse){
        return (this.x <= mouse.x && mouse.x <= this.x + this.width && this.y <= mouse.y && mouse.y <= this.y + this.height);
    }
    
    this.mouse_down = function(mouse, key){
        this.on_active = true;
        offsetX = mouse.x;
        offsetY = mouse.y;
        if (this.active_boundaries[0] <= mouse.x && mouse.x <= this.active_boundaries[0] + this.active_boundaries[2] && this.active_boundaries[1] <= mouse.y && mouse.y <= this.active_boundaries[1] + this.active_boundaries[3]){
            this.on_move = true;
            this.ctx.canvas.style.cursor = "all-scroll";
        }
        return this.on_active;
    }
    
    this.mouse_down_move = function(mouse, key){
        if (this.on_move){
            
            var shift_x = (mouse.x - offsetX) * this.scale_x;
            var shift_y = (mouse.y - offsetY) * this.scale_y;
            
            for (var i = 0; i < data.length; ++i){
                data[i].x -= shift_x;
                data[i].y -= shift_y;
            }
            for (var i = 0; i < edges.length; ++i){
                for (var j = 0; j < edges[i].point_list.length; ++j){
                    edges[i].point_list[j].x -= shift_x;
                    edges[i].point_list[j].y -= shift_y;
                }
            }
            infobox.x -= shift_x;
            infobox.y -= shift_y;
            null_x -= shift_x;
            null_y -= shift_y;
            boundaries[0] -= shift_x;
            boundaries[1] -= shift_y;
            this.compute_boundaries();
            offsetX = mouse.x;
            offsetY = mouse.y;
        }
        return this.on_active;
    }
    
    this.mouse_up = function(mouse){
        this.on_active = false;
        this.on_move = false;
        this.ctx.canvas.style.cursor = "default";
        return true;
    }
    
    
    this.compute_boundaries = function(){
        var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
        var active_x_min = Math.max(boundaries[0], 0);
        var active_x_max = Math.min(boundaries[0] + boundaries[2], window.innerWidth);
        var active_y_min = Math.max(boundaries[1], nav_height);
        var active_y_max = Math.min(boundaries[1] + boundaries[3], window.innerHeight);
        
        this.scale_x = boundaries[2] / this.width;
        this.scale_y = boundaries[3] / this.height;
        
        this.active_boundaries[0] = this.x + (active_x_min - boundaries[0]) / boundaries[2] * this.width;
        this.active_boundaries[1] = this.y + (active_y_min - boundaries[1]) / boundaries[3] * this.height;
        this.active_boundaries[2] = Math.max(0, this.width * (active_x_max - active_x_min) / boundaries[2]);
        this.active_boundaries[3] = Math.max(0, this.height * (active_y_max - active_y_min) / boundaries[3]);
    }
    
    this.draw = function(){
        if (this.preview_image){
            
            this.ctx.putImageData(this.preview_image, this.x, this.y);
            this.ctx.strokeStyle = "#777777";
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.rect(this.x, this.y, this.width, this.height);
            this.ctx.stroke();
            
            this.compute_boundaries();
            
            this.ctx.save();
            this.ctx.globalAlpha = .4;
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(this.active_boundaries[0], this.active_boundaries[1], this.active_boundaries[2], this.active_boundaries[3]);
            this.ctx.restore();
            this.ctx.globalAlpha = 1.;
            
        }
    }
}



zoom_sign.prototype = new visual_element();
zoom_sign.prototype.constructor = zoom_sign;

function zoom_sign(ctx, dir){
    this.dir = dir;
    this.name = dir ? "zoom in" : "zoom out";
    this.img = document.getElementById("zoom_" + (dir ? "in" : "out"));
    var ratio = 0.02 * window.innerWidth / this.img.width;
    this.width = this.img.width * ratio;
    this.height = this.img.height * ratio;
    this.x = window.innerWidth - this.width * 1.3;
    this.y = window.innerHeight - this.height * (1.3 + dir);
    this.ctx = ctx;
    
    this.mouse_click = function(mouse, key){
        zoom_in_out(1 - this.dir, 0);
    }
    
    this.is_mouse_over = function(mouse){
        return (this.x <= mouse.x && mouse.x <= this.x + this.width && this.y <= mouse.y && mouse.y <= this.y + this.height);
    }
    
    this.draw = function(){
        this.ctx.save();
        this.ctx.globalAlpha = 0.3 + 0.7 * this.highlight;
        this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        this.ctx.restore();
        this.ctx.globalAlpha = 1.;
    }
}


Infobox.prototype = new visual_element();
Infobox.prototype.constructor = Infobox;

function Infobox(ctx){
    this.node_id = -1;
    this.protein_id = -1;
    this.name = "infobox";
    this.ctx = ctx;
    this.visible = false;    
    
    this.create = function(x, y, node_id, protein_id){
        this.x = x;
        this.y = y;
        this.node_id = node_id;
        this.protein_id = protein_id;
        if (data[node_id].type == "metabolite"){
            this.width = data[this.node_id].img.width + 40;
            this.height = data[this.node_id].img.height + 40;
            
            this.ctx.font = "bold " + line_height.toString() + "px Arial";
            this.width = Math.max(this.width, this.ctx.measureText(data[this.node_id].name).width + 40);
            this.height += 3 * line_height + 20;
            
            this.ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            this.width = Math.max(this.width, this.ctx.measureText("Formula:  " + data[this.node_id].formula).width + 40);
            this.width = Math.max(this.width, this.ctx.measureText("Exact Mass / Da: " + data[this.node_id].exact_mass).width + 40);
            
        }
        else {
            this.width = 40;
            this.height = 40;
            this.height += 5 * line_height + 20;
            this.ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            this.width = Math.max(this.width, this.ctx.measureText("Definition: " + data[this.node_id].proteins[this.protein_id].definition).width + 40);
            this.width = Math.max(this.width, this.ctx.measureText("Uniprot accession: " + data[this.node_id].proteins[this.protein_id].accession).width + 40);
            this.width = Math.max(this.width, this.ctx.measureText("EC number: " + data[this.node_id].proteins[this.protein_id].ec_number).width + 40);
            this.width = Math.max(this.width, this.ctx.measureText("Mass / Da: " + data[this.node_id].proteins[this.protein_id].mass).width + 40);
        }
    }

    this.is_mouse_over = function(mouse){
        if (!this.visible) return false;
        var x_l = this.x - (this.width + infobox_offset_x);
        var x_r = this.x - infobox_offset_x;
        var y_l = this.y - this.height * 0.5;
        var y_r = this.y + this.height * 0.5;
        return (x_l <= mouse.x && mouse.x <= x_r && y_l <= mouse.y && mouse.y <= y_r);
    }
    
    this.mouse_click = function(mouse, key){
        this.visible = false;
        draw();
    }

    this.draw = function(){
        if (!this.visible) return;
        var radius = round_rect_radius;
        
        this.ctx.fillStyle = infobox_fill_color;
        this.ctx.strokeStyle = infobox_stroke_color;
        this.ctx.lineWidth = infobox_stroke_width;
        
        var offset_x = this.width + infobox_offset_x;
        var offset_y = this.height / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - offset_x + radius, this.y - offset_y);
        this.ctx.lineTo(this.x - offset_x + this.width - radius, this.y - offset_y);
        this.ctx.quadraticCurveTo(this.x - offset_x + this.width, this.y - offset_y, this.x - offset_x + this.width, this.y - offset_y + radius);
        
        
        this.ctx.lineTo(this.x - offset_x + this.width, this.y - infobox_offset_x);
        this.ctx.lineTo(this.x - offset_x + this.width + infobox_offset_x, this.y);
        this.ctx.lineTo(this.x - offset_x + this.width, this.y + infobox_offset_x);
        
        this.ctx.lineTo(this.x - offset_x + this.width, this.y - offset_y + this.height - radius);
        this.ctx.quadraticCurveTo(this.x - offset_x + this.width, this.y - offset_y + this.height, this.x - offset_x + this.width - radius, this.y - offset_y + this.height);
        this.ctx.lineTo(this.x - offset_x + radius, this.y - offset_y + this.height);
        this.ctx.quadraticCurveTo(this.x - offset_x, this.y - offset_y + this.height, this.x - offset_x, this.y - offset_y + this.height - radius);
        this.ctx.lineTo(this.x - offset_x, this.y - offset_y + radius);
        this.ctx.quadraticCurveTo(this.x - offset_x, this.y - offset_y, this.x - offset_x + radius, this.y - offset_y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        if (data[this.node_id].type == "metabolite"){
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = 'top';
            this.ctx.font = "bold " + line_height.toString() + "px Arial";
            this.ctx.fillStyle = "black";
            this.ctx.fillText(data[this.node_id].name, this.x - offset_x + 20, this.y - offset_y + 20);
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = disabled_fill_color;
            this.ctx.moveTo(this.x - offset_x + 20, this.y - offset_y + line_height + 30);
            this.ctx.lineTo(this.x - offset_x + this.width - 20, this.y - offset_y + line_height + 30);
            this.ctx.stroke();
            
            this.ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            this.ctx.fillText("Formula:", this.x - offset_x + 20, this.y - offset_y + line_height + 40);
            this.ctx.fillText("Exact mass / Da:", this.x - offset_x + 20, this.y - offset_y + 2 * line_height + 40);
            var l_for = this.ctx.measureText("Formula: ").width;
            var l_ems = this.ctx.measureText("Exact mass / Da: ").width;
            
            
            
            this.ctx.font = (line_height - 5).toString() + "px Arial";
            this.ctx.fillText(data[this.node_id].formula, this.x - offset_x + 20 + l_for, this.y - offset_y + line_height + 40);
            this.ctx.fillText(data[this.node_id].exact_mass, this.x - offset_x + 20 + l_ems, this.y - offset_y + 2 * line_height + 40);
            
            if (data[this.node_id].img.width)
                this.ctx.drawImage(data[this.node_id].img, this.x - offset_x + 20, this.y - offset_y + 40 + 3 * line_height);
        }
        else if (data[this.node_id].type == "protein"){
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = 'top';
            this.ctx.font = "bold " + line_height.toString() + "px Arial";
            this.ctx.fillStyle = "black";
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].name, this.x - offset_x + 20, this.y - offset_y + 20);
        
            this.ctx.beginPath();
            this.ctx.strokeStyle = disabled_fill_color;
            this.ctx.moveTo(this.x - offset_x + 20, this.y - offset_y + line_height + 30);
            this.ctx.lineTo(this.x - offset_x + this.width - 20, this.y - offset_y + line_height + 30);
            this.ctx.stroke();
            
            this.ctx.font = "bold " + (line_height - 5).toString() + "px Arial";
            this.ctx.fillText("Definition: ", this.x - offset_x + 20, this.y - offset_y + line_height + 40);
            this.ctx.fillText("Uniprot accession: ", this.x - offset_x + 20, this.y - offset_y + 2 * line_height + 40);
            this.ctx.fillText("EC number: ", this.x - offset_x + 20, this.y - offset_y + 3 * line_height + 40);
            this.ctx.fillText("Mass / Da: ", this.x - offset_x + 20, this.y - offset_y + 4 * line_height + 40);
            var l_def = this.ctx.measureText("Definition: ").width;
            var l_acc = this.ctx.measureText("Uniprot accession: ").width;
            var l_ec = this.ctx.measureText("EC number: ").width;
            var l_ms = this.ctx.measureText("Mass / Da: ").width;
            
            
            
            this.ctx.font = (line_height - 5).toString() + "px Arial";
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].definition, this.x - offset_x + 20 + l_def, this.y - offset_y + line_height + 40);
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].accession, this.x - offset_x + 20 + l_acc, this.y - offset_y + 2 * line_height + 40);
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].ec_number, this.x - offset_x + 20 + l_ec, this.y - offset_y + 3 * line_height + 40);
            this.ctx.fillText(data[this.node_id].proteins[this.protein_id].mass, this.x - offset_x + 20 + l_ms, this.y - offset_y + 4 * line_height + 40);
        }
    }
}


node.prototype = new visual_element();
node.prototype.constructor = node;

function node(data, c){
    this.x = parseInt(data['x']);
    this.y = parseInt(data['y']);
    this.type = data['type'];
    this.id = data['id'];
    this.name = data['name'];
    this.c_number = data['c_number'];
    this.formula = data['formula'];
    this.exact_mass = data['exact_mass'];
    this.img = 0;
    this.highlight = false;
    this.pathway_ref = data['pathway_ref'];
    this.proteins = [];
    this.lines = -1;
    this.width = -1;
    this.height = -1;
    this.orig_height = -1;
    this.c = c;
    this.ctx = c.getContext("2d");
    this.slide = false;
    this.slide_percent = 0;
    this.on_slide = false;
    this.ctx.font = (text_size * factor).toString() + "px Arial";
    
    if (this.type == "protein"){
        var name = "";
        this.height = 20 + 20 * Math.min(data['proteins'].length, max_protein_line_number);
        this.orig_height = 20 + 20 * data['proteins'].length;
        this.lines = data['proteins'].length;
        this.slide = (data['proteins'].length > max_protein_line_number);
        for (var j = 0; j < data['proteins'].length; ++j){
            this.proteins.push(new Protein(data['proteins'][j]));
            if (name.length) name += ", ";
            var def = this.proteins[j].name;
            if (this.width < this.ctx.measureText(def).width){
                this.width = this.ctx.measureText(def).width;
            }
            name += data['proteins'][j]['name'];
        }
        this.width += 50 + this.slide * 20;
        this.name = name;
        this.tipp = (name.length || true);
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
        this.img = new Image();
        this.img.src = "http://www.genome.jp/Fig/compound/" + this.c_number + ".gif";
        this.tipp = true;
    }
     
    
    this.search = function(len_p, accept, masks){
        var results = [];
        if (this.type == "protein"){
            for (var i = 0; i < this.proteins.length; ++i){
                var r = this.proteins[i].search(len_p, accept, masks, this.id);
                if (r.length) results = results.concat(r);
            }
        }
        else {
            results = search_pattern(this.name, len_p, accept, masks, this.id, -1);
        }
        return results;
    }
    
    this.mouse_down = function(mouse, key){
        if (!this.slide) return false;
        var sl_x = this.x + this.width * 0.5 * 0.75;
        var sl_y_s = this.y - this.height * 0.5 * 0.75;
        var sl_y_e = this.y + this.height * 0.5 * 0.75;
        var ctl_y = sl_y_s + this.slide_percent * (sl_y_e - sl_y_s);
        
        this.on_slide = Math.sqrt(sq(sl_x - mouse.x) + sq(ctl_y - mouse.y)) < slide_bullet * factor;
        return this.on_slide;
    }
    
    this.mouse_up = function(mouse){
        this.on_slide = false;
        return true;
    }
    
    this.mouse_down_move = function(mouse, key){
        var sl_y_s = this.y - this.height * 0.5 * 0.75;
        var sl_y_e = this.y + this.height * 0.5 * 0.75;
        if (this.on_slide){
            this.slide_percent = (mouse.y - sl_y_s) / (sl_y_e - sl_y_s);
            this.slide_percent = Math.max(this.slide_percent, 0);
            this.slide_percent = Math.min(this.slide_percent, 1);
        }
        return this.on_slide;
    }
    
    
    this.draw = function() {
        var font_size = text_size * factor;
        var radius = metabolite_radius * factor;
    
        switch (this.type){
            case "protein":
                
                // draw fill
                this.ctx.fillStyle = protein_fill_color;
                this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
       
                // draw content
                if (this.lines > max_protein_line_number){
                    this.ctx.save();
                    this.ctx.rect(this.x - this.width * 0.45, this.y - this.height * 0.45, this.width * 0.9, this.height * 0.9);
                    this.ctx.clip();
                }
                this.ctx.textAlign = "left";
                this.ctx.textBaseline = 'middle';
                this.ctx.font = font_size.toString() + "px Arial";
                this.ctx.fillStyle = "black";
                var offset_y = 0;
                if (this.lines > max_protein_line_number){
                    offset_y = (this.orig_height * 0.5 - this.height * 0.5) - this.slide_percent * (this.orig_height - this.height);
                }
                for (var i = 0; i < this.proteins.length; ++i){
                    this.proteins[i].draw(this.ctx, this.x - this.width / 2, this.y + offset_y, this.proteins.length, i);
                }
                if (this.lines > max_protein_line_number){
                    this.ctx.restore();
                    
                    var sl_x = this.x + this.width * 0.5 * 0.75;
                    var sl_y_s = this.y - this.height * 0.5 * 0.75;
                    var sl_y_e = this.y + this.height * 0.5 * 0.75;
                    
                    var ctl_y = sl_y_s + this.slide_percent * (sl_y_e - sl_y_s);
                    
                    this.ctx.fillStyle = slide_color;
                    this.ctx.strokeStyle = slide_color;
                    this.ctx.lineWidth = slide_width * factor;
                    this.ctx.beginPath();
                    this.ctx.moveTo(sl_x, sl_y_s);
                    this.ctx.lineTo(sl_x, sl_y_e);
                    this.ctx.stroke();
                    
                    this.ctx.beginPath();
                    this.ctx.arc(sl_x, ctl_y, slide_bullet * factor, 0, 2 * Math.PI);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                }
                
                // draw stroke
                this.ctx.lineWidth = (line_width + 2 * this.highlight) * factor;
                this.ctx.strokeStyle = protein_stroke_color;
                this.ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
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
    
    this.is_mouse_over = function (mouse){
        var radius = metabolite_radius * factor;
        switch (this.type){
            case "metabolite":
                if (Math.sqrt(Math.pow(this.x - mouse.x, 2) + Math.pow(this.y - mouse.y, 2)) < radius){
                        return true;                    
                }
                break;
                
            default:
                if (this.x - this.width * 0.5 <= mouse.x && mouse.x <= this.x + this.width * 0.5){
                    if (this.y - this.height * 0.5 <= mouse.y && mouse.y <= this.y + this.height * 0.5){
                        return true;
                    }
                }
        }
        return false;
    };
    
    this.mark_protein_checkbox = function(res){
        var offset_y = 0;
        if (this.lines > max_protein_line_number){
            offset_y = (this.orig_height * 0.5 - this.height * 0.5) - this.slide_percent * (this.orig_height - this.height);
        }
        for (var i = 0; i < this.proteins.length; ++i){
            if (this.proteins[i].mouse_over_checkbox(this.x - this.width / 2, this.y + offset_y, res.x, res.y, this.proteins.length, i)){
                this.proteins[i].toggle_marked();
                break;
            }
        }
    }
    
    this.get_position = function(i){
        if ((this.type == "protein" && (i < 0 || this.proteins.length <= i)) || this.type == "pathway"){
            return [-1, -1];
        }
        
        if (this.type == "metabolite"){
            return [this.x - metabolite_radius * factor, this.y];
        }
        
        var offset_y = 0;
        if (this.lines > max_protein_line_number){
            offset_y = (this.orig_height * 0.5 - this.height * 0.5) - this.slide_percent * (this.orig_height - this.height);
        }
        
        return this.proteins[i].get_position(this.x - this.width / 2, this.y + offset_y, this.proteins.length, i);
    }
    
    
    this.check_mouse_over_protein_name = function(mouse){
        if (this.type != "protein") return -1;
        
        var offset_y = 0;
        if (this.lines > max_protein_line_number){
            offset_y = (this.orig_height * 0.5 - this.height * 0.5) - this.slide_percent * (this.orig_height - this.height);
        }
        for (var i = 0; i < this.proteins.length; ++i){
            if(this.proteins[i].check_mouse_over_protein_name(this.ctx, this.x - this.width / 2, this.y + offset_y, this.proteins.length, i, mouse)){
                return i;
            }
        }
        return -1;
    }
    
    this.mouse_click = function(mouse, key){
        if (this.type == 'protein'){
            var mopn = this.check_mouse_over_protein_name(mouse);
            if (mopn >= 0){
                prepare_infobox(mopn);
            }
            else {
                this.mark_protein_checkbox(mouse);
                draw();
            }
        }
        else if (this.type == 'metabolite'){
            prepare_infobox(this.is_mouse_over(mouse.x, mouse.y, metabolite_radius * factor) - 1);
        }
    }
    
    this.mouse_dbl_click = function(res, key){
        if (this.type != "protein") return false;
        var cnt = 0;
        var cnt_avbl = 0;
        for (var i = 0; i < this.proteins.length; ++i){
            cnt += this.proteins[i].marked;
            cnt_avbl += (this.proteins[i].peptides.length > 0) && (this.proteins[i].containing_spectra > 0);
        }
        var marking = (cnt != cnt_avbl);
        for (var i = 0; i < this.proteins.length; ++i){
            this.proteins[i].mark(marking);
        }
        draw();
        return true;
    }
};



function queue_node(_cell){
    this.cost = 100000;
    this.cll = _cell;
    this.pos = 0;
    this.in_queue = false;
}



function priority_queue(){
    this.field = [];
    
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
    var weight = 2;
    switch (dir){
        case "l":
            return (d_x < 0) * weight;
            break;
        case "r":
            return (d_x > 0) * weight;
            break;
        case "t":
            return (d_y < 0) * weight;
            break;
        case "b":
            return (d_y > 0) * weight;
            break;
    }
    return 0;
}


function point(x, y, b){
    this.x = x;
    this.y = y;
    this.b = b;
};

edge.prototype = new visual_element();
edge.prototype.constructor = edge;

function edge(c, x_s, y_s, a_s, protein_node, x_e, y_e, a_e, metabolite_node, head, reaction_id, reagent_id, edge_id){
    
    this.c = c;
    this.ctx = this.c.getContext("2d");
    this.head = head;
    this.point_list = [];
    this.start_point = (x_s, y_s, "");
    this.start_id = protein_node.id;
    this.start_anchor = a_s;
    this.end_point = (x_e, y_e, "");
    this.end_id = metabolite_node.id;
    this.end_anchor = a_e;
    this.reaction_id = reaction_id;
    this.reagent_id = reagent_id;
    this.edge_id = edge_id;
    
    
    
    this.is_mouse_over = function(mouse){
        for (var i = 0; i < this.point_list.length - 1; ++i){
            var p1 = this.point_list[i];
            var p2 = this.point_list[i + 1];
            var dir = p1.b;
            if (dir != "tb" && dir != "bt" && dir != "lr" && dir != "rl") continue;
            var dv_ab = new point(p2.x - p1.x, p2.y - p1.y, "");
            var dv_cd = new point(dv_ab.y, -dv_ab.x, "");
            
            var divi = ((dv_ab.y) * (dv_cd.x) - (dv_ab.x) * (dv_cd.y));
            var beta = divi ? ((p1.x - mouse.x) * (dv_cd.y) - (p1.y - mouse.y) * (dv_cd.x)) / divi : 0;
            if (0 > beta || beta > 1) continue;
            
            var pd = new point(p1.x + beta * dv_ab.x, p1.y + beta * dv_ab.y, "");
            var dist = Math.sqrt(sq(mouse.x - pd.x) + sq(mouse.y - pd.y));
            if (dist < 0.5 * line_width * factor){
                return true;
            }
        }
        return false;
    }
    
    
    this.mouse_down = function(mouse, key){
        if ((key != 1 && key != 3) || !administration) return false;
        var xmlhttp = new XMLHttpRequest();
        var request = "update_edge.py?id=";
        request += this.edge_id;
        request += "&element=";
        request += (key == 1) ? "protein" : "metabolite";
        xmlhttp.open("GET", request, false);
        xmlhttp.send();
        
        if (key == 1){
            if (nodes[this.reaction_id]['reagents'][this.reagent_id]['type'] == "educt"){
                nodes[this.reaction_id]['anchor_in'] = next_anchor[nodes[this.reaction_id]['anchor_in']];
            }
            else {
                nodes[this.reaction_id]['anchor_out'] = next_anchor[nodes[this.reaction_id]['anchor_out']];
            }
        }
        else {
            var anchor = nodes[this.reaction_id]['reagents'][this.reagent_id]['anchor'];
            nodes[this.reaction_id]['reagents'][this.reagent_id]['anchor'] = next_anchor[anchor];
        }
        compute_edges();
        draw();
    }
    
    
    
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
        var grid = base_grid * factor;
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
        var W = 8 + Math.ceil(Math.abs(xd_s - xd_e) / grid);
        var H = 8 + Math.ceil(Math.abs(yd_s - yd_e) / grid);
        var open_list = new priority_queue();
        var matrix = [];
        for (var h = 0; h < H; ++h){
            matrix.push([]);
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
                /*
                for (var i = 0; i < data.length && active; ++i){
                    xx_min = data[i].x - (data[i].width * 0.5 + base_grid * factor);
                    xx_max = data[i].x + (data[i].width * 0.5 + base_grid * factor);
                    yy_min = data[i].y - data[i].height * 0.5 + base_grid * factor;
                    yy_max = data[i].y + (data[i].height * 0.5 + base_grid * factor);
                    if (xx_min <= x && x <= xx_max && yy_min <= y && y <= yy_max){
                        active = false;
                    }
                }
                if (!active) console.log("na: " + ((w - cell_x_s) * grid + xd_s) + " " + ((h - cell_y_s) * grid + yd_s));
                */
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
            this.point_list = [new point(xa_s, ya_s, opposite[a_s] + a_s)];
            this.point_list.push(new point(xa_e, ya_e, opposite[a_e] + a_e));
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
                            y = (this.point_list[this.point_list.length - 1].y + this.point_list[this.point_list.length - 4].y) * 0.5;
                            this.point_list[this.point_list.length - 2].y = y;
                            this.point_list[this.point_list.length - 3].y = y;
                            break;
                        case "t": case "b":
                            x = (this.point_list[this.point_list.length - 1].x + this.point_list[this.point_list.length - 4].x) * 0.5;
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
                
    }
    
    
    this.routing(x_s, y_s, a_s, protein_node, x_e, y_e, a_e, metabolite_node); 
    
    this.draw = function(){
        
        this.ctx.strokeStyle = edge_color;
        this.ctx.fillStyle = edge_color;
        this.ctx.lineWidth = line_width * factor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.point_list[0].x, this.point_list[0].y);
        var p_len = this.point_list.length;
        for (var i = 0; i < p_len - 1 - this.head; ++i){
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
        if (this.head){
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
