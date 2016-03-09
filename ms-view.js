ms_zoom = 0;
max_ms_zoom = 60;
ms_scaling = 1.2;
origin_x = 0;
last_x = 0;
left_border = 0;
right_border = 0;
top_border = 0;
bottom_border = 0;
spectrum_loaded = false;
x_tics = [200, 100, 50, 25, 10, 5, 2, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625, 0.0078125];
y_tics = [0.2, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];
peaks = [];
acids = [];
tolerance_relative = 10;
tolerance_absolute = 0.02;
H =       1.007276;
C12 =    12.000000;
O =      15.994914;
H3O =    19.016742;
O2 =     31.989829;
acetyl = 43.016742;
peptide = "";
charge = 0;
precursor_mass = 0;
grid_color = "#DDDDDD";
label_color = "black";
var ion_type = {no_type: 0, a_type: 1, b_type: 2, c_type: 3, x_type: 4, y_type: 5, z_type: 6, precursor: 7};
var ion_type_colors = ["#888888", "#888888", "#0056af", "#888888", "#888888", "#D40000", "#888888", "#c89200"];




acids['A'] =  71.037110;
acids['R'] = 156.101110;
acids['N'] = 114.042930;
acids['D'] = 115.026940;
acids['C'] = 103.009190;
acids['c'] = 160.030654;
acids['E'] = 129.042590;
acids['Q'] = 128.058580;
acids['G'] =  57.021460;
acids['H'] = 137.058910;
acids['I'] = 113.084060;
acids['L'] = 113.084060;
acids['K'] = 128.094960;
acids['M'] = 131.040490;
acids['m'] = 147.035404;
acids['n'] = 163.030318;
acids['F'] = 147.068410;
acids['P'] =  97.052760;
acids['S'] =  87.032030;
acids['T'] = 101.047680;
acids['W'] = 186.079310;
acids['Y'] = 163.063330;
acids['V'] =  99.068410;



function binary_search(key){
    var low = 0;
    var mid = 0;
    var high = peaks.length - 1;
    while (low <= high){
        mid = (low + high) >> 1;
        if (peaks[mid].mass == key) break;

        else if (peaks[mid].mass < key) low = mid + 1;
        else high = mid - 1;
    }
    var mn_index = mid;
    var mn = Math.abs(peaks[mid].mass - key);
    if (mid >= 1 && Math.abs(peaks[mid - 1].mass - key) < mn){
        mn = Math.abs(peaks[mid - 1].mass - key);
        mn_index = mid - 1;
    }
    if (mid + 1 < peaks.length && Math.abs(peaks[mid + 1].mass - key) < mn){
        mn = Math.abs(peaks[mid + 1].mass - key);
        mn_index = mid + 1;
    }
    return [document.getElementById("radio_ppm").checked ? mn / key * 1000000 : mn, mn_index];
}



function peak(ms, xx, int){
    this.mass = ms;
    this.x = xx;
    this.intensity = int;
    this.type = ion_type.no_type;
    this.annotation = "";
    this.highlight = false;
}



function subscripting(x){
    var str = "";
    var num = 1;
    var n = Math.floor(Math.log10(x)) + 1;
    for (var i = 0; i < n; ++i){
        str = String.fromCharCode(8320 + Math.floor(x % (num * 10) / num)) + str;
        num *= 10;
    }
    return str;
}



function annotation(){
    // annotate y-ions
    var tolerance = (document.getElementById("radio_ppm").checked ? tolerance_relative : tolerance_absolute);
    var rev_peptide = peptide.split("").reverse().join("");
    var mass = 0;
    
    for (var i = 0; i < peaks.length; ++i){
        peaks[i].type = ion_type.no_type;
        peaks[i].annotation = "";
        peaks[i].highlight = false;
    }
    
    
    // annotate b-ions
    mass = H;
    for (var i = 0; i < peptide.length; ++i){
        mass += acids[peptide[i]];
        
        for (var crg = 1; crg <= charge; ++crg){
            if (mass >= 800 * (crg - 1)){
            var diff_mass = binary_search((mass + (crg - 1)) / crg);
                if (diff_mass[0] < tolerance){
                    peaks[diff_mass[1]].highlight = true;
                    peaks[diff_mass[1]].type = ion_type.b_type;
                    peaks[diff_mass[1]].annotation = "b" + subscripting(i + 1) + (crg > 1 ? charge_plus(crg) : "");
                }
            }
        }
    }
    
    mass = H3O;
    // annotate y-ions
    for (var i = 0; i < rev_peptide.length; ++i){
        mass += acids[rev_peptide[i]];
        for (var crg = 1; crg <= charge; ++crg){
            if (mass >= 800 * (crg - 1)){
            var diff_mass = binary_search((mass + (crg - 1)) / crg);
                if (diff_mass[0] < tolerance){
                    peaks[diff_mass[1]].highlight = true;
                    peaks[diff_mass[1]].type = ion_type.y_type;
                    peaks[diff_mass[1]].annotation = "y" + subscripting(i + 1) + (crg > 1 ? charge_plus(crg) : "");
                }
            }
        }
    }
    
    // annotate precursor
    var diff_mass = binary_search(precursor_mass);
    if (diff_mass[0] < tolerance){
        peaks[diff_mass[1]].highlight = true;
        peaks[diff_mass[1]].type = ion_type.precursor;
        peaks[diff_mass[1]].annotation = "pre" + charge_plus(charge);
    }
}


function resize_ms_view(){
    document.getElementById("msarea").width = document.getElementById('check_spectra').offsetWidth * 0.695;
    document.getElementById("msarea").height = document.getElementById('check_spectra').offsetHeight * 0.9;
    document.getElementById("spectra_panel").style.width = (document.getElementById('check_spectra').offsetWidth * 0.29).toString() + "px";
    document.getElementById("spectra_panel").style.height = (document.getElementById('check_spectra').offsetHeight * 0.9).toString() + "px";
    
    
    var rect = document.getElementById('check_spectra').getBoundingClientRect();
    document.getElementById("msarea").style.top = (rect.top + (rect.bottom - rect.top) * 0.05).toString() + "px";
    document.getElementById("msarea").style.left = (rect.left + (rect.right - rect.left) * 0.3).toString() + "px";
    document.getElementById("spectra_panel").style.top = (rect.top + (rect.bottom - rect.top) * 0.05).toString() + "px";
    document.getElementById("spectra_panel").style.left = (rect.left + (rect.right - rect.left) * 0.005).toString() + "px";
    document.getElementById("spectra_options").style.top = (rect.top + (rect.bottom - rect.top) * 0.05).toString() + "px";
    document.getElementById("spectra_options").style.left = (rect.left + (rect.right - rect.left) * 0.3).toString() + "px";
    
    var scl = (document.getElementById("msarea").width * 0.95 - document.getElementById("msarea").width * 0.05) / (right_border - left_border);
    origin_x *= scl;
    last_x *= scl;
    for (var i = 0; i < peaks.length; ++i) {
        peaks[i].x *= scl;
    }
    left_border = document.getElementById("msarea").width * 0.05;
    right_border = document.getElementById("msarea").width * 0.95;
    top_border = document.getElementById("msarea").height * 0.05;
    bottom_border = document.getElementById("msarea").height * 0.95;
    
    if (spectrum_loaded) draw_spectrum();
}



function change_match_error_value(){
    // check if new value is a number
    var n = document.getElementById("error_value").value;
    if (!isNaN(parseFloat(n)) && isFinite(n)){
        if (document.getElementById("radio_ppm").checked){
            tolerance_relative = parseFloat(n);
        }
        else {
            tolerance_absolute = parseFloat(n);
        }
        if (spectrum_loaded){
            annotation();
            draw_spectrum();
        }
    }
    else {
        document.getElementById("error_value").value = (document.getElementById("radio_ppm").checked ? tolerance_relative : tolerance_absolute);
    }
}


function change_match_error(){
    if (document.getElementById("radio_ppm").checked){
        document.getElementById("unit").innerHTML = document.getElementById("radio_ppm").value;
        document.getElementById("error_value").value = tolerance_relative;
    }
    else {
        document.getElementById("unit").innerHTML = document.getElementById("radio_da").value;
        document.getElementById("error_value").value = tolerance_absolute;
    }
    if (spectrum_loaded){
        annotation();
        draw_spectrum();
    }
}



function load_spectrum(spectrum_id){
    var c = document.getElementById("msarea");
    var ctx = c.getContext("2d");
    ms_zoom = 0;
    peaks = [];
    
    var spectrum_data = 0;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            spectrum_data = JSON.parse(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", "/qsdb/cgi-bin/get-msdata.py?spectrum_id=" + spectrum_id, false);
    xmlhttp.send();
    
    
    peptide = spectrum_data["peptideSeq"];
    precursor_mass = spectrum_data["precursorMZ"];
    charge = spectrum_data["precursorCharge"];
    
    left_border = ctx.canvas.width * 0.05;
    right_border = ctx.canvas.width * 0.95;
    top_border = ctx.canvas.height * 0.05;
    bottom_border = ctx.canvas.height * 0.95;
    
    
    peaks.push(new peak(0, 0, 0));
    origin_x = left_border;
    last_x = right_border;
    var max_mass = 0;
    for (var items in spectrum_data["peakMZ"]){
        peaks.push(new peak(spectrum_data["peakMZ"][items], 0, 0));
        max_mass = Math.max(max_mass, spectrum_data["peakMZ"][items]);
    }
    for (var i = 0; i < peaks.length; ++i) {
        peaks[i].x = origin_x + ctx.canvas.width * 0.9 * peaks[i].mass / max_mass;
    }
    
    var ii = 1;
    for (var items in spectrum_data["peakIntensity"]){
        peaks[ii].intensity = spectrum_data["peakIntensity"][items];
        ii += 1;
    }
    
    spectrum_loaded = true;
    
    annotation();
    draw_spectrum();
}


function draw_spectrum(){
    var c = document.getElementById("msarea");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font="10px Arial";
    
    if (!spectrum_loaded) return;
    
    // Add x-axis tics, values and grid
    var max_tic = peaks[peaks.length - 1].mass;
    var tics_start = Math.min(peaks[0].x, left_border);
    var tic = x_tics[Math.floor(ms_zoom / 4)];
    var width = Math.max(peaks[peaks.length - 1].x, right_border) - Math.min(peaks[0].x, left_border);
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    for (var i = 0; i < max_tic; i += tic){
        var x = tics_start + i * width / max_tic;
        if (left_border <= x && x <= right_border){
            
            ctx.setLineDash([0]);
            ctx.strokeStyle = label_color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, bottom_border);
            ctx.lineTo(x, bottom_border * 1.015);    
            ctx.closePath();
            ctx.stroke();
            
            var txt = i.toString();
            ctx.fillText(txt, x, ctx.canvas.height * 0.975);
            
            
            ctx.setLineDash([10]);
            ctx.strokeStyle = grid_color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, bottom_border);
            ctx.lineTo(x, top_border);    
            ctx.closePath();
            ctx.stroke();
        }
    }
    
    var max_mass = 0;
    var max_intensity = 0;
    for (var i = 0; i < peaks.length; ++i) {
        if (left_border <= peaks[i].x && peaks[i].x <= right_border){
            max_intensity = Math.max(max_intensity, peaks[i].intensity);
        }
    }
    
    // Add y-axis tics, values and grid
    var lg = Math.floor(Math.log10(max_intensity));
    var y_tic = y_tics[Math.floor(max_intensity / Math.pow(10, lg))] * Math.pow(10, lg);
    ctx.textAlign = "right";
    ctx.textBaseline = 'middle';
    for (var i = 0; i < max_intensity; i += y_tic){
        var y = bottom_border - i * ctx.canvas.height * 0.85 / max_intensity;
        ctx.setLineDash([0]);
        ctx.strokeStyle = label_color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left_border, y);
        ctx.lineTo(left_border * 0.9, y);    
        ctx.closePath();
        ctx.stroke();
        
        var txt = i.toString();
        ctx.fillText(txt, left_border * 0.86, y);
        
        ctx.setLineDash([10]);
        ctx.strokeStyle = grid_color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(left_border, y);
        ctx.lineTo(right_border, y);    
        ctx.closePath();
        ctx.stroke();
    }
    
    
    
    // Add Masses
    var zero_x = left_border;
    var zero_y = bottom_border;
    ctx.lineWidth = 1;
    ctx.setLineDash([0]);
    ctx.strokeStyle = ion_type_colors[ion_type.no_type];
    var y_factor = ctx.canvas.height * 0.85 / max_intensity;
    var y_offset = ctx.canvas.height * 0.02;
    var annotated = [];
    for (var i = 0; i < peaks.length; ++i) {
        if (left_border <= peaks[i].x && peaks[i].x <= right_border){
            if (peaks[i].type == ion_type.no_type){
                ctx.beginPath();
                ctx.moveTo(peaks[i].x, zero_y);
                ctx.lineTo(peaks[i].x, zero_y - peaks[i].intensity * y_factor);    
                ctx.closePath();
                ctx.stroke();
            }
            else {
                annotated.push(i);
            }
        }
    }
    
    // draw annotated peaks
    ctx.lineWidth = 2;
    ctx.font="16px Arial";
    for (var i = 0; i < annotated.length; ++i) {
        ctx.strokeStyle = ion_type_colors[peaks[annotated[i]].type];
        ctx.beginPath();
        ctx.moveTo(peaks[annotated[i]].x, zero_y);
        ctx.lineTo(peaks[annotated[i]].x, zero_y - peaks[annotated[i]].intensity * y_factor);    
        ctx.closePath();
        ctx.stroke();
    }
    
    // draw annotations
    for (var i = 0; i < annotated.length; ++i) {
        ctx.textAlign = "center";
        ctx.textBaseline = 'bottom';
        ctx.fillText(peaks[annotated[i]].annotation, peaks[annotated[i]].x, zero_y - peaks[annotated[i]].intensity * y_factor - y_offset);
    }
    
    
    // Add axis and labels
    ctx.strokeStyle = label_color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(zero_x, top_border);
    ctx.lineTo(zero_x, zero_y);    
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(zero_x, zero_y);    
    ctx.lineTo(right_border, zero_y);    
    ctx.closePath();
    ctx.stroke();
    ctx.font="16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = 'top';
    ctx.fillText("m/z", right_border * 1.005, bottom_border);
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = "center";
    //ctx.fillText("intensity", left_border - 100, top_border);
    ctx.restore();
}


function get_mouse_pos(canvas, evt){
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}


function view_mouse_wheel_listener(event){
    var direction = (1 - 2 *(event.detail >= 0));
    if (ms_zoom + direction < 0 || max_ms_zoom <= ms_zoom + direction)
        return;
    
    ms_zoom += direction;
    var scale = ms_scaling;
    if (event.detail >= 0) scale = 1. / scale;
    var c = document.getElementById("msarea");
    var ctx = c.getContext("2d");
    
    res = get_mouse_pos(c, event);
    origin_x = res.x + scale * (origin_x - res.x);
    last_x = res.x + scale * (last_x - res.x);
    for (var i = 0; i < peaks.length; ++i) {
        peaks[i].x = res.x + scale * (peaks[i].x - res.x);
    }
    if (origin_x > ctx.canvas.width * 0.05){
        var diff = origin_x - ctx.canvas.width * 0.05;
        origin_x -= diff;
        last_x -= diff;
        for (var i = 0; i < peaks.length; ++i) {
            peaks[i].x -= diff;
        }
    }
    
    if (last_x < ctx.canvas.width * 0.95){
        var diff = ctx.canvas.width * 0.95 - last_x;
        last_x += diff;
        origin_x += diff;
        for (var i = 0; i < peaks.length; ++i) {
            peaks[i].x += diff;
        }
    }
    
    draw_spectrum();
}