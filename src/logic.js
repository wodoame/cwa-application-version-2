let sigmas = [];
let form_is_valid = true;
let credit_records = [];
let cwa_records = []; 
let swa_records = [];
let allow_semesters_active_increment;
let current_total_credits;
let current_sigma_obtained;
let current_scores = []; 
let current_credits = [];
let cwa; 
let swa;
let rowCount = 7;  // initial number of rows
let semestersCount = 0;
let user_cwa_data;
const form = document.getElementById('input-rows'); 
const inputRowsParent = document.getElementById('input-rows');

const renumber = () => {
    const courseNumbers = document.querySelectorAll('.course-number'); 
    courseNumbers.forEach((span, index)=>{
        span.innerHTML = index + 1;
    });
}
const deactivateModal = () => {
    document.getElementById('closeModal').click();
};

const activateModal = (message) => {
    document.getElementById('modal-message').innerHTML =  `
        ${message}
    `;
    document.getElementById('saveButton').click();
    setTimeout(deactivateModal, 2000);
}; 

const activateWarningModal = (message, id_1, id_2) => {
    document.getElementById('warning-modal-message').innerHTML =  `
    ${message}
`;
    document.getElementById('warningTrigger').click();
    document.getElementById(id_1).classList.remove('tw-hidden');
    document.getElementById(id_2).classList.add('tw-hidden');
};

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

const getGraph = (n) => {
    activateSpinner();
    const graph = document.getElementById('graph');
    const labels = []; 
    // using a for loop to create labels for the graphs
    for (let i = 0; i < n; i++){
        labels.push(i + 1);
    }

    const graphData = {
        "chart": `{type:'line',data:{labels:[${labels.toString()}], datasets:[{type:'line', fill:false, label:'CWA', lineTension:0.5, borderColor:'rgb(96,84,207)', data: [${cwa_records.toString()}]}, {type:'line', fill:false, label:'SWA', lineTension:0.5, borderColor:'rgb(242,142,44)', data: [${swa_records.toString()}]}]} }`
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
    }).catch((error)=>{console.log(error)});
};

const createEmptyTable = (n) => {
let htmlContent;
for (let i = 0; i < n; i++){
   htmlContent = `
    <div class="input-row">
        <div class="numbering">
            <span class="course-number">${i + 1}</span>
        </div>
        <div>
            <input type="number" max="100" min="0" name="score-field" oninput="check(this)" required class="form-control tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0 focus:tw-outline-project-blue focus:tw-ring-0 focus:tw-outline-2" id="input">
        </div>
          <div>
            <input type="number" max="100" min="0" name="credit-field" oninput="check(this)" required class="form-control tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0 focus:tw-outline-project-blue focus:tw-ring-0 focus:tw-outline-2" id="input">
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



function calculate(){
    let score_fields = document.getElementsByName('score-field');
    let credit_fields = document.getElementsByName('credit-field');

    current_total_credits = 0; 
    current_sigma_obtained = 0; 
    current_scores = []; 
    current_credits = [];

    for(let i=0; i < score_fields.length ; i++ ){
        if(!score_fields[i].checkValidity() || !credit_fields[i].checkValidity()){
            form_is_valid = false;
            break;
        }

        let x = parseInt(score_fields[i].value); 
        let y = parseInt(credit_fields[i].value); 

        current_scores.push(x); 
        current_credits.push(y); 

        current_total_credits += y; 
        current_sigma_obtained += x * y;
        }
    

    let sigmas_sum = sigmas.reduce((accumulator, value) => {return accumulator + value;}, 0) + current_sigma_obtained; 
    let credit_records_sum  = credit_records.reduce((accumulator, value) => {return accumulator + value;}, 0) + current_total_credits; 
    cwa = parseFloat((sigmas_sum / credit_records_sum).toFixed(2));
    swa = parseFloat((current_sigma_obtained/current_total_credits).toFixed(2));
    if(form_is_valid){
        allow_semesters_active_increment = true;
        progress(cwa, 'progress-bar-1', 'cwa-score'); 
        progress(swa, 'progress-bar-2', 'swa-score'); 
        const htmlContent =  `
            Done
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg tw-fill-project-blue" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
        `; 
        activateModal(htmlContent);
    }
    else{
        activateModal('Invalid data provided');
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

const createRecord = (data) => {
    const recordsDiv = document.getElementById('records-div');
    recordsDiv.innerHTML = ''; 
    // console.log(recordsDiv);
    if(data.semestersCount == 0){
       const  htmlContent = `
             <div class="tw-text-slate-500 text-center">No records yet</div>
            `; 
        recordsDiv.innerHTML = htmlContent;
    }
    for(let i=1; i <= data.semestersCount; i++){
        let semester_n = 'semester_' + i; 
        let htmlContent =  `
        <div>
            <div>
            <div class="tw-text-center tw-text-project-blue tw-underline tw-underline-offset-8 tw-my-2">Semester ${i}</div>
            </div>

            <div class="tw-mt-5" id="semester-${i}-records"> 
                 
                <div class="record-row">
                    <div></div>
                    <div class="tw-text-center tw-text-project-blue tw-underline tw-underline-offset-4">Course Mark</div>
                    <div class="tw-text-center tw-text-project-blue tw-underline tw-underline-offset-4">
                    Credit Hours
                    </div>
                    <div></div>
                </div>

            </div>
        </div>
        `;
        recordsDiv.insertAdjacentHTML("beforeend", htmlContent)
        // console.log(semester_n);
        const course_marks = data[semester_n].course_marks; 
        const credit_hours = data[semester_n].credit_hours;

        
        for(let j=0; j < course_marks.length; j++){
            htmlContent = `
                <div class="record-row">
                    <div class="numbering">
                        <span>${j + 1}</span>
                    </div>
                    <div>
                        <input type="number" value="${course_marks[j]}" disabled class="form-control tw-bg-white is-valid tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0">
                    </div>
                    <div>
                        <input type="number" value="${credit_hours[j]}" disabled class="form-control tw-bg-white is-valid tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0">
                    </div>
                    <button type="button" class="close-button tw-border-0 tw-bg-white tw-p-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-database tw-fill-project-blue" viewBox="0 0 16 16">
                        <path d="M4.318 2.687C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4c0-.374.356-.875 1.318-1.313ZM13 5.698V7c0 .374-.356.875-1.318 1.313C10.766 8.729 9.464 9 8 9s-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777A4.92 4.92 0 0 0 13 5.698ZM14 4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13V4Zm-1 4.698V10c0 .374-.356.875-1.318 1.313C10.766 11.729 9.464 12 8 12s-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777A4.92 4.92 0 0 0 13 8.698Zm0 3V13c0 .374-.356.875-1.318 1.313C10.766 14.729 9.464 15 8 15s-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13s3.022-.289 4.096-.777c.324-.147.633-.323.904-.525Z"/>
                    </svg>
                    </button>
                </div>
                `;
                document.getElementById(`semester-${i}-records`).insertAdjacentHTML("beforeend", htmlContent); 
            }
        // console.log(course_marks, credit_hours, semester_n);
    }
}; 


// SAVE FUNCTIONALITY
function save(){
    if(allow_semesters_active_increment){
        let current_value = document.getElementById('saved-semesters').innerHTML;
        semestersCount = parseInt(current_value) + 1; 
        document.getElementById('saved-semesters').innerHTML = semestersCount;
        const htmlContent =  `
            saved successfully
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg tw-fill-project-blue" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
        `; 

        activateModal(htmlContent);
        sigmas.push(current_sigma_obtained); 
        credit_records.push(current_total_credits);
        cwa_records.push(cwa); 
        swa_records.push(swa); 
        user_cwa_data = localStorage.getItem('user_cwa_data');
        user_cwa_data ?  user_cwa_data = JSON.parse(user_cwa_data): user_cwa_data = {};
        const semester_n = 'semester_' + semestersCount; 
        user_cwa_data['semestersCount'] = semestersCount; 
        user_cwa_data['sigmas'] = sigmas; 
        user_cwa_data['credit_records'] = credit_records; 
        user_cwa_data['cwa_records'] = cwa_records; 
        user_cwa_data['swa_records'] = swa_records; 
        user_cwa_data[semester_n] = {'course_marks': current_scores, 'credit_hours': current_credits, 'cwa':cwa, 'swa':swa};
        localStorage.setItem('user_cwa_data', JSON.stringify(user_cwa_data));
        // console.log(user_cwa_data);
        createRecord(user_cwa_data);
        if(semestersCount > 1){
          getGraph(semestersCount);
        }
        allow_semesters_active_increment = false;
    }
    else{
        activateModal('No calculations done yet');
    }
}



const deleteOneSemester = () => {
    user_cwa_data = localStorage.getItem('user_cwa_data');
    if(user_cwa_data){
        user_cwa_data = JSON.parse(user_cwa_data);
        semestersCount = user_cwa_data['semestersCount']
        const semester_n = 'semester_' + semestersCount; 
        if(semestersCount > 0){
            semestersCount--;
            sigmas.pop(); 
            credit_records.pop();
            cwa_records.pop(); 
            swa_records.pop();
            user_cwa_data['semestersCount'] = semestersCount; 
            user_cwa_data['sigmas'] = sigmas; 
            user_cwa_data['credit_records'] = credit_records; 
            user_cwa_data[semester_n] = 'deleted';
            semestersCount > 0 ?  localStorage.setItem('user_cwa_data', JSON.stringify(user_cwa_data)): localStorage.removeItem('user_cwa_data');
            document.getElementById('saved-semesters').innerHTML = semestersCount;
            // console.log(user_cwa_data);
            const htmlContent =  `
            Recent semester data deleted successfully
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg tw-fill-project-blue" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
         `; 
            activateModal(htmlContent);
            createRecord(user_cwa_data);
        } 
    }
    else{
        activateModal('No semester data to delete');
    }
};

const deleteAllSemesters = () => {
    if(localStorage.getItem('user_cwa_data')){
       
        localStorage.removeItem('user_cwa_data');
        document.getElementById('saved-semesters').innerHTML = '0';
        const htmlContent =  `
        All semesters data deleted sucessfully
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg tw-fill-project-blue" viewBox="0 0 16 16">
            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
        </svg>
    `; 
        activateModal(htmlContent);
        createRecord({'semestersCount':0});
        sigmas = []; 
        credit_records = [];
        cwa_records = []; 
        swa_records = [];
    }
    else{
        activateModal('No semester data to delete');
    }
};

// CLEAR ALL INPUT FIELDS AND PROGRESS BARS
function clearResults(){
    let fields = document.querySelectorAll('#input');
    for(let i=0; i <fields.length ; i++){
        fields[i].value = '';
        fields[i].setAttribute('class', 'form-control tw-rounded-sm tw-outline tw-outline-1 tw-outline-slate-300 tw-border-0 focus:tw-outline-project-blue focus:tw-ring-0 focus:tw-outline-2');
    }
    progress(0, 'progress-bar-1', 'cwa-score');
    progress(0, 'progress-bar-2', 'swa-score');
}


const prepopulate = () => {
    const json_data = localStorage.getItem('user_cwa_data'); 
    if(json_data){
        const data = JSON.parse(json_data);
        const semester_n = 'semester_' + data.semestersCount;
        const course_marks = data[semester_n].course_marks; 
        const credit_hours = data[semester_n].credit_hours;
        cwa = data[semester_n].cwa; 
        swa = data[semester_n].swa;
        sigmas = data.sigmas;
        credit_records = data.credit_records;
        cwa_records = data.cwa_records; 
        swa_records = data.swa_records;
        document.getElementById('saved-semesters').innerHTML = data.semestersCount; 
        semestersCount = data.semestersCount;
        rowCount = course_marks.length;  // keeps track of the row so a user cannot delete all rows. Check the deleteRow function
        createEmptyTable(rowCount);
        const score_fields = document.getElementsByName('score-field');
        const credit_fields = document.getElementsByName('credit-field');
        for (let i = 0; i < rowCount; i++){
            score_fields[i].value = course_marks[i]; 
            credit_fields[i].value = credit_hours[i]; 
            check(score_fields[i]);
            check(credit_fields[i]);
            progress(cwa, 'progress-bar-1', 'cwa-score');
            progress(swa, 'progress-bar-2', 'swa-score');
        }
         const htmlContent =  `
            History restored
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg tw-fill-project-blue" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
        `; 
            activateModal(htmlContent);
            createRecord(data);
             if(semestersCount > 1){
             getGraph(semestersCount);
            }
    }
    else{
        createEmptyTable(rowCount);
    }
}; 

prepopulate();