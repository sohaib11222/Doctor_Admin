var jsonDataUrl = '../assets_admin/data/transactions-list.json';


fetch(jsonDataUrl)
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            item.patient_image = `../assets_admin/img/patients/${item.patient_image}`;
        });

        var table = $('#transactions-list_data').DataTable();
        table.destroy();
        $('#transactions-list_data').DataTable({
            data: data,
            columns: [ 
            {
                data: null,
                render: function (data, type, row) {
                    var InvoiceHtml = `
                    <a href="invoice">${data.invoice_number}</a>
        `;
                    return InvoiceHtml;
                }
            },    
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
                { data: 'amount' },
                {
                    data: null,
                    render: function (data, type, row) {
                        var statusHtml = `
                            <span class="badge rounded-pill bg-success inv-badge">${data.status}</span>
                        `;
                        return statusHtml;
                    }
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var actionsHtml = `
                        <div class="actions text-end">
                            <a class="btn btn-sm bg-danger-light" data-bs-toggle="modal"
                                href="#delete_modal">
                                <i class="fe fe-trash"></i> Delete
                            </a>
                        </div>
            `;
                        return actionsHtml;
                    }
                }
            ],
            paging: true,
            searching: false,
            // scrollY: false,
            // scrollX: false,
            order: []
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
