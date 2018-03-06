toolbox_width = 300;
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
tmp_edge = -1;

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
    document.getElementById("infobox_html_background").addEventListener("click", hide_infobox, false);
    window.addEventListener('resize', resize_pathway_view, false);
    
    window.addEventListener('resize', resize_ms_view, false);
    document.getElementById("msarea").addEventListener("mousewheel", view_mouse_wheel_listener, false);
    document.getElementById("msarea").addEventListener('DOMMouseScroll', view_mouse_wheel_listener, false);
    
    
    change_pathway(0);
    
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
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
    resize_pathway_view();
}


function resize_pathway_view(){
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    document.getElementById("toolbox").style.width = (toolbox_width).toString() + "px";
    document.getElementById("toolbox").style.top = (document.getElementById("navigation").offsetHeight).toString() + "px";
    document.getElementById("toolbox").style.height = (window.innerHeight - document.getElementById("navigation").offsetHeight).toString() + "px";
    c.style.left  = (toolbox_width).toString() + "px";
    ctx.canvas.width  = window.innerWidth - toolbox_width;
    ctx.canvas.height = window.innerHeight;
    preview_element.y = window.innerHeight - preview_element.height;
    draw();
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
                    edge_data.push({'i': 0, 'n': tmp_element.id, 'in': 'left', 'out': 'right', 'v': 0, 'r': []});
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
    else if (toolbox_button_selected == toolbox_states.DELETE_ENTRY){
        if (highlight_element){
            if (highlight_element instanceof node){
                var node_id = highlight_element.id;
                for (var i = edge_data.length - 1; i >= 0; --i){
                    var edv = edge_data[i]['r'];
                    for (var j = edv.length - 1; j >= 0; --j){
                        if (edv[j]['n'] == node_id){
                            edv.splice(j, 1);
                            break;
                        }
                    }
                    if (edge_data[i]['n'] == node_id){
                        edge_data.splice(i, 1);
                    }
                }
                delete data[node_id];
            }
            else if (highlight_element instanceof edge){
                var edge_id = highlight_element.edge_id;
                for (var i = 0; i < edge_data.length; ++i){
                    var edv = edge_data[i]['r'];
                    for (var j = edv.length - 1; j >= 0; --j){
                        if (edv[j]['i'] == edge_id){
                            edv.splice(j, 1);
                            break;
                        }
                    }
                }
            }
                
            compute_edges();
            assemble_elements();
            draw();
        }
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
        tmp_element.name = pathways[pathway_dict[pathway_ref]][1];
        tmp_element.pathway_ref = pathway_ref;
        tmp_element.scale(tmp_element.x, tmp_element.y, 1. / factor);
        tmp_element.setup_pathway_meta();
        tmp_element.scale(tmp_element.x, tmp_element.y, factor);
        draw();
        var ctx = document.getElementById("renderarea").getContext("2d");
        tmp_element = new node({"x": "0", "y": "0", "t": "pathway", "i": -1, "n": "undefined"}, ctx);
        tmp_element.scale(0, 0, factor);
        elements.push(tmp_element);
    };
}


/*
delete_entity(){
    var xmlhttp = new XMLHttpRequest();
    request = "/qsdb/admin/cgi-bin/delete_entity.py?" + request;
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
}
*/


function create_node(request){
    var xmlhttp = new XMLHttpRequest();
    request = "/qsdb/admin/cgi-bin/create_node.py?" + request;
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
                node_move_x = entity_moving.x;
                node_move_y = entity_moving.y;
            }
            else if (toolbox_button_selected == toolbox_states.DRAW_EDGE){
                var ctx = document.getElementById("renderarea").getContext("2d");
                data[-1] = new node({"x": highlight_element.x, "y": highlight_element.y, "t": "point", "i": highlight_element.id, "n": "undefined"}, ctx);
                
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
        if (toolbox_button_selected == toolbox_states.MOVE_ENTITY){
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
        else if (toolbox_button_selected == toolbox_states.DRAW_EDGE && (-1 in data)){
            var offset_move_x = null_x % (base_grid * factor);
            var offset_move_y = null_y % (base_grid * factor);
            
            if (offset_move_x < 0) offset_move_x += base_grid * factor;
            if (offset_move_y < 0) offset_move_y += base_grid * factor;
            
            var ctx = document.getElementById("renderarea").getContext("2d");
            data[-2] = new node({"x": Math.floor(res.x - (res.x % (base_grid * factor)) + offset_move_x), "y": Math.floor(res.y - (res.y % (base_grid * factor)) + offset_move_y), "t": "point", "i": -2, "n": "undefined"}, ctx);
            
            
            
            assemble_elements();
            if (Math.abs(data[-2].x - data[-1].x) > 50 * factor || Math.abs(data[-2].y - data[-1].y) > 50 * factor){
                var a_start = "right";
                var a_end = "left;"
                
                if (Math.abs(data[-2].x - data[-1].x) > Math.abs(data[-2].y - data[-1].y)){
                    a_start = (data[-2].x - data[-1].x < 0) ? "left" : "right";
                    a_end = (data[-2].x - data[-1].x < 0) ? "right" : "left";
                }
                else {
                    a_start = (data[-2].y - data[-1].y < 0) ? "top" : "bottom";
                    a_end = (data[-2].y - data[-1].y < 0) ? "bottom" : "top";
                }
                
                
                tmp_edge = new edge(data[-1].x, data[-1].y, a_start, data[-1], data[-2].x, data[-2].y, a_end, data[-2], 0, -1, -1);
                elements.push(tmp_edge);
                
            }
            draw();
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
    
    var c = document.getElementById("renderarea");
    if (highlight_element){
        var res = get_mouse_pos(c, event);
        highlight_element.mouse_up(res);
    }
    if (toolbox_button_selected == toolbox_states.MOVE_ENTITY) {
        entity_moving = -1;
        update_node(event);
    }
    else if (toolbox_button_selected == toolbox_states.DRAW_EDGE){
        
        var res = get_mouse_pos(c, event);
        var target = -1;
        for (var node_id in data){
            if (node_id != -1 && node_id != -2 && data[node_id].is_mouse_over(res)){
                target = data[node_id];
                break; 
            }
        }
        if (target != -1){
            var num_metabolites = 0;
            num_metabolites += (target.type == "metabolite") ? 1 : 0;
            num_metabolites += (data[data[-1].id].type == "metabolite") ? 1 : 0;
            
            var num_labels = 0;
            num_labels += (target.type == "label") ? 1 : 0;
            num_labels += (data[data[-1].id].type == "label") ? 1 : 0;
            
            var num_membranes = 0;
            num_membranes += (target.type == "membrane") ? 1 : 0;
            num_membranes += (data[data[-1].id].type == "membrane") ? 1 : 0;
            
            var num_proteins = 0;
            num_proteins += (target.type == "protein") ? 1 : 0;
            num_proteins += (data[data[-1].id].type == "protein") ? 1 : 0;
            
            
            if (num_metabolites == 1 && num_labels == 0 && num_membranes == 0){
                if (num_proteins == 1){
                    var prot_id = -1;
                    var meta_id = -1;
                    var fooduct = "product";
                    if (data[data[-1].id].type == "protein"){
                        prot_id = data[-1].id;
                        meta_id = target.id;
                        fooduct = "product";
                    }
                    else {
                        prot_id = target.id;
                        meta_id = data[-1].id;
                        fooduct = "educt";
                    }
                    var reaction = -1;
                    for (var reaction_id in edge_data){
                        if (edge_data[reaction_id]['n'] == prot_id){
                            reaction = reaction_id;
                            break;
                        }
                    }
                    edge_data[reaction]['r'].push({"i": "0", "r": reaction, "n": meta_id, "t": fooduct, "a": "left"});
                }
                else {
                    var pathway_id = -1;
                    var meta_id = -1;
                    if (data[data[-1].id].type == "pathway"){
                        pathway_id = data[-1].id;
                        meta_id = target.id;
                    }
                    else {
                        pathway_id = target.id;
                        meta_id = data[-1].id;
                    }
                    var reaction = -1;
                    for (var reaction_id in edge_data){
                        reaction = Math.max(reaction, reaction_id);
                    }
                    reaction += 1;
                    edge_data[reaction] = {"i": reaction, "n": pathway_id, "in": "left", "out": "right", "v": 0, "r": [{"i": "0", "r": reaction, "n": meta_id, "t": "educt", "a": "left"}]};
                }
                add_edge(data[-1].id, target.id);
                compute_edges();
            }
        }
        delete data[-1];
        delete data[-2];
        assemble_elements();
        draw();
    }
    mouse_move_listener(event);
}



function add_edge(start_id, end_id){
    var xmlhttp = new XMLHttpRequest();
    var request = "/qsdb/admin/cgi-bin/add_edge.py?start_id=" + start_id + "&end_id=" + end_id;
    var successful_creation = false;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            response = xmlhttp.responseText;
            if (response < 0){
                alert("An error has occured, the edge could not be added into the database. Please contact the administrator.");
            }
        }
    }
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
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





function update_node(event) {
    var x = Math.round(Math.floor((entity_moving.x - null_x) / factor) / base_grid) * base_grid;
    var y = Math.round(Math.floor((entity_moving.y - null_y) / factor) / base_grid) * base_grid;
    
    
    var xmlhttp = new XMLHttpRequest();
    var request = "/qsdb/admin/cgi-bin/update_node.py?id=";
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
    var request = "/qsdb/admin/cgi-bin/update_edge.py?id=";
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
    xmlhttp_pathways.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=pathways", true);
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
    xmlhttp_proteins.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=proteins", true);
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
    xmlhttp_metabolites.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=metabolites", true);
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
