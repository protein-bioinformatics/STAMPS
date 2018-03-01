toolbox_states = {
    CREATE_PATHWAY: 0,
    CREATE_PROTEIN: 1,
    CREATE_METABOLITE: 2,
    CREATE_LABEL: 3,
    CREATE_MEMBRANE: 4,
    MOVE_ENTITY: 5,
    ROTATE_PATHWAY: 6,
    ROTATE_PROTEIN: 7,
    ROTATE_METABOLITE: 8,
    DRAW_EDGE: 9,
    CHANGE_EDGE: 10,
    DELETE_ENTRY: 11
};
toolbox_buttons = ["toolbox_button_create_pathway", "toolbox_button_create_protein", "toolbox_button_create_metabolite", "toolbox_button_create_label", "toolbox_button_create_membrane", "toolbox_button_move_entity", "toolbox_button_rotate_pathway_anchor", "toolbox_button_rotate_protein_anchor", "toolbox_button_rotate_metabolite_anchor", "toolbox_button_draw_edge", "toolbox_button_change_edge", "toolbox_button_delete_entity"];
toolbox_button_selected = -1;
entity_moving = -1;
tmp_element = -1;

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
            for (var i = 0; i < pathways.length; ++i){
                pathway_dict[pathways[i][0]] = i;
                var option = document.createElement("option");
                if (i == 0) option.selected = true;
                option.id = pathways[i][0];
                option.text = pathways[i][1];
                document.getElementById("editor_select_pathway_field").add(option);
            }
            set_pathway_menu();
        }
    }
    
    xmlhttp_pw.open("GET", "/qsdb/cgi-bin/get-pathways.bin", true);
    xmlhttp_pw.send();
    
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    
    document.addEventListener('keydown', key_down, false);
    //document.addEventListener('keyup', key_up, false);
    document.getElementById("search_background").addEventListener("click", hide_search, false);
    document.getElementById("select_species_background").addEventListener("click", hide_select_species, false);
    document.getElementById("select_pathway_background").addEventListener("click", hide_select_pathway, false);
    document.getElementById("filter_panel_background").addEventListener("click", hide_filter_panel, false);
    //document.getElementById("menubackground").addEventListener("click", hide_custom_menu, false);
    //document.getElementById("managementbackground").addEventListener("click", hide_management, false);
    document.getElementById("infobox_html_background").addEventListener("click", hide_infobox, false);
    
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
    c.addEventListener("mousewheel", mouse_wheel_listener, false);
    c.addEventListener('DOMMouseScroll', mouse_wheel_listener, false);
    
    
    
    c.oncontextmenu = function (event){
        return false;
    }
    document.getElementById("menubackground").oncontextmenu = function(event){
        hide_custom_menu(event);
        return false;        
    };
    document.getElementById("custommenu").oncontextmenu = function(event){
        return false;        
    };
    
    document.getElementById("toolbox").style.top = (document.getElementById("navigation").offsetHeight).toString() + "px";
    document.getElementById("renderarea").style.left = (document.getElementById("toolbox").offsetWidth).toString() + "px";
}



function mouse_click_listener(e){
    if (!pathway_is_loaded) return;
    
    if (toolbox_button_selected == toolbox_states.CREATE_PROTEIN || toolbox_button_selected == toolbox_states.CREATE_LABEL || toolbox_button_selected == toolbox_states.CREATE_MEMBRANE){
        var x = Math.round(Math.floor((tmp_element.x - null_x) / factor) / base_grid) * base_grid;
        var y = Math.round(Math.floor((tmp_element.y - null_y) / factor) / base_grid) * base_grid;
        var request = "";
        switch (toolbox_button_selected){
            case toolbox_states.CREATE_PROTEIN:
                request = "type=protein&pathway=" + current_pathway + "&x=" + x + "&y=" + y;
                break;
                
            case toolbox_states.CREATE_LABEL:
                request = "type=label&pathway=" + current_pathway + "&x=" + x + "&y=" + y;
                break;
                
            case toolbox_states.CREATE_MEMBRANE:
                request = "type=membrane&pathway=" + current_pathway + "&x=" + x + "&y=" + y;
                break;
        }
        var result = create_node(request);
        if (result){
            var ctx = document.getElementById("renderarea").getContext("2d");
            switch (toolbox_button_selected){
                    
                case toolbox_states.CREATE_PROTEIN:
                    tmp_element = new node({"x": "0", "y": "0", "t": "protein", "i": -1, "n": "-", "p": []}, ctx);
                    break;
                    
                case toolbox_states.CREATE_LABEL:
                    tmp_element = new node({"x": "0", "y": "0", "t": "label", "i": -1, "n": "undefined"}, ctx);
                    break;
                    
                case toolbox_states.CREATE_MEMBRANE:
                    tmp_element = new node({"x": "0", "y": "0", "t": "membrane", "i": -1, "n": "-"}, ctx);
                    break;
            }
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
        };
    }
    else if (toolbox_button_selected == toolbox_states.CREATE_PATHWAY){
        document.getElementById("editor_select_pathway").style.display = "inline";
        document.getElementById("waiting_background").style.display = "inline";
        document.getElementById("renderarea").style.filter = "blur(5px)";
        document.getElementById("toolbox").style.filter = "blur(5px)";
    }
    else if (highlight_element){
        var c = document.getElementById("renderarea");
        var res = get_mouse_pos(c, e);
        highlight_element.edit();
    }
}


function close_editor_select_pathway(){
    document.getElementById("editor_select_pathway").style.display = "none";
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}

function editor_create_pathway_node(){
    var obj = document.getElementById("editor_select_pathway_field");
    var pathway_ref = obj.options[obj.selectedIndex].id;
    
    
    var x = Math.round(Math.floor((tmp_element.x - null_x) / factor) / base_grid) * base_grid;
    var y = Math.round(Math.floor((tmp_element.y - null_y) / factor) / base_grid) * base_grid;
    var request = "type=pathway&pathway=" + current_pathway + "&pathway_ref=" + pathway_ref + "&x=" + x + "&y=" + y;
    var result = create_node(request);
    if (result){
        tmp_element.name = obj.options[obj.selectedIndex].text;
        tmp_element.pathway_ref = pathway_ref;
        tmp_element.setup_pathway_meta();
        draw();
        var ctx = document.getElementById("renderarea").getContext("2d");
        tmp_element = new node({"x": "0", "y": "0", "t": "pathway", "i": -1, "n": "undefined"}, ctx);
        tmp_element.scale(0, 0, factor);
        elements.push(tmp_element);
    };
}


function create_node(request){
    var xmlhttp = new XMLHttpRequest();
    request = "/qsdb/cgi-bin/create_node.py?" + request;
    var successful_creation = false;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            new_id = xmlhttp.responseText;
            if (0 <= new_id){
                tmp_element.id = new_id;
                successful_creation = true;
            }
            else {
                alert("An error has occured, the entity could not be added into the database. Please contact the administrator.");
            }
        }
    }
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
    return successful_creation;
}



function mouse_down_listener(e){
    if (!pathway_is_loaded) return;
    var c = document.getElementById("renderarea");
    res = get_mouse_pos(c, e);
    if (e.buttons & 2){
        if (highlight_element){
            highlight_element.mouse_down(res, e.which);
            node_move_x = highlight_element.x;
            node_move_y = highlight_element.y;        
        }
        offsetX = res.x;
        offsetY = res.y;
    }
    else if (e.buttons & 1){
        if (highlight_element){
            highlight_element.mouse_down(res, e.which);
            if (toolbox_button_selected == toolbox_states.MOVE_ENTITY){
                entity_moving = highlight_element;
                node_move_x = highlight_element.x;
                node_move_y = highlight_element.y;
            }
            offsetX = res.x;
            offsetY = res.y;
        }
    }
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
            
            
            if (!highlight_element){
                
                for (var i = 0; i < elements.length; ++i){
                    elements[i].move(shift_x, shift_y);
                }
                infobox.x += shift_x;
                infobox.y += shift_y;
                null_x += shift_x;
                null_y += shift_y;
                boundaries[0] += shift_x;
                boundaries[1] += shift_y;
            }
        }
        draw();
        offsetX = res.x;
        offsetY = res.y;
    }
    else if (e.buttons & 1){
        if (entity_moving != -1){
            var shift_x = res.x - offsetX;
            var shift_y = res.y - offsetY;
            if (shift_x != 0 || shift_y != 0){
                moved = true;
            }
            node_move_x += shift_x;
            node_move_y += shift_y;
            entity_moving.x = Math.floor(node_move_x - (1000 * (node_move_x - null_x) % grid) / 1000.);
            entity_moving.y = Math.floor(node_move_y - (1000 * (node_move_y - null_y) % grid) / 1000.);
            compute_edges();
            assemble_elements();
            draw();
            offsetX = res.x;
            offsetY = res.y;
        }
    }
    else {
        if (toolbox_button_selected == toolbox_states.CREATE_PATHWAY || toolbox_button_selected == toolbox_states.CREATE_PROTEIN || toolbox_button_selected == toolbox_states.CREATE_METABOLITE || toolbox_button_selected == toolbox_states.CREATE_LABEL || toolbox_button_selected == toolbox_states.CREATE_MEMBRANE){
            
            
            var offset_move_x = null_x % (base_grid * factor);
            var offset_move_y = null_y % (base_grid * factor);
            
            if (offset_move_x < 0) offset_move_x += base_grid * factor;
            if (offset_move_y < 0) offset_move_y += base_grid * factor;
            
            tmp_element.x = Math.floor(res.x - (res.x % (base_grid * factor)) + offset_move_x);
            tmp_element.y = Math.floor(res.y - (res.y % (base_grid * factor)) + offset_move_y);
            draw();
        }
        else { // find active node
            if (entity_moving == -1){
                var newhighlight = 0;
                for (var i = elements.length - 1; i >= 0; --i){
                    if (elements[i].is_mouse_over(res)){
                        newhighlight = elements[i];
                        break; 
                    }
                }
                if (highlight_element != newhighlight){
                    if (highlight_element) highlight_element.highlight = false;
                    newhighlight.highlight = true;
                    highlight_element = newhighlight;
                    draw();
                }
            }
        }
        if (toolbox_button_selected == toolbox_states.MOVE_ENTITY && highlight_element && highlight_element.constructor.name == "node") c.style.cursor = "all-scroll";
        else if ((toolbox_button_selected == toolbox_states.ROTATE_PATHWAY || toolbox_button_selected == toolbox_states.ROTATE_PROTEIN || toolbox_button_selected == toolbox_states.ROTATE_METABOLITE) && highlight_element && highlight_element.constructor.name == "edge") c.style.cursor = "pointer";
        else c.style.cursor = "default";
        
    }
    if(highlight_element && highlight_element.tipp && entity_moving == -1) Tip(e, highlight_element.id + " " + highlight_element.name);
    else unTip();
}



function mouse_up_listener(event){
    if (!pathway_is_loaded) return;
    
    if (highlight_element){
        var c = document.getElementById("renderarea");
        res = get_mouse_pos(c, event);
        highlight_element.mouse_up(res);
    }
    if (entity_moving != -1) {
        entity_moving = -1;
        update_node(event);
    }
    mouse_move_listener(event);
}



function toolbox_button_clicked(button){
    for (var i = 0; i < toolbox_buttons.length; ++i){
        if (i == button){
            if (i == toolbox_button_selected){
                document.getElementById(toolbox_buttons[i]).style.backgroundColor = "#eeeeee";
                toolbox_button_selected = -1;
            }
            else {
                document.getElementById(toolbox_buttons[i]).style.backgroundColor = "#dadada";
                toolbox_button_selected = i;
            }
        }
        else {
            document.getElementById(toolbox_buttons[i]).style.backgroundColor = "#eeeeee";
        }
    }
    if (tmp_element != -1){
        for (var i = elements.length - 1; i >= 0; --i){
            if (elements[i].id == -1){ // tmp id == -1
                elements.slice(i, 1);
                assemble_elements();
                draw();
                break;
            }
        }
        tmp_element = -1;
    }
    
    var ctx = document.getElementById("renderarea").getContext("2d");
    switch (toolbox_button_selected){
        case toolbox_states.CREATE_PATHWAY:
            tmp_element = new node({"x": "0", "y": "0", "t": "pathway", "i": -1, "n": "undefined"}, ctx);
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_PROTEIN:
            tmp_element = new node({"x": "0", "y": "0", "t": "protein", "i": -1, "n": "-", "p": []}, ctx);
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_METABOLITE:
            tmp_element = new node({"x": "0", "y": "0", "t": "metabolite", "i": -1, "n": "-"}, ctx);
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_LABEL:
            tmp_element = new node({"x": "0", "y": "0", "t": "label", "i": -1, "n": "undefined"}, ctx);
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_MEMBRANE:
            tmp_element = new node({"x": "0", "y": "0", "t": "membrane", "i": -1, "n": "-"}, ctx);
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        default:
            break;
    }
    
}

function toolbox_button_mouseover(button){
    if (button != toolbox_button_selected) document.getElementById(toolbox_buttons[button]).style.backgroundColor = "#e4e4e4";
}

function toolbox_button_mouseout(button){
    if (button != toolbox_button_selected) document.getElementById(toolbox_buttons[button]).style.backgroundColor = "#eeeeee";
}

/*
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
*/




function update_node(event) {
    var x = Math.round(Math.floor((entity_moving.x - null_x) / factor) / base_grid) * base_grid;
    var y = Math.round(Math.floor((entity_moving.y - null_y) / factor) / base_grid) * base_grid;
    
    
    var xmlhttp = new XMLHttpRequest();
    var request = "/qsdb/cgi-bin/update_node.py?id=";
    request += entity_moving.id;
    request += "&x=";
    request += x;
    request += "&y=";
    request += y;
    xmlhttp.open("GET", request, true);
    xmlhttp.send();
}


function key_down(event){
    // canvas to svg
    if (event.which === 32){
        pathway_to_svg();
    }
    
    
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
}






node.prototype.edit = function() {
    
}



edge.prototype.edit = function(){
    var element = "";
    if (toolbox_button_selected == toolbox_states.ROTATE_METABOLITE){
        var anchor = nodes[this.reaction_id]['reagents'][this.reagent_id]['anchor'];
        nodes[this.reaction_id]['reagents'][this.reagent_id]['anchor'] = next_anchor[anchor];
        element = "metabolite";
    }
    else if (toolbox_button_selected == toolbox_states.ROTATE_PROTEIN || toolbox_button_selected == toolbox_states.ROTATE_PATHWAY){
        if (nodes[this.reaction_id]['reagents'][this.reagent_id]['type'] == "educt"){
            nodes[this.reaction_id]['anchor_in'] = next_anchor[nodes[this.reaction_id]['anchor_in']];
        }
        else {
            nodes[this.reaction_id]['anchor_out'] = next_anchor[nodes[this.reaction_id]['anchor_out']];
        }
        
        element = (toolbox_button_selected == toolbox_states.ROTATE_PROTEIN) ? "protein" : "pathway";
    }
    else return;
    
    var xmlhttp = new XMLHttpRequest();
    var request = "/qsdb/cgi-bin/update_edge.py?id=";
    request += this.edge_id;
    request += "&element=";
    request += element;
    xmlhttp.open("GET", request, true);
    xmlhttp.send();
    
    compute_edges();
    assemble_elements();
    draw();
}


function manage_entries(){
    document.getElementById("manage_entries").style.display = "inline";
    document.getElementById("waiting_background").style.display = "inline";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "blur(5px)";
        document.getElementById("navigation").style.filter = "blur(5px)";
    }
    
    manage_entries_show_pathways();
}


function manage_entries_show_pathways(){
    // get functions
    var xmlhttp_pathways = new XMLHttpRequest();
    xmlhttp_pathways.onreadystatechange = function() {
        if (xmlhttp_pathways.readyState == 4 && xmlhttp_pathways.status == 200) {
            var pathway_data = JSON.parse(xmlhttp_pathways.responseText);
            document.getElementById("manage_entries_list_field").innerHTML = "";
            
            
            pathway_data.sort(function(a, b) {
                return a[1] > b[1];
            });
            
            var dom_table = document.createElement("table");
            document.getElementById("manage_entries_list_field").appendChild(dom_table);
            dom_table.setAttribute("id", "manage_entries_table");
            dom_table.setAttribute("width", "100%"); 
            dom_table.setAttribute("cellspacing", "0"); 
            dom_table.setAttribute("border", "0");
            
            for (var line = 0; line < pathway_data.length; ++line){
                var bg_color = (line & 1) ? "#DDDDDD" : "white";
                var dom_tr = document.createElement("tr");
                dom_table.appendChild(dom_tr);
                dom_tr.setAttribute("id", pathway_data[line][0]);
                
                var dom_td = document.createElement("td");
                dom_tr.appendChild(dom_td);
                dom_td.setAttribute("bgcolor", bg_color);
                dom_td.setAttribute("width", "100%");
                
                var dom_text = document.createTextNode(pathway_data[line][1]);
                dom_td.appendChild(dom_text);
            }
        }
    }
    xmlhttp_pathways.open("GET", "/qsdb/cgi-bin/manage-entries.py?action=get&type=pathways", true);
    xmlhttp_pathways.send();
}


function manage_entries_show_proteins(){
    // get functions
    var xmlhttp_proteins = new XMLHttpRequest();
    xmlhttp_proteins.onreadystatechange = function() {
        if (xmlhttp_proteins.readyState == 4 && xmlhttp_proteins.status == 200) {
            var protein_data = JSON.parse(xmlhttp_proteins.responseText);
            document.getElementById("manage_entries_list_field").innerHTML = "";
            
            
            protein_data.sort(function(a, b) {
                return a[1] > b[1];
            });
            
            var dom_table = document.createElement("table");
            document.getElementById("manage_entries_list_field").appendChild(dom_table);
            dom_table.setAttribute("id", "manage_entries_table");
            dom_table.setAttribute("width", "100%"); 
            dom_table.setAttribute("cellspacing", "0"); 
            dom_table.setAttribute("border", "0");
            
            for (var line = 0; line < protein_data.length; ++line){
                var bg_color = (line & 1) ? "#DDDDDD" : "white";
                var dom_tr = document.createElement("tr");
                dom_table.appendChild(dom_tr);
                dom_tr.setAttribute("id", protein_data[line][0]);
                
                var dom_td = document.createElement("td");
                dom_tr.appendChild(dom_td);
                dom_td.setAttribute("bgcolor", bg_color);
                dom_td.setAttribute("width", "100%");
                
                var dom_text = document.createTextNode(protein_data[line][1] + " | " + protein_data[line][2]);
                dom_td.appendChild(dom_text);
            }
        }
    }
    xmlhttp_proteins.open("GET", "/qsdb/cgi-bin/manage-entries.py?action=get&type=proteins", true);
    xmlhttp_proteins.send();
}


function manage_entries_show_metabolites(){
    // get functions
    var xmlhttp_metabolites = new XMLHttpRequest();
    xmlhttp_metabolites.onreadystatechange = function() {
        if (xmlhttp_metabolites.readyState == 4 && xmlhttp_metabolites.status == 200) {
            var metabolite_data = JSON.parse(xmlhttp_metabolites.responseText);
            document.getElementById("manage_entries_list_field").innerHTML = "";
            
            metabolite_data.sort(function(a, b) {
                return a[1] > b[1];
            });
            
            var dom_table = document.createElement("table");
            document.getElementById("manage_entries_list_field").appendChild(dom_table);
            dom_table.setAttribute("id", "manage_entries_table");
            dom_table.setAttribute("width", "100%"); 
            dom_table.setAttribute("cellspacing", "0"); 
            dom_table.setAttribute("border", "0");
            
            for (var line = 0; line < metabolite_data.length; ++line){
                var bg_color = (line & 1) ? "#DDDDDD" : "white";
                var dom_tr = document.createElement("tr");
                dom_table.appendChild(dom_tr);
                dom_tr.setAttribute("id", metabolite_data[line][0]);
                
                var dom_td = document.createElement("td");
                dom_tr.appendChild(dom_td);
                dom_td.setAttribute("bgcolor", bg_color);
                dom_td.setAttribute("width", "100%");
                
                var dom_text = document.createTextNode(metabolite_data[line][1]);
                dom_td.appendChild(dom_text);
            }
        }
    }
    xmlhttp_metabolites.open("GET", "/qsdb/cgi-bin/manage-entries.py?action=get&type=metabolites", true);
    xmlhttp_metabolites.send();
}


function hide_manage_entries (){
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("manage_entries").style.display = "none";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "none";
        document.getElementById("navigation").style.filter = "none";
    }
}

document.addEventListener('DOMContentLoaded', init, false);
