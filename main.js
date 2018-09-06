//// whole data of app
const data = []
let isHead = true;
let pair = {};

$(document).ready(function(){
  console.log('File reader is running...');

  $("#file-input").change((e) => {
    handleUploadFile(e);
    $("#result").text("");
  });
  
  $("#sum-up").click(() => calculateTotal());
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
  $(row).addClass('bg-primary');
  let index = parseInt($(row).find('.index').text());

  handleSaveData(index);
}

const handleSaveData = (index) => {
  if (isHead) {
    pair.head = index;
  }
  else {
    pair.tail = index;
    data.push({ head: pair.head, tail: pair.tail });
  }

  isHead = !isHead;
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
  let total = 0;
  data.map((pair, index) => {
    total += (pair.tail - pair.head);
    total += 1;
  })

  $("#result").text(total)
}