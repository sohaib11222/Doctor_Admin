var jsonDataUrl = '../assets_admin/data/patients.json';


fetch(jsonDataUrl)
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            item.patient_image = `../assets_admin/img/patients/${item.patient_image}`;
        });

        var table = $('#patient_data').DataTable();
        table.destroy();
        $('#patient_data').DataTable({
            data: data,
            columns: [
                { data: 'patient_id' },
                {
                    data: null,
                    render: function (data, type, row) {
                        var patientimageHtml = `
              <h2 class="table-avatar">
              <a href="profile" class="avatar avatar-sm me-2"><img class="avatar-img rounded-circle" src="${data.patient_image}" alt="User image"></a>
              <a href="profile"> ${data.patient_name} </a>
              </h2>
            `;
                        return patientimageHtml;
                    }
                },
                { data: 'age' },
                { data: 'address' },
                { data: 'phone' },
                { data: 'last_visit' },
                {
                    data: null,
                    render: function (data, type, row) {
                        var paidHtml = `
                        <td class="text-end">${data.paid}</td>
                    `;
                        return paidHtml;
                    }

                }
            ],
            paging: true,
            searching: false,
            order: []
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
