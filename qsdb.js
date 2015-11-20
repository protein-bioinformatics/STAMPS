moved = false;
HTTP_GET_VARS = [];
current_pathway = 1;
mouse_down = false;
highlight = -1;
offsetX = 0;
offsetY = 0;
null_x = 0;
null_y = 0;
data = [];
data_ref = [];
nodes = null;
event_moving_node = false;
event_key_down = false;
node_move_x = 0;
node_move_y = 0;
edges = [];

scaling = 1.4;
zoom = 5;
start_zoom = 5;
max_zoom = 10;
base_grid = 25;
max_protein_line_number = 3;
metabolite_radius = 10;
arrow_length = 10;
round_rect_radius = 10;
text_size = 15;
anchors = ['left', 'top', 'right', 'bottom'];
administration = false;
on_slide = false;


line_width = 4;
protein_stroke_color = "#f69301";
protein_fill_color = "#fff6d5";
metabolite_stroke_color = "f#69301";
metabolite_fill_color = "white";
pathway_stroke_color = "#f69301";
pathway_fill_color = "white";
edge_color = "#f69301";
disabled_text_color = "#bbbbbb";
disabled_fill_color = "#cccccc";
text_color = "black";
slide_color = "#5792da";
slide_width = 2;
slide_bullet = 4;



function debug(text){
    document.getElementById("hint").innerHTML = text;
}


CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height) {
    var radius = Math.floor(round_rect_radius * Math.pow(scaling, zoom - start_zoom));
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    this.fill();
    this.stroke();
}



CanvasRenderingContext2D.prototype.arrow = function (p1_x, p1_y, p2_x, p2_y, factor, head) {
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



function draw(){
    var c = document.getElementById("renderarea");
    
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    var factor = Math.pow(scaling, zoom - start_zoom);
    //console.log(scaling + " " + (zoom - start_zoom));
    
    var font_size = text_size * factor;
    var radius = metabolite_radius * factor;
    
    //draw nodes
    for (var i = 0; i < data.length; ++i){
        data[i].draw(font_size, factor, radius);
    }
    // draw edges
    for (var i = 0; i < edges.length; ++i){
        edges[i].draw(factor);
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
    
    
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    
    
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
    c.addEventListener("mousewheel", mouse_wheel_listener, false);
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
    
    load_data(false);
}



function reset_view(){
    zoom = start_zoom;
    null_x = 0;
    null_y = 0;    
}



function load_data(reload){
    if (!reload){
        zoom = start_zoom;
        null_x = 0;
        null_y = 0;
    }
    
    var factor = Math.pow(scaling, zoom - start_zoom);
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    
    var species = new Array();
    if(document.getElementById("species_mouse").checked) species.push("mouse");
    //if(document.getElementById("species_human").checked) species.push("human");
    var species_string = species.join(":");
    
    // get data information
    data = new Array();
    data_ref = new Array();
    var tmp_data = 0;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            tmp_data = JSON.parse(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", "get-qsdbdata.py?request=qsdbdata&pathway=" + current_pathway + "&species=" + species_string, false);
    xmlhttp.send();
    
    var x_mean = 0, y_mean = 0;
    var x_min = 1e100, x_max = -1e100;
    var y_min = 1e100, y_max = -1e100;
    for (var i = 0; i < tmp_data.length; ++i){
        data.push(new node(tmp_data[i], c));
        x_mean += data[i].x;
        y_mean += data[i].y;
        x_min = Math.min(x_min, data[i].x);
        x_max = Math.max(x_max, data[i].x);
        y_min = Math.min(y_min, data[i].y);
        y_max = Math.max(y_max, data[i].y);
        data_ref[data[i]['id']] = i;
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
        x_mean /= data.length;
        y_mean /= data.length;
        for (var i = 0; i < data.length; ++i){
            data[i].x += ctx.canvas.width / 2 - x_mean;
            data[i].y += ctx.canvas.height / 2 - y_mean;
        }
        null_x += ctx.canvas.width / 2 - x_mean;
        null_y += ctx.canvas.height / 2 - y_mean;
    
        /*
        if ((x_max - x_min + 200) / ctx.canvas.width > (y_max - y_min + 200) / ctx.canvas.height){
            scaling = Math.pow((x_max - x_min + 200) / ctx.canvas.width, 0.25);
        }
        else {
            scaling = Math.pow((y_max - y_min + 200) / ctx.canvas.height, 0.25);
        }
        */
        if ((x_max - x_min + 200) / ctx.canvas.width > (y_max - y_min + 200) / ctx.canvas.height){
            start_zoom = Math.ceil(Math.log((x_max - x_min + 200) / ctx.canvas.width) / Math.log(scaling)) + 1;
        }
        else {
            start_zoom = Math.ceil(Math.log((y_max - y_min + 200) / ctx.canvas.height) / Math.log(scaling)) + 1;
        }
        zoom = start_zoom;        
    }
    
    
    // get nodes information
    var xmlhttp2 = new XMLHttpRequest();
    xmlhttp2.onreadystatechange = function() {
        if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
            nodes = JSON.parse(xmlhttp2.responseText);
        }
    }
    xmlhttp2.open("GET", "get-edgedata.py?pathway=" + current_pathway, false);
    xmlhttp2.send();
    compute_edges();
    draw();
}


function compute_edges(){
    edges = new Array();
    var c = document.getElementById("renderarea");
    var factor = Math.pow(scaling, zoom - start_zoom);
    var radius = Math.floor(metabolite_radius * factor);
    var connections = new Array();
    var nodes_anchors = new Array();
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
                connections.push([node_id, nodes[i]['anchor_in'], metabolite_id, nodes[i]['reagents'][j]['anchor'], reversible]);
                nodes_anchors[node_id][nodes[i]['anchor_in']].push([metabolite_id, connections.length - 1, angle_node]);
            }
            else{
                var angle_node = compute_angle(data[node_id].x, data[node_id].y, data[metabolite_id].x, data[metabolite_id].y, nodes[i]['anchor_out']);
                connections.push([node_id, nodes[i]['anchor_out'], metabolite_id, nodes[i]['reagents'][j]['anchor'], true]);
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
                    for (var k = 0; k < len - 1; ++k){
                        if (node_p[k][2] > node_p[k + 1][2]){
                            var tmp = node_p[k];
                            node_p[k] = node_p[k + 1];
                            node_p[k + 1] = tmp;
                        }
                    }
                }
            }
        }
    }
    
    
    for (var i = 0; i < connections.length; ++i){
        var node_id = connections[i][0];
        var node_anchor = connections[i][1];
        var node_len = nodes_anchors[node_id][node_anchor].length;
        var metabolite_id = connections[i][2];
        var metabolite_anchor = connections[i][3];
        var metabolite_len = nodes_anchors[metabolite_id][metabolite_anchor].length;
        var has_head = connections[i][4];
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
        switch (metabolite_anchor){
            case "top":
                end_y -= radius;
                var w = 2 * radius * (-1 / metabolite_len + 1);
                end_x -= w / 2;
                if (metabolite_len > 1){
                    end_x += w / (metabolite_len - 1) * metabolite_pos;
                }
                break;
            case "bottom":
                end_y += radius;
                var w = 2 * radius * (-1 / metabolite_len + 1);
                end_x += w / 2;
                if (metabolite_len > 1){
                    end_x -= w / (metabolite_len - 1) * metabolite_pos;
                }
                break;
            case "left":
                end_x -= radius;
                var h = 2 * radius * (-1 / metabolite_len + 1);
                end_y += h / 2;
                if (metabolite_len > 1){
                    end_y -= h / (metabolite_len - 1) * metabolite_pos;
                }
                break;
            case "right":
                end_x += radius;
                var h = 2 * radius * (-1 / metabolite_len + 1);
                end_y -= h / 2;
                if (metabolite_len > 1){
                    end_y += h / (metabolite_len - 1) * metabolite_pos;
                }
                break;
        }
        
        if ((node_anchor == 'top') || (node_anchor == 'bottom')){
            if (node_anchor == 'top'){
                start_y -= node_height / 2;
            }
            else {
                start_y += node_height / 2;
            }
        }
        if ((node_anchor == 'left') || (node_anchor == 'right')){
            if (node_anchor == 'left'){
                start_x -= node_width / 2;
            }
            else {
                start_x += node_width / 2;
            }
        }
        //if (node_id == data_ref[145] && metabolite_id == data_ref[162]){
        edges.push(new edge(c, start_x, start_y, node_anchor, data[node_id], end_x, end_y, metabolite_anchor, data[metabolite_id], connections[i][4]));
        //}
    }
    
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
    if (highlight == -1){
        menu_points.push(["Insert protein", "debug", 0, 1]);
        menu_points.push(["Insert metabolite", "debug", 0, 1]);
        menu_points.push(["Insert pathway", "debug", 0, 1]);
        menu_points.push(["Manage reagents", "show_management", 0, 1]);
    }
    else if (data[highlight].type == "metabolite"){
        menu_points.push(["Connect metabolite", "debug", 1, 1]);
        menu_points.push(["Edit metabolite", "debug", 1, 1]);
        menu_points.push(["Delete metabolite", "debug", 1, 1]);
    }
    else if (data[highlight].type == "protein"){
        menu_points.push(["Edit protein(s)", "debug", 1, 1]);
        var enable_del_reaction = false;
        for (var i = 0; i < nodes.length; ++i){
            var node_id = data_ref[nodes[i]['node_id']];
            if (data_ref[nodes[i]['node_id']] == highlight){
                enable_del_reaction = true;
                break;
            }
        }
        menu_points.push(["Delete reaction", "debug", 1, enable_del_reaction]);
        menu_points.push(["Delete protein", "debug", 1, 1]);
    }
    else if (data[highlight].type == "pathway"){
        menu_points.push(["Edit pathway", "debug", 1, 1]);
        menu_points.push(["Delete pathway", "debug", 1, 1]);
    }
    
    var inner_html = "<table id='custommenutable' class='custommenutable'>";
    for (var i = 0; i < menu_points.length; ++i){
        if (menu_points[i][3]){
            var menu_command = menu_points[i][1] + "(";
            if (menu_points[i][2]) menu_command += data[highlight].id;
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
}


function hide_custom_menu(event){
    document.getElementById("menubackground").style.display = "none";
    document.getElementById("custommenu").style.display = "none";
}


function mouse_wheel_listener(e){
    var direction = (1 - 2 * (e.detail >= 0));
    if (zoom + direction < 1 || max_zoom < zoom + direction)
        return;
    zoom += direction;
    var scale = scaling;
    if (e.detail >= 0) scale = 1. / scale;
    
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, e);
    for (var i = 0; i < data.length; ++i){
        data[i].width *= scale;
        //if (i == 49) console.log(data[i].width);
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
    null_x = res.x + scale * (null_x - res.x);
    null_y = res.y + scale * (null_y - res.y);
    //console.log(zoom + " " + data[data_ref[105]].width);
    draw();
}


function mouse_dblclick_listener(e){
    if (!moved){
        if (highlight >= 0 && data[highlight].type == 'protein'){
            var c = document.getElementById("renderarea");
            var res = get_mouse_pos(c, e);
            data[highlight].dblcheck_protein_marked(res, Math.pow(scaling, zoom - start_zoom));
            draw();
        }
    }
    moved = false;
}



function mouse_click_listener(e){
    if (!moved){
        if (highlight != -1){
            /*
            if (data[highlight].type == 'pathway'){
                change_pathway(data[highlight].pathway_ref);
            }
            */
        }
        if (highlight >= 0 && data[highlight].type == 'protein'){
            var c = document.getElementById("renderarea");
            var res = get_mouse_pos(c, e);
            data[highlight].check_protein_marked(res, Math.pow(scaling, zoom - start_zoom));
            draw();
        }
    }
    moved = false;
}


function change_pathway(p){
    hide_select_pathway();
    current_pathway = p;
    reset_view();
    load_data();
}


function mouse_down_listener(e){
    if (e.which != 1){
        return;
    }
    mouse_down = true;
    if (highlight >= 0){
        node_move_x = data[highlight].x;
        node_move_y = data[highlight].y;
    }
    on_slide = -1;
    var factor = Math.pow(scaling, zoom - start_zoom);
    for (var i = 0; i < data.length; ++i){
        if (data[i].is_on_slide(res, factor)){
            on_slide = i;
            break;
        }
    }
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, e);
    offsetX = res.x;
    offsetY = res.y;
}


function mouse_move_listener(e){
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    res = get_mouse_pos(c, e);
    var factor = Math.pow(scaling, zoom - start_zoom);
    var grid = Math.floor(base_grid * factor * 1000);
    
    
    // shift all nodes
    if (mouse_down){
        if (on_slide > -1){
            data[on_slide].change_slider(res.y, factor);
        }
        else {
        
            var shift_x = res.x - offsetX;
            var shift_y = res.y - offsetY;
            if (shift_x != 0 || shift_y != 0){
                moved = true;
            }
            
            
            if (!event_key_down || highlight == -1){
                for (var i = 0; i < data.length; ++i){
                    data[i].x += res.x - offsetX;
                    data[i].y += res.y - offsetY;
                }
                for (var i = 0; i < edges.length; ++i){
                    for (var j = 0; j < edges[i].point_list.length; ++j){
                        edges[i].point_list[j].x += res.x - offsetX;
                        edges[i].point_list[j].y += res.y - offsetY;
                    }
                }
                null_x += res.x - offsetX;
                null_y += res.y - offsetY;
            }
            else if (administration) {
                event_moving_node = true;
                node_move_x += res.x - offsetX;
                node_move_y += res.y - offsetY;
                data[highlight].x = Math.floor(node_move_x - (1000 * (node_move_x - null_x) % grid) / 1000.);
                data[highlight].y = Math.floor(node_move_y - (1000 * (node_move_y - null_y) % grid) / 1000.);
                compute_edges();
            }
        }
        
        draw();
        offsetX = res.x;
        offsetY = res.y;
    }
    
    
    
    // find active node
    var brk = false;
    var newhighlight = -1;
    var radius = Math.floor(metabolite_radius * Math.pow(scaling, zoom - start_zoom));
    for (var i = 0; i < data.length && !brk; ++i){
        if (data[i].is_mouse_over(res.x, res.y, radius)){
            newhighlight = i;
            brk = true;  
        }
    }
    if (highlight != newhighlight && !event_moving_node){
        for (var i = 0; i < data.length; ++i){
            data[i].highlight = (i == newhighlight);
        }
        highlight = newhighlight;
        draw();
    }
    if(highlight >= 0 && (true || data[highlight].type == "metabolite")) Tip(e, data[highlight].id + " " + data[highlight].name);
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
    if (administration){
        event_key_down = (event.which == 17);
    }
}


function key_up(event){
    if (event_moving_node) update_node(event);
    event_key_down = false;
    if (event.buttons == 2 && !moved){
        show_custom_menu();
    }
}

function update_node(event) {
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, event);
    var factor = Math.pow(scaling, zoom - start_zoom);
    var x = Math.floor((data[highlight].x - null_x) / factor);
    var y = Math.floor((data[highlight].y - null_y) / factor);
    var xmlhttp = new XMLHttpRequest();
    var request = "update_node.py?id=";
    request += data[highlight].id;
    request += "&x=";
    request += x;
    request += "&y=";
    request += y;
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
    event_moving_node = false;
}

function mouse_up_listener(event){
    if (event_moving_node) update_node(event);
    mouse_down = false;
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
    for (var i = 0; i < spectra_content.length; ++i){
        var p = spectra_content[i][1];
        var pp = spectra_content[i][2];
        inner_html += "<tr><td width=\"100%\" onclick=\"document.getElementById('peptide_" + peps + "').style.display = (document.getElementById('peptide_" + peps + "').style.display == 'inline' ? 'none' : 'inline');\" style=\"cursor: default;\">&nbsp;" + String.fromCharCode(9656) + "&nbsp;" + spectra_content[i][0] + " | " + data[p].proteins[pp].accession + "</td></tr>";
        
        inner_html += "<tr><td><table id='peptide_" + peps + "' style=\"display: none;\">";
        for (var j = 0; j < data[p].proteins[pp].peptides.length; ++j){
            var n_specs = data[p].proteins[pp].peptides[j].spectra.length;
            inner_html += "<tr><td onclick=\"document.getElementById('spectrum_" + specs + "').style.display = (document.getElementById('spectrum_" + specs + "').style.display == 'inline' ? 'none' : 'inline');\" style=\"cursor: default; color: " + (n_specs ? "black" : disabled_text_color) + ";\">&nbsp;&nbsp;&nbsp;&nbsp;" + String.fromCharCode(9656) + "&nbsp;" + data[p].proteins[pp].peptides[j].peptide_seq + "</td></tr>";
            
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
    var steps = 24;
    var time = 3; // seconds
    document.getElementById("animation_background").style.display = "inline";
    var x = data[data_ref[node_id]].x;
    var y = data[data_ref[node_id]].y;
    var width  = window.innerWidth * 0.5;
    var height = window.innerHeight * 0.5;
    var scale = Math.pow(Math.pow(scaling, 7 - zoom), 1 / (time * steps));
    var zoom_scale = Math.pow(7 / zoom, 1 / (time * steps));
    
    var moving = setInterval(function(){
        if (progress >= time) {
            zoom = 7;
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
            zoom = 7;
            draw();
            
        }
        else {
            var split = Math.exp(-0.5 * sq((progress - time * 0.5) / 0.5)) / (Math.sqrt(2 * Math.PI) * 0.5) / steps;
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
            x = width + scale * (x - width);
            y = height + scale * (y - height);
            null_x = width + scale * (null_x - width);
            null_y = height + scale * (null_y - height);
            zoom *= zoom_scale;
            
            
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





document.addEventListener('DOMContentLoaded', init, false);
