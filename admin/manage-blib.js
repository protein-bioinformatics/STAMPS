update_state_interval = 0;
chunk_offset = 1000;
valid_extention_ident_types = {'.mzid': 'ident'};
valid_extention_spectra_types = {'.mgf': 'spectra'};
file_list = [];
file_pathname = "";
thread = -1;
wait_fill = 0;
reader = [];
dependant_files = {};
chunk_size = 10 * 1024 * 1024;  // 10 MiB
upload_loop = 0;
uploaded_file_id = -1;
uploaded_species_id = -1;
uploaded_filename = "";
inspect_spectra_max_pages = -1;
inspect_spectra_current_page = 0;
inspect_current_spectrum = 0;
inspect_max_spectra_per_page = 100;
spectrum_selection_color = "#80c8ff";
spectra_checks = {};

String.prototype.ends_with = function(suffix) {
    return this.indexOf(suffix.toLowerCase(), this.length - suffix.length) !== -1;
};


function template(strings, ...keys) {
  return (function(...values) {
    var dict = values[values.length - 1] || {};
    var result = [strings[0]];
    keys.forEach(function(key, i) {
      var value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
}



function get_dependence_template(id, row){
    var dependence_template = 0;
    
    
    
    if (row["file_id"] == null){
        dependence_template = template`<div width=\"100%\" id=\"step2-${0}-unloaded\"> \
                <div id=\"step2-${0}-infotext\">Select '${1}' file for upload.</div><p /> \
                <div width=\"100%\" align=\"center\"> \
                    <input type=\"file\" id=\"step2-${0}-file\" accept=\".mgf\"></input>&nbsp;&nbsp; \
                    <select id=\"step2-${0}-select\">${2}</select>&nbsp;&nbsp; \
                    <img src=\"../images/upload-small.png\" width=\"20\" id=\"step2-${0}-upload-button\" title=\"upload file\" alt=\"upload file\" onclick=\"prepare_spectra_upload('spectra', 'step2-${0}');\" style=\"cursor: pointer;\"> \
                    <img src=\"../images/delete-small.png\" width=\"20\" id=\"step2-${0}-stop-button\" title=\"stop upload\" alt=\"stop upload\" onclick=\"stop_upload('step2-${0}');\" style=\"cursor: pointer; display: none;\"> \
                    <img src=\"../images/trash-bin.png\" width=\"20\" id=\"step2-${0}-stop-delete-button\" title=\"delete file\" alt=\"delete file\" onclick=\"delete_ident();\" style=\"cursor: pointer; display: none;\"> \
                    <p /> \
                    <progress-bar id=\"step2-${0}-progress\" width=\"400px\" height=\"5px\" bar-color=\"#84b818\" style=\"display: none;\"></progress-bar> \
                </div> \
            </div>`;
    }
    else if (row["uploaded"] < row["chunk_num"]){
        dependence_template = template`<div width=\"100%\" id=\"step2-${0}-unloaded\"> \
                <div id=\"step2-${0}-infotext\">Please select \"${1}\" file and continue upload or delete it.</div><p /> \
                <div width=\"100%\" align=\"center\"> \
                    <input type=\"file\" id=\"step2-${0}-file\" accept=\".mgf\"></input>&nbsp;&nbsp; \
                    <select id=\"step2-${0}-select\" disabled>${2}</select>&nbsp;&nbsp; \
                    <img src=\"../images/upload-small.png\" width=\"20\" id=\"step2-${0}-upload-button\" title=\"upload file\" alt=\"upload file\" onclick=\"prepare_spectra_upload('spectra', 'step2-${0}');\" style=\"cursor: pointer;\"> \
                    <img src=\"../images/delete-small.png\" width=\"20\" id=\"step2-${0}-stop-button\" title=\"stop upload\" alt=\"stop upload\" onclick=\"stop_upload('step2-${0}');\" style=\"cursor: pointer; display: none;\"> \
                    <img src=\"../images/trash-bin.png\" width=\"20\" id=\"step2-${0}-stop-delete-button\" title=\"delete file\" alt=\"delete file\" onclick=\"delete_spectrum(${0});\" style=\"cursor: pointer; display: inline;\"> \
                    <p /> \
                    <progress-bar id=\"step2-${0}-progress\" width=\"400px\" height=\"5px\" bar-color=\"#84b818\" style=\"display: none;\"></progress-bar> \
                </div> \
            </div>`;
    }
    else {
        dependence_template = template`<div width=\"100%\" id=\"step2-${0}-loaded\" style=\"display: inline;\"> \
                Selected spectrum file: \
                <div width=\"100%\" align=\"center\"> \
                    <div id=\"step2-${0}-file-name\" style=\"display: inline;\">${1} / ${3}</div>&nbsp;&nbsp;&nbsp;&nbsp; \
                    <img src=\"../images/trash-bin.png\" width=\"20\" id=\"step2-${0}-delete-button\" title=\"delete file\" alt=\"delete file\" onclick=\"delete_spectrum(${0});\" style=\"cursor: pointer;\"> \
                </div> \
            </div>`;
        
    }
    
    
    var tissue_options = "";
    for (var tissue_key in tissues){
        tissue_options += "<option id=\"" + tissue_key + "\">" + tissues[tissue_key][1] + "</option>";
    }
    
    var used_tissue = "unknown tissue";
    if (parseInt(row["tissue"]) in tissues){
        used_tissue = tissues[row["tissue"]][1];
    }
    
    return dependence_template(id, row["filename"], tissue_options, used_tissue);
}





function init_manage_blib(){
    uploaded_file_id = -1;
    uploaded_filename = "";
    dependant_files = {};
    file_pathname = get_pathname() + "../";
    document.getElementById("step1-file").removeAttribute("disabled");
    document.getElementById("step1-select").removeAttribute("disabled");
    document.getElementById("step1-wait").style.display = "inline";
    document.getElementById("step1").style.border = "";
    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "none";
    document.getElementById("step4").style.display = "none";
    //document.getElementById("step5").style.display = "none";
    document.getElementById("step2-container").innerHTML = "none";
    document.getElementById("step1-unloaded").style.display = "none";
    document.getElementById("step1-loaded").style.display = "none";
    document.getElementById("step1-upload-button").style.display = "inline";
    document.getElementById("step1-stop-button").style.display = "none";
    document.getElementById("step1-stop-delete-button").style.display = "none";
    document.getElementById("step1-progress").style.display = "none";
    document.getElementById("step1-progress").setAttribute("curr-val", 0);
    document.getElementById("step1-infotext").innerHTML = "Select identification file in mzidentml format (.mzid extention)";
    
    
    
    
    var species_select = document.getElementById("step1-select");
    species_select.innerHTML = "";
    for (var species_key in supported_species){
        var dom_opt = document.createElement("option");
        species_select.appendChild(dom_opt);
        dom_opt.innerHTML = supported_species[species_key];
        dom_opt.id = species_key;
    }
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            
            var response = JSON.parse(xmlhttp.responseText);
            
            document.getElementById("step1-wait").style.display = "none";
            document.getElementById("step1-unloaded").style.display = "inline";
            
            // file already registered
            if (Object.keys(response).length > 0){
                var species = "unknown species";
                var valid_species = true;
                
                if (parseInt(response["species"]) in supported_species){
                    species = supported_species[response["species"]];
                }
                else {
                    alert("Warning: selected species is not supported any more. Please reload the identification file with a supported species.");
                    valid_species = false;
                }
                
                uploaded_file_id = response["id"];
                uploaded_species_id = response["species"];
                uploaded_filename = response["filename"];
                
                
                
                if (response["chunk_num"] != response["uploaded"]){
                    document.getElementById("step1-infotext").innerHTML = "Please select \"" + response["filename"] + "\" file and continue upload or delete it";
                    document.getElementById("step1-stop-delete-button").style.display = "inline";
                    document.getElementById("step1-select").setAttribute("disabled", "true");
                }
                else {
                    document.getElementById("step1-file-name").innerHTML = response["filename"] + " / " + species;
                    document.getElementById("step1-unloaded").style.display = "none";
                    document.getElementById("step1-loaded").style.display = "inline";
                    if (valid_species); step1_transition_step2();
                }
            }
        }
    }
    xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
    xmlhttp.send("command=check_ident");
}





function step1_transition_step2(){
    // check which spectrum files are needed and load them
    // wait if necessary
    
    document.getElementById("step2").style.display = "inline";
    document.getElementById("step2-wait").style.display = "inline";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText);
            
            if (response.length == 0){
                step1_transition_step2();
            }
            else if (response.length == 1 && response[0]["filename"] == "~"){
                document.getElementById("step2").style.display = "none";
                document.getElementById("step1").style.border = "5px solid #dd0000";
                alert("Error: identification file is corrupted. Please use another one or contact the developers.");
            }
            else {
                document.getElementById("step2-wait").style.display = "none";
                var step2_container = document.getElementById("step2-container");
                step2_container.innerHTML = "";
                dependant_files = {};
                var all_depends_up = true;
                for (var i = 0; i < response.length; ++i){
                    var row = response[i];
                    
                    if (row["chunk_num"] != null) row["chunk_num"] = parseInt(row["chunk_num"]);
                    dependant_files["step2-" + i.toString()] = [row["file_id"], row["filename"]];
                    
                    if ((row["chunk_num"] == null) || (row["uploaded"] < row["chunk_num"])){
                        all_depends_up = false;
                    }
                    step2_container.innerHTML += get_dependence_template(i, row);
                }
                if (all_depends_up){
                    step2_transition_step3();
                }
            }
        }
    }
    xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
    xmlhttp.send("command=load_dependencies");
}






function step2_transition_step3(){
    document.getElementById("step3").style.display = "inline";
    document.getElementById("step3-button").removeAttribute("disabled");
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            if (check_response(xmlhttp.responseText)) {
                var response = parseInt(xmlhttp.responseText);
                if (response > 0){
                    step3_transition_step4();
                }
            }
            else {
                document.getElementById("step3-button").setAttribute("disabled", "true");
            }
        }
    }
    xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
    xmlhttp.send("command=check_blib_progress");
}






function step3_transition_step4(){
    document.getElementById("step4").style.display = "inline";
    document.getElementById("check_spectra").style.display = "none";
    document.getElementById("step4-wait").style.display = "inline";
    document.getElementById("step3-button").setAttribute("disabled", "true");
    //document.getElementById("step5").style.display = "none";
    document.getElementById("step5-wait").style.display = "inline";
    document.getElementById("step5-confirm").style.display = "none";
    
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
            var response = parseInt(xmlhttp.responseText);
            if (response == 0){
                step3_transition_step4();
            }
            else if (response < 0) {
                alert("The identification file and the spectra files could not be converted into a spectral library. Please check all files.");
            }
            else {
                document.getElementById("step4-wait").style.display = "none";
                document.getElementById("check_spectra_button").removeAttribute("disabled");
                custom_resize_ms_view();
                
                var xmlhttp_num = new XMLHttpRequest();
                xmlhttp_num.onreadystatechange = function() {
                    if (xmlhttp_num.readyState == 4 && xmlhttp_num.status == 200 && check_response(xmlhttp_num.responseText)) {
                        inspect_spectra_max_pages = Math.floor(parseInt(xmlhttp_num.responseText) / inspect_max_spectra_per_page) + 1;
                        inspect_spectra();
                    }
                }
                xmlhttp_num.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
                xmlhttp_num.send("command=get_num_spectra");
            }
        }
    }
    xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
    xmlhttp.send("command=check_blib_progress");
}








function start_convertion(){
    document.getElementById("step3-button").setAttribute("disabled", "true");
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
            step3_transition_step4();
        }
    }
    xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
    xmlhttp.send("command=start_convertion");
}




  
  
function check_response(response){
    if (typeof(response) == "string" && response.length > 1 && response[0] == "#"){
        alert(response.substr(1));
        return 0;
    }
    else if (response.length == 0){
        alert("incorrect response");
        return 0;
    }
    return 1;
}








function urlEncode(unencoded) {
    //var encoded = btoa(unencoded);
    return unencoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}






  

function prepare_spectra_upload(file_type, step){
    var step_file = document.getElementById(step + "-file");
    if (step_file.files.length == 0){
        alert("Warning: no ident file selected for upload!");
        return;
    }
    
    var valid_types = valid_extention_spectra_types;
    
    var file = step_file.files[0];
    var filename = file.name;
    var chunk_num = Math.ceil(file.size / chunk_size);
    
    var valid_extention_type = 0;
    for (var valid_extention in valid_types){
        if (filename.toLowerCase().ends_with(valid_extention)){
            valid_extention_type = valid_types[valid_extention];
            break;
        }
    }
    
    if (!valid_extention_type){
        var message = "File has no valid extention. Valid extentions are:";
        for (var valid_extention in valid_types) message += "\n" + valid_extention;
        alert(message);
        return;
    }
    
    if (filename != dependant_files[step][1]){
        alert("Error: file names don't match");
        return;
    }
    else {
        var tissue = document.getElementById(step + "-select")[document.getElementById(step + "-select").selectedIndex].id;
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
                var file_id = xmlhttp.responseText;
                
                thread = [];
                send_file(file_id, step);
            }
        }
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
        xmlhttp.send("command=register_file&filename=" + filename + "&chunk_num=" + chunk_num + "&file_type=" + valid_extention_type + "&tissue=" + tissue);
    }
}






function prepare_ident_upload(file_type, step){
    var step_file = document.getElementById("step1-file");
    if (step_file.files.length == 0){
        alert("Warning: no ident file selected for upload!");
        return;
    }
    
    var valid_types = valid_extention_ident_types;
    
    var file = step_file.files[0];
    var filename = file.name;
    var chunk_num = Math.ceil(file.size / chunk_size);
    
    var valid_extention_type = 0;
    for (var valid_extention in valid_types){
        if (filename.toLowerCase().ends_with(valid_extention)){
            valid_extention_type = valid_types[valid_extention];
            break;
        }
    }
    
    if (!valid_extention_type){
        var message = "File has no valid extention. Valid extentions are:";
        for (var valid_extention in valid_types) message += "\n" + valid_extention;
        alert(message);
        return;
    }
    
    if (uploaded_file_id > -1){
        if (filename != uploaded_filename){
            alert("Error: file names don't match");
            return;
        }
        else {
            thread = [];
            send_file(uploaded_file_id, "step1");
        }
    }
    else {
        var species = document.getElementById("step1-select")[document.getElementById("step1-select").selectedIndex].id;
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
                var file_id = xmlhttp.responseText;
                thread = [];
                send_file(file_id, "step1");
            }
        }
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
        xmlhttp.send("command=register_file&filename=" + filename + "&chunk_num=" + chunk_num + "&file_type=" + valid_extention_type + "&species=" + species);
    }
}





function inspect_spectra(){
    var dom_nav_cell = document.getElementById("curate_spectra_navigation");
    dom_nav_cell.innerHTML = "";
    
    if (inspect_spectra_current_page < 0) inspect_spectra_current_page = 0;
    if (inspect_spectra_current_page >= inspect_spectra_max_pages - 1) inspect_spectra_current_page = inspect_spectra_max_pages - 1;
    
    if (inspect_spectra_current_page > 0){
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "inspect_spectra_current_page = 0; inspect_spectra();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;«&nbsp;";
        
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "inspect_spectra_current_page -= 1; inspect_spectra();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;‹&nbsp;&nbsp;";
    }
    
        
    var dom_page = document.createElement("select");
    dom_nav_cell.appendChild(dom_page);
    dom_page.setAttribute("style", "display: inline;");
    dom_page.setAttribute("onchange", "inspect_spectra_current_page = this.selectedIndex; inspect_spectra();");
    for (var i = 0; i < inspect_spectra_max_pages; ++i){
        var dom_option = document.createElement("option");
        dom_page.appendChild(dom_option);
        dom_option.innerHTML = (i + 1).toString();
    }
    dom_page.selectedIndex = inspect_spectra_current_page;
    
    var dom_div_max_pages = document.createElement("div");
    dom_nav_cell.appendChild(dom_div_max_pages);
    dom_div_max_pages.setAttribute("style", "display: inline;");
    dom_div_max_pages.innerHTML = "&nbsp;&nbsp;/&nbsp;&nbsp;" + inspect_spectra_max_pages;
    
    
    if (inspect_spectra_current_page + 1 < inspect_spectra_max_pages){
        var dom_b2 = document.createElement("b");
        dom_nav_cell.appendChild(dom_b2);
        dom_b2.setAttribute("onclick", "inspect_spectra_current_page += 1; inspect_spectra();");
        dom_b2.setAttribute("style", "cursor: pointer;");
        dom_b2.innerHTML = "&nbsp;&nbsp;›&nbsp;";
        
        var dom_b = document.createElement("b");
        dom_nav_cell.appendChild(dom_b);
        dom_b.setAttribute("onclick", "inspect_spectra_current_page = inspect_spectra_max_pages - 1; inspect_spectra();");
        dom_b.setAttribute("style", "cursor: pointer;");
        dom_b.innerHTML = "&nbsp;»&nbsp;";
    }
    
    
    
    var xmlhttp_spectra_meta = new XMLHttpRequest();
    xmlhttp_spectra_meta.onreadystatechange = function() {
        if (xmlhttp_spectra_meta.readyState == 4 && xmlhttp_spectra_meta.status == 200) {
            spectra_meta = JSON.parse(xmlhttp_spectra_meta.responseText);
            
            
            var spectra_panel = document.getElementById("spectra_panel");
            spectra_panel.innerHTML = "";
            var dom_table = document.createElement("table");
            spectra_panel.appendChild(dom_table);
            dom_table.setAttribute("width", "100%"); 
            dom_table.setAttribute("cellspacing", "0"); 
            dom_table.setAttribute("border", "0"); 
            dom_table.setAttribute("id", "curate_spectra_panel_table");
            
            spectra_checks = {};
            
            var row_cnt = 0;
            for (var spectrum_meta of spectra_meta){
                var bg_color = (row_cnt & 1) ? "#DDDDDD" : "white";
                
                var dom_tr = document.createElement("tr");
                dom_table.appendChild(dom_tr);
                dom_tr.setAttribute("value", spectrum_meta[0]);
                dom_tr.setAttribute("style", "cursor: pointer;");
                dom_tr.setAttribute("onclick", "inspect_spectra_change_selection(" + row_cnt + ");");
                
                
                var dom_td2 = document.createElement("td");
                dom_tr.appendChild(dom_td2);
                dom_td2.setAttribute("align", "right");
                dom_td2.setAttribute("bgcolor", bg_color);
                
                var dom_td2_input = document.createElement("input");
                dom_td2.appendChild(dom_td2_input);
                dom_td2_input.setAttribute("style", "display: inline;");
                dom_td2_input.setAttribute("type", "checkbox");
                dom_td2_input.setAttribute("id", "spec-checkbox-" + spectrum_meta[0]);
                if (spectrum_meta[3] != -1) dom_td2_input.setAttribute("checked", "true");
                dom_td2_input.setAttribute("onclick", "inspect_spectra_checking(" + spectrum_meta[0] + ");");
                spectra_checks[spectrum_meta[0]] = (spectrum_meta[3] != -1);
                
                
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
                
                ++row_cnt;
            }
            
        }
    }
    xmlhttp_spectra_meta.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
    xmlhttp_spectra_meta.send("command=select_spectra&limit=" + (inspect_spectra_current_page * inspect_max_spectra_per_page) + "," + inspect_max_spectra_per_page);
    
    
    change_match_error();
    custom_resize_ms_view();
    inspect_spectra_change_selection(0);
    draw_spectrum();
}





function insert_spectra(){
    var usi = parseInt(uploaded_species_id);
    
    if (!(usi in supported_species)){
        alert("Warning: species is unknown, spectra cannot be added.");
        return;
    }
    
    var species_db = supported_species[usi];
    if (confirm("Do you want to insert the '" + species_db + "' database? The process is NOT reversible.")){
        
        var xmlhttp_insert = new XMLHttpRequest();
        xmlhttp_insert.onreadystatechange = function() {
            if (xmlhttp_insert.readyState == 4 && xmlhttp_insert.status == 200) {
                step4_transition_step5();
                document.getElementById("check_spectra_button").setAttribute("disabled", "true");
            }
        }
        xmlhttp_insert.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
        xmlhttp_insert.send("command=merge_blibs");
        
        
        
        
    }
}


function step4_transition_step5(){
    
    //var rect_cs = document.getElementById('check_spectra').getBoundingClientRect();
    //var cs_top = parseInt(document.getElementById('check_spectra').style.top.split("px")[0]);
    
    //document.getElementById("step5").style.top = (cs_top + rect_cs.height + 40).toString() + "px";
    //document.getElementById("step5").style.position = "fixed";
    
    document.getElementById("step5").style.display = "inline";
    document.getElementById("step5-wait").style.display = "inline";
    document.getElementById("step5-confirm").style.display = "none";
    
    var xmlhttp_insert_spectra = new XMLHttpRequest();
    xmlhttp_insert_spectra.onreadystatechange = function() {
        if (xmlhttp_insert_spectra.readyState == 4 && xmlhttp_insert_spectra.status == 200) {
            var response = parseInt(xmlhttp_insert_spectra.responseText);
            if (response < 0){
                // TODO error
                alert("An error occurred, spectra could not be added to spectral library.");
            }
            else if (response > 0){
                document.getElementById("step5-wait").style.display = "none";
                document.getElementById("step5-confirm").style.display = "inline";
            }
            else {
                step4_transition_step5();
            }
        }
    }
    xmlhttp_insert_spectra.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
    xmlhttp_insert_spectra.send("command=check_insert_progress");
}






function inspect_spectra_checking(spectrum_id){
    
    spectra_checks[spectrum_id] = !spectra_checks[spectrum_id];
    var value = spectra_checks[spectrum_id] ? "18" : "-1";
    
    var xmlhttp_spectra_meta = new XMLHttpRequest();
    xmlhttp_spectra_meta.onreadystatechange = function() {
        if (xmlhttp_spectra_meta.readyState == 4 && xmlhttp_spectra_meta.status == 200) {
            draw_spectrum();
        }
    }
    xmlhttp_spectra_meta.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
    xmlhttp_spectra_meta.send("command=set_unset_spectrum&spectrum_id=" + spectrum_id + "&value=" + value);
}







function custom_resize_ms_view(){
    if (document.getElementById('step-container').style.display == "none") return;
    
    document.getElementById("check_spectra").style.setProperty("z-index", "120");
    document.getElementById("check_spectra").style.setProperty("position", "fixed");
    document.getElementById("check_spectra").style.setProperty("top", "");
    document.getElementById("check_spectra").style.setProperty("left", "");
    document.getElementById("check_spectra").style.setProperty("width", "95%");
    document.getElementById("check_spectra").style.setProperty("height", "95%");
    document.getElementById("check_spectra").style.setProperty("background-color", "white");
    document.getElementById("check_spectra").style.setProperty("border-color", "black");
    document.getElementById("check_spectra").style.setProperty("border-width", "1px");
    document.getElementById("check_spectra").style.setProperty("border-style", "solid");
    
    
    var t_top = 0.02;
    
    var rect_s4 = document.getElementById('step-container').getBoundingClientRect();
    var sp_height = document.getElementById('check_spectra').offsetHeight * 0.87;
    var scroll_t = document.getElementById('step-container').scrollTop;
    
    resize_ms_view();
    
    var rect = document.getElementById('check_spectra').getBoundingClientRect();
    
    document.getElementById("spectra_panel").style.top = (rect.top + (rect.bottom - rect.top) * t_top - rect_s4.top + scroll_t).toString() + "px";
    document.getElementById("spectra_panel").style.left = (rect.left + (rect.right - rect.left) * 0.005 - rect_s4.left).toString() + "px";
    
    document.getElementById("msarea").style.top = (rect.top + (rect.bottom - rect.top) * t_top - rect_s4.top + scroll_t).toString() + "px";
    document.getElementById("msarea").style.left = (rect.left + (rect.right - rect.left) * 0.3 - rect_s4.left).toString() + "px";
    
    document.getElementById("check_spectra_functions").style.top = (sp_height + rect.top + (rect.bottom - rect.top) * t_top - rect_s4.top + scroll_t).toString() + "px";
    document.getElementById("check_spectra_functions").style.left = (rect.left + (rect.right - rect.left) * 0.005 - rect_s4.left).toString() + "px";
    
    document.getElementById("spectra_options").style.top = (rect.top + (rect.bottom - rect.top) * t_top - rect_s4.top + scroll_t).toString() + "px";
    document.getElementById("spectra_options").style.left = (rect.left + (rect.right - rect.left) * 0.3 - rect_s4.left).toString() + "px";
    
    document.getElementById("check_spectra").style.display = "inline";
}






function inspect_spectra_change_selection(row_num){
    if (inspect_current_spectrum < 0) return;
    var dom_table = document.getElementById("curate_spectra_panel_table");
    var bg_color = (inspect_current_spectrum & 1) ? "#DDDDDD" : "white";
    
    for (dom_td of dom_table.children[inspect_current_spectrum].children){
        dom_td.setAttribute("bgcolor", bg_color);
    }
    
    for (dom_td of dom_table.children[row_num].children){
        dom_td.setAttribute("bgcolor", spectrum_selection_color);
    }
         
    inspect_current_spectrum = row_num;
    
    var spectrum_id = dom_table.children[inspect_current_spectrum].getAttribute("value");
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            spectrum_data = JSON.parse(xmlhttp.responseText);
            load_spectrum(spectrum_id, spectrum_data);
        }
    }
    xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
    xmlhttp.send("command=get_spectrum&spectrum_id=" + spectrum_id);
    
    var spectra_panel = document.getElementById("spectra_panel");
    
    var unit = spectra_panel.scrollHeight / inspect_max_spectra_per_page;
    var row_pos = unit * row_num;
    if (row_pos < spectra_panel.scrollTop) spectra_panel.scrollTop = row_pos - 1;
    if (spectra_panel.scrollTop + spectra_panel.clientHeight - unit < row_pos) spectra_panel.scrollTop = row_pos + 1 + unit - spectra_panel.clientHeight;
}





function send_file(registered_file_id, step){
    
    document.getElementById(step + "-progress").style.display = "inline";
    document.getElementById(step + "-upload-button").style.display = "none";
    document.getElementById(step + "-stop-button").style.display = "inline";
    document.getElementById(step + "-stop-delete-button").style.display = "none";
    document.getElementById(step + "-file").setAttribute("disabled", "true");
    document.getElementById(step + "-select").setAttribute("disabled", "true");
    document.getElementById(step + "-progress").setAttribute("curr-val", 0);
    
    var step_file = document.getElementById(step + "-file");
    var file = step_file.files[0];
    var filename = file.name;
    var chunk_max_num = Math.ceil(file.size / chunk_size);
    
    upload_loop = function(cmz, cn, step){
        
        if (typeof this.thread_data === "undefined"){
            this.thread_data = [0, cmz, cn, false];  // curr_chunk, chunk_size, chunk_max_num, busy
            reader = 0;
        }
        
        
        if (this.thread_data[0] == this.thread_data[2]){
            clearInterval(thread);
            alert("File is uploaded");
            init_manage_blib();
            reader = 0;
            this.thread_data = undefined;
        }
        
        else if (!this.thread_data[3]) {
            this.thread_data[3] = true;
            var start = this.thread_data[0] * this.thread_data[1];
            var end = start + this.thread_data[1] >= file.size ? file.size : start + this.thread_data[1];
            upload_loop.reader = new FileReader();
            
            upload_loop.reader.chunk_data = [start, file.size, end];
            upload_loop.reader.thread_data = this.thread_data;
            upload_loop.reader.file_id = registered_file_id;
            upload_loop.reader.step = step;
            
            upload_loop.reader.onload = function(){
                
                this.http_checksum = new XMLHttpRequest();
                this.http_checksum.thread_data = this.thread_data;
                this.http_checksum.result = this.result.split("base64,")[1];
                this.http_checksum.file_id = this.file_id;
                this.http_checksum.chunk_data = this.chunk_data;
                this.http_checksum.step = this.step;
                
                this.http_checksum.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200 && check_response(this.responseText)) {
                        var md5_db = this.responseText;
                        var md5_chunk = md5(this.result);
                        
                        if (md5_db != md5_chunk){
                            this.xhttp = new XMLHttpRequest();
                            this.xhttp.thread_data = this.thread_data;
                            this.xhttp.chunk_data = this.chunk_data;
                            this.xhttp.upload.chunk_data = this.chunk_data;
                            this.xhttp.upload.step = this.step;
                            this.xhttp.step = this.step;
                            
                            this.xhttp.upload.onprogress = function(evt){
                                var l = this.chunk_data[0] / this.chunk_data[1] + (evt.loaded / evt.total) * (this.chunk_data[2] - this.chunk_data[0]) / this.chunk_data[1];
                                document.getElementById(this.step + "-progress").setAttribute("curr-val", l * 100);
                            }
                            
                            this.xhttp.onreadystatechange = function() {
                                if (this.readyState == 4 && this.status == 200 && check_response(this.responseText)){
                                    var l = this.chunk_data[0] / this.chunk_data[1] + (this.chunk_data[2] - this.chunk_data[0]) / this.chunk_data[1];
                                    document.getElementById(this.step + "-progress").setAttribute("curr-val", l * 100);
                                    this.thread_data[0] += 1;
                                    this.thread_data[3] = false;
                                    
                                    upload_loop.reader.http_checksum.xhttp = 0;
                                    upload_loop.reader.http_checksum = 0;
                                    upload_loop.reader.result = 0;
                                    upload_loop.reader = 0;
                                }
                            }
                            
                            
                            this.xhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
                            this.xhttp.send("command=send_file&chunk_num=" + this.thread_data[0] + "&type=chunk&file_id=" + this.file_id + "&checksum=" + md5_chunk + "&content=" + urlEncode(this.result));
                        }
                        else {
                            var l = this.chunk_data[0] / this.chunk_data[1] + (this.chunk_data[2] - this.chunk_data[0]) / this.chunk_data[1];
                            document.getElementById(this.step + "-progress").setAttribute("curr-val", l * 100);
                            this.thread_data[0] += 1;
                            this.thread_data[3] = false;
                            upload_loop.reader.http_checksum.xhttp = 0;
                            upload_loop.reader.http_checksum = 0;
                            upload_loop.reader.result = 0;
                            upload_loop.reader = 0;
                        }
                    }
                }
                this.http_checksum.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
                this.http_checksum.send("command=get_check_sum&file_id=" + this.file_id + "&chunk_num=" + this.thread_data[0]);
                
                    
            }
            upload_loop.reader.readAsDataURL(file.slice(start, end));
        }
    };
    upload_loop.thread_data = undefined;
    
    thread = setInterval(upload_loop, 100, chunk_size, chunk_max_num, step);
}







function stop_upload(){
    if (confirm("Do you really want to interrupt the download?")){
        clearInterval(thread);
        init_manage_blib();
    }
}





function delete_ident(){
    if (confirm("Do you really want to delete the identification file?")){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
                uploaded_file_id = -1;
                uploaded_filename = "";
                init_manage_blib();
            }
        }
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
        xmlhttp.send("command=delete_file&file_id=" + uploaded_file_id);
    }
}



function reset_insertion(){
    if (uploaded_file_id == -1){
        alert("Nothing to reset");
        return;
    }
    if (confirm("Do you really want to reset the insertion form?")){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
                uploaded_file_id = -1;
                uploaded_filename = "";
                init_manage_blib();
            }
        }
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
        xmlhttp.send("command=delete_file&file_id=" + uploaded_file_id);
    }
}





function delete_spectrum(spec_id){
    if (confirm("Do you really want to delete the spectrum file?")){
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
                init_manage_blib();
            }
        }
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", false);
        xmlhttp.send("command=delete_file&file_id=" + dependant_files["step2-" + spec_id][0]);
    }
}








class ProgressBar extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'height', 'min-val', 'max-val', 'curr-val', 'bar-color', 'bg-color'];
    }
    
    set_width(new_value){
        this.shadowRoot.children[0].style.width = new_value;
        this.update_bar();
    }
    
    set_height(new_value){
        this.shadowRoot.children[0].style.height = new_value;
    }
    
    set_min_val(new_value){
        this.shadowRoot.children[0].children[0].min = parseInt(new_value);
        this.update_bar();
    }
    
    set_max_val(new_value){
        this.shadowRoot.children[0].children[0].max = parseInt(new_value);
        this.update_bar();
    }
    
    set_curr_val(new_value){
        this.shadowRoot.children[0].children[0].curr = parseInt(new_value);
        this.update_bar();
    }
    
    set_bar_color(new_value){
        this.shadowRoot.children[0].children[0].style.backgroundColor = new_value;
    }
    
    set_bg_color(new_value){
        this.shadowRoot.children[0].style.backgroundColor = new_value;
        this.shadowRoot.children[0].defColor = new_value;
    }
    
    update_bar(){
        const bar = this.shadowRoot.children[0].children[0];
        var progress = 0;
        if (bar.max - bar.min > 0){
            if (bar.curr < bar.min) bar.curr = bar.min;
            if (bar.curr > bar.max) bar.curr = bar.max;
            
            this.shadowRoot.children[0].style.backgroundColor = this.shadowRoot.children[0].defColor;
            progress = bar.curr / (bar.max - bar.min) * 100.;
        }
        else {
            this.shadowRoot.children[0].style.backgroundColor = "#dd0000";
            progress = 0;
        }
        this.shadowRoot.children[0].setAttribute("title", "Processed: " + parseInt(progress) + "%");
            bar.style.width = progress.toString() + "%";
    }
    
    attributeChangedCallback(name, old_value, new_value) {
        if (name == "width") this.set_width(new_value);
        else if (name == "height") this.set_height(new_value);
        else if (name == "min-val") this.set_min_val(new_value);
        else if (name == "max-val") this.set_max_val(new_value);
        else if (name == "curr-val") this.set_curr_val(new_value);
        else if (name == "bar-color") this.set_bar_color(new_value);
        else if (name == "bg-color") this.set_bg_color(new_value);
        
    }

    constructor(){
        super();
        
        const shadow = this.attachShadow({ mode: 'open' });
        const wrapper = document.createElement('div');
        wrapper.defColor = "#dddddd";
        
        const bar = document.createElement('div');
        shadow.appendChild(wrapper);
        wrapper.appendChild(bar);
        
        wrapper.style.border = "1px solid black";
        wrapper.style.textAlign = "left";
        bar.style.width = "100%";
        bar.style.height = "100%";
        
        bar.min = 0;
        bar.max = 0;
        bar.curr = 0;
        
        this.set_width("100px");
        this.set_height("10px");
        this.set_min_val("0");
        this.set_max_val("100");
        this.set_curr_val("0");
        this.set_bar_color("#6aa8ea");
        this.set_bg_color("#dddddd");
    }
    
    
}
customElements.define('progress-bar', ProgressBar);