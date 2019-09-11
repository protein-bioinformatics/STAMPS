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
upload_loop = 0;

uploaded_file_id = -1;
uploaded_filename = "";

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
                    <select id=\"step2-${0}-tissue\">${2}</select>&nbsp;&nbsp; \
                    <img src=\"../images/upload-small.png\" width=\"20\" id=\"step2-${0}-upload-button\" title=\"upload file\" alt=\"upload file\" onclick=\"prepare_spectra_upload('spectra', 'step2-${0}');\" style=\"cursor: pointer;\"> \
                    <img src=\"../images/delete-small.png\" width=\"20\" id=\"step2-${0}-stop-button\" title=\"stop upload\" alt=\"stop upload\" onclick=\"stop_upload('step2-${0}');\" style=\"cursor: pointer; display: none;\"> \
                    <img src=\"../images/delete-small.png\" width=\"20\" id=\"step2-${0}-stop-delete-button\" title=\"delete file\" alt=\"delete file\" onclick=\"delete_ident();\" style=\"cursor: pointer; display: none;\"> \
                    <p /> \
                    <progress-bar id=\"step2-${0}-progress\" width=\"400px\" height=\"5px\" bar-color=\"#84b818\" style=\"display: none;\"></progress-bar> \
                </div> \
            </div>`;
    }
    else if (row["uploaded"] < row["chunk_num"]){
        dependence_template = template`<div width=\"100%\" id=\"step2-${0}-unloaded\"> \
                <div id=\"step2-${0}-infotext\">"Please select \""${1}\" file and continue upload or delete it.</div><p /> \
                <div width=\"100%\" align=\"center\"> \
                    <input type=\"file\" id=\"step2-${0}-file\" accept=\".mgf\"></input>&nbsp;&nbsp; \
                    <select id=\"step2-${0}-tissue\">${2}</select>&nbsp;&nbsp; \
                    <img src=\"../images/upload-small.png\" width=\"20\" id=\"step2-${0}-upload-button\" title=\"upload file\" alt=\"upload file\" onclick=\"prepare_spectra_upload('spectra', 'step2-${0}');\" style=\"cursor: pointer;\"> \
                    <img src=\"../images/delete-small.png\" width=\"20\" id=\"step2-${0}-stop-button\" title=\"stop upload\" alt=\"stop upload\" onclick=\"stop_upload('step2-${0}');\" style=\"cursor: pointer; display: none;\"> \
                    <img src=\"../images/delete-small.png\" width=\"20\" id=\"step2-${0}-stop-delete-button\" title=\"delete file\" alt=\"delete file\" onclick=\"delete_ident();\" style=\"cursor: pointer; display: inline;\"> \
                    <p /> \
                    <progress-bar id=\"step2-${0}-progress\" width=\"400px\" height=\"5px\" bar-color=\"#84b818\" style=\"display: none;\"></progress-bar> \
                </div> \
            </div>`;
    }
    else {
        dependence_template = template`<div width=\"100%\" id=\"step2-${0}-loaded\" style=\"display: inline;\"> \
                Selected spectrum file: \
                <div width=\"100%\" align=\"center\"> \
                    <div id=\"step2-${0}-file-name\" style=\"display: inline;\">${1}</div>&nbsp;&nbsp;&nbsp;&nbsp; \
                    <img src=\"../images/delete-small.png\" width=\"20\" id=\"step2-${0}-delete-button\" title=\"delete file\" alt=\"delete file\" onclick=\"delete_spectrum(${0});\" style=\"cursor: pointer;\"> \
                </div> \
            </div>`;
        
    }
            
    var tissue_options = "<option id=\"12\">Heart</option><option id=\"14\">Brain</option>"        
    
    return dependence_template(id, row["filename"], tissue_options);
}





function init_manage_blib(){
    uploaded_file_id = -1;
    uploaded_filename = "";
    dependant_files = {};
    file_pathname = get_pathname() + "../";
    document.getElementById("step1-file").removeAttribute("disabled");
    document.getElementById("step1-species").removeAttribute("disabled");
    document.getElementById("step1-wait").style.display = "inline";
    document.getElementById("step2").style.display = "none";
    document.getElementById("step2-container").innerHTML = "none";
    document.getElementById("step1-unloaded").style.display = "none";
    document.getElementById("step1-loaded").style.display = "none";
    document.getElementById("step1-upload-button").style.display = "inline";
    document.getElementById("step1-stop-button").style.display = "none";
    document.getElementById("step1-stop-delete-button").style.display = "none";
    document.getElementById("step1-progress").style.display = "none";
    document.getElementById("step1-progress").setAttribute("curr-val", 0);
    document.getElementById("step1-infotext").innerHTML = "Select identification file in mzidentml format (.mzid extention)";
    
    
    
    
    var species_select = document.getElementById("step1-species");
    species_select.innerHTML = "";
    var opt1 = document.createElement("option");
    species_select.appendChild(opt1);
    opt1.innerHTML = "Human (homo sapiens)";
    opt1.id = "9606";
    var opt2 = document.createElement("option");
    species_select.appendChild(opt2);
    opt2.innerHTML = "Mouse (mus musculus)";
    opt2.id = "10090";
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = JSON.parse(xmlhttp.responseText);
            
            document.getElementById("step1-wait").style.display = "none";
            document.getElementById("step1-unloaded").style.display = "inline";
            
            // file already registered
            if (Object.keys(response).length > 0){
                var species = "unknown species";
                
                file_id = response["id"];
                for (var opt of species_select.children){
                    if (opt.id == response["species"]){
                        species = opt.innerHTML;
                        break;
                    }
                }
                
                uploaded_file_id = response["id"];
                uploaded_filename = response["filename"];
                
                
                
                if (response["chunk_num"] != response["uploaded"]){
                    document.getElementById("step1-infotext").innerHTML = "Please select \"" + response["filename"] + "\" file and continue upload or delete it";
                    document.getElementById("step1-stop-delete-button").style.display = "inline";
                    document.getElementById("step1-species").setAttribute("disabled", "true");
                }
                else {
                    document.getElementById("step1-file-name").innerHTML = response["filename"] + " / " + species;
                    document.getElementById("step1-unloaded").style.display = "none";
                    document.getElementById("step1-loaded").style.display = "inline";
                    step1_transition_step2();
                }
            }
        }
    }
    xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
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
            else if (response.length == 1 && response[0]["chunk_num"] == -1){
                document.getElementById("step2-wait").style.display = "none";
                console.log("Error");
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
                    all_depends_up &= (row["uploaded"] != null) & (row["uploaded"] >= row["chunk_num"]);
                    step2_container.innerHTML += get_dependence_template(i, row);
                }
                console.log();
            }
        }
    }
    xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
    xmlhttp.send("command=load_dependencies");
}









  
  
function check_response(response){
    if (typeof(response) == "string" && response.length > 1 && response[0] == "#"){
        alert(response.substr(1));
        return 0;
    }
    else if (response.length == 0){
        console.log("'" + response + "'");
        alert("incorrect response");
        return 0;
    }
    return 1;
}








function urlEncode(unencoded) {
    var encoded = btoa(unencoded);
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
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
    var chunk_size = 2 * 1024 * 1024;  // 2MiB
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
        var tissue = document.getElementById(step + "-tissue")[document.getElementById(step + "-tissue").selectedIndex].id;
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
                var file_id = xmlhttp.responseText;
                
                thread = [];
                send_file(file_id, step);
            }
        }
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
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
    var chunk_size = 2 * 1024 * 1024;  // 2MiB
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
        var species = document.getElementById("step1-species")[document.getElementById("step1-species").selectedIndex].id;
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
                var file_id = xmlhttp.responseText;
                thread = [];
                send_file(file_id, "step1");
            }
        }
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
        xmlhttp.send("command=register_file&filename=" + filename + "&chunk_num=" + chunk_num + "&file_type=" + valid_extention_type + "&species=" + species);
    }
}








function send_file(registered_file_id, step){
    
    document.getElementById(step + "-progress").style.display = "inline";
    document.getElementById(step + "-upload-button").style.display = "none";
    document.getElementById(step + "-stop-button").style.display = "inline";
    document.getElementById(step + "-stop-delete-button").style.display = "none";
    document.getElementById(step + "-file").setAttribute("disabled", "true");
    document.getElementById(step + "-progress").setAttribute("curr-val", 0);
    
    var step_file = document.getElementById(step + "-file");
    var file = step_file.files[0];
    var filename = file.name;
    var chunk_size = 2 * 1024 * 1024;  // 2MiB
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
            reader = new FileReader();
            
            reader.chunk_data = [start, file.size, end];
            reader.thread_data = this.thread_data;
            reader.file_id = registered_file_id;
            reader.step = step;
            
            reader.onload = function(){
                
                var http_checksum = new XMLHttpRequest();
                http_checksum.thread_data = this.thread_data;
                http_checksum.result = this.result;
                http_checksum.file_id = this.file_id;
                http_checksum.chunk_data = this.chunk_data;
                http_checksum.step = this.step;
                
                http_checksum.onreadystatechange = function() {
                    if (http_checksum.readyState == 4 && http_checksum.status == 200 && check_response(http_checksum.responseText)) {
                        var md5_db = http_checksum.responseText;
                        var md5_chunk = md5(this.result);
                        
                        if (md5_db != md5_chunk){
                            var xhttp = new XMLHttpRequest();
                            xhttp.thread_data = this.thread_data;
                            xhttp.chunk_data = this.chunk_data;
                            xhttp.upload.chunk_data = this.chunk_data;
                            xhttp.upload.step = this.step;
                            xhttp.step = this.step;
                            
                            xhttp.upload.onprogress = function(evt){
                                var l = this.chunk_data[0] / this.chunk_data[1] + (evt.loaded / evt.total) * (this.chunk_data[2] - this.chunk_data[0]) / this.chunk_data[1];
                                document.getElementById(this.step + "-progress").setAttribute("curr-val", l * 100);
                            }
                            
                            xhttp.onreadystatechange = function() {
                                if (xhttp.readyState == 4 && xhttp.status == 200 && check_response(xhttp.responseText)){
                                    var l = this.chunk_data[0] / this.chunk_data[1] + (this.chunk_data[2] - this.chunk_data[0]) / this.chunk_data[1];
                                    document.getElementById(this.step + "-progress").setAttribute("curr-val", l * 100);
                                    this.thread_data[0] += 1;
                                    this.thread_data[3] = false;
                                }
                            }
                            
                            
                            xhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
                            xhttp.send("command=send_file&chunk_num=" + this.thread_data[0] + "&type=chunk&file_id=" + this.file_id + "&checksum=" + md5_chunk + "&content=" + urlEncode(this.result));
                        }
                        else {
                            var l = this.chunk_data[0] / this.chunk_data[1] + (this.chunk_data[2] - this.chunk_data[0]) / this.chunk_data[1];
                            document.getElementById(this.step + "-progress").setAttribute("curr-val", l * 100);
                            this.thread_data[0] += 1;
                            this.thread_data[3] = false;
                        }
                    }
                }
                http_checksum.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
                http_checksum.send("command=get_check_sum&file_id=" + this.file_id + "&chunk_num=" + this.thread_data[0]);
                
                    
            }
            reader.readAsBinaryString(file.slice(start, end));
        }
    };
    
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
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
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
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
        xmlhttp.send("command=delete_file&file_id=" + dependant_files["step2-" + spec_id][0]);
    }
}







function enable_step2(){
    document.getElementById("step1-unloaded").style.display = "none";
    document.getElementById("step1-loaded").style.display = "inline";
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