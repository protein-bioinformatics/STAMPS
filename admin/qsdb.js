function init(){
    
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var receive = xmlhttp.responseText;
        }
    }
    //xmlhttp.open("GET", "set-counter.py?counter=request", true);
    xmlhttp.open("GET", "/qsdb/cgi-bin/set-counter.bin?counter=request", true);
    xmlhttp.send();
    
    var xmlhttp_pw = new XMLHttpRequest();
    xmlhttp_pw.onreadystatechange = function() {
        if (xmlhttp_pw.readyState == 4 && xmlhttp_pw.status == 200) {
            pathways = JSON.parse(xmlhttp_pw.responseText);
            set_pathway_menu();
        }
    }
    
    xmlhttp_pw.open("GET", "/qsdb/cgi-bin/get-pathways.bin", true);
    xmlhttp_pw.send();
    
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    
    document.addEventListener('keydown', key_down, false);
    document.addEventListener('keyup', key_up, false);
    document.getElementById("search_background").addEventListener("click", hide_search, false);
    document.getElementById("select_species_background").addEventListener("click", hide_select_species, false);
    document.getElementById("select_pathway_background").addEventListener("click", hide_select_pathway, false);
    document.getElementById("filter_panel_background").addEventListener("click", hide_filter_panel, false);
    document.getElementById("menubackground").addEventListener("click", hide_custom_menu, false);
    document.getElementById("managementbackground").addEventListener("click", hide_management, false);
    
    window.addEventListener('resize', resize_ms_view, false);
    document.getElementById("msarea").addEventListener("mousewheel", view_mouse_wheel_listener, false);
    document.getElementById("msarea").addEventListener('DOMMouseScroll', view_mouse_wheel_listener, false);
    
    change_pathway(0);
    
    
    
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    
    
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
    xmlhttp.open("GET", "/qsdb/cgi-bin/get-proteins.py", false);
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
        inner_html += "<td align='right'><img src='/qsdb/images/delete.png' width=24 /></td></tr></table>";
        inner_html += "<div id='managementtable_item" + i +  "' style='display: none;'>";
        inner_html += "<table width='80%'><tr><td width='20%'>Name: </td><td><input size=100 id=\"name" + i + "\" value=\"" + proteins[i]['name'] + "\"></td></tr>";
        inner_html += "<tr><td>Definition: </td><td><input size=100 id=\"definition" + i + "\" value=\"" + proteins[i]['definition'] + "\"></td></tr>";
        inner_html += "<tr><td>KEGG URL: </td><td><input size=100 id=\"kegg_link" + i + "\" value=\"" + proteins[i]['kegg_link'] + "\"></td></tr>";
        inner_html += "<tr><td>UniProt URL: </td><td><input size=100 id=\"uniprot_link" + i + "\" value=\"" + proteins[i]['uniprot_link'] + "\"></td></tr></table>";
        inner_html += "</div></td></tr>";
    }
    inner_html += "</table>";
    
    document.getElementById("management").style.display = "inline";
    document.getElementById("management").innerHTML = "<div style='position: absolute; top: 2%; left: 5%' onclick='alert(\"huhu\");'><table><tr><td><img src='/qsdb/images/add.png' width='24'>&nbsp;&nbsp;</td><td> New protein</td></tr></table></div><div id='managementtable' class='managementtable'></div><div style='position: absolute; top: 92%; left: 90%;'><button onclick='hide_management(\"event\");'>Close</button></div>";
    document.getElementById("managementtable").innerHTML = inner_html;
    document.getElementById("managementtable").scrollTo(0, 0);
}


function hide_management(event){
    document.getElementById("managementbackground").style.display = "none";
    document.getElementById("management").style.display = "none";
    document.getElementById("renderarea").style.filter = "none";
}


function show_custom_menu(event){
    var menu_points = new Array();
    unTip();
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
}


function hide_custom_menu(event){
    document.getElementById("menubackground").style.display = "none";
    document.getElementById("custommenu").style.display = "none";
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
    if (e.buttons & 2){
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
            else {
                event_moving_node = true;
                node_move_x += shift_x;
                node_move_y += shift_y;
                highlight_element.x = Math.floor(node_move_x - (1000 * (node_move_x - null_x) % grid) / 1000.);
                highlight_element.y = Math.floor(node_move_y - (1000 * (node_move_y - null_y) % grid) / 1000.);
                compute_edges();
                assemble_elements();
            }
        }
        draw();
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
    if(highlight_element && highlight_element.tipp && !event_key_down) Tip(e, highlight_element.id + " " + highlight_element.name);
    else unTip();
    
}


function update_node(event) {
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, event);
    var x = Math.round(Math.floor((highlight_element.x - null_x) / factor) / base_grid) * base_grid;
    var y = Math.round(Math.floor((highlight_element.y - null_y) / factor) / base_grid) * base_grid;
    
    
    var xmlhttp = new XMLHttpRequest();
    var request = "/qsdb/cgi-bin/update_node.py?id=";
    request += highlight_element.id;
    request += "&x=";
    request += x;
    request += "&y=";
    request += y;
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
    event_moving_node = false;
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
    event_key_down = (event.which == 17);
    
}



edge.prototype.mouse_down = function(mouse, key){
    if ((key != 1 && key != 3)) return false;
    
    var xmlhttp = new XMLHttpRequest();
    var request = "/qsdb/cgi-bin/update_edge.py?id=";
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
    assemble_elements();
    draw();
}


document.addEventListener('DOMContentLoaded', init, false);
