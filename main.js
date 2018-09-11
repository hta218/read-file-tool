//// whole data of app
// list of all action indexes
let indexList = [];
// all actions (in detail)
let data = [];

const selectedRowClassName = 'js-selected-index';
const styleClassName = 'bg-success text-light';

$(document).ready(function(){
  console.log('File reader is running...');

  // handle upload file
  $("#file-input").change((e) => {
    handleUploadFile(e);
    clearMemory();
  });
  
  // get the result
  $("#sum-up").click(() => calculateTotal());

  // Auto count
  $("#auto-count").click(() => autoCalculate());

  // reset all
  $("#clear").click(() => clearMemory());
})

const handleUploadFile = (event) => {
  console.log("A file uploaded");
  let file = event.target.files[0]
  const fileReader = new FileReader();

  fileReader.onload = (event) => {
    let { result } = event.target;
    
    result = JSON.parse(result);
    result.dates.map((date, i) => {
      let { activities } = date.sessions[0];
      activities = activities.map((act, j) => {
        act.date = date.date;
        return act;
      });

      data = data.concat(activities);

      // remove all "PAGEVIEW" typed action
      data = data.filter(act => act.type === "EVENT");

      // add an "index" key for each action for auto-calculating
      data = data.map((act, index) => {
        act.index = index + 1;
        return act;
      });
    });

    displayData(data);
    $(".table-row").click((e) => handleSelectRow(e));
  }

  fileReader.readAsText(file);
}

const handleSelectRow = (e) => {
  let row = e.currentTarget;

  $(row).toggleClass(selectedRowClassName).toggleClass(styleClassName);
  let index = parseInt($(row).find('.index').text());

  handleSaveData(index);
}

const handleSaveData = (index) => {
  // verify if index is in data
  if (indexList.indexOf(index) === -1) {
    indexList.push(index);
  } else {
    // remove index from data
    indexList.splice(indexList.indexOf(index), 1);
  }
}

const displayData = (activities) => {
  const dataTable = $("#data-table");

  // remove tbody of the previous json data
  dataTable.find('tbody').remove();

  const tbody = document.createElement("tbody");

  activities.map((activity, index) => {
    tbody.insertAdjacentHTML('beforeend', `
      <tr class="table-row" data-index=${index + 1}>
        <td class="index">${index + 1}</td>
        <td>${activity.date}</td>
        <td>${activity.time}</td>
        <td>${activity.type}</td>
        <td>${activity.name}</td>
      </tr>    
    `);
  });

  dataTable.append(tbody);
}

const calculateTotal = () => {
  // TODO: do st when the number of numbs in data is odd
  let len = indexList.length
  if (len % 2 === 1) { alert(`You select ${len} item(s), calculating might be wrong if the number of items is "ODD"`) };

  /**
   * Assume that data = [1, 4, 5, 8, 9, 11]
   * => total = (4-1) + (8-5) + (11-9) = [(4 + 8 + 11) - (1 + 5 + 9)]
   * Final step:  total -= 3
   * 3 = data.length / 2
   */

  let total = 0;
  // Increasingly sort indexes
  // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description
  indexList = indexList.sort((curr, next) => curr - next);

  let evenIndexTotal = indexList.reduce((acc, curr, index) => {
    if (index % 2 === 0) {
      acc += curr;
    }
    return acc; 
  }, 0);

  let oddIndexTotal = indexList.reduce((acc, curr, index) => {
    if (index % 2 !== 0) {
      acc += curr;
    }
    return acc;
  }, 0);

  total = oddIndexTotal - evenIndexTotal - indexList.length / 2;

  // update UI
  $("#result").text(total);
}

const autoCalculate = () => {
  clearMemory();

  // get the earliest "Start Template" action
  let startTemplateActions = data.filter(act => act.name === "Start Template");
  let firststartTempAct = startTemplateActions[startTemplateActions.length - 1];

  // get all "Publish" action after the firststartTempAct
  let publicActions = data.filter(act => act.name === "Publish" && act.index < firststartTempAct.index);
  let firstpublicAct = publicActions[publicActions.length - 1];

  // push 2 index-es in indexList array for calculating actions
  indexList.push(firstpublicAct.index);
  indexList.push(firststartTempAct.index);

  calculateTotal();
  updateUI();
}

// This function is for auto-calculate case only
const updateUI = () => {
  let rows = $('tbody > tr');
  let FIRST_START_TEMPLATE = indexList[1];
  let FIRST_PUBLISH_AFTER_FIRST_START_TEMPLATE = indexList[0];

  for (row of rows) {
    let actionIndex = $(row).attr('data-index');
    if ((FIRST_PUBLISH_AFTER_FIRST_START_TEMPLATE < actionIndex) && 
        (actionIndex <  FIRST_START_TEMPLATE)) {
          $(row).toggleClass(styleClassName);
    }
  }
}

const clearMemory = () => {
  indexList = [];
  $('tr').removeClass(styleClassName);
  $("#result").text("");
}