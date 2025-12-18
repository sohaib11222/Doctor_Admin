var jsonDataUrl = '../assets_admin/data/specialities.json';


fetch(jsonDataUrl)
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            item.specialities_image = `../assets_admin/img/specialities/${item.specialities_image}`;
        });

        var table = $('#specialities_data').DataTable();
        table.destroy();
        $('#specialities_data').DataTable({
            data: data,
            columns: [
                { data: '#' },
                {
                    data: null,
                    render: function (data, type, row) {
                        var specialitiesHtml = `
                        <h2 class="table-avatar">
                        <a href="profile" class="avatar avatar-sm me-2">
                            <img class="avatar-img rounded-circle"
                                src="${data.specialities_image}"
                                alt="Speciality">
                        </a>
                        <a href="profile">${data.specialities}</a>
                    </h2>
                    `;
                        return specialitiesHtml;
                    }
                },                         
                {
                    data: null,
                    render: function (data, type, row) {
                        var actionHtml = `
                        
                            <div class="actions">
                            <a class="btn btn-sm bg-success-light" data-bs-toggle="modal"
                                href="#edit_specialities_details">
                                <i class="fe fe-pencil"></i> Edit
                            </a>
                            <a data-bs-toggle="modal" href="#delete_modal"
                                class="btn btn-sm bg-danger-light">
                                <i class="fe fe-trash"></i> Delete
                            </a>
                            </div>
                       
                    `;
                        return actionHtml;
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
