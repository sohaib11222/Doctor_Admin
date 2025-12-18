
var jsonDataUrl = ('../assets_admin/data/tables-basic.json');
fetch(jsonDataUrl)
  .then(response => response.json())
  .then(data => {
    var table1Data = data.slice(0, 3); // First three data objects
    var table2Data = data.slice(3, 12); // Next four data objects
    var table3Data = data.slice(12); // Remaining data objects

    // Generate HTML for each table
    var table1HTML = generateTableHTML(table1Data);
    var table2HTML = generateTableHTML(table1Data);
    var table3HTML = generateTableHTML(table1Data);
    var table4HTML = generateTableHTML(table1Data);
    var table5HTML = generateTableHTMLColor(table2Data);
    var table6HTML = generateTableHTMLAnother(table3Data);

    // Insert the generated HTML into the respective table elements
    document.querySelector('#table1').innerHTML = table1HTML;
    document.querySelector('#table2').innerHTML = table2HTML;
    document.querySelector('#table3').innerHTML = table3HTML;
    document.querySelector('#table4').innerHTML = table4HTML;
    document.querySelector('#table5').innerHTML = table5HTML;
    document.querySelector('#table6').innerHTML = table6HTML;
  })

  .catch(error => {
    console.log('Error:', error);
  });

// Function to generate HTML for a table based on the data
function generateTableHTML(data) {
  var html = '';
  for (var i = 0; i < data.length; i++) {
    if (i === 0 || i === 1 || i === 2) {
      html += `
        <tr>
          <td>${data[i].firstname}</td>
          <td>${data[i].lastname}</td>
          <td>${data[i].email}</td>
        </tr>
      `;

    }
  }
  return html
}
function generateTableHTMLColor(data) {
  var html = '';
  for (var i = 0; i < data.length; i++) {
    if (i === 0) {
      html += `
      <tr>
      <td>${data[i].firstname}</td>
      <td>${data[i].lastname}</td>
      <td>${data[i].email}</td>
    </tr>
      `;
    }else if (i === 1) {
      html += `
      <tr class="table-primary">
      <td>${data[i].firstname}</td>
      <td>${data[i].lastname}</td>
      <td>${data[i].email}</td>
    </tr>
      `;
    } else if (i === 2) {
      html += `
      <tr class="table-secondary">
      <td>${data[i].firstname}</td>
      <td>${data[i].lastname}</td>
      <td>${data[i].email}</td>
    </tr>
      `;
    } else if (i === 3) {
      html += `
      <tr class="table-success">
      <td>${data[i].firstname}</td>
      <td>${data[i].lastname}</td>
      <td>${data[i].email}</td>
    </tr>
      `;
    } else if (i === 4) {
      html += `
      <tr class="table-danger">
      <td>${data[i].firstname}</td>
      <td>${data[i].lastname}</td>
      <td>${data[i].email}</td>
    </tr>
      `;
    } else if (i === 5) {
      html += `
      <tr class="table-warning">
      <td>${data[i].firstname}</td>
      <td>${data[i].lastname}</td>
      <td>${data[i].email}</td>
    </tr>
      `;
    } else if (i === 6) {
      html += `
      <tr class="table-info">
      <td>${data[i].firstname}</td>
      <td>${data[i].lastname}</td>
      <td>${data[i].email}</td>
    </tr>
      `;
    } else if (i === 7) {
      html += `
      <tr class="table-light">
      <td>${data[i].firstname}</td>
      <td>${data[i].lastname}</td>
      <td>${data[i].email}</td>
    </tr>
      `;
    } else if (i === 8) {
      html += `
      <tr class="table-dark">
      <td>${data[i].firstname}</td>
      <td>${data[i].lastname}</td>
      <td>${data[i].email}</td>
    </tr>
      `;
    } 
  }
  return html;
}

function generateTableHTMLAnother(data) {
  var html = '';
  for (var i = 0; i <= 8; i++) {
  data.forEach(item => {
      if (item.id === 1) {
        html += `
        <tr>
        <td>${item.id}</td>
          <td>${item.firstname}</td>
          <td>${item.lastname}</td>
          <td>${item.age}</td>
          <td>${item.city}</td>
          <td>${item.country}</td>
        </tr>
        `;
  
      }
    });
  }
  return html;
}


