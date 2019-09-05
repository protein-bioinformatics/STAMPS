  

function foo(){
    var pb = document.getElementById("progress");
    pb.setAttribute("curr-val", "180");
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
        if (bar.max - bar.min > 0 && bar.min <= bar.curr && bar.curr <= bar.max){
            this.shadowRoot.children[0].style.backgroundColor = this.shadowRoot.children[0].defColor;
            bar.style.width = (bar.curr / (bar.max - bar.min) * 100.).toString() + "%";
        }
        else {
            this.shadowRoot.children[0].style.backgroundColor = "#dd0000";
            bar.style.width = "0%";
        }
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
        bar.style.width = "100%";
        bar.style.height = "100%";
        
        bar.min = 0;
        bar.max = 0;
        bar.curr = 0;
        
        this.set_width("100px");
        this.set_height("10px");
        this.set_min_val("0");
        this.set_max_val("100");
        this.set_curr_val("20");
        this.set_bar_color("#6aa8ea");
        this.set_bg_color("#dddddd");
    }
    
    
}
customElements.define('progress-bar', ProgressBar);