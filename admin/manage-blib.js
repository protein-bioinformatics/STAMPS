update_state_interval = 0;
chunk_offset = 1000;
valid_extention_ident_types = {'.mzid': 'ident'};
valid_extention_spectra_types = {'.mgf': 'spectra'};
file_list = [];
file_pathname = "";
threads = [];
chunk_sem = [];
wait_fill = 0;

file_id = -1;

String.prototype.ends_with = function(suffix) {
    return this.indexOf(suffix.toLowerCase(), this.length - suffix.length) !== -1;
};


function init_manage_blib(){
    file_id = -1;
    file_pathname = get_pathname() + "../";
    document.getElementById("step1-unloaded").style.display = "inline";
    document.getElementById("step1-loaded").style.display = "none";
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
                
                if (response["chunk_num"] != response["uploaded"]){
                    document.getElementById("step1-infotext").innerHTML = "Please select \"" + response["filename"] + "\" file and continue upload or delete it";
                    document.getElementById("step1-stop-delete-button").style.display = "inline";
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
    var encoded = btoa(unencoded);
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}
  
  
function upload_ident(){
    
    var step1_ident_file = document.getElementById('step1-ident-file');
    if (step1_ident_file.files.length == 0){
        alert("Warning: no ident file selected for upload!");
        return;
    }
    
    
    
    var file = step1_ident_file.files[0];
    var filename = file.name;
    var chunk_max_size = 2 * 1024 * 1024;  // 2MiB
    
    var chunk_num = Math.ceil(file.size / chunk_max_size);
    
    var valid_extention_type = 0;
    for (var valid_extention in valid_extention_ident_types){
        if (filename.toLowerCase().ends_with(valid_extention)){
            valid_extention_type = valid_extention_ident_types[valid_extention];
            break;
        }
    }
    
    if (!valid_extention_type){
        var message = "File has no valid extention. Valid extentions are:";
        for (var valid_extention in valid_extention_ident_types) message += "\n" + valid_extention;
        alert(message);
        return;
    }
    
    var species = document.getElementById("step1-species")[document.getElementById("step1-species").selectedIndex].id;
    
    document.getElementById("step1-progress").style.display = "inline";
    document.getElementById("step1-upload-button").style.display = "none";
    document.getElementById("step1-stop-button").style.display = "inline";
    document.getElementById("step1-ident-file").setAttribute("disabled", "true");
    
    document.getElementById("step1-progress").setAttribute("curr-val", 0);
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && check_response(xmlhttp.responseText)) {
            var file_id = xmlhttp.responseText;
            
            threads = [];
            chunk_sem = [];
            
            for (var chk = 0; chk < chunk_num; ++chk){
                chunk_sem.push(0);
                threads.push(0);
            }
            
            for (var chk = 0; chk < chunk_num; ++chk){
                threads[chk] = setInterval(function(c){
                    if ((!c || chunk_sem[c - 1] == 2) && !chunk_sem[c]){
                        chunk_sem[c] = 1;
                        var start = c * chunk_max_size;
                        var end = start + chunk_max_size >= file.size ? file.size : start + chunk_max_size;
                        var reader = new FileReader();
                        reader.index = c;
                        reader.start = start;
                        reader.end = end;
                        reader.size = file.size;
                        reader.file_id = file_id;
                        reader.onload = function(){
                            var http_checksum = new XMLHttpRequest();
                            http_checksum.reader = this;
                            http_checksum.onreadystatechange = function() {
                                if (http_checksum.readyState == 4 && http_checksum.status == 200 && check_response(http_checksum.responseText)) {
                                    var md5_db = http_checksum.responseText;
                                    var md5_chunk = md5(this.reader.result);
                                    
                                    if (md5_db != md5_chunk){
                                        var xhttp = new XMLHttpRequest();
                                        xhttp.reader = this.reader;
                                        xhttp.upload.reader = this.reader;
                                        
                                        xhttp.upload.onprogress = function(evt){
                                            var l = this.reader.start / this.reader.size + (evt.loaded / evt.total) * (this.reader.end - this.reader.start) / this.reader.size;
					    document.getElementById("step1-progress").setAttribute("curr-val", l * 100);
                                        }
                                        
                                        xhttp.onreadystatechange = function() {
                                            if (xhttp.readyState == 4 && xhttp.status == 200 && check_response(xhttp.responseText)){
                                                chunk_sem[this.reader.index] = 2;
                                            }
                                        }
                                        
                                        
                                        xhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
                                        xhttp.send("command=send_file&chunk_num=" + this.reader.index + "&type=chunk&file_id=" + this.reader.file_id + "&checksum=" + md5_chunk + "&content=" + urlEncode(this.reader.result));
                                    }
                                    else {
                                        var l = this.reader.start / this.reader.size + (this.reader.end - this.reader.start) / this.reader.size;
                                        document.getElementById("step1-progress").setAttribute("curr-val", l * 100);
                                        chunk_sem[this.reader.index] = 2;
                                    }
                                }
                            }
                            http_checksum.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
                            http_checksum.send("command=get_check_sum&file_id=" + this.file_id + "&chunk_num=" + this.index);
                            
                                
                        }
                        reader.readAsBinaryString(file.slice(start, end));
                        clearInterval(threads[c]);
                    }
                }, 100, chk);
            }
            
            wait_fill = setInterval(function(){
                var c = true;
                for (var chk = 0; chk < chunk_num; ++chk){
                    if (chunk_sem[chk] != 2){
                        c = false;
                        break;
                    }
                }
                if (c){
                    alert("file was uploaded!");
                    enable_step2();
                    clearInterval(wait_fill);
                }
            }, 10);
        }
    }
    xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
    xmlhttp.send("command=register_file&filename=" + filename + "&chunk_num=" + chunk_num + "&file_type=" + valid_extention_type + "&species=" + species);
    
}




function stop_upload(){
    if (confirm("Do you really want to interrupt the download?")){
        document.getElementById("step1-progress").style.display = "none";
        document.getElementById("step1-partially-loaded").style.display = "none";
        document.getElementById("step1-upload-button").style.display = "inline";
        document.getElementById("step1-stop-button").style.display = "none";
        document.getElementById("step1-ident-file").removeAttribute("disabled");
        
        for (var thread of threads){
            clearInterval(wait_fill);
            clearInterval(thread);
        }
    }
}

function delete_ident(){
    if (confirm("Do you really want to delete the identification file?")){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                if (xmlhttp.responseText == 0){
                    init_manage_blib();
                }
                else {
                    console.log(xmlhttp.responseText);
                    alert("Error, file could not be deleted. Please try once again.");
                }
            }
        }
        xmlhttp.open("POST", file_pathname + "admin/scripts/blib-server.py", true);
        xmlhttp.send("command=delete_file&file_id=" + file_id);
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