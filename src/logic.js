let form = document.getElementById('input-rows'); 
let sigmas = [];
let form_is_valid = true;
let credit_records = [];
let allow_semesters_active_increment, current_total_credits, current_sigma_obtained, note;
const inputRowsParent = document.getElementById('input-rows');
let rowCount = 7;  // initial number of rows

const renumber = () => {
    const courseNumbers = document.querySelectorAll('.course-number'); 
    courseNumbers.forEach((span, index)=>{
        span.innerHTML = index + 1;
    });
}

const activateModal = (message) => {
    document.getElementById('modal-message').innerHTML =  `
        <div class="alert tw-bg-white tw-text-project-blue text-center">
        ${message}
        </div>
    `;
    document.getElementById('saveButton').click();
}

const deleteRow = (r) => {
    if(rowCount > 1){
        r.parentNode.remove();
        rowCount--; 
        renumber();
    }
    else{
      activateModal('You cannot delete all rows');
    }
};


const addRow = () => {
    const htmlContent = `
    <div class="input-row">
        <div class="numbering">
            <span class="course-number">${rowCount + 1}</span>
        </div>
        <div>
            <input type="number" max="100" min="0" name="score-field" oninput="check(this)" required class="form-control tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0 focus:tw-outline-project-blue focus:tw-ring-0 focus:tw-outline-2">
        </div>
          <div>
            <input type="number" max="100" min="0" name="credit-field" oninput="check(this)" required class="form-control tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0 focus:tw-outline-project-blue focus:tw-ring-0 focus:tw-outline-2">
        </div>
        <button type="button" class="close-button tw-border-0 tw-bg-white tw-p-0" onclick="deleteRow(this)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x-lg tw-fill-project-blue" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
        </button>
    </div>
        `;
      inputRowsParent.insertAdjacentHTML("beforeend", htmlContent);
      rowCount++;
    }

const activateSpinner = () => {
    document.getElementById('spinner-1').classList.remove('tw-hidden')
}
const deactivateSpinner = () => {
    document.getElementById('spinner-1').classList.add('tw-hidden')
}

const getGraph = () => {
    activateSpinner();
    const graph = document.getElementById('graph');
    const graphData = {
        "chart": "{type:'line',data:{labels:[1, 2, 3, 4, 5, 6, 7], datasets:[{type:'line', fill:false, label:'CWA', lineTension:0.5, borderColor:'rgb(96,84,207)', data: [85, 79.69, 79.64, 77,61, 79.90, 80.10, 80.09]}, {type:'line', fill:false, label:'SWA', lineTension:0.5, borderColor:'rgb(242,142,44)', data: [89, 70.69, 70.64, 75,61, 72.90, 78.10, 88.09]}]} }"
       }

       fetch('https://quickchart.io/chart/create', {
        method:'POST', 
        body:JSON.stringify(graphData),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then((response)=>{return response.json()})
    .then((data)=>{
        graph.src = data.url;
        setTimeout(deactivateSpinner, 2000); 
    })
};

// getGraph();


const createTable = (n) => {
let htmlContent;
for (let i = 0; i < n; i++){
   htmlContent = `
    <div class="input-row">
        <div class="numbering">
            <span class="course-number">${i + 1}</span>
        </div>
        <div>
            <input type="number" max="100" min="0" name="score-field" oninput="check(this)" required class="form-control tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0 focus:tw-outline-project-blue focus:tw-ring-0 focus:tw-outline-2">
        </div>
          <div>
            <input type="number" max="100" min="0" name="credit-field" oninput="check(this)" required class="form-control tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0 focus:tw-outline-project-blue focus:tw-ring-0 focus:tw-outline-2">
        </div>
        <button type="button" class="close-button tw-border-0 tw-bg-white tw-p-0" onclick="deleteRow(this)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x-lg tw-fill-project-blue" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
        </button>
    </div>`;
    inputRowsParent.insertAdjacentHTML("beforeend", htmlContent);
}
};

createTable(rowCount);


function calculate(){
    let score_fields = document.getElementsByName('score-field');
    let credit_fields = document.getElementsByName('credit-field');

    current_total_credits = 0; 
    current_sigma_obtained = 0; 

    for(let i=0; i < score_fields.length ; i++ ){
        if(!score_fields[i].checkValidity() || !credit_fields[i].checkValidity()){
            form_is_valid = false;
            break;
        }

        let x = parseInt(score_fields[i].value); 
        let y = parseInt(credit_fields[i].value); 

            current_total_credits += y; 
            current_sigma_obtained += x * y;
        }
    

    let sigmas_sum = sigmas.reduce((accumulator, value) => {return accumulator + value;}, 0) + current_sigma_obtained; 
    let credit_records_sum  = credit_records.reduce((accumulator, value) => {return accumulator + value;}, 0) + current_total_credits; 
    let cwa = parseFloat((sigmas_sum / credit_records_sum).toFixed(2));
    let swa = parseFloat((current_sigma_obtained/current_total_credits).toFixed(2));
    if(form_is_valid){
        allow_semesters_active_increment = true;
        progress(cwa, 'progress-bar-1', 'cwa-score'); 
        progress(swa, 'progress-bar-2', 'swa-score'); 
    }
    form_is_valid = true; // incase the value is false
}


// PROGRESS BAR
function progress(r, progressId, scoreId){
    const progress_bar = document.getElementById(progressId); 
    let value = r;
    if(value >= 75){
        progress_bar.setAttribute('class', 'progress-bar tw-bg-green-600');
    }
    else if(value >= 70 && value < 75){
        progress_bar.setAttribute('class', 'progress-bar tw-bg-project-blue');
    }
    else if(value >= 60 && value < 70){

        progress_bar.setAttribute('class', 'progress-bar bg-warning');
    }
    else{
        progress_bar.setAttribute('class', 'progress-bar bg-danger'); 
    }

    value = value.toString();
    progress_bar.setAttribute('style', 'width:'+ value + '%');
    document.getElementById(scoreId).innerHTML = r;
}

// REAL-TIME VALIDATION
function check(r){
    if(r.value == ""){
        r.setAttribute('class', 'form-control tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0 focus:tw-outline-project-blue focus:tw-ring-0 focus:tw-outline-2');
    }
    else if(r.checkValidity()){

        r.setAttribute('class', 'form-control is-valid tw-rounded-sm tw-outline tw-outline-1 tw-outline-green-600 tw-border-0 focus:tw-ring-0 focus:tw-outline-2');

    }
    else{
        r.setAttribute('class', 'form-control is-invalid tw-rounded-sm tw-outline tw-outline-1 tw-outline-pink-600 tw-border-0 focus:tw-ring-0 focus:tw-outline-2');
    }
}

// SAVE FUNCTIONALITY
function increment(){
    console.log(allow_semesters_active_increment);
    if(allow_semesters_active_increment){
        let current_value = document.getElementById('saved-semesters').innerHTML;
        document.getElementById('saved-semesters').innerHTML = parseInt(current_value) + 1;
        document.getElementById('modal-message').innerHTML =  `
            <div class="alert tw-bg-white tw-text-project-blue text-center">
            saved successfully
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg tw-fill-project-blue" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
            </div>
        `; 

        document.getElementById('saveButton').click(); 
        sigmas.push(current_sigma_obtained); 
        credit_records.push(current_total_credits);
        allow_semesters_active_increment = false;
    }
    else{
        activateModal('No calculations done yet');
    }
}

// CLEAR ALL INPUT FIELDS AND PROGRESS BARS
function clearResults(){
    let fields = document.getElementsByTagName('input');
    for(let i=0; i <fields.length ; i++){
        fields[i].value = '';
        fields[i].setAttribute('class', 'form-control tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0 focus:tw-outline-project-blue focus:tw-ring-0 focus:tw-outline-2');
    }
    progress(0, 'progress-bar-1');
    progress(0, 'progress-bar-2');
}

