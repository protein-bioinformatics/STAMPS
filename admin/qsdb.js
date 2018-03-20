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
letter_sizes = [];
point_suffix_length = 0;


global_manage_data = -1;
global_pathway_data = -1;
global_protein_data = -1;
global_metabolite_data = -1;
selected_metabolite = -1;
selected_metabolite_node = -1;
selected_pathway_node = -1;
selected_protein_node = -1;
selected_label_node = -1;

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


manage_sort_columns = {"proteins": {}, "pathways": {}, "metabolites": {}};
manage_columns = {"proteins": [], "pathways": [], "metabolites": []};
manage_current_entry = "proteins";
manage_sort_column = 1;
manage_max_pages = -1;
manage_current_page = 0;

max_per_page = 30;
chromosomes = {"mouse": []};



function init(){
    
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
    
    var ctx = document.getElementById("renderarea").getContext("2d");
    ctx.font = "17px serif";
    for (var i = 0; i < 128; ++i){
        letter_sizes.push(ctx.measureText(String.fromCharCode(i)).width);
    }
    point_suffix_length = 3 * letter_sizes['.'.charCodeAt(0)];
    
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    
    document.addEventListener('keydown', key_down, false);
    document.getElementById("select_species_background").addEventListener("click", hide_select_species, false);
    document.getElementById("select_pathway_background").addEventListener("click", hide_select_pathway, false);
    window.addEventListener('resize', resize_pathway_view, false);
    window.addEventListener('resize', resize_manage_view, false);
    
    window.addEventListener('resize', resize_ms_view, false);
    document.getElementById("msarea").addEventListener("mousewheel", view_mouse_wheel_listener, false);
    document.getElementById("msarea").addEventListener('DOMMouseScroll', view_mouse_wheel_listener, false);
    
    
    change_pathway();
    
    // get chromosomes
    var xmlhttp_chr = new XMLHttpRequest();
    xmlhttp_chr.onreadystatechange = function() {
        if (xmlhttp_chr.readyState == 4 && xmlhttp_chr.status == 200) {
            var ideom_data = JSON.parse(xmlhttp_chr.responseText);
            for (var chr in ideom_data) chromosomes["mouse"].push(chr);
            chromosomes["mouse"].sort(function(a, b) {
                var int_a = 0;
                var int_b = 0;
                try{
                    int_a = parseInt(a);
                    int_b = parseInt(b);
                    return int_a > int_b;
                } catch (e) {
                    return a < b;
                }
            });
            change_add_manage_proteins_chromosome();
        }
    }
    xmlhttp_chr.open("GET", "/qsdb/cgi-bin/get-chromosomes.py?species=mouse", true);
    xmlhttp_chr.send();
    
    
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
    
    var xmlhttp_ga = new XMLHttpRequest();
    xmlhttp_ga.onreadystatechange = function() {
        if (xmlhttp_ga.readyState == 4 && xmlhttp_ga.status == 200) {
            var request = xmlhttp_ga.responseText;
        }
    }
    xmlhttp_ga.open("GET", "/qsdb/cgi-bin/analytics.py?action=request&label=stamp-editor", true);
    xmlhttp_ga.send();
    
    
    var xmlhttp_prot_col = new XMLHttpRequest();
    xmlhttp_prot_col.onreadystatechange = function() {
        if (xmlhttp_prot_col.readyState == 4 && xmlhttp_prot_col.status == 200) {
            var request = JSON.parse(xmlhttp_prot_col.responseText);
            for (var i = 1; i < request.length; ++i){
                manage_sort_columns["proteins"][i.toString()] = request[i] + ":ASC";
                manage_sort_columns["proteins"][(-i).toString()] = request[i] + ":DESC";
                manage_columns["proteins"].push(request[i]);
            }
        }
    }
    xmlhttp_prot_col.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=proteins_col", false);
    xmlhttp_prot_col.send();
    
    
    var xmlhttp_meta_col = new XMLHttpRequest();
    xmlhttp_meta_col.onreadystatechange = function() {
        if (xmlhttp_meta_col.readyState == 4 && xmlhttp_meta_col.status == 200) {
            var request = JSON.parse(xmlhttp_meta_col.responseText);
            for (var i = 1; i < request.length; ++i){
                manage_sort_columns["metabolites"][i.toString()] = request[i] + ":ASC";
                manage_sort_columns["metabolites"][(-i).toString()] = request[i] + ":DESC";
                manage_columns["metabolites"].push(request[i]);
            }
        }
    }
    xmlhttp_meta_col.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=metabolites_col", false);
    xmlhttp_meta_col.send();
    
    
    var xmlhttp_pw_col = new XMLHttpRequest();
    xmlhttp_pw_col.onreadystatechange = function() {
        if (xmlhttp_pw_col.readyState == 4 && xmlhttp_pw_col.status == 200) {
            var request = JSON.parse(xmlhttp_pw_col.responseText);
            for (var i = 1; i < request.length; ++i){
                manage_sort_columns["pathways"][i.toString()] = request[i] + ":ASC";
                manage_sort_columns["pathways"][(-i).toString()] = request[i] + ":DESC";
                manage_columns["pathways"].push(request[i]);
            }
        }
    }
    xmlhttp_pw_col.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=pathways_col", false);
    xmlhttp_pw_col.send();
    
    
    manage_change_entity("proteins");
    resize_manage_view();
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
            data[tmp_element.id] = tmp_element;
            assemble_elements();
            draw();
            switch (toolbox_button_selected){
                    
                case toolbox_states.CREATE_PROTEIN:
                    edge_data[result[1]] = {'i': result[1], 'n': tmp_element.id, 'in': 'left', 'out': 'right', 'v': 0, 'r': []};
                    tmp_element = new node({"x": "0", "y": "0", "t": "protein", "i": -1, "n": "-", "p": []});
                    break;
                    
                case toolbox_states.CREATE_LABEL:
                    data[tmp_element.id].foreign_id = result[1];
                    tmp_element = new node({"x": "0", "y": "0", "t": "label", "i": -1, "n": "undefined"});
                    break;
                    
                case toolbox_states.CREATE_MEMBRANE:
                    tmp_element = new node({"x": "0", "y": "0", "t": "membrane", "i": -1, "n": "-"});
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
                    
    
                    document.getElementById("editor_select_protein_table_filter_name").value = "";
                    document.getElementById("editor_select_protein_table_filter_accession").value = "";
                    document.getElementById("editor_select_protein_table_filter_description").value = "";
                    document.getElementById("editor_select_protein_table_filter_node").checked = false;
                    
                    selected_protein_node = highlight_element.id;
                    current_protein_set = new Set(highlight_element.proteins);
                    editor_fill_protein_table();
                    document.getElementById("editor_select_protein").style.display = "inline";
                    document.getElementById("waiting_background").style.display = "inline";
                    document.getElementById("renderarea").style.filter = "blur(5px)";
                    document.getElementById("toolbox").style.filter = "blur(5px)";
                    break;
                
                case "metabolite":
                    
                    document.getElementById("editor_select_metabolite_table_filter_name").value = "";
                    document.getElementById("editor_select_metabolite_table_filter_cnumber").value = "";
                    document.getElementById("editor_select_metabolite_table_filter_formula").value = "";
                    metabolite_create_action = false;
                    selected_metabolite_node = highlight_element.id;
                    editor_fill_metabolite_table();
                    document.getElementById("editor_select_metabolite").style.display = "inline";
                    document.getElementById("waiting_background").style.display = "inline";
                    document.getElementById("renderarea").style.filter = "blur(5px)";
                    document.getElementById("toolbox").style.filter = "blur(5px)";
                    break;
                    
                case "label":
                    selected_label_node = highlight_element.id;
                    document.getElementById("label_text_field").style.display = "inline";
                    document.getElementById("label_text_field_background").style.display = "inline";
                    
                    var label_width = document.getElementById("label_text_field").offsetWidth;
                    var label_height = document.getElementById("label_text_field").offsetHeight;
                    
                    
                    document.getElementById("label_text_field").value = highlight_element.name;
                    var text_len = highlight_element.name.length;
                    document.getElementById("label_text_field").setSelectionRange(text_len, text_len);
                    document.getElementById("label_text_field").style.left = (toolbox_width + highlight_element.x - (label_width >> 1)).toString() + "px";
                    document.getElementById("label_text_field").style.top = (highlight_element.y - (label_height >> 1)).toString() + "px";
                    document.getElementById("label_text_field").focus();
                    
                default:
                    break;
            }
        }
    }
}


function label_text_field_listener(evt){
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    if (charCode == 10 || charCode == 13){
        update_label();
    }
}


function update_label(){
    document.getElementById("label_text_field").style.display = "none";
    document.getElementById("label_text_field_background").style.display = "none";
    
    var label = document.getElementById("label_text_field").value;
    if (label == "") label = "undefined";
    
    var request = "action=set&table=labels&id=" + data[selected_label_node].foreign_id + "&column=label&value=" + label;
    var result = update_entry(request);
    if (result){
        var ctx = document.getElementById("renderarea").getContext("2d");
        data[selected_label_node].name = label;
        data[selected_label_node].setup_label_meta();
        draw();
    };
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
        tmp_element = new node({"x": "0", "y": "0", "t": "pathway", "i": -1, "n": "undefined"});
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
        tmp_element = new node({"x": "0", "y": "0", "t": "metabolite", "i": -1, "n": "-"});
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
        var request_prot = "/qsdb/cgi-bin/get-proteins.bin?ids=" + prot.proteins.join(":") + "&species=mouse";
        // get proteins
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                request_load_proteins(JSON.parse(xmlhttp.responseText), false);
            }
        }
        
        xmlhttp.open("GET", request_prot, false);
        xmlhttp.send();
    
    }
    else {
        prot.proteins = [];
    }
    
    prot.setup_protein_meta();
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
    request = "/qsdb/admin/cgi-bin/delete-entity.py?" + request;
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
    request = "/qsdb/admin/cgi-bin/create-node.py?" + request;
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
                data[-1] = new node({"x": highlight_element.x, "y": highlight_element.y, "t": "point", "i": highlight_element.id, "n": "undefined"});
                
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
            data[-2] = new node({"x": Math.floor(res.x - (res.x % (base_grid * factor)) + offset_move_x), "y": Math.floor(res.y - (res.y % (base_grid * factor)) + offset_move_y), "t": "point", "i": -2, "n": "undefined"});
            
            
            
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
    var request = "/qsdb/admin/cgi-bin/add-edge.py?start_id=" + start_id + "&end_id=" + end_id;
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
            tmp_element = new node({"x": "0", "y": "0", "t": "pathway", "i": -1, "n": "undefined"});
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_PROTEIN:
            tmp_element = new node({"x": "0", "y": "0", "t": "protein", "i": -1, "n": "-", "p": []});
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_METABOLITE:
            tmp_element = new node({"x": "0", "y": "0", "t": "metabolite", "i": -1, "n": "-"});
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_LABEL:
            tmp_element = new node({"x": "0", "y": "0", "t": "label", "i": -1, "n": "undefined"});
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_MEMBRANE:
            tmp_element = new node({"x": "0", "y": "0", "t": "membrane", "i": -1, "n": "-"});
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
    var request = "/qsdb/admin/cgi-bin/update-node.py?id=";
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
    /*
    if (event.which === 32){
        pathway_to_svg();
    }
    */
    
    
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
        if (toolbox_button_selected == toolbox_states.ROTATE_PATHWAY && (data[this.start_id].type == 'protein' || data[this.end_id].type == 'protein')) return;
        if (toolbox_button_selected == toolbox_states.ROTATE_PROTEIN && (data[this.start_id].type == 'pathway' || data[this.end_id].type == 'pathway')) return;
        
        
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
    var request = "/qsdb/admin/cgi-bin/update-edge.py?id=";
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
    manage_fill_protein_table();
}

function close_manage_entries(){
    document.getElementById("manage_entries").style.display = "none";
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("navigation").style.filter = "";
}



function editor_fill_metabolite_table(){
    var filter_name = document.getElementById("editor_select_metabolite_table_filter_name").value;
    var filter_cnumber = document.getElementById("editor_select_metabolite_table_filter_cnumber").value;
    var filter_formula = document.getElementById("editor_select_metabolite_table_filter_formula").value;
    
    var request = "action=get&type=metabolites";
    request += "&column=" + metabolite_sort_columns[metabolite_sort_column];
    request += "&limit=" + (metabolite_current_page * max_per_page).toString() + ":" + max_per_page.toString();
    if (filter_name != "" || filter_cnumber != "" || filter_formula != ""){
        request += "&filters=name:" + filter_name + ",c_number:" + filter_cnumber + ",formula:" + filter_formula;
    }
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
    dom_th_cnumber.innerHTML = "C&nbsp;number" + ((metabolite_sort_column == 2) ? " " + sign_up : ((metabolite_sort_column == -2) ? " " + sign_down : ""));
    dom_th_cnumber.setAttribute("width", "150px");
    dom_th_cnumber.setAttribute("style", "cursor: pointer; min-width: 150px; max-width: 150px;");
    
    
    var dom_th_formula = document.createElement("th");
    dom_table_header.appendChild(dom_th_formula);
    dom_th_formula.setAttribute("onclick", "metabolite_sort_column = " + ((metabolite_sort_column == 3) ? " -3;" : "3;") + "; editor_fill_metabolite_table();");
    dom_th_formula.setAttribute("style", "cursor: pointer;");
    dom_th_formula.innerHTML = "Chemical formula" + ((metabolite_sort_column == 3) ? " " + sign_up : ((metabolite_sort_column == -3) ? " " + sign_down : ""));
    dom_th_formula.setAttribute("width", "250px");
    dom_th_formula.setAttribute("style", "cursor: pointer; min-width: 250px; max-width: 250px;");
    
    
    
    
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
                switch (metabolite_sort_column){
                    case 1:
                        return a[1] > b[1];
                    case -1:
                        return a[1] < b[1];
                    case 2:
                        return a[2] > b[2];
                    case -2:
                        return a[2] < b[2];
                    case 3:
                        return a[3] > b[3];
                    case -3:
                        return a[3] < b[3];
                }
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
                dom_td1.setAttribute("width", "100%");
                
                var dom_td2 = document.createElement("td");
                dom_tr.appendChild(dom_td2);
                dom_td2.innerHTML = row[2];
                dom_td2.setAttribute("bgcolor", bg_color);
                dom_td2.setAttribute("width", "150px");
                dom_td2.setAttribute("style", "min-width: 150px; max-width: 150px;");
                
                var dom_td3 = document.createElement("td");
                dom_tr.appendChild(dom_td3);
                dom_td3.innerHTML = row[3];
                dom_td3.setAttribute("bgcolor", bg_color);
                dom_td3.setAttribute("width", "250px");
                dom_td3.setAttribute("style", "min-width: 250px; max-width: 250px;");
                
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
    var filter_name = document.getElementById("editor_select_protein_table_filter_name").value;
    var filter_accession = document.getElementById("editor_select_protein_table_filter_accession").value;
    var filter_description = document.getElementById("editor_select_protein_table_filter_description").value;
    var filter_node = document.getElementById("editor_select_protein_table_filter_node").checked;
    
    var request = "action=get&type=proteins";
    request += "&column=" + protein_sort_columns[protein_sort_column];
    request += "&limit=" + (protein_current_page * max_per_page).toString() + ":" + max_per_page.toString();
    if (filter_name != "" || filter_accession != "" || filter_description != ""){
        request += "&filters=name:" + filter_name + ",accession:" + filter_accession + ",definition:" + filter_description;
    }
    if (filter_node) request += "&checked=" + selected_protein_node;
    request = "/qsdb/admin/cgi-bin/manage-entries.py?" + request;
    
    var sign_up = String.fromCharCode(9652);
    var sign_down = String.fromCharCode(9662);
    
    var dom_table_header = document.getElementById("editor_select_protein_table_header");
    dom_table_header.innerHTML = ""
    var dom_th_name = document.createElement("th");
    dom_table_header.appendChild(dom_th_name);
    dom_th_name.setAttribute("onclick", "protein_sort_column = " + ((protein_sort_column == 1) ? " -1;" : "1;") + "; editor_fill_protein_table();");
    dom_th_name.innerHTML = "Name" + ((protein_sort_column == 1) ? " " + sign_up : ((protein_sort_column == -1) ? " " + sign_down : ""));
    dom_th_name.setAttribute("width", "150px");
    dom_th_name.setAttribute("style", "cursor: pointer; min-width: 150px; max-width: 150px;");
    
    
    var dom_th_uniprot = document.createElement("th");
    dom_table_header.appendChild(dom_th_uniprot);
    dom_th_uniprot.setAttribute("onclick", "protein_sort_column = " + ((protein_sort_column == 2) ? " -2;" : "2;") + "; editor_fill_protein_table();");
    dom_th_uniprot.innerHTML = "Uniprot" + ((protein_sort_column == 2) ? " " + sign_up : ((protein_sort_column == -2) ? " " + sign_down : ""));
    dom_th_uniprot.setAttribute("width", "120px");
    dom_th_uniprot.setAttribute("style", "cursor: pointer; min-width: 120px; max-width: 120px;");
    
    
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
    
    
    var xmlhttp_protein = new XMLHttpRequest();
    xmlhttp_protein.onreadystatechange = function() {
        if (xmlhttp_protein.readyState == 4 && xmlhttp_protein.status == 200) {
            global_protein_data = JSON.parse(xmlhttp_protein.responseText);
            var global_protein_data_sorted = [];
            for (var protein_id in global_protein_data) global_protein_data_sorted.push(global_protein_data[protein_id]);
            global_protein_data_sorted = global_protein_data_sorted.sort(function(a, b) {
                switch (protein_sort_column){
                    case 1:
                        return a[1] > b[1];
                    case -1:
                        return a[1] < b[1];
                    case 2:
                        return a[5] > b[5];
                    case -2:
                        return a[5] < b[5];
                    case 3:
                        return a[2] > b[2];
                    case -3:
                        return a[2] < b[2];
                }
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
                dom_td1.setAttribute("width", "150px");
                dom_td1.setAttribute("style", "min-width: 150px; max-width: 150px;");
                
                var dom_td2 = document.createElement("td");
                dom_tr.appendChild(dom_td2);
                dom_td2.innerHTML = row[5];
                dom_td2.setAttribute("bgcolor", bg_color);
                dom_td2.setAttribute("width", "120px");
                dom_td2.setAttribute("style", "min-width: 120px; max-width: 120px;");
                
                var dom_td3 = document.createElement("td");
                dom_tr.appendChild(dom_td3);
                dom_td3.innerHTML = row[2];
                dom_td3.setAttribute("bgcolor", bg_color);
                dom_td3.setAttribute("width", "100%");
                
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
    xmlhttp_protein.open("GET", encodeURI(request), false);
    xmlhttp_protein.send();
}



function manage_change_entity(entity){
    manage_change_entity = entity;
    var xmlhttp_entity = new XMLHttpRequest();
    xmlhttp_entity.onreadystatechange = function() {
        if (xmlhttp_entity.readyState == 4 && xmlhttp_entity.status == 200) {
            manage_max_pages = Math.floor(parseInt(xmlhttp_entity.responseText) / max_per_page) + 1;
        }
    }
    xmlhttp_entity.open("GET", "/qsdb/admin/cgi-bin/manage-entries.py?action=get&type=" + entity + "_num", true);
    xmlhttp_entity.send();
    manage_current_page = 0;
    
    var dom_tr = document.getElementById("editor_select_manage_table_filters");
    var dom_th_nav_del = document.createElement("td");
    dom_tr.appendChild(dom_th_nav_del);
    dom_th_nav_del.innerHTML = "&nbsp;";
    for (var i = 0; i < manage_columns[entity].length; ++i){
        var dom_td = document.createElement("td");
        dom_tr.appendChild(dom_td);
        var dom_input = document.createElement("input");
        dom_td.appendChild(dom_input);
        dom_input.setAttribute("type", "text");
        dom_input.setAttribute("style", "width: 100%; box-sizing: border-box;");
        dom_input.setAttribute("id", "editor_select_manage_table_filter_" + i.toString());
        dom_input.setAttribute("onkeyup", "manage_current_page = 0; manage_fill_protein_table();");
    }
}



function manage_fill_protein_table(){
    
    var filters = "";
    for (var i = 0; i < manage_columns[manage_change_entity].length; ++i){
        var filter_field = document.getElementById("editor_select_manage_table_filter_" + i.toString());
        if (filter_field.value.length > 0){
            if (filters.length > 0) filters += ",";
            filters += manage_columns[manage_change_entity][i] + ":" + filter_field.value;
        }
    }
    
    var request = "action=get&type=" + manage_change_entity;
    request += "&column=" + manage_sort_columns[manage_current_entry][manage_sort_column];
    request += "&limit=" + (manage_current_page * max_per_page).toString() + ":" + max_per_page.toString();
    if (filters.length > 0) request += "&filters=" + filters;
    request = "/qsdb/admin/cgi-bin/manage-entries.py?" + request;
    
    
    var sign_up = String.fromCharCode(9652);
    var sign_down = String.fromCharCode(9662);
    
    
    
    
    var dom_table_header = document.getElementById("editor_select_manage_table_header");
    dom_table_header.innerHTML = ""
    var dom_th_del = document.createElement("th");
    dom_table_header.appendChild(dom_th_del);
    dom_th_del.innerHTML = "Del";
    for (var i = 1; i <= 12; ++i){
        var dom_th_name = document.createElement("th");
        dom_table_header.appendChild(dom_th_name);
        dom_th_name.setAttribute("onclick", "manage_sort_column = " + ((manage_sort_column == i) ? "-" + i.toString() + ";" : i.toString() + ";") + "; manage_fill_protein_table();");
        var col_name = manage_sort_columns[manage_current_entry][i].split(":")[0];
        dom_th_name.innerHTML = col_name + ((manage_sort_column == i) ? " " + sign_up : ((manage_sort_column == -i) ? " " + sign_down : ""));
        if (i != 7) dom_th_name.setAttribute("style", "cursor: pointer; min-width: 200px; max-width: 200px;");
        else dom_th_name.setAttribute("style", "cursor: pointer; min-width: 1000px; max-width: 1000px;");
    }
    
    
    
    var dom_nav_cell = document.getElementById("editor_manage_page_navigation");
    dom_nav_cell.innerHTML = "";
    if (manage_current_page > 0){
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "manage_current_page = 0; manage_fill_protein_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;«&nbsp;";
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "manage_current_page -= 1; manage_fill_protein_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;‹&nbsp;&nbsp;";
    }
    
        
    var dom_page = document.createElement("select");
    dom_nav_cell.appendChild(dom_page);
    dom_page.setAttribute("style", "display: inline;");
    dom_page.setAttribute("onchange", "manage_current_page = this.selectedIndex; manage_fill_protein_table();");
    for (var i = 0; i < manage_max_pages; ++i){
        var dom_option = document.createElement("option");
        dom_page.appendChild(dom_option);
        dom_option.innerHTML = (i + 1).toString();
    }
    dom_page.selectedIndex = manage_current_page;
    
    if (manage_current_page + 1 < manage_max_pages){
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "manage_current_page += 1; manage_fill_protein_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;&nbsp;›&nbsp;";
        
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "manage_current_page = manage_max_pages - 1; manage_fill_protein_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;»&nbsp;";
    }
    
    var dom_space = document.createElement("div");
    dom_nav_cell.appendChild(dom_space);
    dom_space.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    dom_space.style = "display: inline;"
    
    var dom_new_protein = document.createElement("button");
    dom_nav_cell.appendChild(dom_new_protein);
    dom_new_protein.innerHTML = "New protein";
    dom_new_protein.setAttribute("onclick", "document.getElementById('add_manage_proteins').style.display = 'inline';");
    
    
    var xmlhttp_manage = new XMLHttpRequest();
    xmlhttp_manage.onreadystatechange = function() {
        if (xmlhttp_manage.readyState == 4 && xmlhttp_manage.status == 200) {
            global_manage_data = JSON.parse(xmlhttp_manage.responseText);
            var global_manage_data_sorted = [];
            for (var manage_id in global_manage_data) global_manage_data_sorted.push(global_manage_data[manage_id]);
            global_manage_data_sorted = global_manage_data_sorted.sort(function(a, b) {
                if (manage_sort_column > 0) return a[manage_sort_column] > b[manage_sort_column];
                return a[-manage_sort_column] < b[-manage_sort_column];
            });
            
            
            var dom_table = document.getElementById("editor_select_manage_table");
            dom_table.innerHTML = "";
    
            for (var i = 0; i < global_manage_data_sorted.length; ++i){
                var bg_color = (i & 1) ? "#DDDDDD" : "white";
                var row = global_manage_data_sorted[i];
                
                var dom_tr = document.createElement("tr");
                dom_table.appendChild(dom_tr);
                var dom_td_del = document.createElement("td");
                dom_tr.appendChild(dom_td_del);
                dom_td_del.setAttribute("bgcolor", bg_color);
                dom_td_del.setAttribute("style", "cursor: pointer; min-width: 32px; max-width: 32px;");
                dom_td_del.setAttribute("style", "cursor: pointer; min-width: 32px; max-width: 32px;");
                var dom_image = document.createElement("img");
                dom_td_del.appendChild(dom_image);
                dom_image.setAttribute("src", "../images/delete-small.png");
                dom_image.setAttribute("onclick", "manage_delete_protein(" + row[0] + ");");
                
                for (var j = 1; j < row.length; ++j){
                    var dom_td = document.createElement("td");
                    dom_tr.appendChild(dom_td);
                    dom_td.setAttribute("bgcolor", bg_color);
                    
                    if (j == 12){
                        dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                        var dom_select = document.createElement("select");
                        dom_td.appendChild(dom_select);
                        
                        var selected_option = 0;
                        var dom_option1 = document.createElement("option");
                        dom_select.appendChild(dom_option1);
                        dom_option1.innerHTML = "is";
                        if (row[j] == "is") selected_option = 0;
                        
                        var dom_option2 = document.createElement("option");
                        dom_select.appendChild(dom_option2);
                        dom_option2.innerHTML = "prm";
                        if (row[j] == "prm") selected_option = 1;
                        
                        var dom_option3 = document.createElement("option");
                        dom_select.appendChild(dom_option3);
                        dom_option3.innerHTML = "topn";
                        if (row[j] == "topn") selected_option = 2;
                        
                        dom_select.selectedIndex = selected_option;
                        dom_select.setAttribute("onchange", "change_select_type(this);");
                        dom_select.prot_id = row[0];
                        dom_select.col_id = j;
                    }
                    else if (j == 9){
                        dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                        var dom_select = document.createElement("select");
                        dom_td.appendChild(dom_select);
                        var selected_option = 0;
                        for (var k = 0; k < chromosomes["mouse"].length; ++k){
                            var dom_option = document.createElement("option");
                            dom_select.appendChild(dom_option);
                            dom_option.innerHTML = chromosomes["mouse"][k];
                            if (row[j] == chromosomes["mouse"][k]) selected_option = k;
                        }
                        dom_select.selectedIndex = selected_option;
                        dom_select.setAttribute("onchange", "change_select_type(this);");
                        dom_select.prot_id = row[0];
                        dom_select.col_id = j;
                    }
                    else if (j == 8){
                        var dom_input = document.createElement("input");
                        dom_td.appendChild(dom_input);
                        dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                        dom_input.setAttribute("type", "checkbox");
                        if (row[j] == "1") dom_input.setAttribute("checked", "true");
                        dom_input.setAttribute("onchange", "change_checkbox_type(this);");
                        dom_input.prot_id = row[0];
                        dom_input.col_id = j;
                    }
                    else if (j == 7){
                        dom_td.setAttribute("style", "min-width: 1000px; max-width: 1000px;");
                        var dom_div = document.createElement("div");
                        dom_td.appendChild(dom_div);
                        dom_div.setAttribute("onclick", "change_textarea_type(this, true);");
                        dom_div.setAttribute("style", "padding: 5px;");
                        dom_div.innerHTML = trim_text(row[j], 980);
                        dom_div.prot_id = row[0];
                        dom_div.col_id = j;
                    
                    }
                    else if (j == 3){
                        dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                        var dom_select = document.createElement("select");
                        dom_td.appendChild(dom_select);
                        dom_select.setAttribute("onchange", "change_select_type(this);");
                        dom_select.prot_id = row[0];
                        dom_select.col_id = j;
                        var dom_option = document.createElement("option");
                        dom_select.appendChild(dom_option);
                        dom_option.innerHTML = "mouse";
                    }
                    else {
                        var dom_div = document.createElement("div");
                        dom_td.appendChild(dom_div);
                        dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                        dom_div.setAttribute("onclick", "change_textfield_type(this, true);");
                        dom_div.setAttribute("style", "padding: 5px;");
                        dom_div.innerHTML = trim_text(row[j], 180);
                        dom_div.prot_id = row[0];
                        dom_div.col_id = j;
                    }                    
                    
                }
            }
            
            
        }
    }
    xmlhttp_manage.open("GET", encodeURI(request), false);
    xmlhttp_manage.send();
    document.getElementById("editor_select_manage_content_wrapper").style.width = (document.getElementById("editor_select_manage_table_header").offsetWidth).toString() + "px";
}


function manage_delete_protein(prot_id){
    var request = "type=protein&id=" + prot_id;
    request = "/qsdb/admin/cgi-bin/delete-entity.py?" + request
    
    
    if (confirm('Do you want to delete this protein?')) {
        var xmlhttp_protein_data = new XMLHttpRequest();
        xmlhttp_protein_data.onreadystatechange = function() {
            if (xmlhttp_protein_data.readyState == 4 && xmlhttp_protein_data.status == 200) {
                var request = xmlhttp_protein_data.responseText;
                if (request < 0){
                    alert("Error: protein could not be deleted from database.");
                }
                manage_fill_protein_table();
                if (prot_id in protein_dictionary){
                    delete protein_dictionary[prot_id];
                    for (node_id in data){
                        var data_node = data[node_id];
                        if (data_node.type == "protein"){
                            for(var i = data_node.proteins.length - 1; i >= 0; --i){
                                if (data_node.proteins[i] == prot_id){
                                    data_node.proteins.splice(i, 1);
                                }
                            }
                        }
                    }
                    draw();
                }
            }
        }
        xmlhttp_protein_data.open("GET", request, false);
        xmlhttp_protein_data.send();
    }
}


function trim_text(text, len){
    if (text.length == 0) return "";
    
    var tmp_len = 0;
    var i = 0;
    while (i < text.length && tmp_len + letter_sizes[text.charCodeAt(i)] + point_suffix_length < len){
        tmp_len += letter_sizes[text.charCodeAt(i)];
        i++;
    }
    if (i < text.length) text = text.substring(0, i) + "...";
    return text;
}


function change_checkbox_type(dom_obj){
    var prot_id = dom_obj.prot_id;
    var col_id = dom_obj.col_id;
    var content = dom_obj.checked;
    var request = "action=set&table=" + manage_current_entry + "&id=" + prot_id + "&column=" + manage_columns[manage_current_entry][col_id - 1] + "&value=" + (content ? "1" : "0");
       
    var result = update_entry(request);
    if (!result){
        alert("Error: database could not be updated.");
    }
    else {
        manage_fill_protein_table();
    }
}


function change_select_type(dom_obj){
    var prot_id = dom_obj.prot_id;
    var col_id = dom_obj.col_id;
    var content = dom_obj[dom_obj.selectedIndex].value;
    var request = "action=set&table=" + manage_current_entry + "&id=" + prot_id + "&column=" + manage_columns[manage_current_entry][col_id - 1] + "&value=" + content;
       
    var result = update_entry(request);
    if (!result){
        alert("Error: database could not be updated.");
    }
    else {
        manage_fill_protein_table();
    }
}


function change_textfield_type(dom_obj, to_text){
    if (to_text){
        var parent = dom_obj.parentNode;
        var prot_id = dom_obj.prot_id;
        var col_id = dom_obj.col_id;
        var content = global_manage_data[prot_id][col_id];
        
        parent.innerHTML = "";
        dom_obj = document.createElement("input");
        parent.appendChild(dom_obj);
        dom_obj.setAttribute("type", "text");
        dom_obj.setAttribute("value", content);
        dom_obj.setAttribute("onkeyup", "if (event.which == '13') change_textfield_type(this, false);");
        dom_obj.setAttribute("onblur", "change_textfield_type(this, false);");
        dom_obj.prot_id = prot_id;
        dom_obj.col_id = col_id;
        dom_obj.focus();
        dom_obj.setSelectionRange(content.length, content.length);
    }
    else {
        var parent = dom_obj.parentNode;
        var content = dom_obj.value;
        var prot_id = dom_obj.prot_id;
        var col_id = dom_obj.col_id;
        
        var request = "action=set&table=" + manage_current_entry + "&id=" + prot_id + "&column=" + manage_columns[manage_current_entry][col_id - 1] + "&value=" + content;
        
        
        var result = update_entry(request);
        if (!result){
            alert("Error: database could not be updated.");
        }
        else {
            manage_fill_protein_table();
        }
        
        parent.innerHTML = "";
        dom_obj = document.createElement("div");
        parent.appendChild(dom_obj);
        dom_obj.setAttribute("onclick", "change_textfield_type(this, true);");
        dom_obj.setAttribute("style", "padding: 5px;");
        dom_obj.prot_id = prot_id;
        dom_obj.col_id = col_id;
        dom_obj.innerHTML = trim_text(content);
        global_manage_data[prot_id][col_id] = content;
    }
}


function change_textarea_type(dom_obj, to_text){
    if (to_text){
        var parent = dom_obj.parentNode;
        var prot_id = dom_obj.prot_id;
        var col_id = dom_obj.col_id;
        var content = global_manage_data[prot_id][col_id];
        
        parent.innerHTML = "";
        dom_obj = document.createElement("textarea");
        parent.appendChild(dom_obj);
        dom_obj.innerHTML = content;
        dom_obj.setAttribute("onblur", "change_textarea_type(this, false);");
        dom_obj.setAttribute("style", "height: 200px; min-width: 980px; max-width: 980px;");
        dom_obj.prot_id = prot_id;
        dom_obj.col_id = col_id;
        dom_obj.focus();
        dom_obj.setSelectionRange(content.length, content.length);
    }
    else {
        var parent = dom_obj.parentNode;
        var content = dom_obj.value;
        var prot_id = dom_obj.prot_id;
        var col_id = dom_obj.col_id;
        
        var request = "action=set&table=" + manage_current_entry + "&id=" + prot_id + "&column=" + manage_columns[manage_current_entry][col_id - 1] + "&value=" + content;
        
        var result = update_entry(request);
        if (!result){
            alert("Error: database could not be updated.");
        }
        else {
            manage_fill_protein_table();
        }
        parent.innerHTML = "";
        dom_obj = document.createElement("div");
        parent.appendChild(dom_obj);
        dom_obj.setAttribute("onclick", "change_textarea_type(this, true);");
        dom_obj.setAttribute("style", "padding: 5px;");
        dom_obj.prot_id = prot_id;
        dom_obj.col_id = col_id;
        global_manage_data[prot_id][col_id] = content;
        dom_obj.innerHTML = trim_text(content);
    }
}



function resize_manage_view(){
    var w_width = window.innerWidth * 0.9;
    var w_height = window.innerHeight * 0.9;
    document.getElementById("editor_select_manage").style.width = w_width.toString() + "px";
    document.getElementById("editor_select_manage").style.height = w_height.toString() + "px";
    document.getElementById("editor_select_manage_table_wrapper").style.width = (w_width - 90).toString() + "px";
    document.getElementById("editor_select_manage_table_wrapper").style.height = (w_height - 200).toString() + "px";
    document.getElementById("editor_select_manage_content_wrapper").style.width = (document.getElementById("editor_select_manage_table_header").offsetWidth).toString() + "px";
    document.getElementById("editor_select_manage_content_wrapper").style.height = (w_height - 230).toString() + "px";
}



function hide_manage_entries (){
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("manage_entries").style.display = "none";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "none";
        document.getElementById("navigation").style.filter = "none";
    }
}


function change_add_manage_proteins_chromosome(){
    var species = document.getElementById("add_manage_proteins_species")[document.getElementById("add_manage_proteins_species").selectedIndex].value;
    
    if (species in chromosomes){
        var dom_chromosome_select = document.getElementById("add_manage_proteins_chromosome");
        dom_chromosome_select.innerHTML = "";
        for (var i = 0; i < chromosomes[species].length; ++i){
            var dom_option = document.createElement("option");
            dom_chromosome_select.appendChild(dom_option);
            dom_option.innerHTML = chromosomes[species][i];
        }
    }
}



function request_protein_data(){
    var accession = document.getElementById("add_manage_proteins_accession").value;
    if (accession.length < 1) return;
    
    var request = "/qsdb/admin/cgi-bin/request-protein-data.py?accession=" + accession;
    
    var xmlhttp_protein_data = new XMLHttpRequest();
    xmlhttp_protein_data.onreadystatechange = function() {
        if (xmlhttp_protein_data.readyState == 4 && xmlhttp_protein_data.status == 200) {
            var request = JSON.parse(xmlhttp_protein_data.responseText);
            if ("name" in request) document.getElementById("add_manage_proteins_name").value = request["name"];
            if ("definition" in request) document.getElementById("add_manage_proteins_definition").value = request["definition"];
            if ("fasta" in request) document.getElementById("add_manage_proteins_fasta").value = request["fasta"];
            if ("ec_number" in request) document.getElementById("add_manage_proteins_ec_number").value = request["ec_number"];
            if ("kegg_id" in request) document.getElementById("add_manage_proteins_kegg").value = request["kegg_id"];
            if ("chr_start" in request) document.getElementById("add_manage_proteins_chr_start").value = request["chr_start"];
            if ("chr_end" in request) document.getElementById("add_manage_proteins_chr_end").value = request["chr_end"];
            if ("unreviewed" in request) document.getElementById("add_manage_proteins_unreviewed").checked = request["unreviewed"];
            else document.getElementById("add_manage_proteins_unreviewed").checked = false;
            if ("chromosome" in request){
                var dom_chromosome_select = document.getElementById("add_manage_proteins_chromosome");
                var selected_index = 0;
                for (var i = 1; i < dom_chromosome_select.length; ++i){
                    if (dom_chromosome_select[i].innerHTML == request["chromosome"]){
                        selected_index = i;
                        break;
                    }
                }
                dom_chromosome_select.selectedIndex = selected_index;
            }
            if ("species" in request){
                var dom_species_select = document.getElementById("add_manage_proteins_species");
                var selected_index = -1;
                for (var i = 0; i < dom_species_select.length; ++i){
                    if (dom_species_select[i].innerHTML == request["species"]){
                        selected_index = i;
                        break;
                    }
                }
                if (selected_index >= 0) dom_species_select.selectedIndex = selected_index;
                else alert("Warning: species '" + request["species"] + "' not registered in database!");
            }
        }
    }
    xmlhttp_protein_data.open("GET", request, false);
    xmlhttp_protein_data.send();
}


function add_manage_proteins_add(){
    
    var a = parseInt(document.getElementById("add_manage_proteins_chr_start").value);
    if (isNaN(a) && document.getElementById("add_manage_proteins_chr_start").value.length > 0){
        alert("Warning: 'Chromosome start' must be an integer.");
        return;
    }
    
    a = parseInt(document.getElementById("add_manage_proteins_chr_end").value);
    if (isNaN(a) && document.getElementById("add_manage_proteins_chr_end").value.length > 0){
        alert("Warning: 'Chromosome end' must be an integer.");
        return;
    }
    
    var request = "name:" + document.getElementById("add_manage_proteins_name").value;
    request += ",accession:" + document.getElementById("add_manage_proteins_accession").value;
    request += ",definition:" + document.getElementById("add_manage_proteins_definition").value;
    request += ",fasta:" + document.getElementById("add_manage_proteins_fasta").value;
    request += ",ec_number:" + document.getElementById("add_manage_proteins_ec_number").value;
    request += ",kegg_link:" + document.getElementById("add_manage_proteins_kegg").value;
    var val = document.getElementById("add_manage_proteins_chr_start").value;
    request += ",chr_start:" + (val.length > 0 ? val : "-1");
    val = document.getElementById("add_manage_proteins_chr_end").value;
    request += ",chr_end:" + (val.length > 0 ? val : "-1");
    request += ",unreviewed:" + (document.getElementById("add_manage_proteins_unreviewed").checked ? "1" : "0");
    request += ",chromosome:" + document.getElementById("add_manage_proteins_chromosome")[document.getElementById("add_manage_proteins_chromosome").selectedIndex].value;
    request += ",species:" + document.getElementById("add_manage_proteins_species")[document.getElementById("add_manage_proteins_species").selectedIndex].value;
    
    request = "/qsdb/admin/cgi-bin/manage-entries.py?action=insert&type=proteins&data=" + request;
    
    var xmlhttp_add_protein = new XMLHttpRequest();
    xmlhttp_add_protein.onreadystatechange = function() {
        if (xmlhttp_add_protein.readyState == 4 && xmlhttp_add_protein.status == 200) {
            var request = xmlhttp_add_protein.responseText;
            if (request < 0){
                alert("An error has occured while adding the protein to the database. Please contact the administrator.");
            }
            document.getElementById('add_manage_proteins').style.display = 'none';
            manage_fill_protein_table();
        }
    }
    xmlhttp_add_protein.open("GET", request, false);
    xmlhttp_add_protein.send();
}


document.addEventListener('DOMContentLoaded', init, false);
