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


global_pathway_data = -1;
global_protein_data = -1;
global_metabolite_data = -1;
selected_metabolite = -1;
selected_metabolite_node = -1;
selected_pathway_node = -1;
selected_protein_node = -1;

protein_sort_columns = {'-3': "definition:DESC", '-2': "accession:DESC", '-1': "name:DESC", 1: "name:ASC", 2: "accession:ASC", 3: "definition:ASC"};
protein_sort_column = 1;
protein_max_pages = -1;
protein_current_page = 0;
current_protein_set = -1;

metabolite_sort_columns = {'-3': "formula:DESC", '-2': "c_number:DESC", '-1': "name:DESC", 1: "name:ASC", 2: "c_number:ASC", 3: "formula:ASC"};
metabolite_sort_column = 1;
metabolite_max_pages = -1;
metabolite_current_page = 0;
metabolite_create_action = true;

max_per_page = 30;



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
            var pathway_dat = JSON.parse(xmlhttp_pw.responseText);
            for (var i = 0; i < pathway_dat.length; ++i){
                pathways[pathway_dat[i][0]] = pathway_dat[i][1];
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
    
    
    change_pathway();
    
    
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
    
    // get metabolites
    var xmlhttp_metabolites = new XMLHttpRequest();
    xmlhttp_metabolites.onreadystatechange = function() {
        if (xmlhttp_metabolites.readyState == 4 && xmlhttp_metabolites.status == 200) {
            metabolite_max_pages = Math.floor(parseInt(xmlhttp_metabolites.responseText) / max_per_page) + 1;
        }
    }
    xmlhttp_metabolites.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=metabolites_num", true);
    xmlhttp_metabolites.send();
    
    
    // get pathways
    var xmlhttp_pathways = new XMLHttpRequest();
    xmlhttp_pathways.onreadystatechange = function() {
        if (xmlhttp_pathways.readyState == 4 && xmlhttp_pathways.status == 200) {
            global_pathway_data = JSON.parse(xmlhttp_pathways.responseText);
            
            var sorted_pathways = [];
            for (var pathway_id in global_pathway_data) sorted_pathways.push(global_pathway_data[pathway_id]);
            sorted_pathways.sort(function(a, b) {
                return a[1] > b[1];
            });
            
            for (var i = 0; i < sorted_pathways.length; ++i){
                var option = document.createElement("option");
                option.id = sorted_pathways[i][0];
                option.text = replaceAll(replaceAll(sorted_pathways[i][1], "\\\\n", ""), "-\\\\n", "");
                document.getElementById("editor_select_pathway_field").add(option);
            }
        }
    }
    xmlhttp_pathways.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=pathways", true);
    xmlhttp_pathways.send();
    
    
    // get proteins
    var xmlhttp_proteins = new XMLHttpRequest();
    xmlhttp_proteins.onreadystatechange = function() {
        if (xmlhttp_proteins.readyState == 4 && xmlhttp_proteins.status == 200) {
            protein_max_pages = Math.floor(parseInt(xmlhttp_proteins.responseText) / max_per_page) + 1;
        }
    }
    xmlhttp_proteins.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=proteins_num", true);
    xmlhttp_proteins.send();
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
        if (result[0]){
            var ctx = document.getElementById("renderarea").getContext("2d");
            data[tmp_element.id] = tmp_element;
            assemble_elements();
            draw();
            switch (toolbox_button_selected){
                    
                case toolbox_states.CREATE_PROTEIN:
                    edge_data[result[1]] = {'i': result[1], 'n': tmp_element.id, 'in': 'left', 'out': 'right', 'v': 0, 'r': []};
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
        document.getElementById("editor_select_pathway_ok_button").setAttribute("onclick", "editor_create_pathway_node(); close_editor_select_pathway();");
        document.getElementById("editor_select_pathway_ok_button").innerHTML = "Create";
    }
    else if (toolbox_button_selected == toolbox_states.CREATE_METABOLITE){
        document.getElementById("editor_select_metabolite").style.display = "inline";
        document.getElementById("waiting_background").style.display = "inline";
        document.getElementById("renderarea").style.filter = "blur(5px)";
        document.getElementById("toolbox").style.filter = "blur(5px)";
        metabolite_create_action = true;
        editor_fill_metabolite_table();
    }
    else if (toolbox_button_selected == toolbox_states.DELETE_ENTRY){
        if (highlight_element){
            var request = "";
            if (highlight_element instanceof node){
                var node_id = highlight_element.id;
                
                switch (highlight_element.type){
                    case "pathway":
                    case "protein":
                        var del_reactions = []
                        for (var reaction_id in edge_data){
                            if (edge_data[reaction_id]['n'] == node_id) del_reactions.push(reaction_id);
                        }
                        for (var i = 0; i < del_reactions.length; ++i) delete edge_data[del_reactions[i]];
                        break;
                        
                    case "metabolite":
                        var del_reactions = []
                        for (var reaction_id in edge_data){
                            for (var reagent_id in edge_data[reaction_id]['r']){
                                if (edge_data[reaction_id]['r'][reagent_id]['n'] == node_id && data[edge_data[reaction_id]['n']].type == "pathway") del_reactions.push(reaction_id);
                            }
                        }
                        for (var i = 0; i < del_reactions.length; ++i) delete edge_data[del_reactions[i]];
                        
                        
                        for (var reaction_id in edge_data){
                            var del_reagents = [];
                            for (var reagent_id in edge_data[reaction_id]['r']){
                                if (edge_data[reaction_id]['r'][reagent_id]['n'] == node_id) del_reagents.push(reaction_id);
                            }
                            for (var i = 0; i < del_reagents.length; ++i) delete edge_data[reaction_id]['r'][del_reagents[i]];
                        }
                        break;
                    
                    default:
                        break;
                }
                
                delete data[node_id];
                request = "type=node&id=" + node_id;
                
            }
            else if (highlight_element instanceof edge){
                request = "type=edge&id=" + highlight_element.reagent_id;
                delete edge_data[highlight_element.reaction_id]['r'][highlight_element.reagent_id];
            }
            delete_entity(request);
            compute_edges();
            assemble_elements();
            draw();
        }
    }
    else if (toolbox_button_selected == toolbox_states.ROTATE_PATHWAY || toolbox_button_selected == toolbox_states.ROTATE_METABOLITE || toolbox_button_selected == toolbox_states.ROTATE_PROTEIN){
        if (highlight_element && highlight_element instanceof edge) highlight_element.edit();
    }
    else if (highlight_element && toolbox_button_selected == -1){
        if (highlight_element instanceof node){
            switch (highlight_element.type){
                case "pathway":
                    var obj = document.getElementById("editor_select_pathway_field");
                    for (var i = 0; i < obj.options.length; ++i){
                        if (obj.options[i].id == highlight_element.foreign_id){
                            obj.selectedIndex = i;
                            break;
                        }
                    }
                    document.getElementById("editor_select_pathway").style.display = "inline";
                    document.getElementById("waiting_background").style.display = "inline";
                    document.getElementById("renderarea").style.filter = "blur(5px)";
                    document.getElementById("toolbox").style.filter = "blur(5px)";
                    document.getElementById("editor_select_pathway_ok_button").setAttribute("onclick", "editor_update_pathway_node(); close_editor_select_pathway();");
                    document.getElementById("editor_select_pathway_ok_button").innerHTML = "Update";
                    selected_pathway_node = highlight_element.id;
                    break;
                    
                case "protein":
                    var protein_set = new Set();
                    for (var i = 0; i < highlight_element.proteins.length; ++i) protein_set.add(highlight_element.proteins[i].toString());
                    var dom_table = document.getElementById("editor_select_protein_table");
                    for (var i = 0; i < dom_table.rows.length; ++i){
                        dom_table.rows[i].cells[3].children[0].checked = protein_set.has(dom_table.rows[i].cells[3].children[0].id);
                    }
                    
                    editor_fill_protein_table();
                    document.getElementById("editor_select_protein").style.display = "inline";
                    document.getElementById("waiting_background").style.display = "inline";
                    document.getElementById("renderarea").style.filter = "blur(5px)";
                    document.getElementById("toolbox").style.filter = "blur(5px)";
                    selected_protein_node = highlight_element.id;
                    break;
                
                case "metabolite":
                    
                    metabolite_create_action = false;
                    selected_metabolite_node = highlight_element.id;
                    editor_fill_metabolite_table();
                    document.getElementById("editor_select_metabolite").style.display = "inline";
                    document.getElementById("waiting_background").style.display = "inline";
                    document.getElementById("renderarea").style.filter = "blur(5px)";
                    document.getElementById("toolbox").style.filter = "blur(5px)";
                    break;
                
                default:
                    break;
            }
        }
    }
}


function close_editor_select_pathway(){
    document.getElementById("editor_select_pathway").style.display = "none";
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}


function close_editor_select_protein(){
    document.getElementById("editor_select_protein").style.display = "none";
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}


function close_editor_select_metabolite(){
    document.getElementById("editor_select_metabolite").style.display = "none";
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}


function editor_create_pathway_node(){
    var obj = document.getElementById("editor_select_pathway_field");
    var foreign_id = obj.options[obj.selectedIndex].id;
    
    
    var x = Math.round(Math.floor((tmp_element.x - null_x) / factor) / base_grid) * base_grid;
    var y = Math.round(Math.floor((tmp_element.y - null_y) / factor) / base_grid) * base_grid;
    var request = "type=pathway&pathway=" + current_pathway + "&pathway_ref=" + foreign_id + "&x=" + x + "&y=" + y;
    var result = create_node(request);
    if (result[0]){
        tmp_element.name = global_pathway_data[foreign_id][1];
        tmp_element.foreign_id = foreign_id;
        tmp_element.setup_pathway_meta();
        tmp_element.scale(tmp_element.x, tmp_element.y, factor);
        data[tmp_element.id] = tmp_element;
        assemble_elements();
        draw();
        var ctx = document.getElementById("renderarea").getContext("2d");
        tmp_element = new node({"x": "0", "y": "0", "t": "pathway", "i": -1, "n": "undefined"}, ctx);
        tmp_element.scale(0, 0, factor);
        elements.push(tmp_element);
    };
}





function editor_create_metabolite_node(){
    var x = Math.round(Math.floor((tmp_element.x - null_x) / factor) / base_grid) * base_grid;
    var y = Math.round(Math.floor((tmp_element.y - null_y) / factor) / base_grid) * base_grid;
    var request = "type=metabolite&pathway=" + current_pathway + "&foreign_id=" + selected_metabolite + "&x=" + x + "&y=" + y;
    var result = create_node(request);
    if (result[0]){
        tmp_element.name = global_metabolite_data[selected_metabolite][1];
        tmp_element.foreign_id = selected_metabolite;
        data[tmp_element.id] = tmp_element;
        assemble_elements();
        draw();
        var ctx = document.getElementById("renderarea").getContext("2d");
        tmp_element = new node({"x": "0", "y": "0", "t": "metabolite", "i": -1, "n": "-"}, ctx);
        tmp_element.scale(0, 0, factor);
        elements.push(tmp_element);
    };
}


function editor_update_metabolite_node(){
    var request = "action=set&table=nodes&id=" + selected_metabolite_node + "&column=foreign_id&value=" + selected_metabolite;
    var result = update_entry(request);
    if (result){
        data[selected_metabolite_node].name = global_metabolite_data[selected_metabolite][1];
        data[selected_metabolite_node].foreign_id = selected_metabolite;
        draw();
    };
}


function editor_update_protein_node(){
    var obj = document.getElementById("editor_select_protein_table");
    var dom_table = document.getElementById("editor_select_protein_table");
    var prot = data[selected_protein_node];
    prot.proteins = Array.from(current_protein_set);
    
    /*
    for (var i = 0; i < dom_table.rows.length; ++i){
        if (dom_table.rows[i].cells[3].children[0].checked){
            prot.proteins.push(parseInt(dom_table.rows[i].cells[3].children[0].id));
        }
    }*/
    var ctx = document.getElementById("renderarea").getContext("2d");
    
    var continuing = true;
    
    // get proteins
    var request = "/qsdb/admin/cgi-bin/manage-entries.py?action=set&table=nodeproteincorrelations&column=none&id=" + selected_protein_node + "&value=" + prot.proteins.join(":");
    var xmlhttp_set = new XMLHttpRequest();
    xmlhttp_set.onreadystatechange = function() {
        if (xmlhttp_set.readyState == 4 && xmlhttp_set.status == 200) {
            response = xmlhttp_set.responseText;
            if (response < 0){
                continuing = false;
                alert("An error has occured, the entity could not be deleted from the database. Please contact the administrator.");
            }
        }
    }
    
    xmlhttp_set.open("GET", request, false);
    xmlhttp_set.send();
    
    if (continuing){
    
        // get proteins
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                request_load_proteins(JSON.parse(xmlhttp.responseText), false);
            }
        }
        
        xmlhttp.open("GET", "/qsdb/cgi-bin/get-proteins.bin?ids=" + prot.proteins.join(":") + "&species=mouse", false);
        xmlhttp.send();
    
    }
    else {
        prot.proteins = [];
    }
    
    prot.setup_protein_meta(ctx);
    prot.scale(prot.x, prot.y, factor);
    compute_edges();
    assemble_elements();
    draw();
}


function editor_update_pathway_node(){
    var obj = document.getElementById("editor_select_pathway_field");
    var foreign_id = obj.options[obj.selectedIndex].id;
    var request = "action=set&table=nodes&id=" + selected_pathway_node + "&column=foreign_id&value=" + foreign_id;
    
    var result = update_entry(request);
    if (result){
        var pw_node = data[selected_pathway_node];
        pw_node.name = replaceAll(global_pathway_data[foreign_id][1], "\\\\n", "\n");
        pw_node.foreign_id = foreign_id;
        pw_node.scale(pw_node.x, pw_node.y, 1. / factor);
        pw_node.setup_pathway_meta();
        pw_node.scale(pw_node.x, pw_node.y, factor);
        compute_edges();
        assemble_elements();
        draw();
    };
}


function delete_entity(request){
    var xmlhttp = new XMLHttpRequest();
    request = "/qsdb/admin/cgi-bin/delete_entity.py?" + request;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            response = xmlhttp.responseText;
            if (response < 0){
                alert("An error has occured, the entity could not be deleted from the database. Please contact the administrator.");
            }
        }
    }
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
}


function update_entry(request){
    var xmlhttp = new XMLHttpRequest();
    request = "/qsdb/admin/cgi-bin/manage-entries.py?" + request;
    var successful_creation = false;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            if (response < 0){
                alert("An error has occured, the entity could not be updated in the database. Please contact the administrator.");
            }
            else {
                successful_creation = true;
            }
        }
    }
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
    return successful_creation;
}


function create_node(request){
    var xmlhttp = new XMLHttpRequest();
    request = "/qsdb/admin/cgi-bin/create_node.py?" + request;
    var successful_creation = [false, -1];
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var request_data = JSON.parse(xmlhttp.responseText);
            if (0 <= request_data[0]){
                tmp_element.id = request_data[0];
                successful_creation[0] = true;
                successful_creation[1] = request_data[1];
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
        else if (toolbox_button_selected == toolbox_states.DELETE_ENTRY && highlight_element) c.style.cursor = "no-drop";
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
        update_node(event);
        entity_moving = -1;
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
                var results = add_edge(data[-1].id, target.id);
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
                    edge_data[reaction]['r'][results[0]] = {"i": results[0], "r": reaction, "n": meta_id, "t": fooduct, "a": "left"};
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
                    
                    edge_data[results[1]] = {"i": results[1], "n": pathway_id, "in": "left", "out": "right", "v": 0, "r": {}};
                    edge_data[results[1]]['r'][results[0]] = {"i": results[0], "r": results[1], "n": meta_id, "t": "educt", "a": "left"};
                }
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
    var successful_creation = [-1, -1];
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            response = JSON.parse(xmlhttp.responseText);
            if (response[0] < 0){
                alert("An error has occured, the edge could not be added into the database. Please contact the administrator.");
            }
            else {
                successful_creation[0] = response[1];
                successful_creation[1] = response[2];
            }
        }
    }
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
    return successful_creation;
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
        var anchor = edge_data[this.reaction_id]['r'][this.reagent_id]['a'];
        edge_data[this.reaction_id]['r'][this.reagent_id]['a'] = next_anchor[anchor];
        element = "metabolite";
    }
    else if (toolbox_button_selected == toolbox_states.ROTATE_PROTEIN || toolbox_button_selected == toolbox_states.ROTATE_PATHWAY){
        if (edge_data[this.reaction_id]['r'][this.reagent_id]['t'] == "educt"){
            edge_data[this.reaction_id]['in'] = next_anchor[edge_data[this.reaction_id]['in']];
        }
        else {
            edge_data[this.reaction_id]['out'] = next_anchor[edge_data[this.reaction_id]['out']];
        }
        
        element = (toolbox_button_selected == toolbox_states.ROTATE_PROTEIN) ? "protein" : "pathway";
    }
    else return;
    
    var xmlhttp = new XMLHttpRequest();
    var request = "/qsdb/admin/cgi-bin/update_edge.py?id=";
    request += this.reagent_id;
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


function prepare_metabolite_forms(){
    var global_metabolite_data_sorted = [];
    for (var metabolite_id in global_metabolite_data) global_metabolite_data_sorted.push(global_metabolite_data[metabolite_id]);
    
    global_metabolite_data_sorted = global_metabolite_data_sorted.sort(function(a, b) {
        return a[1] > b[1];
    });
    
    var dom_table = document.getElementById("editor_select_metabolite_table");
    
    for (var i = 0; i < global_metabolite_data_sorted.length; ++i){
        var bg_color = (i & 1) ? "#DDDDDD" : "white";
        var row = global_metabolite_data_sorted[i];
        
        var dom_tr = document.createElement("tr");
        dom_table.appendChild(dom_tr);
        var dom_td1 = document.createElement("td");
        dom_tr.appendChild(dom_td1);
        dom_td1.innerHTML = row[1];
        dom_td1.setAttribute("bgcolor", bg_color);
        
        var dom_td2 = document.createElement("td");
        dom_tr.appendChild(dom_td2);
        dom_td2.innerHTML = row[2];
        dom_td2.setAttribute("bgcolor", bg_color);
        dom_td2.setAttribute("style", "min-width: 100px;");
        
        var dom_td3 = document.createElement("td");
        dom_tr.appendChild(dom_td3);
        dom_td3.innerHTML = row[3];
        dom_td3.setAttribute("bgcolor", bg_color);
        
        var dom_td4 = document.createElement("td");
        dom_tr.appendChild(dom_td4);
        var dom_input = document.createElement("input");
        dom_td4.appendChild(dom_input);
        dom_td4.setAttribute("bgcolor", bg_color);
        dom_input.setAttribute("id", row[0]);
        dom_input.setAttribute("type", "radio");
        dom_input.setAttribute("name", "foo");
        dom_input.setAttribute("onclick", "selected_metabolite = this.id;");
        
        if (i == 0){
            selected_metabolite = row[0];
            dom_input.setAttribute("checked", "true");
        }
    }
    document.getElementById("editor_select_metabolite").style.display = "inline";
    var table_titles = document.getElementById("editor_select_metabolite_table_header");
    table_titles.rows[0].cells[0].width = dom_table.rows[0].cells[0].offsetWidth;
    table_titles.rows[1].cells[0].children[0].size = dom_table.rows[0].cells[0].offsetWidth / 9;
    
    table_titles.rows[0].cells[1].width = dom_table.rows[0].cells[1].offsetWidth;
    table_titles.rows[1].cells[1].children[0].size = 8;
    
    table_titles.rows[0].cells[2].width = dom_table.rows[0].cells[2].offsetWidth;
    table_titles.rows[1].cells[2].children[0].size = dom_table.rows[0].cells[2].offsetWidth / 9;
    document.getElementById("editor_select_metabolite").style.display = "none";
}




function prepare_protein_forms(){
    var global_protein_data_sorted = [];
    for (var protein_id in global_protein_data) global_protein_data_sorted.push(global_protein_data[protein_id]);
    
    global_protein_data_sorted = global_protein_data_sorted.sort(function(a, b) {
        return a[1] > b[1];
    });
    
    var dom_table = document.getElementById("editor_select_protein_table");
    
    for (var i = 0; i < global_protein_data_sorted.length; ++i){
        var bg_color = (i & 1) ? "#DDDDDD" : "white";
        var row = global_protein_data_sorted[i];
        
        var dom_tr = document.createElement("tr");
        dom_table.appendChild(dom_tr);
        var dom_td1 = document.createElement("td");
        dom_tr.appendChild(dom_td1);
        dom_td1.innerHTML = row[1];
        dom_td1.setAttribute("bgcolor", bg_color);
        
        var dom_td2 = document.createElement("td");
        dom_tr.appendChild(dom_td2);
        dom_td2.innerHTML = row[6];
        dom_td2.setAttribute("bgcolor", bg_color);
        dom_td2.setAttribute("style", "min-width: 100px;");
        
        var dom_td3 = document.createElement("td");
        dom_tr.appendChild(dom_td3);
        dom_td3.innerHTML = row[2];
        dom_td3.setAttribute("bgcolor", bg_color);
        
        var dom_td4 = document.createElement("td");
        dom_tr.appendChild(dom_td4);
        var dom_input = document.createElement("input");
        dom_td4.appendChild(dom_input);
        dom_td4.setAttribute("bgcolor", bg_color);
        dom_input.setAttribute("id", row[0]);
        dom_input.setAttribute("type", "checkbox");
    }
    document.getElementById("editor_select_protein").style.display = "inline";
    var table_titles = document.getElementById("editor_select_protein_table_header");
    table_titles.rows[0].cells[0].width = dom_table.rows[0].cells[0].offsetWidth;
    table_titles.rows[1].cells[0].children[0].size = dom_table.rows[0].cells[0].offsetWidth / 9;
    
    table_titles.rows[0].cells[1].width = dom_table.rows[0].cells[1].offsetWidth;
    table_titles.rows[1].cells[1].children[0].size = 8;
    
    table_titles.rows[0].cells[2].width = dom_table.rows[0].cells[2].offsetWidth;
    table_titles.rows[1].cells[2].children[0].size = dom_table.rows[0].cells[2].offsetWidth / 9;
    document.getElementById("editor_select_protein").style.display = "none";
}


function editor_fill_metabolite_table(){
    var request = "action=get&type=metabolites";
    request += "&column=" + metabolite_sort_columns[metabolite_sort_column];
    request += "&limit=" + (metabolite_current_page * max_per_page + 1).toString() + ":" + max_per_page.toString();
    request = "/qsdb/admin/cgi-bin/manage-entries.py?" + request;
    
    
    var sign_up = String.fromCharCode(9652);
    var sign_down = String.fromCharCode(9662);
    
    var dom_table_header = document.getElementById("editor_select_metabolite_table_header");
    dom_table_header.innerHTML = ""
    var dom_th_name = document.createElement("th");
    dom_table_header.appendChild(dom_th_name);
    dom_th_name.setAttribute("onclick", "metabolite_sort_column = " + ((metabolite_sort_column == 1) ? " -1;" : "1;") + "; editor_fill_metabolite_table();");
    dom_th_name.setAttribute("style", "cursor: pointer;");
    dom_th_name.innerHTML = "Name" + ((metabolite_sort_column == 1) ? " " + sign_up : ((metabolite_sort_column == -1) ? " " + sign_down : ""));
    
    
    var dom_th_cnumber = document.createElement("th");
    dom_table_header.appendChild(dom_th_cnumber);
    dom_th_cnumber.setAttribute("onclick", "metabolite_sort_column = " + ((metabolite_sort_column == 2) ? " -2;" : "2;") + "; editor_fill_metabolite_table();");
    dom_th_cnumber.setAttribute("style", "cursor: pointer;");
    dom_th_cnumber.innerHTML = "C&nbsp;number" + ((metabolite_sort_column == 2) ? " " + sign_up : ((metabolite_sort_column == -2) ? " " + sign_down : ""));
    
    
    var dom_th_formula = document.createElement("th");
    dom_table_header.appendChild(dom_th_formula);
    dom_th_formula.setAttribute("onclick", "metabolite_sort_column = " + ((metabolite_sort_column == 3) ? " -3;" : "3;") + "; editor_fill_metabolite_table();");
    dom_th_formula.setAttribute("style", "cursor: pointer;");
    dom_th_formula.innerHTML = "Chemical formula" + ((metabolite_sort_column == 3) ? " " + sign_up : ((metabolite_sort_column == -3) ? " " + sign_down : ""));
    
    if (metabolite_create_action){
        document.getElementById("editor_select_metabolite_ok_button").setAttribute("onclick", "editor_create_metabolite_node(); close_editor_select_metabolite();");
        document.getElementById("editor_select_metabolite_ok_button").innerHTML = "Create";
    }
    else {
        document.getElementById("editor_select_metabolite_ok_button").setAttribute("onclick", "editor_update_metabolite_node(); close_editor_select_metabolite();");
        document.getElementById("editor_select_metabolite_ok_button").innerHTML = "Update";
    }
    
    var dom_nav_cell = document.getElementById("editor_metabolite_page_navigation");
    dom_nav_cell.innerHTML = "";
    if (metabolite_current_page > 0){
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "metabolite_current_page = 0; editor_fill_metabolite_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;«&nbsp;";
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "metabolite_current_page -= 1; editor_fill_metabolite_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;‹&nbsp;&nbsp;";
    }
    
        
    var dom_page = document.createElement("select");
    dom_nav_cell.appendChild(dom_page);
    dom_page.setAttribute("style", "display: inline;");
    dom_page.setAttribute("onchange", "metabolite_current_page = this.selectedIndex; editor_fill_metabolite_table();");
    for (var i = 0; i < metabolite_max_pages; ++i){
        var dom_option = document.createElement("option");
        dom_page.appendChild(dom_option);
        dom_option.innerHTML = (i + 1).toString();
    }
    dom_page.selectedIndex = metabolite_current_page;
    
    if (metabolite_current_page + 1 < metabolite_max_pages){
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "metabolite_current_page += 1; editor_fill_metabolite_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;&nbsp;›&nbsp;";
        
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "metabolite_current_page = metabolite_max_pages - 1; editor_fill_metabolite_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;»&nbsp;";
    }
    
    
    var xmlhttp_metabolites = new XMLHttpRequest();
    xmlhttp_metabolites.onreadystatechange = function() {
        if (xmlhttp_metabolites.readyState == 4 && xmlhttp_metabolites.status == 200) {
            global_metabolite_data = JSON.parse(xmlhttp_metabolites.responseText);
            var global_metabolite_data_sorted = [];
            for (var metabolite_id in global_metabolite_data) global_metabolite_data_sorted.push(global_metabolite_data[metabolite_id]);
            
            global_metabolite_data_sorted = global_metabolite_data_sorted.sort(function(a, b) {
                return a[1] > b[1];
            });
            
            
            var dom_table = document.getElementById("editor_select_metabolite_table");
            dom_table.innerHTML = "";
    
            for (var i = 0; i < global_metabolite_data_sorted.length; ++i){
                var bg_color = (i & 1) ? "#DDDDDD" : "white";
                var row = global_metabolite_data_sorted[i];
                
                var dom_tr = document.createElement("tr");
                dom_table.appendChild(dom_tr);
                var dom_td1 = document.createElement("td");
                dom_tr.appendChild(dom_td1);
                dom_td1.innerHTML = row[1];
                dom_td1.setAttribute("bgcolor", bg_color);
                
                var dom_td2 = document.createElement("td");
                dom_tr.appendChild(dom_td2);
                dom_td2.innerHTML = row[2];
                dom_td2.setAttribute("bgcolor", bg_color);
                dom_td2.setAttribute("style", "min-width: 100px;");
                
                var dom_td3 = document.createElement("td");
                dom_tr.appendChild(dom_td3);
                dom_td3.innerHTML = row[3];
                dom_td3.setAttribute("bgcolor", bg_color);
                
                var dom_td4 = document.createElement("td");
                dom_tr.appendChild(dom_td4);
                var dom_input = document.createElement("input");
                dom_td4.appendChild(dom_input);
                dom_td4.setAttribute("bgcolor", bg_color);
                dom_input.setAttribute("id", row[0]);
                dom_input.setAttribute("type", "radio");
                dom_input.setAttribute("name", "foo");
                dom_input.setAttribute("onclick", "selected_metabolite = this.id;");
                
                if ((metabolite_create_action && i == 0) || (highlight_element.foreign_id == row[0])) {
                    selected_metabolite = row[0];
                    dom_input.setAttribute("checked", "true");
                }
            }
            
            
        }
    }
    xmlhttp_metabolites.open("GET", request, true);
    xmlhttp_metabolites.send();
}


function editor_fill_protein_table(){
    var request = "action=get&type=proteins";
    request += "&column=" + protein_sort_columns[protein_sort_column];
    request += "&limit=" + (protein_current_page * max_per_page + 1).toString() + ":" + max_per_page.toString();
    request = "/qsdb/admin/cgi-bin/manage-entries.py?" + request;
    
    
    var sign_up = String.fromCharCode(9652);
    var sign_down = String.fromCharCode(9662);
    
    var dom_table_header = document.getElementById("editor_select_protein_table_header");
    dom_table_header.innerHTML = ""
    var dom_th_name = document.createElement("th");
    dom_table_header.appendChild(dom_th_name);
    dom_th_name.setAttribute("onclick", "protein_sort_column = " + ((protein_sort_column == 1) ? " -1;" : "1;") + "; editor_fill_protein_table();");
    dom_th_name.setAttribute("style", "cursor: pointer;");
    dom_th_name.innerHTML = "Name" + ((protein_sort_column == 1) ? " " + sign_up : ((protein_sort_column == -1) ? " " + sign_down : ""));
    
    
    var dom_th_uniprot = document.createElement("th");
    dom_table_header.appendChild(dom_th_uniprot);
    dom_th_uniprot.setAttribute("onclick", "protein_sort_column = " + ((protein_sort_column == 2) ? " -2;" : "2;") + "; editor_fill_protein_table();");
    dom_th_uniprot.setAttribute("style", "cursor: pointer;");
    dom_th_uniprot.innerHTML = "Uniprot" + ((protein_sort_column == 2) ? " " + sign_up : ((protein_sort_column == -2) ? " " + sign_down : ""));
    
    
    var dom_th_description = document.createElement("th");
    dom_table_header.appendChild(dom_th_description);
    dom_th_description.setAttribute("onclick", "protein_sort_column = " + ((protein_sort_column == 3) ? " -3;" : "3;") + "; editor_fill_protein_table();");
    dom_th_description.setAttribute("style", "cursor: pointer;");
    dom_th_description.innerHTML = "Description" + ((protein_sort_column == 3) ? " " + sign_up : ((protein_sort_column == -3) ? " " + sign_down : ""));
    
    
    
    var dom_nav_cell = document.getElementById("editor_protein_page_navigation");
    dom_nav_cell.innerHTML = "";
    if (protein_current_page > 0){
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "protein_current_page = 0; editor_fill_protein_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;«&nbsp;";
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "protein_current_page -= 1; editor_fill_protein_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;‹&nbsp;&nbsp;";
    }
    
        
    var dom_page = document.createElement("select");
    dom_nav_cell.appendChild(dom_page);
    dom_page.setAttribute("style", "display: inline;");
    dom_page.setAttribute("onchange", "protein_current_page = this.selectedIndex; editor_fill_protein_table();");
    for (var i = 0; i < protein_max_pages; ++i){
        var dom_option = document.createElement("option");
        dom_page.appendChild(dom_option);
        dom_option.innerHTML = (i + 1).toString();
    }
    dom_page.selectedIndex = protein_current_page;
    
    if (protein_current_page + 1 < protein_max_pages){
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "protein_current_page += 1; editor_fill_protein_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;&nbsp;›&nbsp;";
        
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "protein_current_page = protein_max_pages - 1; editor_fill_protein_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;»&nbsp;";
    }
    
    current_protein_set = new Set(highlight_element.proteins);
    
    var xmlhttp_protein = new XMLHttpRequest();
    xmlhttp_protein.onreadystatechange = function() {
        if (xmlhttp_protein.readyState == 4 && xmlhttp_protein.status == 200) {
            global_protein_data = JSON.parse(xmlhttp_protein.responseText);
            var global_protein_data_sorted = [];
            for (var protein_id in global_protein_data) global_protein_data_sorted.push(global_protein_data[protein_id]);
            
            global_protein_data_sorted = global_protein_data_sorted.sort(function(a, b) {
                return a[1] > b[1];
            });
            
            
            var dom_table = document.getElementById("editor_select_protein_table");
            dom_table.innerHTML = "";
    
            for (var i = 0; i < global_protein_data_sorted.length; ++i){
                var bg_color = (i & 1) ? "#DDDDDD" : "white";
                var row = global_protein_data_sorted[i];
                
                var dom_tr = document.createElement("tr");
                dom_table.appendChild(dom_tr);
                var dom_td1 = document.createElement("td");
                dom_tr.appendChild(dom_td1);
                dom_td1.innerHTML = row[1];
                dom_td1.setAttribute("bgcolor", bg_color);
                
                var dom_td2 = document.createElement("td");
                dom_tr.appendChild(dom_td2);
                dom_td2.innerHTML = row[6];
                dom_td2.setAttribute("bgcolor", bg_color);
                dom_td2.setAttribute("style", "min-width: 100px;");
                
                var dom_td3 = document.createElement("td");
                dom_tr.appendChild(dom_td3);
                dom_td3.innerHTML = row[2];
                dom_td3.setAttribute("bgcolor", bg_color);
                
                var dom_td4 = document.createElement("td");
                dom_tr.appendChild(dom_td4);
                var dom_input = document.createElement("input");
                dom_td4.appendChild(dom_input);
                dom_td4.setAttribute("bgcolor", bg_color);
                dom_input.setAttribute("id", row[0]);
                dom_input.setAttribute("type", "checkbox");
                if (current_protein_set.has(row[0])) dom_input.setAttribute("checked", "true");
                dom_input.setAttribute("onchange", "if(this.checked) current_protein_set.add(parseInt(this.id)); else current_protein_set.delete(parseInt(this.id));");
            }
            
            
        }
    }
    xmlhttp_protein.open("GET", request, true);
    xmlhttp_protein.send();
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
