

toolbox_width = 300;
toolbox_states = {
    CREATE_PATHWAY: 0,
    CREATE_PROTEIN: 1,
    CREATE_METABOLITE: 2,
    CREATE_LABEL: 3,
    CREATE_MEMBRANE: 4,
    CREATE_BG_IMAGE: 5,
    DRAW_EDGE: 6,
    MOVE_ENTITY: 7,
    CHANGE_EDGE_ANCHOR: 8,
    ROTATE_METABOLITE_LABEL: 9,
    HIGHLIGHT_METABOLITE: 10,
    CHANGE_EDGE: 11,
    DELETE_ENTRY: 12,
    CREATE_INVISIBLE: 13,
};
toolbox_buttons = ["toolbox_button_create_pathway",
                   "toolbox_button_create_protein",
                   "toolbox_button_create_metabolite",
                   "toolbox_button_create_label",
                   "toolbox_button_create_membrane",
                   "toolbox_button_create_bg_image",
                   "toolbox_button_draw_edge",
                   "toolbox_button_move_entity",
                   "toolbox_button_change_edge_anchor",
                   "toolbox_button_rotate_metabolite_label",
                   "toolbox_button_highlight_metabolite",
                   "toolbox_button_change_edge",
                   "toolbox_button_delete_entity",
                   "toolbox_button_create_invisible"];
                   
toolbox_button_selected = -1;
entity_moving = -1;
tmp_element = -1;
tmp_edge = -1;
letter_sizes = [];
point_suffix_length = 0;
deletion_cypher = "39d29e917c6901adf84418992b9b3892d37b61aefbc0f1fb353996e1ff8a2958";
spectrum_selection_color = "#80c8ff";
data_separator = "~";
specific_node_addition = "&unreviewed=true";

global_manage_data = -1;
global_protein_data = -1;
global_metabolite_data = -1;
selected_metabolite = -1;
selected_metabolite_node = -1;
selected_pathway_node = -1;
selected_protein_node = -1;
selected_image_node = -1;
selected_label_node = -1;
edge_change_selected = -1;
scaling_element = -1;
rescaling = -1;
filter_separation_char = String.fromCharCode(6);

protein_sort_columns = {'-3': "definition:DESC", '-2': "accession:DESC", '-1': "name:DESC", 1: "name:ASC", 2: "accession:ASC", 3: "definition:ASC"};
protein_sort_column = 1;
protein_max_pages = -1;
protein_current_page = 0;
current_protein_set = -1;

loci_sort_columns = {'-3': "definition:DESC", '-2': "accession:DESC", '-1': "name:DESC", 1: "name:ASC", 2: "accession:ASC", 3: "definition:ASC"};
loci_sort_column = 1;
loci_max_pages = -1;
loci_current_page = 0;
current_loci_set = new Set();
edited_loci_set = new Set();
editor_select_loci_select_index = -1;

metabolite_sort_columns = {'-5': "formula:DESC", '-3': "lm_id:DESC", '-3': "c_number:DESC", '-2': "short_name:DESC", '-1': "name:DESC", 1: "name:ASC", 2: "short_name:ASC", 3: "c_number:ASC", 4: "lm_id:ASC", 5: "formula:ASC"};
metabolite_sort_column = 1;
metabolite_max_pages = -1;
metabolite_current_page = 0;
metabolite_create_action = true;


spectra_max_pages = -1;
spectra_max = -1;
spectra_current_page = 0;
current_spectrum_selected = 0;
curate_spectra_checks = {};

manage_sort_columns = {"pathway_groups": {}, "proteins": {}, "pathways": {}, "metabolites": {}, "species": {}, "tissues": {}, "loci_names": {}};
manage_columns = {"pathway_groups": [], "proteins": [], "pathways": [], "metabolites": [], "species": [], "tissues": [], "loci_names": []};
manage_current_entry = "proteins";
manage_sort_column = 1;
manage_max_pages = -1;
manage_current_page = 0;

max_per_page = 30;
max_spectra_per_page = 100;
chromosomes = {};
draw_anchor_start = "";
draw_anchor_end = "";
del_species_ncbi = "";
del_tissue_brenda = "";

function_names = [];

multiple_selection = new Set();



function init(){
    file_pathname = get_pathname() + "../";
    editor_mode = true;
    preview_element = new preview();
    select_field_element = new select_field();
    select_field_element.visible = false;
    load_tissues();
    get_pathway_groups();
    set_species_menu(false, false);
    add_species_events();
    
    infobox = new Infobox();
    zoom_sign_in = new zoom_sign(1);
    zoom_sign_out = new zoom_sign(0);
    //expand_collapse_obj = new expand_collapse();
    preview_element = new preview();
    
    
    var pg_select = document.getElementById("add_manage_pathways_group");
    var sorted_pathway_groups = [];
    for (var pg_id in pathway_groups) sorted_pathway_groups.push([pathway_groups[pg_id][3], pathway_groups[pg_id][1], pg_id]);
    sorted_pathway_groups.sort(function(a, b) {
        var int_a = parseInt(a[0]);
        var int_b = parseInt(b[0]);
        return int_a < int_b;
    });
    
    for (var row of sorted_pathway_groups){
        var pg_option = document.createElement("option");
        pg_select.appendChild(pg_option);
        
        pg_option.setAttribute("value", row[2]);
        pg_option.innerHTML = row[1];
    }
    if (pg_select.children.length > 0) pg_select.selectedIndex = 0;
    
    // get pathways
    var xmlhttp_pathways = new XMLHttpRequest();
    xmlhttp_pathways.onreadystatechange = function() {
        if (xmlhttp_pathways.readyState == 4 && xmlhttp_pathways.status == 200) {
            pathways = JSON.parse(xmlhttp_pathways.responseText);
            set_pathway_menu();
            change_pathway();
        }
    }
    xmlhttp_pathways.open("GET", file_pathname + "scripts/get-pathways.bin?all", true);
    xmlhttp_pathways.send();
    
    
    var ctx = document.getElementById("renderarea").getContext("2d");
    ctx.font = "17px serif";
    for (var i = 0; i < 128; ++i){
        letter_sizes.push(ctx.measureText(String.fromCharCode(i)).width);
    }
    point_suffix_length = 3 * letter_sizes['.'.charCodeAt(0)];
    
    
    document.documentElement.style.overflow = 'hidden';
    document.body.scroll = "no";
    
    document.addEventListener('keydown', key_down, false);
    document.getElementById("menu_background").addEventListener("click", close_navigation, false);
    window.addEventListener('resize', resize_pathway_view, false);
    window.addEventListener('resize', resize_manage_view, false);
    window.addEventListener('resize', function(event){resize_ms_view("curate_spectra");}, false);
    window.addEventListener('resize', custom_resize_ms_view, false);
    
    navigation_content = ["select_species", "select_signaling_pathway", "select_metabolic_pathway", "menu_background"];
    
    
    // get chromosomes
    var species_count = 0;
    var tmp_array = [];
    for (var curr_species in supported_species){
        chromosomes[curr_species] = [];
        
        var species_option = document.createElement("option");
        document.getElementById("add_manage_proteins_species").appendChild(species_option);
        
        species_option.setAttribute("value", curr_species);
        species_option.innerHTML = supported_species[curr_species];
        
        tmp_array.push(new XMLHttpRequest());
        tmp_array[species_count].species = curr_species;
        tmp_array[species_count].onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                
                var ideom_data = JSON.parse(this.responseText);
                for (var chr in ideom_data) chromosomes[this.species].push(chr);
                chromosomes[this.species].sort(function(a, b) {
                    var int_a = parseInt(a);
                    var int_b = parseInt(b);
                    if (!isNaN(int_a) && !isNaN(int_b)){
                        return -1 + 2 * (int_a > int_b);
                    }
                    else {
                        return a.localeCompare(b);
                    }
                });
                change_add_manage_proteins_chromosome();
                
            }
        }
        tmp_array[species_count].open("GET", file_pathname + "scripts/get-chromosomes.bin?species=" + curr_species, true);
        tmp_array[species_count].send();
        
        if (species_count++ == 0) species_option.setAttribute("checked", "true");
    }
    
    
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    c.onmousedown = mouse_down_listener;
    c.onmouseup = mouse_up_listener;
    c.onmousemove = mouse_move_listener;
    c.addEventListener("click", mouse_click_listener, false);
    c.addEventListener("dblclick", mouse_dblclick_listener, false);
    c.addEventListener("mousewheel", mouse_wheel_listener, false);
    c.addEventListener('DOMMouseScroll', mouse_wheel_listener, false);
    document.getElementById("curate_spectra_msarea").addEventListener("mousewheel", function(event){view_mouse_wheel_listener(event, "curate_spectra");}, false);
    document.getElementById("curate_spectra_msarea").addEventListener('DOMMouseScroll', function(event){view_mouse_wheel_listener(event, "curate_spectra");}, false);
    
    c.oncontextmenu = right_mouse_click_listener;
    
    document.getElementById("toolbox").style.top = (document.getElementById("navigation").offsetHeight).toString() + "px";
    document.getElementById("renderarea").style.left = (document.getElementById("toolbox").offsetWidth).toString() + "px";
    resize_pathway_view();
    
    // get number of metabolites
    var xmlhttp_metabolites = new XMLHttpRequest();
    xmlhttp_metabolites.onreadystatechange = function() {
        if (xmlhttp_metabolites.readyState == 4 && xmlhttp_metabolites.status == 200) {
            metabolite_max_pages = Math.floor(parseInt(xmlhttp_metabolites.responseText) / max_per_page) + 1;
        }
    }
    xmlhttp_metabolites.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=metabolites_num", true);
    xmlhttp_metabolites.send();
    
    
    
    // get number of proteins
    var xmlhttp_proteins = new XMLHttpRequest();
    xmlhttp_proteins.onreadystatechange = function() {
        if (xmlhttp_proteins.readyState == 4 && xmlhttp_proteins.status == 200) {
            protein_max_pages = Math.floor(parseInt(xmlhttp_proteins.responseText) / max_per_page) + 1;
            loci_max_pages = Math.floor(parseInt(xmlhttp_proteins.responseText) / max_per_page) + 1;
        }
    }
    xmlhttp_proteins.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=proteins_num", true);
    xmlhttp_proteins.send();
    
    
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
    xmlhttp_prot_col.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=proteins_col", true);
    xmlhttp_prot_col.send();
    
    
    // get number of spectra
    var xmlhttp_spectra = new XMLHttpRequest();
    xmlhttp_spectra.onreadystatechange = function() {
        if (xmlhttp_spectra.readyState == 4 && xmlhttp_spectra.status == 200) {
            spectra_max_pages = Math.floor(parseInt(xmlhttp_spectra.responseText) / max_spectra_per_page) + 1;
        }
    }
    xmlhttp_spectra.open("GET", file_pathname + "admin/scripts/curate-spectral-library.py?action=count&species=" + current_species, false);
    xmlhttp_spectra.send();
    
    
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
    xmlhttp_meta_col.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=metabolites_col", true);
    xmlhttp_meta_col.send();
    
    
    var xmlhttp_pg_col = new XMLHttpRequest();
    xmlhttp_pg_col.onreadystatechange = function() {
        if (xmlhttp_pg_col.readyState == 4 && xmlhttp_pg_col.status == 200) {
            var request = JSON.parse(xmlhttp_pg_col.responseText);
            for (var i = 1; i < request.length; ++i){
                manage_sort_columns["pathway_groups"][i.toString()] = request[i] + ":ASC";
                manage_sort_columns["pathway_groups"][(-i).toString()] = request[i] + ":DESC";
                manage_columns["pathway_groups"].push(request[i]);
            }
            manage_change_entity("pathway_groups");
            resize_manage_view();
        }
    }
    xmlhttp_pg_col.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=pathway_groups_col", true);
    xmlhttp_pg_col.send();
    
    
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
    xmlhttp_pw_col.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=pathways_col", true);
    xmlhttp_pw_col.send();
    
    
    var xmlhttp_species_col = new XMLHttpRequest();
    xmlhttp_species_col.onreadystatechange = function() {
        if (xmlhttp_species_col.readyState == 4 && xmlhttp_species_col.status == 200) {
            var request = JSON.parse(xmlhttp_species_col.responseText);
            for (var i = 1; i < request.length; ++i){
                manage_sort_columns["species"][i.toString()] = request[i] + ":ASC";
                manage_sort_columns["species"][(-i).toString()] = request[i] + ":DESC";
                manage_columns["species"].push(request[i]);
            }
        }
    }
    xmlhttp_species_col.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=species_col", true);
    xmlhttp_species_col.send();
    
    
    var xmlhttp_tissues_col = new XMLHttpRequest();
    xmlhttp_tissues_col.onreadystatechange = function() {
        if (xmlhttp_tissues_col.readyState == 4 && xmlhttp_tissues_col.status == 200) {
            var request = JSON.parse(xmlhttp_tissues_col.responseText);
            for (var i = 1; i < request.length; ++i){
                manage_sort_columns["tissues"][i.toString()] = request[i] + ":ASC";
                manage_sort_columns["tissues"][(-i).toString()] = request[i] + ":DESC";
                manage_columns["tissues"].push(request[i]);
            }
        }
    }
    xmlhttp_tissues_col.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=tissues_col", true);
    xmlhttp_tissues_col.send();
    
    
    var xmlhttp_loci_names_col = new XMLHttpRequest();
    xmlhttp_loci_names_col.onreadystatechange = function() {
        if (xmlhttp_loci_names_col.readyState == 4 && xmlhttp_loci_names_col.status == 200) {
            var request = JSON.parse(xmlhttp_loci_names_col.responseText);
            for (var i = 1; i < request.length; ++i){
                manage_sort_columns["loci_names"][i.toString()] = request[i] + ":ASC";
                manage_sort_columns["loci_names"][(-i).toString()] = request[i] + ":DESC";
                manage_columns["loci_names"].push(request[i]);
            }
        }
    }
    xmlhttp_loci_names_col.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=loci_names_col", true);
    xmlhttp_loci_names_col.send();
    
    
    
    var xmlhttp_function_names = new XMLHttpRequest();
    xmlhttp_function_names.onreadystatechange = function() {
        if (xmlhttp_function_names.readyState == 4 && xmlhttp_function_names.status == 200) {
            var request = JSON.parse(xmlhttp_function_names.responseText);
            for (var key in request){
                if (request[key][2] != 0 && request[key][2] != 1){
                    function_names.push([request[key][0], request[key][1] + " (EC: " + request[key][3] + ".)"]);
                }
            }
        }
    }
    xmlhttp_function_names.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=function_names", true);
    xmlhttp_function_names.send();
    
    
    analytics("stamps-editor-request");
}


function add_species_events(){
    var species_table = document.getElementById("select_species_table");
    for (var st_tr of species_table.children){
        var events = st_tr.children[0].attributes["onclick"].value;
        st_tr.children[0].setAttribute("onclick", events + " load_species_additional_data();");
    }
}





function load_species_additional_data(){
    // get number of spectra
    var xmlhttp_spectra = new XMLHttpRequest();
    xmlhttp_spectra.onreadystatechange = function() {
        if (xmlhttp_spectra.readyState == 4 && xmlhttp_spectra.status == 200) {
            spectra_max_pages = Math.floor(parseInt(xmlhttp_spectra.responseText) / max_spectra_per_page) + 1;
        }
    }
    xmlhttp_spectra.open("GET", file_pathname + "admin/scripts/curate-spectral-library.py?action=count&species=" + current_species, false);
    xmlhttp_spectra.send();
}






function resize_pathway_view(){
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    document.getElementById("toolbox").style.width = (toolbox_width).toString() + "px";
    document.getElementById("toolbox").style.top = (document.getElementById("navigation").offsetHeight).toString() + "px";
    document.getElementById("toolbox").style.height = (window.innerHeight - document.getElementById("navigation").offsetHeight).toString() + "px";
    c.style.left  = (toolbox_width).toString() + "px";
    resize_renderarea_width(0);
    ctx.canvas.height = window.innerHeight;
    preview_element.y = window.innerHeight - preview_element.height;
    
    document.getElementById("pathway_title_field").style.top = (document.getElementById('navigation').offsetHeight).toString() + "px";
    document.getElementById("pathway_title_field").style.left = (toolbox_width).toString() + "px";
    
    
    draw();
}





function resize_renderarea_width(subtract){
    var c = document.getElementById("renderarea");
    var ctx = c.getContext("2d");
    ctx.canvas.width  = window.innerWidth - toolbox_width - subtract;
}







function right_mouse_click_listener(e){
    if (highlight_element && toolbox_button_selected == toolbox_states.MOVE_ENTITY && highlight_element instanceof node && highlight_element.type == "membrane"){

        var value = !highlight_element.text_highlight;
        highlight_element.text_highlight = value;
        var request = "action=set&table=nodes&column=highlight&id=" + highlight_element.id + "&value=" + (value ? "1" : "0");
        
        var result = update_entry(request);
        if (result){
            draw();
        }
    }
    return false;
}






function mouse_click_listener(e){
    if (!pathway_is_loaded) return;
    
    
    if (toolbox_button_selected == toolbox_states.CREATE_PATHWAY || toolbox_button_selected == toolbox_states.CREATE_METABOLITE || toolbox_button_selected == toolbox_states.CREATE_PROTEIN || toolbox_button_selected == toolbox_states.CREATE_LABEL || toolbox_button_selected == toolbox_states.CREATE_MEMBRANE || toolbox_button_selected == toolbox_states.CREATE_BG_IMAGE || toolbox_button_selected == toolbox_states.CREATE_INVISIBLE){
        var x = Math.round(Math.floor((tmp_element.x - null_x) / factor) / base_grid) * base_grid;
        var y = Math.round(Math.floor((tmp_element.y - null_y) / factor) / base_grid) * base_grid;
        var request = "";
        switch (toolbox_button_selected){
            case toolbox_states.CREATE_PATHWAY:
                request = "type=pathway&pathway=" + current_pathway + "&x=" + x + "&y=" + y + "&foreign_id=-1";
                break;
                
            case toolbox_states.CREATE_PROTEIN:
                request = "type=protein&pathway=" + current_pathway + "&x=" + x + "&y=" + y;
                break;
                
            case toolbox_states.CREATE_METABOLITE:
                request = "type=metabolite&pathway=" + current_pathway + "&x=" + x + "&y=" + y + "&foreign_id=-1";
                break;
                
            case toolbox_states.CREATE_LABEL:
                request = "type=label&pathway=" + current_pathway + "&x=" + x + "&y=" + y;
                break;
                
            case toolbox_states.CREATE_MEMBRANE:
                request = "type=membrane&pathway=" + current_pathway + "&x=" + x + "&y=" + y;
                break;
                
            case toolbox_states.CREATE_BG_IMAGE:
                request = "type=image&pathway=" + current_pathway + "&x=" + x + "&y=" + y;
                break;
                
            case toolbox_states.CREATE_INVISIBLE:
                request = "type=invisible&pathway=" + current_pathway + "&x=" + x + "&y=" + y;
                break;
        }
        var result = create_node(request);
        if (result[0]){
            data[tmp_element.id] = tmp_element;
            assemble_elements();
            draw();
            switch (toolbox_button_selected){
                case toolbox_states.CREATE_PATHWAY:
                    tmp_element = new node({"x": "0", "y": "0", "t": "pathway", "i": -1, "n": "undefined"});  
                    break;        
                    
                case toolbox_states.CREATE_PROTEIN:
                    edge_data['reactions'][result[1]] = {'i': result[1], 'n': tmp_element.id, 'in': 'left', 'out': 'right', 'v': 0, 'r': []};
                    tmp_element = new node({"x": "0", "y": "0", "t": "protein", "i": -1, "n": "-", "p": []});
                    break;
                    
                case toolbox_states.CREATE_METABOLITE:
                    tmp_element = new node({"x": "0", "y": "0", "t": "metabolite", "i": -1, "n": "-"});
                    break;
                    
                case toolbox_states.CREATE_LABEL:
                    data[tmp_element.id].foreign_id = result[1];
                    tmp_element = new node({"x": "0", "y": "0", "t": "label", "i": -1, "n": "undefined"});
                    break;
                    
                case toolbox_states.CREATE_MEMBRANE:
                    tmp_element = new node({"x": "0", "y": "0", "t": "membrane", "i": -1, "n": "-"});
                    break;
                    
                case toolbox_states.CREATE_BG_IMAGE:
                    tmp_element = new node({"x": "0", "y": "0", "t": "image", "i": -1, "n": "-"});
                    break;
                    
                case toolbox_states.CREATE_INVISIBLE:
                    tmp_element = new node({"x": "0", "y": "0", "t": "invisible", "i": -1, "n": "-"});
                    break;
                    
            }
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
        };
    }
    else if (toolbox_button_selected == toolbox_states.DELETE_ENTRY){
        if (highlight_element){
            var request = "";
            if (highlight_element instanceof node){
                var node_id = highlight_element.id;
                
                switch (highlight_element.type){
                        
                    case "protein":
                        var del_reactions = [];
                        for (var reaction_id in edge_data['reactions']){
                            if (edge_data['reactions'][reaction_id]['n'] == node_id) del_reactions.push(reaction_id);
                        }
                        for (var i = 0; i < del_reactions.length; ++i) delete edge_data['reactions'][del_reactions[i]];
                        
                        
                        var del_directs = [];
                        for (var direct_id in edge_data['direct']){
                            if (edge_data['direct'][direct_id]['ns'] == node_id || edge_data['direct'][direct_id]['ne'] == node_id) del_directs.push(direct_id);
                        }
                        for (var i = 0; i < del_directs.length; ++i) delete edge_data['direct'][del_directs[i]];
                        break;
                        
                    case "metabolite":
                        var del_reactions = []
                        for (var reaction_id in edge_data['reactions']){
                            for (var reagent_id in edge_data['reactions'][reaction_id]['r']){
                                if (edge_data['reactions'][reaction_id]['r'][reagent_id]['n'] == node_id && data[edge_data['reactions'][reaction_id]['n']].type == "pathway") del_reactions.push(reaction_id);
                            }
                        }
                        for (var i = 0; i < del_reactions.length; ++i) delete edge_data['reactions'][del_reactions[i]];
                        
                        
                        for (var reaction_id in edge_data['reactions']){
                            var del_reagents = [];
                            for (var reagent_id in edge_data['reactions'][reaction_id]['r']){
                                if (edge_data['reactions'][reaction_id]['r'][reagent_id]['n'] == node_id) del_reagents.push(reagent_id);
                            }
                            for (var i = 0; i < del_reagents.length; ++i) delete edge_data['reactions'][reaction_id]['r'][del_reagents[i]];
                        }
                        
                        
                        var del_directs = [];
                        for (var direct_id in edge_data['direct']){
                            if (edge_data['direct'][direct_id]['ns'] == node_id || edge_data['direct'][direct_id]['ne'] == node_id) del_directs.push(direct_id);
                        }
                        for (var i = 0; i < del_directs.length; ++i) delete edge_data['direct'][del_directs[i]];
                        break;
                    
                    default:
                        var del_directs = [];
                        for (var direct_id in edge_data['direct']){
                            if (edge_data['direct'][direct_id]['ns'] == node_id || edge_data['direct'][direct_id]['ne'] == node_id) del_directs.push(direct_id);
                        }
                        for (var i = 0; i < del_directs.length; ++i) delete edge_data['direct'][del_directs[i]];
                        break;
                }
                
                delete data[node_id];
                request = "type=node&id=" + node_id;
                
            }
            else if (highlight_element instanceof edge){
                var is_direct = (highlight_element.reagent_id == -1);
                
                if (is_direct){
                    delete edge_data['direct'][highlight_element.reaction_id];
                    request = "type=edge_direct&id=" + highlight_element.reaction_id;
                }
                else {
                    delete edge_data['reactions'][highlight_element.reaction_id]['r'][highlight_element.reagent_id];
                    request = "type=edge&id=" + highlight_element.reagent_id;
                }
            }
            delete_entity(request);
            compute_edges();
            assemble_elements();
            draw();
        }
    }
    else if (toolbox_button_selected == toolbox_states.ROTATE_METABOLITE_LABEL){
        if (highlight_element && (highlight_element instanceof node) && highlight_element.type == "metabolite") rotate_metabolite_label();
    }
    else if (toolbox_button_selected == toolbox_states.HIGHLIGHT_METABOLITE){
        if (highlight_element && (highlight_element instanceof node) && (highlight_element.type == "metabolite" || highlight_element.type == "label")) highlight_label();
    }
    else if (toolbox_button_selected == toolbox_states.CHANGE_EDGE){
        if (highlight_element && (highlight_element instanceof edge)) change_edge_type();
    }
    
    else if (toolbox_button_selected == toolbox_states.CHANGE_EDGE_ANCHOR){
        
        // highlight anchor of adjacent nodes of selected edge
        if (highlight_element && highlight_element instanceof edge) {
            
            var blured_edge = -1;
            if (edge_change_selected != -1){
                var old_start_id = edge_change_selected.start_id;
                var old_end_id = edge_change_selected.end_id;
                
                if ((old_start_id in data) && (old_end_id in data)){
                    data[old_start_id].show_anchors = false;
                    data[old_end_id].show_anchors = false;
                }
                blured_edge = edge_change_selected;
                edge_change_selected = -1;
            }
            
            if (blured_edge != highlight_element){
                var start_id = highlight_element.start_id;
                var end_id = highlight_element.end_id;
                
                if ((start_id in data) && (end_id in data)){
                    data[start_id].show_anchors = true;
                    data[end_id].show_anchors = true;
                }
                edge_change_selected = highlight_element;
            }
            draw();
            
        }
        // if a visible anchor is clicked, change edge to the anchor
        else if (edge_change_selected != -1) {
            var c = document.getElementById("renderarea");
            var res = get_mouse_pos(c, e);
            var target = -1;
            for (var node_id in data){
                if (data[node_id].is_mouse_over(res)){
                    target = data[node_id];
                    break; 
                }
            }
            if (target != -1){
                var anchor = target.is_mouse_over_anchor(res);
                if (anchor.length > 0){
                    change_edge_anchor(edge_change_selected, target.id, anchor);
                }
            }
        }
    }
    
    else if (highlight_element && toolbox_button_selected == -1){
        if (highlight_element instanceof node){
            switch (highlight_element.type){
                case "pathway":
                    
                    open_select_pathway();
                    
                    var obj = document.getElementById("editor_select_pathway_field");
                    if (highlight_element.foreign_id > -1){
                        for (var i = 0; i < obj.children.length; ++i){
                            if (obj.options[i].id == highlight_element.foreign_id){
                                obj.selectedIndex = i;
                                break;
                            }
                        }
                    }
                    else {
                        obj.selectedIndex = 0;
                    }
                    
                    document.getElementById("editor_select_pathway_ok_button").setAttribute("onclick", "editor_update_pathway_node(); close_editor_select_pathway();");
                    document.getElementById("editor_select_pathway_ok_button").innerHTML = "Update";
                    selected_pathway_node = highlight_element.id;
                    break;
                    
                    
                case "image":
                    selected_image_node = highlight_element.id;
                    open_upload_image();
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
                    document.getElementById("renderarea").style.filter = "blur(5px)";
                    document.getElementById("toolbox").style.filter = "blur(5px)";
                    break;
                
                case "metabolite":
                    
                    document.getElementById("editor_select_metabolite_table_filter_name").value = "";
                    document.getElementById("editor_select_metabolite_table_filter_short_name").value = "";
                    document.getElementById("editor_select_metabolite_table_filter_cnumber").value = "";
                    document.getElementById("editor_select_metabolite_table_filter_lmid").value = "";
                    document.getElementById("editor_select_metabolite_table_filter_formula").value = "";
                    metabolite_create_action = false;
                    selected_metabolite_node = highlight_element.id;
                    editor_fill_metabolite_table();
                    document.getElementById("editor_select_metabolite").style.display = "inline";
                    document.getElementById("renderarea").style.filter = "blur(5px)";
                    document.getElementById("toolbox").style.filter = "blur(5px)";
                    break;
                    
                case "label":
                    selected_label_node = highlight_element.id;
                    document.getElementById("label_text_field").style.display = "inline";
                    document.getElementById("label_text_field_background").style.display = "inline";
                    
                    var label_width = document.getElementById("label_text_field").offsetWidth;
                    var label_height = document.getElementById("label_text_field").offsetHeight;
                    
                    
                    document.getElementById("label_text_field").value = replaceAll(highlight_element.name, "\\n", "\n");
                    var text_len = highlight_element.name.length;
                    document.getElementById("label_text_field").setSelectionRange(text_len, text_len);
                    document.getElementById("label_text_field").style.left = (toolbox_width + highlight_element.x - (label_width >> 1)).toString() + "px";
                    document.getElementById("label_text_field").style.top = (highlight_element.y - (label_height >> 1)).toString() + "px";
                    document.getElementById("label_text_field").focus();
                    
                default:
                    break;
            }
        }
        else if (highlight_element instanceof zoom_sign) {
            var c = document.getElementById("renderarea");
            var res = get_mouse_pos(c, e);
            highlight_element.mouse_click(res, e.which);
        }
    }
}




function activate_change_image_scale(){
    close_editor_upload_image();
    toolbox_button_selected = toolbox_states.CHANGE_IMAGE_SCALE;
    scaling_element = highlight_element;
    scaling_element.show_scale = true;
    draw();
}




function change_edge_type(){
    
    var is_direct = (highlight_element.reagent_id == -1);
    var table = "";
    var id = -1;
    var value = 0;
    var column = "head";
    
    if (is_direct){
        value = (edge_data['direct'][highlight_element.reaction_id]['h'] + 1) % 10;
        edge_data['direct'][highlight_element.reaction_id]['h'] = value;
        table = "reactions_direct";
        id = highlight_element.reaction_id;
    }
    else {
        value = (edge_data['reactions'][highlight_element.reaction_id]['r'][highlight_element.reagent_id]['h'] + 1) % 10;
        edge_data['reactions'][highlight_element.reaction_id]['r'][highlight_element.reagent_id]['h'] = value;
        table = "reagents";
        id = highlight_element.reagent_id;
    }
    
    var request = "action=set&table=" + table + "&column=" + column + "&id=" + id + "&value=" + value;
    
    var result = update_entry(request);
    
    if (result){
        compute_edges();
        assemble_elements();
        draw();
    }
}



function change_edge_anchor(change_edge, target_id, anchor){
    var is_direct = (change_edge.reagent_id == -1);
    var table = "";
    var id = -1;
    var column = "";
    
    if (is_direct){
        var start_end_anchor = "a" + ((change_edge.start_id == target_id) ? "s" : "e");
        edge_data["direct"][change_edge.reaction_id][start_end_anchor] = anchor;
        table = "reactions_direct";
        id = change_edge.reaction_id;
        column = "anchor_" + ((change_edge.start_id == target_id) ? "start" : "end");
    }
    else {
        if (edge_data["reactions"][change_edge.reaction_id]['n'] == target_id){
            if (edge_data["reactions"][change_edge.reaction_id]['r'][change_edge.reagent_id]['t'] == 'educt') {
                edge_data["reactions"][change_edge.reaction_id]['in'] = anchor;
                column = "anchor_in";
            }
            else{
                edge_data["reactions"][change_edge.reaction_id]['out'] = anchor;
                column = "anchor_out";
            }
            table = "reactions";
            id = change_edge.reaction_id;
            
        }
        else {
            edge_data["reactions"][change_edge.reaction_id]['r'][change_edge.reagent_id]['a'] = anchor;
            table = "reagents";
            id = change_edge.reagent_id;
            column = "anchor";
        }
    }
    
    
    var request = "action=set&table=" + table + "&column=" + column + "&id=" + id + "&value=" + anchor;
    
    var result = update_entry(request);
    if (result){
        compute_edges();
        assemble_elements();
        draw();
    }
}



function open_upload_image(){
    
    document.getElementById("editor_upload_image").style.display = "inline";
    document.getElementById("renderarea").style.filter = "blur(5px)";
    document.getElementById("toolbox").style.filter = "blur(5px)";
}



function open_select_pathway(){
    var sorted_pathways = [];
    for (var pathway_id in pathways){
        sorted_pathways.push([pathway_id, pathways[pathway_id][0]]);
    }
    sorted_pathways.sort(function(a, b) {
        return a[1].localeCompare(b[1]);
    });
    
    var obj = document.getElementById("editor_select_pathway_field");
    obj.innerHTML = "";
    for (var i = 0; i < sorted_pathways.length; ++i){
        var option = document.createElement("option");
        option.id = sorted_pathways[i][0];
        option.text = replaceAll(replaceAll(sorted_pathways[i][1], "-\n", ""), "\n", " ");
        obj.add(option);
    }
    
    document.getElementById("editor_select_pathway").style.display = "inline";
    document.getElementById("renderarea").style.filter = "blur(5px)";
    document.getElementById("toolbox").style.filter = "blur(5px)";
}





function label_text_field_listener(evt){
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    if (charCode == 27 || charCode == 9){ // 33: ESC; 9: Horizontal tab
        update_label();
    }
}



function rotate_metabolite_label(){
    var pos = highlight_element.pos;
    var rotation = {"tc": "tr", "tr": "mr", "mr": "br", "br": "bc", "bc": "bl", "bl": "ml", "ml": "tl", "tl": "tc"};
    
    if (pos == "" || !(pos in rotation)) pos = "tc";
    else {
        pos = rotation[pos];
    }
    
    var request = "action=set&table=nodes&id=" + highlight_element.id + "&column=position&value=" + pos;
       
    var result = update_entry(request);
    if (!result){
        alert("Error: database could not be updated.");
    }
    else {
        highlight_element.pos = pos;
        draw();
    }
}


function highlight_label(){
    var highlight_flag = !highlight_element.text_highlight;
    
    var request = "action=set&table=nodes&id=" + highlight_element.id + "&column=highlight&value=" + (highlight_flag ? "1" : "0");
       
    var result = update_entry(request);
    if (!result){
        alert("Error: database could not be updated.");
    }
    else {
        highlight_element.text_highlight = highlight_flag;
        draw();
    }
}


function update_label(){
    document.getElementById("label_text_field").style.display = "none";
    document.getElementById("label_text_field_background").style.display = "none";
    
    
    
    var label = document.getElementById("label_text_field").value;
    
    if (label == "") label = "undefined";
    label = replaceAll(label, "\t", "");
    label = replaceAll(label, "\n", "\\n");
    
    var request = "action=set&table=labels&id=" + data[selected_label_node].foreign_id + "&column=label&value=" + encodeURL(label);
    var result = update_entry(request);
    if (result){
        var ctx = document.getElementById("renderarea").getContext("2d");
        data[selected_label_node].name = label;
        data[selected_label_node].setup_label_meta();
        draw();
    };
}




function close_editor_upload_image(){
    document.getElementById("editor_upload_image").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}




function close_editor_select_pathway(){
    document.getElementById("editor_select_pathway").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}




function close_editor_select_protein(){
    document.getElementById("editor_select_protein").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}




function close_editor_select_metabolite(){
    document.getElementById("editor_select_metabolite").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}




function editor_upload_image(){
    if (document.getElementById('editor_upload_image_input').files.length == 0) return;
    var file = document.getElementById('editor_upload_image_input').files[0];
    var reader = new FileReader();
    reader.filename = file.name;
    reader.id = selected_image_node;
    reader.readAsBinaryString(file);
    
    data[selected_image_node].pos = "";
    data[selected_image_node].setup_image();
    
    reader.onload = function(){
        
        var re = /(?:\.([^.]+))?$/;
        
        var xhttp = new XMLHttpRequest();
        var encoded = btoa(this.result);
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
        
        xhttp.filename = this.filename;
        xhttp.id = this.id;
        xhttp.extension = re.exec(this.filename)[1].toLowerCase();
        
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200){
                if (xhttp.responseText == 0){
                    data[this.id].pos = this.extension;
                    data[this.id].setup_image();
                }
            }
        }
        xhttp.open("POST", file_pathname + "admin/scripts/upload-file.py", false);
        xhttp.send("id=" + this.id + "&extension=" + xhttp.extension + "&content=" + encoded);
    }
}



function editor_create_pathway_node(){
    var obj = document.getElementById("editor_select_pathway_field");
    var foreign_id = obj.options[obj.selectedIndex].id;
    
    
    var x = Math.round(Math.floor((tmp_element.x - null_x) / factor) / base_grid) * base_grid;
    var y = Math.round(Math.floor((tmp_element.y - null_y) / factor) / base_grid) * base_grid;
    var request = "type=pathway&pathway=" + current_pathway + "&foreign_id=" + foreign_id + "&x=" + x + "&y=" + y;
    
    
    var result = create_node(request);
    if (result[0]){
        tmp_element.name = pathways[foreign_id];
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





function editor_update_loci(){
    var locus_id = document.getElementById("editor_select_loci_select")[document.getElementById("editor_select_loci_select").selectedIndex].id;
    var prot_id_list = Array.from(edited_loci_set);
    
    var request = file_pathname + "admin/scripts/manage-entries.bin?action=set&table=protein_loci&column=none&id=" + locus_id + "&value=" +  encodeURL(prot_id_list.join(":"));
    
    var xmlhttp_set = new XMLHttpRequest();
    xmlhttp_set.onreadystatechange = function() {
        if (xmlhttp_set.readyState == 4 && xmlhttp_set.status == 200) {
            response = xmlhttp_set.responseText;
            if (response < 0){
                alert("An error has occured, the entities could not be deleted from the database. Please contact the administrator.");
            }
            else {
                current_loci_set = new Set();
                for (var key of edited_loci_set){
                    current_loci_set.add(key);
                }
                editor_fill_loci_table();
            }
        }
    }
    
    xmlhttp_set.open("GET", request, false);
    xmlhttp_set.send();
}








function editor_update_protein_node(){
    var obj = document.getElementById("editor_select_protein_table");
    var dom_table = document.getElementById("editor_select_protein_table");
    var prot = data[selected_protein_node];
    prot.proteins = Array.from(current_protein_set);
    var ctx = document.getElementById("renderarea").getContext("2d");
    
    var continuing = true;
    
    // get proteins
    var request = file_pathname + "admin/scripts/manage-entries.bin?action=set&table=nodeproteincorrelations&column=" + current_species + "&id=" + selected_protein_node + "&value=" +  encodeURL(prot.proteins.join(":"));
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
        var request_prot = file_pathname + "scripts/get-proteins.bin?ids=" + prot.proteins.join(":") + "&species=" + current_species;
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
        pw_node.name = pathways[foreign_id][0];
        pw_node.foreign_id = foreign_id;
        pw_node.setup_pathway_meta();
        compute_edges();
        assemble_elements();
        draw();
    };
}


function delete_entity(request){
    var xmlhttp = new XMLHttpRequest();
    request = file_pathname + "admin/scripts/delete-entity.py?" + request;
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
    request = file_pathname + "admin/scripts/manage-entries.bin?" + request;
    
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



function repair_database(){
    var xmlhttp = new XMLHttpRequest();
    request = file_pathname + "admin/scripts/inspect-database.py?mode=check_web";
    
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var request_data = xmlhttp.responseText;
            if (0 <= request_data){
                alert("No inconsistencies in database detected. Everything is fine.");
            }
            else {
                if (confirm("Inconsistencies were detected in the database. In worst case, it can disable the usage of the complete framework. Do you want to repair the database?")) {
                    
                    
                    var xmlhttp_repair = new XMLHttpRequest();
                    request_repair = file_pathname + "admin/scripts/inspect-database.py?mode=del_web";
                    xmlhttp_repair.onreadystatechange = function() {
                        if (xmlhttp_repair.readyState == 4 && xmlhttp_repair.status == 200) {
                            if (xmlhttp_repair.responseText == 0){
                                alert("Database was successfully repaired.");
                            }
                            else {
                                alert("Repairing failed, thats not good. Please contact the administrator.");
                            }
                        }
                    }
                    xmlhttp_repair.open("GET", request_repair, false);
                    xmlhttp_repair.send();
                    
                    
                }
            }
        }
    }
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
}






function create_node(request){
    var xmlhttp = new XMLHttpRequest();
    request = file_pathname + "admin/scripts/create-node.py?" + request;
    
    
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
    console.log(request);
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
            if (toolbox_button_selected == toolbox_states.MOVE_ENTITY && highlight_element.constructor.name != "preview"){
                if (highlight_element instanceof node){
                    if (!multiple_selection.has(highlight_element.id)){
                        
                        for (var node_id in data){
                            data[node_id].selected = false;
                        }
                        multiple_selection = new Set();
                    }
                    
                    entity_moving = highlight_element;
                    node_move_x = entity_moving.x;
                    node_move_y = entity_moving.y;
                }
            }
            else if (toolbox_button_selected == toolbox_states.DRAW_EDGE && highlight_element.constructor.name == "node"){
                
                var anchor = highlight_element.is_mouse_over_anchor(res);
                if (anchor.length > 0){
                    var ctx = document.getElementById("renderarea").getContext("2d");
                    data[-1] = new node({"x": highlight_element.x, "y": highlight_element.y, "t": "point", "i": highlight_element.id, "n": "undefined"});
                    draw_anchor_start = anchor;
                }
            }
            else if (toolbox_button_selected == toolbox_states.CHANGE_IMAGE_SCALE && (highlight_element instanceof node) && highlight_element.type == "image"){
                if (highlight_element.is_mouse_over_scale_anchor(res)){
                    rescaling = highlight_element.width;
                }
            }
            offsetX = res.x;
            offsetY = res.y;
        }
        else if (toolbox_button_selected == toolbox_states.MOVE_ENTITY) {
            for (node_id of multiple_selection){
                data[node_id].selected = false;
            }
            multiple_selection = new Set();
            draw();
            select_field_element.visible = true;
            select_field_element.start_position = res;
            select_field_element.end_position = res;
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
            
            
            //if (!highlight_element){
                
                for (var i = 0; i < elements.length; ++i){
                    elements[i].move(shift_x, shift_y);
                }
                infobox.x += shift_x;
                infobox.y += shift_y;
                null_x += shift_x;
                null_y += shift_y;
                boundaries[0] += shift_x;
                boundaries[1] += shift_y;
            //}
        }
        draw();
        offsetX = res.x;
        offsetY = res.y;
    }
    else if (e.buttons & 1){
        if (toolbox_button_selected == toolbox_states.MOVE_ENTITY){
            if (select_field_element.visible == true){
                
                select_field_element.end_position = res;
                var sx = Math.min(select_field_element.start_position.x, select_field_element.end_position.x);
                var ex = Math.max(select_field_element.start_position.x, select_field_element.end_position.x);
                var sy = Math.min(select_field_element.start_position.y, select_field_element.end_position.y);
                var ey = Math.max(select_field_element.start_position.y, select_field_element.end_position.y);
                for (var node_id in data){
                    var current_node = data[node_id];
                    if (sx <= current_node.x && sy <= current_node.y && current_node.x <= ex && current_node.y <= ey){
                        current_node.highlight = true;
                    }
                    else {
                        current_node.highlight = false;
                    }
                }
            }
            else {
                var shift_x = res.x - offsetX;
                var shift_y = res.y - offsetY;
                if (shift_x != 0 || shift_y != 0){
                    moved = true;
                }
                
                node_move_x += shift_x;
                node_move_y += shift_y;
                if (!multiple_selection.has(entity_moving.id)){
                    entity_moving.x = Math.floor(node_move_x - (1000 * (node_move_x - null_x) % grid) / 1000.);
                    entity_moving.y = Math.floor(node_move_y - (1000 * (node_move_y - null_y) % grid) / 1000.);
                }
                else {
                    var entity_x = Math.floor(node_move_x - (1000 * (node_move_x - null_x) % grid) / 1000.);
                    var entity_y = Math.floor(node_move_y - (1000 * (node_move_y - null_y) % grid) / 1000.);
                    for (var node_id of multiple_selection){
                        if (node_id == entity_moving.id) continue;
                        data[node_id].move(entity_x - entity_moving.x, entity_y - entity_moving.y);
                    }
                    entity_moving.x = entity_x;
                    entity_moving.y = entity_y;
                    
                }
                
                compute_edges();
                assemble_elements();
                offsetX = res.x;
                offsetY = res.y;
            }
            draw();
        }
        else if (toolbox_button_selected == toolbox_states.DRAW_EDGE && (-1 in data)){ // -1 in data: dummy node
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
                
                
                tmp_edge = new edge(data[-1].x, data[-1].y, draw_anchor_start, data[-1], data[-2].x, data[-2].y, a_end, data[-2], 0, -1, -1);
                elements.push(tmp_edge);
                
            }
            draw();
        }
        else if (toolbox_button_selected == toolbox_states.CHANGE_IMAGE_SCALE && rescaling > -1){
            var shift_x = res.x - offsetX;
            var shift_y = res.y - offsetY;
            scaling_element.scale(scaling_element.x, scaling_element.y, 1 + shift_x / scaling_element.width * 2);
            offsetX = res.x;
            offsetY = res.y;
            draw();
        }
    }
    else {
        if (toolbox_button_selected == toolbox_states.CREATE_PATHWAY || toolbox_button_selected == toolbox_states.CREATE_PROTEIN || toolbox_button_selected == toolbox_states.CREATE_METABOLITE || toolbox_button_selected == toolbox_states.CREATE_LABEL || toolbox_button_selected == toolbox_states.CREATE_MEMBRANE || toolbox_button_selected == toolbox_states.CREATE_BG_IMAGE || toolbox_button_selected == toolbox_states.CREATE_INVISIBLE){
            
            
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
    if(highlight_element && highlight_element.tipp && entity_moving == -1) Tip(e, highlight_element.name);
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
        if (select_field_element.visible) {
            select_field_element.visible = false;
            
            var sx = Math.min(select_field_element.start_position.x, select_field_element.end_position.x);
            var ex = Math.max(select_field_element.start_position.x, select_field_element.end_position.x);
            var sy = Math.min(select_field_element.start_position.y, select_field_element.end_position.y);
            var ey = Math.max(select_field_element.start_position.y, select_field_element.end_position.y);
            
            for (var node_id in data){
                var current_node = data[node_id];
                if (sx <= current_node.x && sy <= current_node.y && current_node.x <= ex && current_node.y <= ey){
                    current_node.selected = true;
                    multiple_selection.add(parseInt(node_id));
                }
            }
            draw();
        }
        else if (entity_moving != -1) {
            update_node(event);
            entity_moving = -1;
        }
    }
    else if (toolbox_button_selected == toolbox_states.CHANGE_IMAGE_SCALE && rescaling > -1){
        var value = scaling_element.width / rescaling * scaling_element.foreign_id;
        scaling_element.foreign_id = value;
        rescaling = -1;
        var request = "action=set&id=" + scaling_element.id + "&table=images&column=factor&value=" + value;
        update_entry(request);
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
            if ((-1 in data) && (data[-1].id != target.id)){
                var anchor = target.is_mouse_over_anchor(res);
                if (anchor.length > 0){
                    draw_anchor_end = anchor;
                    
                    var count_types = {"metabolite": 0, "label": 0,"membrane": 0,"protein": 0, "pathway": 0, "image": 0};
                    
                    count_types[target.type] += 1;
                    count_types[data[data[-1].id].type] += 1;
                    
                    
                    var result = add_edge(data[-1].id, target.id, draw_anchor_start, draw_anchor_end);
                    if (count_types["metabolite"] == 1 && count_types["protein"]){
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
                        for (var reaction_id in edge_data["reactions"]){
                            if (edge_data["reactions"][reaction_id]['n'] == prot_id){
                                reaction = reaction_id;
                                break;
                            }
                        }
                        if (fooduct == "product"){
                            edge_data["reactions"][reaction]["out"] = draw_anchor_start;
                            edge_data["reactions"][reaction]['r'][result] = {"i": result, "r": reaction, "n": meta_id, "t": fooduct, "a": draw_anchor_end, "h": 0};
                        }
                        else {
                            edge_data["reactions"][reaction]["in"] = draw_anchor_end;
                            edge_data["reactions"][reaction]['r'][result] = {"i": result, "r": reaction, "n": meta_id, "t": fooduct, "a": draw_anchor_start, "h": 0};
                        }
                    }
                    else {
                        edge_data["direct"][result] = {"i": result, "ns": data[-1].id, "ne": target.id, "as": draw_anchor_start, "ae": draw_anchor_end, "r": 0, "h": 0};
                        
                    }
                    compute_edges();
                    
                }
            }
        }
        delete data[-1];
        delete data[-2];
        assemble_elements();
        draw();
    }
    mouse_move_listener(event);
}



function add_edge(start_id, end_id, anchor_start, anchor_end){
    var xmlhttp = new XMLHttpRequest();
    var request = file_pathname + "admin/scripts/add-edge.py?start_id=" + start_id + "&end_id=" + end_id + "&anchor_start=" + anchor_start + "&anchor_end=" + anchor_end;
    var successful_creation = -1;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            response = JSON.parse(xmlhttp.responseText);
            if (response < 0){
                alert("An error has occured, the edge could not be added into the database. Please contact the administrator.");
            }
            else {
                successful_creation = response;
            }
        }
    }
    
    xmlhttp.open("GET", request, false);
    xmlhttp.send();
    return successful_creation;
}


function toolbox_button_clicked(button){
    if (scaling_element != -1){
        scaling_element.show_scale = false;
    }
    scaling_element = -1;
    
    if (edge_change_selected != -1){
        var start_id = edge_change_selected.start_id;
        var end_id = edge_change_selected.end_id;
        
        if ((start_id in data) && (end_id in data)){
            data[start_id].show_anchors = false;
            data[end_id].show_anchors = false;
        }        
    }
    edge_change_selected = -1;
    
    
    if(toolbox_button_selected == toolbox_states.DRAW_EDGE){
        for (node_id in data) data[node_id].show_anchors = false;
        draw();
    }
    
    for (var node_id in data){
        data[node_id].selected = false;
    }
    multiple_selection = new Set();
    
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
            //tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_PROTEIN:
            tmp_element = new node({"x": "0", "y": "0", "t": "protein", "i": -1, "n": "-", "p": []});
            //tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_METABOLITE:
            tmp_element = new node({"x": "0", "y": "0", "t": "metabolite", "i": -1, "n": "-"});
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_LABEL:
            tmp_element = new node({"x": "0", "y": "0", "t": "label", "i": -1, "n": "undefined"});
            //tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_MEMBRANE:
            tmp_element = new node({"x": "0", "y": "0", "t": "membrane", "i": -1, "n": "-"});
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_BG_IMAGE:
            tmp_element = new node({"x": "0", "y": "0", "t": "image", "i": -1, "n": "-", "r": 10000.});
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        case toolbox_states.CREATE_INVISIBLE:
            tmp_element = new node({"x": "0", "y": "0", "t": "invisible", "i": -1, "n": "-"});
            tmp_element.scale(0, 0, factor);
            elements.push(tmp_element);
            break;
            
        
        default:
            break;
    }
    if(toolbox_button_selected == toolbox_states.DRAW_EDGE){
        for (node_id in data) data[node_id].show_anchors = true;
    }
    draw();
}



function toolbox_button_mouseover(button){
    if (button != toolbox_button_selected) document.getElementById(toolbox_buttons[button]).style.backgroundColor = "#e4e4e4";
}




function toolbox_button_mouseout(button){
    if (button != toolbox_button_selected) document.getElementById(toolbox_buttons[button]).style.backgroundColor = "#eeeeee";
}





function update_node(event) {
    
    if (multiple_selection.has(entity_moving.id)){
        for (node_id of multiple_selection){
            var node_element = data[node_id];
            var x = Math.round(Math.floor((node_element.x - null_x) / factor) / base_grid) * base_grid;
            var y = Math.round(Math.floor((node_element.y - null_y) / factor) / base_grid) * base_grid;
            
            
            
            var request_X = "action=set&id=" + node_element.id;
            request_X += "&table=nodes&column=x&value=" + x;
            update_entry(request_X);
            
            var request_Y = "action=set&id=" + node_element.id;
            request_Y += "&table=nodes&column=y&value=" + y;
            update_entry(request_Y);
            
        }
    }
    else {
        var x = Math.round(Math.floor((entity_moving.x - null_x) / factor) / base_grid) * base_grid;
        var y = Math.round(Math.floor((entity_moving.y - null_y) / factor) / base_grid) * base_grid;
        
        var request_X = "action=set&id=" + entity_moving.id;
        request_X += "&table=nodes&column=x&value=" + x;
        update_entry(request_X);
        
        var request_Y = "action=set&id=" + entity_moving.id;
        request_Y += "&table=nodes&column=y&value=" + y;
        update_entry(request_Y);
    }
}


function key_down(event){
    if (document.getElementById("curate_spectra").style.display == "inline"){
        event.preventDefault();
        switch(event.which){
            case 27:
                editor_hide_curate_spectra();
                break;
                
            case 13:
            case 32:
            case 39:
                curate_spectra_checking();
                break;
                
            case 38:
                var previous_spectrum_selected = Math.max(0, current_spectrum_selected - 1);
                curate_spectra_change_selection(previous_spectrum_selected);
                break;
                
            case 40:
                var next_spectrum_selected = Math.min(max_spectra_per_page - 1, current_spectrum_selected + 1);
                curate_spectra_change_selection(next_spectrum_selected);
                break;
                
            case 33: // page up
                spectra_current_page -= 1;
                curate_spectra();
                break;
                
            case 34: // page down
                spectra_current_page += 1;
                curate_spectra();
                break;
                
            default:
                break;
        }
    }
    
    
    else if (document.getElementById("inspect_spectra").style.display == "inline"){
        event.preventDefault();
        switch(event.which){
            case 27:
                document.getElementById('insert_spectra').style.display = 'none';
                break;
                
            case 13:
            case 32:
            case 39:
                inspect_spectra_checking();
                break;
                
            case 38:
                var previous_spectrum_selected = Math.max(0, inspect_current_spectrum - 1);
                inspect_spectra_change_selection(previous_spectrum_selected);
                break;
                
            case 40:
                var next_spectrum_selected = Math.min(max_spectra_per_page - 1, inspect_current_spectrum + 1);
                inspect_spectra_change_selection(next_spectrum_selected);
                break;
                
            case 33: // page up
                inspect_spectra_current_page -= 1;
                inspect_spectra();
                break;
                
            case 34: // page down
                inspect_spectra_current_page += 1;
                inspect_spectra();
                break;
                
            default:
                break;
        }
    }
    
    
    if (event.which === 27){ // ESC
        hide_every_window();
    }
    
    if (!pathway_is_loaded) return;
    
    if(event.which == 45 || event.which == 109){
        zoom_in_out(1, 0);
        draw();
    }
    else if (event.which == 43 || event.which == 107){
        zoom_in_out(0, 0);
        draw();
    }
}




function hide_every_window(){
    hide_manage_entries();
    close_editor_select_pathway();
    close_editor_select_protein();
    close_editor_select_metabolite();
    close_editor_select_loci();
    close_navigation();
    document.getElementById('add_manage_species').style.display = 'none';
    document.getElementById('add_manage_proteins').style.display = 'none';
    document.getElementById('add_manage_metabolites').style.display = 'none';
    document.getElementById('add_manage_pathways').style.display = 'none';
    document.getElementById('insert_spectra').style.display = 'none';
    editor_hide_curate_spectra();
    last_opened_menu = "";
}







function editor_hide_curate_spectra(){
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("navigation").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("curate_spectra").style.display = "none";
}






function manage_entries(){
    document.getElementById("manage_entries").style.display = "inline";
    if (typeof qsdb_domain !== 'undefined' && qsdb_domain !== null){
        document.getElementById("renderarea").style.filter = "blur(5px)";
        document.getElementById("navigation").style.filter = "blur(5px)";
        document.getElementById("toolbox").style.filter = "blur(5px)";
    }
    manage_fill_table();
}




function manage_loci_functions(){
    document.getElementById("editor_select_loci").style.display = "inline";
    document.getElementById("renderarea").style.filter = "blur(5px)";
    document.getElementById("toolbox").style.filter = "blur(5px)";
    
    // load all compartment names and put them into the select object
    var xmlhttp_get_loci = new XMLHttpRequest();
    xmlhttp_get_loci.onreadystatechange = function() {
        if (xmlhttp_get_loci.readyState == 4 && xmlhttp_get_loci.status == 200) {
            var request = JSON.parse(xmlhttp_get_loci.responseText);
            var loci_list = [];
            for (var key in request){
                loci_list.push(request[key]);
            }
            
            var loci_select = document.getElementById("editor_select_loci_select");
            loci_select.innerHTML = "";
            loci_list.sort(function(a, b){
                    return a[1] > b[1];
                }
            );
            
            for (var row of loci_list){
                var dom_option = document.createElement("option");
                loci_select.appendChild(dom_option);
                dom_option.id = row[0];
                dom_option.innerHTML = row[1];
            }
            editor_select_loci_select_change(true);
        }
        
    }
    xmlhttp_get_loci.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=loci_names", true);
    xmlhttp_get_loci.send();
}


Set.prototype.subSet = function(otherSet) 
{ 
    // if size of this set is greater 
    // than otherSet then it can'nt be  
    //  a subset 
    if(this.size > otherSet.size) 
        return false; 
    else
    { 
        for(var elem of this) 
        { 
            // if any of the element of  
            // this is not present in the 
            // otherset then return false 
            if(!otherSet.has(elem)) 
                return false; 
        } 
        return true; 
    } 
} 




function editor_select_loci_select_change(reload){
    if (typeof(reload) === "undefined") reload = false;
    
    if (editor_select_loci_select_index == document.getElementById("editor_select_loci_select").selectedIndex && !reload) return;
    
    if (current_loci_set.size > 0 && (!current_loci_set.subSet(edited_loci_set) || !edited_loci_set.subSet(current_loci_set)))
    {
        alert("Warning: You have changed your proetein set. Please update or discard your changes first.");
        document.getElementById("editor_select_loci_select").selectedIndex = editor_select_loci_select_index;
        return;
    }
    // load all protein ids assigned to a certain compartment
    var locus_id = document.getElementById("editor_select_loci_select")[document.getElementById("editor_select_loci_select").selectedIndex].id;
    editor_select_loci_select_index = document.getElementById("editor_select_loci_select").selectedIndex;
    
    
    var request = "action=get&type=protein_loci";
    request += "&column=protein_id";
    request += "&filters=locus_id:" + locus_id;
    request += filter_separation_char + "species:" + current_species;
    request = file_pathname + "admin/scripts/manage-entries.bin?" + request;
    
    var xmlhttp_get_loci = new XMLHttpRequest();
    xmlhttp_get_loci.onreadystatechange = function() {
        if (xmlhttp_get_loci.readyState == 4 && xmlhttp_get_loci.status == 200) {
            var request = JSON.parse(xmlhttp_get_loci.responseText);
            current_loci_set = new Set();
            edited_loci_set = new Set();
            for (var key in request){
                current_loci_set.add(parseInt(request[key][1]));
                edited_loci_set.add(parseInt(request[key][1]));
            }
            editor_fill_loci_table();
        }
        
    }
    xmlhttp_get_loci.open("GET", request, true);
    xmlhttp_get_loci.send();
}





function editor_select_loci_discard(){
    if (confirm("Do you want to discard your changes?")){
        edited_loci_set = new Set();
        for (var key of current_loci_set){
            edited_loci_set.add(key);
        }
        editor_fill_loci_table();
    }
}






function close_editor_select_loci(){
    document.getElementById("editor_select_loci").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("navigation").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}




function close_manage_entries(){
    document.getElementById("manage_entries").style.display = "none";
    document.getElementById("renderarea").style.filter = "";
    document.getElementById("navigation").style.filter = "";
    document.getElementById("toolbox").style.filter = "";
}





function editor_fill_metabolite_table(){
    var filter_name = document.getElementById("editor_select_metabolite_table_filter_name").value;
    var filter_short_name = document.getElementById("editor_select_metabolite_table_filter_short_name").value;
    var filter_cnumber = document.getElementById("editor_select_metabolite_table_filter_cnumber").value;
    var filter_lmid = document.getElementById("editor_select_metabolite_table_filter_lmid").value;
    var filter_formula = document.getElementById("editor_select_metabolite_table_filter_formula").value;
    
    var request = "action=get&type=metabolites";
    request += "&column=" + encodeURL(metabolite_sort_columns[metabolite_sort_column]);
    request += "&limit=" + encodeURL((metabolite_current_page * max_per_page).toString() + ":" + max_per_page.toString());
    if (filter_name != "" || filter_short_name != "" || filter_cnumber != "" || filter_formula != "" || filter_lmid != ""){
        request += "&filters=" + encodeURL("name:" + filter_name + filter_separation_char + "short_name:" + filter_short_name + filter_separation_char + "c_number:" + filter_cnumber + filter_separation_char + "lm_id:" + filter_lmid + filter_separation_char + "formula:" + filter_formula);
    }
    request = file_pathname + "admin/scripts/manage-entries.bin?" + request;
    
    var sign_up = String.fromCharCode(9652);
    var sign_down = String.fromCharCode(9662);
    
    
    
    var dom_table_header = document.getElementById("editor_select_metabolite_table_header");
    dom_table_header.innerHTML = ""
    var dom_th_name = document.createElement("th");
    dom_table_header.appendChild(dom_th_name);
    dom_th_name.setAttribute("onclick", "metabolite_sort_column = " + ((metabolite_sort_column == 1) ? " -1;" : "1;") + "; editor_fill_metabolite_table();");
    dom_th_name.setAttribute("style", "cursor: pointer;");
    dom_th_name.innerHTML = "Name" + ((metabolite_sort_column == 1) ? " " + sign_up : ((metabolite_sort_column == -1) ? " " + sign_down : ""));
    dom_th_name.setAttribute("width", "100%");
    
    var dom_th_short_name = document.createElement("th");
    dom_table_header.appendChild(dom_th_short_name);
    dom_th_short_name.setAttribute("onclick", "metabolite_sort_column = " + ((metabolite_sort_column == 2) ? " -2;" : "2;") + "; editor_fill_metabolite_table();");
    dom_th_short_name.setAttribute("style", "cursor: pointer;");
    dom_th_short_name.innerHTML = "Short name" + ((metabolite_sort_column == 2) ? " " + sign_up : ((metabolite_sort_column == -1) ? " " + sign_down : ""));
    dom_th_short_name.setAttribute("width", "250px");
    dom_th_short_name.setAttribute("style", "cursor: pointer; min-width: 250px; max-width: 250px;");
    
    
    var dom_th_cnumber = document.createElement("th");
    dom_table_header.appendChild(dom_th_cnumber);
    dom_th_cnumber.setAttribute("onclick", "metabolite_sort_column = " + ((metabolite_sort_column == 3) ? " -3;" : "3;") + "; editor_fill_metabolite_table();");
    dom_th_cnumber.innerHTML = "C&nbsp;number" + ((metabolite_sort_column == 3) ? " " + sign_up : ((metabolite_sort_column == -3) ? " " + sign_down : ""));
    dom_th_cnumber.setAttribute("width", "150px");
    dom_th_cnumber.setAttribute("style", "cursor: pointer; min-width: 150px; max-width: 150px;");
    
    
    var dom_th_lmid = document.createElement("th");
    dom_table_header.appendChild(dom_th_lmid);
    dom_th_lmid.setAttribute("onclick", "metabolite_sort_column = " + ((metabolite_sort_column == 4) ? " -4;" : "4;") + "; editor_fill_metabolite_table();");
    dom_th_lmid.innerHTML = "LM-ID" + ((metabolite_sort_column == 4) ? " " + sign_up : ((metabolite_sort_column == -4) ? " " + sign_down : ""));
    dom_th_lmid.setAttribute("width", "150px");
    dom_th_lmid.setAttribute("style", "cursor: pointer; min-width: 150px; max-width: 150px;");
    
    
    var dom_th_formula = document.createElement("th");
    dom_table_header.appendChild(dom_th_formula);
    dom_th_formula.setAttribute("onclick", "metabolite_sort_column = " + ((metabolite_sort_column == 5) ? " -5;" : "5;") + "; editor_fill_metabolite_table();");
    dom_th_formula.setAttribute("style", "cursor: pointer;");
    dom_th_formula.innerHTML = "Chemical formula" + ((metabolite_sort_column == 5) ? " " + sign_up : ((metabolite_sort_column == -5) ? " " + sign_down : ""));
    dom_th_formula.setAttribute("width", "250px");
    dom_th_formula.setAttribute("style", "cursor: pointer; min-width: 250px; max-width: 250px;");
    
    
    var dom_th_radio = document.createElement("th");
    dom_table_header.appendChild(dom_th_radio);
    dom_th_radio.innerHTML = "&nbsp;&nbsp;&nbsp;";
    dom_th_radio.setAttribute("width", "40px");
    dom_th_radio.setAttribute("style", "min-width: 40px; max-width: 40px;");
    
    
    
    
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
        dom_b.innerHTML = "&nbsp;??&nbsp;";
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "metabolite_current_page -= 1; editor_fill_metabolite_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;???&nbsp;&nbsp;";
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
    
    var dom_div_max_pages = document.createElement("div");
    dom_nav_cell.appendChild(dom_div_max_pages);
    dom_div_max_pages.setAttribute("style", "display: inline;");
    dom_div_max_pages.innerHTML = "&nbsp;&nbsp;/&nbsp;&nbsp;" + metabolite_max_pages;
    
    if (metabolite_current_page + 1 < metabolite_max_pages){
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "metabolite_current_page += 1; editor_fill_metabolite_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;&nbsp;???&nbsp;";
        
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "metabolite_current_page = metabolite_max_pages - 1; editor_fill_metabolite_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;??&nbsp;";
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
                        return a[1].localeCompare(b[1]);
                    case -1:
                        return b[1].localeCompare(a[1]);
                    case 2:
                        return a[2].localeCompare(b[2]);
                    case -2:
                        return b[2].localeCompare(a[2]);
                    case 3:
                        return a[3].localeCompare(b[3]);
                    case -3:
                        return b[3].localeCompare(a[3]);
                    case 4:
                        return a[4].localeCompare(b[4]);
                    case -4:
                        return b[4].localeCompare(a[4]);
                    case 5:
                        return a[5].localeCompare(b[5]);
                    case -5:
                        return b[5].localeCompare(a[5]);
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
                dom_td2.setAttribute("width", "250px");
                dom_td2.setAttribute("style", "min-width: 250px; max-width: 250px;");
                
                var dom_td3 = document.createElement("td");
                dom_tr.appendChild(dom_td3);
                dom_td3.innerHTML = row[3];
                dom_td3.setAttribute("bgcolor", bg_color);
                dom_td3.setAttribute("width", "150px");
                dom_td3.setAttribute("style", "min-width: 150px; max-width: 150px;");
                
                var dom_td4 = document.createElement("td");
                dom_tr.appendChild(dom_td4);
                dom_td4.innerHTML = row[4];
                dom_td4.setAttribute("bgcolor", bg_color);
                dom_td4.setAttribute("width", "150px");
                dom_td4.setAttribute("style", "min-width: 150px; max-width: 150px;");
                
                var dom_td5 = document.createElement("td");
                dom_tr.appendChild(dom_td5);
                dom_td5.innerHTML = row[5];
                dom_td5.setAttribute("bgcolor", bg_color);
                dom_td5.setAttribute("width", "250px");
                dom_td5.setAttribute("style", "min-width: 250px; max-width: 250px;");
                
                var dom_td6 = document.createElement("td");
                dom_tr.appendChild(dom_td6);
                var dom_input = document.createElement("input");
                dom_td6.appendChild(dom_input);
                dom_td6.setAttribute("bgcolor", bg_color);
                dom_input.setAttribute("id", row[0]);
                dom_input.setAttribute("type", "radio");
                dom_input.setAttribute("name", "foo");
                dom_input.setAttribute("onclick", "selected_metabolite = this.id;");
                
                if (((metabolite_create_action || highlight_element.foreign_id == -1) && i == 0) || (highlight_element.foreign_id == row[0])) {
                    selected_metabolite = row[0];
                    dom_input.setAttribute("checked", "true");
                }
            }
            
            
        }
    }
    xmlhttp_metabolites.open("GET", request, true);
    xmlhttp_metabolites.send();
}








function editor_fill_loci_table(){
    var filter_name = document.getElementById("editor_select_loci_table_filter_name").value;
    var filter_accession = document.getElementById("editor_select_loci_table_filter_accession").value;
    var filter_description = document.getElementById("editor_select_loci_table_filter_description").value;
    var filter_node = document.getElementById("editor_select_loci_table_filter_node").checked;
    
    var request = "action=get&type=proteins";
    request += "&column=" + encodeURL(loci_sort_columns[loci_sort_column]);
    request += "&limit=" + encodeURL((loci_current_page * max_per_page).toString() + ":" + max_per_page.toString());
    request += "&filters=species:" + current_species;
    if (filter_name != "" || filter_accession != "" || filter_description != ""){
        request += encodeURL(filter_separation_char + "name:" + filter_name + filter_separation_char + "accession:" + filter_accession + filter_separation_char + "definition:" + filter_description);
    }
    if (filter_node) request += "&checked=" + encodeURL(selected_loci_node);
    request = file_pathname + "admin/scripts/manage-entries.bin?" + request;
    
    var sign_up = String.fromCharCode(9652);
    var sign_down = String.fromCharCode(9662);
    
    var dom_table_header = document.getElementById("editor_select_loci_table_header");
    dom_table_header.innerHTML = ""
    var dom_th_name = document.createElement("th");
    dom_table_header.appendChild(dom_th_name);
    dom_th_name.setAttribute("onclick", "loci_sort_column = " + ((loci_sort_column == 1) ? " -1;" : "1;") + "; editor_fill_loci_table();");
    dom_th_name.innerHTML = "Name" + ((loci_sort_column == 1) ? " " + sign_up : ((loci_sort_column == -1) ? " " + sign_down : ""));
    dom_th_name.setAttribute("width", "150px");
    dom_th_name.setAttribute("style", "cursor: pointer; min-width: 150px; max-width: 150px;");
    
    
    var dom_th_uniprot = document.createElement("th");
    dom_table_header.appendChild(dom_th_uniprot);
    dom_th_uniprot.setAttribute("onclick", "loci_sort_column = " + ((loci_sort_column == 2) ? " -2;" : "2;") + "; editor_fill_loci_table();");
    dom_th_uniprot.innerHTML = "Uniprot" + ((loci_sort_column == 2) ? " " + sign_up : ((loci_sort_column == -2) ? " " + sign_down : ""));
    dom_th_uniprot.setAttribute("width", "120px");
    dom_th_uniprot.setAttribute("style", "cursor: pointer; min-width: 120px; max-width: 120px;");
    
    
    var dom_th_description = document.createElement("th");
    dom_table_header.appendChild(dom_th_description);
    dom_th_description.setAttribute("onclick", "loci_sort_column = " + ((loci_sort_column == 3) ? " -3;" : "3;") + "; editor_fill_loci_table();");
    dom_th_description.setAttribute("style", "cursor: pointer;");
    dom_th_description.innerHTML = "Description" + ((loci_sort_column == 3) ? " " + sign_up : ((loci_sort_column == -3) ? " " + sign_down : ""));
    
    
    
    
    
    
    
    var dom_nav_cell = document.getElementById("editor_loci_page_navigation");
    dom_nav_cell.innerHTML = "";
    if (loci_current_page > 0){
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "loci_current_page = 0; editor_fill_loci_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;??&nbsp;";
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "loci_current_page -= 1; editor_fill_loci_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;???&nbsp;&nbsp;";
    }
    
        
    var dom_page = document.createElement("select");
    dom_nav_cell.appendChild(dom_page);
    dom_page.setAttribute("style", "display: inline;");
    dom_page.setAttribute("onchange", "loci_current_page = this.selectedIndex; editor_fill_loci_table();");
    for (var i = 0; i < loci_max_pages; ++i){
        var dom_option = document.createElement("option");
        dom_page.appendChild(dom_option);
        dom_option.innerHTML = (i + 1).toString();
    }
    dom_page.selectedIndex = loci_current_page;
    
    var dom_div_max_pages = document.createElement("div");
    dom_nav_cell.appendChild(dom_div_max_pages);
    dom_div_max_pages.setAttribute("style", "display: inline;");
    dom_div_max_pages.innerHTML = "&nbsp;&nbsp;/&nbsp;&nbsp;" + loci_max_pages;
    
    if (loci_current_page + 1 < loci_max_pages){
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "loci_current_page += 1; editor_fill_loci_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;&nbsp;???&nbsp;";
        
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "loci_current_page = loci_max_pages - 1; editor_fill_loci_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;??&nbsp;";
    }
    
    
    var xmlhttp_loci = new XMLHttpRequest();
    xmlhttp_loci.onreadystatechange = function() {
        if (xmlhttp_loci.readyState == 4 && xmlhttp_loci.status == 200) {
            var global_loci_data = JSON.parse(xmlhttp_loci.responseText);
            var global_loci_data_sorted = [];
            for (var protein_id in global_loci_data) global_loci_data_sorted.push(global_loci_data[protein_id]);
            global_loci_data_sorted = global_loci_data_sorted.sort(function(a, b) {
                switch (loci_sort_column){
                    case 1:
                        return a[1].localeCompare(b[1]);
                    case -1:
                        return b[1].localeCompare(a[1]);
                    case 2:
                        return a[5].localeCompare(b[5]);
                    case -2:
                        return b[5].localeCompare(a[5]);
                    case 3:
                        return a[2].localeCompare(b[2]);
                    case -3:
                        return b[2].localeCompare(a[2]);
                }
            });
            
            
            var dom_table = document.getElementById("editor_select_loci_table");
            dom_table.innerHTML = "";
    
            for (var i = 0; i < global_loci_data_sorted.length; ++i){
                var bg_color = (i & 1) ? "#DDDDDD" : "white";
                var row = global_loci_data_sorted[i];
                
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
                
                
                if (current_loci_set.has(row[0])) dom_input.setAttribute("checked", "true");
                dom_input.setAttribute("onchange", "if(this.checked) edited_loci_set.add(parseInt(this.id)); else edited_loci_set.delete(parseInt(this.id));");
            }
            
            
        }
    }
    xmlhttp_loci.open("GET", request, false);
    xmlhttp_loci.send();
    
}








function editor_fill_protein_table(){
    var filter_name = document.getElementById("editor_select_protein_table_filter_name").value;
    var filter_accession = document.getElementById("editor_select_protein_table_filter_accession").value;
    var filter_description = document.getElementById("editor_select_protein_table_filter_description").value;
    var filter_node = document.getElementById("editor_select_protein_table_filter_node").checked;
    
    var request = "action=get&type=proteins";
    request += "&column=" + encodeURL(protein_sort_columns[protein_sort_column]);
    request += "&limit=" + encodeURL((protein_current_page * max_per_page).toString() + ":" + max_per_page.toString());
    request += "&filters=species:" + current_species;
    if (filter_name != "" || filter_accession != "" || filter_description != ""){
        request += encodeURL(filter_separation_char + "name:" + filter_name + filter_separation_char + "accession:" + filter_accession + filter_separation_char + "definition:" + filter_description);
    }
    if (filter_node) request += "&checked=" + encodeURL(selected_protein_node);
    request = file_pathname + "admin/scripts/manage-entries.bin?" + request;
    
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
        dom_b.innerHTML = "&nbsp;??&nbsp;";
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "protein_current_page -= 1; editor_fill_protein_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;???&nbsp;&nbsp;";
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
    
    var dom_div_max_pages = document.createElement("div");
    dom_nav_cell.appendChild(dom_div_max_pages);
    dom_div_max_pages.setAttribute("style", "display: inline;");
    dom_div_max_pages.innerHTML = "&nbsp;&nbsp;/&nbsp;&nbsp;" + protein_max_pages;
    
    if (protein_current_page + 1 < protein_max_pages){
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "protein_current_page += 1; editor_fill_protein_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;&nbsp;???&nbsp;";
        
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "protein_current_page = protein_max_pages - 1; editor_fill_protein_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;??&nbsp;";
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
                        return a[1].localeCompare(b[1]);
                    case -1:
                        return b[1].localeCompare(a[1]);
                    case 2:
                        return a[5].localeCompare(b[5]);
                    case -2:
                        return b[5].localeCompare(a[5]);
                    case 3:
                        return a[2].localeCompare(b[2]);
                    case -3:
                        return b[2].localeCompare(a[2]);
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
    xmlhttp_protein.open("GET", request, false);
    xmlhttp_protein.send();
}






function manage_change_entity(entity){
    manage_current_entry = entity;
    var xmlhttp_entity = new XMLHttpRequest();
    xmlhttp_entity.onreadystatechange = function() {
        if (xmlhttp_entity.readyState == 4 && xmlhttp_entity.status == 200) {
            manage_max_pages = Math.floor(parseInt(xmlhttp_entity.responseText) / max_per_page) + 1;
        }
    }
    xmlhttp_entity.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=" + entity + "_num", false);
    xmlhttp_entity.send();
    manage_current_page = 0;
    
    var dom_tr = document.getElementById("editor_select_manage_table_filters");
    dom_tr.innerHTML = "";
    var dom_th_nav_del = document.createElement("td");
    dom_tr.appendChild(dom_th_nav_del);
    dom_th_nav_del.innerHTML = "&nbsp;";
    dom_th_nav_del.setAttribute("style", "cursor: pointer; min-width: 66px; max-width: 66px;");
    
    for (var i = 0; i < manage_columns[entity].length; ++i){
        var dom_td = document.createElement("td");
        dom_tr.appendChild(dom_td);
        var dom_input = document.createElement("input");
        dom_td.appendChild(dom_input);
        dom_input.setAttribute("type", "text");
        dom_input.setAttribute("style", "width: 100%; box-sizing: border-box;");
        dom_input.setAttribute("id", "editor_select_manage_table_filter_" + i.toString());
        dom_input.setAttribute("onkeyup", "manage_current_page = 0; manage_fill_table();");
    }
    var dom_td_filler = document.createElement("td");
    dom_tr.appendChild(dom_td_filler);
    dom_td_filler.setAttribute("style", "width: 100%; box-sizing: border-box;");
    resize_manage_view();
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}



function update_protein_data(accession){
    var request = "type=protein&action=update&accession=" + accession;
    request = file_pathname + "admin/scripts/request-entity-data.py?" + request;
    
    var xmlhttp_update_prot = new XMLHttpRequest();
    xmlhttp_update_prot.onreadystatechange = function() {
        if (xmlhttp_update_prot.readyState == 4 && xmlhttp_update_prot.status == 200) {
            var responseText = xmlhttp_update_prot.responseText;
        }
    }
    xmlhttp_update_prot.open("GET", request, false);
    xmlhttp_update_prot.send();
    manage_fill_table();
}




function open_add_species(){
    // get species list
    var xmlhttp_species_list = new XMLHttpRequest();
    xmlhttp_species_list.onreadystatechange = function() {
        if (xmlhttp_species_list.readyState == 4 && xmlhttp_species_list.status == 200) {
            var possible_species = JSON.parse(xmlhttp_species_list.responseText);
            
            var add_manage_species_select_dom = document.getElementById("add_manage_species_select");
            add_manage_species_select_dom.innerHTML = "";
            
            for (var i = 0; i < possible_species.length; ++i){
                if (!(possible_species[i][0] in supported_species)){
                    var dom_option = document.createElement("option");
                    add_manage_species_select_dom.appendChild(dom_option);
                    dom_option.id = possible_species[i][0];
                    dom_option.text = possible_species[i][1];
                }
                
            }
            document.getElementById('add_manage_species').style.display = 'inline';
        }
    }
    xmlhttp_species_list.open("GET", file_pathname + "admin/scripts/get-species-list.py", true);
    xmlhttp_species_list.send();
}



function open_add_tissues(){
    // get species list
    var xmlhttp_tissues_list = new XMLHttpRequest();
    xmlhttp_tissues_list.onreadystatechange = function() {
        if (xmlhttp_tissues_list.readyState == 4 && xmlhttp_tissues_list.status == 200) {
            var possible_species = JSON.parse(xmlhttp_tissues_list.responseText);
            
            var add_manage_tissues_select_dom = document.getElementById("add_manage_tissues_select");
            add_manage_tissues_select_dom.innerHTML = "";
            
            for (var i = 0; i < possible_species.length; ++i){
                if (!(possible_species[i][0] in supported_species)){
                    var dom_option = document.createElement("option");
                    add_manage_tissues_select_dom.appendChild(dom_option);
                    dom_option.id = possible_species[i][0];
                    dom_option.text = possible_species[i][1];
                }
                
            }
            document.getElementById('add_manage_tissues').style.display = 'inline';
        }
    }
    xmlhttp_tissues_list.open("GET", file_pathname + "admin/scripts/get-tissue-list.py", true);
    xmlhttp_tissues_list.send();
}





function open_add_protein(){
    var function_select = document.getElementById("add_manage_proteins_function");
    function_select.innerHTML = "";
    
    var dom_option_no_func = document.createElement("option");
    function_select.appendChild(dom_option_no_func);
    dom_option_no_func.innerHTML = "no function";
    dom_option_no_func.value = 0;
    
    for (var f_name of function_names){
        var dom_option_func = document.createElement("option");
        function_select.appendChild(dom_option_func);
        dom_option_func.innerHTML = f_name[1];
        dom_option_func.value = f_name[0];
    }
    document.getElementById('add_manage_proteins').style.display = 'inline';
}





function manage_fill_table(){
    
    var filters = "";
    for (var i = 0; i < manage_columns[manage_current_entry].length; ++i){
        var filter_field = document.getElementById("editor_select_manage_table_filter_" + i.toString());
        if (filter_field.value.length > 0){
            if (filters.length > 0) filters += String.fromCharCode(6);
            filters += manage_columns[manage_current_entry][i] + ":" + filter_field.value;
        }
    }
    
    
    var request = "action=get&type=" + manage_current_entry;
    request += "&column=" + encodeURL(manage_sort_columns[manage_current_entry][manage_sort_column]);
    request += "&limit=" + encodeURL((manage_current_page * max_per_page).toString() + ":" + max_per_page.toString());
    if (filters.length > 0) request += "&filters=" + encodeURL(filters);
    request = file_pathname + "admin/scripts/manage-entries.bin?" + request;
    
    var sign_up = String.fromCharCode(9652);
    var sign_down = String.fromCharCode(9662);
    
    
    
    
    var dom_table_header = document.getElementById("editor_select_manage_table_header");
    dom_table_header.innerHTML = ""
    var dom_th_del = document.createElement("th");
    dom_table_header.appendChild(dom_th_del);
    
    if (manage_current_entry == "proteins"){
        dom_th_del.innerHTML = "Del/Up";
        //dom_th_del.setAttribute("width", "64");
    }
    else {
        dom_th_del.innerHTML = "Del";
        //dom_th_del.setAttribute("width", "32");
    }
    dom_th_del.setAttribute("width", "64");
    
    
    for (var i = 1; i <= manage_columns[manage_current_entry].length; ++i){
        var dom_th_name = document.createElement("th");
        dom_table_header.appendChild(dom_th_name);
        dom_th_name.setAttribute("onclick", "manage_sort_column = " + ((manage_sort_column == i) ? "-" + i.toString() + ";" : i.toString() + ";") + "; manage_fill_table();");
        var col_name = manage_sort_columns[manage_current_entry][i].split(":")[0];
        dom_th_name.innerHTML = col_name + ((manage_sort_column == i) ? " " + sign_up : ((manage_sort_column == -i) ? " " + sign_down : ""));
        if (manage_current_entry == "proteins" && i == 7) dom_th_name.setAttribute("style", "cursor: pointer; min-width: 1000px; max-width: 1000px;");
        else if (manage_current_entry == "proteins" && i == 12) dom_th_name.setAttribute("style", "cursor: pointer; min-width: 500px; max-width: 500px;");
        else if (manage_current_entry == "species" || manage_current_entry == "loci_names") dom_th_name.setAttribute("style", "cursor: pointer; min-width: 325px; max-width: 325px;");
        else if (manage_current_entry == "metabolites" && i == 7) dom_th_name.setAttribute("style", "cursor: pointer; min-width: 1000px; max-width: 1000px;");
        else if (manage_current_entry == "pathways" && i == 1) dom_th_name.setAttribute("style", "cursor: pointer; min-width: 600px; max-width: 600px;");
        else if (manage_current_entry == "pathways" && i == 2) dom_th_name.setAttribute("style", "cursor: pointer; min-width: 300px; max-width: 300px;");
        else if (manage_current_entry == "pathway_groups" && i == 1) dom_th_name.setAttribute("style", "cursor: pointer; min-width: 700px; max-width: 700px;");
        else dom_th_name.setAttribute("style", "cursor: pointer; min-width: 200px; max-width: 200px;");
    }
    
    var dom_th_name_filler = document.createElement("th");
    dom_table_header.appendChild(dom_th_name_filler);
    dom_th_name_filler.setAttribute("style", "min-width: 100%; max-width: 100%;");
    
    
    var dom_nav_cell = document.getElementById("editor_manage_page_navigation");
    dom_nav_cell.innerHTML = "";
    if (manage_current_page > 0){
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "manage_current_page = 0; manage_fill_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;??&nbsp;";
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "manage_current_page -= 1; manage_fill_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;???&nbsp;&nbsp;";
    }
    
        
    var dom_page = document.createElement("select");
    dom_nav_cell.appendChild(dom_page);
    dom_page.setAttribute("style", "display: inline;");
    dom_page.setAttribute("onchange", "manage_current_page = this.selectedIndex; manage_fill_table();");
    for (var i = 0; i < manage_max_pages; ++i){
        var dom_option = document.createElement("option");
        dom_page.appendChild(dom_option);
        dom_option.innerHTML = (i + 1).toString();
    }
    dom_page.selectedIndex = manage_current_page;
    
    var dom_div_max_pages = document.createElement("div");
    dom_nav_cell.appendChild(dom_div_max_pages);
    dom_div_max_pages.setAttribute("style", "display: inline;");
    dom_div_max_pages.innerHTML = "&nbsp;&nbsp;/&nbsp;&nbsp;" + manage_max_pages;
    
    
    if (manage_current_page + 1 < manage_max_pages){
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "manage_current_page += 1; manage_fill_table();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;&nbsp;???&nbsp;";
        
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "manage_current_page = manage_max_pages - 1; manage_fill_table();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;??&nbsp;";
    }
    
    var dom_space = document.createElement("div");
    dom_nav_cell.appendChild(dom_space);
    dom_space.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    dom_space.style = "display: inline;"
    
    if (manage_current_entry == "proteins"){
        var dom_new_protein = document.createElement("button");
        dom_nav_cell.appendChild(dom_new_protein);
        dom_new_protein.innerHTML = "New protein";
        dom_new_protein.setAttribute("onclick", "open_add_protein();");
    }
    else if (manage_current_entry == "species"){
        var dom_add_species = document.createElement("button");
        dom_nav_cell.appendChild(dom_add_species);
        dom_add_species.innerHTML = "Add species";
        dom_add_species.setAttribute("onclick", "open_add_species();");
    }
    else if (manage_current_entry == "tissues"){
        var dom_add_tissues = document.createElement("button");
        dom_nav_cell.appendChild(dom_add_tissues);
        dom_add_tissues.innerHTML = "Add tissue";
        dom_add_tissues.setAttribute("onclick", "open_add_tissues();");
    }
    else if (manage_current_entry == "loci_names"){
        var dom_add_loci_names = document.createElement("button");
        dom_nav_cell.appendChild(dom_add_loci_names);
        dom_add_loci_names.innerHTML = "Add compartment";
        dom_add_loci_names.setAttribute("onclick", "document.getElementById('add_manage_loci_names').style.display = 'inline';");
    }
    else if (manage_current_entry == "metabolites"){
        var dom_new_metabolite = document.createElement("button");
        dom_nav_cell.appendChild(dom_new_metabolite);
        dom_new_metabolite.innerHTML = "New metabolite";
        dom_new_metabolite.setAttribute("onclick", "document.getElementById('add_manage_metabolites').style.display = 'inline';");
    }
    else if (manage_current_entry == "pathways"){
        var dom_new_pathway = document.createElement("button");
        dom_nav_cell.appendChild(dom_new_pathway);
        dom_new_pathway.innerHTML = "New pathway";
        dom_new_pathway.setAttribute("onclick", "document.getElementById('add_manage_pathways').style.display = 'inline';");
    }
    
    
    var xmlhttp_manage = new XMLHttpRequest();
    xmlhttp_manage.onreadystatechange = function() {
        if (xmlhttp_manage.readyState == 4 && xmlhttp_manage.status == 200) {
            
            
            global_manage_data = JSON.parse(xmlhttp_manage.responseText);
            var global_manage_data_sorted = [];
            for (var manage_id in global_manage_data) global_manage_data_sorted.push(global_manage_data[manage_id]);
            global_manage_data_sorted = global_manage_data_sorted.sort(function(a, b) {
                
                if (manage_sort_column > 0) {
                    if (isNumeric(a[manage_sort_column]) && isNumeric(b[manage_sort_column])){
                        return parseInt(a[manage_sort_column]) > parseInt(b[manage_sort_column]);
                    }
                    else {
                        return a[manage_sort_column].localeCompare(b[manage_sort_column]);
                    }
                    
                }
                else {
                    if (isNumeric(a[-manage_sort_column]) && isNumeric(b[-manage_sort_column])){
                        return parseInt(a[-manage_sort_column]) <= parseInt(b[-manage_sort_column]);
                    }
                    else {
                        return b[-manage_sort_column].localeCompare(a[-manage_sort_column]);
                    }
                }
            });
            
            
            var dom_table = document.getElementById("editor_select_manage_table");
            dom_table.innerHTML = "";
            
            
            if (manage_current_entry == "proteins"){
    
                for (var i = 0; i < global_manage_data_sorted.length; ++i){
                    var bg_color = (i & 1) ? "#DDDDDD" : "white";
                    var row = global_manage_data_sorted[i];
                    
                    var dom_tr = document.createElement("tr");
                    dom_table.appendChild(dom_tr);
                    var dom_td_del = document.createElement("td");
                    dom_tr.appendChild(dom_td_del);
                    dom_td_del.setAttribute("bgcolor", bg_color);
                    dom_td_del.setAttribute("style", "cursor: pointer; min-width: 32px; max-width: 32px; float: left;");
                    dom_td_del.setAttribute("title", "Delet protein entry");
                    var dom_image = document.createElement("img");
                    dom_td_del.appendChild(dom_image);
                    dom_image.setAttribute("src", "../images/delete-small.png");
                    dom_image.setAttribute("style", "display: inline;");
                    dom_image.setAttribute("onclick", "document.getElementById('confirm_deletion_hidden').value = 'manage_delete_protein';  document.getElementById('confirm_deletion_hidden_id').value = " + row[0] + "; document.getElementById('confirm_deletion_input').value = ''; document.getElementById('confirm_deletion').style.display = 'inline';");
                    
                    if (manage_current_entry == "proteins"){
                        dom_td_del.setAttribute("style", "cursor: pointer; min-width: 64px; max-width: 64px;");
                        var dom_space = document.createElement("font");
                        dom_td_del.appendChild(dom_space);
                        dom_space.innerHTML = "&nbsp;&nbsp;";
                        
                        var dom_image_update = document.createElement("img");
                        dom_td_del.appendChild(dom_image_update);
                        dom_image_update.setAttribute("src", "../images/update-small.png");
                        dom_image_update.setAttribute("title", "Update protein entry");
                        dom_image_update.setAttribute("width", "16px");
                        dom_image_update.setAttribute("onclick", "update_protein_data('" + row[5] + "');"); // accession passing
                        //dom_image_update.setAttribute("style", "display: inline; float: left;");
                    }
                    
                    
                    for (var j = 1; j < row.length; ++j){
                        var dom_td = document.createElement("td");
                        dom_tr.appendChild(dom_td);
                        dom_td.setAttribute("bgcolor", bg_color);
                        
                        if (j == 12){
                            dom_td.setAttribute("style", "min-width: 500px; max-width: 500px;");
                            var dom_select = document.createElement("select");
                            dom_td.appendChild(dom_select);
                            
                            var selected_option = 0;
                            var dom_option_no_func = document.createElement("option");
                            dom_select.appendChild(dom_option_no_func);
                            dom_option_no_func.innerHTML = "no function";
                            dom_option_no_func.value = 0;
                            
                            var ii = 1;
                            for (var f_name of function_names){
                                var dom_option_func = document.createElement("option");
                                dom_select.appendChild(dom_option_func);
                                dom_option_func.innerHTML = f_name[1];
                                dom_option_func.value = f_name[0];
                                if (row[j] == f_name[0]) selected_option = ii;
                                ++ii;
                            }
                            
                            dom_select.selectedIndex = selected_option;
                            dom_select.setAttribute("onchange", "change_select_type(this);");
                            dom_select.entity_id = row[0];
                            dom_select.col_id = j;
                            dom_select.field_len = 500;
                        }
                        else if (j == 9){
                            dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                            var dom_select = document.createElement("select");
                            dom_td.appendChild(dom_select);
                            var selected_option = 0;
                            for (var k = 0; k < chromosomes[current_species].length; ++k){
                                var dom_option = document.createElement("option");
                                dom_select.appendChild(dom_option);
                                dom_option.innerHTML = chromosomes[current_species][k];
                                dom_option.value = chromosomes[current_species][k];
                                if (row[j] == chromosomes[current_species][k]) selected_option = k;
                            }
                            dom_select.selectedIndex = selected_option;
                            dom_select.setAttribute("onchange", "change_select_type(this);");
                            dom_select.entity_id = row[0];
                            dom_select.col_id = j;
                            dom_select.field_len = 200;
                        }
                        else if (j == 8){
                            var dom_input = document.createElement("input");
                            dom_td.appendChild(dom_input);
                            dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                            dom_input.setAttribute("type", "checkbox");
                            if (row[j] == "1") dom_input.setAttribute("checked", "true");
                            dom_input.setAttribute("onchange", "change_checkbox_type(this);");
                            dom_input.entity_id = row[0];
                            dom_input.col_id = j;
                            dom_input.field_len = 200;
                        }
                        else if (j == 7){
                            dom_td.setAttribute("style", "min-width: 1000px; max-width: 1000px;");
                            var dom_div = document.createElement("div");
                            dom_td.appendChild(dom_div);
                            dom_div.setAttribute("onclick", "change_textarea_type(this, true);");
                            dom_div.setAttribute("style", "padding: 5px;");
                            dom_div.innerHTML = trim_text(row[j], 980);
                            dom_div.entity_id = row[0];
                            dom_div.col_id = j;
                            dom_div.field_len = 1000;
                        
                        }
                        else if (j == 3){
                            dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                            var dom_select = document.createElement("select");
                            dom_td.appendChild(dom_select);
                            dom_select.setAttribute("onchange", "change_select_type(this);");
                            dom_select.entity_id = row[0];
                            dom_select.col_id = j;
                            var sel_index = 0, iter = 0;
                            
                            for (var species_name in supported_species){
                                var dom_option = document.createElement("option");
                                dom_select.appendChild(dom_option);
                                dom_option.innerHTML = supported_species[species_name];
                                dom_option.value = species_name;
                                if (species_name == row[j]) sel_index = iter;
                                ++iter;
                            }
                            dom_select.selectedIndex = sel_index;
                            dom_select.field_len = 200;
                        }
                        else {
                            var dom_div = document.createElement("div");
                            dom_td.appendChild(dom_div);
                            dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                            dom_div.setAttribute("onclick", "change_textfield_type(this, true);");
                            dom_div.setAttribute("style", "padding: 5px;");
                            dom_div.innerHTML = trim_text(row[j], 180);
                            dom_div.entity_id = row[0];
                            dom_div.col_id = j;
                            dom_div.field_len = 200;
                        }                    
                        
                    }
                }
            }
            
            else if (manage_current_entry == "metabolites"){
                
                for (var i = 0; i < global_manage_data_sorted.length; ++i){
                    var bg_color = (i & 1) ? "#DDDDDD" : "white";
                    var row = global_manage_data_sorted[i];
                    
                    var dom_tr = document.createElement("tr");
                    dom_table.appendChild(dom_tr);
                    var dom_td_del = document.createElement("td");
                    dom_tr.appendChild(dom_td_del);
                    dom_td_del.setAttribute("bgcolor", bg_color);
                    dom_td_del.setAttribute("style", "cursor: pointer; min-width: 64px; max-width: 64px;");
                    var dom_image = document.createElement("img");
                    dom_td_del.appendChild(dom_image);
                    dom_image.setAttribute("src", "../images/delete-small.png");
                    
                    dom_image.setAttribute("onclick", "document.getElementById('confirm_deletion_hidden').value = 'manage_delete_metabolite';  document.getElementById('confirm_deletion_hidden_id').value = " + row[0] + "; document.getElementById('confirm_deletion_input').value = ''; document.getElementById('confirm_deletion').style.display = 'inline';");
                    
                    for (var j = 1; j < row.length; ++j){
                        var dom_td = document.createElement("td");
                        dom_tr.appendChild(dom_td);
                        dom_td.setAttribute("bgcolor", bg_color);
                        
                            
                        var dom_div = document.createElement("div");
                        dom_td.appendChild(dom_div);
                        var smiles_col = 7;
                        if (j != smiles_col) dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                        else dom_td.setAttribute("style", "min-width: 1000px; max-width: 1000px;");
                        dom_div.setAttribute("onclick", "change_textfield_type(this, true);");
                        dom_div.setAttribute("style", "padding: 5px;");
                        if (j != smiles_col) dom_div.innerHTML = trim_text(row[j], 180);
                        else dom_div.innerHTML = trim_text(row[j], 980);
                        dom_div.entity_id = row[0];
                        dom_div.col_id = j;
                        dom_div.field_len = (j != smiles_col) ? 200 : 1000;
                    }
                }
                
            }
            
            else if (manage_current_entry == "species"){
                
                for (var i = 0; i < global_manage_data_sorted.length; ++i){
                    var bg_color = (i & 1) ? "#DDDDDD" : "white";
                    var row = global_manage_data_sorted[i];
                    
                    var dom_tr = document.createElement("tr");
                    dom_table.appendChild(dom_tr);
                    var dom_td_del = document.createElement("td");
                    dom_tr.appendChild(dom_td_del);
                    dom_td_del.setAttribute("bgcolor", bg_color);
                    dom_td_del.setAttribute("style", "cursor: pointer; min-width: 64px; max-width: 64px;");
                    var dom_image = document.createElement("img");
                    dom_td_del.appendChild(dom_image);
                    dom_image.setAttribute("src", "../images/delete-small.png");
                    
                    dom_image.setAttribute("onclick", "del_species_ncbi = '" + row[1] + "'; document.getElementById('confirm_deletion_hidden').value = 'manage_delete_species';  document.getElementById('confirm_deletion_hidden_id').value = " + row[0] + "; document.getElementById('confirm_deletion_input').value = ''; document.getElementById('confirm_deletion').style.display = 'inline';");
                    
                    for (var j = 1; j < row.length; ++j){
                        var dom_td = document.createElement("td");
                        dom_tr.appendChild(dom_td);
                        dom_td.setAttribute("bgcolor", bg_color);
                        
                            
                        var dom_div = document.createElement("div");
                        dom_td.appendChild(dom_div);
                        dom_td.setAttribute("style", "min-width: 325px; max-width: 325px;");
                        dom_div.setAttribute("style", "padding: 5px;");
                        dom_div.entity_id = row[0];
                        dom_div.innerHTML = trim_text(row[j], 300);
                        dom_div.col_id = j;
                        dom_div.field_len = 325;
                    }
                }
                
            }
            
            else if (manage_current_entry == "loci_names"){
                
                for (var i = 0; i < global_manage_data_sorted.length; ++i){
                    var bg_color = (i & 1) ? "#DDDDDD" : "white";
                    var row = global_manage_data_sorted[i];
                    
                    var dom_tr = document.createElement("tr");
                    dom_table.appendChild(dom_tr);
                    var dom_td_del = document.createElement("td");
                    dom_tr.appendChild(dom_td_del);
                    dom_td_del.setAttribute("bgcolor", bg_color);
                    dom_td_del.setAttribute("style", "cursor: pointer; min-width: 64px; max-width: 64px;");
                    var dom_image = document.createElement("img");
                    dom_td_del.appendChild(dom_image);
                    dom_image.setAttribute("src", "../images/delete-small.png");
                    
                    dom_image.setAttribute("onclick", "document.getElementById('confirm_deletion_hidden').value = 'manage_delete_loci_names';  document.getElementById('confirm_deletion_hidden_id').value = " + row[0] + "; document.getElementById('confirm_deletion_input').value = ''; document.getElementById('confirm_deletion').style.display = 'inline';");
                    
                    for (var j = 1; j < row.length; ++j){
                        var dom_td = document.createElement("td");
                        dom_tr.appendChild(dom_td);
                        dom_td.setAttribute("bgcolor", bg_color);
                        
                            
                        var dom_div = document.createElement("div");
                        dom_td.appendChild(dom_div);
                        dom_td.setAttribute("style", "min-width: 325px; max-width: 325px;");
                        dom_div.setAttribute("style", "padding: 5px;");
                        dom_div.setAttribute("onclick", "change_textfield_type(this, true);");
                        dom_div.entity_id = row[0];
                        dom_div.innerHTML = trim_text(row[j], 300);
                        dom_div.col_id = j;
                        dom_div.field_len = 325;
                    }
                }
                
            }
            
            else if (manage_current_entry == "tissues"){
                
                for (var i = 0; i < global_manage_data_sorted.length; ++i){
                    var bg_color = (i & 1) ? "#DDDDDD" : "white";
                    var row = global_manage_data_sorted[i];
                    
                    var dom_tr = document.createElement("tr");
                    dom_table.appendChild(dom_tr);
                    var dom_td_del = document.createElement("td");
                    dom_tr.appendChild(dom_td_del);
                    dom_td_del.setAttribute("bgcolor", bg_color);
                    dom_td_del.setAttribute("style", "cursor: pointer; min-width: 64px; max-width: 64px;");
                    var dom_image = document.createElement("img");
                    dom_td_del.appendChild(dom_image);
                    dom_image.setAttribute("src", "../images/delete-small.png");
                    
                    dom_image.setAttribute("onclick", "del_tissue_brenda = '" + row[1] + "'; document.getElementById('confirm_deletion_hidden').value = 'manage_delete_tissues';  document.getElementById('confirm_deletion_hidden_id').value = " + row[0] + "; document.getElementById('confirm_deletion_input').value = ''; document.getElementById('confirm_deletion').style.display = 'inline';");
                    
                    for (var j = 1; j < row.length; ++j){
                        var dom_td = document.createElement("td");
                        dom_tr.appendChild(dom_td);
                        dom_td.setAttribute("bgcolor", bg_color);
                        dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                        
                        if (j == 3){
                            var dom_img = document.createElement("img");
                            dom_td.setAttribute("align", "center");
                            dom_td.appendChild(dom_img);
                            dom_img.setAttribute("style", "padding: 5px;");
                            dom_img.setAttribute("width", "12");
                            dom_img.setAttribute("height", "12");
                            dom_img.entity_id = row[0];
                            dom_img.col_id = j;
                            dom_img.src = 'data:image/jpeg;base64,' + row[j];
                        }
                        else if (j == 4){
                            
                            var dom_div = document.createElement("div");
                            dom_td.appendChild(dom_div);
                            dom_div.setAttribute("style", "background-color: " + row[j] + "; width: 80%;");
                            dom_div.entity_id = row[0];
                            dom_div.col_id = j;
                            dom_div.innerHTML = "&nbsp;";
                        }
                        else {
                            
                            var dom_div = document.createElement("div");
                            dom_td.appendChild(dom_div);
                            dom_div.setAttribute("style", "padding: 5px;");
                            dom_div.entity_id = row[0];
                            dom_div.innerHTML = trim_text(row[j], 180);
                            dom_div.col_id = j;
                            dom_div.field_len = 200;
                        }
                    }
                }
                
            }
            
            else if (manage_current_entry == "pathways"){
    
                for (var i = 0; i < global_manage_data_sorted.length; ++i){
                    var bg_color = (i & 1) ? "#DDDDDD" : "white";
                    var row = global_manage_data_sorted[i];
                    
                    var dom_tr = document.createElement("tr");
                    dom_table.appendChild(dom_tr);
                    var dom_td_del = document.createElement("td");
                    dom_tr.appendChild(dom_td_del);
                    dom_td_del.setAttribute("bgcolor", bg_color);
                    dom_td_del.setAttribute("style", "cursor: pointer; min-width: 64px; max-width: 64px;");
                    var dom_image = document.createElement("img");
                    dom_td_del.appendChild(dom_image);
                    dom_image.setAttribute("src", "../images/delete-small.png");
                    dom_image.setAttribute("onclick", "document.getElementById('confirm_deletion_hidden').value = 'manage_delete_pathway';  document.getElementById('confirm_deletion_hidden_id').value = " + row[0] + "; document.getElementById('confirm_deletion_input').value = ''; document.getElementById('confirm_deletion').style.display = 'inline';");
                    
                    
                    var sorted_pathway_groups = [];
                    for (var pg_id in pathway_groups) sorted_pathway_groups.push([pathway_groups[pg_id][1], pg_id]);
                    sorted_pathway_groups.sort();
                    
                    for (var j = 1; j < row.length; ++j){
                        var dom_td = document.createElement("td");
                        dom_tr.appendChild(dom_td);
                        dom_td.setAttribute("bgcolor", bg_color);
                        
                        if (j == 1){
                            var dom_div = document.createElement("div");
                            dom_td.appendChild(dom_div);
                            dom_td.setAttribute("style", "min-width: 600px; max-width: 600px;");
                            dom_div.setAttribute("onclick", "change_textarea_type(this, true);");
                            dom_div.setAttribute("style", "padding: 5px;");
                            dom_div.innerHTML = trim_text(row[j], 580);
                            dom_div.entity_id = row[0];
                            dom_div.col_id = j;
                            dom_div.field_len = 580;
                        }
                        else if (j == 2){                            
                            var dom_select = document.createElement("select");
                            dom_td.appendChild(dom_select);
                            dom_select.setAttribute("style", "min-width: 300px; max-width: 300px;");
                            var selected_option = 0;
                            var k = 0;
                            for (var group_row of sorted_pathway_groups){
                                var pg_id = group_row[1];
                                var dom_option = document.createElement("option");
                                dom_select.appendChild(dom_option);
                                dom_option.innerHTML = group_row[0];
                                dom_option.value = pg_id;
                                if (parseInt(row[j]) == parseInt(pg_id)) selected_option = k;
                                ++k;
                            }
                            dom_select.selectedIndex = selected_option;
                            dom_select.setAttribute("onchange", "change_select_type(this);");
                            dom_select.entity_id = row[0];
                            dom_select.col_id = j;
                        }
                        else if (j == 3){
                            var dom_input = document.createElement("input");
                            dom_td.appendChild(dom_input);
                            dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                            dom_input.setAttribute("type", "checkbox");
                            if (row[j] == "1") dom_input.setAttribute("checked", "true");
                            dom_input.setAttribute("onchange", "change_checkbox_type(this);");
                            dom_input.entity_id = row[0];
                            dom_input.col_id = j;
                            dom_input.field_len = 200;
                        }
                    }
                    var dom_td_filler = document.createElement("td");
                    dom_tr.appendChild(dom_td_filler);
                    dom_td_filler.setAttribute("style", "width: 100%; box-sizing: border-box;");
                }
            }
            
            
            
            
            else if (manage_current_entry == "pathway_groups"){
    
                for (var i = 0; i < global_manage_data_sorted.length; ++i){
                    var bg_color = (i & 1) ? "#DDDDDD" : "white";
                    var row = global_manage_data_sorted[i];
                    
                    var dom_tr = document.createElement("tr");
                    dom_table.appendChild(dom_tr);
                    var dom_td_del = document.createElement("td");
                    dom_tr.appendChild(dom_td_del);
                    dom_td_del.setAttribute("bgcolor", bg_color);
                    dom_td_del.setAttribute("style", "cursor: pointer; min-width: 64px; max-width: 64px;");
                    var dom_image = document.createElement("img");
                    dom_td_del.appendChild(dom_image);
                    dom_image.setAttribute("src", "../images/delete-small.png");
                    dom_image.setAttribute("onclick", "document.getElementById('confirm_deletion_hidden').value = 'manage_delete_pathway_group';  document.getElementById('confirm_deletion_hidden_id').value = " + row[0] + "; document.getElementById('confirm_deletion_input').value = ''; document.getElementById('confirm_deletion').style.display = 'inline';");
                    
                    
                    
                    for (var j = 1; j < row.length; ++j){
                        var dom_td = document.createElement("td");
                        dom_tr.appendChild(dom_td);
                        dom_td.setAttribute("bgcolor", bg_color);
                        var dom_div = document.createElement("div");
                        dom_td.appendChild(dom_div);
                        if (j == 1){
                            dom_td.setAttribute("style", "min-width: 700px; max-width: 700px;");
                            dom_div.setAttribute("onclick", "change_textarea_type(this, true);");
                        }
                        else {
                            dom_td.setAttribute("style", "min-width: 200px; max-width: 200px;");
                            dom_div.setAttribute("onclick", "change_textfield_type(this, true);");
                        }
                        dom_div.setAttribute("style", "padding: 5px;");
                        dom_div.innerHTML = trim_text(row[j], dom_div.offsetWidth - 20);
                        dom_div.entity_id = row[0];
                        dom_div.col_id = j;
                        dom_div.field_len = dom_div.offsetWidth - 20;
                    }
                    
                    
                    var dom_td_filler = document.createElement("td");
                    dom_tr.appendChild(dom_td_filler);
                    dom_td_filler.setAttribute("style", "width: 100%; box-sizing: border-box;");
                }
            }
            
            for (var i = 0; i < 5; ++i){
                var dom_tr_filler_1 = document.createElement("tr");
                dom_table.appendChild(dom_tr_filler_1);
                var dom_td_filler_1 = document.createElement("td");
                dom_tr_filler_1.appendChild(dom_td_filler_1);
                dom_td_filler_1.innerHTML = "&nbsp;"
            }
        }
    }
    
    xmlhttp_manage.open("GET", request, false);
    xmlhttp_manage.send();
    document.getElementById("editor_select_manage_content_wrapper").style.width = (document.getElementById("editor_select_manage_table_header").offsetWidth).toString() + "px";
}


function manage_delete_protein(prot_id){
    
    var request = "type=protein&id=" + prot_id;
    request = file_pathname + "admin/scripts/delete-entity.py?" + request
    
    
    var xmlhttp_protein_data = new XMLHttpRequest();
    xmlhttp_protein_data.onreadystatechange = function() {
        if (xmlhttp_protein_data.readyState == 4 && xmlhttp_protein_data.status == 200) {
            var request = xmlhttp_protein_data.responseText;
            if (request < 0){
                alert("Error: protein could not be deleted from database.");
            }
            manage_fill_table();
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




function manage_delete_pathway_group(entity_id){
    var request = "type=pathway_group&id=" + entity_id;
    request = file_pathname + "admin/scripts/delete-entity.py?" + request;
    
    
    var xmlhttp_protein_data = new XMLHttpRequest();
    xmlhttp_protein_data.onreadystatechange = function() {
        if (xmlhttp_protein_data.readyState == 4 && xmlhttp_protein_data.status == 200) {
            var request = xmlhttp_protein_data.responseText;
            if (request < 0){
                alert("Error: pathway group could not be deleted from database.");
            }
            
            // get number of proteins
            var xmlhttp_proteins = new XMLHttpRequest();
            xmlhttp_proteins.onreadystatechange = function() {
                if (xmlhttp_proteins.readyState == 4 && xmlhttp_proteins.status == 200) {
                    protein_max_pages = Math.floor(parseInt(xmlhttp_proteins.responseText) / max_per_page) + 1;
                    loci_max_pages = Math.floor(parseInt(xmlhttp_proteins.responseText) / max_per_page) + 1;
                    manage_fill_table();
                }
            }
            xmlhttp_proteins.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=proteins_num", true);
            xmlhttp_proteins.send();
        }
    }
    xmlhttp_protein_data.open("GET", request, false);
    xmlhttp_protein_data.send();
}





function manage_delete_pathway(entity_id){
    
    var ref_pg_id = -1;
    var ref_pos = 0;
    for (pg_id in pathway_groups){
        if (ref_pg_id != -1) break;
        
        for (var i = 0; i < pathway_groups[pg_id][2].length; ++i){
            var pw_id = pathway_groups[pg_id][2][i];
            
            if (pw_id == entity_id){
                ref_pg_id = pw_id;
                ref_pos = i;
                break;
            }
        }
    }
    
    var request = "type=pathway&id=" + entity_id;
    request = file_pathname + "admin/scripts/delete-entity.py?" + request;
    
    var xmlhttp_protein_data = new XMLHttpRequest();
    xmlhttp_protein_data.onreadystatechange = function() {
        if (xmlhttp_protein_data.readyState == 4 && xmlhttp_protein_data.status == 200) {
            var request = xmlhttp_protein_data.responseText;
            if (request < 0){
                alert("Error: pathway could not be deleted from database.");
            }
            manage_fill_table();
            delete pathways[entity_id];
            
            if (ref_pg_id > -1) pathway_groups[ref_pg_id][2].splice(ref_pos, 1);
            set_pathway_menu();
            
            if (current_pathway == entity_id) change_pathway();
            
            var del_nodes = new Set();
            for (node_id in data){
                if (data[node_id].foreign_id == entity_id && data[node_id].type == "pathway") del_nodes.add(parseInt(node_id));
            }
            
            var del_directs = []
            for (var direct_id in edge_data['direct']){
                if (del_nodes.has(edge_data['direct'][direct_id]['n'])) del_directs.push(direct_id);
            }
            for (var i = 0; i < del_directs.length; ++i) delete edge_data['direct'][del_directs[i]];
            for (node_id of del_nodes) delete data[node_id.toString()];
            compute_edges();
            assemble_elements();
            draw();
        }
    }
    xmlhttp_protein_data.open("GET", request, false);
    xmlhttp_protein_data.send();
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
    var entity_id = dom_obj.entity_id;
    var col_id = dom_obj.col_id;
    var content = dom_obj.checked;
    var request = "action=set&table=" + manage_current_entry + "&id=" + entity_id + "&column=" + manage_columns[manage_current_entry][col_id - 1] + "&value=" + (content ? "1" : "0");
       
    var result = update_entry(request);
    if (!result){
        alert("Error: database could not be updated.");
    }
    else {
        if (manage_current_entry == "pathways"){
            if (col_id == 3) pathways[entity_id][1] = content;
            set_pathway_menu();
        }
        manage_fill_table();
    }
}


function change_select_type(dom_obj){
    var entity_id = dom_obj.entity_id;
    var col_id = dom_obj.col_id;
    var content = dom_obj[dom_obj.selectedIndex].value;
    var request = "action=set&table=" + manage_current_entry + "&id=" + entity_id + "&column=" + manage_columns[manage_current_entry][col_id - 1] + "&value=" + content;
    
       
    var result = update_entry(request);
    if (!result){
        alert("Error: database could not be updated.");
    }
    else {
        manage_fill_table();
    }
}


function change_textfield_type(dom_obj, to_text){
    if (to_text){
        var parent = dom_obj.parentNode;
        var entity_id = dom_obj.entity_id;
        var col_id = dom_obj.col_id;
        var field_len = dom_obj.field_len;
        var content = global_manage_data[entity_id][col_id];
        
        parent.innerHTML = "";
        dom_obj = document.createElement("input");
        parent.appendChild(dom_obj);
        dom_obj.setAttribute("type", "text");
        dom_obj.setAttribute("value", content);
        dom_obj.setAttribute("onkeyup", "if (event.which == '13') change_textfield_type(this, false);");
        dom_obj.setAttribute("onblur", "change_textfield_type(this, false);");
        dom_obj.entity_id = entity_id;
        dom_obj.col_id = col_id;
        dom_obj.field_len = field_len;
        dom_obj.focus();
        dom_obj.setSelectionRange(content.length, content.length);
    }
    else {
        var parent = dom_obj.parentNode;
        var content = dom_obj.value;
        var entity_id = dom_obj.entity_id;
        var col_id = dom_obj.col_id;
        var field_len = dom_obj.field_len;
        
        var request = "action=set&table=" + manage_current_entry + "&id=" + entity_id + "&column=" + manage_columns[manage_current_entry][col_id - 1] + "&value=" + encodeURL(content);
        
        var result = update_entry(request);
        if (!result){
            alert("Error: database could not be updated.");
        }
        else {
            if (manage_current_entry == "proteins" && manage_columns[manage_current_entry][col_id - 1] == "name" && (entity_id in protein_dictionary)){
                protein_dictionary[entity_id].name = content;
                draw();
            }
            manage_fill_table();
        }
        
        parent.innerHTML = "";
        dom_obj = document.createElement("div");
        parent.appendChild(dom_obj);
        dom_obj.setAttribute("onclick", "change_textfield_type(this, true);");
        dom_obj.setAttribute("style", "min-width: " + field_len + "px; max-width: " + field_len + "px;");
        dom_obj.setAttribute("style", "padding: 5px;");
        dom_obj.entity_id = entity_id;
        dom_obj.col_id = col_id;
        dom_obj.field_len = field_len;
        dom_obj.innerHTML = trim_text(content, field_len - 20);
        if (entity_id in global_manage_data && col_id in global_manage_data[entity_id]) global_manage_data[entity_id][col_id] = content;
    }
}


function change_textarea_type(dom_obj, to_text){
    if (to_text){
        var parent = dom_obj.parentNode;
        var entity_id = dom_obj.entity_id;
        var col_id = dom_obj.col_id;
        var content = global_manage_data[entity_id][col_id];
        var field_len = dom_obj.field_len;
        
        parent.innerHTML = "";
        dom_obj = document.createElement("textarea");
        parent.appendChild(dom_obj);
        dom_obj.innerHTML = content;
        dom_obj.setAttribute("onblur", "change_textarea_type(this, false);");
        dom_obj.setAttribute("style", "height: 200px; min-width: " + field_len + "px; max-width: " + field_len + "px;");
        dom_obj.entity_id = entity_id;
        dom_obj.col_id = col_id;
        dom_obj.focus();
        dom_obj.field_len = field_len;
        dom_obj.setSelectionRange(content.length, content.length);
    }
    else {
        var parent = dom_obj.parentNode;
        var content = dom_obj.value;
        var entity_id = dom_obj.entity_id;
        var col_id = dom_obj.col_id;
        var field_len = dom_obj.field_len;
        
        var request = "action=set&table=" + manage_current_entry + "&id=" + entity_id + "&column=" + manage_columns[manage_current_entry][col_id - 1] + "&value=" + encodeURL(content);
        

        
        
        var result = update_entry(request);
        if (!result){
            alert("Error: database could not be updated.");
        }
        else {
            if (manage_current_entry == "pathways" && manage_columns[manage_current_entry][col_id - 1] == "name"){
                pathways[entity_id] = content;
                set_pathway_menu();
                
                for (node_id in data){
                    if (data[node_id].type == "pathway" && data[node_id].foreign_id == entity_id){
                        data[node_id].name = content;
                        data[node_id].setup_pathway_meta();
                    }
                }
                if (current_pathway == entity_id){
                    current_pathway_title = new pathway_title();
                }
                draw();
            }
            else if (manage_current_entry == "pathways" && manage_columns[manage_current_entry][col_id - 1] == "pathway_group_id"){
                set_pathway_menu();
            }
            else if (manage_current_entry == "pathway_groups"){
                
                set_pathway_menu();
            }
            manage_fill_table();
        }
        parent.innerHTML = "";
        dom_obj = document.createElement("div");
        parent.appendChild(dom_obj);
        dom_obj.setAttribute("onclick", "change_textarea_type(this, true);");
        dom_obj.setAttribute("style", "min-width: " + field_len + "px; max-width: " + field_len + "px;");
        dom_obj.setAttribute("style", "padding: 5px;");
        dom_obj.entity_id = entity_id;
        dom_obj.col_id = col_id;
        dom_obj.field_len = field_len;
        global_manage_data[entity_id][col_id] = content;
        dom_obj.innerHTML = trim_text(content, field_len - 20);
    }
}



function resize_manage_view(){
    var window_width_factor = 0.9;
    if (manage_current_entry == "pathways" || manage_current_entry == "pathway_groups" || manage_current_entry == "tissues") window_width_factor = 0.5;
    else if (manage_current_entry == "species" || manage_current_entry == "loci_names") window_width_factor = 0.4;
    
    
    // set height of manage selection window
    var close_manage_window = document.getElementById("manage_entries").style.display != "inline";
    document.getElementById("manage_entries").style.display = "inline";
    
    document.getElementById("editor_select_manage").style.width = (window.innerWidth * window_width_factor).toString() + "px";
    document.getElementById("editor_select_manage").style.height = (window.innerHeight * 0.85).toString() + "px";
    var wth_manage = document.getElementById("editor_select_manage_cell").offsetWidth;
    var hgt_manage = document.getElementById("editor_select_manage_cell").offsetHeight;
    document.getElementById("editor_select_manage_table_wrapper").style.width = wth_manage.toString() + "px";
    document.getElementById("editor_select_manage_table_wrapper").style.height = hgt_manage.toString() + "px";
    if (close_manage_window) document.getElementById("manage_entries").style.display = "none";
    
    
    
    document.getElementById("step-container").style.width = (window.innerWidth * 0.8).toString() + "px";
    document.getElementById("step-container").style.height = (window.innerHeight * 0.85).toString() + "px";
    
    document.getElementById("step-back-panel").style.width = (window.innerWidth * 0.8).toString() + "px";
    document.getElementById("step-back-panel").style.height = "20px";
    document.getElementById("step-back-panel").style.top = (window.innerHeight * 0.075).toString() + "px";
    
    
    // set height of metabolite selection window
    document.getElementById("editor_select_metabolite_window").style.height = (window.innerHeight * 0.85).toString() + "px";
    var close_metabolite_window = document.getElementById("editor_select_metabolite").style.display != "inline";
    document.getElementById("editor_select_metabolite").style.display = "inline";
    var hgt_meta = document.getElementById("editor_select_metabolite_cell").offsetHeight * 0.95;
    document.getElementById("editor_select_metabolite_table_wrapper").style.height = hgt_meta.toString() + "px";
    if (close_metabolite_window) document.getElementById("editor_select_metabolite").style.display = "none";
    
    
    // set height of pathway selection window
    document.getElementById("editor_select_pathway_window").style.height = (window.innerHeight * 0.7).toString() + "px";
    
    // set height of protein selection window
    document.getElementById("editor_select_protein_window").style.height = (window.innerHeight * 0.85).toString() + "px";
    var close_protein_window = document.getElementById("editor_select_protein").style.display != "inline";
    document.getElementById("editor_select_protein").style.display = "inline";
    var hgt_prot = document.getElementById("editor_select_protein_cell").offsetHeight * 0.95;
    document.getElementById("editor_select_protein_table_wrapper").style.height = hgt_prot.toString() + "px";
    if (close_protein_window) document.getElementById("editor_select_protein").style.display = "none";
    
    
    // set height of loci selection window
    document.getElementById("editor_select_loci_window").style.height = (window.innerHeight * 0.85).toString() + "px";
    var close_protein_window = document.getElementById("editor_select_loci").style.display != "inline";
    document.getElementById("editor_select_loci").style.display = "inline";
    var hgt_prot = document.getElementById("editor_select_loci_cell").offsetHeight * 0.95;
    document.getElementById("editor_select_loci_table_wrapper").style.height = hgt_prot.toString() + "px";
    if (close_protein_window) document.getElementById("editor_select_loci").style.display = "none";
    
    
    // set height of protein adding window
    document.getElementById("add_manage_proteins_window").style.height = (window.innerHeight * 0.7).toString() + "px";
    var close_add_protein_window = document.getElementById("add_manage_proteins").style.display != "inline";
    document.getElementById("add_manage_proteins").style.display = "inline";
    var hgt_add_prot = document.getElementById("add_manage_proteins_cell").offsetHeight * 0.95;
    document.getElementById("add_manage_proteins_wrapper").style.height = hgt_add_prot.toString() + "px";
    if (close_add_protein_window) document.getElementById("add_manage_proteins").style.display = "none";
    
    // set height of metabolites adding window
    document.getElementById("add_manage_metabolites_window").style.height = "380px";
    
    // set height of pathways adding window
    document.getElementById("add_manage_pathways_window").style.height = "130px";
    
    // set height of pathways adding window
    document.getElementById("add_manage_species_window").style.height = "130px";
    
    // set height of pathways adding window
    document.getElementById("add_manage_tissues_window").style.height = "130px";
    
    // set height of pathways adding window
    document.getElementById("add_manage_loci_names_window").style.height = "130px";
}






function hide_manage_entries (){
    resize_manage_view();
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


function request_metabolites_data(){
    var request = file_pathname + "admin/scripts/request-entity-data.py?type=metabolite&";
    var search_id = document.getElementById("add_manage_metabolite_ident_val").value;
    if (search_id.length < 1) return;
    
    if (document.getElementById("add_manage_metabolite_ident_kegg").checked) request += "c_number=" + search_id;
    else request += "lm_id=" + search_id;
    
    var xmlhttp_metabolite_data = new XMLHttpRequest();
    xmlhttp_metabolite_data.onreadystatechange = function() {
        if (xmlhttp_metabolite_data.readyState == 4 && xmlhttp_metabolite_data.status == 200) {
            var request = JSON.parse(xmlhttp_metabolite_data.responseText);
            if (request != -1) {
                if ("name" in request) document.getElementById("add_manage_metabolites_name").value = request["name"];
                if ("short_name" in request) document.getElementById("add_manage_metabolites_short_name").value = request["short_name"];
                if ("formula" in request) document.getElementById("add_manage_metabolites_formula").value = request["formula"];
                if ("c_number" in request) document.getElementById("add_manage_metabolites_c_number").value = request["c_number"];
                if ("lm_id" in request) document.getElementById("add_manage_metabolites_lmid").value = request["lm_id"];
                if ("exact_mass" in request) document.getElementById("add_manage_metabolites_exact_mass").value = request["exact_mass"];
                if ("smiles" in request) document.getElementById("add_manage_metabolites_smiles").value = request["smiles"];
            }
        }
    }
    xmlhttp_metabolite_data.open("GET", request, false);
    xmlhttp_metabolite_data.send();
}







function request_protein_data(){
    var accession = document.getElementById("add_manage_proteins_accession").value;
    if (accession.length < 1) return;
    
    var request = file_pathname + "admin/scripts/request-entity-data.py?type=protein&accession=" + accession;
    
    var xmlhttp_protein_data = new XMLHttpRequest();
    xmlhttp_protein_data.onreadystatechange = function() {
        if (xmlhttp_protein_data.readyState == 4 && xmlhttp_protein_data.status == 200) {
            var request = JSON.parse(xmlhttp_protein_data.responseText);
            if (request != -1) {
                if ("name" in request) document.getElementById("add_manage_proteins_name").value = request["name"];
                if ("definition" in request) document.getElementById("add_manage_proteins_definition").value = request["definition"];
                if ("fasta" in request) document.getElementById("add_manage_proteins_fasta").value = request["fasta"];
                if ("ec_number" in request) document.getElementById("add_manage_proteins_ec_number").value = request["ec_number"];
                if ("kegg_id" in request) document.getElementById("add_manage_proteins_kegg").value = request["kegg_id"];
                if ("chr_start" in request) document.getElementById("add_manage_proteins_chr_start").value = request["chr_start"];
                if ("chr_end" in request) document.getElementById("add_manage_proteins_chr_end").value = request["chr_end"];
                if ("unreviewed" in request) document.getElementById("add_manage_proteins_unreviewed").checked = request["unreviewed"];
                else document.getElementById("add_manage_proteins_unreviewed").checked = false;
                if ("species" in request){
                    var dom_species_select = document.getElementById("add_manage_proteins_species");
                    var selected_index = -1;
                    for (var i = 0; i < dom_species_select.length; ++i){
                        if (dom_species_select[i].value == request["species"]){
                            selected_index = i;
                            break;
                        }
                    }
                    if (selected_index >= 0){
                        dom_species_select.selectedIndex = selected_index;
                        change_add_manage_proteins_chromosome();
                    }
                    else alert("Warning: species '" + request["species"] + "' not registered in database!");
                }
                if ("function_id" in request){
                    var dom_function_select = document.getElementById("add_manage_proteins_function");
                    var selected_index = 0;
                    for (var i = 0; i < dom_function_select.length; ++i){
                        if (dom_function_select[i].value == request["function_id"]){
                            dom_function_select.selectedIndex = i;
                            break;
                        }
                    }
                    
                }
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
            }
        }
    }
    xmlhttp_protein_data.open("GET", request, false);
    xmlhttp_protein_data.send();
}


function add_manage_proteins_add(){
    
    if (document.getElementById("add_manage_proteins_accession").value.length == 0){
        alert("Warning: please type in a uniprot accession number");
        return;
    }
    
    if (document.getElementById("add_manage_proteins_name").value.length == 0){
        alert("Warning: please type in a protein name");
        return;
    }
    
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
    request += data_separator + "accession:" + document.getElementById("add_manage_proteins_accession").value;
    
    request += data_separator + "definition:" + document.getElementById("add_manage_proteins_definition").value;
    request += data_separator + "fasta:" + document.getElementById("add_manage_proteins_fasta").value;
    request += data_separator + "ec_number:" + document.getElementById("add_manage_proteins_ec_number").value;
    request += data_separator + "kegg_link:" + document.getElementById("add_manage_proteins_kegg").value;
    var val = document.getElementById("add_manage_proteins_chr_start").value;
    request += data_separator + "chr_start:" + (val.length > 0 ? val : "-1");
    val = document.getElementById("add_manage_proteins_chr_end").value;
    request += data_separator + "chr_end:" + (val.length > 0 ? val : "-1");
    request += data_separator + "unreviewed:" + (document.getElementById("add_manage_proteins_unreviewed").checked ? "1" : "0");
    request += data_separator + "function_id:" + document.getElementById("add_manage_proteins_function")[document.getElementById("add_manage_proteins_function").selectedIndex].value;
    request += data_separator + "chromosome:" + document.getElementById("add_manage_proteins_chromosome")[document.getElementById("add_manage_proteins_chromosome").selectedIndex].value;
    request += data_separator + "species:" + document.getElementById("add_manage_proteins_species")[document.getElementById("add_manage_proteins_species").selectedIndex].value;
    
    request = file_pathname + "admin/scripts/manage-entries.bin?action=insert&type=proteins&data=" + encodeURL(request);
    
    var xmlhttp_add_protein = new XMLHttpRequest();
    xmlhttp_add_protein.onreadystatechange = function() {
        if (xmlhttp_add_protein.readyState == 4 && xmlhttp_add_protein.status == 200) {
            var request = xmlhttp_add_protein.responseText;
            
            if (request < 0){
                alert("An error has occured while adding the protein to the database. Please contact the administrator.");
            }
            document.getElementById('add_manage_proteins').style.display = 'none';
            
            // get number of proteins
            var xmlhttp_proteins = new XMLHttpRequest();
            xmlhttp_proteins.onreadystatechange = function() {
                if (xmlhttp_proteins.readyState == 4 && xmlhttp_proteins.status == 200) {
                    protein_max_pages = Math.floor(parseInt(xmlhttp_proteins.responseText) / max_per_page) + 1;
                    loci_max_pages = Math.floor(parseInt(xmlhttp_proteins.responseText) / max_per_page) + 1;
                    manage_fill_table();
                }
            }
            xmlhttp_proteins.open("GET", file_pathname + "admin/scripts/manage-entries.bin?action=get&type=proteins_num", true);
            xmlhttp_proteins.send();
            
        }
    }
    xmlhttp_add_protein.open("GET", request, false);
    xmlhttp_add_protein.send();
}



function add_manage_pathways(){
    
    var new_pathway_name = document.getElementById("add_manage_pathways_name").value;
    
    if (new_pathway_name.length == 0){
        alert("Warning: please type in a pathway name");
        return;
    }
    var pathway_group = document.getElementById("add_manage_pathways_group")[document.getElementById("add_manage_pathways_group").selectedIndex].value;
    var signaling = document.getElementById("add_manage_pathways_signaling").checked;
    var request = "name:" + new_pathway_name + data_separator + "pathway_group_id:" + pathway_group + data_separator + "signaling_pathway:" + (signaling ? "1" : "0");
    
    request = file_pathname + "admin/scripts/manage-entries.bin?action=insert&type=pathways&data=" + encodeURL(request);
    
    var xmlhttp_add_pathway = new XMLHttpRequest();
    xmlhttp_add_pathway.onreadystatechange = function() {
        if (xmlhttp_add_pathway.readyState == 4 && xmlhttp_add_pathway.status == 200) {
            var request = xmlhttp_add_pathway.responseText;
            if (request < 0){
                alert("An error has occured while adding the pathway to the database. Please contact the administrator.");
            }
            document.getElementById('add_manage_pathways').style.display = 'none';
            manage_fill_table();
            pathways[request] = [new_pathway_name, (signaling ? 1 : 0)];
            pathway_groups[pathway_group][2].add(request);
            set_pathway_menu();
        }
    }
    xmlhttp_add_pathway.open("GET", request, false);
    xmlhttp_add_pathway.send();
}



function add_manage_species_add(){
    var opt = document.getElementById("add_manage_species_select");
    opt = opt[opt.selectedIndex];
    
    
    var request = "name:" + opt.text;
    request += data_separator + "ncbi:" + opt.id;
    request = file_pathname + "admin/scripts/manage-entries.bin?action=insert&type=species&data=" + encodeURL(request);
    
    var xmlhttp_add_species = new XMLHttpRequest();
    xmlhttp_add_species.onreadystatechange = function() {
        if (xmlhttp_add_species.readyState == 4 && xmlhttp_add_species.status == 200) {
            var request = xmlhttp_add_species.responseText;
            if (request < 0){
                alert("An error has occured while adding the species to the database. Please contact the administrator.");
            }
            document.getElementById('add_manage_species').style.display = 'none';
            manage_fill_table();
            set_species_menu(true, false);
            add_species_events();
        }
    }
    xmlhttp_add_species.open("GET", request, false);
    xmlhttp_add_species.send();
}





function add_manage_loci_names_add(){
    
    if (document.getElementById("add_manage_loci_names_compartment").value == ""){
        alert("Warning: please type in a compartment name");
        return;
    }
    
    var request = "name:" + document.getElementById("add_manage_loci_names_compartment").value;
    
    request = file_pathname + "admin/scripts/manage-entries.bin?action=insert&type=loci_names&data=" + encodeURL(request);
    
    var xmlhttp_add_loci_names = new XMLHttpRequest();
    xmlhttp_add_loci_names.onreadystatechange = function() {
        if (xmlhttp_add_loci_names.readyState == 4 && xmlhttp_add_loci_names.status == 200) {
            var request = xmlhttp_add_loci_names.responseText;
            if (request < 0){
                alert("An error has occured while adding the compartment to the database. Please contact the administrator.");
            }
            manage_fill_table();
            document.getElementById('add_manage_loci_names').style.display = 'none';
        }
    }
    xmlhttp_add_loci_names.open("GET", request, false);
    xmlhttp_add_loci_names.send();
}





function add_manage_tissues_add(){
    if (document.getElementById('add_manage_tissues_file').files.length == 0) return;
    var file = document.getElementById('add_manage_tissues_file').files[0];
    var reader = new FileReader();
    reader.filename = file.name;
    reader.readAsBinaryString(file);
    
    reader.onload = function(){
        var encoded_image = btoa(this.result);
        encoded_image = encoded_image.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
        var opt = document.getElementById("add_manage_tissues_select");
        opt = opt[opt.selectedIndex];
        
        
        var request = "name:" + opt.text;
        request += data_separator + "brenda:" + opt.id;
        request += data_separator + "color:" + document.getElementById("add_manage_tissues_color").value.replace(/\#/g, '');
        request += data_separator + "icon:" + encoded_image;
        
        request = file_pathname + "admin/scripts/manage-entries.bin?action=insert&type=tissues&data=" + encodeURL(request);
        
        var xmlhttp_add_tissues = new XMLHttpRequest();
        xmlhttp_add_tissues.onreadystatechange = function() {
            if (xmlhttp_add_tissues.readyState == 4 && xmlhttp_add_tissues.status == 200) {
                var request = xmlhttp_add_tissues.responseText;
                if (request < 0){
                    alert("An error has occured while adding the tissue to the database. Please contact the administrator.");
                }
                document.getElementById('add_manage_tissues').style.display = 'none';
                manage_fill_table();
            }
        }
        xmlhttp_add_tissues.open("GET", request, false);
        xmlhttp_add_tissues.send();
    }
    
}



function add_manage_metabolites_add(){
    
    if (document.getElementById("add_manage_metabolites_name").value.length == 0){
        alert("Warning: please type in a metabolite name");
        return;
    }
    
    var request = "name:" + replaceAll(document.getElementById("add_manage_metabolites_name").value, "\n", "");
    request += data_separator + "short_name:" + replaceAll(document.getElementById("add_manage_metabolites_short_name").value, "\n", "");
    request += data_separator + "c_number:" + replaceAll(document.getElementById("add_manage_metabolites_c_number").value, "\n", "");
    request += data_separator + "lm_id:" + replaceAll(document.getElementById("add_manage_metabolites_lmid").value, "\n", "");
    request += data_separator + "formula:" + replaceAll(document.getElementById("add_manage_metabolites_formula").value, "\n", "");
    request += data_separator + "exact_mass:" + replaceAll(document.getElementById("add_manage_metabolites_exact_mass").value, "\n", "");
    request += data_separator + "smiles:" + replaceAll(document.getElementById("add_manage_metabolites_smiles").value, "\n", "");
    
    request = file_pathname + "admin/scripts/manage-entries.bin?action=insert&type=metabolites&data=" + encodeURL(request);
    
    var xmlhttp_add_metabolite = new XMLHttpRequest();
    xmlhttp_add_metabolite.onreadystatechange = function() {
        if (xmlhttp_add_metabolite.readyState == 4 && xmlhttp_add_metabolite.status == 200) {
            var request = xmlhttp_add_metabolite.responseText;
            if (request < 0){
                alert("An error has occured while adding the metabolite to the database. Please contact the administrator.");
            }
            document.getElementById('add_manage_metabolites').style.display = 'none';
            manage_fill_table();
        }
    }
    xmlhttp_add_metabolite.open("GET", request, false);
    xmlhttp_add_metabolite.send();
}


function go_to_browser(){
    var view_text = location.pathname + "browser.html?pathway=" + current_pathway;
    view_text = replaceAll(view_text, "/admin", "");
    location.href = view_text;
}


function manage_delete_metabolite(metabolite_id){
    var request = "type=metabolite&id=" + metabolite_id;
    request = file_pathname + "admin/scripts/delete-entity.py?" + request
    
    var xmlhttp_metabolite_data = new XMLHttpRequest();
    xmlhttp_metabolite_data.onreadystatechange = function() {
        if (xmlhttp_metabolite_data.readyState == 4 && xmlhttp_metabolite_data.status == 200) {
            var request = xmlhttp_metabolite_data.responseText;
            if (request < 0){
                alert("Error: protein could not be deleted from database.");
            }
            manage_fill_table();
            
            var node_ids = new Set();
            for (var node_id in data){
                if (data[node_id].type == 'metabolite' && data[node_id].foreign_id == metabolite_id) node_ids.add(parseInt(node_id));
            }
            
            for (var reaction_id in edge_data['reactions']){
                var del_reagents = [];
                for (var reagent_id in edge_data['reactions'][reaction_id]['r']){
                    if (node_ids.has(edge_data['reactions'][reaction_id]['r'][reagent_id]['n'])) del_reagents.push(reagent_id);
                }
                for (var i = 0; i < del_reagents.length; ++i) delete edge_data['reactions'][reaction_id]['r'][del_reagents[i]];
            }
            
            
            var del_directs = []
            for (var direct_id in edge_data['direct']){
                if (node_ids.has(edge_data['direct'][direct_id]['ns']) || node_ids.has(edge_data['direct'][direct_id]['ne'])) del_directs.push(direct_id);
            }
            for (var i = 0; i < del_directs.length; ++i) delete del_directs['direct'][del_directs[i]];
            
            for (var node_id of node_ids) delete data[node_id];
            
            
            
            compute_edges();
            assemble_elements();
            draw();
            
        }
    }
    xmlhttp_metabolite_data.open("GET", request, false);
    xmlhttp_metabolite_data.send();
}



function manage_delete_species(species_id){
    if (Object.keys(supported_species).length <= 1){
        alert("At least one species must be registered in the system.");
        return;
    }
    
    
    var request = "type=species&id=" + species_id;
    request = file_pathname + "admin/scripts/delete-entity.py?" + request
    
    var xmlhttp_species_data = new XMLHttpRequest();
    xmlhttp_species_data.onreadystatechange = function() {
        if (xmlhttp_species_data.readyState == 4 && xmlhttp_species_data.status == 200) {
            var request = xmlhttp_species_data.responseText;
            if (request < 0){
                alert("Error: species could not be deleted from database.");
            }
            delete supported_species[del_species_ncbi];
            
            if (current_species == del_species_ncbi){
                for (var species_ncbi in supported_species){
                    current_species = species_ncbi;
                    break;
                }
                load_data(true);
            }
            del_species_ncbi = "";
            manage_fill_table();
            set_species_menu(true, false);
            add_species_events();
        }
    }
    xmlhttp_species_data.open("GET", request, false);
    xmlhttp_species_data.send();
}



function manage_delete_tissues(tissues_id){
    if (Object.keys(tissues).length <= 1){
        alert("At least one tissue must be registered in the system.");
        return;
    }
    
    
    var request = "type=tissues&id=" + tissues_id;
    request = file_pathname + "admin/scripts/delete-entity.py?" + request
    
    var xmlhttp_tissues_data = new XMLHttpRequest();
    xmlhttp_tissues_data.onreadystatechange = function() {
        if (xmlhttp_tissues_data.readyState == 4 && xmlhttp_tissues_data.status == 200) {
            var request = xmlhttp_tissues_data.responseText;
            if (request < 0){
                alert("Error: tissue could not be deleted from database.");
            }
            delete tissues[del_tissue_brenda];
            del_tissue_brenda = "";
            manage_fill_table();
        }
    }
    xmlhttp_tissues_data.open("GET", request, false);
    xmlhttp_tissues_data.send();
}



function manage_delete_loci_names(loci_names_id){
    
    var request = "type=loci_names&id=" + loci_names_id;
    request = file_pathname + "admin/scripts/delete-entity.py?" + request
    
    var xmlhttp_loci_names_data = new XMLHttpRequest();
    xmlhttp_loci_names_data.onreadystatechange = function() {
        if (xmlhttp_loci_names_data.readyState == 4 && xmlhttp_loci_names_data.status == 200) {
            var request = xmlhttp_loci_names_data.responseText;
            if (request < 0){
                alert("Error: tissue could not be deleted from database.");
            }
            manage_fill_table();
        }
    }
    xmlhttp_loci_names_data.open("GET", request, false);
    xmlhttp_loci_names_data.send();
}



function curate_spectra_change_selection(row_num){
    if (row_num < 0 || spectra_max <= row_num) return;
    
    
    var dom_table = document.getElementById("curate_spectra_panel_table");
    var bg_color = (current_spectrum_selected & 1) ? "#DDDDDD" : "white";
    
    for (dom_td of dom_table.children[current_spectrum_selected].children){
        dom_td.setAttribute("bgcolor", bg_color);
    }
    
    for (dom_td of dom_table.children[row_num].children){
        dom_td.setAttribute("bgcolor", spectrum_selection_color);
    }
         
    current_spectrum_selected = row_num;
    load_spectrum(dom_table.children[current_spectrum_selected].getAttribute("value"), null, "curate_spectra");
    
    var b_count = 0;
    var y_count = 0;
    for (var peak of peaks){
        if(peak.annotation.length > 0 && peak.annotation.charAt(0) == "y") y_count++;
        if(peak.annotation.length > 0 && peak.annotation.charAt(0) == "b") b_count++;
    }
    var b_percent = b_count / peptide_mod.length * 100;
    var y_percent = y_count / peptide_mod.length * 100;
    
    document.getElementById("curate_spectra_peptide_info").innerHTML = dom_table.children[current_spectrum_selected].children[0].innerHTML + "&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;" + peptide_mod.length + "&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp; B-ions(%): " + b_percent.toFixed(2) + "%&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp; Y-ions(%): " + y_percent.toFixed(2) + "%";
    
    
    var spectra_panel = document.getElementById("curate_spectra_panel");
    
    var unit = spectra_panel.scrollHeight / spectra_max;
    var row_pos = unit * row_num;
    if (row_pos < spectra_panel.scrollTop) spectra_panel.scrollTop = row_pos - 1;
    if (spectra_panel.scrollTop + spectra_panel.clientHeight - unit < row_pos) spectra_panel.scrollTop = row_pos + 1 + unit - spectra_panel.clientHeight;
}





function curate_spectra_checking(){
    var dom_table = document.getElementById("curate_spectra_panel_table");
    var spec_id = dom_table.children[current_spectrum_selected].getAttribute("value");
    curate_spectra_checks[spec_id] = !curate_spectra_checks[spec_id];
    document.getElementById("curate_spectra-checkbox-"+ spec_id).checked = curate_spectra_checks[spec_id];
    
    var request = "action=update&id=" + spec_id + "&value=" + (curate_spectra_checks[spec_id] ? "18" : "-1") + "&species=" + current_species;
    var xmlhttp_spectra_update = new XMLHttpRequest();
    xmlhttp_spectra_update.onreadystatechange = function() {
        if (xmlhttp_spectra_update.readyState == 4 && xmlhttp_spectra_update.status == 200) {
            response = xmlhttp_spectra_update.responseText;
        }
    }
    xmlhttp_spectra_update.open("GET", file_pathname + "admin/scripts/curate-spectral-library.py?" + request, false);
    xmlhttp_spectra_update.send();
    spectrum_active = curate_spectra_checks[spec_id];
    draw_spectrum("curate_spectra");
}





function open_insert_spectra(){
    document.getElementById("waiting_background").style.display = "none";
    document.getElementById("curate_spectra").style.display = "none";
    document.getElementById('insert_spectra').style.display = 'inline';
    
    
    //document.getElementById('insert_spectra').getBoundingClientRect();
    
    init_manage_blib();
}







function curate_spectra(){
    var dom_nav_cell = document.getElementById("curate_spectra_navigation");
    dom_nav_cell.innerHTML = "";
    document.getElementById("curate_spectra_peptide_info").innerHTML = "";
    
    if (spectra_current_page < 0) spectra_current_page = 0;
    if (spectra_current_page >= spectra_max_pages - 1) spectra_current_page = spectra_max_pages - 1;
    
    if (spectra_current_page > 0){
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "spectra_current_page = 0; curate_spectra();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;??&nbsp;";
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "spectra_current_page -= 1; curate_spectra();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;???&nbsp;&nbsp;";
    }
    
        
    var dom_page = document.createElement("select");
    dom_nav_cell.appendChild(dom_page);
    dom_page.setAttribute("style", "display: inline;");
    dom_page.setAttribute("onchange", "spectra_current_page = this.selectedIndex; curate_spectra();");
    for (var i = 0; i < spectra_max_pages; ++i){
        var dom_option = document.createElement("option");
        dom_page.appendChild(dom_option);
        dom_option.innerHTML = (i + 1).toString();
    }
    dom_page.selectedIndex = spectra_current_page;
    
    var dom_div_max_pages = document.createElement("div");
    dom_nav_cell.appendChild(dom_div_max_pages);
    dom_div_max_pages.setAttribute("style", "display: inline;");
    dom_div_max_pages.innerHTML = "&nbsp;&nbsp;/&nbsp;&nbsp;" + spectra_max_pages;
    
    
    if (spectra_current_page + 1 < spectra_max_pages){
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "spectra_current_page += 1; curate_spectra();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;&nbsp;???&nbsp;";
        
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "spectra_current_page = spectra_max_pages - 1; curate_spectra();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;??&nbsp;";
    }
    
    
    var only_disabled = document.getElementById("curate_spectra_disabled_check").checked;
    var request = "action=select&limit=" + (spectra_current_page * max_spectra_per_page) + "," + max_spectra_per_page + "&species=" + current_species;
    if (only_disabled) request += "&onlyDisabled=true";
    var xmlhttp_spectra_meta = new XMLHttpRequest();
    xmlhttp_spectra_meta.onreadystatechange = function() {
        if (xmlhttp_spectra_meta.readyState == 4 && xmlhttp_spectra_meta.status == 200) {
            spectra_meta = JSON.parse(xmlhttp_spectra_meta.responseText);
            
            current_spectrum_selected = -1;
            var spectra_panel = document.getElementById("curate_spectra_panel");
            spectra_panel.innerHTML = "";
            var dom_table = document.createElement("table");
            spectra_panel.appendChild(dom_table);
            dom_table.setAttribute("width", "100%"); 
            dom_table.setAttribute("cellspacing", "0"); 
            dom_table.setAttribute("border", "0"); 
            dom_table.setAttribute("id", "curate_spectra_panel_table");
            curate_spectra_checks = {};
            
            var row_cnt = 0;
            spectra_max = spectra_meta.length;
            for (var spectrum_meta of spectra_meta){
                current_spectrum_selected = 0;
                var bg_color = (row_cnt & 1) ? "#DDDDDD" : "white";
                
                var dom_tr = document.createElement("tr");
                dom_table.appendChild(dom_tr);
                dom_tr.setAttribute("value", spectrum_meta[0]);
                dom_tr.setAttribute("style", "cursor: pointer;");
                dom_tr.setAttribute("onclick", "curate_spectra_change_selection(" + row_cnt + ");");
                
                
                var dom_td1 = document.createElement("td");
                dom_tr.appendChild(dom_td1);
                dom_td1.setAttribute("width", "90%");
                dom_td1.setAttribute("bgcolor", bg_color);
                
                var charge = parseInt(spectrum_meta[2]);
                var peptide_seq = spectrum_meta[1];
                while (peptide_seq.indexOf("M[+16.0]") != -1){
                    peptide_seq = peptide_seq.replace("M[+16.0]", "m");
                }
                while (peptide_seq.indexOf("C[+57.0]") != -1){
                    peptide_seq = peptide_seq.replace("C[+57.0]", "c");
                }
                for (var i = 0; i < charge; ++i) peptide_seq += "+";
                dom_td1.innerHTML = peptide_seq;
                
                var dom_td2 = document.createElement("td");
                dom_tr.appendChild(dom_td2);
                dom_td2.setAttribute("align", "right");
                dom_td2.setAttribute("bgcolor", bg_color);
                
                var dom_td2_input = document.createElement("input");
                dom_td2.appendChild(dom_td2_input);
                dom_td2_input.setAttribute("style", "display: inline;");
                dom_td2_input.setAttribute("type", "checkbox");
                dom_td2_input.setAttribute("id", "curate_spectra-checkbox-" + spectrum_meta[0]);
                if (spectrum_meta[3] != -1) dom_td2_input.setAttribute("checked", "true");
                dom_td2_input.setAttribute("onclick", "curate_spectra_checking();");
                
                curate_spectra_checks[spectrum_meta[0]] = spectrum_meta[3] != -1;
                
                ++row_cnt;
            }
            
        }
    }
    xmlhttp_spectra_meta.open("GET", file_pathname + "admin/scripts/curate-spectral-library.py?" + request, false);
    xmlhttp_spectra_meta.send();
    
    
    document.getElementById("curate_spectra").style.display = "inline";
    document.getElementById("waiting_background").style.display = "inline";
    document.getElementById("renderarea").style.filter = "blur(5px)";
    document.getElementById("navigation").style.filter = "blur(5px)";
    document.getElementById("toolbox").style.filter = "blur(5px)";
    change_match_error("curate_spectra");
    resize_ms_view("curate_spectra");
    spectrum_loaded = false;
    draw_spectrum("curate_spectra");
    curate_spectra_change_selection(0);
}
