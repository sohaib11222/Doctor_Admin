var jsonDataUrl = '../assets_admin/data/review.json';


fetch(jsonDataUrl)
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
            item.doctor_image = `../assets_admin/img/doctors/${item.doctor_image}`;
            item.patient_image = `../assets_admin/img/patients/${item.patient_image}`;
        });

        var table = $('#review_data').DataTable();
        table.destroy();
        $('#review_data').DataTable({
            data: data,
            columns: [
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
                {
                    data: null,
                    render: function (data, type, row) {
                        var doctorimageHtml = `
              <h2 class="table-avatar">
              <a href="profile" class="avatar avatar-sm me-2"><img class="avatar-img rounded-circle" src="${data.doctor_image}" alt="User image"></a>
              <a href="profile"> ${data.doctor_name} </a>
              </h2>
            `;
                        return doctorimageHtml;
                    }
                },
                
                
                {
                    data: null,
                    render: function (data, type, row) {
                        var ratingsHtml = `
                        <td>
                        <i class="fe fe-star text-warning"></i>
                        <i class="fe fe-star text-warning"></i>
                        <i class="fe fe-star text-warning"></i>
                        <i class="fe fe-star text-warning"></i>
                        <i class="fe fe-star-o text-secondary"></i>
                    </td>
                    `;
                        return ratingsHtml;
                    }
                },
                { data: 'description' },
                {
                    data: null,
                    render: function (data, type, row) {
                        var dateHtml = `
                        <td>${data.date}  <br><small>${data.time} </small></td>
                    `;
                        return dateHtml;
                    }

                },
                {
                    data: null,
                    render: function (data, type, row) {
                        var actionHtml = `
                        <td class="text-end">
                        <div class="actions">
                            <a class="btn btn-sm bg-danger-light" data-bs-toggle="modal"
                                href="#delete_modal">
                                <i class="fe fe-trash"></i> Delete
                            </a>

                        </div>
                    </td>
                    `;
                        return actionHtml;
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
