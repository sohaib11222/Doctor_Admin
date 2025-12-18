var jsonDataUrl = '../assets_admin/data/data-tables.json';

fetch(jsonDataUrl)
  .then(response => response.json())
  .then(data => {
    var table = $('#table1').DataTable();
    table.destroy();
    // Initialize DataTable with JSON data and pagination
    $('#table1').DataTable({
      data: data,
      columns: [
        { data: 'name' },
        { data: 'position' },
        { data: 'office' },
        { data: 'age' },
        { data: 'date' },
        { data: 'salary' }
      ],
      paging: true,
      searching: false,
      scrollY: false,
      scrollX: false,
      order: [[0, 'asc']]
    });
  })
  .catch(error => {
    console.log('Error:', error);
  });
