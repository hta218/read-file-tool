//// whole data of app
const data = []
let isHead = true;
let pair = {};

$(document).ready(function(){
  console.log('File reader is running...');

  $("#file-input").change((e) => {
    handleUploadFile(e);
  });
  
  $("#sum-up").click(() => calculateTotal());
})


const handleUploadFile = (event) => {
  console.log("A file uploaded");
  let file = event.target.files[0]

  const fileReader = new FileReader();
  fileReader.onload = (event) => {
    let { result } = event.target;
    
    let data = JSON.parse(result);

    let activities1 = data.dates[0].sessions[0].activities;
    let activities2 = data.dates[1].sessions[0].activities;

    activities1 = activities1.map((act, index) => {
      act.date = data.dates[0].date;
      return act
    });

    activities2 = activities2.map((act, index) => {
      act.date = data.dates[1].date;
      return act;
    })

    const activities = activities1.concat(activities2);
    
    displayData(activities);
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
  console.log(data);
}

const displayData = (activities) => {
  const dataTable = document.getElementById("data-table");
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

  dataTable.appendChild(tbody);
}

const calculateTotal = () => {
  let total = 0;
  data.map((pair, index) => {
    total += (pair.tail - pair.head);
    total += 1;
  })

  $("#result").text(total)
}