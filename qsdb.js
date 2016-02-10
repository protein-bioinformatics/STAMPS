moved = false;
HTTP_GET_VARS = [];
current_pathway = 0;
highlight_element = 0;
offsetX = 0;
offsetY = 0;
null_x = 0;
null_y = 0;
mouse_x = 0;
mouse_y = 0;
data = [];
data_ref = [];
nodes = 0;
event_moving_node = false;
event_key_down = false;
node_move_x = 0;
node_move_y = 0;
edges = [];
infobox = 0;
zoom_sign_in = 0;
zoom_sign_out = 0;
elements = [];
boundaries = [0, 0, 0, 0];
pathway_is_loaded = false;
edge_count = 0;
draw_code = 0;

scaling = 1.25;
zoom = 0;
max_zoom = 5;
min_zoom = -5;
highlight_zoom = 3;
base_grid = 25;
max_protein_line_number = 3;
metabolite_radius = 10;
arrow_length = 10;
round_rect_radius = 10;
text_size = 15;
check_len = 15;
line_height = 20;
anchors = ['left', 'top', 'right', 'bottom'];
next_anchor = {"left": "top", "top": "right", "right": "bottom", "bottom": "left"};
administration = false;
on_slide = false;
factor = Math.pow(scaling, zoom);
font_size = text_size * factor;
radius = metabolite_radius * factor;
last_keys = [];


line_width = 6;
protein_stroke_color = "#f69301";
protein_fill_color = "#fff6d5";
metabolite_stroke_color = "#f69301";
metabolite_fill_color = "white";;
pathway_stroke_color = "#f69301";
pathway_fill_color = "white";
edge_color = "#f69301";

/*
protein_stroke_color = "#3644a2";
protein_fill_color = "#f3f8ff";
metabolite_stroke_color = "#3644a2";
metabolite_fill_color = "white";
pathway_stroke_color = "#3644a2";
pathway_fill_color = "white";
edge_color = "#3644a2";*/

disabled_text_color = "#bbbbbb";
disabled_fill_color = "#cccccc";
text_color = "black";
slide_color = "#5792da";
slide_width = 2;
slide_bullet = 4;
infobox_fill_color = "white";
infobox_stroke_color = "#777777";
infobox_stroke_width = 1;
infobox_offset_x = 20;
preview_element = 0;

// [298, "Phenylalanine metabolism"],



pathways = [[298, "Phenylalanine metabolism"],
            [15, "Alanine, aspartate and glutamate metabolism"],
            [163, "alpha-Linolenic acid metabolism"],
            [57, "Amino sugar and nucleotide sugar metabolism"],
            [160, "Arachidonic acid metabolism"],
            [200, "Arginine and proline metabolism"],
            [21, "Arginine biosynthesis"],
            [78, "Ascorbate and aldarate metabolism"],
            [164, "Biosynthesis of unsaturated fatty acids"],
            [6, "Citrate Cycle"],
            [228, "Cysteine and methionine metabolism"],
            [34, "Ether lipid metabolism"],
            [11, "Fatty Acid Biosynthesis"],
            [13, "Fatty acid degradation"],
            [137, "Fatty acid elongation"],
            [66, "Fructose and mannose metabolism"],
            [53, "Galactose metabolism"],
            [29, "Glycerolipid metabolism"],
            [28, "Glycerophospholipid metabolism"],
            [206, "Glycine, serine and threonine metabolism"],
            [1, "Glycolysis"],
            [9, "Glyoxylate and dicarboxylate metabolism"],
            [51, "Histidine metabolism"],
            [40, "Inositol phosphate metabolism"],
            [161, "Linoleic acid metabolism"],
            [118, "Lysine biosynthesis"],
            [258, "Lysine degradation"],
            [48, "Pentose and glucuronate interconversions"],
            [3, "Pentose phosphate"],
            [292, "Phenylalanine, tyrosine and tryptophan biosynthesis"],
            [155, "Primary bile acid biosynthesis"],
            [50, "Pyrimidine metabolism"],
            [49, "Purine metabolism"],
            [5, "Pyruvate metabolism"],
            [41, "Sphingolipid metabolism"],
            [151, "Steroid biosynthesis"],
            [154, "Steroid hormone biosynthesis"],
            [109, "Synthesis and degradation of ketone bodies"],
            [300, "Tryptophan metabolism"],
            [16, "Tyrosine metabolism"],
            [111, "Valine, leucine and isoleucine biosynthesis"],
            [17, "Valine, leucine and isoleucine degradation"]
           ];


function debug(text){
    document.getElementById("hint").innerHTML = text;
}


CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height) {
    var rect_curve = round_rect_radius * factor;
    this.beginPath();
    this.moveTo(x + rect_curve, y);
    this.lineTo(x + width - rect_curve, y);
    this.quadraticCurveTo(x + width, y, x + width, y + rect_curve);
    this.lineTo(x + width, y + height - rect_curve);
    this.quadraticCurveTo(x + width, y + height, x + width - rect_curve, y + height);
    this.lineTo(x + rect_curve, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - rect_curve);
    this.lineTo(x, y + rect_curve);
    this.quadraticCurveTo(x, y, x + rect_curve, y);
    this.closePath();
    this.fill();
    this.stroke();
}



CanvasRenderingContext2D.prototype.arrow = function (p1_x, p1_y, p2_x, p2_y, head) {
    if (typeof head == 'undefined') {
        head = true;
    }
    
    if (head){
        var l = Math.sqrt(Math.pow(arrow_length * factor, 2) / (Math.pow(p2_x - p1_x, 2) + Math.pow(p2_y - p1_y, 2)));
        
        var l2 = Math.sqrt(Math.pow(arrow_length / 2 * factor, 2) / (Math.pow(p2_x - p1_x, 2) + Math.pow(p2_y - p1_y, 2)));
        
        var x = p2_x + l * (p1_x - p2_x);
        var y = p2_y + l * (p1_y - p2_y);
        
        var x_arc = p2_x + l2 * (p1_x - p2_x);
        var y_arc = p2_y + l2 * (p1_y - p2_y);
        
        var x_l = x - l / 2 * (p1_y - p2_y);
        var y_l = y + l / 2 * (p1_x - p2_x);
        
        var x_r = x + l / 2 * (p1_y - p2_y);
        var y_r = y - l / 2 * (p1_x - p2_x);
        
        
        this.strokeStyle = edge_color;
        this.fillStyle = edge_color;
        this.lineWidth = line_width * factor;
        this.beginPath();
        this.moveTo(p1_x, p1_y);
        this.lineTo(x, y);
        this.closePath();
        this.stroke();
        
        var r = Math.sqrt(Math.pow(y_arc - y_r, 2) + Math.pow(x_arc - x_r, 2));
        this.lineWidth = 1;
        this.beginPath();
        this.moveTo(p2_x, p2_y);
        this.lineTo(x_r, y_r);
        this.lineTo(x_l, y_l);
        this.closePath();
        this.fill();
    }
    else {
        this.strokeStyle = edge_color;
        this.fillStyle = edge_color;
        this.lineWidth = line_width * factor;
        this.beginPath();
        this.moveTo(p1_x, p1_y);
        this.lineTo(p2_x, p2_y);
        this.closePath();
        this.stroke();
    }
}



function compute_angle(x_1, y_1, x_2, y_2, anchor){
    var angle = 0;
    
    if (x_1 == x_2){
        angle = (y_2 > y_1) * Math.PI / 2;
    }
    else if (x_2 > x_1){
        angle = (Math.atan((y_2 - y_1) / (x_2 - x_1)) + Math.PI / 2) / 2;
    }
    else {
        angle = (Math.atan((y_2 - y_1) / (x_2 - x_1)) - Math.PI / 2) / 2;
    }
    
    switch (anchor){
        case 'left':
            angle += Math.PI / 4;
            break;
        case 'top':
            break;
        case 'right':
            angle -= Math.PI / 4;
            break;
        case 'bottom':
            angle -= Math.PI / 2;
            break;
    }
    if (angle < -Math.PI / 2) angle += Math.PI;
    if (angle > Math.PI / 2) angle -= Math.PI;
    return angle;
}



function draw(sync){
    if (typeof(sync) == "undefined"){
        var dc = Math.random();
        draw_code = dc;
        var dr = setInterval(function(dc){
            var c = document.getElementById("renderarea");
            var ctx = c.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            //draw elements visual elements
            for (var i = 0; i < elements.length; ++i){
                elements[i].draw();
            }
            clearInterval(dr);
        }, 1, dc);
    }
    else {
        var c = document.getElementById("renderarea");
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        //draw elements visual elements
        for (var i = 0; i < elements.length; ++i){
            elements[i].draw();
        }
    }
}




function init(){
    strGET = document.location.search.substr(1,document.location.search.length);
    if(strGET!=''){
        gArr = strGET.split('&');
        for(var i = 0; i < gArr.length; ++i){
            v='';vArr=gArr[i].split('=');
            if(vArr.length>1){v=vArr[1];}
            HTTP_GET_VARS[unescape(vArr[0])] = unescape(v);
        }
    }
    if (HTTP_GET_VARS['admin']) administration = HTTP_GET_VARS['admin'] == 1;
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var receive = xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", "set-counter.py?counter=request", true);
    xmlhttp.send();
    
    
    var pathway_menu = "<table>";
    for (var i = 0; i < pathways.length; ++i){
        pathway_menu += "<tr><td class=\"select_pathway_cell\" onclick=\"change_pathway(";
        pathway_menu += i;
        pathway_menu += ");\">";
        pathway_menu += pathways[i][1]; 
        pathway_menu += "</td></tr>";
    }
    pathway_menu += "</table>";
    document.getElementById("select_pathway").innerHTML = pathway_menu;
    
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    infobox = new Infobox(ctx);
    zoom_sign_in = new zoom_sign(ctx, 1);
    zoom_sign_out = new zoom_sign(ctx, 0);
    
    
    c.onclick = function (event)
    {
        if (event.region) {
            alert('You clicked ' + event.region);
        }
    }
    
    
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    c.onmousedown = mouse_down_listener;
    c.onmouseup = mouse_up_listener;
    c.onmousemove = mouse_move_listener;
    c.addEventListener("click", mouse_click_listener, false);
    c.addEventListener("dblclick", mouse_dblclick_listener, false);
    //c.addEventListener("wheel", mouse_wheel_listener, false);
    //c.addEventListener("mousewheel", mouse_wheel_listener, false);
    c.addEventListener('DOMMouseScroll', mouse_wheel_listener, false);
    
    document.addEventListener('keydown', key_down, false);
    document.addEventListener('keyup', key_up, false);
    document.getElementById("menubackground").addEventListener("click", hide_custom_menu, false);
    document.getElementById("managementbackground").addEventListener("click", hide_management, false);
    document.getElementById("search_background").addEventListener("click", hide_search, false);
    document.getElementById("select_species_background").addEventListener("click", hide_select_species, false);
    document.getElementById("select_pathway_background").addEventListener("click", hide_select_pathway, false);
    
    
    document.getElementById("check_spectra_background").addEventListener("click", hide_check_spectra, false);
    window.addEventListener('resize', resize_ms_view, false);
    document.getElementById("msarea").addEventListener("mousewheel", view_mouse_wheel_listener, false);
    document.getElementById("msarea").addEventListener('DOMMouseScroll', view_mouse_wheel_listener, false);
    
    c.oncontextmenu = function (event){
        show_custom_menu(event);
        return false;
    }
    document.getElementById("menubackground").oncontextmenu = function(event){
        hide_custom_menu(event);
        return false;        
    };
    document.getElementById("custommenu").oncontextmenu = function(event){
        return false;        
    };
    
    change_pathway(0);
    //load_data(false);
}



function reset_view(){
    zoom = 0;
    null_x = 0;
    null_y = 0;    
    factor = Math.pow(scaling, zoom);
    font_size = text_size * factor;
    radius = metabolite_radius * factor;
}


function load_data(reload){
    
    pathway_is_loaded = false;
    if (!reload){
        reset_view();
        document.getElementById("search_field").value = "";
        hide_search();
    }
    
    elements = [];
    edges = [];
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    preview_element = new preview(ctx);
    
    var species = [];
    if(document.getElementById("species_mouse").checked) species.push("mouse");
    //if(document.getElementById("species_human").checked) species.push("human");
    var species_string = species.join(":");
    
    // get data information
    data = [];
    data_ref = [];
    var tmp_data = 0;
    nodes = 0;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            tmp_data = JSON.parse(xmlhttp.responseText);
        }
    }
    
    // get nodes information
    var xmlhttp2 = new XMLHttpRequest();
    xmlhttp2.onreadystatechange = function() {
        if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
            nodes = JSON.parse(xmlhttp2.responseText);
        }
    }
    
    
    xmlhttp.open("GET", "get-qsdbdata.py?request=qsdbdata&pathway=" + current_pathway + "&species=" + species_string, true);
    xmlhttp.send();
    
    
    xmlhttp2.open("GET", "get-edgedata.py?pathway=" + current_pathway, true);
    xmlhttp2.send();
    
    
    
    var x_min = 1e100, x_max = -1e100;
    var y_min = 1e100, y_max = -1e100;
    var preview_zoom = 0, m_zoom = 0;
    var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
    
    
    
    var process_nodes = setInterval(function(){
        if (tmp_data){
            for (var i = 0; i < tmp_data.length; ++i){
                data.push(new node(tmp_data[i], c));
                x_min = Math.min(x_min, data[i].x - data[i].width * 0.5);
                x_max = Math.max(x_max, data[i].x + data[i].width * 0.5);
                y_min = Math.min(y_min, data[i].y - data[i].height * 0.5);
                y_max = Math.max(y_max, data[i].y + data[i].height * 0.5);
                data_ref[data[i].id] = i;
            }
            if (reload){
                for (var i = 0; i < data.length; ++i){
                    data[i].x += null_x;
                    data[i].y += null_y;
                    data[i].width *= factor;
                    data[i].height *= factor;
                    data[i].x = null_x + factor * (data[i].x - null_x);
                    data[i].y = null_y + factor * (data[i].y - null_y);
                }
            }
            if (!reload){
                var shift_x = (ctx.canvas.width - x_min - x_max) * 0.5;
                var shift_y = nav_height + (ctx.canvas.height - nav_height - y_min - y_max) * 0.5;
                for (var i = 0; i < data.length; ++i){
                    data[i].x += shift_x;
                    data[i].y += shift_y;
                }
                null_x += shift_x;
                null_y += shift_y;
            
                
                if ((x_max - x_min) / ctx.canvas.width > (y_max - y_min) / (ctx.canvas.height - nav_height)){
                    m_zoom = -Math.ceil(Math.log((x_max - x_min) / ctx.canvas.width) / Math.log(scaling));
                    preview_zoom = -Math.ceil(Math.log((x_max - x_min) / ctx.canvas.width * 5) / Math.log(scaling));
                }
                else {
                    m_zoom = -Math.ceil(Math.log((y_max - y_min) / (ctx.canvas.height - nav_height)) / Math.log(scaling));
                    preview_zoom = -Math.ceil(Math.log((y_max - y_min) / (ctx.canvas.height - nav_height) * 5) / Math.log(scaling));
                }
            }
            clearInterval(process_nodes);
            
        }
    }, 1);
        
    var start_time = new Date().getTime();
    var process_edges = setInterval(function(){
        if (tmp_data && nodes){
            compute_edges();
            assemble_elements();
            min_zoom = preview_zoom;
            for (var i = zoom; i >= preview_zoom; --i) zoom_in_out(1, 0);
            draw(1);
            preview_element.snapshot();
            for (var i = 0; i < (m_zoom - preview_zoom); ++i) zoom_in_out(0, 0);
            min_zoom = m_zoom;
            draw();
            pathway_is_loaded = true;
            clearInterval(process_edges);
        }
    }, 1);
}


function compute_edges(){
    edges = [];
    var c = document.getElementById("renderarea");
    var diameter = 2 * radius;
    var connections = [];
    var nodes_anchors = [];
    for (var i = 0; i < data.length; ++i){
        nodes_anchors.push({left: [], right: [], top: [], bottom: []});
    }
    for (var i = 0; i < nodes.length; ++i){
        var node_id = data_ref[nodes[i]['node_id']];
        var reversible = parseInt(nodes[i]['reversible']);
        for (var j = 0; j < nodes[i]['reagents'].length; ++j){
            
            var metabolite_id = data_ref[nodes[i]['reagents'][j]['node_id']];
            var angle_metabolite = compute_angle(data[metabolite_id].x, data[metabolite_id].y, data[node_id].x, data[node_id].y, nodes[i]['reagents'][j]['anchor']);
            
            if (nodes[i]['reagents'][j]['type'] == 'educt'){
                var angle_node = compute_angle(data[node_id].x, data[node_id].y, data[metabolite_id].x, data[metabolite_id].y, nodes[i]['anchor_in']);
                connections.push([node_id, nodes[i]['anchor_in'], metabolite_id, nodes[i]['reagents'][j]['anchor'], reversible, i, j, nodes[i]['reagents'][j]['id']]);
                nodes_anchors[node_id][nodes[i]['anchor_in']].push([metabolite_id, connections.length - 1, angle_node]);
            }
            else{
                var angle_node = compute_angle(data[node_id].x, data[node_id].y, data[metabolite_id].x, data[metabolite_id].y, nodes[i]['anchor_out']);
                connections.push([node_id, nodes[i]['anchor_out'], metabolite_id, nodes[i]['reagents'][j]['anchor'], true, i, j, nodes[i]['reagents'][j]['id']]);
                nodes_anchors[node_id][nodes[i]['anchor_out']].push([metabolite_id, connections.length - 1, angle_node]);
                
            }
            nodes_anchors[metabolite_id][nodes[i]['reagents'][j]['anchor']].push([node_id, connections.length - 1, angle_metabolite]);
        }
    }
    
    
    for (var i = 0; i < nodes_anchors.length; ++i){
        for (var a in anchors){
            var node_p = nodes_anchors[i][anchors[a]];
            var len = node_p.length;
            if (node_p.length > 1){
                
                // bubble sort
                for (var j = 0; j < len; ++j){
                    var swps = 0;
                    for (var k = 0; k < len - 1; ++k){
                        if (node_p[k][2] > node_p[k + 1][2]){
                            var tmp = node_p[k];
                            node_p[k] = node_p[k + 1];
                            node_p[k + 1] = tmp;
                            swps += 1;
                        }
                    }
                    if (!swps) break;
                }
            }
        }
    }
    
    for (var i = 0; i < connections.length; ++i){
        edges.push(0);
    }
    
    for (var i = 0; i < connections.length; ++i){
        var node_id = connections[i][0];
        var node_anchor = connections[i][1];
        var node_len = nodes_anchors[node_id][node_anchor].length;
        var metabolite_id = connections[i][2];
        var metabolite_anchor = connections[i][3];
        var metabolite_len = nodes_anchors[metabolite_id][metabolite_anchor].length;
        var has_head = connections[i][4];
        var reaction_id = connections[i][5];
        var reagent_id = connections[i][6];
        var edge_id = connections[i][7];
        var start_x = 0, start_y = 0;
        var end_x = 0, end_y = 0;
        var node_pos = 0, metabolite_pos = 0;
        var node_width = 0, node_height = 0;
        for (var j = 0; j < nodes_anchors[node_id][node_anchor].length; ++j){
            var current_entry = nodes_anchors[node_id][node_anchor][j];
            if (current_entry[0] == metabolite_id && current_entry[1] == i){
                start_x = data[node_id].x;
                start_y = data[node_id].y;
                node_width = data[node_id].width;
                node_height = data[node_id].height;
                node_pos = j;
            }
        }
        for (var j = 0; j < nodes_anchors[metabolite_id][metabolite_anchor].length; ++j){
            var current_entry = nodes_anchors[metabolite_id][metabolite_anchor][j];
            if (current_entry[0] == node_id && current_entry[1] == i){
                end_x = data[metabolite_id].x;
                end_y = data[metabolite_id].y;
                metabolite_pos = j;
            }
        }
        var len_adjacent = diameter * (-1 / metabolite_len + 1);
        var correction_shift = metabolite_pos / (metabolite_len - 1);
        switch (metabolite_anchor){
            case "top":
                end_y -= radius;
                var w = len_adjacent;
                end_x -= w * 0.5;
                if (metabolite_len > 1){
                    end_x += w * correction_shift;
                }
                break;
            case "bottom":
                end_y += radius;
                var w = len_adjacent;
                end_x += w * 0.5;
                if (metabolite_len > 1){
                    end_x -= w * correction_shift;
                }
                break;
            case "left":
                end_x -= radius;
                var h = len_adjacent;
                end_y += h * 0.5;
                if (metabolite_len > 1){
                    end_y -= h * correction_shift;
                }
                break;
            case "right":
                end_x += radius;
                var h = len_adjacent;
                end_y -= h * 0.5;
                if (metabolite_len > 1){
                    end_y += h * correction_shift;
                }
                break;
        }
        
        if ((node_anchor == 'top') || (node_anchor == 'bottom')){
            if (node_anchor == 'top'){
                start_y -= node_height * 0.5;
            }
            else {
                start_y += node_height * 0.5;
            }
        }
        if ((node_anchor == 'left') || (node_anchor == 'right')){
            if (node_anchor == 'left'){
                start_x -= node_width * 0.5;
            }
            else {
                start_x += node_width * 0.5;
            }
        }
        edges[i] = new edge(c, start_x, start_y, node_anchor, data[node_id], end_x, end_y, metabolite_anchor, data[metabolite_id], has_head, reaction_id, reagent_id, edge_id);
    }
    
}


function assemble_elements(){
    elements = [];
    for (var i = 0; i < data.length; ++i) elements.push(data[i]);
    for (var i = 0; i < edges.length; ++i) elements.push(edges[i]);    
    elements.push(infobox);
    elements.push(zoom_sign_in);
    elements.push(zoom_sign_out);
    elements.push(preview_element);
}


function get_mouse_pos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}


function show_management(){
    document.getElementById("managementbackground").style.display = "inline";
    document.getElementById("renderarea").style.filter = "blur(5px)";
    
    proteins = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            proteins = JSON.parse(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", "get-proteins.py", false);
    xmlhttp.send();
    
    inner_html = "<table width='100%'>";
    var close_all = "";
    for (var i = 0; i < proteins.length; ++i){
        close_all += "document.getElementById(\"managementtable_item" + i + "\").style.display = \"none\"; ";
    }
    for (var i = 0; i < proteins.length; ++i){
        var color = (i % 2 == 1) ? "white" : "#eeeeee";
        inner_html += "<tr><td bgcolor='" + color + "'>";
        inner_html += "<table width='100%'><tr><td onclick='" + close_all + "document.getElementById(\"managementtable_item" + i + "\").style.display = \"inline\";' width='98%'><b>" + proteins[i]['name'] + "</b></td>";
        inner_html += "<td align='right'><img src='delete.png' width=24 /></td></tr></table>";
        inner_html += "<div id='managementtable_item" + i +  "' style='display: none;'>";
        inner_html += "<table width='80%'><tr><td width='20%'>Name: </td><td><input size=100 id=\"name" + i + "\" value=\"" + proteins[i]['name'] + "\"></td></tr>";
        inner_html += "<tr><td>Definition: </td><td><input size=100 id=\"definition" + i + "\" value=\"" + proteins[i]['definition'] + "\"></td></tr>";
        inner_html += "<tr><td>KEGG URL: </td><td><input size=100 id=\"kegg_link" + i + "\" value=\"" + proteins[i]['kegg_link'] + "\"></td></tr>";
        inner_html += "<tr><td>UniProt URL: </td><td><input size=100 id=\"uniprot_link" + i + "\" value=\"" + proteins[i]['uniprot_link'] + "\"></td></tr></table>";
        inner_html += "</div></td></tr>";
    }
    inner_html += "</table>";
    
    document.getElementById("management").style.display = "inline";
    document.getElementById("management").innerHTML = "<div style='position: absolute; top: 2%; left: 5%' onclick='alert(\"huhu\");'><table><tr><td><img src='add.png' width='24'>&nbsp;&nbsp;</td><td> New protein</td></tr></table></div><div id='managementtable' class='managementtable'></div><div style='position: absolute; top: 92%; left: 90%;'><button onclick='hide_management(\"event\");'>Close</button></div>";
    document.getElementById("managementtable").innerHTML = inner_html;
    document.getElementById("managementtable").scrollTo(0, 0);
}


function hide_management(event){
    document.getElementById("managementbackground").style.display = "none";
    document.getElementById("management").style.display = "none";
    document.getElementById("renderarea").style.filter = "none";
}


function show_custom_menu(event){
    if (!administration) return;
    var menu_points = new Array();
    unTip();
    /*
    if (!highlight_element){
        menu_points.push(["Insert protein", "debug", 0, 1]);
        menu_points.push(["Insert metabolite", "debug", 0, 1]);
        menu_points.push(["Insert pathway", "debug", 0, 1]);
        menu_points.push(["Manage reagents", "show_management", 0, 1]);
    }
    else if (highlight_element.type == "metabolite"){
        menu_points.push(["Connect metabolite", "debug", 1, 1]);
        menu_points.push(["Edit metabolite", "debug", 1, 1]);
        menu_points.push(["Delete metabolite", "debug", 1, 1]);
    }
    else if (highlight_element.type == "protein"){
        menu_points.push(["Edit protein(s)", "debug", 1, 1]);
        var enable_del_reaction = false;
        for (var i = 0; i < nodes.length; ++i){
            var node_id = data_ref[nodes[i]['node_id']];
            if (data_ref[nodes[i]['node_id']] == highlight_element){
                enable_del_reaction = true;
                break;
            }
        }
        menu_points.push(["Delete reaction", "debug", 1, enable_del_reaction]);
        menu_points.push(["Delete protein", "debug", 1, 1]);
    }
    else if (highlight_element.type == "pathway"){
        menu_points.push(["Edit pathway", "debug", 1, 1]);
        menu_points.push(["Delete pathway", "debug", 1, 1]);
    }
    
    var inner_html = "<table id='custommenutable' class='custommenutable'>";
    for (var i = 0; i < menu_points.length; ++i){
        if (menu_points[i][3]){
            var menu_command = menu_points[i][1] + "(";
            if (menu_points[i][2]) menu_command += highlight_element.id;
            menu_command += ")";
            inner_html += "<tr><td onclick='hide_custom_menu(event); " + menu_command + "'; class='menuitem'>" + menu_points[i][0] + "</td></tr>";
        }
        else {
            inner_html += "<tr><td class='menuitemdisabled'>" + menu_points[i][0] + "</td></tr>";
        }
    }
    inner_html += "</table>";
    document.getElementById("menubackground").style.display = "inline";
    var cm = document.getElementById("custommenu");
    cm.style.display = "inline";
    cm.innerHTML = inner_html;
    
    cm.style.left = (event.clientX - (event.clientX + cm.offsetWidth > window.innerWidth ? cm.offsetWidth : 0)) + "px";
    cm.style.top = (event.clientY - (event.clientY + cm.offsetHeight > window.innerHeight ? cm.offsetHeight : 0)) + "px";
    */
}


function hide_custom_menu(event){
    document.getElementById("menubackground").style.display = "none";
    document.getElementById("custommenu").style.display = "none";
}


function mouse_wheel_listener(e){
    if (!pathway_is_loaded) return;
    var c = document.getElementById("renderarea");
    zoom_in_out(e.detail >= 0, get_mouse_pos(c, e));
    draw();
}
    
    
function zoom_in_out(dir, res){
    var direction = (1 - 2 * dir);
    if (zoom + direction < min_zoom || max_zoom < zoom + direction)
        return;
    zoom += direction;
    factor = Math.pow(scaling, zoom);
    font_size = text_size * factor;
    radius = metabolite_radius * factor;
    var scale = scaling;
    if (dir) scale = 1. / scale;
    
    if (!res) {
        res = [];
        res.x = window.innerWidth * 0.5;
        var nav_height = document.getElementById("navigation").getBoundingClientRect().height;
        res.y = nav_height + (window.innerHeight - nav_height) * 0.5;
    }
    for (var i = 0; i < data.length; ++i){
        data[i].width *= scale;
        data[i].height *= scale;
        data[i].orig_height *= scale;
        data[i].x = res.x + scale * (data[i].x - res.x);
        data[i].y = res.y + scale * (data[i].y - res.y);
    }
    for (var i = 0; i < edges.length; ++i){
        for (var j = 0; j < edges[i].point_list.length; ++j){
            edges[i].point_list[j].x = res.x + scale * (edges[i].point_list[j].x - res.x);
            edges[i].point_list[j].y = res.y + scale * (edges[i].point_list[j].y - res.y);
        }
    }
    infobox.x = res.x + scale * (infobox.x - res.x);
    infobox.y = res.y + scale * (infobox.y - res.y);
    null_x = res.x + scale * (null_x - res.x);
    null_y = res.y + scale * (null_y - res.y);
    boundaries[0] = res.x + scale * (boundaries[0] - res.x);
    boundaries[1] = res.y + scale * (boundaries[1] - res.y);
    boundaries[2] *= scale;
    boundaries[3] *= scale;
}


function mouse_dblclick_listener(e){
    if (!pathway_is_loaded) return;
    
    if (infobox.visible){
        infobox.visible = false;
        draw();
    }
    
    if (!moved){
        if (highlight_element && highlight_element.type == 'protein'){
            var c = document.getElementById("renderarea");
            var res = get_mouse_pos(c, e);
            highlight_element.mouse_dbl_click(res, e.which);
        }
    }
    moved = false;
}



function mouse_click_listener(e){
    if (!pathway_is_loaded) return;
    if (!moved){
        if (highlight_element){
            var c = document.getElementById("renderarea");
            var res = get_mouse_pos(c, e);
            highlight_element.mouse_click(res, e.which);
        }
    }
    moved = false;
}



function change_pathway(p){
    hide_select_pathway();
    current_pathway = pathways[p][0];
    reset_view();
    document.getElementById("pathway_name").innerHTML = "Current pathway: " + pathways[p][1];
    load_data();
}


function mouse_down_listener(e){
    if (!pathway_is_loaded) return;
    
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, e);
    
    if (highlight_element){
        highlight_element.mouse_down(res, e.which);
        node_move_x = highlight_element.x;
        node_move_y = highlight_element.y;        
    }
    offsetX = res.x;
    offsetY = res.y;
}



function mouse_move_listener(e){
    if (!pathway_is_loaded) return;
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    res = get_mouse_pos(c, e);
    var grid = Math.floor(base_grid * factor * 1000);
    mouse_x = res.x;
    mouse_y = res.y;
    
    // shift all nodes
    if (e.buttons & 1){
        if (!highlight_element || !highlight_element.mouse_down_move(res, e.which)){
            var shift_x = res.x - offsetX;
            var shift_y = res.y - offsetY;
            if (shift_x != 0 || shift_y != 0){
                moved = true;
                c.style.cursor = "all-scroll";
            }
            
            
            if (!event_key_down || !highlight_element){
                
                for (var i = 0; i < data.length; ++i){
                    data[i].x += shift_x;
                    data[i].y += shift_y;
                }
                for (var i = 0; i < edges.length; ++i){
                    var edg = edges[i];
                    for (var j = 0; j < edges[i].point_list.length; ++j){
                        edg.point_list[j].x += shift_x;
                        edg.point_list[j].y += shift_y;
                    }
                }
                infobox.x += shift_x;
                infobox.y += shift_y;
                null_x += shift_x;
                null_y += shift_y;
                boundaries[0] += shift_x;
                boundaries[1] += shift_y;
            }
            else if (administration) {
                event_moving_node = true;
                node_move_x += shift_x;
                node_move_y += shift_y;
                highlight_element.x = Math.floor(node_move_x - (1000 * (node_move_x - null_x) % grid) / 1000.);
                highlight_element.y = Math.floor(node_move_y - (1000 * (node_move_y - null_y) % grid) / 1000.);
                compute_edges();
                assemble_elements();
            }
        }
        //var process_draw = setInterval(function(){
            draw();
        //    clearInterval(process_draw);
        //}, 1);
        offsetX = res.x;
        offsetY = res.y;
    }
    else {
        // find active node
        var newhighlight = 0;
        for (var i = elements.length - 1; i >= 0; --i){
            if (elements[i].is_mouse_over(res)){
                newhighlight = elements[i];
                break; 
            }
        }
        if (highlight_element != newhighlight && !event_moving_node){
            for (var i = 0; i < elements.length; ++i){
                elements[i].highlight = (elements[i] == newhighlight);
            }
            highlight_element = newhighlight;
            draw();
        }
        
    }
    if(highlight_element && highlight_element.tipp && !(administration && event_key_down)) Tip(e, highlight_element.id + " " + highlight_element.name);
    else unTip();
    
}


function Tip(e, name) {      
    var wmtt = document.getElementById('tooltip');
    if (wmtt != null && wmtt.style.display != 'block') {
        wmtt.style.display = "block";
        wmtt.innerHTML = name;
    }
    wmtt.style.left = (e.clientX + 20) + "px";
    wmtt.style.top  = (e.clientY + 10) + "px";
}

function unTip() {
    document.getElementById('tooltip').style.display = "none";
}


function key_down(event){
    // easter egg
    var k_code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    last_keys.push(event.which);
    while (last_keys.length > 10) last_keys.shift();
    if (last_keys.length == 10){
        var k_is_valid = true;
        for (var i = 0; i < 10; ++i){
            if (k_code[i] != last_keys[i]){
                k_is_valid = false;
                break;
            }
        }
        if (k_is_valid){
            alert("You breaked the master code - you sneaky hacker. We'll flood your mailbox with yellow bananas. Your database will be dropped, your client destroyed. All your base are belong to us!!!");
        }
    }    
    if (!pathway_is_loaded) return;
    
    if(event.which == 45){
        zoom_in_out(1, 0);
        draw();
    }
    else if (event.which == 43){
        zoom_in_out(0, 0);
        draw();
    }
    if (administration){
        event_key_down = (event.which == 17);
    }
    
}


function key_up(event){    
    if (!pathway_is_loaded) return;
    
    if (event_moving_node) update_node(event);
    event_key_down = false;
    if (event.buttons == 2 && !moved){
        show_custom_menu();
    }
}


function update_node(event) {
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, event);
    var x = Math.round(Math.floor((highlight_element.x - null_x) / factor) / base_grid) * base_grid;
    var y = Math.round(Math.floor((highlight_element.y - null_y) / factor) / base_grid) * base_grid;
    
    
    var xmlhttp = new XMLHttpRequest();
    var request = "update_node.py?id=";
    request += highlight_element.id;
    request += "&x=";
    request += x;
    request += "&y=";
    request += y;
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
    event_moving_node = false;
}


function mouse_up_listener(event){
    if (!pathway_is_loaded) return;
    
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, event);
    c.style.cursor = "auto";
    if (highlight_element) highlight_element.mouse_up(res);
    if (event_moving_node) update_node(event);
}


function download_assay(){
    var proteins = "";
    for (var i = 0; i < data.length; ++i){
        for (var j = 0; j < data[i].proteins.length; ++j){
            if (data[i].proteins[j].marked){
                if (proteins.length) proteins += ":";
                proteins += data[i].proteins[j].id.toString();
            }
        }
    }
    if (!proteins.length){
        alert("No proteins are selected.");
        return;
    }
    
    
    var xmlhttp_c = new XMLHttpRequest();
    xmlhttp_c.onreadystatechange = function() {
        if (xmlhttp_c.readyState == 4 && xmlhttp_c.status == 200) {
            var receive = xmlhttp_c.responseText;
        }
    }
    xmlhttp_c.open("GET", "set-counter.py?counter=download", true);
    xmlhttp_c.send();
    
    document.getElementById("downloadbackground").style.display = "inline";
    document.getElementById("download").style.display = "inline";
    document.getElementById("renderarea").style.filter = "blur(5px)";
    document.getElementById("navigation").style.filter = "blur(5px)";
    
    html = "<table width=100% height=100%><tr><td align=\"center\">";
    html += "<img src=\"ajax-loader.gif\"></td></tr></table>"
    document.getElementById("download").innerHTML = html;
    
    var xmlhttp = new XMLHttpRequest();
    var download_link = "";
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            download_link = xmlhttp.responseText;
            html = "<table width=100% height=100%><tr><td align=\"center\">";
            html += "<a href=\"" + download_link + "\">download assay</a>";
            html += "<p>&nbsp;<p>";
	    html += "Extracted .fasta and .blib file can be easily imported in <a href=\"https://skyline.gs.washington.edu/labkey/project/home/software/Skyline/begin.view\" target=\"_blank\">Skyline</a>.";
	    html += "<p>&nbsp;<p>";
            html += "<button onclick=\"hide_download();\">Close Window</button></td></tr></table>"
            document.getElementById("download").innerHTML = html;
        }
    }
    xmlhttp.open("GET", "prepare-download.py?proteins=" + proteins, true);
    xmlhttp.send();
}



function hide_download (){
    document.getElementById("downloadbackground").style.display = "none";
    document.getElementById("download").style.display = "none";
    document.getElementById("renderarea").style.filter = "none";
    document.getElementById("navigation").style.filter = "none";
}


function charge_plus(x){
    var plusses = "";
    for (var i = 0; i < x; ++i) plusses += "+";
    return plusses;
}


function check_spectra(){
    document.getElementById("check_spectra_background").style.display = "inline";
    document.getElementById("check_spectra").style.display = "inline";
    document.getElementById("renderarea").style.filter = "blur(5px)";
    document.getElementById("navigation").style.filter = "blur(5px)";
    resize_ms_view();
    spectrum_loaded = false;
    draw_spectrum();
    
    document.getElementById("error_value").value = (document.getElementById("radio_ppm").checked ? tolerance_relative : tolerance_absolute);
    
    // triangle right: 9656
    // triangle down: 9662
    
    var inner_html = "<table width=\"100%\" spacing=\"2\">";
    var spectra_content = [];
    for (var i = 0; i < data.length; ++i){
        for (var j = 0; j < data[i].proteins.length; ++j){
            if (data[i].proteins[j].marked){
                spectra_content.push([data[i].proteins[j].name, i, j]);
            }
        }
    }
    spectra_content.sort();
    var peps = 0;
    var specs = 0;
    var line = 0;
    var sign_right = String.fromCharCode(9656);
    var sign_down = String.fromCharCode(9662);
    for (var i = 0; i < spectra_content.length; ++i){
        var p = spectra_content[i][1];
        var pp = spectra_content[i][2];
        
        var bg_color = (line & 1) ? "#DDDDDD" : "white";
        ++line;
        inner_html += "<tr><td width=\"100%\" bgcolor=\"" + bg_color + "\" onclick=\"document.getElementById('protein_sign_" + i + "').innerHTML = (document.getElementById('peptide_" + peps + "').style.display == 'inline' ? '" + sign_right + "' : '" + sign_down + "'); document.getElementById('peptide_" + peps + "').style.display = (document.getElementById('peptide_" + peps + "').style.display == 'inline' ? 'none' : 'inline');\" style=\"cursor: default;\">&nbsp;<div style=\"display:inline; margin: 0px; padding: 0px;\" id=\"protein_sign_" + i + "\">" + sign_right + "</div>&nbsp;" + spectra_content[i][0] + " | " + data[p].proteins[pp].accession + "</td></tr>";
        
        inner_html += "<tr><td><table id='peptide_" + peps + "' style=\"display: none;\">";
        for (var j = 0; j < data[p].proteins[pp].peptides.length; ++j){
            var n_specs = data[p].proteins[pp].peptides[j].spectra.length;
            if (!n_specs) continue;
            inner_html += "<tr><td onclick=\"document.getElementById('peptide_sign_" + specs + "').innerHTML = (document.getElementById('spectrum_" + specs + "').style.display == 'inline' ? '" + sign_right + "' : '" + sign_down + "'); document.getElementById('spectrum_" + specs + "').style.display = (document.getElementById('spectrum_" + specs + "').style.display == 'inline' ? 'none' : 'inline');\" style=\"cursor: default; color: " + (n_specs ? "black" : disabled_text_color) + ";\">&nbsp;&nbsp;&nbsp;&nbsp;<div style=\"display:inline; margin: 0px; padding: 0px;\" id=\"peptide_sign_" + specs + "\">" + sign_right + "</div>&nbsp;" + data[p].proteins[pp].peptides[j].peptide_seq + "</td></tr>";
            
            inner_html += "<tr><td><table id='spectrum_" + specs + "' style=\"display: none;\">";
            for (var k = 0; k < n_specs; ++k){
                inner_html += "<tr><td onclick=\"load_spectrum(" + data[p].proteins[pp].peptides[j].spectra[k]['id'] + ");\" style=\"cursor: default;\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + data[p].proteins[pp].peptides[j].spectra[k]['mass'] + charge_plus(data[p].proteins[pp].peptides[j].spectra[k]['charge']) + "</td></tr>";
            }
            inner_html += "</table></td></tr>";
            ++specs;
        }
        inner_html += "</table></td></tr>";
        ++peps;
    }
    inner_html += "</table>";
    
    document.getElementById("spectra_panel").innerHTML = inner_html;
}



function hide_check_spectra (){
    document.getElementById("check_spectra_background").style.display = "none";
    document.getElementById("check_spectra").style.display = "none";
    document.getElementById("renderarea").style.filter = "none";
    document.getElementById("navigation").style.filter = "none";
}


function show_search(){
    var search_text = document.getElementById("search_field").value;
    var len_p = search_text.length;
    if (len_p > 2 && document.getElementById("search_results").innerHTML.length){
        document.getElementById("search_results").style.display = "inline";
        document.getElementById("search_background").style.display = "inline";
    }
}

function start_search(){
    var search_text = document.getElementById("search_field").value;
    var len_p = search_text.length;
    if (len_p > 2){
        var masks = new Array(128).fill(0);
        
        var lower = search_text.toLowerCase();
        var upper = search_text.toUpperCase();
        
        
        var bit = 1;
        for (var i = 0; i < len_p; ++i){
            masks[lower.charCodeAt(i)] |= bit;
            masks[upper.charCodeAt(i)] |= bit;
            if (lower.charAt(i) == '-') masks[' '.charCodeAt(0)] |= bit;
            if (lower.charAt(i) == ' ') masks['-'.charCodeAt(0)] |= bit;
            if (lower.charAt(i) == '.') masks[','.charCodeAt(0)] |= bit;
            if (lower.charAt(i) == ',') masks['.'.charCodeAt(0)] |= bit;
            bit <<= 1;
        }
        
        var accept = 1 << (len_p - 1);
        var results = [];
        for (var i = 0; i < data.length; ++i){
            var r = data[i].search(len_p, accept, masks);
            if (r.length){
                results = results.concat(r);
            }
        }
        
        if (results.length){
            document.getElementById("search_results").style.display = "inline";
            document.getElementById("search_background").style.display = "inline";
            var rect = document.getElementById('search_field_nav').getBoundingClientRect();
            document.getElementById("search_results").style.top = (rect.top + document.getElementById('search_field_nav').offsetHeight).toString() + "px";
            document.getElementById("search_results").style.left = (rect.left).toString() + "px";
            var inner_html = "<table>";
            for (var i = 0; i < results.length; ++i){
                var t1 = "<font color=\"" + disabled_text_color + "\">" + results[i][0].substring(0, results[i][1]) + "</font>";
                var t2 = results[i][0].substring(results[i][1], results[i][1] + len_p);
                var t3 = "<font color=\"" + disabled_text_color + "\">" + results[i][0].substring(results[i][1] + len_p, results[i][0].length) + "</font>";
                inner_html += "<tr><td class=\"single_search_result\" onclick=\"highlight_protein(" + results[i][2] + ", " + results[i][3] + ");\">" + t1 + t2 + t3 + "</td></tr>";
            }
            inner_html += "</table>";
            document.getElementById("search_results").innerHTML = inner_html;
        }
        else {
            hide_search();
        }
    }
    else {
        hide_search();
    }
}





function highlight_protein(node_id, prot_id){
    
    hide_search();
    var progress = 0;
    var steps = 30;
    var time = 3; // seconds
    var std_dev = time / 6.;
    var c = document.getElementById("renderarea");
    document.getElementById("animation_background").style.display = "inline";
    var x = data[data_ref[node_id]].x;
    var y = data[data_ref[node_id]].y;
    var width  = window.innerWidth * 0.5;
    var height = window.innerHeight * 0.5;
    var scale = Math.pow(Math.pow(scaling, highlight_zoom - zoom), 1 / (time * steps));
    var zoom_scale = (highlight_zoom - zoom) / (time * steps);
    
    var moving = setInterval(function(){
        if (progress >= time) {
            zoom = highlight_zoom;
            var l = 0, ii = 0;
            var highlighting = setInterval(function(){
                if (ii >= 3){
                    clearInterval (highlighting);
                }
                else {
                    data[data_ref[node_id]].highlight = (l < 25);
                    draw();
                    l += 1;
                    if (l >= 50){
                        l = 0; ii += 1;
                    }
                }
            }, 20);
            document.getElementById("animation_background").style.display = "none";
            clearInterval (moving);
            zoom = highlight_zoom;
            factor = Math.pow(scaling, zoom);
            font_size = text_size * factor;
            radius = metabolite_radius * factor;
            draw();
            
        }
        else {
            var split = Math.exp(-0.5 * sq((progress - time * 0.5) / std_dev)) / (Math.sqrt(2 * Math.PI) * std_dev) / steps;
            for (var i = 0; i < data.length; ++i){
                data[i].width *= scale;
                data[i].height *= scale;
                data[i].orig_height *= scale;
                data[i].x = width + scale * (data[i].x + split * (width - x) - width);
                data[i].y = height + scale * (data[i].y + split * (height - y) - height);
            }
            for (var i = 0; i < edges.length; ++i){
                for (var j = 0; j < edges[i].point_list.length; ++j){
                    edges[i].point_list[j].x = width + scale * (edges[i].point_list[j].x + split * (width - x) - width);
                    edges[i].point_list[j].y = height + scale * (edges[i].point_list[j].y + split * (height - y) - height);
                }
            }
            infobox.x = width + scale * (infobox.x + split * (width - x) - width);
            infobox.y = height + scale * (infobox.y + split * (height - y) - height);
            x = width + scale * (x - width);
            y = height + scale * (y - height);
            null_x = width + scale * (null_x - width);
            null_y = height + scale * (null_y - height);
            boundaries[0] = width + scale * (boundaries[0] + split * (width - x) - width);
            boundaries[1] = height + scale * (boundaries[1] + split * (height - y) - height);
            boundaries[2] *= scale;
            boundaries[3] *= scale;
            
            var rect = c.getBoundingClientRect();
            mouse_move_listener(
            {
                clientX: mouse_x + rect.left,
                clientY: mouse_y + rect.top
            });
            
            zoom += zoom_scale;
            factor = Math.pow(scaling, zoom);
            font_size = text_size * factor;
            radius = metabolite_radius * factor;
            
            draw();
            progress += 1 / steps;
        }
    }, steps);
    
}


function hide_search(){
    document.getElementById("search_results").style.display = "none";
    document.getElementById("search_background").style.display = "none";
}


function select_species(){
    if (document.getElementById("select_species").style.display == "inline"){
        hide_select_species();
    }
    else {
        var rect = document.getElementById('select_species_nav').getBoundingClientRect();
        document.getElementById("select_species").style.top = (rect.top + document.getElementById('select_species_nav').offsetHeight).toString() + "px";
        document.getElementById("select_species").style.left = (rect.left).toString() + "px";
        document.getElementById("select_species").style.display = "inline";
        document.getElementById("select_species_background").style.display = "inline";
    }
}


function hide_select_species(){
    document.getElementById("select_species").style.display = "none";
    document.getElementById("select_species_background").style.display = "none";
}


function select_pathway(){
    if (document.getElementById("select_pathway").style.display == "inline"){
        hide_select_pathway();
    }
    else {
        var rect = document.getElementById('select_pathway_nav').getBoundingClientRect();
        document.getElementById("select_pathway").style.top = (rect.top + document.getElementById('select_pathway_nav').offsetHeight).toString() + "px";
        document.getElementById("select_pathway").style.left = (rect.left).toString() + "px";
        document.getElementById("select_pathway").style.display = "inline";
        document.getElementById("select_pathway_background").style.display = "inline";
    }
}


function hide_select_pathway(){
    document.getElementById("select_pathway").style.display = "none";
    document.getElementById("select_pathway_background").style.display = "none";
}

function close_navigation(nav){
    switch (nav){
        case 1:
            hide_select_species();
            break;
        case 2:
            hide_select_pathway();
            break;
        default:
            hide_select_species();
            hide_select_pathway();
            break;
    }
}


function prepare_infobox(prot){
    infobox.visible = false;
    var steps = 24;
    var time = 1; // seconds
    
    unTip();
    var he = highlight_element;
    var xy = he.get_position(prot);
    var x = xy[0];
    var y = xy[1];
    
    var progress = 0;
    var width  = window.innerWidth * 0.5;
    var height = window.innerHeight * 0.5;
    var std_dev = time / 6.;
    var inv_steps = 1. / steps;
    document.getElementById("animation_background").style.display = "inline";
    var c = document.getElementById("renderarea");
    
    var moving = setInterval(function(){
        if (progress >= time) {
            clearInterval (moving);
            document.getElementById("animation_background").style.display = "none";
            infobox.visible = true;
            var xy = he.get_position(prot);
            infobox.create(xy[0], xy[1], data_ref[he.id], prot);
            he.highlight = false;
            he = 0;
            draw();
        }
        else {
            var split = Math.exp(-0.5 * sq((progress - time * 0.5) / std_dev)) / (Math.sqrt(2 * Math.PI) * std_dev) * inv_steps;
            for (var i = 0; i < data.length; ++i){
                data[i].x += split * (width - x);
                data[i].y += split * (height - y);
            }
            for (var i = 0; i < edges.length; ++i){
                for (var j = 0; j < edges[i].point_list.length; ++j){
                    edges[i].point_list[j].x += split * (width - x);
                    edges[i].point_list[j].y += split * (height - y);
                }
            }
            null_x += split * (width - x);
            null_y += split * (height - y);
            boundaries[0] += split * (width - x);
            boundaries[1] += split * (height - y);
            draw();
            
            var rect = c.getBoundingClientRect();
            mouse_move_listener(
            {
                clientX: mouse_x + rect.left,
                clientY: mouse_y + rect.top
            });
            
            progress += inv_steps;
        }
    }, steps);
}



document.addEventListener('DOMContentLoaded', init, false);
