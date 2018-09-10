//// whole data of app
let data = []
const selectedRowClassName = 'js-selected-index';
const styleClassName = 'bg-secondary text-light';

$(document).ready(function(){
  console.log('File reader is running...');

  // handle upload file
  $("#file-input").change((e) => {
    handleUploadFile(e);
    clearMemory();
  });
  
  // get the result
  $("#sum-up").click(() => calculateTotal());

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
    let dataToDisplay = [];

    result.dates.map((date, i) => {
      let { activities } = date.sessions[0];
      activities = activities.map((act, j) => {
        act.date = date.date;
        return act;
      });

      dataToDisplay = dataToDisplay.concat(activities);
    });

    displayData(dataToDisplay);
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
  if (data.indexOf(index) === -1) {
    data.push(index);
  } else {
    // remove index from data
    data.splice(data.indexOf(index), 1);
  }
}

const displayData = (activities) => {
  const dataTable = $("#data-table");

  // remove tbody of the previous json data
  dataTable.find('tbody').remove();

  const tbody = document.createElement("tbody");

  activities.map((activity, index) => {
    if (activity.type === 'PAGEVIEW') return;

    tbody.insertAdjacentHTML('beforeend', `
      <tr class="table-row">
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
  let len = data.length
  if (len % 2 === 1) { alert(`You select ${len} item(s), calculating might be wrong if the number if item is "ODD"`) };

  /**
   * Assume that data = [1, 4, 5, 8, 9, 11]
   * => total = (4-1) + (8-5) + (11-9) = [(4 + 8 + 11) - (1 + 5 + 9)] - (1 * 3)
   * 3 = data.length / 2
   */
  let total = 0;

  // Increasingly sort data
  // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description
  data = data.sort((curr, next) => curr - next);

  let evenIndexTotal = data.reduce((acc, curr, index) => {
    if (index % 2 === 0) {
      acc += curr;
    }
    return acc; 
  }, 0);

  let oddIndexTotal = data.reduce((acc, curr, index) => {
    if (index % 2 !== 0) {
      acc += curr;
    }
    return acc;
  }, 0);

  total = oddIndexTotal - evenIndexTotal - data.length / 2;

  $("#result").text(total);
}

const clearMemory = () => {
  data = [];
  $(`.${selectedRowClassName}`).toggleClass(selectedRowClassName).toggleClass(styleClassName);
  $("#result").text("");
}